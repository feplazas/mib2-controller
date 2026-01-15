/**
 * Gestor de Exportación/Importación de Configuración
 * Permite migrar toda la configuración de la app entre dispositivos
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export interface AppConfiguration {
  version: string;
  exportDate: string;
  profiles: any[];
  macros: any[];
  settings: {
    telnetConfig: any;
    expertMode: {
      enabled: boolean;
      pinHash?: string;
    };
    theme: string;
    notificationsEnabled: boolean;
  };
  metadata: {
    deviceInfo: string;
    appVersion: string;
  };
}

const CONFIG_VERSION = '1.0.0';
const STORAGE_KEYS = {
  PROFILES: '@mib2_profiles',
  ACTIVE_PROFILE: '@mib2_active_profile',
  TELNET_CONFIG: '@mib2_telnet_config',
  EXPERT_MODE: '@mib2_expert_mode',
  EXPERT_PIN: '@mib2_expert_pin',
  THEME: '@mib2_theme',
  NOTIFICATIONS: '@mib2_notifications_enabled',
};

export class ConfigManager {
  /**
   * Exportar toda la configuración de la app
   */
  static async exportConfiguration(): Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }> {
    try {
      console.log('[ConfigManager] Starting configuration export...');

      // Recopilar toda la configuración
      const config: AppConfiguration = {
        version: CONFIG_VERSION,
        exportDate: new Date().toISOString(),
        profiles: [],
        macros: [],
        settings: {
          telnetConfig: null,
          expertMode: {
            enabled: false,
          },
          theme: 'light',
          notificationsEnabled: true,
        },
        metadata: {
          deviceInfo: Platform.OS + ' ' + Platform.Version,
          appVersion: '3.3.0',
        },
      };

      // Cargar perfiles
      try {
        const profilesJson = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
        if (profilesJson) {
          config.profiles = JSON.parse(profilesJson);
        }
      } catch (error) {
        console.warn('[ConfigManager] Error loading profiles:', error);
      }

      // Cargar configuración de Telnet
      try {
        const telnetConfigJson = await AsyncStorage.getItem(STORAGE_KEYS.TELNET_CONFIG);
        if (telnetConfigJson) {
          config.settings.telnetConfig = JSON.parse(telnetConfigJson);
        }
      } catch (error) {
        console.warn('[ConfigManager] Error loading telnet config:', error);
      }

      // Cargar configuración de Modo Experto
      try {
        const expertModeJson = await AsyncStorage.getItem(STORAGE_KEYS.EXPERT_MODE);
        if (expertModeJson) {
          const expertMode = JSON.parse(expertModeJson);
          config.settings.expertMode.enabled = expertMode.enabled || false;
        }

        const pinHash = await AsyncStorage.getItem(STORAGE_KEYS.EXPERT_PIN);
        if (pinHash) {
          config.settings.expertMode.pinHash = pinHash;
        }
      } catch (error) {
        console.warn('[ConfigManager] Error loading expert mode:', error);
      }

      // Cargar tema
      try {
        const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (theme) {
          config.settings.theme = theme;
        }
      } catch (error) {
        console.warn('[ConfigManager] Error loading theme:', error);
      }

      // Cargar configuración de notificaciones
      try {
        const notificationsEnabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (notificationsEnabled !== null) {
          config.settings.notificationsEnabled = notificationsEnabled === 'true';
        }
      } catch (error) {
        console.warn('[ConfigManager] Error loading notifications setting:', error);
      }

      // Generar nombre de archivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `mib2_config_${timestamp}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      // Escribir archivo JSON
      const configJson = JSON.stringify(config, null, 2);
      await FileSystem.writeAsStringAsync(filePath, configJson, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log('[ConfigManager] Configuration exported to:', filePath);

      // Compartir archivo si está disponible
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'common.config_export_title',
          UTI: 'public.json',
        });
      }

      return {
        success: true,
        filePath,
      };
    } catch (error) {
      console.error('[ConfigManager] Export failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Importar configuración desde archivo JSON
   */
  static async importConfiguration(fileUri: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      console.log('[ConfigManager] Starting configuration import from:', fileUri);

      // Leer archivo
      const configJson = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const config: AppConfiguration = JSON.parse(configJson);

      // Validar versión
      if (!config.version || config.version !== CONFIG_VERSION) {
        return {
          success: false,
          error: `Incompatible configuration version. Expected ${CONFIG_VERSION}, got ${config.version || 'unknown'}`,
        };
      }

      // Validar estructura
      if (!config.settings || !config.exportDate) {
        return {
          success: false,
          error: 'Invalid configuration file structure',
        };
      }

      // Importar perfiles
      if (config.profiles && Array.isArray(config.profiles)) {
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(config.profiles));
        console.log(`[ConfigManager] Imported ${config.profiles.length} profiles`);
      }

      // Importar configuración de Telnet
      if (config.settings.telnetConfig) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.TELNET_CONFIG,
          JSON.stringify(config.settings.telnetConfig)
        );
        console.log('[ConfigManager] Imported Telnet configuration');
      }

      // Importar configuración de Modo Experto
      if (config.settings.expertMode) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.EXPERT_MODE,
          JSON.stringify({ enabled: config.settings.expertMode.enabled })
        );

        if (config.settings.expertMode.pinHash) {
          await AsyncStorage.setItem(STORAGE_KEYS.EXPERT_PIN, config.settings.expertMode.pinHash);
        }
        console.log('[ConfigManager] Imported Expert Mode configuration');
      }

      // Importar tema
      if (config.settings.theme) {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, config.settings.theme);
        console.log('[ConfigManager] Imported theme:', config.settings.theme);
      }

      // Importar configuración de notificaciones
      if (config.settings.notificationsEnabled !== undefined) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.NOTIFICATIONS,
          config.settings.notificationsEnabled.toString()
        );
        console.log('[ConfigManager] Imported notifications setting');
      }

      return {
        success: true,
        message: `Configuration imported successfully from ${new Date(config.exportDate).toLocaleDateString()}`,
      };
    } catch (error) {
      console.error('[ConfigManager] Import failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Obtener información de un archivo de configuración sin importarlo
   */
  static async getConfigurationInfo(fileUri: string): Promise<{
    success: boolean;
    info?: {
      version: string;
      exportDate: string;
      profileCount: number;
      deviceInfo: string;
    };
    error?: string;
  }> {
    try {
      const configJson = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const config: AppConfiguration = JSON.parse(configJson);

      return {
        success: true,
        info: {
          version: config.version,
          exportDate: config.exportDate,
          profileCount: config.profiles?.length || 0,
          deviceInfo: config.metadata?.deviceInfo || 'Unknown',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Limpiar toda la configuración (reset de fábrica)
   */
  static async clearAllConfiguration(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('[ConfigManager] Clearing all configuration...');

      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);

      console.log('[ConfigManager] All configuration cleared');

      return {
        success: true,
      };
    } catch (error) {
      console.error('[ConfigManager] Clear failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
