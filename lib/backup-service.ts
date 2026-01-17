import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { usbService } from './usb-service';
import type { UsbDevice } from './usb-service';
import CryptoJS from 'crypto-js';
import { usbLogger } from './usb-logger';

const BACKUP_STORAGE_KEY = '@mib2_eeprom_backups';
// Use SAF (Storage Access Framework) directory for Android - accessible from file manager
// On Android, this maps to /storage/emulated/0/Android/data/[package]/files/Download/mib2_backups/
const BACKUP_DIR = `${FileSystem.documentDirectory}Download/mib2_backups/`;

export interface EEPROMBackup {
  id: string;
  timestamp: number;
  deviceName: string;
  vendorId: number;
  productId: number;
  chipset: string;
  serialNumber: string;
  data: string; // Hex string of complete EEPROM dump (256 bytes) - SIN CIFRAR
  size: number;
  checksum: string; // MD5 hash of data for integrity verification
  notes?: string;
  filepath?: string; // Ruta del archivo de backup en FileSystem
  encrypted: boolean; // Siempre false - sin cifrado
}

/**
 * Backup Service - Gestión de backups de EEPROM
 * 
 * ADVERTENCIA CRÍTICA:
 * La restauración completa de EEPROM está DESHABILITADA debido a bugs de offset.
 * Solo se permite restaurar VID/PID usando la función spoofVIDPID que está probada.
 * 
 * NOTA: Los backups se guardan SIN cifrado porque:
 * 1. Los datos de EEPROM (VID/PID/MAC) no son sensibles
 * 2. CryptoJS.lib.WordArray.random() no funciona en React Native
 * 3. expo-secure-store tiene bugs en ciertos dispositivos Android
 * 4. La simplicidad garantiza funcionamiento en TODOS los dispositivos
 */
class BackupService {
  /**
   * Crear backup de EEPROM del dispositivo actual
   */
  async createBackup(device: UsbDevice, notes?: string): Promise<EEPROMBackup> {
    try {
      console.log('[BackupService] Creating EEPROM backup...');
      usbLogger.info('BACKUP', 'Creando backup de EEPROM...');
      
      // Volcar EEPROM completa (256 bytes)
      const dump = await usbService.dumpEEPROM();
      
      // Calcular checksum MD5 de los datos
      const checksum = CryptoJS.MD5(dump.data).toString();
      
      // Crear objeto de backup - SIN CIFRAR
      const backup: EEPROMBackup = {
        id: `backup_${Date.now()}_${device.vendorId}_${device.productId}`,
        timestamp: Date.now(),
        deviceName: device.deviceName,
        vendorId: device.vendorId,
        productId: device.productId,
        chipset: device.chipset || 'Unknown',
        serialNumber: device.serialNumber || 'N/A',
        data: dump.data, // Datos SIN cifrar (hex string)
        size: dump.size,
        checksum,
        notes: notes || 'auto_backup_before_spoofing',
        encrypted: false, // Sin cifrado
      };
      
      // Guardar backup
      await this.saveBackup(backup);
      
      console.log(`[BackupService] Backup created successfully: ${backup.id}`);
      usbLogger.success('BACKUP', `Backup creado: ${backup.id} (${dump.size} bytes)`);
      return backup;
    } catch (error) {
      console.error('[BackupService] Error creating backup:', error);
      usbLogger.error('BACKUP', `Error al crear backup: ${error}`, error);
      throw new Error(`backup_creation_failed: ${error}`);
    }
  }

  /**
   * Guardar backup en FileSystem accesible y AsyncStorage
   */
  private async saveBackup(backup: EEPROMBackup): Promise<void> {
    try {
      // Crear directorio de backups si no existe
      const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
        console.log(`[BackupService] Created backup directory: ${BACKUP_DIR}`);
      }
      
      // Guardar archivo binario en FileSystem
      const filename = `backup_${backup.vendorId.toString(16)}_${backup.productId.toString(16)}_${backup.timestamp}.bin`;
      const filepath = `${BACKUP_DIR}${filename}`;
      
      // Convertir hex string a base64 para FileSystem
      const hexData = backup.data;
      const bytes: number[] = [];
      for (let i = 0; i < hexData.length; i += 2) {
        bytes.push(parseInt(hexData.substring(i, i + 2), 16));
      }
      const base64 = btoa(String.fromCharCode(...bytes));
      await FileSystem.writeAsStringAsync(filepath, base64, { encoding: FileSystem.EncodingType.Base64 });
      
      console.log(`[BackupService] Backup file saved: ${filepath}`);
      
      // Guardar metadata en AsyncStorage
      const backups = await this.loadBackups();
      backups.push({ ...backup, filepath }); // Agregar ruta del archivo
      await AsyncStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
      
      console.log(`[BackupService] Backup metadata saved: ${backup.id}`);
    } catch (error) {
      console.error('[BackupService] Error saving backup:', error);
      throw error;
    }
  }

  /**
   * Cargar todos los backups guardados
   */
  async loadBackups(): Promise<EEPROMBackup[]> {
    try {
      const data = await AsyncStorage.getItem(BACKUP_STORAGE_KEY);
      if (!data) {
        return [];
      }
      
      const backups: EEPROMBackup[] = JSON.parse(data);
      
      // Ordenar por timestamp descendente (más reciente primero)
      backups.sort((a, b) => b.timestamp - a.timestamp);
      
      console.log(`[BackupService] Loaded ${backups.length} backups`);
      return backups;
    } catch (error) {
      console.error('[BackupService] Error loading backups:', error);
      return [];
    }
  }

  /**
   * Obtener backup por ID
   */
  async getBackup(id: string): Promise<EEPROMBackup | null> {
    try {
      const backups = await this.loadBackups();
      return backups.find(b => b.id === id) || null;
    } catch (error) {
      console.error('[BackupService] Error getting backup:', error);
      return null;
    }
  }

  /**
   * Eliminar backup por ID
   */
  async deleteBackup(id: string): Promise<boolean> {
    try {
      const backups = await this.loadBackups();
      const filtered = backups.filter(b => b.id !== id);
      
      if (filtered.length === backups.length) {
        console.warn(`[BackupService] Backup not found: ${id}`);
        return false;
      }
      
      await AsyncStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(filtered));
      console.log(`[BackupService] Backup deleted: ${id}`);
      return true;
    } catch (error) {
      console.error('[BackupService] Error deleting backup:', error);
      return false;
    }
  }

  /**
   * Extraer VID/PID del backup
   * Los offsets en ASIX son:
   * - VID: bytes 0x88-0x89 (word offset 0x44)
   * - PID: bytes 0x8A-0x8B (word offset 0x45)
   * 
   * El dump se guarda en formato big-endian desde el módulo nativo
   */
  extractVidPidFromBackup(backup: EEPROMBackup): { vid: number; pid: number } {
    const hexData = backup.data;
    
    // Offset 0x88 = byte 136, en hex string es posición 136*2 = 272
    const vidOffset = 0x88 * 2; // 272
    const pidOffset = 0x8A * 2; // 276
    
    // Leer 2 bytes para VID (little-endian en EEPROM)
    const vidLowHex = hexData.substring(vidOffset, vidOffset + 2);
    const vidHighHex = hexData.substring(vidOffset + 2, vidOffset + 4);
    const vid = parseInt(vidHighHex + vidLowHex, 16);
    
    // Leer 2 bytes para PID (little-endian en EEPROM)
    const pidLowHex = hexData.substring(pidOffset, pidOffset + 2);
    const pidHighHex = hexData.substring(pidOffset + 2, pidOffset + 4);
    const pid = parseInt(pidHighHex + pidLowHex, 16);
    
    console.log(`[BackupService] Extracted VID:PID from backup: ${vid.toString(16).toUpperCase()}:${pid.toString(16).toUpperCase()}`);
    
    return { vid, pid };
  }

  /**
   * Restaurar SOLO VID/PID desde backup
   * 
   * ADVERTENCIA: La restauración completa de EEPROM está DESHABILITADA
   * debido a bugs críticos de offset que causaron bricking de adaptadores.
   * 
   * Esta función SOLO restaura VID/PID usando spoofVIDPID que está probada.
   */
  async restoreVidPidFromBackup(backupId: string): Promise<{ success: boolean; vid: number; pid: number }> {
    try {
      console.log(`[BackupService] Restoring VID/PID from backup: ${backupId}`);
      usbLogger.info('RESTORE', `Restaurando VID/PID desde backup: ${backupId}`);
      
      // Cargar backup
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('backup_not_found');
      }
      
      // Validar tamaño de datos
      if (backup.size !== 256) {
        throw new Error(`invalid_backup_size: ${backup.size}`);
      }
      
      // Validar formato hexadecimal
      if (!/^[0-9A-Fa-f]+$/.test(backup.data)) {
        throw new Error('invalid_data_format');
      }
      
      // Validar integridad con checksum MD5
      const calculatedChecksum = CryptoJS.MD5(backup.data).toString();
      if (backup.checksum && calculatedChecksum !== backup.checksum) {
        throw new Error(`checksum_invalid: expected=${backup.checksum}, calculated=${calculatedChecksum}`);
      }
      console.log(`[BackupService] Checksum validated: ${calculatedChecksum}`);
      usbLogger.info('RESTORE', `Checksum validado: ${calculatedChecksum.substring(0, 8)}...`);
      
      // Extraer VID/PID del backup
      const { vid, pid } = this.extractVidPidFromBackup(backup);
      
      usbLogger.info('RESTORE', `VID/PID a restaurar: ${vid.toString(16).toUpperCase()}:${pid.toString(16).toUpperCase()}`);
      
      // Usar spoofVIDPID que está PROBADA y funciona correctamente
      const result = await usbService.spoofVIDPID(vid, pid);
      
      if (result.success) {
        usbLogger.success('RESTORE', `VID/PID restaurado: ${result.newVID.toString(16).toUpperCase()}:${result.newPID.toString(16).toUpperCase()}`);
        return { success: true, vid: result.newVID, pid: result.newPID };
      } else {
        throw new Error('spoof_failed');
      }
    } catch (error) {
      console.error('[BackupService] Error restoring VID/PID:', error);
      usbLogger.error('RESTORE', `Error al restaurar VID/PID: ${error}`, error);
      throw new Error(`vidpid_restore_failed: ${error}`);
    }
  }

  /**
   * DESHABILITADO - Restaurar EEPROM completa desde backup
   * 
   * ADVERTENCIA CRÍTICA: Esta función está DESHABILITADA permanentemente
   * debido a bugs de offset que causaron bricking de adaptadores.
   * 
   * El bug: El código pasaba wordOffset al módulo nativo, pero el módulo
   * ya dividía internamente por 2, causando escrituras en posiciones incorrectas.
   * 
   * Use restoreVidPidFromBackup() en su lugar.
   */
  async restoreBackup(_backupId: string): Promise<{ success: boolean; bytesWritten: number }> {
    const errorMsg = 'FUNCIÓN DESHABILITADA: La restauración completa de EEPROM está deshabilitada ' +
      'debido a bugs críticos que causaron bricking de adaptadores. ' +
      'Use "Restaurar VID/PID" en su lugar, que solo restaura los valores de identificación ' +
      'usando una función probada y segura.';
    
    console.error(`[BackupService] ${errorMsg}`);
    usbLogger.error('RESTORE', errorMsg);
    
    throw new Error(errorMsg);
  }

  /**
   * Exportar backup como JSON string
   */
  async exportBackup(backupId: string): Promise<string> {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('backup_not_found');
      }
      
      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('[BackupService] Error exporting backup:', error);
      throw error;
    }
  }

  /**
   * Compartir backup como archivo
   */
  async shareBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('backup_not_found');
      }
      
      // Verificar si el archivo existe
      if (backup.filepath) {
        const fileInfo = await FileSystem.getInfoAsync(backup.filepath);
        if (fileInfo.exists) {
          // Compartir archivo binario existente
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(backup.filepath, {
              mimeType: 'application/octet-stream',
              dialogTitle: `Backup EEPROM - ${backup.chipset}`,
            });
            usbLogger.success('EXPORT', `Backup compartido: ${backup.id}`);
            return true;
          }
        }
      }
      
      // Si no hay archivo, crear uno temporal con el JSON
      const tempPath = `${FileSystem.cacheDirectory}backup_${backup.id}.json`;
      await FileSystem.writeAsStringAsync(tempPath, JSON.stringify(backup, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempPath, {
          mimeType: 'application/json',
          dialogTitle: `Backup EEPROM - ${backup.chipset}`,
        });
        usbLogger.success('EXPORT', `Backup compartido como JSON: ${backup.id}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[BackupService] Error sharing backup:', error);
      throw error;
    }
  }

  /**
   * Importar backup desde JSON string
   */
  async importBackup(jsonString: string): Promise<EEPROMBackup> {
    try {
      const backup: EEPROMBackup = JSON.parse(jsonString);
      
      // Validar estructura
      if (!backup.id || !backup.data || !backup.size) {
        throw new Error('invalid_backup_format');
      }
      
      // Guardar backup importado
      await this.saveBackup(backup);
      
      console.log(`[BackupService] Backup imported: ${backup.id}`);
      return backup;
    } catch (error) {
      console.error('[BackupService] Error importing backup:', error);
      throw new Error(`backup_import_failed: ${error}`);
    }
  }

  /**
   * Limpiar todos los backups
   */
  async clearAllBackups(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(BACKUP_STORAGE_KEY);
      console.log('[BackupService] All backups cleared');
      return true;
    } catch (error) {
      console.error('[BackupService] Error clearing backups:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de backups
   */
  async getStats(): Promise<{ total: number; totalSize: number; oldestDate: number | null; newestDate: number | null }> {
    try {
      const backups = await this.loadBackups();
      
      if (backups.length === 0) {
        return { total: 0, totalSize: 0, oldestDate: null, newestDate: null };
      }
      
      const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
      const timestamps = backups.map(b => b.timestamp);
      
      return {
        total: backups.length,
        totalSize,
        oldestDate: Math.min(...timestamps),
        newestDate: Math.max(...timestamps),
      };
    } catch (error) {
      console.error('[BackupService] Error getting stats:', error);
      return { total: 0, totalSize: 0, oldestDate: null, newestDate: null };
    }
  }
}

export const backupService = new BackupService();
