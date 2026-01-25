import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { AnimatedTouchable } from "@/components/ui/animated-touchable";
import { FDroidCard } from "@/components/ui/fdroid-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedFadeIn } from "@/components/ui/animated-fade-in";
import { AnimatedCheckmark, AnimatedError } from "@/components/ui/animated-checkmark";
import { UsbStatusIndicator } from "@/components/usb-status-indicator";
import { haptics } from "@/lib/haptics-service";
import { useUsbStatus } from "@/lib/usb-status-context";
import { useTelnet } from "@/lib/telnet-provider";

import { quickScan, scanNetwork, parseSubnet, type ScanResult, type ScanProgress } from "@/lib/network-scanner";
import { detectToolbox, type ToolboxInfo } from "@/lib/toolbox-detector";
import { detectUSBEthernetAdapter, detectSubnet, validateAdapterConnectivity, type NetworkInterface } from "@/modules/network-info";
import { useTranslation } from "@/lib/language-context";

import { showAlert } from '@/lib/translated-alert';
import { mib2CompatibilityService, type CompatibilityStatus, type MIB2UnitInfo } from '@/lib/mib2-compatibility-service';
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
  const [mib2Compatibility, setMib2Compatibility] = useState<CompatibilityStatus>('not_connected');
  const [mib2UnitInfo, setMib2UnitInfo] = useState<MIB2UnitInfo | null>(null);
  
  // Estados para animaciones de conexión
  const [showConnectionSuccess, setShowConnectionSuccess] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

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
        t('home.adapter_required_title'),
        t('home.adapter_required_message'),
        [{ text: t('home.understood') }]
      );
      haptics.error();
      return;
    }

    haptics.tap();
    
    // Update config before connecting
    await updateConfig({
      host,
      port: parseInt(port, 10),
    });

    try {
      await connect();
      // Mostrar animación de conexión exitosa
      setConnectionMessage(t('home.connection_success') || 'Conectado');
      setShowConnectionSuccess(true);
      haptics.connection();
      // Auto-detect toolbox
      setTimeout(() => handleDetectToolbox(), 1000);
    } catch (error) {
      setConnectionMessage(t('home.connection_error') || 'Error de conexión');
      setShowConnectionError(true);
      haptics.error();
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
      
      // Check MIB2 compatibility based on detected toolbox info
      if (info) {
        const compatResult = await mib2CompatibilityService.checkCompatibility(
          undefined,
          info.version || undefined,
          undefined
        );
        setMib2Compatibility(compatResult.unitInfo.compatibilityStatus);
        setMib2UnitInfo(compatResult.unitInfo);
        
        // Show warning if not compatible
        if (!compatResult.canProceed && compatResult.blockingReason) {
          Alert.alert(
            t('home.compatibility_error_title'),
            t(compatResult.blockingReason),
            [{ text: t('home.understood') }]
          );
        } else if (compatResult.unitInfo.warnings.length > 0) {
          // Show warnings but allow to proceed
          const warningMessages = compatResult.unitInfo.warnings.map(w => t(w)).join('\n');
          Alert.alert(
            t('home.compatibility_warning_title'),
            warningMessages,
            [{ text: t('home.understood') }]
          );
        }
      }
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
        t('home.adapter_required_title'),
        t('home.adapter_required_message'),
        [{ text: t('home.understood') }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Validar conectividad REAL del adaptador
    const hasConnectivity = await validateAdapterConnectivity();
    if (!hasConnectivity) {
      Alert.alert(
        t('home.no_connectivity_title'),
        t('home.no_connectivity_message'),
        [{ text: t('home.understood') }]
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
          t('home.found_title'),
          t('home.found_message', { host: results[0].host }),
          [
            { text: t('home.cancel'), style: 'cancel' },
            {
              text: t('home.connect'),
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
        showAlert('alerts.multiples_dispositivos', t('alerts.multiples_dispositivos_encontrados', { count: results.length }));
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
        t('home.adapter_required_title'),
        t('home.adapter_required_message'),
        [{ text: t('home.understood') }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Validar conectividad REAL del adaptador
    const hasConnectivity = await validateAdapterConnectivity();
    if (!hasConnectivity) {
      Alert.alert(
        t('home.no_connectivity_title'),
        t('home.no_connectivity_message'),
        [{ text: t('home.understood') }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Alert.alert(
      t('home.full_scan_title'),
      t('home.full_scan_message'),
      [
        { text: t('home.cancel'), style: 'cancel' },
        {
          text: t('home.scan'),
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
                showAlert('alerts.escaneo_completo', t('alerts.escaneo_completo_dispositivos', { count: results.length }));
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
    if (isConnected) return t('home.connected');
    if (isConnecting) return t('home.connecting');
    return t('home.disconnected');
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View className="flex-1 gap-6">
          {/* Header - Premium Design */}
          <AnimatedFadeIn direction="fade" delay={0}>
            <View className="items-center gap-3 mb-2">
              <View className="bg-primary/10 px-4 py-1 rounded-full">
                <Text className="text-xs font-semibold text-primary uppercase tracking-wider">
                  MIB2 STD2 Technisat Preh
                </Text>
              </View>
              <Text className="text-3xl font-bold text-foreground tracking-tight">MIB2 Controller</Text>
              <Text className="text-sm text-muted text-center px-4">
                {t('home.subtitle')}
              </Text>
              <View className="bg-warning/10 px-3 py-1.5 rounded-lg mt-1">
                <Text className="text-xs text-warning text-center font-medium">
                  {t('home.compatibility_notice')}
                </Text>
              </View>
            </View>
          </AnimatedFadeIn>

          {/* USB Status Indicator - REAL TIME */}
          <AnimatedFadeIn direction="up" index={0} staggerDelay={80}>
          <UsbStatusIndicator 
            status={usbStatus} 
            deviceName={usbDevice?.product || usbDevice?.deviceName}
          />
          </AnimatedFadeIn>

          {/* Network Adapter Info - Premium Design */}
          {networkAdapter && (
            <AnimatedFadeIn direction="up" index={1} staggerDelay={80}>
            <View className="bg-surface rounded-2xl p-4 border border-success/20 shadow-sm">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="w-3 h-3 rounded-full bg-success" />
                <Text className="text-sm font-semibold text-foreground">{t('home.network_adapter_detected')}</Text>
              </View>
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">{t('home.interface')}</Text>
                  <Text className="text-xs text-foreground font-medium">{networkAdapter.name}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">{t('home.adapter_ip')}</Text>
                  <Text className="text-xs text-foreground font-medium">{networkAdapter.ipAddress}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted">{t('home.detected_subnet')}</Text>
                  <Text className="text-xs text-foreground font-medium">{detectedSubnet}.x</Text>
                </View>
              </View>
            </View>
            </AnimatedFadeIn>
          )}

          {/* Connection Status Card - Premium Design */}
          <AnimatedFadeIn direction="up" index={2} staggerDelay={80}>
          <View className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
            <View className="flex-row items-center gap-3 mb-4">
              <View className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
              <Text className="text-lg font-semibold text-foreground">{getStatusText()}</Text>
            </View>

            {isConnected && (
              <View className="gap-3">
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">{t('home.host')}</Text>
                    <Text className="text-sm text-foreground font-medium">{config.host}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">{t('home.port')}</Text>
                    <Text className="text-sm text-foreground font-medium">{config.port}</Text>
                  </View>
                  {Date.now() && (
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">{t('home.last_activity')}</Text>
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
                      <Text className="text-sm font-semibold text-foreground">{t('home.firmware_mib2')}</Text>
                      <View className={`px-2 py-1 rounded ${
                        toolboxInfo.firmwareCompatible ? 'bg-success/20' : 'bg-warning/20'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          toolboxInfo.firmwareCompatible ? 'text-success' : 'text-warning'
                        }`}>
                          {toolboxInfo.firmwareCompatible ? t('home.compatible') : t('home.telnet_closed')}
                        </Text>
                      </View>
                    </View>
                    {toolboxInfo.firmwareVersion && (
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-xs text-muted">{t('home.version')}</Text>
                        <Text className="text-xs text-foreground font-mono">{toolboxInfo.firmwareVersion}</Text>
                      </View>
                    )}
                    {toolboxInfo.hardwareVersion && (
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">{t('home.hardware')}</Text>
                        <Text className="text-xs text-foreground font-mono">{toolboxInfo.hardwareVersion}</Text>
                      </View>
                    )}
                    {!toolboxInfo.firmwareCompatible && (
                      <Text className="text-xs text-warning mt-2">
                        {t('home.telnet_closed_warning')}
                      </Text>
                    )}
                  </View>
                )}

                {/* Toolbox Info */}
                {toolboxInfo && (
                  <View className="bg-background rounded-lg p-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-semibold text-foreground">{t('home.mib2_toolbox')}</Text>
                      <View className={`px-2 py-1 rounded ${
                        toolboxInfo.installed ? 'bg-success/20' : 'bg-error/20'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          toolboxInfo.installed ? 'text-success' : 'text-error'
                        }`}>
                          {toolboxInfo.installed ? t('home.installed') : t('home.not_installed')}
                        </Text>
                      </View>
                    </View>
                    {toolboxInfo.installed && toolboxInfo.version && (
                      <Text className="text-xs text-muted mb-2">{t('home.version')} {toolboxInfo.version}</Text>
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
                        {t('home.toolbox_recommended')}
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
                      {t('home.detect_toolbox')}
                    </Text>
                  </TouchableOpacity>
                )}

                {detectingToolbox && (
                  <View className="bg-primary/10 rounded-lg p-2">
                    <Text className="text-primary text-sm text-center">{t('home.detecting_toolbox')}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          </AnimatedFadeIn>

          {/* Scan Buttons */}
          {!isConnected && !scanning && (
            <View className="flex-row gap-3">
              <AnimatedButton
                title={t('home.quick_search')}
                icon="🔍"
                variant="outline"
                onPress={handleQuickScan}
                fullWidth
                style={{ flex: 1 }}
              />
              <AnimatedButton
                title={t('home.full_scan_btn')}
                icon="🌐"
                variant="secondary"
                onPress={handleFullScan}
                fullWidth
                style={{ flex: 1 }}
              />
            </View>
          )}

          {/* Scan Progress */}
          {scanning && scanProgress && (
            <View className="bg-primary/10 border border-primary rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-primary">
                  {t('home.scanning_network')}
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
            <FDroidCard
              icon="📱"
              iconBgColor="#22C55E20"
              title={t('home.devices_found')}
              badge={`${foundDevices.length}`}
              badgeColor="success"
              variant="success"
            >
              <View className="gap-2 mt-3">
                {foundDevices.map((device) => (
                  <AnimatedTouchable
                    key={device.host}
                    onPress={() => handleSelectDevice(device)}
                    className="bg-background rounded-lg p-3 border border-border"
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
                  </AnimatedTouchable>
                ))}
              </View>
            </FDroidCard>
          )}

          {/* Connection Form */}
          {!isConnected && !scanning && (
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">{t('home.ip_address')}</Text>
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
                <Text className="text-sm font-medium text-foreground mb-2">{t('home.port_label')}</Text>
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
              <AnimatedButton
                title={t('home.disconnect_btn')}
                icon="🔌"
                variant="danger"
                size="lg"
                onPress={handleDisconnect}
                style={{ minWidth: 200, borderRadius: 50 }}
              />
            ) : (
              <AnimatedButton
                title={isConnecting ? undefined : t('home.connect_to_mib2')}
                icon={isConnecting ? undefined : "🚀"}
                variant="primary"
                size="lg"
                onPress={handleConnect}
                disabled={isConnecting}
                loading={isConnecting}
                style={{ minWidth: 200, borderRadius: 50 }}
              />
            )}
          </View>

          {/* Info Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-base font-semibold text-foreground mb-3">
              {t('home.connection_instructions')}
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted leading-relaxed">
                {t('home.instruction_1')}
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                {t('home.instruction_2')}
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                {t('home.instruction_3')}
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                {t('home.instruction_4')}
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                {t('home.instruction_5')}
              </Text>
            </View>
          </View>

          {/* Warning Card */}
          <View className="bg-warning/10 border border-warning rounded-2xl p-4">
            <Text className="text-sm text-warning font-medium mb-1">{t('home.warning_title')}</Text>
            <Text className="text-xs text-muted leading-relaxed">
              {t('home.warning_message')}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Animación de conexión exitosa */}
      <AnimatedCheckmark
        visible={showConnectionSuccess}
        message={connectionMessage}
        onComplete={() => setShowConnectionSuccess(false)}
        autoHide={true}
        autoHideDelay={2000}
      />
      
      {/* Animación de error de conexión */}
      <AnimatedError
        visible={showConnectionError}
        message={connectionMessage}
        onComplete={() => setShowConnectionError(false)}
        autoHide={true}
        autoHideDelay={2500}
      />
    </ScreenContainer>
  );
}
