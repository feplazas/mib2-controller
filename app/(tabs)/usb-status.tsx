import { ScrollView, Text, View, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { useUsbStatus } from '@/lib/usb-status-context';
import { usbService } from '@/lib/usb-service';
import { backupService } from '@/lib/backup-service';
import { ChipsetStatusBadge } from '@/components/chipset-status-badge';
import { getChipsetCompatibility, canAttemptSpoofing } from '@/lib/chipset-compatibility';
import { ScanningIndicator } from '@/components/scanning-indicator';
import { CompatibilityCheckLoader } from '@/components/compatibility-check-loader';

import { showAlert } from '@/lib/translated-alert';
import { useTranslation } from "@/lib/language-context";

export default function UsbStatusScreen() {
  const t = useTranslation();
  const { status, device, devices, isScanning, scanDevices, connectToDevice, disconnectDevice, detectedProfile, recommendedProfile } = useUsbStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const [uptime, setUptime] = useState('00:00:00');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestingEEPROM, setIsTestingEEPROM] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false);
  const [isEmergencyRestoring, setIsEmergencyRestoring] = useState(false);
  const [savedOriginalValues, setSavedOriginalValues] = useState<{
    vendorId: number;
    productId: number;
    chipset: string;
    deviceName: string;
    savedAt: string;
  } | null>(null);
  const [isClearingValues, setIsClearingValues] = useState(false);

  // Cargar valores originales guardados al montar
  useEffect(() => {
    const loadSavedValues = async () => {
      const values = await usbService.getOriginalValues();
      setSavedOriginalValues(values);
    };
    loadSavedValues();
  }, []);

  // Simular verificación de compatibilidad cuando se conecta
  useEffect(() => {
    if (status === 'connected' && device && !detectedProfile) {
      setIsCheckingCompatibility(true);
      // Simular delay de verificación (1.5 segundos)
      const timer = setTimeout(() => {
        setIsCheckingCompatibility(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsCheckingCompatibility(false);
    }
  }, [status, device, detectedProfile]);

  // Actualizar tiempo de conexión cada segundo
  useEffect(() => {
    if (status === 'connected' && !connectionTime) {
      setConnectionTime(new Date());
    } else if (status !== 'connected') {
      setConnectionTime(null);
      setUptime('00:00:00');
    }
  }, [status, connectionTime]);

  useEffect(() => {
    if (!connectionTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - connectionTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setUptime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionTime]);

  const onRefresh = async () => {
    setRefreshing(true);
    await scanDevices();
    setRefreshing(false);
  };

  const handleCreateBackup = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    Alert.alert(
      t('usb.create_backup_title'),
      t('usb.create_backup_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('usb.create_backup'),
          onPress: async () => {
            setIsCreatingBackup(true);
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const backup = await backupService.createBackup(device);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              const filename = `backup_${device.vendorId.toString(16)}_${device.productId.toString(16)}_${backup.timestamp}.bin`;
              Alert.alert(
                t('usb.backup_created'),
                t('usb.backup_created_message', { filename, date: new Date(backup.timestamp).toLocaleString(), size: backup.size })
              );
            } catch (error: any) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                t('usb.backup_error'),
                error.message || t('usb.backup_error_message')
              );
            } finally {
              setIsCreatingBackup(false);
            }
          },
        },
      ]
    );
  };

  const handleConnect = async () => {
    // Usar el primer dispositivo detectado si no hay device seleccionado
    const targetDevice = device || (devices.length > 0 ? devices[0] : null);
    
    if (!targetDevice) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_detectado');
      return;
    }

    setIsConnecting(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Solicitar permisos
      const granted = await usbService.requestPermission(targetDevice.deviceId);
      if (!granted) {
        throw new Error(t('usb.permissions_denied'));
      }

      // Abrir dispositivo
      const opened = await usbService.openDevice(targetDevice.deviceId);
      if (!opened) {
        throw new Error(t('usb.could_not_open'));
      }

      // Actualizar estado global usando connectToDevice del contexto
      // Esto marca el dispositivo como conectado en el contexto
      await connectToDevice(targetDevice);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('usb.connected'),
        t('usb.connected_message', { name: targetDevice.deviceName, vidpid: `0x${targetDevice.vendorId.toString(16).toUpperCase().padStart(4, '0')}:0x${targetDevice.productId.toString(16).toUpperCase().padStart(4, '0')}`, chipset: targetDevice.chipset })
      );
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('usb.connect_error'),
        error.message || t('usb.connect_error_message')
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestEEPROM = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    setIsTestingEEPROM(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Realizar detección REAL de tipo de EEPROM
      const eepromType = await usbService.detectEEPROMType();
      
      // Leer EEPROM completa para verificar integridad
      const result = await usbService.readEEPROM(0, 256);
      
      // Calcular checksum simple
      let checksum = 0;
      for (let i = 0; i < result.data.length; i += 2) {
        const byte = parseInt(result.data.substr(i, 2), 16);
        checksum = (checksum + byte) & 0xFF;
      }

      // Verificar integridad (detectar si está corrupta)
      const isCorrupt = result.data === 'FF'.repeat(128); // 256 bytes = 128 pares FF
      
      await Haptics.notificationAsync(
        eepromType.writable ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
      );
      
      // Determinar icono según tipo
      const typeIcon = eepromType.type === 'external_eeprom' ? '✅' : eepromType.type === 'efuse' ? '❌' : '⚠️';
      const typeLabel = eepromType.type === 'external_eeprom' ? t('usb.eeprom_external') : eepromType.type === 'efuse' ? 'eFuse' : t('usb.unknown');
      
      Alert.alert(
        `${typeIcon} ${t('usb.test_eeprom_complete')}`,
        `📊 ${t('usb.size')}: 256 bytes\n` +
        `🔢 Checksum: 0x${checksum.toString(16).toUpperCase().padStart(2, '0')}\n` +
        `${isCorrupt ? `❌ ${t('usb.status')}: ${t('usb.corrupt')}` : `✅ ${t('usb.status')}: ${t('usb.ok')}`}\n\n` +
        `🔍 ${t('usb.detected_type')}: ${typeLabel}\n` +
        `📝 ${t('usb.modifiable')}: ${eepromType.writable ? `${t('common.yes')} ✅` : `${t('common.no')} ❌`}\n\n` +
        `💡 ${eepromType.reason}\n\n` +
        `${eepromType.writable ? `✅ ${t('usb.can_be_modified')}` : `⚠️ ${t('usb.cannot_be_modified')}`}`
      );
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t('usb.test_eeprom_error'),
        error.message || t('usb.test_eeprom_error_message')
      );
    } finally {
      setIsTestingEEPROM(false);
    }
  };

  const handleEmergencyRestore = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    Alert.alert(
      t('usb.emergency_restore_title'),
      t('usb.emergency_restore_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('usb.emergency_restore'),
          style: 'destructive',
          onPress: async () => {
            // Segunda confirmación
            Alert.alert(
              t('usb.emergency_restore_warning_title'),
              t('usb.emergency_restore_warning'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('usb.confirm_restore'),
                  style: 'destructive',
                  onPress: async () => {
                    setIsEmergencyRestoring(true);
                    try {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                      
                      const result = await usbService.emergencyRestoreOriginal(false);
                      
                      if (result.success) {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        const sourceInfo = result.usedSavedValues 
                          ? t('usb.used_saved_values')
                          : t('usb.used_default_values');
                        Alert.alert(
                          t('usb.emergency_restore_success'),
                          result.message + '\n\n' +
                          sourceInfo + '\n\n' +
                          `Primary: ${result.details.primaryVerified ? '✅' : '⚠️'}\n` +
                          `Secondary: ${result.details.secondaryVerified ? '✅' : '⚠️'}`
                        );
                      } else {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                        Alert.alert(t('usb.emergency_restore_failed'), result.message);
                      }
                    } catch (error: any) {
                      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                      Alert.alert(t('usb.emergency_restore_failed'), error.message);
                    } finally {
                      setIsEmergencyRestoring(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleClearSavedValues = async () => {
    Alert.alert(
      t('usb.clear_saved_values_title'),
      t('usb.clear_saved_values_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('usb.clear_saved_values'),
          style: 'destructive',
          onPress: async () => {
            setIsClearingValues(true);
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await usbService.clearOriginalValues();
              setSavedOriginalValues(null);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              showAlert('common.success', 'usb.clear_saved_values_success');
            } catch (error: any) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              showAlert('alerts.error', error.message);
            } finally {
              setIsClearingValues(false);
            }
          }
        }
      ]
    );
  };

  const handleDisconnect = async () => {
    Alert.alert(
      t('usb.disconnect_title'),
      t('usb.disconnect_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('usb.disconnect'),
          style: 'destructive',
          onPress: async () => {
            setIsDisconnecting(true);
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              
              // Cerrar dispositivo
              usbService.closeDevice();
              
              // Actualizar estado global usando disconnectDevice del contexto
              await disconnectDevice();
              
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              showAlert('alerts.desconectado', 'alerts.el_dispositivo_usb_se_desconectó_correctamente');
            } catch (error: any) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                t('usb.disconnect_error'),
                error.message || t('usb.disconnect_error_message')
              );
            } finally {
              setIsDisconnecting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'detected':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return t('usb.status_connected');
      case 'detected':
        return t('usb.status_detected');
      default:
        return t('usb.status_disconnected');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'detected':
        return '⚠️';
      default:
        return '❌';
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-4">
          {/* Indicador de Escaneo */}
          <ScanningIndicator isScanning={isScanning} text={t('usb.scanning')} />
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-foreground mb-2">
              {t('usb.connection_status')}
            </Text>
            <Text className="text-sm text-muted text-center">
              {t('usb.realtime_info')}
            </Text>
          </View>

          {/* Estado Principal */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="items-center gap-4">
              <View className={`w-24 h-24 rounded-full ${getStatusColor()} items-center justify-center`}>
                <Text className="text-5xl">{getStatusIcon()}</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-foreground">
                  {getStatusText()}
                </Text>
                {status === 'connected' && device && (
                  <Text className="text-sm text-muted mt-1">
                    {device.product || device.deviceName}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Información del Dispositivo Conectado */}
          {status === 'connected' && device && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">
                {t('usb.device_info')}
              </Text>
              
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('usb.name')}:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {device.deviceName}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">VID:PID:</Text>
                  <Text className="text-sm text-foreground font-mono">
                    {usbService.formatVIDPID(device.vendorId, device.productId)}
                  </Text>
                </View>

                {device.manufacturer && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">{t('usb.manufacturer')}:</Text>
                    <Text className="text-sm text-foreground">
                      {device.manufacturer}
                    </Text>
                  </View>
                )}

                {device.product && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">{t('usb.product')}:</Text>
                    <Text className="text-sm text-foreground">
                      {device.product}
                    </Text>
                  </View>
                )}

                {device.serialNumber && device.serialNumber !== 'Unknown' && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">{t('usb.serial')}:</Text>
                    <Text className="text-sm text-foreground font-mono">
                      {device.serialNumber}
                    </Text>
                  </View>
                )}

                {device.chipset && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">{t('usb.chipset')}:</Text>
                    <Text className="text-sm text-foreground font-medium">
                      {device.chipset}
                    </Text>
                  </View>
                )}

              </View>
            </View>
          )}

              {/* Botón Refrescar (siempre visible) */}
          <View className="mt-4">
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                await scanDevices();
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              disabled={isScanning}
              className={`rounded-xl p-3 items-center border ${
                isScanning 
                  ? 'bg-muted/20 border-muted opacity-50' 
                  : 'bg-background border-primary active:opacity-80'
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">🔄</Text>
                <Text className={`text-sm font-semibold ${
                  isScanning ? 'text-muted' : 'text-primary'
                }`}>
                  {isScanning ? t('usb.scanning') : t('usb.refresh_devices')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Botones de Acción */}
          {status === 'detected' && devices.length > 0 && (
            <View className="mt-3">
              <TouchableOpacity
                onPress={handleConnect}
                disabled={isConnecting}
                className={`rounded-xl p-4 items-center border-2 ${
                  isConnecting 
                    ? 'bg-muted/20 border-muted opacity-50' 
                    : 'bg-primary border-primary active:opacity-80'
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">🔌</Text>
                  <Text className="text-base font-bold text-background">
                    {isConnecting ? t('usb.connecting') : t('usb.connect')}
                  </Text>
                </View>
                <Text className="text-xs text-background/80 mt-1">
                  {t('usb.request_permissions')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'connected' && device && (
            <View className="mt-4 gap-3">
              {/* Botón Test EEPROM */}
              <TouchableOpacity
                onPress={handleTestEEPROM}
                disabled={isTestingEEPROM}
                className={`rounded-xl p-4 items-center border-2 ${
                  isTestingEEPROM 
                    ? 'bg-muted/20 border-muted opacity-50' 
                    : 'bg-green-500 border-green-500 active:opacity-80'
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">🧪</Text>
                  <Text className="text-base font-bold text-background">
                    {isTestingEEPROM ? t('usb.testing') : t('usb.test_eeprom')}
                  </Text>
                </View>
                <Text className="text-xs text-background/80 mt-1">
                  {t('usb.test_eeprom_desc')}
                </Text>
              </TouchableOpacity>

              {/* Botón Desconectar */}
              <TouchableOpacity
                onPress={handleDisconnect}
                className="rounded-xl p-4 items-center border-2 bg-background border-error active:opacity-80"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">❌</Text>
                  <Text className="text-base font-bold text-error">
                    {t('usb.disconnect')}
                  </Text>
                </View>
                <Text className="text-xs text-muted mt-1">
                  {t('usb.disconnect_desc')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Badge de Estado del Chipset */}
          {status === 'connected' && device && device.chipset && (
            <View className="mt-4 gap-3">
              <ChipsetStatusBadge
                chipset={device.chipset}
                compatibility={getChipsetCompatibility(device.chipset)}
                animated={true}
              />
              
              {/* Botón de Acceso Rápido a Auto Spoof */}
              {(() => {
                const compat = getChipsetCompatibility(device.chipset);
                if (canAttemptSpoofing(compat)) {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        const router = require('expo-router').router;
                        router.push('/(tabs)/auto-spoof');
                      }}
                      className="bg-primary rounded-xl p-4 items-center active:opacity-80"
                    >
                      <View className="flex-row items-center gap-2">
                        <Text className="text-xl">⚡</Text>
                        <Text className="text-base font-bold text-background">
                          {t('usb.go_to_auto_spoof')}
                        </Text>
                        <Text className="text-xl">›</Text>
                      </View>
                      <Text className="text-xs text-background/80 mt-1">
                        {compat === 'confirmed' 
                          ? t('usb.chipset_confirmed') 
                          : t('usb.chipset_experimental')}
                      </Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              })()}
              
              {/* Botón de Backup Manual */}
              <TouchableOpacity
                onPress={handleCreateBackup}
                disabled={isCreatingBackup}
                className={`rounded-xl p-4 items-center border-2 ${
                  isCreatingBackup 
                    ? 'bg-muted/20 border-muted opacity-50' 
                    : 'bg-background border-primary active:opacity-80'
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">💾</Text>
                  <Text className={`text-base font-bold ${
                    isCreatingBackup ? 'text-muted' : 'text-primary'
                  }`}>
                    {isCreatingBackup ? t('usb.creating_backup') : t('usb.create_backup_manual')}
                  </Text>
                </View>
                <Text className="text-xs text-muted mt-1">
                  {t('usb.backup_desc')}
                </Text>
              </TouchableOpacity>

              {/* Botón Emergency Restore ASIX */}
              <TouchableOpacity
                onPress={handleEmergencyRestore}
                disabled={isEmergencyRestoring}
                className={`rounded-xl p-4 items-center border-2 ${
                  isEmergencyRestoring 
                    ? 'bg-muted/20 border-muted opacity-50' 
                    : 'bg-error/10 border-error active:opacity-80'
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">🚨</Text>
                  <Text className={`text-base font-bold ${
                    isEmergencyRestoring ? 'text-muted' : 'text-error'
                  }`}>
                    {isEmergencyRestoring ? t('usb.restoring') : t('usb.emergency_restore')}
                  </Text>
                </View>
                <Text className="text-xs text-muted mt-1">
                  {t('usb.emergency_restore_desc')}
                </Text>
              </TouchableOpacity>

              {/* Indicador de Valores Originales Guardados */}
              {savedOriginalValues && (
                <View className="rounded-xl p-4 border-2 bg-primary/10 border-primary">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-xl">💾</Text>
                    <Text className="text-base font-bold text-primary">
                      {t('usb.saved_original_values')}
                    </Text>
                  </View>
                  <View className="gap-1">
                    {savedOriginalValues.chipset && (
                      <Text className="text-sm font-medium text-foreground">
                        {savedOriginalValues.chipset}
                      </Text>
                    )}
                    <Text className="text-sm text-muted">
                      VID: 0x{savedOriginalValues.vendorId.toString(16).toUpperCase().padStart(4, '0')} / PID: 0x{savedOriginalValues.productId.toString(16).toUpperCase().padStart(4, '0')}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {t('usb.saved_at')}: {new Date(savedOriginalValues.savedAt).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleClearSavedValues}
                    disabled={isClearingValues}
                    className="mt-3 rounded-lg py-2 px-4 bg-muted/20 active:opacity-80"
                  >
                    <Text className="text-sm text-muted text-center">
                      {isClearingValues ? t('common.loading') : t('usb.clear_saved_values')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Indicador de NO hay valores guardados */}
              {!savedOriginalValues && (
                <View className="rounded-xl p-4 border-2 bg-warning/10 border-warning/50">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xl">⚠️</Text>
                    <Text className="text-sm text-warning">
                      {t('usb.no_saved_values')}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted mt-2">
                    {t('usb.no_saved_values_desc')}
                  </Text>
                </View>
              )}

              {/* Botón Ver Backups / Restaurar */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const router = require('expo-router').router;
                  router.push('/(tabs)/backups');
                }}
                className="rounded-xl p-4 items-center border-2 bg-background border-success active:opacity-80"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">📦</Text>
                  <Text className="text-base font-bold text-success">
                    {t('usb.view_backups')}
                  </Text>
                  <Text className="text-xl">›</Text>
                </View>
                <Text className="text-xs text-muted mt-1">
                  {t('usb.view_backups_desc')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Animación de Verificación de Compatibilidad */}
          {isCheckingCompatibility && (
            <CompatibilityCheckLoader 
              visible={isCheckingCompatibility} 
              chipset={device?.product || 'Unknown'}
            />
          )}

          {/* Perfil Detectado */}
          {status === 'connected' && detectedProfile && !isCheckingCompatibility && (
            <View className={`rounded-2xl p-6 border ${
              detectedProfile.compatible 
                ? 'bg-green-500/10 border-green-500' 
                : 'bg-blue-500/10 border-blue-500'
            }`}>
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-2xl">{detectedProfile.icon}</Text>
                <Text className="text-lg font-bold text-foreground">
                  {t('usb.detected_profile')}
                </Text>
              </View>
              
              <View className="gap-2 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('usb.adapter')}:</Text>
                  <Text className="text-sm text-foreground font-bold">
                    {detectedProfile.name}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('usb.manufacturer')}:</Text>
                  <Text className="text-sm text-foreground">
                    {detectedProfile.manufacturer}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('usb.chipset')}:</Text>
                  <Text className="text-sm text-foreground">
                    {detectedProfile.chipset}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('usb.mib2_compatible')}:</Text>
                  <Text className={`text-sm font-bold ${
                    detectedProfile.compatible ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {detectedProfile.compatible ? `✅ ${t('common.yes')}` : `❌ ${t('common.no')}`}
                  </Text>
                </View>
              </View>
              
              <View className="bg-background rounded-lg p-3">
                <Text className="text-xs text-muted">
                  {detectedProfile.notes}
                </Text>
              </View>
            </View>
          )}

          {/* Estadísticas de Conexión */}
          {status === 'connected' && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">
                {t('usb.statistics')}
              </Text>
              
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('usb.connection_time')}:</Text>
                  <Text className="text-sm text-foreground font-mono">
                    {uptime}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('usb.devices_detected')}:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {devices.length}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('usb.service_status')}:</Text>
                  <Text className="text-sm text-green-500 font-medium">
                    ✅ {t('usb.active')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Sugerencia de Spoofing */}
          {status === 'connected' && recommendedProfile && (
            <View className="bg-yellow-500/10 rounded-2xl p-6 border border-yellow-500">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-2xl">⚡</Text>
                <Text className="text-lg font-bold text-foreground">
                  {t('usb.recommended_spoofing')}
                </Text>
              </View>
              
              <View className="bg-background rounded-lg p-4 mb-4">
                <Text className="text-sm text-muted mb-2">
                  {t('usb.not_compatible_recommend')}
                </Text>
                <View className="gap-2 mt-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">{t('usb.target_profile')}:</Text>
                    <Text className="text-sm text-foreground font-bold">
                      {recommendedProfile.name}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">VID:PID:</Text>
                    <Text className="text-sm text-foreground font-mono">
                      {recommendedProfile.vendorId.toString(16).padStart(4, '0').toUpperCase()}:
                      {recommendedProfile.productId.toString(16).padStart(4, '0').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

            </View>
          )}

          {/* Lista de Dispositivos Detectados */}
          {status === 'detected' && devices.length > 0 && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">
                🔍 {t('usb.detected_devices')} ({devices.length})
              </Text>
              
              <View className="gap-3">
                {devices.map((dev, index) => (
                  <View key={dev.deviceId} className="bg-background rounded-lg p-4 border border-border">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm font-bold text-foreground">
                        {t('usb.device')} #{index + 1}
                      </Text>
                      <Text className="text-xs text-muted font-mono">
                        {usbService.formatVIDPID(dev.vendorId, dev.productId)}
                      </Text>
                    </View>
                    <Text className="text-xs text-muted">
                      {dev.product || dev.deviceName}
                    </Text>
                    {dev.chipset && (
                      <Text className="text-xs text-muted mt-1">
                        Chipset: {dev.chipset}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sin Dispositivos */}
          {status === 'disconnected' && (
            <View className="bg-surface rounded-2xl p-6 border border-border items-center">
              <Text className="text-6xl mb-4">🔌</Text>
              <Text className="text-lg font-bold text-foreground mb-2">
                {t('usb.no_devices')}
              </Text>
              <Text className="text-sm text-muted text-center mb-4">
                {t('usb.connect_adapter')}
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                className="bg-primary px-6 py-3 rounded-full"
                disabled={isScanning}
              >
                <Text className="text-background font-semibold">
                  {isScanning ? t('usb.scanning') : t('usb.scan_now')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Información de Ayuda */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">
                {t('usb.tips')}
              </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">
                • {t('usb.tip_1')}
              </Text>
              <Text className="text-sm text-muted">
                • {t('usb.tip_2')}
              </Text>
              <Text className="text-sm text-muted">
                • {t('usb.tip_3')}
              </Text>
              <Text className="text-sm text-muted">
                • {t('usb.tip_4')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
