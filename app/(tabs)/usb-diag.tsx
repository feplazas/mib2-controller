import { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { usbService, UsbDevice } from '@/lib/usb-service';

/**
 * Pantalla de Diagnóstico USB
 * Muestra todos los dispositivos USB conectados con información detallada
 * Útil para identificar adaptadores y depurar problemas de detección
 */
export default function UsbDiagScreen() {
  const [devices, setDevices] = useState<UsbDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<UsbDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Escanear dispositivos al montar
    scanDevices();
  }, []);

  const scanDevices = async () => {
    setLoading(true);
    try {
      await usbService.initialize();
      const foundDevices = await usbService.listDevices();
      setDevices(foundDevices);
      
      if (foundDevices.length === 0) {
        Alert.alert(
          'No se encontraron dispositivos USB',
          'Asegúrate de que:\n\n' +
          '1. El adaptador USB está conectado al teléfono\n' +
          '2. Estás usando un cable OTG si es necesario\n' +
          '3. El adaptador tiene alimentación (algunos requieren hub con alimentación)\n' +
          '4. Los permisos USB están habilitados en la app',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[UsbDiag] Error scanning devices:', error);
      Alert.alert('Error', `No se pudieron escanear dispositivos USB: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const connectToDevice = async (device: UsbDevice) => {
    try {
      setLoading(true);
      
      // Solicitar permiso
      const hasPermission = await usbService.hasPermission(device);
      if (!hasPermission) {
        const granted = await usbService.requestPermission(device);
        if (!granted) {
          Alert.alert('Permiso Denegado', 'No se puede acceder al dispositivo sin permiso.');
          return;
        }
      }

      // Abrir conexión
      const opened = await usbService.openDevice(device);
      if (opened) {
        setSelectedDevice(device);
        setIsConnected(true);
        Alert.alert('Conectado', `Conexión establecida con ${device.deviceName}`);
      } else {
        Alert.alert('Error', 'No se pudo abrir el dispositivo.');
      }
    } catch (error) {
      console.error('[UsbDiag] Error connecting to device:', error);
      Alert.alert('Error', `No se pudo conectar: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = async () => {
    try {
      await usbService.closeDevice();
      setSelectedDevice(null);
      setIsConnected(false);
      Alert.alert('Desconectado', 'Dispositivo desconectado correctamente.');
    } catch (error) {
      console.error('[UsbDiag] Error disconnecting:', error);
      Alert.alert('Error', `No se pudo desconectar: ${error}`);
    }
  };

  const testEepromRead = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Primero debes conectarte a un dispositivo.');
      return;
    }

    try {
      setLoading(true);
      
      // Intentar leer los primeros 16 bytes de EEPROM
      const data = await usbService.readEeprom(0x00, 16);
      
      const hexString = data.map(b => b.toString(16).padStart(2, '0')).join(' ');
      
      Alert.alert(
        'Lectura de EEPROM Exitosa',
        `Primeros 16 bytes:\n\n${hexString}\n\nEsto confirma que el control transfer funciona correctamente.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[UsbDiag] Error reading EEPROM:', error);
      Alert.alert('Error', `No se pudo leer EEPROM: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceTypeLabel = (device: UsbDevice): string => {
    // Identificar tipo de dispositivo por VID/PID
    if (device.vendorId === 0x0B95) {
      if (device.productId === 0x7720) return 'ASIX AX88772';
      if (device.productId === 0x772A) return 'ASIX AX88772A';
      if (device.productId === 0x772B) return 'ASIX AX88772B';
      return 'ASIX (Desconocido)';
    }
    if (device.vendorId === 0x2001) {
      if (device.productId === 0x3C05) return 'D-Link DUB-E100 (Rev B1)';
      if (device.productId === 0x1A02) return 'D-Link DUB-E100 (Rev C1)';
      return 'D-Link (Desconocido)';
    }
    return 'Dispositivo USB Genérico';
  };

  const getCompatibilityLabel = (device: UsbDevice): { label: string; color: string } => {
    // ASIX AX88772/A/B son compatibles para spoofing
    if (device.vendorId === 0x0B95 && 
        (device.productId === 0x7720 || device.productId === 0x772A || device.productId === 0x772B)) {
      return { label: 'Compatible para Spoofing', color: '#22C55E' };
    }
    // D-Link ya está spoofed o es el objetivo
    if (device.vendorId === 0x2001) {
      return { label: 'Ya es D-Link (objetivo)', color: '#0a7ea4' };
    }
    return { label: 'No compatible', color: '#EF4444' };
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground mb-2">
              Diagnóstico USB
            </Text>
            <Text className="text-sm text-muted">
              Detecta y analiza dispositivos USB conectados al teléfono
            </Text>
          </View>

          {/* Botón de escaneo */}
          <TouchableOpacity
            onPress={scanDevices}
            disabled={loading}
            className="bg-primary px-6 py-4 rounded-xl active:opacity-80"
          >
            {loading ? (
              <View className="flex-row items-center justify-center gap-2">
                <ActivityIndicator color="#fff" />
                <Text className="text-white font-semibold text-center">
                  Escaneando...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-center text-base">
                🔍 Escanear Dispositivos USB
              </Text>
            )}
          </TouchableOpacity>

          {/* Estado de conexión */}
          {isConnected && selectedDevice && (
            <View className="bg-success/10 border border-success rounded-xl p-4">
              <Text className="text-success font-semibold mb-1">
                ✓ Conectado a {selectedDevice.deviceName}
              </Text>
              <Text className="text-muted text-sm">
                VID: 0x{selectedDevice.vendorId.toString(16).padStart(4, '0')} | 
                PID: 0x{selectedDevice.productId.toString(16).padStart(4, '0')}
              </Text>
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={testEepromRead}
                  disabled={loading}
                  className="flex-1 bg-primary px-4 py-2 rounded-lg active:opacity-80"
                >
                  <Text className="text-white font-semibold text-center text-sm">
                    Test EEPROM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={disconnectDevice}
                  className="flex-1 bg-error px-4 py-2 rounded-lg active:opacity-80"
                >
                  <Text className="text-white font-semibold text-center text-sm">
                    Desconectar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Lista de dispositivos */}
          {devices.length > 0 ? (
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">
                Dispositivos Encontrados ({devices.length})
              </Text>
              {devices.map((device, index) => {
                const compatibility = getCompatibilityLabel(device);
                const isSelected = selectedDevice?.deviceId === device.deviceId;
                
                return (
                  <View
                    key={`${device.deviceId}-${index}`}
                    className={`bg-surface border rounded-xl p-4 ${
                      isSelected ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground mb-1">
                          {device.deviceName}
                        </Text>
                        <Text className="text-sm text-muted">
                          {getDeviceTypeLabel(device)}
                        </Text>
                      </View>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: compatibility.color + '20' }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: compatibility.color }}
                        >
                          {compatibility.label}
                        </Text>
                      </View>
                    </View>

                    {/* Información técnica */}
                    <View className="bg-background rounded-lg p-3 mb-3 gap-1">
                      <View className="flex-row">
                        <Text className="text-xs text-muted w-32">Vendor ID:</Text>
                        <Text className="text-xs text-foreground font-mono">
                          0x{device.vendorId.toString(16).padStart(4, '0').toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text className="text-xs text-muted w-32">Product ID:</Text>
                        <Text className="text-xs text-foreground font-mono">
                          0x{device.productId.toString(16).padStart(4, '0').toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text className="text-xs text-muted w-32">Device Class:</Text>
                        <Text className="text-xs text-foreground font-mono">
                          {device.deviceClass}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <Text className="text-xs text-muted w-32">Interfaces:</Text>
                        <Text className="text-xs text-foreground font-mono">
                          {device.interfaceCount}
                        </Text>
                      </View>
                      {device.manufacturerName && (
                        <View className="flex-row">
                          <Text className="text-xs text-muted w-32">Fabricante:</Text>
                          <Text className="text-xs text-foreground">
                            {device.manufacturerName}
                          </Text>
                        </View>
                      )}
                      {device.productName && (
                        <View className="flex-row">
                          <Text className="text-xs text-muted w-32">Producto:</Text>
                          <Text className="text-xs text-foreground">
                            {device.productName}
                          </Text>
                        </View>
                      )}
                      {device.serialNumber && (
                        <View className="flex-row">
                          <Text className="text-xs text-muted w-32">Serial:</Text>
                          <Text className="text-xs text-foreground font-mono">
                            {device.serialNumber}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Botón de conexión */}
                    {!isSelected && (
                      <TouchableOpacity
                        onPress={() => connectToDevice(device)}
                        disabled={loading || isConnected}
                        className="bg-primary px-4 py-3 rounded-lg active:opacity-80"
                      >
                        <Text className="text-white font-semibold text-center">
                          Conectar a este dispositivo
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ) : !loading ? (
            <View className="bg-surface border border-border rounded-xl p-6 items-center">
              <Text className="text-4xl mb-3">🔌</Text>
              <Text className="text-base font-semibold text-foreground mb-2 text-center">
                No se encontraron dispositivos USB
              </Text>
              <Text className="text-sm text-muted text-center">
                Conecta un adaptador USB-Ethernet y presiona "Escanear Dispositivos USB"
              </Text>
            </View>
          ) : null}

          {/* Información de ayuda */}
          <View className="bg-surface border border-border rounded-xl p-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              💡 Consejos de Diagnóstico
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              • Si no aparecen dispositivos, verifica el cable OTG{'\n'}
              • Algunos adaptadores requieren hub USB con alimentación{'\n'}
              • Los adaptadores ASIX AX88772/A/B son compatibles para spoofing{'\n'}
              • El test de EEPROM confirma que el control transfer funciona{'\n'}
              • VID 0x0B95 = ASIX, VID 0x2001 = D-Link
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
