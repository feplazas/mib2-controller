import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ScreenContainer } from '@/components/screen-container';
import { useUsbStatus } from '@/lib/usb-status-context';
import { backupService, type EEPROMBackup } from '@/lib/backup-service';
import { usbService } from '@/lib/usb-service';
import { useTranslation } from "@/lib/language-context";

import { showAlert } from '@/lib/translated-alert';
export default function RecoveryScreen() {
  const t = useTranslation();
  const { status, device, devices, scanDevices } = useUsbStatus();
  const [backups, setBackups] = useState<EEPROMBackup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar backups disponibles
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const availableBackups = await backupService.loadBackups();
      setBackups(availableBackups);
    } catch (error) {
      console.error('[Recovery] Error loading backups:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([scanDevices(), loadBackups()]);
    setRefreshing(false);
  };

  const isBricked = (): boolean => {
    if (!device) return false;
    
    // Detectar adaptador brickeado:
    // 1. VID/PID no es ni el original ni el objetivo
    // 2. VID/PID es 0x0000:0x0000 (corrupto)
    const isZero = device.vendorId === 0 && device.productId === 0;
    const isTarget = device.vendorId === 0x2001 && device.productId === 0x3C05;
    const isKnownASIX = device.vendorId === 0x0B95;
    
    return isZero || (!isTarget && !isKnownASIX);
  };

  const handleRestore = async (backup: EEPROMBackup) => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    Alert.alert(
      t('recovery.restore_eeprom_title'),
      t('recovery.restore_eeprom_message', { name: backup.deviceName, date: new Date(backup.timestamp).toLocaleString(), chipset: backup.chipset }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('recovery.restore'),
          style: 'destructive',
          onPress: () => performRestore(backup),
        },
      ]
    );
  };

  const performRestore = async (backup: EEPROMBackup) => {
    setIsRestoring(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Escribir EEPROM completa desde backup
      await usbService.writeEEPROM(0, backup.data);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('recovery.restore_success'),
        t('recovery.restore_success_message', { size: backup.size, checksum: backup.checksum.substring(0, 8) })
      );
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('recovery.restore_error'),
        error.message || t('recovery.restore_error_message')
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const handleForceRestore = async (backup: EEPROMBackup) => {
    Alert.alert(
      t('recovery.force_restore_title'),
      t('recovery.force_restore_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('recovery.force_restore'),
          style: 'destructive',
          onPress: () => performRestore(backup),
        },
      ]
    );
  };

  const brickedStatus = isBricked();

  return (
    <ScreenContainer className="p-6">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">{t('recovery.title')}</Text>
            <Text className="text-base text-muted mt-2">
              {t('recovery.subtitle')}
            </Text>
          </View>

          {/* Estado del Dispositivo */}
          <View className={`rounded-2xl p-6 border ${
            status === 'connected' && brickedStatus ? 'bg-error/10 border-error' :
            status === 'connected' ? 'bg-success/10 border-success' :
            status === 'detected' ? 'bg-warning/10 border-warning' :
            'bg-surface border-border'
          }`}>
            <View className="flex-row items-center gap-3 mb-4">
              <Text className="text-4xl">
                {status === 'connected' && brickedStatus ? '🚨' :
                 status === 'connected' ? '✅' :
                 status === 'detected' ? '⚠️' :
                 '❌'}
              </Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">
                  {status === 'connected' && brickedStatus ? t('recovery.bricked_detected') :
                   status === 'connected' ? t('recovery.adapter_connected') :
                   status === 'detected' ? t('recovery.device_detected') :
                   t('recovery.no_device')}
                </Text>
                <Text className="text-sm text-muted mt-1">
                  {status === 'connected' && brickedStatus ? t('recovery.bricked_desc') :
                   status === 'connected' ? t('recovery.adapter_ok') :
                   status === 'detected' ? t('recovery.connect_to_verify') :
                   t('recovery.connect_adapter')}
                </Text>
              </View>
            </View>

            {device && (
              <View className="bg-background rounded-xl p-4 gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('recovery.device')}:</Text>
                  <Text className="text-sm text-foreground font-medium">{device.deviceName}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">VID:PID:</Text>
                  <Text className={`text-sm font-mono font-medium ${
                    brickedStatus ? 'text-error' : 'text-success'
                  }`}>
                    0x{device.vendorId.toString(16).toUpperCase().padStart(4, '0')}:0x{device.productId.toString(16).toUpperCase().padStart(4, '0')}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('usb.chipset')}:</Text>
                  <Text className="text-sm text-foreground font-medium">{device.chipset}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Backups Disponibles */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-foreground">
                {t('recovery.available_backups')} ({backups.length})
              </Text>
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const backupPath = `${FileSystem.documentDirectory}Download/mib2_backups/`;
                  Alert.alert(
                    t('recovery.backup_location_title'),
                    t('recovery.backup_location_message'),
                    [
                      { text: t('common.understood'), style: 'default' },
                    ]
                  );
                }}
                className="bg-primary/10 px-3 py-2 rounded-lg active:opacity-80"
              >
                <Text className="text-xs text-primary font-semibold">
                  📂 {t('recovery.view_location')}
                </Text>
              </TouchableOpacity>
            </View>

            {backups.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-4xl mb-3">📦</Text>
                <Text className="text-sm text-muted text-center">
                  {t('recovery.no_backups')}{'\n'}
                  {t('recovery.create_backup_first')}
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {backups.map((backup) => (
                  <View
                    key={backup.id}
                    className="bg-background rounded-xl p-4 border border-border"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {backup.deviceName}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {new Date(backup.timestamp).toLocaleString('es-ES')}
                        </Text>
                      </View>
                      <View className="bg-primary/10 px-3 py-1 rounded-full">
                        <Text className="text-xs text-primary font-medium">
                          {backup.chipset}
                        </Text>
                      </View>
                    </View>

                    <View className="gap-2 mb-3">
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">VID:PID Original:</Text>
                        <Text className="text-xs text-foreground font-mono">
                          0x{backup.vendorId.toString(16).toUpperCase().padStart(4, '0')}:0x{backup.productId.toString(16).toUpperCase().padStart(4, '0')}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">{t('recovery.size')}:</Text>
                        <Text className="text-xs text-foreground">{backup.size} bytes</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Checksum:</Text>
                        <Text className="text-xs text-foreground font-mono">
                          {backup.checksum.substring(0, 16)}...
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row gap-2 mb-2">
                      <TouchableOpacity
                        onPress={() => handleRestore(backup)}
                        disabled={status !== 'connected' || isRestoring}
                        className={`flex-1 rounded-xl p-3 ${
                          status !== 'connected' || isRestoring
                            ? 'bg-muted/20'
                            : 'bg-primary active:opacity-80'
                        }`}
                      >
                        <Text
                          className={`text-center font-semibold text-sm ${
                            status !== 'connected' || isRestoring
                              ? 'text-muted'
                              : 'text-background'
                          }`}
                        >
                          {isRestoring ? '⏳ Restaurando...' : '🔄 Restaurar'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleForceRestore(backup)}
                        disabled={status !== 'connected' || isRestoring}
                        className={`flex-1 rounded-xl p-3 border ${
                          status !== 'connected' || isRestoring
                            ? 'bg-muted/20 border-muted'
                            : 'bg-error/10 border-error active:opacity-80'
                        }`}
                      >
                        <Text
                          className={`text-center font-semibold text-sm ${
                            status !== 'connected' || isRestoring
                              ? 'text-muted'
                              : 'text-error'
                          }`}
                        >
                          {isRestoring ? '⏳ Forzando...' : '⚠️ Forzar'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          
                          if (!backup.filepath) {
                            showAlert('alerts.error', 'alerts.no_se_encontró_la_ruta_del_archivo_de_backup');
                            return;
                          }

                          // Verificar que el archivo existe
                          const fileInfo = await FileSystem.getInfoAsync(backup.filepath);
                          if (!fileInfo.exists) {
                            showAlert('alerts.error', 'alerts.el_archivo_de_backup_no_existe_en_el_sistema');
                            return;
                          }

                          // Verificar si se puede compartir
                          const canShare = await Sharing.isAvailableAsync();
                          if (!canShare) {
                            showAlert('alerts.error', 'alerts.la_función_de_compartir_no_está_disponible_en_este');
                            return;
                          }

                          // Compartir archivo
                          await Sharing.shareAsync(backup.filepath, {
                            mimeType: 'application/octet-stream',
                            dialogTitle: `${t('backups.share_backup')} - ${backup.deviceName}`,
                          });

                          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        } catch (error: any) {
                          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                          showAlert('alerts.error', t('alerts.no_se_pudo_compartir_backup', { error: error.message }));
                        }
                      }}
                      disabled={isRestoring}
                      className={`w-full rounded-xl p-3 border ${
                        isRestoring
                          ? 'bg-muted/20 border-muted'
                          : 'bg-green-500/10 border-green-500/30 active:opacity-80'
                      }`}
                    >
                      <Text
                        className={`text-center font-semibold text-sm ${
                          isRestoring ? 'text-muted' : 'text-green-400'
                        }`}
                      >
                        📤 {t('backups.share_backup')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Instrucciones */}
          <View className="bg-warning/10 border border-warning rounded-2xl p-4">
            <Text className="text-sm text-warning font-semibold mb-2">
              💡 {t('recovery.instructions_title')}
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              {t('recovery.instructions_text')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
