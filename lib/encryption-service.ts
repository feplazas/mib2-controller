import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

const ENCRYPTION_KEY_NAME = 'mib2_backup_encryption_key';
const ASYNC_STORAGE_KEY_NAME = '@mib2_backup_encryption_key';
const STORAGE_TYPE_KEY = '@mib2_encryption_storage_type';

/**
 * Servicio de cifrado para backups de EEPROM
 * 
 * ESTRATEGIA DE ALMACENAMIENTO:
 * 1. Intenta usar SecureStore (cifrado por hardware) en Android/iOS
 * 2. Si SecureStore falla (bug conocido en algunos dispositivos Android), 
 *    usa AsyncStorage con cifrado por software como fallback
 * 3. En web siempre usa AsyncStorage
 * 
 * GENERACIÓN DE CLAVES:
 * - Usa expo-crypto.getRandomBytesAsync() para generar bytes aleatorios seguros
 * - Esto funciona correctamente en React Native (a diferencia de CryptoJS.lib.WordArray.random)
 * 
 * Referencia: https://github.com/expo/expo/issues/23426
 */
class EncryptionService {
  private encryptionKey: string | null = null;
  private storageType: 'securestore' | 'asyncstorage' | null = null;

  /**
   * Generar clave aleatoria segura de 256 bits (32 bytes)
   * Usa expo-crypto que funciona correctamente en React Native
   */
  private async generateSecureKey(): Promise<string> {
    try {
      // Usar expo-crypto para generar bytes aleatorios seguros
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      // Convertir a string hexadecimal
      const hexKey = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      console.log('[EncryptionService] Generated secure random key using expo-crypto');
      return hexKey;
    } catch (error) {
      console.error('[EncryptionService] expo-crypto failed:', error);
      // Fallback: usar timestamp + Math.random (menos seguro pero funcional)
      const fallbackKey = `${Date.now()}-${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}`;
      console.warn('[EncryptionService] Using fallback key generation (less secure)');
      return fallbackKey;
    }
  }

  /**
   * Intentar guardar clave en SecureStore
   */
  private async trySecureStore(key: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
      const verification = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
      if (verification === key) {
        console.log('[EncryptionService] SecureStore working correctly');
        return true;
      }
      console.warn('[EncryptionService] SecureStore verification failed');
      return false;
    } catch (error) {
      console.warn('[EncryptionService] SecureStore failed:', error);
      return false;
    }
  }

  /**
   * Guardar clave en AsyncStorage (fallback)
   */
  private async saveToAsyncStorage(key: string): Promise<void> {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEY_NAME, key);
    await AsyncStorage.setItem(STORAGE_TYPE_KEY, 'asyncstorage');
    console.log('[EncryptionService] Key saved to AsyncStorage (fallback)');
  }

  /**
   * Obtener clave de cifrado con fallback automático
   */
  private async getEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      let key: string | null = null;
      
      // En web, usar siempre AsyncStorage
      if (Platform.OS === 'web') {
        key = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_NAME);
        
        if (!key) {
          key = await this.generateSecureKey();
          await AsyncStorage.setItem(ASYNC_STORAGE_KEY_NAME, key);
          console.log('[EncryptionService] New key generated (web/AsyncStorage)');
        }
        
        this.encryptionKey = key;
        this.storageType = 'asyncstorage';
        return key;
      }

      // En Android/iOS: intentar determinar qué storage usar
      const savedStorageType = await AsyncStorage.getItem(STORAGE_TYPE_KEY);
      
      if (savedStorageType === 'asyncstorage') {
        key = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_NAME);
        if (key) {
          console.log('[EncryptionService] Using AsyncStorage (previously determined)');
          this.encryptionKey = key;
          this.storageType = 'asyncstorage';
          return key;
        }
      }

      // Intentar SecureStore primero
      try {
        key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
        
        if (key) {
          console.log('[EncryptionService] Key loaded from SecureStore');
          this.encryptionKey = key;
          this.storageType = 'securestore';
          return key;
        }
      } catch (secureStoreError) {
        console.warn('[EncryptionService] SecureStore.getItemAsync failed:', secureStoreError);
      }

      // No hay clave existente, generar una nueva usando expo-crypto
      key = await this.generateSecureKey();
      console.log('[EncryptionService] Generated new encryption key');

      // Intentar guardar en SecureStore
      const secureStoreSuccess = await this.trySecureStore(key);
      
      if (secureStoreSuccess) {
        await AsyncStorage.setItem(STORAGE_TYPE_KEY, 'securestore');
        this.storageType = 'securestore';
        console.log('[EncryptionService] Key saved to SecureStore successfully');
      } else {
        await this.saveToAsyncStorage(key);
        this.storageType = 'asyncstorage';
        console.warn('[EncryptionService] Using AsyncStorage fallback (SecureStore unavailable)');
      }

      this.encryptionKey = key;
      return key;
    } catch (error) {
      console.error('[EncryptionService] Critical error getting encryption key:', error);
      
      // Último recurso: generar clave temporal en memoria
      const emergencyKey = await this.generateSecureKey();
      console.error('[EncryptionService] Using emergency in-memory key (will be lost on app restart)');
      this.encryptionKey = emergencyKey;
      return emergencyKey;
    }
  }

  /**
   * Cifrar datos con AES-256
   */
  async encrypt(plaintext: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
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
      if (Platform.OS !== 'web') {
        try {
          const secureKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
          if (secureKey) return true;
        } catch {
          // Ignorar error de SecureStore
        }
      }
      
      const asyncKey = await AsyncStorage.getItem(ASYNC_STORAGE_KEY_NAME);
      return asyncKey !== null;
    } catch (error) {
      console.error('[EncryptionService] Error checking encryption key:', error);
      return false;
    }
  }

  /**
   * Eliminar la clave de cifrado
   */
  async deleteEncryptionKey(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        try {
          await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
        } catch {
          // Ignorar error
        }
      }
      
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEY_NAME);
      await AsyncStorage.removeItem(STORAGE_TYPE_KEY);
      
      this.encryptionKey = null;
      this.storageType = null;
      console.log('[EncryptionService] Encryption key deleted');
    } catch (error) {
      console.error('[EncryptionService] Error deleting encryption key:', error);
      throw new Error('No se pudo eliminar la clave de cifrado');
    }
  }

  /**
   * Obtener información sobre el storage actual
   */
  getStorageInfo(): { type: string; secure: boolean } {
    return {
      type: this.storageType || 'unknown',
      secure: this.storageType === 'securestore'
    };
  }

  /**
   * Rotar clave de cifrado
   */
  async rotateEncryptionKey(): Promise<string> {
    try {
      const newKey = await this.generateSecureKey();
      
      if (Platform.OS !== 'web' && this.storageType === 'securestore') {
        const success = await this.trySecureStore(newKey);
        if (!success) {
          await this.saveToAsyncStorage(newKey);
          this.storageType = 'asyncstorage';
        }
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
