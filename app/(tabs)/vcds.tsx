import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useExpertMode } from "@/lib/expert-mode-provider";
import {
  VCDS_PROCEDURES,
  QUICK_REFERENCE_TABLE,
  type VCDSProcedure,
  type RiskLevel,
  type ProcedureCategory,
  generateVCDSCommand,
} from "@/lib/vcds-procedures";
import {
  validateConfiguration,
  CRITICAL_SAFETY_WARNINGS,
} from "@/lib/safety-validator";

const CATEGORY_LABELS: Record<ProcedureCategory, string> = {
  performance: "Rendimiento",
  safety: "Seguridad",
  aesthetics: "Estética",
  functionality: "Funcionalidad",
};

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: "#22C55E",
  moderate: "#F59E0B",
  high: "#EF4444",
  critical: "#DC2626",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  safe: "Seguro",
  moderate: "Moderado",
  high: "Alto",
  critical: "Crítico",
};

export default function VCDSScreen() {
  const colors = useColors();
  const { isExpertMode } = useExpertMode();
  const [selectedProcedure, setSelectedProcedure] = useState<VCDSProcedure | null>(null);
  const [showQuickReference, setShowQuickReference] = useState(false);

  const filteredProcedures = VCDS_PROCEDURES.filter(
    (proc) => !proc.expertModeOnly || isExpertMode
  );

  const handleSelectProcedure = (procedure: VCDSProcedure) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedProcedure(procedure);
    setShowQuickReference(false);
  };

  const handleShowQuickReference = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowQuickReference(true);
    setSelectedProcedure(null);
  };

  const handleExecuteProcedure = (procedure: VCDSProcedure) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    // Mostrar advertencia crítica si aplica
    if (procedure.id === 'xds_control') {
      const criticalWarning = CRITICAL_SAFETY_WARNINGS.xds_strong;
      Alert.alert(
        criticalWarning.title,
        criticalWarning.message + "\n\n" + (criticalWarning.recommendations?.join("\n") || ""),
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Entiendo, Continuar",
            style: "destructive",
            onPress: () => showCommandAlert(procedure),
          },
        ],
        { cancelable: true }
      );
      return;
    }

    showCommandAlert(procedure);
  };

  const showCommandAlert = (procedure: VCDSProcedure) => {
    const warningMessage = procedure.warnings
      ? procedure.warnings.join("\n\n")
      : "¿Estás seguro de que deseas ejecutar este procedimiento?";

    Alert.alert(
      "Confirmar Procedimiento",
      warningMessage,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Ver Comando",
          onPress: () => {
            const command = generateVCDSCommand(procedure);
            Alert.alert("Comando VCDS", command, [{ text: "Cerrar" }]);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              Procedimientos VCDS
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Modificaciones técnicas para unidades MIB2 STD2 Technisat Preh
            </Text>
          </View>

          {/* Quick Reference Button */}
          <TouchableOpacity
            onPress={handleShowQuickReference}
            className="bg-primary px-4 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-center font-semibold" style={{ color: colors.background }}>
              📋 Tabla de Referencia Rápida
            </Text>
          </TouchableOpacity>

          {/* Quick Reference Table */}
          {showQuickReference && (
            <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
              <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                Tabla de Referencia Rápida MQB (VCDS)
              </Text>
              {QUICK_REFERENCE_TABLE.map((entry, index) => (
                <View
                  key={index}
                  className="mb-3 pb-3 border-b"
                  style={{ borderBottomColor: colors.border }}
                >
                  <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                    {entry.function}
                  </Text>
                  <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                    Módulo: {entry.module}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    Login: {entry.loginCode}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.muted }}>
                    Canal: {entry.channel}
                  </Text>
                  <Text className="text-xs font-semibold mt-1" style={{ color: colors.primary }}>
                    Valor: {entry.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Procedures List */}
          {!showQuickReference && !selectedProcedure && (
            <View className="gap-3">
              <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                Procedimientos Disponibles
              </Text>
              {filteredProcedures.map((procedure) => (
                <TouchableOpacity
                  key={procedure.id}
                  onPress={() => handleSelectProcedure(procedure)}
                  className="bg-surface rounded-xl p-4 border active:opacity-80"
                  style={{ borderColor: colors.border }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-semibold flex-1" style={{ color: colors.foreground }}>
                      {procedure.name}
                    </Text>
                    <View
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: RISK_COLORS[procedure.riskLevel] + "20" }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: RISK_COLORS[procedure.riskLevel] }}
                      >
                        {RISK_LABELS[procedure.riskLevel]}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs mb-2" style={{ color: colors.muted }}>
                    {CATEGORY_LABELS[procedure.category]} • {procedure.module}
                  </Text>
                  {procedure.expertModeOnly && (
                    <View className="bg-warning/10 px-2 py-1 rounded self-start">
                      <Text className="text-xs font-semibold" style={{ color: "#F59E0B" }}>
                        🔒 Modo Experto
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Procedure Detail */}
          {selectedProcedure && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => setSelectedProcedure(null)}
                className="flex-row items-center gap-2"
              >
                <Text className="text-base" style={{ color: colors.primary }}>
                  ← Volver
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                {/* Title */}
                <Text className="text-xl font-bold mb-2" style={{ color: colors.foreground }}>
                  {selectedProcedure.name}
                </Text>
                <Text className="text-sm mb-4" style={{ color: colors.muted }}>
                  {selectedProcedure.nameGerman}
                </Text>

                {/* Risk Badge */}
                <View
                  className="px-3 py-2 rounded-lg mb-4 self-start"
                  style={{ backgroundColor: RISK_COLORS[selectedProcedure.riskLevel] + "20" }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: RISK_COLORS[selectedProcedure.riskLevel] }}
                  >
                    Riesgo: {RISK_LABELS[selectedProcedure.riskLevel]}
                  </Text>
                </View>

                {/* Module Info */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold mb-1" style={{ color: colors.foreground }}>
                    Información del Módulo
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    Módulo: {selectedProcedure.moduleCode}-{selectedProcedure.module}
                  </Text>
                  <Text className="text-sm" style={{ color: colors.muted }}>
                    Código Login: {Array.isArray(selectedProcedure.loginCode) 
                      ? selectedProcedure.loginCode.join(" / ") 
                      : selectedProcedure.loginCode}
                  </Text>
                </View>

                {/* Adaptations */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
                    Adaptaciones
                  </Text>
                  {selectedProcedure.adaptations.map((adaptation, index) => (
                    <View
                      key={index}
                      className="bg-background rounded-lg p-3 mb-2"
                    >
                      <Text className="text-xs font-semibold mb-1" style={{ color: colors.foreground }}>
                        {adaptation.channel}
                      </Text>
                      <Text className="text-xs mb-2" style={{ color: colors.muted }}>
                        {adaptation.channelGerman}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.muted }}>
                        {adaptation.description}
                      </Text>
                      <Text className="text-xs font-semibold mt-2" style={{ color: colors.primary }}>
                        Nuevo Valor: {adaptation.newValue}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Warnings */}
                {selectedProcedure.warnings && selectedProcedure.warnings.length > 0 && (
                  <View className="bg-error/10 rounded-lg p-3 mb-4">
                    <Text className="text-sm font-semibold mb-2" style={{ color: "#EF4444" }}>
                      ⚠️ Advertencias
                    </Text>
                    {selectedProcedure.warnings.map((warning, index) => (
                      <Text key={index} className="text-xs mb-1" style={{ color: "#EF4444" }}>
                        • {warning}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Recommendations */}
                {selectedProcedure.recommendations && selectedProcedure.recommendations.length > 0 && (
                  <View className="bg-success/10 rounded-lg p-3 mb-4">
                    <Text className="text-sm font-semibold mb-2" style={{ color: "#22C55E" }}>
                      ✅ Recomendaciones
                    </Text>
                    {selectedProcedure.recommendations.map((rec, index) => (
                      <Text key={index} className="text-xs mb-1" style={{ color: "#22C55E" }}>
                        • {rec}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Technical Notes */}
                {selectedProcedure.technicalNotes && (
                  <View className="bg-primary/10 rounded-lg p-3 mb-4">
                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>
                      📝 Notas Técnicas
                    </Text>
                    <Text className="text-xs" style={{ color: colors.foreground }}>
                      {selectedProcedure.technicalNotes}
                    </Text>
                  </View>
                )}

                {/* Reboot Instructions */}
                {selectedProcedure.requiresReboot && (
                  <View className="bg-warning/10 rounded-lg p-3 mb-4">
                    <Text className="text-sm font-semibold mb-2" style={{ color: "#F59E0B" }}>
                      🔄 Requiere Reinicio
                    </Text>
                    <Text className="text-xs" style={{ color: "#F59E0B" }}>
                      {selectedProcedure.rebootInstructions}
                    </Text>
                  </View>
                )}

                {/* Execute Button */}
                <TouchableOpacity
                  onPress={() => handleExecuteProcedure(selectedProcedure)}
                  className="bg-primary px-4 py-3 rounded-xl active:opacity-80 mt-2"
                >
                  <Text className="text-center font-semibold" style={{ color: colors.background }}>
                    Ver Comando VCDS
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Expert Mode Notice */}
          {!isExpertMode && (
            <View className="bg-warning/10 rounded-xl p-4 border" style={{ borderColor: "#F59E0B" }}>
              <Text className="text-sm font-semibold mb-2" style={{ color: "#F59E0B" }}>
                🔒 Modo Experto Desactivado
              </Text>
              <Text className="text-xs" style={{ color: "#F59E0B" }}>
                Algunos procedimientos de alto riesgo están ocultos. Activa el Modo Experto en
                Configuración para ver todos los procedimientos disponibles.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
