import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Platform, Linking } from "react-native";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTelnet } from "@/lib/telnet-provider";
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
      Alert.alert("Código Inválido", "El código FEC debe tener 8 dígitos hexadecimales.");
      return;
    }

    if (selectedCodes.includes(customCode.toUpperCase())) {
      Alert.alert("Código Duplicado", "Este código ya está en la lista.");
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
      Alert.alert("Sin Códigos", "Selecciona al menos un código FEC para generar la lista.");
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
        "ExceptionList Generada",
        "El archivo ExceptionList.txt ha sido creado exitosamente.",
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
      Alert.alert("Error", "No se pudo generar el archivo ExceptionList.txt");
      console.error(error);
    }
  };

  const handleGenerateInjectionCommand = () => {
    if (selectedCodes.length === 0) {
      Alert.alert("Sin Códigos", "Selecciona al menos un código FEC para generar el comando.");
      return;
    }

    const command = generateToolboxInjectionCommand(selectedCodes);
    Alert.alert("Comando de Inyección", command, [{ text: "Cerrar" }]);
  };

  const handleInjectViaTelnet = () => {
    if (!isConnected) {
      Alert.alert('No Conectado', 'Debes conectarte a la unidad MIB2 primero');
      return;
    }

    if (selectedCodes.length === 0) {
      Alert.alert('Sin Códigos', 'Selecciona al menos un código FEC');
      return;
    }

    Alert.alert(
      'Confirmar Inyección',
      `¿Inyectar ${selectedCodes.length} código(s) FEC vía Telnet?\n\nLa unidad se reiniciará automáticamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inyectar',
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
            Alert.alert('Inyectando', 'Códigos FEC enviados. La unidad se reiniciará.');
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
      Alert.alert('Error', 'No se pudo abrir el generador online');
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              Generador de Códigos FEC
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Feature Enable Codes para activación de funciones SWaP
            </Text>
          </View>

          {/* Generator Button */}
          <TouchableOpacity
            onPress={handleOpenGenerator}
            className="bg-primary px-4 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-center font-semibold text-base" style={{ color: colors.background }}>
              🌐 Abrir Generador Online (vwcoding.ru)
            </Text>
          </TouchableOpacity>

          {/* Info Button */}
          <TouchableOpacity
            onPress={handleShowInfo}
            className="bg-primary/10 px-4 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-center font-semibold" style={{ color: colors.primary }}>
              {showInfo ? "Ocultar" : "Mostrar"} Información del Proceso
            </Text>
          </TouchableOpacity>

          {/* Info Panel */}
          {showInfo && (
            <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
              <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                {FEC_INJECTION_INFO.title}
              </Text>

              {/* Steps */}
              {FEC_INJECTION_INFO.steps.map((step) => (
                <View key={step.step} className="mb-3">
                  <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                    {step.step}. {step.title}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                    {step.description}
                  </Text>
                </View>
              ))}

              {/* Warnings */}
              <View className="bg-error/10 rounded-lg p-3 mt-3">
                <Text className="text-sm font-semibold mb-2" style={{ color: "#EF4444" }}>
                  ⚠️ Advertencias
                </Text>
                {FEC_INJECTION_INFO.warnings.map((warning, index) => (
                  <Text key={index} className="text-xs mb-1" style={{ color: "#EF4444" }}>
                    • {warning}
                  </Text>
                ))}
              </View>

              {/* Technical Note */}
              <View className="bg-primary/10 rounded-lg p-3 mt-3">
                <Text className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>
                  📝 Nota Técnica
                </Text>
                <Text className="text-xs" style={{ color: colors.foreground }}>
                  {FEC_INJECTION_INFO.technicalNote}
                </Text>
              </View>
            </View>
          )}

          {/* Vehicle Data Section */}
          <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              Datos del Vehículo (Opcional)
            </Text>
            <Text className="text-xs mb-3" style={{ color: colors.muted }}>
              Para generación de códigos personalizados basados en VIN/VCRN
            </Text>

            <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
              VIN (17 caracteres)
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
              VCRN (Número de Serie)
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
                VIN inválido (debe tener 17 caracteres alfanuméricos)
              </Text>
            )}
            {vcrn && !validateVCRN(vcrn) && (
              <Text className="text-xs mt-2" style={{ color: "#EF4444" }}>
                VCRN inválido (debe tener entre 8 y 20 caracteres)
              </Text>
            )}
          </View>

          {/* Predefined Codes */}
          <View className="gap-3">
            <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
              Códigos FEC Predefinidos
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
                    {fec.name}
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
                  {fec.description}
                </Text>
                <Text className="text-xs font-mono" style={{ color: colors.primary }}>
                  Código: {fec.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Code Input */}
          <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              Agregar Código Personalizado
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
                Agregar Código
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected Codes Summary */}
          {selectedCodes.length > 0 && (
            <View className="bg-success/10 rounded-xl p-4 border" style={{ borderColor: "#22C55E" }}>
              <Text className="text-lg font-semibold mb-3" style={{ color: "#22C55E" }}>
                Códigos Seleccionados ({selectedCodes.length})
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
                      Quitar
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          {selectedCodes.length > 0 && (
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleGenerateExceptionList}
                className="bg-primary px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-center font-semibold" style={{ color: colors.background }}>
                  Generar ExceptionList.txt
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGenerateInjectionCommand}
                className="bg-surface px-4 py-3 rounded-xl border active:opacity-80"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-center font-semibold" style={{ color: colors.foreground }}>
                  Ver Comando de Inyección
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleInjectViaTelnet}
                className="px-4 py-3 rounded-xl active:opacity-80"
                style={{ backgroundColor: isConnected ? '#22C55E' : colors.muted + '33' }}
                disabled={!isConnected}
              >
                <Text
                  className="text-center font-semibold text-base"
                  style={{ color: isConnected ? colors.background : colors.muted }}
                >
                  {isConnected ? '⚡ Inyectar vía Telnet' : '🔌 Conectar Telnet Primero'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
