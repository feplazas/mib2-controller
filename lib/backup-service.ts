import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { usbService } from './usb-service';
import type { UsbDevice } from './usb-service';
import CryptoJS from 'crypto-js';
import { encryptionService } from './encryption-service';
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
  data: string; // Hex string of complete EEPROM dump (256 bytes) - CIFRADO con AES-256
  size: number;
  checksum: string; // MD5 hash of data for integrity verification
  notes?: string;
  filepath?: string; // Ruta del archivo de backup en FileSystem
  encrypted: boolean; // Indica si el backup está cifrado
}

/**
 * Backup Service - Gestión de backups de EEPROM
 */
class BackupService {
  /**
   * Crear backup de EEPROM del dispositivo actual
   */
  async createBackup(device: UsbDevice, notes?: string): Promise<EEPROMBackup> {
    try {
      console.log('[BackupService] Creating EEPROM backup...');
      
      // Volcar EEPROM completa (256 bytes)
      const dump = await usbService.dumpEEPROM();
      
      // Calcular checksum MD5 de los datos
      const checksum = CryptoJS.MD5(dump.data).toString();
      
      // Cifrar datos de EEPROM con AES-256
      const encryptedData = await encryptionService.encrypt(dump.data);
      
      // Crear objeto de backup
      const backup: EEPROMBackup = {
        id: `backup_${Date.now()}_${device.vendorId}_${device.productId}`,
        timestamp: Date.now(),
        deviceName: device.deviceName,
        vendorId: device.vendorId,
        productId: device.productId,
        chipset: device.chipset || 'Unknown',
        serialNumber: device.serialNumber || 'N/A',
        data: encryptedData, // Datos cifrados
        size: dump.size,
        checksum,
        notes: notes || 'auto_backup_before_spoofing',
        encrypted: true,
      };
      
      // Guardar backup
      await this.saveBackup(backup);
      
      console.log(`[BackupService] Backup created successfully: ${backup.id}`);
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
      const bytes = backup.data.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16));
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
   * Restaurar EEPROM desde backup
   */
  async restoreBackup(backupId: string): Promise<{ success: boolean; bytesWritten: number }> {
    try {
      console.log(`[BackupService] Restoring backup: ${backupId}`);
      
      // Cargar backup
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('backup_not_found');
      }
      
      // Descifrar datos si están cifrados
      let decryptedData = backup.data;
      if (backup.encrypted) {
        console.log('[BackupService] Decrypting backup data...');
        decryptedData = await encryptionService.decrypt(backup.data);
      }
      
      // Validar tamaño de datos
      if (backup.size !== 256) {
        throw new Error(`invalid_backup_size: ${backup.size}`);
      }
      
      // Validar formato hexadecimal
      if (!/^[0-9A-Fa-f]+$/.test(decryptedData)) {
        throw new Error('invalid_data_format');
      }
      
      // Validar integridad con checksum MD5 (de datos descifrados)
      const calculatedChecksum = CryptoJS.MD5(decryptedData).toString();
      if (backup.checksum && calculatedChecksum !== backup.checksum) {
        throw new Error(`checksum_invalid: expected=${backup.checksum}, calculated=${calculatedChecksum}`);
      }
      console.log(`[BackupService] Checksum validated: ${calculatedChecksum}`);
      
      // Restaurar byte por byte en offsets críticos (0x88-0x8B para VID/PID)
      let bytesWritten = 0;
      
      // Escribir VID (offsets 0x88-0x89)
      const vidLow = decryptedData.substring(0x88 * 2, 0x88 * 2 + 2);
      const vidHigh = decryptedData.substring(0x89 * 2, 0x89 * 2 + 2);
      await usbService.writeEEPROM(0x88, vidLow);
      await new Promise(resolve => setTimeout(resolve, 100));
      await usbService.writeEEPROM(0x89, vidHigh);
      await new Promise(resolve => setTimeout(resolve, 100));
      bytesWritten += 2;
      
      // Escribir PID (offsets 0x8A-0x8B)
      const pidLow = decryptedData.substring(0x8A * 2, 0x8A * 2 + 2);
      const pidHigh = decryptedData.substring(0x8B * 2, 0x8B * 2 + 2);
      await usbService.writeEEPROM(0x8A, pidLow);
      await new Promise(resolve => setTimeout(resolve, 100));
      await usbService.writeEEPROM(0x8B, pidHigh);
      await new Promise(resolve => setTimeout(resolve, 100));
      bytesWritten += 2;
      
      console.log(`[BackupService] Backup restored successfully: ${bytesWritten} bytes written`);
      console.log(`[BackupService] Checksum verified: ${backup.checksum}`);
      return { success: true, bytesWritten };
    } catch (error) {
      console.error('[BackupService] Error restoring backup:', error);
      throw new Error(`backup_restore_failed: ${error}`);
    }
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
