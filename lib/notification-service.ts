/**
 * Servicio de Notificaciones Push
 * Maneja notificaciones locales para operaciones de larga duración
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_ENABLED_KEY = '@mib2_notifications_enabled';

// Configurar comportamiento de notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationType = 'spoofing' | 'recovery' | 'restore' | 'general';

export interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: NotificationType;
}

export class NotificationService {
  private static permissionGranted: boolean = false;

  /**
   * Solicitar permisos de notificaciones
   */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('[Notifications] Web platform does not support push notifications');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.permissionGranted = finalStatus === 'granted';

      if (!this.permissionGranted) {
        console.log('[Notifications] Permission not granted');
        return false;
      }

      // Configurar canal de notificaciones en Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'MIB2 Operations',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0a7ea4',
          sound: 'default',
        });
      }

      console.log('[Notifications] Permissions granted');
      return true;
    } catch (error) {
      console.error('[Notifications] Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Verificar si las notificaciones están habilitadas
   */
  static async areNotificationsEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      return enabled === 'true';
    } catch {
      return true; // Por defecto habilitadas
    }
  }

  /**
   * Habilitar/deshabilitar notificaciones
   */
  static async setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled.toString());
    } catch (error) {
      console.error('[Notifications] Error saving preference:', error);
    }
  }

  /**
   * Enviar notificación local inmediata
   */
  static async sendNotification(options: NotificationOptions): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('[Notifications] Skipping notification on web:', options.title);
      return;
    }

    const enabled = await this.areNotificationsEnabled();
    if (!enabled) {
      console.log('[Notifications] Notifications disabled by user');
      return;
    }

    if (!this.permissionGranted) {
      const granted = await this.requestPermissions();
      if (!granted) {
        return;
      }
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: {
            ...options.data,
            type: options.type || 'general',
          },
          sound: 'default',
        },
        trigger: null, // Inmediata
      });

      console.log('[Notifications] Notification sent:', options.title);
    } catch (error) {
      console.error('[Notifications] Error sending notification:', error);
    }
  }

  /**
   * Notificación de operación de spoofing completada
   */
  static async notifySpoofingComplete(success: boolean, deviceName?: string): Promise<void> {
    const title = success ? '✅ Spoofing Completed' : '❌ Spoofing Failed';
    const body = success
      ? `The adapter ${deviceName || 'device'} has been successfully spoofed.`
      : `Spoofing operation failed. Check the logs for details.`;

    await this.sendNotification({
      title,
      body,
      type: 'spoofing',
      data: {
        success,
        deviceName,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Notificación de operación de recuperación completada
   */
  static async notifyRecoveryComplete(success: boolean, method?: string): Promise<void> {
    const title = success ? '✅ Recovery Completed' : '❌ Recovery Failed';
    const body = success
      ? `Device recovery using ${method || 'unknown method'} was successful.`
      : `Recovery operation failed. The device may require manual intervention.`;

    await this.sendNotification({
      title,
      body,
      type: 'recovery',
      data: {
        success,
        method,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Notificación de restauración de backup completada
   */
  static async notifyRestoreComplete(success: boolean, backupName?: string): Promise<void> {
    const title = success ? '✅ Restore Completed' : '❌ Restore Failed';
    const body = success
      ? `EEPROM backup "${backupName || 'Unknown'}" has been restored successfully.`
      : `Failed to restore backup. The device may be in an inconsistent state.`;

    await this.sendNotification({
      title,
      body,
      type: 'restore',
      data: {
        success,
        backupName,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Notificación de progreso de operación larga
   */
  static async notifyOperationProgress(
    operationType: string,
    progress: number,
    message: string
  ): Promise<void> {
    // Solo notificar en hitos importantes (25%, 50%, 75%)
    if (progress !== 25 && progress !== 50 && progress !== 75) {
      return;
    }

    await this.sendNotification({
      title: `${operationType} - ${progress}%`,
      body: message,
      type: 'general',
      data: {
        operationType,
        progress,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Cancelar todas las notificaciones pendientes
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[Notifications] All notifications cancelled');
    } catch (error) {
      console.error('[Notifications] Error cancelling notifications:', error);
    }
  }

  /**
   * Obtener badge count actual
   */
  static async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch {
      return 0;
    }
  }

  /**
   * Establecer badge count
   */
  static async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('[Notifications] Error setting badge count:', error);
    }
  }

  /**
   * Limpiar badge
   */
  static async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }
}
