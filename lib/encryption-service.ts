import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

const ENCRYPTION_KEY_NAME = 'mib2_backup_encryption_key';
const ASYNC_STORAGE_KEY_NAME = '@mib2_backup_encryption_key'; // Fallback para web

/**
 * Servicio de cifrado para backups de EEPROM
 * Usa expo-secure-store para almacenar la clave maestra de forma segura
 * y CryptoJS para cifrar/descifrar los datos con AES-256
 */
class EncryptionService {
  private encryptionKey: string | null = null;

  /**
   * Inicializar o recuperar la clave de cifrado
   * En Android/iOS usa SecureStore (cifrado por hardware)
   * En web usa AsyncStorage (sin cifrado de hardware, solo para desarrollo)
   */
  private async getEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      let key: string | null = null;
      
      // En Android/iOS usar SecureStore (cifrado por hardware)
      if (Platform.OS !== 'web') {
        try {
          key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
          console.log('[EncryptionService] SecureStore.getItemAsync result:', key ? 'key exists' : 'no key found');
        } catch (getError) {
          console.error('[EncryptionService] SecureStore.getItemAsync failed:', getError);
          throw new Error(`Error al leer SecureStore: ${getError}`);
        }
        
        if (!key) {
          // Generar nueva clave aleatoria de 256 bits (32 bytes)
          key = CryptoJS.lib.WordArray.random(32).toString();
          console.log('[EncryptionService] Generated new key, attempting to save...');
          
          try {
            // Guardar en SecureStore (encriptado por hardware)
            await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
            console.log('[EncryptionService] New encryption key saved successfully (SecureStore)');
          } catch (setError) {
            console.error('[EncryptionService] SecureStore.setItemAsync failed:', setError);
            throw new Error(`Error al guardar en SecureStore: ${setError}`);
          }
        } else {
          console.log('[EncryptionService] Loaded existing encryption key (SecureStore)');
        }
      } else {
        // En web usar AsyncStorage como fallback (solo para desarrollo/testing)
        key = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_NAME);
        
        if (!key) {
          // Generar nueva clave aleatoria
          key = CryptoJS.lib.WordArray.random(32).toString();
          
          // Guardar en AsyncStorage (NO cifrado por hardware)
          await AsyncStorage.setItem(ASYNC_STORAGE_KEY_NAME, key);
          console.warn('[EncryptionService] Generated new encryption key (AsyncStorage - web fallback, not secure)');
        } else {
          console.log('[EncryptionService] Loaded existing encryption key (AsyncStorage - web fallback)');
        }
      }

      if (!key) {
        throw new Error('La clave de cifrado es null después de generarla');
      }

      this.encryptionKey = key;
      return key;
    } catch (error) {
      console.error('[EncryptionService] Error getting encryption key:', error);
      // Propagar el error original con más contexto
      throw error instanceof Error ? error : new Error(`No se pudo obtener la clave de cifrado: ${error}`);
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
      let key: string | null = null;
      
      if (Platform.OS !== 'web') {
        key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
      } else {
        key = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_NAME);
      }
      
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
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
      } else {
        await AsyncStorage.removeItem(ASYNC_STORAGE_KEY_NAME);
      }
      
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
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, newKey);
      } else {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY_NAME, newKey);
      }
      
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
