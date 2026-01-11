/**
 * Gestión de Backups de EEPROM
 * Permite crear, restaurar y gestionar backups de memoria EEPROM
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { usbService } from './usb-service';
import type { EepromAnalysis } from './eeprom-analyzer';

export interface EepromBackup {
  id: string;
  timestamp: number;
  deviceInfo: {
    vid: number;
    pid: number;
    chipset: string;
    size: number;
  };
  data: number[];
  checksum: string;
  metadata: {
    appVersion: string;
    notes?: string;
  };
}

export interface BackupMetadata {
  id: string;
  timestamp: number;
  deviceName: string;
  size: number;
  checksum: string;
}

/**
 * Gestor de Backups de EEPROM
 */
export class EepromBackupManager {
  private static readonly BACKUP_DIR = `${FileSystem.documentDirectory!}eeprom_backups/`;

  /**
   * Inicializar directorio de backups
   */
  static async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.BACKUP_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.BACKUP_DIR, { intermediates: true });
        console.log('[EepromBackup] Backup directory created');
      }
    } catch (error) {
      console.error('[EepromBackup] Failed to initialize backup directory:', error);
      throw new Error('Failed to initialize backup system');
    }
  }

  /**
   * Crear backup completo de EEPROM
   */
  static async createBackup(analysis: EepromAnalysis, notes?: string): Promise<string> {
    try {
      await this.initialize();

      const backupId = `backup_${Date.now()}_${analysis.currentVid.toString(16)}_${analysis.currentPid.toString(16)}`;
      
      const backup: EepromBackup = {
        id: backupId,
        timestamp: Date.now(),
        deviceInfo: {
          vid: analysis.currentVid,
          pid: analysis.currentPid,
          chipset: analysis.chipsetVersion,
          size: analysis.size,
        },
        data: analysis.rawData,
        checksum: this.calculateChecksum(analysis.rawData),
        metadata: {
          appVersion: '3.1.0',
          notes,
        },
      };

      const filePath = `${this.BACKUP_DIR}${backupId}.json`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backup, null, 2));

      console.log(`[EepromBackup] Backup created: ${backupId}`);
      return backupId;
    } catch (error) {
      console.error('[EepromBackup] Failed to create backup:', error);
      throw new Error('Failed to create EEPROM backup');
    }
  }

  /**
   * Listar todos los backups disponibles
   */
  static async listBackups(): Promise<BackupMetadata[]> {
    try {
      await this.initialize();

      const files = await FileSystem.readDirectoryAsync(this.BACKUP_DIR);
      const backups: BackupMetadata[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = `${this.BACKUP_DIR}${file}`;
            const content = await FileSystem.readAsStringAsync(filePath);
            const backup: EepromBackup = JSON.parse(content);

            backups.push({
              id: backup.id,
              timestamp: backup.timestamp,
              deviceName: `${backup.deviceInfo.chipset} (VID:0x${backup.deviceInfo.vid.toString(16)} PID:0x${backup.deviceInfo.pid.toString(16)})`,
              size: backup.deviceInfo.size,
              checksum: backup.checksum,
            });
          } catch (error) {
            console.error(`[EepromBackup] Failed to read backup ${file}:`, error);
          }
        }
      }

      // Ordenar por timestamp descendente (más reciente primero)
      backups.sort((a, b) => b.timestamp - a.timestamp);

      return backups;
    } catch (error) {
      console.error('[EepromBackup] Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Cargar un backup específico
   */
  static async loadBackup(backupId: string): Promise<EepromBackup | null> {
    try {
      const filePath = `${this.BACKUP_DIR}${backupId}.json`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (!fileInfo.exists) {
        console.error(`[EepromBackup] Backup not found: ${backupId}`);
        return null;
      }

      const content = await FileSystem.readAsStringAsync(filePath);
      const backup: EepromBackup = JSON.parse(content);

      // Verificar integridad
      const calculatedChecksum = this.calculateChecksum(backup.data);
      if (calculatedChecksum !== backup.checksum) {
        throw new Error('Backup integrity check failed: checksum mismatch');
      }

      console.log(`[EepromBackup] Backup loaded: ${backupId}`);
      return backup;
    } catch (error) {
      console.error('[EepromBackup] Failed to load backup:', error);
      throw new Error('Failed to load backup file');
    }
  }

  /**
   * Restaurar EEPROM desde backup
   */
  static async restoreBackup(
    backupId: string,
    onProgress?: (progress: { step: number; total: number; message: string }) => void
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Cargar backup
      if (onProgress) onProgress({ step: 1, total: 4, message: 'Loading backup file...' });
      const backup = await this.loadBackup(backupId);

      if (!backup) {
        return { success: false, message: 'Backup file not found' };
      }

      // Verificar conexión USB
      if (onProgress) onProgress({ step: 2, total: 4, message: 'Verifying USB connection...' });
      if (!usbService.isConnected()) {
        return { success: false, message: 'No USB device connected' };
      }

      // Escribir datos a EEPROM
      if (onProgress) onProgress({ step: 3, total: 4, message: 'Writing data to EEPROM...' });
      
      const totalBytes = backup.data.length;
      for (let offset = 0; offset < totalBytes; offset++) {
        await usbService.writeEepromByte(offset, backup.data[offset]);
        
        // Reportar progreso cada 16 bytes
        if (offset % 16 === 0 && onProgress) {
          const percentage = Math.round((offset / totalBytes) * 100);
          onProgress({
            step: 3,
            total: 4,
            message: `Writing EEPROM... ${percentage}% (${offset}/${totalBytes} bytes)`,
          });
        }
      }

      // Verificar restauración
      if (onProgress) onProgress({ step: 4, total: 4, message: 'Verifying restore...' });
      const verificationResult = await this.verifyRestore(backup.data);

      if (!verificationResult.success) {
        return {
          success: false,
          message: `Restore verification failed: ${verificationResult.error}`,
        };
      }

      console.log('[EepromBackup] Restore completed successfully');
      return {
        success: true,
        message: 'EEPROM restored successfully from backup. Please reconnect the adapter.',
      };
    } catch (error) {
      console.error('[EepromBackup] Failed to restore backup:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during restore',
      };
    }
  }

  /**
   * Verificar que la restauración fue exitosa
   */
  private static async verifyRestore(expectedData: number[]): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Leer EEPROM completa
      const actualData = await usbService.readEeprom(0, expectedData.length);

      // Comparar byte por byte
      for (let i = 0; i < expectedData.length; i++) {
        if (actualData[i] !== expectedData[i]) {
          return {
            success: false,
            error: `Mismatch at offset 0x${i.toString(16)}: expected 0x${expectedData[i].toString(16)}, got 0x${actualData[i].toString(16)}`,
          };
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Verification read failed: ${error}`,
      };
    }
  }

  /**
   * Eliminar un backup
   */
  static async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const filePath = `${this.BACKUP_DIR}${backupId}.json`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
        console.log(`[EepromBackup] Backup deleted: ${backupId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[EepromBackup] Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Exportar backup como archivo binario
   */
  static async exportBackup(backupId: string): Promise<string | null> {
    try {
      const backup = await this.loadBackup(backupId);
      if (!backup) {
        return null;
      }

      // Crear archivo binario
      const binaryData = new Uint8Array(backup.data);
      const base64Data = this.arrayBufferToBase64(binaryData.buffer);

      const exportPath = `${FileSystem.cacheDirectory}${backupId}.bin`;
      await FileSystem.writeAsStringAsync(exportPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Compartir archivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(exportPath, {
          mimeType: 'application/octet-stream',
          dialogTitle: 'Export EEPROM Backup',
        });
      }

      return exportPath;
    } catch (error) {
      console.error('[EepromBackup] Failed to export backup:', error);
      return null;
    }
  }

  /**
   * Importar backup desde archivo binario
   */
  static async importBackup(fileUri: string, deviceInfo: EepromBackup['deviceInfo']): Promise<string | null> {
    try {
      await this.initialize();

      // Leer archivo binario
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binaryData = this.base64ToArrayBuffer(base64Data);
      const data = Array.from(new Uint8Array(binaryData));

      // Crear backup
      const backupId = `imported_${Date.now()}`;
      const backup: EepromBackup = {
        id: backupId,
        timestamp: Date.now(),
        deviceInfo,
        data,
        checksum: this.calculateChecksum(data),
        metadata: {
          appVersion: '3.1.0',
          notes: 'Imported from external file',
        },
      };

      const filePath = `${this.BACKUP_DIR}${backupId}.json`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backup, null, 2));

      console.log(`[EepromBackup] Backup imported: ${backupId}`);
      return backupId;
    } catch (error) {
      console.error('[EepromBackup] Failed to import backup:', error);
      return null;
    }
  }

  /**
   * Calcular checksum de datos
   */
  private static calculateChecksum(data: number[]): string {
    let sum = 0;
    for (const byte of data) {
      sum = (sum + byte) & 0xFFFF;
    }
    return sum.toString(16).padStart(4, '0');
  }

  /**
   * Convertir ArrayBuffer a Base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convertir Base64 a ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Obtener tamaño total de backups
   */
  static async getTotalBackupSize(): Promise<number> {
    try {
      await this.initialize();
      const files = await FileSystem.readDirectoryAsync(this.BACKUP_DIR);
      let totalSize = 0;

      for (const file of files) {
        const filePath = `${this.BACKUP_DIR}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists && 'size' in fileInfo) {
          totalSize += fileInfo.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('[EepromBackup] Failed to calculate total size:', error);
      return 0;
    }
  }

  /**
   * Limpiar backups antiguos (mantener solo los últimos N)
   */
  static async cleanOldBackups(keepCount: number = 10): Promise<number> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length <= keepCount) {
        return 0;
      }

      const toDelete = backups.slice(keepCount);
      let deletedCount = 0;

      for (const backup of toDelete) {
        const deleted = await this.deleteBackup(backup.id);
        if (deleted) {
          deletedCount++;
        }
      }

      console.log(`[EepromBackup] Cleaned ${deletedCount} old backups`);
      return deletedCount;
    } catch (error) {
      console.error('[EepromBackup] Failed to clean old backups:', error);
      return 0;
    }
  }
}
