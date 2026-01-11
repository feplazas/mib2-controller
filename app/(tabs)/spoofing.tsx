import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { usbService, type UsbDevice, ASIX_VENDOR_ID } from '@/lib/usb-service';
import { EepromAnalyzer, type EepromAnalysis } from '@/lib/eeprom-analyzer';
import { EepromWriter, type SpoofingProgress } from '@/lib/eeprom-writer';
import * as Haptics from 'expo-haptics';

type Step = 'detect' | 'analyze' | 'preview' | 'confirm' | 'execute' | 'complete';

export default function SpoofingScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('detect');
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<UsbDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<UsbDevice | null>(null);
  const [analysis, setAnalysis] = useState<EepromAnalysis | null>(null);
  const [progress, setProgress] = useState<SpoofingProgress | null>(null);
  const [result, setResult] = useState<string>('');
  const [dryRunMode, setDryRunMode] = useState(false);

  useEffect(() => {
    initializeUsb();
  }, []);

  const initializeUsb = async () => {
    try {
      await usbService.initialize();
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize USB service');
    }
  };

  const handleDetectAdapters = async () => {
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const asixDevices = await usbService.detectAsixAdapters();
      
      if (asixDevices.length === 0) {
        Alert.alert(
          'No Adapters Found',
          'No ASIX AX88772 adapters detected. Please connect an adapter and try again.'
        );
      } else {
        setDevices(asixDevices);
        if (asixDevices.length === 1) {
          setSelectedDevice(asixDevices[0]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to detect USB adapters');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDevice = async (device: UsbDevice) => {
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Solicitar permiso
      const hasPermission = await usbService.requestPermission(device);
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'USB permission is required to continue');
        setLoading(false);
        return;
      }

      // Abrir conexión
      const opened = await usbService.openDevice(device);
      if (!opened) {
        Alert.alert('Error', 'Failed to open USB device');
        setLoading(false);
        return;
      }

      setSelectedDevice(device);
      setCurrentStep('analyze');
      
      // Analizar EEPROM automáticamente
      await handleAnalyzeEeprom();
    } catch (error) {
      Alert.alert('Error', 'Failed to select device');
      setLoading(false);
    }
  };

  const handleAnalyzeEeprom = async () => {
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const eepromAnalysis = await EepromAnalyzer.analyzeEeprom();
      setAnalysis(eepromAnalysis);
      
      // Validar compatibilidad
      const compatibility = EepromAnalyzer.validateCompatibility(eepromAnalysis);
      if (!compatibility.compatible) {
        Alert.alert(
          'Incompatible Adapter',
          compatibility.reason || 'This adapter cannot be spoofed',
          [{ text: 'OK', onPress: () => setCurrentStep('detect') }]
        );
        setLoading(false);
        return;
      }

      setCurrentStep('preview');
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze EEPROM: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPreview = () => {
    if (!analysis) return;

    const summary = EepromWriter.generateOperationSummary(analysis);
    const validation = EepromWriter.validatePrerequisites(analysis);

    let message = summary + '\n\n';
    
    if (validation.warnings.length > 0) {
      message += 'WARNINGS:\n';
      validation.warnings.forEach(w => message += `- ${w}\n`);
      message += '\n';
    }

    Alert.alert('Spoofing Preview', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', onPress: () => setCurrentStep('confirm') },
    ]);
  };

  const handleConfirmSpoofing = () => {
    Alert.alert(
      '⚠️ FINAL CONFIRMATION',
      'This operation will PERMANENTLY modify the adapter\'s EEPROM.\n\n' +
      'There is a risk of "bricking" the device if:\n' +
      '- The adapter is disconnected during the process\n' +
      '- The chipset has eFuse protection\n' +
      '- Power is interrupted\n\n' +
      'Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I Understand, Proceed',
          style: 'destructive',
          onPress: handleExecuteSpoofing,
        },
      ]
    );
  };

  const handleExecuteSpoofing = async () => {
    if (!analysis) return;

    setCurrentStep('execute');
    setLoading(true);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      const spoofingResult = await EepromWriter.performSpoofing(analysis, (prog) => {
        setProgress(prog);
      }, dryRunMode);

      if (spoofingResult.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Mostrar cambios simulados si es Dry Run
        if (spoofingResult.dryRun && spoofingResult.simulatedChanges) {
          let changesSummary = 'Simulated Changes:\n\n';
          spoofingResult.simulatedChanges.forEach(change => {
            changesSummary += `${change.offsetName} (0x${change.offset.toString(16).padStart(2, '0')}): `;
            changesSummary += `0x${change.oldValue.toString(16).padStart(2, '0')} → `;
            changesSummary += `0x${change.newValue.toString(16).padStart(2, '0')}\n`;
          });
          setResult('DRY RUN SUCCESS:\n' + spoofingResult.message + '\n\n' + changesSummary);
        } else {
          setResult('SUCCESS: ' + spoofingResult.message);
        }
        
        setCurrentStep('complete');
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Spoofing Failed', spoofingResult.message + '\n\nError: ' + spoofingResult.error);
        setCurrentStep('preview');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Spoofing operation failed: ' + error);
      setCurrentStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('detect');
    setDevices([]);
    setSelectedDevice(null);
    setAnalysis(null);
    setProgress(null);
    setResult('');
    usbService.closeDevice();
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">ASIX Adapter Spoofing</Text>
            <Text className="text-sm text-muted text-center">
              Reprogram ASIX AX88772 adapters to emulate D-Link DUB-E100
            </Text>
          </View>

          {/* Step Indicator */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row justify-between">
              {['Detect', 'Analyze', 'Preview', 'Confirm', 'Execute', 'Complete'].map((label, idx) => {
                const stepKeys: Step[] = ['detect', 'analyze', 'preview', 'confirm', 'execute', 'complete'];
                const isActive = stepKeys[idx] === currentStep;
                const isPast = stepKeys.indexOf(currentStep) > idx;
                
                return (
                  <View key={label} className="items-center flex-1">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center ${
                        isActive
                          ? 'bg-primary'
                          : isPast
                          ? 'bg-success'
                          : 'bg-border'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${isActive || isPast ? 'text-white' : 'text-muted'}`}>
                        {idx + 1}
                      </Text>
                    </View>
                    <Text className="text-xs text-muted mt-1">{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Step 1: Detect Adapters */}
          {currentStep === 'detect' && (
            <View className="gap-4">
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <Text className="text-lg font-semibold text-foreground mb-2">Step 1: Detect Adapters</Text>
                <Text className="text-sm text-muted mb-4">
                  Connect an ASIX AX88772 USB-Ethernet adapter to your Android device using an OTG cable.
                </Text>
                
                <TouchableOpacity
                  onPress={handleDetectAdapters}
                  disabled={loading}
                  className="bg-primary px-6 py-3 rounded-full active:opacity-80"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-background font-semibold text-center">Scan for Adapters</Text>
                  )}
                </TouchableOpacity>
              </View>

              {devices.length > 0 && (
                <View className="bg-surface rounded-2xl p-6 border border-border">
                  <Text className="text-lg font-semibold text-foreground mb-4">Found {devices.length} Adapter(s)</Text>
                  {devices.map((device, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectDevice(device)}
                      className="bg-background rounded-xl p-4 mb-2 border border-border active:opacity-70"
                    >
                      <Text className="text-base font-semibold text-foreground">{device.productName || 'ASIX AX88772'}</Text>
                      <Text className="text-sm text-muted mt-1">
                        VID: 0x{device.vendorId.toString(16).padStart(4, '0')} | 
                        PID: 0x{device.productId.toString(16).padStart(4, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Step 2: Analyze (automatic) */}
          {currentStep === 'analyze' && (
            <View className="bg-surface rounded-2xl p-6 border border-border items-center">
              <ActivityIndicator size="large" color="#0a7ea4" />
              <Text className="text-lg font-semibold text-foreground mt-4">Analyzing EEPROM...</Text>
              <Text className="text-sm text-muted mt-2 text-center">
                Reading adapter memory and detecting VID/PID offsets
              </Text>
            </View>
          )}

          {/* Step 3: Preview */}
          {currentStep === 'preview' && analysis && (
            <View className="gap-4">
              <View className="bg-surface rounded-2xl p-6 border border-border">
                <Text className="text-lg font-semibold text-foreground mb-4">EEPROM Analysis</Text>
                
                <View className="gap-2">
                  {analysis.adapterSpec && (
                    <View className="mb-2 pb-2 border-b border-border">
                      <Text className="text-xs text-muted mb-1">Detected Adapter:</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {analysis.adapterSpec.vendorName} {analysis.adapterSpec.productName}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Chipset:</Text>
                    <Text className="text-sm font-semibold text-foreground">{analysis.chipsetVersion}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">EEPROM:</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      {analysis.adapterSpec?.eepromType || 'Unknown'} ({analysis.size} bytes)
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Current VID:</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      0x{analysis.currentVid.toString(16).padStart(4, '0')}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Current PID:</Text>
                    <Text className="text-sm font-semibold text-foreground">
                      0x{analysis.currentPid.toString(16).padStart(4, '0')}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Compatibility:</Text>
                    <Text className={`text-sm font-semibold ${
                      analysis.compatibilityReport?.level === 'high' ? 'text-success' :
                      analysis.compatibilityReport?.level === 'medium' ? 'text-warning' :
                      'text-error'
                    }`}>
                      {analysis.compatibilityReport?.level.toUpperCase() || 'UNKNOWN'}
                    </Text>
                  </View>
                </View>
                
                {analysis.compatibilityReport?.warnings && analysis.compatibilityReport.warnings.length > 0 && (
                  <View className="mt-4 bg-warning/10 rounded-xl p-3 border border-warning">
                    <Text className="text-xs font-semibold text-warning mb-1">Warnings:</Text>
                    {analysis.compatibilityReport.warnings.map((warning, idx) => (
                      <Text key={idx} className="text-xs text-foreground">• {warning}</Text>
                    ))}
                  </View>
                )}
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleShowPreview}
                  className="flex-1 bg-primary px-6 py-3 rounded-full active:opacity-80"
                >
                  <Text className="text-background font-semibold text-center">View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCurrentStep('confirm')}
                  className="flex-1 bg-success px-6 py-3 rounded-full active:opacity-80"
                >
                  <Text className="text-white font-semibold text-center">Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 4: Confirm */}
          {currentStep === 'confirm' && analysis && (
            <View className="gap-4">
              <View className="bg-error/10 rounded-2xl p-6 border border-error">
                <Text className="text-lg font-bold text-error mb-2">⚠️ WARNING</Text>
                <Text className="text-sm text-foreground leading-relaxed">
                  This operation will PERMANENTLY modify the adapter's EEPROM memory. There is a risk of "bricking" the device if the process is interrupted or fails.
                  {'\n\n'}
                  Ensure the adapter remains connected during the entire process.
                </Text>
              </View>

              <View className="bg-surface rounded-2xl p-6 border border-border">
                <Text className="text-lg font-semibold text-foreground mb-4">Operation Summary</Text>
                <View className="gap-2">
                  <Text className="text-sm text-muted">Current: ASIX AX88772</Text>
                  <Text className="text-sm text-muted">Target: D-Link DUB-E100</Text>
                  <Text className="text-sm text-muted mt-2">Estimated Time: ~12 seconds</Text>
                </View>
              </View>

              {/* Dry Run Toggle */}
              <View className="flex-row items-center justify-between bg-surface rounded-2xl p-4 border border-border">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Dry Run Mode</Text>
                  <Text className="text-xs text-muted">Simulate without writing to EEPROM</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setDryRunMode(!dryRunMode)}
                  className={`w-14 h-8 rounded-full p-1 ${dryRunMode ? 'bg-primary' : 'bg-border'}`}
                >
                  <View className={`w-6 h-6 rounded-full bg-background transition-all ${dryRunMode ? 'ml-6' : 'ml-0'}`} />
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleReset}
                  className="flex-1 bg-border px-6 py-3 rounded-full active:opacity-80"
                >
                  <Text className="text-foreground font-semibold text-center">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirmSpoofing}
                  className={`flex-1 px-6 py-3 rounded-full active:opacity-80 ${dryRunMode ? 'bg-warning' : 'bg-error'}`}
                >
                  <Text className="text-white font-semibold text-center">
                    {dryRunMode ? 'Run Simulation' : 'Start Spoofing'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 5: Execute */}
          {currentStep === 'execute' && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-4 text-center">Spoofing in Progress...</Text>
              
              {progress && (
                <>
                  <View className="bg-border rounded-full h-4 mb-4 overflow-hidden">
                    <View
                      className="bg-primary h-full"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </View>
                  
                  <Text className="text-sm text-muted text-center mb-2">
                    Step {progress.step} of {progress.totalSteps}
                  </Text>
                  <Text className="text-sm text-foreground text-center">
                    {progress.message}
                  </Text>
                </>
              )}

              <View className="bg-warning/10 rounded-xl p-4 mt-4 border border-warning">
                <Text className="text-sm text-foreground text-center">
                  ⚠️ DO NOT disconnect the adapter
                </Text>
              </View>
            </View>
          )}

          {/* Step 6: Complete */}
          {currentStep === 'complete' && (
            <View className="gap-4">
              <View className="bg-success/10 rounded-2xl p-6 border border-success">
                <Text className="text-2xl font-bold text-success mb-2 text-center">✓ Success!</Text>
                <Text className="text-sm text-foreground text-center leading-relaxed">
                  {result}
                </Text>
              </View>

              <View className="bg-surface rounded-2xl p-6 border border-border">
                <Text className="text-lg font-semibold text-foreground mb-2">Next Steps:</Text>
                <Text className="text-sm text-muted leading-relaxed">
                  1. Disconnect the adapter from your Android device{'\n'}
                  2. Wait 5 seconds{'\n'}
                  3. Reconnect the adapter{'\n'}
                  4. The adapter should now identify as D-Link DUB-E100{'\n'}
                  5. Connect it to your MIB2 unit via USB
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleReset}
                className="bg-primary px-6 py-3 rounded-full active:opacity-80"
              >
                <Text className="text-background font-semibold text-center">Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
