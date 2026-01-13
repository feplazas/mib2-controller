import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTelnet } from "@/lib/telnet-provider";
import { useUsbStatus } from "@/lib/usb-status-context";
import {
  TOOLBOX_INSTALLATION_STEPS,
  EMMC_ACCESS_INFO,
  DIAGNOSTIC_COMMANDS,
  generateInstallationScript,
  generateToolboxVerificationCommand,
  type InstallationStep,
} from "@/lib/toolbox-installer";

type StepStatus = 'pending' | 'inProgress' | 'completed' | 'error';

export default function ToolboxScreen() {
  const colors = useColors();
  const { isConnected, sendCommand } = useTelnet();
  const { status: usbStatus } = useUsbStatus();
  const [selectedStep, setSelectedStep] = useState<InstallationStep | null>(null);
  const [showEmmcInfo, setShowEmmcInfo] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<Record<number, StepStatus>>({});
  const [executing, setExecuting] = useState(false);

  const handleSelectStep = (step: InstallationStep) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedStep(step);
    setShowEmmcInfo(false);
    setShowDiagnostics(false);
  };

  const handleShowEmmcInfo = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowEmmcInfo(true);
    setSelectedStep(null);
    setShowDiagnostics(false);
  };

  const handleShowDiagnostics = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDiagnostics(true);
    setSelectedStep(null);
    setShowEmmcInfo(false);
  };

  const handleGenerateScript = async () => {
    try {
      const script = generateInstallationScript();
      const fileUri = `${FileSystem.documentDirectory}install_toolbox.sh`;
      
      await FileSystem.writeAsStringAsync(fileUri, script);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Script Generado",
        "El script de instalación ha sido creado exitosamente.",
        [
          { text: "OK" },
          {
            text: "Compartir",
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el script de instalación");
      console.error(error);
    }
  };

  const handleGenerateVerification = () => {
    const command = generateToolboxVerificationCommand();
    Alert.alert("Comando de Verificación", command, [{ text: "Cerrar" }]);
  };

  const handleExecuteStep = async (step: InstallationStep) => {
    if (!isConnected) {
      Alert.alert('No Conectado', 'Debes conectarte a la unidad MIB2 primero');
      return;
    }

    if (!step.command) {
      Alert.alert('Sin Comando', 'Este paso no tiene un comando asociado');
      return;
    }

    Alert.alert(
      'Ejecutar Paso',
      `¿Ejecutar: ${step.title}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ejecutar',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            setExecuting(true);
            setStepStatuses(prev => ({ ...prev, [step.step]: 'inProgress' }));

            try {
              sendCommand(step.command!);
              // Simular tiempo de ejecución
              setTimeout(() => {
                setStepStatuses(prev => ({ ...prev, [step.step]: 'completed' }));
                setExecuting(false);
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              }, 2000);
            } catch (error) {
              setStepStatuses(prev => ({ ...prev, [step.step]: 'error' }));
              setExecuting(false);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
              Alert.alert('Error', 'Error al ejecutar comando');
            }
          },
        },
      ]
    );
  };

  const getStepIcon = (stepNumber: number): string => {
    const status = stepStatuses[stepNumber];
    if (status === 'completed') return '✅';
    if (status === 'inProgress') return '⏳';
    if (status === 'error') return '⚠️';
    return '▫️';
  };

  const getStepColor = (stepNumber: number): string => {
    const status = stepStatuses[stepNumber];
    if (status === 'completed') return '#22C55E';
    if (status === 'inProgress') return colors.primary;
    if (status === 'error') return '#EF4444';
    return colors.muted;
  };

  // Check prerequisites
  const telnetReady = isConnected;
  const usbReady = usbStatus === 'connected';
  const allReady = telnetReady && usbReady;

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              Instalación del Toolbox
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Guía paso a paso para instalar el MIB2 STD2 Toolbox
            </Text>
          </View>

          {/* CRITICAL WARNING */}
          <View className="bg-error/10 rounded-xl p-4 border-2" style={{ borderColor: '#EF4444' }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-2xl">⚠️</Text>
              <Text className="text-lg font-bold" style={{ color: '#EF4444' }}>
                ADVERTENCIA CRÍTICA
              </Text>
            </View>
            <Text className="text-sm leading-relaxed" style={{ color: colors.foreground }}>
              La instalación del MIB2 Toolbox modifica archivos del sistema QNX. <Text className="font-bold" style={{ color: '#EF4444' }}>Un error puede BRICKEAR la unidad MIB2</Text> (valor: miles de dólares).
            </Text>
            <Text className="text-sm leading-relaxed mt-2" style={{ color: colors.foreground }}>
              El parcheo de <Text className="font-mono text-xs">tsd.mibstd2.system.swap</Text> altera la rutina de verificación de firmas digitales. <Text className="font-bold">No interrumpas el proceso una vez iniciado.</Text>
            </Text>
            <Text className="text-sm leading-relaxed mt-2" style={{ color: colors.foreground }}>
              Si algo falla, la única forma de recuperar la unidad es mediante acceso directo a la memoria eMMC (soldadura).
            </Text>
          </View>

          {/* Prerequisites Status */}
          <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              Estado de Prerequisitos
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">{telnetReady ? '✅' : '❌'}</Text>
                <Text className="text-sm" style={{ color: colors.foreground }}>
                  Conexión Telnet {telnetReady ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">{usbReady ? '✅' : '❌'}</Text>
                <Text className="text-sm" style={{ color: colors.foreground }}>
                  Adaptador USB {usbReady ? 'Conectado' : 'Desconectado'}
                </Text>
              </View>
              {!allReady && (
                <Text className="text-xs mt-2" style={{ color: '#F59E0B' }}>
                  ⚠️ Completa los prerequisitos antes de instalar
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleShowDiagnostics}
              className="flex-1 bg-primary/10 px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-center font-semibold text-xs" style={{ color: colors.primary }}>
                🔍 Diagnósticos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShowEmmcInfo}
              className="flex-1 bg-warning/10 px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-center font-semibold text-xs" style={{ color: "#F59E0B" }}>
                ⚙️ Método eMMC
              </Text>
            </TouchableOpacity>
          </View>

          {/* Installation Steps List */}
          {!selectedStep && !showEmmcInfo && !showDiagnostics && (
            <View className="gap-3">
              <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                Pasos de Instalación
              </Text>
              {TOOLBOX_INSTALLATION_STEPS.map((step) => (
                <TouchableOpacity
                  key={step.step}
                  onPress={() => handleSelectStep(step)}
                  className="bg-surface rounded-xl p-4 border active:opacity-80"
                  style={{ borderColor: colors.border }}
                >
                  <View className="flex-row items-center gap-3 mb-2">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-sm font-bold" style={{ color: colors.background }}>
                        {step.step}
                      </Text>
                    </View>
                    <Text className="text-base font-semibold flex-1" style={{ color: colors.foreground }}>
                      {step.title}
                    </Text>
                  </View>
                  {step.isOptional && (
                    <View className="bg-primary/10 px-2 py-1 rounded self-start">
                      <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                        Opcional
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {/* Generate Script Button */}
              <TouchableOpacity
                onPress={handleGenerateScript}
                className="bg-primary px-4 py-3 rounded-xl active:opacity-80 mt-3"
              >
                <Text className="text-center font-semibold" style={{ color: colors.background }}>
                  Generar Script de Instalación
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGenerateVerification}
                className="bg-surface px-4 py-3 rounded-xl border active:opacity-80"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-center font-semibold" style={{ color: colors.foreground }}>
                  Ver Comando de Verificación
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step Detail */}
          {selectedStep && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => setSelectedStep(null)}
                className="flex-row items-center gap-2"
              >
                <Text className="text-base" style={{ color: colors.primary }}>
                  ← Volver
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                {/* Step Number */}
                <View className="flex-row items-center gap-3 mb-4">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-xl font-bold" style={{ color: colors.background }}>
                      {selectedStep.step}
                    </Text>
                  </View>
                  <Text className="text-xl font-bold flex-1" style={{ color: colors.foreground }}>
                    {selectedStep.title}
                  </Text>
                </View>

                {/* Description */}
                <View className="mb-4">
                  <Text className="text-sm" style={{ color: colors.foreground }}>
                    {selectedStep.description}
                  </Text>
                </View>

                {/* Command */}
                {selectedStep.command && (
                  <View className="bg-background rounded-lg p-3 mb-4">
                    <Text className="text-xs font-semibold mb-2" style={{ color: colors.foreground }}>
                      Comando:
                    </Text>
                    <Text className="text-xs font-mono" style={{ color: colors.primary }}>
                      {selectedStep.command}
                    </Text>
                  </View>
                )}

                {/* Expected Output */}
                {selectedStep.expectedOutput && (
                  <View className="bg-success/10 rounded-lg p-3 mb-4">
                    <Text className="text-xs font-semibold mb-2" style={{ color: "#22C55E" }}>
                      Salida Esperada:
                    </Text>
                    <Text className="text-xs font-mono" style={{ color: "#22C55E" }}>
                      {selectedStep.expectedOutput}
                    </Text>
                  </View>
                )}

                {/* Warnings */}
                {selectedStep.warnings && selectedStep.warnings.length > 0 && (
                  <View className="bg-warning/10 rounded-lg p-3">
                    <Text className="text-sm font-semibold mb-2" style={{ color: "#F59E0B" }}>
                      ⚠️ Advertencias
                    </Text>
                    {selectedStep.warnings.map((warning, index) => (
                      <Text key={index} className="text-xs mb-1" style={{ color: "#F59E0B" }}>
                        • {warning}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* eMMC Access Info */}
          {showEmmcInfo && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => setShowEmmcInfo(false)}
                className="flex-row items-center gap-2"
              >
                <Text className="text-base" style={{ color: colors.primary }}>
                  ← Volver
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                <Text className="text-xl font-bold mb-3" style={{ color: colors.foreground }}>
                  {EMMC_ACCESS_INFO.title}
                </Text>

                <Text className="text-sm mb-4" style={{ color: colors.foreground }}>
                  {EMMC_ACCESS_INFO.description}
                </Text>

                {/* Steps */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
                    Pasos:
                  </Text>
                  {EMMC_ACCESS_INFO.steps.map((step, index) => (
                    <Text key={index} className="text-xs mb-2" style={{ color: colors.muted }}>
                      {index + 1}. {step}
                    </Text>
                  ))}
                </View>

                {/* Warnings */}
                <View className="bg-error/10 rounded-lg p-3 mb-4">
                  <Text className="text-sm font-semibold mb-2" style={{ color: "#EF4444" }}>
                    ⚠️ Advertencias Críticas
                  </Text>
                  {EMMC_ACCESS_INFO.warnings.map((warning, index) => (
                    <Text key={index} className="text-xs mb-1" style={{ color: "#EF4444" }}>
                      {warning}
                    </Text>
                  ))}
                </View>

                {/* Technical Note */}
                <View className="bg-primary/10 rounded-lg p-3">
                  <Text className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>
                    📝 Nota Técnica
                  </Text>
                  <Text className="text-xs" style={{ color: colors.foreground }}>
                    {EMMC_ACCESS_INFO.technicalNote}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Diagnostic Commands */}
          {showDiagnostics && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => setShowDiagnostics(false)}
                className="flex-row items-center gap-2"
              >
                <Text className="text-base" style={{ color: colors.primary }}>
                  ← Volver
                </Text>
              </TouchableOpacity>

              <View className="gap-3">
                <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                  Comandos de Diagnóstico
                </Text>
                {DIAGNOSTIC_COMMANDS.map((cmd, index) => (
                  <View
                    key={index}
                    className="bg-surface rounded-xl p-4 border"
                    style={{ borderColor: colors.border }}
                  >
                    <Text className="text-base font-semibold mb-2" style={{ color: colors.foreground }}>
                      {cmd.name}
                    </Text>
                    <Text className="text-xs mb-3" style={{ color: colors.muted }}>
                      {cmd.description}
                    </Text>
                    <View className="bg-background rounded-lg p-3">
                      <Text className="text-xs font-mono" style={{ color: colors.primary }}>
                        {cmd.command}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
