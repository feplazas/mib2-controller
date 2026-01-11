import { ScrollView, Text, View, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useUsbStatus } from '@/lib/usb-status-context';
import { usbService } from '@/lib/usb-service';

export default function UsbStatusScreen() {
  const { status, device, devices, isScanning, scanDevices, detectedProfile, recommendedProfile } = useUsbStatus();
  const [refreshing, setRefreshing] = useState(false);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const [uptime, setUptime] = useState('00:00:00');

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

                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Compatible:</Text>
                  <Text className={`text-sm font-medium ${usbService.isCompatibleForSpoofing(device) ? 'text-green-500' : 'text-red-500'}`}>
                    {usbService.isCompatibleForSpoofing(device) ? '✅ Sí' : '❌ No'}
                  </Text>
                </View>
              </View>
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
              
              <TouchableOpacity
                onPress={() => {
                  // Navegar a Perfiles VID/PID
                  const router = require('expo-router').router;
                  router.push('/(tabs)/vidpid-profiles');
                }}
                className="bg-primary rounded-xl p-3 items-center"
              >
                <Text className="text-sm font-bold text-background">
                  🚀 Ir a Perfiles VID/PID
                </Text>
              </TouchableOpacity>
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
