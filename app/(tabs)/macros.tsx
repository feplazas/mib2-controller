import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";
import { useExpertMode } from "@/lib/expert-mode-provider";
import { 
  PREDEFINED_MACROS, 
  getMacrosByCategory,
  getCategoryLabel,
  getCategoryColor,
  type CommandMacro,
  type MacroStep 
} from "@/lib/macros";
import { getRiskLevelLabel, getRiskLevelColor } from "@/lib/mib2-commands";

export default function MacrosScreen() {
  const { connectionStatus, executeCommand } = useTelnet();
  const { isExpertMode } = useExpertMode();
  const [executingMacro, setExecutingMacro] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [macroResults, setMacroResults] = useState<{ step: number; success: boolean; output: string }[]>([]);

  const handleExecuteMacro = async (macro: CommandMacro) => {
    if (!connectionStatus.connected) {
      Alert.alert('No Conectado', 'Debes conectarte a la unidad MIB2 primero');
      return;
    }

    if (macro.requiresExpertMode && !isExpertMode) {
      Alert.alert(
        'Modo Experto Requerido',
        'Esta macro requiere activar el Modo Experto en Configuración'
      );
      return;
    }

    const riskLabel = getRiskLevelLabel(macro.riskLevel);
    const confirmMessage = `${macro.description}\n\nNivel de riesgo: ${riskLabel}\nPasos: ${macro.steps.length}\nDuración estimada: ${macro.estimatedDuration}s`;

    Alert.alert(
      'Ejecutar Macro',
      confirmMessage,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ejecutar',
          style: macro.riskLevel === 'high' ? 'destructive' : 'default',
          onPress: () => executeMacroSequence(macro),
        },
      ]
    );
  };

  const executeMacroSequence = async (macro: CommandMacro) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExecutingMacro(macro.id);
    setCurrentStep(0);
    setMacroResults([]);

    const results: { step: number; success: boolean; output: string }[] = [];
    let shouldContinue = true;

    for (let i = 0; i < macro.steps.length && shouldContinue; i++) {
      const step = macro.steps[i];
      setCurrentStep(i + 1);

      try {
        // Execute command
        const response = await executeCommand(step.command);
        
        results.push({
          step: i + 1,
          success: response.success,
          output: response.output || response.error || '',
        });

        setMacroResults([...results]);

        // If command failed and not optional, stop execution
        if (!response.success && !step.optional) {
          shouldContinue = false;
          Alert.alert(
            'Macro Interrumpida',
            `Error en el paso ${i + 1}: ${step.description}\n\n${response.error || 'Error desconocido'}`
          );
        }

        // Apply delay before next command
        if (step.delay && shouldContinue && i < macro.steps.length - 1) {
          await new Promise(resolve => setTimeout(resolve, step.delay));
        }
      } catch (error) {
        results.push({
          step: i + 1,
          success: false,
          output: error instanceof Error ? error.message : 'Error desconocido',
        });

        if (!step.optional) {
          shouldContinue = false;
          Alert.alert('Error', `Error ejecutando el paso ${i + 1}`);
        }
      }
    }

    setExecutingMacro(null);
    setCurrentStep(0);

    // Show completion notification
    if (shouldContinue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Macro Completada',
        `Todos los pasos de "${macro.name}" se ejecutaron correctamente`
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Filter macros based on expert mode
  let availableMacros = isExpertMode 
    ? PREDEFINED_MACROS 
    : PREDEFINED_MACROS.filter(m => !m.requiresExpertMode);

  const categories: Array<CommandMacro['category']> = ['backup', 'adaptation', 'diagnostic', 'maintenance'];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Macros</Text>
              {isExpertMode && (
                <View className="bg-error/20 border border-error px-3 py-1 rounded-full">
                  <Text className="text-error text-xs font-bold">MODO EXPERTO</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-muted mt-1">
              {connectionStatus.connected 
                ? `${availableMacros.length} macros disponibles` 
                : 'Conecta a MIB2 para ejecutar macros'}
            </Text>
          </View>

          {/* Execution Status */}
          {executingMacro && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-3">
                Ejecutando Macro...
              </Text>
              <View className="bg-background rounded-lg p-3 mb-3">
                <Text className="text-sm text-foreground mb-2">
                  Paso {currentStep} de {PREDEFINED_MACROS.find(m => m.id === executingMacro)?.steps.length || 0}
                </Text>
                <View className="bg-primary/20 rounded-full h-2 overflow-hidden">
                  <View
                    className="bg-primary h-full"
                    style={{
                      width: `${(currentStep / (PREDEFINED_MACROS.find(m => m.id === executingMacro)?.steps.length || 1)) * 100}%`,
                    }}
                  />
                </View>
              </View>
              {macroResults.length > 0 && (
                <ScrollView className="max-h-40 bg-background rounded-lg p-3">
                  {macroResults.map((result, idx) => (
                    <View key={idx} className="mb-2">
                      <Text className={`text-xs font-mono ${result.success ? 'text-success' : 'text-error'}`}>
                        Paso {result.step}: {result.success ? '✓' : '✗'}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Macros by Category */}
          {categories.map((category) => {
            const macros = getMacrosByCategory(category).filter(m => 
              isExpertMode || !m.requiresExpertMode
            );

            if (macros.length === 0) return null;

            return (
              <View key={category}>
                <Text className="text-lg font-semibold text-foreground mb-3">
                  {getCategoryLabel(category)}
                </Text>
                <View className="gap-3">
                  {macros.map((macro) => (
                    <TouchableOpacity
                      key={macro.id}
                      onPress={() => handleExecuteMacro(macro)}
                      disabled={!connectionStatus.connected || executingMacro !== null}
                      className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
                      style={{ opacity: !connectionStatus.connected || executingMacro !== null ? 0.5 : 1 }}
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-1 mr-2">
                          <Text className="text-base font-semibold text-foreground">
                            {macro.name}
                          </Text>
                        </View>
                        <View className="flex-row gap-2">
                          <View className={`px-2 py-1 rounded bg-${getCategoryColor(macro.category)}/20 border-${getCategoryColor(macro.category)}`}>
                            <Text className={`text-xs font-medium text-${getCategoryColor(macro.category)}`}>
                              {getCategoryLabel(macro.category)}
                            </Text>
                          </View>
                          <View className={`px-2 py-1 rounded bg-${getRiskLevelColor(macro.riskLevel)}/20 border-${getRiskLevelColor(macro.riskLevel)}`}>
                            <Text className={`text-xs font-medium text-${getRiskLevelColor(macro.riskLevel)}`}>
                              {getRiskLevelLabel(macro.riskLevel)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text className="text-sm text-muted leading-relaxed mb-3">
                        {macro.description}
                      </Text>

                      <View className="flex-row items-center justify-between bg-background rounded-lg p-2">
                        <View className="flex-row items-center gap-4">
                          <View>
                            <Text className="text-xs text-muted">Pasos</Text>
                            <Text className="text-sm font-semibold text-foreground">{macro.steps.length}</Text>
                          </View>
                          <View>
                            <Text className="text-xs text-muted">Duración</Text>
                            <Text className="text-sm font-semibold text-foreground">~{macro.estimatedDuration}s</Text>
                          </View>
                        </View>
                        {macro.requiresExpertMode && (
                          <View className="bg-error/10 px-2 py-1 rounded">
                            <Text className="text-error text-xs font-semibold">🔒 Experto</Text>
                          </View>
                        )}
                      </View>

                      {/* Steps Preview */}
                      <View className="mt-3 bg-background rounded-lg p-3">
                        <Text className="text-xs font-semibold text-muted mb-2">Pasos:</Text>
                        {macro.steps.slice(0, 3).map((step, idx) => (
                          <Text key={idx} className="text-xs text-muted mb-1">
                            {idx + 1}. {step.description}
                          </Text>
                        ))}
                        {macro.steps.length > 3 && (
                          <Text className="text-xs text-muted italic">
                            ... y {macro.steps.length - 3} pasos más
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}

          {/* Info */}
          <View className="bg-primary/10 border border-primary rounded-xl p-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              💡 ¿Qué son las Macros?
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Las macros son secuencias predefinidas de comandos que se ejecutan automáticamente. 
              Simplifican tareas complejas como backups, configuraciones y diagnósticos.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
