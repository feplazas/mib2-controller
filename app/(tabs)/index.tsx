import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { UsbStatusIndicator } from "@/components/usb-status-indicator";
import { useUsbStatus } from "@/lib/usb-status-context";
import { useTelnet } from "@/lib/telnet-provider";
import { parseFirmwareVersion } from "@/lib/telnet-client";
import { quickScan, scanNetwork, parseSubnet, type ScanResult, type ScanProgress } from "@/lib/network-scanner";
import { detectToolbox, type ToolboxInfo } from "@/lib/toolbox-detector";

export default function HomeScreen() {
  const { connectionStatus, isConnecting, config, updateConfig, connect, disconnect, executeCommand } = useTelnet();
  const { status: usbStatus, device: usbDevice } = useUsbStatus();
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port.toString());
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [foundDevices, setFoundDevices] = useState<ScanResult[]>([]);
  const [toolboxInfo, setToolboxInfo] = useState<ToolboxInfo | null>(null);
  const [detectingToolbox, setDetectingToolbox] = useState(false);

  const handleConnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Update config before connecting
    await updateConfig({
      host,
      port: parseInt(port, 10),
    });

    const response = await connect();
    
    if (response.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Auto-detect toolbox
      setTimeout(() => handleDetectToolbox(), 1000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDetectToolbox = async () => {
    if (!connectionStatus.connected) return;

    setDetectingToolbox(true);
    try {
      const info = await detectToolbox(executeCommand);
      setToolboxInfo(info);
    } catch (error) {
      console.error('Error detecting toolbox:', error);
    } finally {
      setDetectingToolbox(false);
    }
  };

  const handleDisconnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await disconnect();
  };

  const handleQuickScan = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanning(true);
    setFoundDevices([]);

    try {
      const results = await quickScan((progress) => {
        setScanProgress(progress);
      });

      setFoundDevices(results);
      setScanProgress(null);

      if (results.length === 0) {
        Alert.alert('Sin Resultados', 'No se encontraron unidades MIB2 en las IPs comunes');
      } else if (results.length === 1) {
        // Auto-select the only found device
        setHost(results[0].host);
        setPort(results[0].port.toString());
        Alert.alert('¡Encontrado!', `Unidad MIB2 detectada en ${results[0].host}`);
      } else {
        Alert.alert('Múltiples Dispositivos', `Se encontraron ${results.length} dispositivos. Selecciona uno de la lista.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al escanear la red');
    } finally {
      setScanning(false);
    }
  };

  const handleFullScan = async () => {
    Alert.alert(
      'Escaneo Completo',
      'Esto escaneará toda la subred (puede tardar varios minutos). ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Escanear',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setScanning(true);
            setFoundDevices([]);

            try {
              const subnet = parseSubnet(host);
              const results = await scanNetwork(subnet, 1, 255, 23, (progress) => {
                setScanProgress(progress);
              });

              setFoundDevices(results);
              setScanProgress(null);

              if (results.length === 0) {
                Alert.alert('Sin Resultados', 'No se encontraron unidades MIB2 en la red');
              } else {
                Alert.alert('Escaneo Completo', `Se encontraron ${results.length} dispositivos`);
              }
            } catch (error) {
              Alert.alert('Error', 'Error al escanear la red');
            } finally {
              setScanning(false);
            }
          },
        },
      ]
    );
  };

  const handleSelectDevice = (device: ScanResult) => {
    setHost(device.host);
    setPort(device.port.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getStatusColor = () => {
    if (connectionStatus.connected) return 'bg-success';
    if (isConnecting) return 'bg-warning';
    return 'bg-muted';
  };

  const getStatusText = () => {
    if (connectionStatus.connected) return 'Conectado';
    if (isConnecting) return 'Conectando...';
    return 'Desconectado';
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">MIB2 Controller</Text>
            <Text className="text-sm text-muted text-center">
              Control remoto para unidades MIB2 STD2 Technisat Preh
            </Text>
          </View>

          {/* USB Status Indicator - REAL TIME */}
          <UsbStatusIndicator 
            status={usbStatus} 
            deviceName={usbDevice?.productName || usbDevice?.deviceName}
          />

          {/* Connection Status Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center gap-3 mb-4">
              <View className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
              <Text className="text-lg font-semibold text-foreground">{getStatusText()}</Text>
            </View>

            {connectionStatus.connected && (
              <View className="gap-3">
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Host:</Text>
                    <Text className="text-sm text-foreground font-medium">{connectionStatus.host}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Puerto:</Text>
                    <Text className="text-sm text-foreground font-medium">{connectionStatus.port}</Text>
                  </View>
                  {connectionStatus.lastActivity && (
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Última actividad:</Text>
                      <Text className="text-sm text-foreground font-medium">
                        {new Date(connectionStatus.lastActivity).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Toolbox Info */}
                {toolboxInfo && (
                  <View className="bg-background rounded-lg p-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-semibold text-foreground">MIB2 Toolbox</Text>
                      <View className={`px-2 py-1 rounded ${
                        toolboxInfo.installed ? 'bg-success/20' : 'bg-error/20'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          toolboxInfo.installed ? 'text-success' : 'text-error'
                        }`}>
                          {toolboxInfo.installed ? '✓ Instalado' : '✗ No Instalado'}
                        </Text>
                      </View>
                    </View>
                    {toolboxInfo.installed && toolboxInfo.version && (
                      <Text className="text-xs text-muted mb-2">Versión: {toolboxInfo.version}</Text>
                    )}
                    {toolboxInfo.installed && toolboxInfo.services && (
                      <View className="flex-row gap-2 flex-wrap">
                        <View className={`px-2 py-1 rounded ${
                          toolboxInfo.services.telnet ? 'bg-success/10' : 'bg-muted/10'
                        }`}>
                          <Text className={`text-xs ${
                            toolboxInfo.services.telnet ? 'text-success' : 'text-muted'
                          }`}>
                            Telnet {toolboxInfo.services.telnet ? '✓' : '✗'}
                          </Text>
                        </View>
                        <View className={`px-2 py-1 rounded ${
                          toolboxInfo.services.ftp ? 'bg-success/10' : 'bg-muted/10'
                        }`}>
                          <Text className={`text-xs ${
                            toolboxInfo.services.ftp ? 'text-success' : 'text-muted'
                          }`}>
                            FTP {toolboxInfo.services.ftp ? '✓' : '✗'}
                          </Text>
                        </View>
                        <View className={`px-2 py-1 rounded ${
                          toolboxInfo.services.ssh ? 'bg-success/10' : 'bg-muted/10'
                        }`}>
                          <Text className={`text-xs ${
                            toolboxInfo.services.ssh ? 'text-success' : 'text-muted'
                          }`}>
                            SSH {toolboxInfo.services.ssh ? '✓' : '✗'}
                          </Text>
                        </View>
                      </View>
                    )}
                    {!toolboxInfo.installed && (
                      <Text className="text-xs text-error mt-1">
                        ⚠️ Se recomienda instalar MIB2 Toolbox
                      </Text>
                    )}
                  </View>
                )}

                {!toolboxInfo && !detectingToolbox && (
                  <TouchableOpacity
                    onPress={handleDetectToolbox}
                    className="bg-primary/20 border border-primary px-4 py-2 rounded-lg active:opacity-80"
                  >
                    <Text className="text-primary font-semibold text-center text-sm">
                      🔍 Detectar MIB2 Toolbox
                    </Text>
                  </TouchableOpacity>
                )}

                {detectingToolbox && (
                  <View className="bg-primary/10 rounded-lg p-2">
                    <Text className="text-primary text-sm text-center">Detectando Toolbox...</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Scan Buttons */}
          {!connectionStatus.connected && !scanning && (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleQuickScan}
                className="flex-1 bg-primary/20 border border-primary px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-primary font-semibold text-center text-sm">
                  🔍 Búsqueda Rápida
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFullScan}
                className="flex-1 bg-muted/20 border border-border px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-foreground font-semibold text-center text-sm">
                  🌐 Escaneo Completo
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Scan Progress */}
          {scanning && scanProgress && (
            <View className="bg-primary/10 border border-primary rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-primary">
                  Escaneando red...
                </Text>
                <Text className="text-sm text-primary font-mono">
                  {scanProgress.percentage}%
                </Text>
              </View>
              <View className="bg-background rounded-full h-2 mb-2 overflow-hidden">
                <View
                  className="bg-primary h-full"
                  style={{ width: `${scanProgress.percentage}%` }}
                />
              </View>
              <Text className="text-xs text-muted">
                {scanProgress.currentHost} ({scanProgress.current}/{scanProgress.total})
              </Text>
            </View>
          )}

          {/* Found Devices */}
          {foundDevices.length > 0 && !connectionStatus.connected && (
            <View className="bg-success/10 border border-success rounded-xl p-4">
              <Text className="text-sm font-semibold text-success mb-3">
                ✓ Dispositivos Encontrados ({foundDevices.length})
              </Text>
              <View className="gap-2">
                {foundDevices.map((device) => (
                  <TouchableOpacity
                    key={device.host}
                    onPress={() => handleSelectDevice(device)}
                    className="bg-background rounded-lg p-3 border border-border active:opacity-70"
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-sm font-semibold text-foreground">
                          {device.host}:{device.port}
                        </Text>
                        {device.deviceInfo && (
                          <Text className="text-xs text-muted mt-1">
                            {device.deviceInfo}
                          </Text>
                        )}
                      </View>
                      {device.responseTime && (
                        <Text className="text-xs text-muted">
                          {device.responseTime}ms
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Connection Form */}
          {!connectionStatus.connected && !scanning && (
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Dirección IP</Text>
                <TextInput
                  value={host}
                  onChangeText={setHost}
                  placeholder="192.168.1.4"
                  keyboardType="numeric"
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  editable={!isConnecting}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Puerto</Text>
                <TextInput
                  value={port}
                  onChangeText={setPort}
                  placeholder="23"
                  keyboardType="numeric"
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  editable={!isConnecting}
                />
              </View>
            </View>
          )}

          {/* Action Button */}
          <View className="items-center">
            {connectionStatus.connected ? (
              <TouchableOpacity
                onPress={handleDisconnect}
                className="bg-error px-8 py-4 rounded-full active:opacity-80 min-w-[200px]"
              >
                <Text className="text-white font-semibold text-center text-base">
                  Desconectar
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleConnect}
                disabled={isConnecting}
                className="bg-primary px-8 py-4 rounded-full active:opacity-80 min-w-[200px]"
                style={{ opacity: isConnecting ? 0.6 : 1 }}
              >
                {isConnecting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center text-base">
                    Conectar a MIB2
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Info Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-base font-semibold text-foreground mb-3">
              Instrucciones de Conexión
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted leading-relaxed">
                1. Conecta el adaptador USB-Ethernet al puerto USB de la unidad MIB2
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                2. Conecta tu dispositivo Android a la misma red (WiFi o adaptador Ethernet)
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                3. Verifica que la unidad MIB2 tenga Telnet habilitado (root/root)
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                4. Ingresa la dirección IP de la unidad (por defecto: 192.168.1.4)
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                5. Presiona "Conectar a MIB2" para establecer la conexión
              </Text>
            </View>
          </View>

          {/* Warning Card */}
          <View className="bg-warning/10 border border-warning rounded-2xl p-4">
            <Text className="text-sm text-warning font-medium mb-1">⚠️ Advertencia</Text>
            <Text className="text-xs text-muted leading-relaxed">
              Esta aplicación permite ejecutar comandos directamente en la unidad MIB2. 
              Usa con precaución y solo si sabes lo que estás haciendo. Los comandos 
              incorrectos pueden dañar el sistema.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
