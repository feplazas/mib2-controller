import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY_NAME = 'mib2_backup_encryption_key';

/**
 * Servicio de cifrado para backups de EEPROM
 * Usa expo-secure-store para almacenar la clave maestra de forma segura
 * y CryptoJS para cifrar/descifrar los datos con AES-256
 */
class EncryptionService {
  private encryptionKey: string | null = null;

  /**
   * Inicializar o recuperar la clave de cifrado
   */
  private async getEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      // Intentar recuperar clave existente
      let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
      
      if (!key) {
        // Generar nueva clave aleatoria de 256 bits (32 bytes)
        key = CryptoJS.lib.WordArray.random(32).toString();
        
        // Guardar en SecureStore (encriptado por hardware en Android/iOS)
        await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
        console.log('[EncryptionService] Generated new encryption key');
      } else {
        console.log('[EncryptionService] Loaded existing encryption key');
      }

      this.encryptionKey = key;
      return key;
    } catch (error) {
      console.error('[EncryptionService] Error getting encryption key:', error);
      throw new Error('No se pudo obtener la clave de cifrado');
    }
  }

  /**
   * Cifrar datos con AES-256
   */
  async encrypt(plaintext: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      
      // Cifrar con AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
      
      console.log('[EncryptionService] Data encrypted successfully');
      return encrypted;
    } catch (error) {
      console.error('[EncryptionService] Encryption error:', error);
      throw new Error(`Error al cifrar datos: ${error}`);
    }
  }

  /**
   * Descifrar datos con AES-256
   */
  async decrypt(ciphertext: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      
      // Descifrar con AES-256-CBC
      const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!plaintext) {
        throw new Error('common.error_decrypt_failed');
      }
      
      console.log('[EncryptionService] Data decrypted successfully');
      return plaintext;
    } catch (error) {
      console.error('[EncryptionService] Decryption error:', error);
      throw new Error('common.error_decrypt_failed');
    }
  }

  /**
   * Verificar si existe una clave de cifrado
   */
  async hasEncryptionKey(): Promise<boolean> {
    try {
      const key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
      return key !== null;
    } catch (error) {
      console.error('[EncryptionService] Error checking encryption key:', error);
      return false;
    }
  }

  /**
   * Eliminar la clave de cifrado (usar con precaución)
   * ADVERTENCIA: Esto hará que todos los backups cifrados sean irrecuperables
   */
  async deleteEncryptionKey(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
      this.encryptionKey = null;
      console.log('[EncryptionService] Encryption key deleted');
    } catch (error) {
      console.error('[EncryptionService] Error deleting encryption key:', error);
      throw new Error('No se pudo eliminar la clave de cifrado');
    }
  }

  /**
   * Rotar clave de cifrado (re-cifrar todos los backups con nueva clave)
   * NOTA: Esto debe ser implementado en backup-service.ts
   */
  async rotateEncryptionKey(): Promise<string> {
    try {
      // Generar nueva clave
      const newKey = CryptoJS.lib.WordArray.random(32).toString();
      
      // Guardar nueva clave
      await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, newKey);
      this.encryptionKey = newKey;
      
      console.log('[EncryptionService] Encryption key rotated');
      return newKey;
    } catch (error) {
      console.error('[EncryptionService] Error rotating encryption key:', error);
      throw new Error('No se pudo rotar la clave de cifrado');
    }
  }
}

export const encryptionService = new EncryptionService();
