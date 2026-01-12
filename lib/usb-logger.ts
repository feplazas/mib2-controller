/**
 * USB Logger Service - Sistema de logging centralizado para operaciones USB
 */

export type LogLevel = 'info' | 'warning' | 'error' | 'success';

export interface UsbLogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  operation: string;
  message: string;
  details?: any;
}

type LogListener = (logs: UsbLogEntry[]) => void;

class UsbLogger {
  private logs: UsbLogEntry[] = [];
  private maxLogs = 500; // Mantener últimos 500 logs en memoria
  private listeners: Set<LogListener> = new Set();

  /**
   * Agregar log
   */
  log(level: LogLevel, operation: string, message: string, details?: any) {
    const entry: UsbLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      operation,
      message,
      details,
    };

    this.logs.push(entry);

    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Notificar a listeners
    this.notifyListeners();

    // También log a console para debugging
    const prefix = `[UsbLogger][${operation}]`;
    switch (level) {
      case 'info':
        console.log(prefix, message, details || '');
        break;
      case 'warning':
        console.warn(prefix, message, details || '');
        break;
      case 'error':
        console.error(prefix, message, details || '');
        break;
      case 'success':
        console.log(`✅ ${prefix}`, message, details || '');
        break;
    }
  }

  /**
   * Métodos de conveniencia
   */
  info(operation: string, message: string, details?: any) {
    this.log('info', operation, message, details);
  }

  warning(operation: string, message: string, details?: any) {
    this.log('warning', operation, message, details);
  }

  error(operation: string, message: string, details?: any) {
    this.log('error', operation, message, details);
  }

  success(operation: string, message: string, details?: any) {
    this.log('success', operation, message, details);
  }

  /**
   * Obtener todos los logs
   */
  getLogs(): UsbLogEntry[] {
    return [...this.logs];
  }

  /**
   * Limpiar logs
   */
  clear() {
    this.logs = [];
    this.notifyListeners();
  }

  /**
   * Suscribirse a cambios en logs
   */
  subscribe(listener: LogListener) {
    this.listeners.add(listener);
    // Enviar logs actuales inmediatamente
    listener(this.getLogs());
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notificar a todos los listeners
   */
  private notifyListeners() {
    const currentLogs = this.getLogs();
    this.listeners.forEach(listener => listener(currentLogs));
  }

  /**
   * Exportar logs como texto
   */
  exportAsText(): string {
    return this.logs.map(log => {
      const date = new Date(log.timestamp).toLocaleString('es-ES');
      const details = log.details ? `\n  Details: ${JSON.stringify(log.details, null, 2)}` : '';
      return `[${date}] [${log.level.toUpperCase()}] [${log.operation}] ${log.message}${details}`;
    }).join('\n\n');
  }
}

// Singleton instance
export const usbLogger = new UsbLogger();
