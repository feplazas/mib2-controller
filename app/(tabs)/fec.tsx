import { useState } from "react";
import { useTranslation } from "@/lib/language-context";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Platform, Linking } from "react-native";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { ScreenContainer } from "@/components/screen-container";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedTouchable } from "@/components/ui/animated-touchable";
import { FDroidCard } from "@/components/ui/fdroid-card";
import { useColors } from "@/hooks/use-colors";
import { useTelnet } from "@/lib/telnet-provider";
import { showAlert } from '@/lib/translated-alert';
import {
  PREDEFINED_FEC_CODES,
  FEC_INJECTION_INFO,
  FEC_GENERATOR_URL,
  validateVIN,
  validateVCRN,
  validateFECCode,
  generateExceptionList,
  generateToolboxInjectionCommand,
  generateFecInjectionCommands,
} from "@/lib/fec-generator";

export default function FECScreen() {
  const t = useTranslation();
  const colors = useColors();
  const { isConnected, sendCommand } = useTelnet();
  const [vin, setVin] = useState("");
  const [vcrn, setVcrn] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [customCode, setCustomCode] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const handleToggleCode = (code: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedCodes(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleAddCustomCode = () => {
    if (!validateFECCode(customCode)) {
      showAlert('alerts.código_inválido', 'alerts.el_código_fec_debe_tener_8_dígitos_hexadecimales');
      return;
    }

    if (selectedCodes.includes(customCode.toUpperCase())) {
      showAlert('alerts.código_duplicado', 'alerts.este_código_ya_está_en_la_lista');
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setSelectedCodes(prev => [...prev, customCode.toUpperCase()]);
    setCustomCode("");
  };

  const handleGenerateExceptionList = async () => {
    if (selectedCodes.length === 0) {
      showAlert('alerts.sin_códigos', 'alerts.selecciona_al_menos_un_código_fec_para_generar_la');
      return;
    }

    try {
      const exceptionList = generateExceptionList(selectedCodes);
      const fileUri = `${FileSystem.documentDirectory}ExceptionList.txt`;
      
      await FileSystem.writeAsStringAsync(fileUri, exceptionList);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        t('fec.exception_list_generated'),
        t('fec.exception_list_generated_message'),
        [
          { text: "OK" },
          {
            text: t('common.share'),
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
              }
            },
          },
        ]
      );
    } catch (error) {
      showAlert('alerts.error', 'alerts.no_se_pudo_generar_el_archivo_exceptionlisttxt');
      console.error(error);
    }
  };

  const handleGenerateInjectionCommand = () => {
    if (selectedCodes.length === 0) {
      showAlert('alerts.sin_códigos', 'alerts.selecciona_al_menos_un_código_fec_para_generar_el');
      return;
    }

    const command = generateToolboxInjectionCommand(selectedCodes);
    Alert.alert(t('fec.injection_command'), command, [{ text: t('common.close') }]);
  };

  const handleInjectViaTelnet = () => {
    if (!isConnected) {
      showAlert('alerts.no_conectado', 'alerts.debes_conectarte_a_la_unidad_mib2_primero');
      return;
    }

    if (selectedCodes.length === 0) {
      showAlert('alerts.sin_códigos', 'alerts.selecciona_al_menos_un_código_fec');
      return;
    }

    Alert.alert(
      t('fec.confirm_injection'),
      t('fec.confirm_injection_message', { count: selectedCodes.length }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('fec.inject'),
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
            const commands = generateFecInjectionCommands(selectedCodes);
            commands.forEach((cmd) => {
              if (cmd && !cmd.startsWith('#')) {
                sendCommand(cmd);
              }
            });
            showAlert('alerts.inyectando', 'alerts.códigos_fec_enviados_la_unidad_se_reiniciará');
          },
        },
      ]
    );
  };

  const handleOpenGenerator = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const supported = await Linking.canOpenURL(FEC_GENERATOR_URL);
    if (supported) {
      await Linking.openURL(FEC_GENERATOR_URL);
    } else {
      showAlert('alerts.error', 'alerts.no_se_pudo_abrir_el_generador_online');
    }
  };

  const handleShowInfo = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowInfo(!showInfo);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              {t('fec.title')}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('fec.subtitle')}
            </Text>
          </View>

          {/* Generator Button */}
          <AnimatedButton
            title={t('fec.open_generator')}
            icon="🌐"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleOpenGenerator}
          />

          {/* Info Button */}
          <AnimatedButton
            title={`${showInfo ? t('fec.hide') : t('fec.show')} ${t('fec.process_info')}`}
            icon={showInfo ? "👁️" : "ℹ️"}
            variant="outline"
            fullWidth
            onPress={handleShowInfo}
          />

          {/* Info Panel */}
          {showInfo && (
            <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
              <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                {t(FEC_INJECTION_INFO.titleKey)}
              </Text>

              {/* Steps */}
              {FEC_INJECTION_INFO.steps.map((step) => (
                <View key={step.step} className="mb-3">
                  <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                    {step.step}. {t(step.titleKey)}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                    {t(step.descriptionKey)}
                  </Text>
                </View>
              ))}

              {/* Warnings */}
              <View className="bg-error/10 rounded-lg p-3 mt-3">
                <Text className="text-sm font-semibold mb-2" style={{ color: "#EF4444" }}>
                  ⚠️ {t('fec.warnings')}
                </Text>
                {FEC_INJECTION_INFO.warningKeys.map((warningKey: string, index: number) => (
                  <Text key={index} className="text-xs mb-1" style={{ color: "#EF4444" }}>
                    • {t(warningKey)}
                  </Text>
                ))}
              </View>

              {/* Technical Note */}
              <View className="bg-primary/10 rounded-lg p-3 mt-3">
                <Text className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>
                  📝 {t('fec.technical_note')}
                </Text>
                <Text className="text-xs" style={{ color: colors.foreground }}>
                  {t(FEC_INJECTION_INFO.technicalNoteKey)}
                </Text>
              </View>
            </View>
          )}

          {/* Vehicle Data Section */}
          <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              {t('fec.vehicle_data')}
            </Text>
            <Text className="text-xs mb-3" style={{ color: colors.muted }}>
              {t('fec.vehicle_data_desc')}
            </Text>

            <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
              {t('fec.vin_label')}
            </Text>
            <TextInput
              value={vin}
              onChangeText={setVin}
              placeholder="WVWZZZ1KZAW123456"
              placeholderTextColor={colors.muted}
              maxLength={17}
              autoCapitalize="characters"
              className="bg-background rounded-lg px-4 py-3 mb-3"
              style={{ color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
            />

            <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
              {t('fec.vcrn_label')}
            </Text>
            <TextInput
              value={vcrn}
              onChangeText={setVcrn}
              placeholder="5QA035842"
              placeholderTextColor={colors.muted}
              className="bg-background rounded-lg px-4 py-3"
              style={{ color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
            />

            {vin && !validateVIN(vin) && (
              <Text className="text-xs mt-2" style={{ color: "#EF4444" }}>
                {t('fec.vin_invalid')}
              </Text>
            )}
            {vcrn && !validateVCRN(vcrn) && (
              <Text className="text-xs mt-2" style={{ color: "#EF4444" }}>
                {t('fec.vcrn_invalid')}
              </Text>
            )}
          </View>

          {/* Predefined Codes */}
          <View className="gap-3">
            <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
              {t('fec.predefined_codes')}
            </Text>
            {PREDEFINED_FEC_CODES.map((fec) => (
              <TouchableOpacity
                key={fec.code}
                onPress={() => handleToggleCode(fec.code)}
                className="bg-surface rounded-xl p-4 border active:opacity-80"
                style={{
                  borderColor: selectedCodes.includes(fec.code) ? colors.primary : colors.border,
                  borderWidth: selectedCodes.includes(fec.code) ? 2 : 1,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
                    {t(fec.nameKey)}
                  </Text>
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: selectedCodes.includes(fec.code)
                        ? colors.primary
                        : colors.border,
                    }}
                  >
                    {selectedCodes.includes(fec.code) && (
                      <Text className="text-xs font-bold" style={{ color: colors.background }}>
                        ✓
                      </Text>
                    )}
                  </View>
                </View>
                <Text className="text-xs mb-2" style={{ color: colors.muted }}>
                  {t(fec.descriptionKey)}
                </Text>
                <Text className="text-xs font-mono" style={{ color: colors.primary }}>
                  {t('fec.code')}: {fec.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Code Input */}
          <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              {t('fec.add_custom_code')}
            </Text>
            <TextInput
              value={customCode}
              onChangeText={setCustomCode}
              placeholder="00060800"
              placeholderTextColor={colors.muted}
              maxLength={8}
              autoCapitalize="characters"
              className="bg-background rounded-lg px-4 py-3 mb-3"
              style={{ color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
            />
            <TouchableOpacity
              onPress={handleAddCustomCode}
              className="bg-primary px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-center font-semibold" style={{ color: colors.background }}>
                {t('fec.add_code')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected Codes Summary */}
          {selectedCodes.length > 0 && (
            <View className="bg-success/10 rounded-xl p-4 border" style={{ borderColor: "#22C55E" }}>
              <Text className="text-lg font-semibold mb-3" style={{ color: "#22C55E" }}>
                {t('fec.selected_codes')} ({selectedCodes.length})
              </Text>
              {selectedCodes.map((code) => (
                <View key={code} className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-mono" style={{ color: colors.foreground }}>
                    {code}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleToggleCode(code)}
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: "#EF4444" }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: "#FFF" }}>
                      {t('fec.remove')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          {selectedCodes.length > 0 && (
            <View className="gap-3">
              <AnimatedButton
                title={t('fec.generate_exception_list')}
                icon="📄"
                variant="primary"
                fullWidth
                onPress={handleGenerateExceptionList}
              />

              <AnimatedButton
                title={t('fec.view_injection_command')}
                icon="💻"
                variant="secondary"
                fullWidth
                onPress={handleGenerateInjectionCommand}
              />

              <AnimatedButton
                title={isConnected ? t('fec.inject_via_telnet') : t('fec.connect_telnet_first')}
                icon={isConnected ? "⚡" : "🔌"}
                variant={isConnected ? "success" : "secondary"}
                fullWidth
                disabled={!isConnected}
                onPress={handleInjectViaTelnet}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
