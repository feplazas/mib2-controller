import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { UsbStatusIndicator } from "@/components/usb-status-indicator";
import { useUsbStatus } from "@/lib/usb-status-context";
import { useTelnet } from "@/lib/telnet-provider";

import { quickScan, scanNetwork, parseSubnet, type ScanResult, type ScanProgress } from "@/lib/network-scanner";
import { detectToolbox, type ToolboxInfo } from "@/lib/toolbox-detector";
import { detectUSBEthernetAdapter, detectSubnet, validateAdapterConnectivity, type NetworkInterface } from "@/modules/network-info";
import { useTranslation } from "@/lib/language-context";

import { showAlert } from '@/lib/translated-alert';
export default function HomeScreen() {
  const t = useTranslation();
  const { isConnected, isConnecting, config, updateConfig, connect, disconnect, sendCommand } = useTelnet();
  const { status: usbStatus, device: usbDevice } = useUsbStatus();
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port.toString());
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [foundDevices, setFoundDevices] = useState<ScanResult[]>([]);
  const [toolboxInfo, setToolboxInfo] = useState<ToolboxInfo | null>(null);
  const [detectingToolbox, setDetectingToolbox] = useState(false);
  const [networkAdapter, setNetworkAdapter] = useState<NetworkInterface | null>(null);
  const [detectedSubnet, setDetectedSubnet] = useState<string>('192.168.1');

  // Detectar adaptador de red automáticamente cuando USB se conecta
  useEffect(() => {
    const detectNetwork = async () => {
      if (usbStatus === 'connected') {
        try {
          const adapter = await detectUSBEthernetAdapter();
          setNetworkAdapter(adapter);
          
          if (adapter) {
            const subnet = await detectSubnet();
            setDetectedSubnet(subnet);
          }
        } catch (error) {
          console.error('Error detecting network adapter:', error);
        }
      } else {
        setNetworkAdapter(null);
        setDetectedSubnet('192.168.1');
      }
    };

    detectNetwork();
  }, [usbStatus]);

  const handleConnect = async () => {
    // Verificar que hay adaptador USB conectado
    if (usbStatus !== 'connected') {
      Alert.alert(
        'Adaptador USB Requerido',
        'Debes conectar un adaptador USB-Ethernet antes de conectarte a la MIB2.\n\n1. Conecta el adaptador USB-Ethernet al puerto USB de la unidad MIB2\n2. Conecta tu dispositivo Android a la misma red (WiFi o adaptador Ethernet)\n3. Ve a la pesta\u00f1a "USB" para verificar la conexi\u00f3n',
        [{ text: 'Entendido' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Update config before connecting
    await updateConfig({
      host,
      port: parseInt(port, 10),
    });

    try {
      await connect();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Auto-detect toolbox
      setTimeout(() => handleDetectToolbox(), 1000);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDetectToolbox = async () => {
    if (!isConnected) return;

    setDetectingToolbox(true);
    try {
      const info = await detectToolbox(async (cmd: string) => {
        sendCommand(cmd);
        return { output: '', success: true };
      });
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
    // Verificar que hay adaptador USB conectado
    if (usbStatus !== 'connected') {
      Alert.alert(
        'Adaptador USB Requerido',
        'Debes conectar un adaptador USB-Ethernet antes de escanear la red.\n\n1. Conecta el adaptador USB-Ethernet al puerto USB de la unidad MIB2\n2. Conecta tu dispositivo Android a la misma red (WiFi o adaptador Ethernet)\n3. Ve a la pestaña "USB" para verificar la conexión',
        [{ text: 'Entendido' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Validar conectividad REAL del adaptador
    const hasConnectivity = await validateAdapterConnectivity();
    if (!hasConnectivity) {
      Alert.alert(
        'Sin Conectividad',
        'El adaptador USB-Ethernet no tiene una IP válida asignada.\n\nVerifica que:\n1. El adaptador esté conectado correctamente\n2. La red esté configurada (DHCP o IP estática)\n3. El adaptador tenga acceso a la red MIB2',
        [{ text: 'Entendido' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

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
        showAlert('alerts.sin_resultados', 'alerts.no_se_encontraron_unidades_mib2_en_las_ips_comunes');
      } else if (results.length === 1) {
        // Auto-select and connect
        setHost(results[0].host);
        setPort(results[0].port.toString());
        await updateConfig({
          host: results[0].host,
          port: results[0].port,
        });
        Alert.alert(
          '¡Encontrado!',
          `Unidad MIB2 detectada en ${results[0].host}\n\n¿Conectar automáticamente?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Conectar',
              onPress: async () => {
                try {
                  await connect();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setTimeout(() => handleDetectToolbox(), 1000);
                } catch (error) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  showAlert('alerts.error', 'alerts.no_se_pudo_conectar_a_la_unidad_mib2');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Múltiples Dispositivos', `Se encontraron ${results.length} dispositivos. Selecciona uno de la lista.`);
      }
    } catch (error) {
      showAlert('alerts.error', 'alerts.error_al_escanear_la_red');
    } finally {
      setScanning(false);
    }
  };

  const handleFullScan = async () => {
    // Verificar que hay adaptador USB conectado
    if (usbStatus !== 'connected') {
      Alert.alert(
        'Adaptador USB Requerido',
        'Debes conectar un adaptador USB-Ethernet antes de escanear la red.\n\n1. Conecta el adaptador USB-Ethernet al puerto USB de la unidad MIB2\n2. Conecta tu dispositivo Android a la misma red (WiFi o adaptador Ethernet)\n3. Ve a la pestaña "USB" para verificar la conexión',
        [{ text: 'Entendido' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Validar conectividad REAL del adaptador
    const hasConnectivity = await validateAdapterConnectivity();
    if (!hasConnectivity) {
      Alert.alert(
        'Sin Conectividad',
        'El adaptador USB-Ethernet no tiene una IP válida asignada.\n\nVerifica que:\n1. El adaptador esté conectado correctamente\n2. La red esté configurada (DHCP o IP estática)\n3. El adaptador tenga acceso a la red MIB2',
        [{ text: 'Entendido' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Alert.alert(
      'Escaneo Completo',
      'Esto escaneará toda la subred (puede tardar varios minutos). ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Escanear',
          onPress: async () =>{
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
                showAlert('alerts.sin_resultados', 'alerts.no_se_encontraron_unidades_mib2_en_la_red');
              } else {
                Alert.alert('Escaneo Completo', `Se encontraron ${results.length} dispositivos`);
              }
            } catch (error) {
              showAlert('alerts.error', 'alerts.error_al_escanear_la_red');
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
    if (isConnected) return 'bg-success';
    if (isConnecting) return 'bg-warning';
    return 'bg-muted';
  };

  const getStatusText = () => {
    if (isConnected) return 'Conectado';
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
            deviceName={usbDevice?.product || usbDevice?.deviceName}
          />

          {/* Network Adapter Info */}
          {networkAdapter && (
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-3 h-3 rounded-full bg-success" />
                <Text className="text-sm font-semibold text-foreground">Adaptador de Red Detectado</Text>
              </View>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Interfaz:</Text>
                  <Text className="text-xs text-foreground font-medium">{networkAdapter.name}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">IP del Adaptador:</Text>
                  <Text className="text-xs text-foreground font-medium">{networkAdapter.ipAddress}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">Subred Detectada:</Text>
                  <Text className="text-xs text-foreground font-medium">{detectedSubnet}.x</Text>
                </View>
              </View>
            </View>
          )}

          {/* Connection Status Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center gap-3 mb-4">
              <View className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
              <Text className="text-lg font-semibold text-foreground">{getStatusText()}</Text>
            </View>

            {isConnected && (
              <View className="gap-3">
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Host:</Text>
                    <Text className="text-sm text-foreground font-medium">{config.host}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Puerto:</Text>
                    <Text className="text-sm text-foreground font-medium">{config.port}</Text>
                  </View>
                  {Date.now() && (
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Última actividad:</Text>
                      <Text className="text-sm text-foreground font-medium">
                        {new Date(Date.now()).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Firmware Info - REAL */}
                {toolboxInfo && (toolboxInfo.firmwareVersion || toolboxInfo.hardwareVersion) && (
                  <View className="bg-background rounded-lg p-3 mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-semibold text-foreground">Firmware MIB2</Text>
                      <View className={`px-2 py-1 rounded ${
                        toolboxInfo.firmwareCompatible ? 'bg-success/20' : 'bg-warning/20'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          toolboxInfo.firmwareCompatible ? 'text-success' : 'text-warning'
                        }`}>
                          {toolboxInfo.firmwareCompatible ? '✓ Compatible' : '⚠️ Telnet Cerrado'}
                        </Text>
                      </View>
                    </View>
                    {toolboxInfo.firmwareVersion && (
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-xs text-muted">Versión:</Text>
                        <Text className="text-xs text-foreground font-mono">{toolboxInfo.firmwareVersion}</Text>
                      </View>
                    )}
                    {toolboxInfo.hardwareVersion && (
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Hardware:</Text>
                        <Text className="text-xs text-foreground font-mono">{toolboxInfo.hardwareVersion}</Text>
                      </View>
                    )}
                    {!toolboxInfo.firmwareCompatible && (
                      <Text className="text-xs text-warning mt-2">
                        ⚠️ El puerto Telnet está cerrado. Se requiere acceso directo a eMMC.
                      </Text>
                    )}
                  </View>
                )}

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
          {!isConnected && !scanning && (
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
          {foundDevices.length > 0 && !isConnected && (
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
          {!isConnected && !scanning && (
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
            {isConnected ? (
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
                5. Presiona &quot;Conectar a MIB2&quot; para establecer la conexión
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
