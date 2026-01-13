/**
 * Sistema de Cola de Comandos Offline
 * Permite encolar comandos cuando no hay conexión y ejecutarlos automáticamente al reconectar
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedCommand {
  id: string;
  command: string;
  description: string;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
  retries: number;
  maxRetries: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  error?: string;
}

const QUEUE_STORAGE_KEY = '@mib2_command_queue';
const MAX_QUEUE_SIZE = 100;

export class CommandQueue {
  private static queue: QueuedCommand[] = [];
  private static listeners: ((queue: QueuedCommand[]) => void)[] = [];
  private static isExecuting = false;

  /**
   * Inicializar la cola desde AsyncStorage
   */
  static async initialize(): Promise<void> {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (queueJson) {
        this.queue = JSON.parse(queueJson);
        console.log(`[CommandQueue] Loaded ${this.queue.length} commands from storage`);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('[CommandQueue] Failed to load queue:', error);
    }
  }

  /**
   * Agregar comando a la cola
   */
  static async enqueue(
    command: string,
    description: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      if (this.queue.length >= MAX_QUEUE_SIZE) {
        return {
          success: false,
          error: `Queue is full (max ${MAX_QUEUE_SIZE} commands)`,
        };
      }

      const queuedCommand: QueuedCommand = {
        id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        command,
        description,
        timestamp: Date.now(),
        priority,
        retries: 0,
        maxRetries: 3,
        status: 'pending',
      };

      // Insertar según prioridad
      if (priority === 'high') {
        this.queue.unshift(queuedCommand);
      } else {
        this.queue.push(queuedCommand);
      }

      await this.saveQueue();
      this.notifyListeners();

      console.log(`[CommandQueue] Enqueued command: ${description}`);

      return {
        success: true,
        id: queuedCommand.id,
      };
    } catch (error) {
      console.error('[CommandQueue] Failed to enqueue command:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Obtener todos los comandos en cola
   */
  static getQueue(): QueuedCommand[] {
    return [...this.queue];
  }

  /**
   * Obtener comandos pendientes
   */
  static getPendingCommands(): QueuedCommand[] {
    return this.queue.filter((cmd) => cmd.status === 'pending');
  }

  /**
   * Obtener comando por ID
   */
  static getCommand(id: string): QueuedCommand | undefined {
    return this.queue.find((cmd) => cmd.id === id);
  }

  /**
   * Eliminar comando de la cola
   */
  static async removeCommand(id: string): Promise<boolean> {
    try {
      const index = this.queue.findIndex((cmd) => cmd.id === id);
      if (index === -1) {
        return false;
      }

      this.queue.splice(index, 1);
      await this.saveQueue();
      this.notifyListeners();

      console.log(`[CommandQueue] Removed command: ${id}`);
      return true;
    } catch (error) {
      console.error('[CommandQueue] Failed to remove command:', error);
      return false;
    }
  }

  /**
   * Limpiar comandos completados
   */
  static async clearCompleted(): Promise<number> {
    try {
      const beforeCount = this.queue.length;
      this.queue = this.queue.filter((cmd) => cmd.status !== 'completed');
      const removedCount = beforeCount - this.queue.length;

      if (removedCount > 0) {
        await this.saveQueue();
        this.notifyListeners();
        console.log(`[CommandQueue] Cleared ${removedCount} completed commands`);
      }

      return removedCount;
    } catch (error) {
      console.error('[CommandQueue] Failed to clear completed:', error);
      return 0;
    }
  }

  /**
   * Limpiar toda la cola
   */
  static async clearAll(): Promise<void> {
    try {
      this.queue = [];
      await this.saveQueue();
      this.notifyListeners();
      console.log('[CommandQueue] Cleared all commands');
    } catch (error) {
      console.error('[CommandQueue] Failed to clear queue:', error);
    }
  }

  /**
   * Ejecutar cola de comandos
   */
  static async executeQueue(
    executor: (command: string) => Promise<{ success: boolean; output?: string; error?: string }>
  ): Promise<{ executed: number; failed: number }> {
    if (this.isExecuting) {
      console.log('[CommandQueue] Already executing queue');
      return { executed: 0, failed: 0 };
    }

    this.isExecuting = true;
    let executed = 0;
    let failed = 0;

    try {
      const pendingCommands = this.getPendingCommands();
      console.log(`[CommandQueue] Executing ${pendingCommands.length} pending commands`);

      for (const cmd of pendingCommands) {
        try {
          // Actualizar estado
          cmd.status = 'executing';
          await this.saveQueue();
          this.notifyListeners();

          // Ejecutar comando
          const result = await executor(cmd.command);

          if (result.success) {
            cmd.status = 'completed';
            executed++;
            console.log(`[CommandQueue] Executed: ${cmd.description}`);
          } else {
            cmd.retries++;
            if (cmd.retries >= cmd.maxRetries) {
              cmd.status = 'failed';
              cmd.error = result.error || 'Max retries exceeded';
              failed++;
              console.error(`[CommandQueue] Failed: ${cmd.description} - ${cmd.error}`);
            } else {
              cmd.status = 'pending';
              console.warn(`[CommandQueue] Retry ${cmd.retries}/${cmd.maxRetries}: ${cmd.description}`);
            }
          }

          await this.saveQueue();
          this.notifyListeners();

          // Pequeña pausa entre comandos
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          cmd.retries++;
          if (cmd.retries >= cmd.maxRetries) {
            cmd.status = 'failed';
            cmd.error = error instanceof Error ? error.message : String(error);
            failed++;
          } else {
            cmd.status = 'pending';
          }

          await this.saveQueue();
          this.notifyListeners();
        }
      }

      console.log(`[CommandQueue] Execution complete: ${executed} executed, ${failed} failed`);
    } finally {
      this.isExecuting = false;
    }

    return { executed, failed };
  }

  /**
   * Verificar si hay comandos pendientes
   */
  static hasPendingCommands(): boolean {
    return this.queue.some((cmd) => cmd.status === 'pending');
  }

  /**
   * Obtener estadísticas de la cola
   */
  static getStats(): {
    total: number;
    pending: number;
    executing: number;
    completed: number;
    failed: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter((cmd) => cmd.status === 'pending').length,
      executing: this.queue.filter((cmd) => cmd.status === 'executing').length,
      completed: this.queue.filter((cmd) => cmd.status === 'completed').length,
      failed: this.queue.filter((cmd) => cmd.status === 'failed').length,
    };
  }

  /**
   * Suscribirse a cambios en la cola
   */
  static subscribe(listener: (queue: QueuedCommand[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Guardar cola en AsyncStorage
   */
  private static async saveQueue(): Promise<void> {
    try {
      const queueJson = JSON.stringify(this.queue);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, queueJson);
    } catch (error) {
      console.error('[CommandQueue] Failed to save queue:', error);
    }
  }

  /**
   * Notificar a los listeners
   */
  private static notifyListeners(): void {
    const queueCopy = [...this.queue];
    this.listeners.forEach((listener) => {
      try {
        listener(queueCopy);
      } catch (error) {
        console.error('[CommandQueue] Listener error:', error);
      }
    });
  }
}
