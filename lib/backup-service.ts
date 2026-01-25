import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { usbService } from './usb-service';
import { haptics } from './haptics-service';
import type { UsbDevice } from './usb-service';
import CryptoJS from 'crypto-js';
import { usbLogger } from './usb-logger';

const BACKUP_STORAGE_KEY = '@mib2_eeprom_backups';
// Use SAF (Storage Access Framework) directory for Android - accessible from file manager
// On Android, this maps to /storage/emulated/0/Android/data/[package]/files/Download/mib2_backups/
const BACKUP_DIR = `${FileSystem.documentDirectory}Download/mib2_backups/`;

/**
 * Estado de integridad de un backup
 */
export type IntegrityStatus = 'valid' | 'invalid' | 'corrupted' | 'unknown';

/**
 * Resultado de verificación de integridad
 */
export interface IntegrityCheckResult {
  status: IntegrityStatus;
  md5Valid: boolean;
  sha256Valid: boolean;
  sizeValid: boolean;
  formatValid: boolean;
  calculatedMd5: string;
  calculatedSha256: string;
  expectedMd5: string;
  expectedSha256: string;
  details: string;
}

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
  checksumSha256?: string; // SHA256 hash for additional verification (nuevo)
  notes?: string;
  filepath?: string; // Ruta del archivo de backup en FileSystem
  encrypted: boolean; // Siempre false - sin cifrado
  integrityStatus?: IntegrityStatus; // Estado de integridad cacheado
}

/**
 * Backup Service - Gestión de backups de EEPROM
 * 
 * ADVERTENCIA CRÍTICA:
 * La restauración completa de EEPROM está DESHABILITADA debido a bugs de offset.
 * Solo se permite restaurar VID/PID usando writeEEPROM que está probada.
 * 
 * NOTA: La función spoofVIDPID fue ELIMINADA por seguridad.
 * 
 * SISTEMA DE INTEGRIDAD:
 * - Checksum MD5 + SHA256 dual para máxima seguridad
 * - Verificación automática antes de cualquier restauración
 * - Estado de integridad visible en UI
 */
class BackupService {
  /**
   * Calcular checksums MD5 y SHA256 de los datos
   */
  private calculateChecksums(data: string): { md5: string; sha256: string } {
    const md5 = CryptoJS.MD5(data).toString();
    const sha256 = CryptoJS.SHA256(data).toString();
    return { md5, sha256 };
  }

  /**
   * Verificar integridad de un backup
   * Realiza múltiples validaciones:
   * 1. Tamaño de datos (debe ser 256 bytes = 512 caracteres hex)
   * 2. Formato hexadecimal válido
   * 3. Checksum MD5
   * 4. Checksum SHA256 (si está disponible)
   */
  verifyBackupIntegrity(backup: EEPROMBackup): IntegrityCheckResult {
    const result: IntegrityCheckResult = {
      status: 'unknown',
      md5Valid: false,
      sha256Valid: false,
      sizeValid: false,
      formatValid: false,
      calculatedMd5: '',
      calculatedSha256: '',
      expectedMd5: backup.checksum || '',
      expectedSha256: backup.checksumSha256 || '',
      details: '',
    };

    try {
      // 1. Verificar tamaño
      const expectedHexLength = 256 * 2; // 256 bytes = 512 caracteres hex
      result.sizeValid = backup.data.length === expectedHexLength && backup.size === 256;
      
      if (!result.sizeValid) {
        result.status = 'corrupted';
        result.details = `Tamaño inválido: ${backup.data.length} caracteres (esperado: ${expectedHexLength})`;
        return result;
      }

      // 2. Verificar formato hexadecimal
      result.formatValid = /^[0-9A-Fa-f]+$/.test(backup.data);
      
      if (!result.formatValid) {
        result.status = 'corrupted';
        result.details = 'Formato de datos inválido: contiene caracteres no hexadecimales';
        return result;
      }

      // 3. Calcular checksums
      const { md5, sha256 } = this.calculateChecksums(backup.data);
      result.calculatedMd5 = md5;
      result.calculatedSha256 = sha256;

      // 4. Verificar MD5
      if (backup.checksum) {
        result.md5Valid = md5.toLowerCase() === backup.checksum.toLowerCase();
      } else {
        // Si no hay checksum guardado, asumimos válido pero lo marcamos
        result.md5Valid = true;
        result.details = 'Sin checksum MD5 original para comparar';
      }

      // 5. Verificar SHA256 (si está disponible)
      if (backup.checksumSha256) {
        result.sha256Valid = sha256.toLowerCase() === backup.checksumSha256.toLowerCase();
      } else {
        // Si no hay SHA256, solo usamos MD5
        result.sha256Valid = true;
      }

      // 6. Determinar estado final
      if (result.md5Valid && result.sha256Valid && result.sizeValid && result.formatValid) {
        result.status = 'valid';
        result.details = 'Integridad verificada: todos los checksums coinciden';
      } else if (!result.md5Valid || !result.sha256Valid) {
        result.status = 'invalid';
        const failedChecks: string[] = [];
        if (!result.md5Valid) failedChecks.push('MD5');
        if (!result.sha256Valid) failedChecks.push('SHA256');
        result.details = `Checksum inválido: ${failedChecks.join(', ')} no coincide`;
      } else {
        result.status = 'corrupted';
        result.details = 'Datos corruptos: verificación de formato fallida';
      }

      return result;
    } catch (error) {
      result.status = 'corrupted';
      result.details = `Error durante verificación: ${error}`;
      return result;
    }
  }

  /**
   * Verificar integridad de un backup por ID
   */
  async verifyBackupIntegrityById(backupId: string): Promise<IntegrityCheckResult> {
    const backup = await this.getBackup(backupId);
    if (!backup) {
      return {
        status: 'corrupted',
        md5Valid: false,
        sha256Valid: false,
        sizeValid: false,
        formatValid: false,
        calculatedMd5: '',
        calculatedSha256: '',
        expectedMd5: '',
        expectedSha256: '',
        details: 'Backup no encontrado',
      };
    }
    return this.verifyBackupIntegrity(backup);
  }

  /**
   * Crear backup de EEPROM del dispositivo actual
   */
  async createBackup(device: UsbDevice, notes?: string): Promise<EEPROMBackup> {
    try {
      console.log('[BackupService] Creating EEPROM backup...');
      usbLogger.info('BACKUP', 'Creando backup de EEPROM...');
      
      // Iniciar vibración de progreso
      haptics.backup();
      
      // Volcar EEPROM completa (256 bytes)
      const dump = await usbService.dumpEEPROM();
      
      // Calcular checksums MD5 y SHA256 para verificación dual
      const { md5, sha256 } = this.calculateChecksums(dump.data);
      
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
        checksum: md5,
        checksumSha256: sha256, // Nuevo: SHA256 para verificación dual
        notes: notes || 'auto_backup_before_spoofing',
        encrypted: false, // Sin cifrado
        integrityStatus: 'valid', // Recién creado, es válido
      };
      
      // Guardar backup
      await this.saveBackup(backup);
      
      // Vibración de éxito al completar
      haptics.success();
      
      console.log(`[BackupService] Backup created successfully: ${backup.id}`);
      console.log(`[BackupService] MD5: ${md5}`);
      console.log(`[BackupService] SHA256: ${sha256}`);
      usbLogger.success('BACKUP', `Backup creado: ${backup.id} (${dump.size} bytes, MD5: ${md5.substring(0, 8)}...)`);
      return backup;
    } catch (error) {
      console.error('[BackupService] Error creating backup:', error);
      usbLogger.error('BACKUP', `Error al crear backup: ${error}`, error);
      haptics.error();
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
   * Cargar backups con verificación de integridad
   */
  async loadBackupsWithIntegrity(): Promise<EEPROMBackup[]> {
    const backups = await this.loadBackups();
    
    // Verificar integridad de cada backup
    for (const backup of backups) {
      const result = this.verifyBackupIntegrity(backup);
      backup.integrityStatus = result.status;
    }
    
    return backups;
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
   * Esta función SOLO restaura VID/PID usando writeEEPROM que está probada.
   * 
   * VERIFICACIÓN DE INTEGRIDAD OBLIGATORIA antes de restaurar.
   */
  async restoreVidPidFromBackup(backupId: string): Promise<{ success: boolean; vid: number; pid: number }> {
    try {
      console.log(`[BackupService] Restoring VID/PID from backup: ${backupId}`);
      usbLogger.info('RESTORE', `Restaurando VID/PID desde backup: ${backupId}`);
      
      // Vibración de inicio de restauración
      haptics.restore();
      
      // Cargar backup
      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('backup_not_found');
      }
      
      // VERIFICACIÓN DE INTEGRIDAD OBLIGATORIA
      usbLogger.info('RESTORE', 'Verificando integridad del backup...');
      const integrityResult = this.verifyBackupIntegrity(backup);
      
      if (integrityResult.status !== 'valid') {
        const errorMsg = `integrity_check_failed: ${integrityResult.details}`;
        usbLogger.error('RESTORE', `Verificación de integridad fallida: ${integrityResult.details}`);
        throw new Error(errorMsg);
      }
      
      usbLogger.success('RESTORE', `Integridad verificada: MD5=${integrityResult.calculatedMd5.substring(0, 8)}...`);
      
      // Extraer VID/PID del backup
      const { vid, pid } = this.extractVidPidFromBackup(backup);
      
      usbLogger.info('RESTORE', `VID/PID a restaurar: ${vid.toString(16).toUpperCase()}:${pid.toString(16).toUpperCase()}`);
      
      // Usar writeEEPROM que está PROBADA y funciona correctamente
      // Convertir VID a hex string (little endian: low byte first)
      const vidLow = vid & 0xFF;
      const vidHigh = (vid >> 8) & 0xFF;
      const vidHex = vidLow.toString(16).padStart(2, '0') + vidHigh.toString(16).padStart(2, '0');
      
      // Convertir PID a hex string (little endian: low byte first)
      const pidLow = pid & 0xFF;
      const pidHigh = (pid >> 8) & 0xFF;
      const pidHex = pidLow.toString(16).padStart(2, '0') + pidHigh.toString(16).padStart(2, '0');
      
      usbLogger.info('RESTORE', `Escribiendo VID: 0x${vidHex.toUpperCase()} en offset 0x88`);
      const vidResult = await usbService.writeEEPROM(0x88, vidHex, false);
      
      if (!vidResult.verified) {
        throw new Error('common.vid_write_failed');
      }
      
      usbLogger.info('RESTORE', `Escribiendo PID: 0x${pidHex.toUpperCase()} en offset 0x8A`);
      const pidResult = await usbService.writeEEPROM(0x8A, pidHex, false);
      
      if (!pidResult.verified) {
        throw new Error('common.pid_write_failed');
      }
      
      usbLogger.success('RESTORE', `VID/PID restaurado: ${vid.toString(16).toUpperCase()}:${pid.toString(16).toUpperCase()}`);
      
      // Vibración de éxito
      haptics.success();
      
      return { success: true, vid, pid };
    } catch (error) {
      console.error('[BackupService] Error restoring VID/PID:', error);
      usbLogger.error('RESTORE', `Error al restaurar VID/PID: ${error}`, error);
      haptics.error();
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
        throw new Error('common.invalid_backup_format');
      }
      
      // Verificar integridad del backup importado
      const integrityResult = this.verifyBackupIntegrity(backup);
      if (integrityResult.status === 'corrupted') {
        throw new Error(`corrupted_backup: ${integrityResult.details}`);
      }
      
      // Si no tiene SHA256, calcularlo
      if (!backup.checksumSha256) {
        const { sha256 } = this.calculateChecksums(backup.data);
        backup.checksumSha256 = sha256;
      }
      
      backup.integrityStatus = integrityResult.status;
      
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
   * Actualizar checksums de backups antiguos que no tienen SHA256
   */
  async migrateBackupsToSha256(): Promise<number> {
    try {
      const backups = await this.loadBackups();
      let migratedCount = 0;
      
      for (const backup of backups) {
        if (!backup.checksumSha256) {
          const { sha256 } = this.calculateChecksums(backup.data);
          backup.checksumSha256 = sha256;
          migratedCount++;
        }
      }
      
      if (migratedCount > 0) {
        await AsyncStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backups));
        console.log(`[BackupService] Migrated ${migratedCount} backups to SHA256`);
      }
      
      return migratedCount;
    } catch (error) {
      console.error('[BackupService] Error migrating backups:', error);
      return 0;
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
  async getStats(): Promise<{ 
    total: number; 
    totalSize: number; 
    oldestDate: number | null; 
    newestDate: number | null;
    validCount: number;
    invalidCount: number;
    corruptedCount: number;
  }> {
    try {
      const backups = await this.loadBackupsWithIntegrity();
      
      if (backups.length === 0) {
        return { 
          total: 0, 
          totalSize: 0, 
          oldestDate: null, 
          newestDate: null,
          validCount: 0,
          invalidCount: 0,
          corruptedCount: 0,
        };
      }
      
      const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
      const timestamps = backups.map(b => b.timestamp);
      
      const validCount = backups.filter(b => b.integrityStatus === 'valid').length;
      const invalidCount = backups.filter(b => b.integrityStatus === 'invalid').length;
      const corruptedCount = backups.filter(b => b.integrityStatus === 'corrupted').length;
      
      return {
        total: backups.length,
        totalSize,
        oldestDate: Math.min(...timestamps),
        newestDate: Math.max(...timestamps),
        validCount,
        invalidCount,
        corruptedCount,
      };
    } catch (error) {
      console.error('[BackupService] Error getting stats:', error);
      return { 
        total: 0, 
        totalSize: 0, 
        oldestDate: null, 
        newestDate: null,
        validCount: 0,
        invalidCount: 0,
        corruptedCount: 0,
      };
    }
  }
}

export const backupService = new BackupService();
