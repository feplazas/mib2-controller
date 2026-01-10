import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { AdapterRecovery, type DiagnosticResult, type RecoveryMethod } from '@/lib/adapter-recovery';
import { AdapterDatabase } from '@/lib/adapter-database';
import { usbService } from '@/lib/usb-service';

export default function RecoveryScreen() {
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [recoveryMethods, setRecoveryMethods] = useState<RecoveryMethod[]>([]);
  const [executing, setExecuting] = useState(false);

  const handleDiagnose = async () => {
    setDiagnosing(true);
    try {
      const result = await AdapterRecovery.diagnoseAdapter();
      setDiagnostic(result);

      // Obtener métodos de recuperación
      const device = usbService.getCurrentDevice();
      const adapterSpec = device ? AdapterDatabase.findByVidPid(device.vendorId, device.productId) : undefined;
      const methods = AdapterRecovery.getRecoveryMethods(adapterSpec);
      setRecoveryMethods(methods);

      // Mostrar reporte
      const report = AdapterRecovery.formatDiagnosticReport(result);
      console.log(report);
    } catch (error) {
      Alert.alert('Error', 'Failed to diagnose adapter: ' + error);
    } finally {
      setDiagnosing(false);
    }
  };

  const handleSoftwareReset = async () => {
    Alert.alert(
      'Confirm Software Reset',
      'This will attempt to reset the adapter EEPROM using vendor commands. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setExecuting(true);
            try {
              const result = await AdapterRecovery.attemptSoftwareReset();
              Alert.alert(
                result.success ? 'Success' : 'Failed',
                result.message
              );
            } catch (error) {
              Alert.alert('Error', 'Software reset failed: ' + error);
            } finally {
              setExecuting(false);
            }
          },
        },
      ]
    );
  };

  const handleForceInternalDescriptors = async () => {
    Alert.alert(
      'Confirm Force Internal Descriptors',
      'This will disable EEPROM reading and force the chipset to use internal descriptors. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute',
          style: 'destructive',
          onPress: async () => {
            setExecuting(true);
            try {
              const result = await AdapterRecovery.forceInternalDescriptors();
              Alert.alert(
                result.success ? 'Success' : 'Failed',
                result.message
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to force internal descriptors: ' + error);
            } finally {
              setExecuting(false);
            }
          },
        },
      ]
    );
  };

  const getDiagnosisColor = (diagnosis: DiagnosticResult['diagnosis']) => {
    switch (diagnosis) {
      case 'healthy':
        return 'text-success';
      case 'degraded':
        return 'text-warning';
      case 'bricked':
        return 'text-error';
      default:
        return 'text-muted';
    }
  };

  const getDifficultyColor = (difficulty: RecoveryMethod['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-success';
      case 'medium':
        return 'text-warning';
      case 'hard':
      case 'expert':
        return 'text-error';
      default:
        return 'text-muted';
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground mb-2">Adapter Recovery</Text>
            <Text className="text-sm text-muted">
              Diagnose and recover bricked or malfunctioning USB-Ethernet adapters
            </Text>
          </View>

          {/* Diagnostic Button */}
          <TouchableOpacity
            onPress={handleDiagnose}
            disabled={diagnosing}
            className="bg-primary rounded-2xl p-4 active:opacity-80"
          >
            {diagnosing ? (
              <View className="flex-row items-center justify-center gap-2">
                <ActivityIndicator color="#fff" />
                <Text className="text-background font-semibold">Diagnosing...</Text>
              </View>
            ) : (
              <Text className="text-background font-semibold text-center">Run Diagnostic</Text>
            )}
          </TouchableOpacity>

          {/* Diagnostic Results */}
          {diagnostic && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-4">Diagnostic Results</Text>

              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Overall Diagnosis:</Text>
                  <Text className={`text-sm font-bold ${getDiagnosisColor(diagnostic.diagnosis)}`}>
                    {diagnostic.diagnosis.toUpperCase()}
                  </Text>
                </View>

                <View className="border-t border-border pt-3">
                  <Text className="text-xs font-semibold text-muted mb-2">Component Status:</Text>
                  <View className="gap-1">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-foreground">USB Detection:</Text>
                      <Text className={`text-xs font-semibold ${diagnostic.deviceDetected ? 'text-success' : 'text-error'}`}>
                        {diagnostic.deviceDetected ? '✓ OK' : '✗ FAIL'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-foreground">USB Descriptors:</Text>
                      <Text className={`text-xs font-semibold ${diagnostic.usbDescriptorsReadable ? 'text-success' : 'text-error'}`}>
                        {diagnostic.usbDescriptorsReadable ? '✓ OK' : '✗ FAIL'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-foreground">EEPROM Read:</Text>
                      <Text className={`text-xs font-semibold ${diagnostic.eepromReadable ? 'text-success' : 'text-error'}`}>
                        {diagnostic.eepromReadable ? '✓ OK' : '✗ FAIL'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-foreground">EEPROM Write:</Text>
                      <Text className={`text-xs font-semibold ${diagnostic.eepromWriteable ? 'text-success' : 'text-error'}`}>
                        {diagnostic.eepromWriteable ? '✓ OK' : '✗ FAIL'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-foreground">Vendor Commands:</Text>
                      <Text className={`text-xs font-semibold ${diagnostic.vendorCommandsResponsive ? 'text-success' : 'text-error'}`}>
                        {diagnostic.vendorCommandsResponsive ? '✓ OK' : '✗ FAIL'}
                      </Text>
                    </View>
                  </View>
                </View>

                {diagnostic.issues.length > 0 && (
                  <View className="border-t border-border pt-3">
                    <Text className="text-xs font-semibold text-error mb-2">Issues Detected:</Text>
                    {diagnostic.issues.map((issue, idx) => (
                      <Text key={idx} className="text-xs text-foreground mb-1">• {issue}</Text>
                    ))}
                  </View>
                )}

                {diagnostic.recommendations.length > 0 && (
                  <View className="border-t border-border pt-3">
                    <Text className="text-xs font-semibold text-primary mb-2">Recommendations:</Text>
                    {diagnostic.recommendations.map((rec, idx) => (
                      <Text key={idx} className="text-xs text-foreground mb-1">• {rec}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Quick Recovery Actions */}
          {diagnostic && diagnostic.diagnosis !== 'healthy' && (
            <View className="gap-4">
              <Text className="text-lg font-semibold text-foreground">Quick Recovery Actions</Text>

              <TouchableOpacity
                onPress={handleSoftwareReset}
                disabled={executing}
                className="bg-warning rounded-2xl p-4 active:opacity-80"
              >
                <Text className="text-background font-semibold text-center">
                  {executing ? 'Executing...' : 'Software Reset (Easy)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForceInternalDescriptors}
                disabled={executing}
                className="bg-warning rounded-2xl p-4 active:opacity-80"
              >
                <Text className="text-background font-semibold text-center">
                  {executing ? 'Executing...' : 'Force Internal Descriptors (Medium)'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Recovery Methods */}
          {recoveryMethods.length > 0 && (
            <View className="gap-4">
              <Text className="text-lg font-semibold text-foreground">All Recovery Methods</Text>

              {recoveryMethods.map((method, idx) => (
                <View key={idx} className="bg-surface rounded-2xl p-4 border border-border">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-sm font-semibold text-foreground flex-1">{method.name}</Text>
                    <View className="flex-row gap-2">
                      <Text className={`text-xs font-semibold ${getDifficultyColor(method.difficulty)}`}>
                        {method.difficulty.toUpperCase()}
                      </Text>
                      <Text className="text-xs text-muted">
                        {method.successRate}%
                      </Text>
                    </View>
                  </View>

                  <Text className="text-xs text-muted mb-2">{method.description}</Text>

                  {method.requiresHardware && (
                    <View className="bg-warning/10 rounded-xl p-2 mb-2">
                      <Text className="text-xs text-warning">⚠️ Requires hardware access</Text>
                    </View>
                  )}

                  <View className="border-t border-border pt-2">
                    <Text className="text-xs font-semibold text-muted mb-1">Steps:</Text>
                    {method.steps.map((step, stepIdx) => (
                      <Text key={stepIdx} className="text-xs text-foreground mb-1">
                        {stepIdx + 1}. {step}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recovery Guide */}
          {diagnostic && (
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-2">Recovery Guide</Text>
              <Text className="text-xs text-muted whitespace-pre-wrap">
                {AdapterRecovery.generateRecoveryGuide(diagnostic.diagnosis)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
