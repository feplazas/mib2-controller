import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { haptics } from "@/lib/haptics-service";

import { ScreenContainer } from "@/components/screen-container";
import { IOSSection, IOSSectionHeader, IOSRow } from "@/components/ui/ios-section";
import { AnimatedTouchable } from "@/components/ui/animated-touchable";
import { AnimatedFadeIn } from "@/components/ui/animated-fade-in";
import { AnimatedSpinner } from "@/components/ui/animated-spinner";
import { AnimatedToggle } from "@/components/ui/animated-toggle";
import { useTelnet } from "@/lib/telnet-provider";
import { useUsbStatus } from "@/lib/usb-status-context";
import * as Clipboard from 'expo-clipboard';

import { useTranslation, useLanguage, LanguageOption } from "@/lib/language-context";
import { useThemeContext } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";

import { showAlert } from '@/lib/translated-alert';
import { offlineGuidesService, type OfflineStatus } from '@/lib/offline-guides-service';

/**
 * Settings Screen - Ultra Premium iOS Style
 * 
 * Refactored with IOSSection and IOSRow components
 * following Apple Human Interface Guidelines.
 */
export default function SettingsScreen() {
  const t = useTranslation();
  const colors = useColors();
  const { config, updateConfig, clearMessages } = useTelnet();
  
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port.toString());
  const [username, setUsername] = useState(config.username);
  const [password, setPassword] = useState(config.password);

  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus | null>(null);
  const [isRefreshingGuides, setIsRefreshingGuides] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const { selectedLanguage, setLanguage: setAppLanguage } = useLanguage();
  const { themeMode, setThemeMode } = useThemeContext();
  const { status, device, devices } = useUsbStatus();

  // Cargar estado offline al montar
  useEffect(() => {
    const loadOfflineStatus = async () => {
      try {
        await offlineGuidesService.initialize();
        const status = await offlineGuidesService.getStatus();
        setOfflineStatus(status);
      } catch (error) {
        console.error('[Settings] Error loading offline status:', error);
      }
    };
    loadOfflineStatus();

    const unsubscribe = offlineGuidesService.addListener((status) => {
      setOfflineStatus(status);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await updateConfig({
        host,
        port: parseInt(port, 10),
        username,
        password,
      });
      haptics.success();
      showAlert('alerts.éxito', 'alerts.configuración_guardada_correctamente');
    } catch (error) {
      haptics.error();
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

  const handleRefreshGuides = async () => {
    setIsRefreshingGuides(true);
    try {
      await offlineGuidesService.refreshGuides();
      const status = await offlineGuidesService.getStatus();
      setOfflineStatus(status);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert('alerts.éxito', 'settings.offline_guides_refreshed');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('alerts.error', 'alerts.error');
    } finally {
      setIsRefreshingGuides(false);
    }
  };

  const handleClearOfflineData = () => {
    Alert.alert(
      t('settings.clear_offline_data'),
      t('settings.clear_offline_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              await offlineGuidesService.clearGuides();
              const status = await offlineGuidesService.getStatus();
              setOfflineStatus(status);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              showAlert('alerts.éxito', 'settings.offline_guides_cleared');
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
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
  };

  const handleCopyDebugInfo = async () => {
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
    haptics.success();
    showAlert('alerts.copiado', 'alerts.información_de_debug_copiada_al_portapapeles');
  };

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString();
  };

  const getLanguageLabel = () => {
    if (selectedLanguage === 'auto') return t('settings.language_auto');
    if (selectedLanguage === 'es') return 'Español';
    if (selectedLanguage === 'en') return 'English';
    return 'Deutsch';
  };

  const getThemeLabel = () => {
    if (themeMode === 'system') return t('settings.theme_system');
    if (themeMode === 'light') return t('settings.theme_light');
    return t('settings.theme_dark');
  };

  const faqItems = [
    { id: 1, icon: '🔌', question: t('settings.faq_adapter_q'), answer: t('settings.faq_adapter_a') },
    { id: 2, icon: '🛠️', question: t('settings.faq_spoofing_q'), answer: t('settings.faq_spoofing_a') },
    { id: 3, icon: '📶', question: t('settings.faq_connection_q'), answer: t('settings.faq_connection_a') },
    { id: 4, icon: '🧰', question: t('settings.faq_toolbox_q'), answer: t('settings.faq_toolbox_a') },
    { id: 5, icon: '🔑', question: t('settings.faq_fec_q'), answer: t('settings.faq_fec_a') },
    { id: 6, icon: '⚠️', question: t('settings.faq_risk_q'), answer: t('settings.faq_risk_a') },
  ];

  return (
    <ScreenContainer>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnimatedFadeIn direction="fade" delay={0}>
          <View className="px-4 pt-4 pb-2">
            <Text className="text-3xl font-bold text-foreground">{t('settings.title')}</Text>
            <Text className="text-base text-muted mt-1">{t('settings.subtitle')}</Text>
          </View>
        </AnimatedFadeIn>

        {/* GENERAL Section */}
        <AnimatedFadeIn direction="up" index={0} staggerDelay={60}>
          <IOSSectionHeader title={t('settings.general') || 'General'} />
        <View className="bg-surface mx-4 rounded-2xl overflow-hidden border border-border">
          {/* Language */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowLanguageSelector(!showLanguageSelector);
            }}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5 border-b border-separator"
          >
            <Text className="text-xl mr-3">🌐</Text>
            <Text className="flex-1 text-base text-foreground">{t('settings.language')}</Text>
            <Text className="text-base text-muted mr-2">{getLanguageLabel()}</Text>
            <Text className="text-muted">›</Text>
          </TouchableOpacity>

          {/* Theme */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowThemeSelector(!showThemeSelector);
            }}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5 border-b border-separator"
          >
            <Text className="text-xl mr-3">🎨</Text>
            <Text className="flex-1 text-base text-foreground">{t('settings.theme') || 'Tema'}</Text>
            <Text className="text-base text-muted mr-2">{getThemeLabel()}</Text>
            <Text className="text-muted">›</Text>
          </TouchableOpacity>

          {/* Offline Guides */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/guides');
            }}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5"
          >
            <Text className="text-xl mr-3">📚</Text>
            <Text className="flex-1 text-base text-foreground">{t('settings.offline_guides') || 'Guías Offline'}</Text>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${offlineStatus?.guidesAvailableOffline ? 'bg-success' : 'bg-muted'}`} />
              <Text className="text-muted">›</Text>
            </View>
          </TouchableOpacity>
        </View>
        </AnimatedFadeIn>

        {/* Language Selector Modal */}
        {showLanguageSelector && (
          <View className="mx-4 mt-3 bg-surface rounded-2xl p-4 border border-primary">
            <Text className="text-lg font-semibold text-foreground mb-3">{t('settings.select_language')}</Text>
            {[
              { value: 'auto' as LanguageOption, label: t('settings.language_auto'), flag: '🌐' },
              { value: 'es' as LanguageOption, label: 'Español', flag: '🇪🇸' },
              { value: 'en' as LanguageOption, label: 'English', flag: '🇬🇧' },
              { value: 'de' as LanguageOption, label: 'Deutsch', flag: '🇩🇪' },
            ].map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={async () => {
                  haptics.selection();
                  await setAppLanguage(option.value);
                  setShowLanguageSelector(false);
                  // Haptic de éxito después de cambiar idioma
                  setTimeout(() => haptics.success(), 200);
                }}
                activeOpacity={0.8}
                className={`flex-row items-center p-3 rounded-xl mb-2 ${
                  selectedLanguage === option.value ? 'bg-primary' : 'bg-background'
                }`}
              >
                <Text className="text-xl mr-3">{option.flag}</Text>
                <Text className={`flex-1 font-medium ${selectedLanguage === option.value ? 'text-white' : 'text-foreground'}`}>
                  {option.label}
                </Text>
                {selectedLanguage === option.value && <Text className="text-white">✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Theme Selector Modal */}
        {showThemeSelector && (
          <View className="mx-4 mt-3 bg-surface rounded-2xl p-4 border border-primary">
            <Text className="text-lg font-semibold text-foreground mb-3">{t('settings.select_theme') || 'Seleccionar Tema'}</Text>
            {[
              { value: 'system' as const, label: t('settings.theme_system'), icon: '📱' },
              { value: 'light' as const, label: t('settings.theme_light'), icon: '☀️' },
              { value: 'dark' as const, label: t('settings.theme_dark'), icon: '🌙' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  haptics.selection();
                  setThemeMode(option.value);
                  setShowThemeSelector(false);
                  // Haptic de éxito después de cambiar tema
                  setTimeout(() => haptics.success(), 200);
                }}
                activeOpacity={0.8}
                className={`flex-row items-center p-3 rounded-xl mb-2 ${
                  themeMode === option.value ? 'bg-primary' : 'bg-background'
                }`}
              >
                <Text className="text-xl mr-3">{option.icon}</Text>
                <Text className={`flex-1 font-medium ${themeMode === option.value ? 'text-white' : 'text-foreground'}`}>
                  {option.label}
                </Text>
                {themeMode === option.value && <Text className="text-white">✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CONNECTION Section */}
        <IOSSectionHeader title={t('settings.connection_settings')} />
        <View className="bg-surface mx-4 rounded-2xl overflow-hidden border border-border">
          {/* IP Address */}
          <View className="px-4 py-3 border-b border-separator">
            <Text className="text-sm font-medium text-foreground mb-2">{t('settings.ip_address')}</Text>
            <TextInput
              value={host}
              onChangeText={setHost}
              placeholder="192.168.1.4"
              keyboardType="numeric"
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Port */}
          <View className="px-4 py-3 border-b border-separator">
            <Text className="text-sm font-medium text-foreground mb-2">{t('settings.port')}</Text>
            <TextInput
              value={port}
              onChangeText={setPort}
              placeholder="23"
              keyboardType="numeric"
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Username */}
          <View className="px-4 py-3 border-b border-separator">
            <Text className="text-sm font-medium text-foreground mb-2">{t('settings.username')}</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="root"
              autoCapitalize="none"
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholderTextColor={colors.muted}
            />
          </View>

          {/* Password */}
          <View className="px-4 py-3">
            <Text className="text-sm font-medium text-foreground mb-2">{t('settings.password')}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="root"
              secureTextEntry
              autoCapitalize="none"
              className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>

        {/* Connection Buttons */}
        <View className="flex-row gap-3 mx-4 mt-3">
          <TouchableOpacity
            onPress={handleResetDefaults}
            activeOpacity={0.8}
            className="flex-1 bg-surface border border-border px-4 py-3 rounded-xl"
          >
            <Text className="text-foreground font-semibold text-center">{t('settings.reset')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveSettings}
            activeOpacity={0.8}
            className="flex-1 bg-primary px-4 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold text-center">{t('settings.save')}</Text>
          </TouchableOpacity>
        </View>

       {/* HELP Section */}
        <AnimatedFadeIn direction="up" index={2} staggerDelay={60}>
          <IOSSectionHeader title={t('settings.help_title')} subtitle={t('settings.help_description')} />
        <View className="bg-surface mx-4 rounded-2xl overflow-hidden border border-border">
          {faqItems.map((faq, index) => (
            <TouchableOpacity
              key={faq.id}
              onPress={() => {
                haptics.selection();
                setExpandedFaq(expandedFaq === faq.id ? null : faq.id);
              }}
              activeOpacity={0.8}
              className={`${index < faqItems.length - 1 ? 'border-b border-separator' : ''}`}
            >
              <View className="flex-row items-center px-4 py-3.5">
                <Text className="text-xl mr-3">{faq.icon}</Text>
                <Text className="flex-1 text-base text-foreground">{faq.question}</Text>
                <Text className="text-muted">{expandedFaq === faq.id ? '▼' : '›'}</Text>
              </View>
              {expandedFaq === faq.id && (
                <View className="px-4 pb-3">
                  <View className="bg-primary/5 rounded-xl p-3 ml-8">
                    <Text className="text-sm text-muted leading-5">{faq.answer}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        </AnimatedFadeIn>

        {/* DATA Section */}
        <AnimatedFadeIn direction="up" index={3} staggerDelay={60}>
        <IOSSectionHeader title={t('settings.data_management')} />
        <View className="bg-surface mx-4 rounded-2xl overflow-hidden border border-border">
          <TouchableOpacity
            onPress={handleClearHistory}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5 border-b border-separator"
          >
            <Text className="text-xl mr-3">🗑️</Text>
            <Text className="flex-1 text-base text-error">{t('settings.clear_command_history')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleClearOfflineData}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5"
          >
            <Text className="text-xl mr-3">📴</Text>
            <Text className="flex-1 text-base text-error">{t('settings.clear_offline_data')}</Text>
          </TouchableOpacity>
        </View>
        </AnimatedFadeIn>

        {/* DEBUG Section */}
        <AnimatedFadeIn direction="up" index={4} staggerDelay={60}>
        <IOSSectionHeader title={t('settings.usb_debug_mode')} />
        <View className="bg-surface mx-4 rounded-2xl overflow-hidden border border-border">
          <View className="flex-row items-center px-4 py-3.5 border-b border-separator">
            <Text className="text-xl mr-3">🔌</Text>
            <Text className="flex-1 text-base text-foreground">{t('settings.status')}</Text>
            <Text className={`text-sm font-medium ${
              status === 'connected' ? 'text-success' :
              status === 'detected' ? 'text-warning' : 'text-muted'
            }`}>
              {status === 'connected' ? t('usb.status_connected') :
               status === 'detected' ? t('usb.status_detected') :
               t('usb.status_disconnected')}
            </Text>
          </View>

          <View className="flex-row items-center px-4 py-3.5 border-b border-separator">
            <Text className="text-xl mr-3">📱</Text>
            <Text className="flex-1 text-base text-foreground">{t('settings.devices_detected')}</Text>
            <Text className="text-sm text-foreground font-mono">{devices.length}</Text>
          </View>

          {device && (
            <>
              <View className="flex-row items-center px-4 py-3.5 border-b border-separator">
                <Text className="text-xl mr-3">🔢</Text>
                <Text className="flex-1 text-base text-foreground">VID:PID</Text>
                <Text className="text-sm text-foreground font-mono">
                  0x{device.vendorId.toString(16).toUpperCase().padStart(4, '0')}:0x{device.productId.toString(16).toUpperCase().padStart(4, '0')}
                </Text>
              </View>
              <View className="flex-row items-center px-4 py-3.5 border-b border-separator">
                <Text className="text-xl mr-3">💾</Text>
                <Text className="flex-1 text-base text-foreground">Chipset</Text>
                <Text className="text-sm text-foreground font-medium">{device.chipset}</Text>
              </View>
            </>
          )}

          <TouchableOpacity
            onPress={handleCopyDebugInfo}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5"
          >
            <Text className="text-xl mr-3">📋</Text>
            <Text className="flex-1 text-base text-primary font-medium">{t('settings.copy_debug_info')}</Text>
          </TouchableOpacity>
        </View>
        </AnimatedFadeIn>

        {/* ABOUT Section */}
        <AnimatedFadeIn direction="up" index={5} staggerDelay={60}>
        <IOSSectionHeader title={t('settings.app_info')} />
        <View className="bg-surface mx-4 rounded-2xl overflow-hidden border border-border">
          <View className="flex-row items-center px-4 py-3.5 border-b border-separator">
            <Text className="flex-1 text-base text-foreground">{t('settings.version')}</Text>
            <Text className="text-sm text-muted">1.0.0 (Build 41)</Text>
          </View>
          <View className="flex-row items-center px-4 py-3.5 border-b border-separator">
            <Text className="flex-1 text-base text-foreground">{t('settings.created_by_label')}</Text>
            <Text className="text-sm text-muted">Felipe Plazas</Text>
          </View>
          <View className="flex-row items-center px-4 py-3.5 border-b border-separator">
            <Text className="flex-1 text-base text-foreground">{t('settings.platform')}</Text>
            <Text className="text-sm text-muted">Android</Text>
          </View>
          <View className="flex-row items-center px-4 py-3.5 border-b border-separator">
            <Text className="flex-1 text-base text-foreground">{t('settings.compatible_with')}</Text>
            <Text className="text-sm text-muted">MIB2 STD2</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/terms-of-use');
            }}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5 border-b border-separator"
          >
            <Text className="text-xl mr-3">📄</Text>
            <Text className="flex-1 text-base text-primary">{t('settings.view_terms')}</Text>
            <Text className="text-muted">›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/feedback');
            }}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5 border-b border-separator"
          >
            <Text className="text-xl mr-3">💬</Text>
            <Text className="flex-1 text-base text-primary">{t('feedback.title')}</Text>
            <Text className="text-muted">›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/rating');
            }}
            activeOpacity={0.8}
            className="flex-row items-center px-4 py-3.5"
          >
            <Text className="text-xl mr-3">⭐</Text>
            <Text className="flex-1 text-base text-primary">{t('rating.title')}</Text>
            <Text className="text-muted">›</Text>
          </TouchableOpacity>
        </View>
        </AnimatedFadeIn>

        {/* Warning */}
        <AnimatedFadeIn direction="up" index={6} staggerDelay={60}>
        <View className="mx-4 mt-6 bg-error/10 border border-error rounded-2xl p-4">
          <Text className="text-sm text-error font-medium mb-1">⚠️ {t('settings.security_warning')}</Text>
          <Text className="text-xs text-muted leading-relaxed">{t('settings.security_warning_text')}</Text>
        </View>

        {/* Credits */}
        <View className="items-center py-6">
          <Text className="text-xs text-muted">MIB2 Controller v1.0.0</Text>
          <Text className="text-xs text-muted mt-1">{t('settings.created_by')}</Text>
          <Text className="text-xs text-muted mt-1">{t('settings.for_mib2_units')}</Text>
        </View>
        </AnimatedFadeIn>
      </ScrollView>
    </ScreenContainer>
  );
}
