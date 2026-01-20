import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Switch } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";

import { useUsbStatus } from "@/lib/usb-status-context";
import { usbService } from "@/lib/usb-service";
import * as Clipboard from 'expo-clipboard';

import { useTranslation, useLanguage, LanguageOption } from "@/lib/language-context";
import { isSoundEnabled, setSoundEnabled } from "@/lib/tab-sound-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

import { showAlert } from '@/lib/translated-alert';
export default function SettingsScreen() {
  const t = useTranslation();
  const { config, updateConfig, clearMessages } = useTelnet();

  // Language is now automatically detected from system locale
  
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port.toString());
  const [username, setUsername] = useState(config.username);
  const [password, setPassword] = useState(config.password);


  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const { selectedLanguage, setLanguage: setAppLanguage } = useLanguage();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { status, device, devices } = useUsbStatus();
  const [tabSoundEnabled, setTabSoundEnabled] = useState(isSoundEnabled());

  // Cargar preferencia de sonido al iniciar
  useEffect(() => {
    const loadSoundPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem('tabSoundEnabled');
        if (stored !== null) {
          const enabled = stored === 'true';
          setTabSoundEnabled(enabled);
          setSoundEnabled(enabled);
        }
      } catch (error) {
        console.warn('Error loading sound preference:', error);
      }
    };
    loadSoundPreference();
  }, []);

  // Handler para toggle de sonido
  const handleToggleTabSound = async (enabled: boolean) => {
    setTabSoundEnabled(enabled);
    setSoundEnabled(enabled);
    try {
      await AsyncStorage.setItem('tabSoundEnabled', enabled.toString());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Error saving sound preference:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateConfig({
        host,
        port: parseInt(port, 10),
        username,
        password,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert('alerts.éxito', 'alerts.configuración_guardada_correctamente');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('alerts.error', 'alerts.no_se_pudo_guardar_la_configuración');
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      t('settings.reset_values'),
      t('settings.reset_values_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.reset'),
          style: 'destructive',
          onPress: () => {
            setHost('192.168.1.4');
            setPort('23');
            setUsername('root');
            setPassword('root');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };











  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground">{t('settings.title')}</Text>
            <Text className="text-sm text-muted mt-1">
              {t('settings.subtitle')}
            </Text>
          </View>


          {/* Language Section */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-semibold text-foreground">
                  {t('settings.language')}
                </Text>
                <Text className="text-xs text-muted mt-1">
                  {t('settings.language_description')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowLanguageSelector(true);
                }}
                className="bg-primary/20 border border-primary px-4 py-2 rounded-xl active:opacity-80"
              >
                <Text className="text-primary font-semibold">
                  {selectedLanguage === 'auto' ? t('settings.language_auto') : 
                   selectedLanguage === 'es' ? 'Español' :
                   selectedLanguage === 'en' ? 'English' : 'Deutsch'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sound Settings Section */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-semibold text-foreground">
                  🔊 {t('settings.tab_sound')}
                </Text>
                <Text className="text-xs text-muted mt-1">
                  {t('settings.tab_sound_description')}
                </Text>
              </View>
              <Switch
                value={tabSoundEnabled}
                onValueChange={handleToggleTabSound}
                trackColor={{ false: '#767577', true: '#0a7ea4' }}
                thumbColor={tabSoundEnabled ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Language Selector Modal */}
          {showLanguageSelector && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                {t('settings.select_language')}
              </Text>
              <View className="gap-2">
                {[
                  { value: 'auto' as LanguageOption, label: t('settings.language_auto'), flag: '🌐', desc: t('settings.language_auto_desc') },
                  { value: 'es' as LanguageOption, label: 'Español', flag: '🇪🇸', desc: 'Spanish' },
                  { value: 'en' as LanguageOption, label: 'English', flag: '🇬🇧', desc: 'English' },
                  { value: 'de' as LanguageOption, label: 'Deutsch', flag: '🇩🇪', desc: 'German' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      await setAppLanguage(option.value);
                      setShowLanguageSelector(false);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                    className={`flex-row items-center p-4 rounded-xl border ${
                      selectedLanguage === option.value
                        ? 'bg-primary border-primary'
                        : 'bg-background border-border'
                    } active:opacity-80`}
                  >
                    <Text className="text-2xl mr-3">{option.flag}</Text>
                    <View className="flex-1">
                      <Text className={`font-semibold ${
                        selectedLanguage === option.value ? 'text-white' : 'text-foreground'
                      }`}>
                        {option.label}
                      </Text>
                      <Text className={`text-xs ${
                        selectedLanguage === option.value ? 'text-white/70' : 'text-muted'
                      }`}>
                        {option.desc}
                      </Text>
                    </View>
                    {selectedLanguage === option.value && (
                      <Text className="text-white text-lg">✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setShowLanguageSelector(false)}
                className="mt-4 bg-muted/20 border border-border px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-foreground font-semibold text-center">
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Help/FAQ Section */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground">
                {t('settings.help_title')}
              </Text>
              <Text className="text-xs text-muted mt-1">
                {t('settings.help_description')}
              </Text>
            </View>
            
            <View className="gap-2">
              {[
                {
                  id: 1,
                  icon: '🔌',
                  question: t('settings.faq_adapter_q'),
                  answer: t('settings.faq_adapter_a'),
                },
                {
                  id: 2,
                  icon: '🛠️',
                  question: t('settings.faq_spoofing_q'),
                  answer: t('settings.faq_spoofing_a'),
                },
                {
                  id: 3,
                  icon: '📶',
                  question: t('settings.faq_connection_q'),
                  answer: t('settings.faq_connection_a'),
                },
                {
                  id: 4,
                  icon: '🧰',
                  question: t('settings.faq_toolbox_q'),
                  answer: t('settings.faq_toolbox_a'),
                },
                {
                  id: 5,
                  icon: '🔑',
                  question: t('settings.faq_fec_q'),
                  answer: t('settings.faq_fec_a'),
                },
                {
                  id: 6,
                  icon: '⚠️',
                  question: t('settings.faq_risk_q'),
                  answer: t('settings.faq_risk_a'),
                },
              ].map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedFaq(expandedFaq === faq.id ? null : faq.id);
                  }}
                  className="bg-background border border-border rounded-xl overflow-hidden active:opacity-80"
                >
                  <View className="flex-row items-center p-4">
                    <Text className="text-xl mr-3">{faq.icon}</Text>
                    <Text className="flex-1 text-foreground font-medium text-sm">
                      {faq.question}
                    </Text>
                    <Text className="text-muted text-lg">
                      {expandedFaq === faq.id ? '▲' : '▼'}
                    </Text>
                  </View>
                  {expandedFaq === faq.id && (
                    <View className="px-4 pb-4 pt-0">
                      <View className="bg-primary/5 rounded-lg p-3">
                        <Text className="text-muted text-sm leading-5">
                          {faq.answer}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>





          {/* Connection Settings */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              {t('settings.connection_settings')}
            </Text>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  {t('settings.ip_address')}
                </Text>
                <TextInput
                  value={host}
                  onChangeText={setHost}
                  placeholder="192.168.1.4"
                  keyboardType="numeric"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  {t('settings.ip_address_desc')}
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  {t('settings.port')}
                </Text>
                <TextInput
                  value={port}
                  onChangeText={setPort}
                  placeholder="23"
                  keyboardType="numeric"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  {t('settings.port_desc')}
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  {t('settings.username')}
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="root"
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  {t('settings.username_desc')}
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  {t('settings.password')}
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="root"
                  secureTextEntry
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  {t('settings.password_desc')}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={handleResetDefaults}
                className="flex-1 bg-muted/20 border border-border px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-foreground font-semibold text-center">
                  {t('settings.reset')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveSettings}
                className="flex-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold text-center">
                  {t('settings.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Data Management */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              {t('settings.data_management')}
            </Text>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  t('settings.clear_history'),
                  t('settings.clear_history_confirm'),
                  [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                      text: t('settings.clear'),
                      style: 'destructive',
                      onPress: () => {
                        clearMessages();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        showAlert('alerts.éxito', 'alerts.historial_eliminado');
                      },
                    },
                  ]
                );
              }}
              className="bg-error/10 border border-error px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-error font-semibold text-center">
                {t('settings.clear_command_history')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* USB Debug Mode */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <TouchableOpacity
              onPress={() => {
                setShowDebugInfo(!showDebugInfo);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="flex-row justify-between items-center mb-4"
            >
              <Text className="text-lg font-semibold text-foreground">
                🔧 {t('settings.usb_debug_mode')}
              </Text>
              <Text className="text-2xl text-muted">
                {showDebugInfo ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {showDebugInfo && (
              <View className="gap-4">
                {/* Estado de Conexión */}
                <View className="bg-background rounded-xl p-4">
                  <Text className="text-sm font-semibold text-foreground mb-3">
                    🔌 {t('settings.connection_status')}
                  </Text>
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">{t('settings.status')}:</Text>
                      <Text className={`text-xs font-medium ${
                        status === 'connected' ? 'text-success' :
                        status === 'detected' ? 'text-warning' :
                        'text-muted'
                      }`}>
                        {status === 'connected' ? t('usb.status_connected').toUpperCase() :
                         status === 'detected' ? t('usb.status_detected').toUpperCase() :
                         t('usb.status_disconnected').toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">{t('settings.devices_detected')}:</Text>
                      <Text className="text-xs text-foreground font-medium">{devices.length}</Text>
                    </View>
                  </View>
                </View>

                {/* Información del Dispositivo */}
                {device && (
                  <View className="bg-background rounded-xl p-4">
                    <Text className="text-sm font-semibold text-foreground mb-3">
                      📱 {t('settings.current_device')}
                    </Text>
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Device ID:</Text>
                        <Text className="text-xs text-foreground font-mono">{device.deviceId}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">VID:PID:</Text>
                        <Text className="text-xs text-foreground font-mono">
                          0x{device.vendorId.toString(16).toUpperCase().padStart(4, '0')}:0x{device.productId.toString(16).toUpperCase().padStart(4, '0')}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Chipset:</Text>
                        <Text className="text-xs text-foreground font-medium">{device.chipset}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">{t('usb.manufacturer')}:</Text>
                        <Text className="text-xs text-foreground">{device.manufacturer}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">{t('usb.product')}:</Text>
                        <Text className="text-xs text-foreground">{device.product}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Serial:</Text>
                        <Text className="text-xs text-foreground font-mono">{device.serialNumber}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Información Técnica */}
                <View className="bg-background rounded-xl p-4">
                    <Text className="text-sm font-semibold text-foreground mb-3">
                      ⚙️ {t('settings.technical_info')}
                    </Text>
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">{t('settings.native_module')}:</Text>
                      <Text className="text-xs text-success font-medium">{t('settings.active')}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Magic Value:</Text>
                      <Text className="text-xs text-foreground font-mono">0xDEADBEEF</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">EEPROM Size:</Text>
                      <Text className="text-xs text-foreground font-mono">256 bytes</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">VID Offset:</Text>
                      <Text className="text-xs text-foreground font-mono">0x88</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">PID Offset:</Text>
                      <Text className="text-xs text-foreground font-mono">0x8A</Text>
                    </View>
                  </View>
                </View>

                {/* Botón Copiar Info */}
                <TouchableOpacity
                  onPress={async () => {
                    const debugInfo = `=== MIB2 Controller Debug Info ===\n\n` +
                      `Estado: ${status}\n` +
                      `Dispositivos: ${devices.length}\n\n` +
                      (device ? (
                        `Device ID: ${device.deviceId}\n` +
                        `VID:PID: 0x${device.vendorId.toString(16).toUpperCase()}:0x${device.productId.toString(16).toUpperCase()}\n` +
                        `Chipset: ${device.chipset}\n` +
                        `Fabricante: ${device.manufacturer}\n` +
                        `Producto: ${device.product}\n` +
                        `Serial: ${device.serialNumber}\n`
                      ) : 'No hay dispositivo conectado\n') +
                      `\nMagic Value: 0xDEADBEEF\n` +
                      `EEPROM Size: 256 bytes\n` +
                      `VID Offset: 0x88\n` +
                      `PID Offset: 0x8A`;
                    
                    await Clipboard.setStringAsync(debugInfo);
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    showAlert('alerts.copiado', 'alerts.información_de_debug_copiada_al_portapapeles');
                  }}
                  className="bg-primary rounded-xl p-4 active:opacity-80"
                >
                  <Text className="text-background font-semibold text-center">
                    📋 {t('settings.copy_debug_info')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* App Info */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              {t('settings.app_info')}
            </Text>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">{t('settings.version')}</Text>
                <Text className="text-sm text-foreground font-medium">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">{t('settings.created_by_label')}</Text>
                <Text className="text-sm text-foreground font-medium">Felipe Plazas</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">{t('settings.platform')}</Text>
                <Text className="text-sm text-foreground font-medium">Android</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">{t('settings.compatible_with')}</Text>
                <Text className="text-sm text-foreground font-medium">MIB2 STD2</Text>
              </View>
            </View>

            {/* Terms of Use Button */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/terms-of-use');
              }}
              className="bg-primary/20 border border-primary rounded-xl p-4 mt-4 active:opacity-80"
            >
              <Text className="text-primary font-semibold text-center">
                📄 {t('settings.view_terms')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <View className="bg-error/10 border border-error rounded-2xl p-4">
            <Text className="text-sm text-error font-medium mb-2">
              ⚠️ {t('settings.security_warning')}
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              {t('settings.security_warning_text')}
            </Text>
          </View>

          {/* Credits */}
          <View className="items-center py-4">
            <Text className="text-xs text-muted text-center">
              MIB2 Controller v1.0.0
            </Text>
            <Text className="text-xs text-muted text-center mt-1">
              {t('settings.created_by')}
            </Text>
            <Text className="text-xs text-muted text-center mt-1">
              {t('settings.for_mib2_units')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
