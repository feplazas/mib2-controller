/**
 * Gestión de Historial de Operaciones
 * Registra todas las operaciones de spoofing y recuperación
 */

export interface OperationRecord {
  operationType: 'spoofing' | 'recovery' | 'restore';
  deviceVid: string;
  devicePid: string;
  deviceChipset?: string;
  result: 'success' | 'failed';
  dryRun?: boolean;
  executionTimeMs?: number;
  errorMessage?: string;
  backupId?: string;
  metadata?: Record<string, any>;
}

export interface OperationStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  dryRunOperations: number;
  averageExecutionTime: number;
  operationsByType: {
    spoofing: number;
    recovery: number;
    restore: number;
  };
}

/**
 * Gestor de Historial de Operaciones
 */
export class OperationHistoryManager {
  /**
   * Registrar una nueva operación
   */
  static async recordOperation(operation: OperationRecord): Promise<boolean> {
    try {
      const response = await fetch('/api/operations/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operation),
      });

      if (!response.ok) {
        console.error('[OperationHistory] Failed to record operation:', response.statusText);
        return false;
      }

      console.log(`[OperationHistory] Operation recorded: ${operation.operationType} - ${operation.result}`);
      return true;
    } catch (error) {
      console.error('[OperationHistory] Error recording operation:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de operaciones
   */
  static async getStatistics(): Promise<OperationStats | null> {
    try {
      const response = await fetch('/api/operations/stats');

      if (!response.ok) {
        console.error('[OperationHistory] Failed to fetch statistics:', response.statusText);
        return null;
      }

      const stats = await response.json();
      return stats;
    } catch (error) {
      console.error('[OperationHistory] Error fetching statistics:', error);
      return null;
    }
  }

  /**
   * Obtener historial reciente
   */
  static async getRecentOperations(limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`/api/operations/recent?limit=${limit}`);

      if (!response.ok) {
        console.error('[OperationHistory] Failed to fetch recent operations:', response.statusText);
        return [];
      }

      const operations = await response.json();
      return operations;
    } catch (error) {
      console.error('[OperationHistory] Error fetching recent operations:', error);
      return [];
    }
  }

  /**
   * Obtener historial filtrado por tipo
   */
  static async getOperationsByType(type: 'spoofing' | 'recovery' | 'restore', limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(`/api/operations/by-type?type=${type}&limit=${limit}`);

      if (!response.ok) {
        console.error('[OperationHistory] Failed to fetch operations by type:', response.statusText);
        return [];
      }

      const operations = await response.json();
      return operations;
    } catch (error) {
      console.error('[OperationHistory] Error fetching operations by type:', error);
      return [];
    }
  }

  /**
   * Obtener historial por dispositivo
   */
  static async getOperationsByDevice(vid: string, pid: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/operations/by-device?vid=${vid}&pid=${pid}`);

      if (!response.ok) {
        console.error('[OperationHistory] Failed to fetch operations by device:', response.statusText);
        return [];
      }

      const operations = await response.json();
      return operations;
    } catch (error) {
      console.error('[OperationHistory] Error fetching operations by device:', error);
      return [];
    }
  }

  /**
   * Limpiar historial antiguo (mantener solo últimos N días)
   */
  static async cleanOldHistory(daysToKeep: number = 30): Promise<number> {
    try {
      const response = await fetch('/api/operations/clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daysToKeep }),
      });

      if (!response.ok) {
        console.error('[OperationHistory] Failed to clean old history:', response.statusText);
        return 0;
      }

      const result = await response.json();
      return result.deletedCount || 0;
    } catch (error) {
      console.error('[OperationHistory] Error cleaning old history:', error);
      return 0;
    }
  }
}
