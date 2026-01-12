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

export default function UsbStatusScreen() {
  const { status, device, devices, isScanning, scanDevices, detectedProfile, recommendedProfile } = useUsbStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const [uptime, setUptime] = useState('00:00:00');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

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
      Alert.alert('Error', 'No hay dispositivo USB conectado');
      return;
    }

    Alert.alert(
      '💾 Crear Backup Manual',
      'Se creará una copia de seguridad completa de la EEPROM del adaptador USB.\n\nEsto es recomendable antes de realizar cualquier modificación.\n\n¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear Backup',
          onPress: async () => {
            setIsCreatingBackup(true);
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const backup = await backupService.createBackup(device);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              Alert.alert(
                '✅ Backup Creado',
                `Backup guardado exitosamente:\n\n` +
                `💾 Archivo: backup_${device.vendorId}_${device.productId}_${Date.now()}.bin\n` +
                `📅 Fecha: ${new Date(backup.timestamp).toLocaleString('es-ES')}\n` +
                `📊 Tamaño: ${backup.size} bytes\n\n` +
                `El backup se guardó en la memoria del dispositivo.`
              );
            } catch (error: any) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                '❌ Error al Crear Backup',
                error.message || 'No se pudo crear el backup. Verifica que el dispositivo esté conectado correctamente.'
              );
            } finally {
              setIsCreatingBackup(false);
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
        return 'Conectado';
      case 'detected':
        return 'Detectado';
      default:
        return 'Desconectado';
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
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-4">
          {/* Indicador de Escaneo */}
          <ScanningIndicator isScanning={isScanning} />
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-foreground mb-2">
              Estado de Conexión USB
            </Text>
            <Text className="text-sm text-muted text-center">
              Información en tiempo real de tu dispositivo USB
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
                📱 Información del Dispositivo
              </Text>
              
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Nombre:</Text>
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
                    <Text className="text-sm text-muted">Fabricante:</Text>
                    <Text className="text-sm text-foreground">
                      {device.manufacturer}
                    </Text>
                  </View>
                )}

                {device.product && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Producto:</Text>
                    <Text className="text-sm text-foreground">
                      {device.product}
                    </Text>
                  </View>
                )}

                {device.serialNumber && device.serialNumber !== 'Unknown' && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Serial:</Text>
                    <Text className="text-sm text-foreground font-mono">
                      {device.serialNumber}
                    </Text>
                  </View>
                )}

                {device.chipset && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Chipset:</Text>
                    <Text className="text-sm text-foreground font-medium">
                      {device.chipset}
                    </Text>
                  </View>
                )}

              </View>
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
                          Ir a Auto Spoof
                        </Text>
                        <Text className="text-xl">›</Text>
                      </View>
                      <Text className="text-xs text-background/80 mt-1">
                        {compat === 'confirmed' 
                          ? 'Chipset confirmado compatible' 
                          : 'Chipset experimental - usar con precaución'}
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
                    {isCreatingBackup ? 'Creando Backup...' : 'Crear Backup Manual'}
                  </Text>
                </View>
                <Text className="text-xs text-muted mt-1">
                  Copia de seguridad preventiva de EEPROM
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Perfil Detectado */}
          {status === 'connected' && detectedProfile && (
            <View className={`rounded-2xl p-6 border ${
              detectedProfile.compatible 
                ? 'bg-green-500/10 border-green-500' 
                : 'bg-blue-500/10 border-blue-500'
            }`}>
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-2xl">{detectedProfile.icon}</Text>
                <Text className="text-lg font-bold text-foreground">
                  Perfil Detectado
                </Text>
              </View>
              
              <View className="gap-2 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Adaptador:</Text>
                  <Text className="text-sm text-foreground font-bold">
                    {detectedProfile.name}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Fabricante:</Text>
                  <Text className="text-sm text-foreground">
                    {detectedProfile.manufacturer}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Chipset:</Text>
                  <Text className="text-sm text-foreground">
                    {detectedProfile.chipset}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Compatible MIB2:</Text>
                  <Text className={`text-sm font-bold ${
                    detectedProfile.compatible ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {detectedProfile.compatible ? '✅ Sí' : '❌ No'}
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
                📊 Estadísticas
              </Text>
              
              <View className="gap-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Tiempo Conectado:</Text>
                  <Text className="text-sm text-foreground font-mono">
                    {uptime}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Dispositivos Detectados:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {devices.length}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Estado del Servicio:</Text>
                  <Text className="text-sm text-green-500 font-medium">
                    ✅ Activo
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
                  Spoofing Recomendado
                </Text>
              </View>
              
              <View className="bg-background rounded-lg p-4 mb-4">
                <Text className="text-sm text-muted mb-2">
                  Este dispositivo no es compatible con MIB2. Se recomienda aplicar el siguiente perfil:
                </Text>
                <View className="gap-2 mt-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Perfil Objetivo:</Text>
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
                🔍 Dispositivos Detectados ({devices.length})
              </Text>
              
              <View className="gap-3">
                {devices.map((dev, index) => (
                  <View key={dev.deviceId} className="bg-background rounded-lg p-4 border border-border">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm font-bold text-foreground">
                        Dispositivo #{index + 1}
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
                No hay dispositivos conectados
              </Text>
              <Text className="text-sm text-muted text-center mb-4">
                Conecta un adaptador USB-Ethernet compatible para comenzar
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                className="bg-primary px-6 py-3 rounded-full"
                disabled={isScanning}
              >
                <Text className="text-background font-semibold">
                  {isScanning ? 'Escaneando...' : 'Escanear Ahora'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Información de Ayuda */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              💡 Consejos
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">
                • Conecta el adaptador USB con un cable OTG
              </Text>
              <Text className="text-sm text-muted">
                • Asegúrate de que el adaptador tenga alimentación
              </Text>
              <Text className="text-sm text-muted">
                • Los adaptadores ASIX son los más compatibles
              </Text>
              <Text className="text-sm text-muted">
                • Desliza hacia abajo para actualizar el estado
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
