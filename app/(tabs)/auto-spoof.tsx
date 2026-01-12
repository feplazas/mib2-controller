import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useUsbStatus } from '@/lib/usb-status-context';
import { usbService } from '@/lib/usb-service';
import { backupService } from '@/lib/backup-service';
import { ChipsetStatusBadge } from '@/components/chipset-status-badge';
import { getChipsetCompatibility, canAttemptSpoofing, getCompatibilityMessage } from '@/lib/chipset-compatibility';
import { SuccessResultModal } from '@/components/success-result-modal';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useRef } from 'react';

type SpoofStep = 'idle' | 'validating' | 'creating_backup' | 'writing_vid_low' | 'writing_vid_high' | 'writing_pid_low' | 'writing_pid_high' | 'verifying' | 'success' | 'error';

export default function AutoSpoofScreen() {
  const { status, device } = useUsbStatus();
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<SpoofStep>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [spoofingResult, setSpoofingResult] = useState<{
    originalVID: string;
    originalPID: string;
    newVID: string;
    newPID: string;
    chipset: string;
    deviceName: string;
    timestamp: Date;
  } | null>(null);
  const resultModalRef = useRef(null);

  const getStepText = (step: SpoofStep): string => {
    switch (step) {
      case 'idle':
        return 'Listo para iniciar';
      case 'validating':
        return 'Validando compatibilidad del chipset...';
      case 'creating_backup':
        return 'Creando backup de seguridad de EEPROM...';
      case 'writing_vid_low':
        return 'Escribiendo VID byte bajo (0x88)...';
      case 'writing_vid_high':
        return 'Escribiendo VID byte alto (0x89)...';
      case 'writing_pid_low':
        return 'Escribiendo PID byte bajo (0x8A)...';
      case 'writing_pid_high':
        return 'Escribiendo PID byte alto (0x8B)...';
      case 'verifying':
        return 'Verificando escritura...';
      case 'success':
        return '✅ Spoofing completado exitosamente';
      case 'error':
        return '❌ Error durante el spoofing';
      default:
        return '';
    }
  };

  const getStepIcon = (step: SpoofStep): string => {
    if (currentStep === step && isExecuting) return '⏳';
    if (currentStep === 'success' && ['validating', 'creating_backup', 'writing_vid_low', 'writing_vid_high', 'writing_pid_low', 'writing_pid_high', 'verifying'].includes(step)) return '✅';
    if (currentStep === 'error') return '❌';
    return '⚪';
  };

  const executeAutoSpoof = async () => {
    if (!device) {
      Alert.alert('Error', 'No hay dispositivo USB conectado');
      return;
    }

    const compatibility = getChipsetCompatibility(device.chipset || '');
    
    if (!canAttemptSpoofing(compatibility)) {
      Alert.alert(
        'Dispositivo No Compatible',
        getCompatibilityMessage(compatibility, device.chipset || 'desconocido')
      );
      return;
    }
    
    // Advertencia adicional para chipsets experimentales
    if (compatibility === 'experimental') {
      Alert.alert(
        '⚠️ Chipset Experimental',
        `${device.chipset} no está 100% confirmado pero debería funcionar.\n\n¿Deseas continuar con el spoofing?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sí, Continuar', onPress: () => proceedWithSpoofing() },
        ]
      );
      return;
    }
    
    proceedWithSpoofing();
  };
  
  const proceedWithSpoofing = () => {

    if (!device) return;
    
    // Validación adicional: Verificar que el dispositivo aún está conectado
    if (status !== 'connected') {
      Alert.alert('Error', 'El dispositivo USB se desconectó. Por favor reconecta y vuelve a intentar.');
      return;
    }

    // Validación: Advertir sobre cable OTG y alimentación
    Alert.alert(
      '🔌 Verificación de Requisitos',
      '✅ ANTES DE CONTINUAR, VERIFICA:\n\n' +
      '1. Cable OTG conectado correctamente\n' +
      '2. Adaptador USB enchufado firmemente\n' +
      '3. Batería del teléfono >20%\n' +
      '4. NO desconectarás el adaptador durante el proceso\n\n' +
      '⚠️ Desconectar durante la escritura puede INUTILIZAR el adaptador permanentemente.\n\n' +
      '¿Todos los requisitos están cumplidos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Continuar',
          onPress: () => showCriticalWarning(),
        },
      ]
    );
  };

  const showCriticalWarning = () => {
    // Confirmación con advertencias
    Alert.alert(
      '⚠️ Advertencia Crítica',
      'Esta operación modificará permanentemente la EEPROM del adaptador USB.\n\n' +
      '⚠️ RIESGOS:\n' +
      '• Puede inutilizar el dispositivo ("bricking")\n' +
      '• No se puede deshacer fácilmente\n' +
      '• Requiere reconexión física del adaptador\n\n' +
      '✅ REQUISITOS:\n' +
      '• Adaptador ASIX AX88772A o AX88772B\n' +
      '• EEPROM externa (NO eFuse)\n' +
      '• Alimentación estable durante el proceso\n\n' +
      '¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => showFinalConfirmation(),
        },
      ]
    );
  };

  const showFinalConfirmation = () => {
    Alert.alert(
      '⚠️ Confirmación Final',
      'ÚLTIMA OPORTUNIDAD PARA CANCELAR\n\n' +
      '📋 Resumen de cambios:\n' +
      `• VID actual: ${usbService.formatVIDPID(device!.vendorId, device!.productId)}\n` +
      '• VID nuevo: 0x2001 (D-Link)\n' +
      '• PID nuevo: 0x3C05 (DUB-E100)\n\n' +
      '✅ Se creará un backup automático antes de escribir\n\n' +
      '⚠️ NO TOQUES EL ADAPTADOR DURANTE EL PROCESO\n\n' +
      '¿Ejecutar spoofing AHORA?',
      [
        { text: 'NO, Cancelar', style: 'cancel' },
        {
          text: 'SÍ, Ejecutar',
          style: 'destructive',
          onPress: () => performSpoof(),
        },
      ]
    );
  };

  const performSpoof = async () => {
    if (!device) return;

    setIsExecuting(true);
    setErrorMessage('');
    setSuccessMessage('');
    setCurrentStep('validating');

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Paso 1: Validar compatibilidad
      const compatibility = getChipsetCompatibility(device.chipset || '');
      if (!canAttemptSpoofing(compatibility)) {
        throw new Error('Dispositivo no compatible para spoofing');
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Paso 2: Crear backup automático
      setCurrentStep('creating_backup');
      await backupService.createBackup(device);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Paso 3: Escribir VID byte bajo (0x88 = 0x01)
      setCurrentStep('writing_vid_low');
      await usbService.writeEEPROM(0x88, '01');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 4: Escribir VID byte alto (0x89 = 0x20)
      setCurrentStep('writing_vid_high');
      await usbService.writeEEPROM(0x89, '20');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 5: Escribir PID byte bajo (0x8A = 0x05)
      setCurrentStep('writing_pid_low');
      await usbService.writeEEPROM(0x8A, '05');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 6: Escribir PID byte alto (0x8B = 0x3C)
      setCurrentStep('writing_pid_high');
      await usbService.writeEEPROM(0x8B, '3C');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 7: Verificar escritura
      setCurrentStep('verifying');
      const vidLow = await usbService.readEEPROM(0x88, 1);
      const vidHigh = await usbService.readEEPROM(0x89, 1);
      const pidLow = await usbService.readEEPROM(0x8A, 1);
      const pidHigh = await usbService.readEEPROM(0x8B, 1);

      if (vidLow.data !== '01' || vidHigh.data !== '20' || pidLow.data !== '05' || pidHigh.data !== '3C') {
        throw new Error('Verificación falló: Los datos escritos no coinciden');
      }

      // Éxito
      setCurrentStep('success');
      
      // Capturar resultado para modal
      setSpoofingResult({
        originalVID: usbService.formatVIDPID(device.vendorId, 0).split(':')[0],
        originalPID: usbService.formatVIDPID(0, device.productId).split(':')[1],
        newVID: '0x2001',
        newPID: '0x3C05',
        chipset: device.chipset || 'Desconocido',
        deviceName: device.deviceName,
        timestamp: new Date(),
      });
      
      setSuccessMessage(
        'Spoofing completado exitosamente.\n\n' +
        '📋 Valores escritos:\n' +
        '• VID: 0x2001 (D-Link)\n' +
        '• PID: 0x3C05 (DUB-E100)\n\n' +
        '🔌 SIGUIENTE PASO:\n' +
        '1. Desconecta el adaptador USB\n' +
        '2. Espera 5 segundos\n' +
        '3. Vuelve a conectarlo\n' +
        '4. Verifica el nuevo ID en la pantalla "Estado USB"'
      );
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Mostrar modal de éxito después de un breve delay
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 1000);

    } catch (error: any) {
      setCurrentStep('error');
      setErrorMessage(error.message || 'Error desconocido durante el spoofing');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsExecuting(false);
    }
  };

  const canExecute = status === 'connected' && device && canAttemptSpoofing(getChipsetCompatibility(device.chipset || ''));
  
  const handleShareResult = async () => {
    try {
      if (!spoofingResult) return;
      
      // Crear texto formateado para compartir
      const shareText = `🎉 Spoofing MIB2 Exitoso\n\n` +
        `💻 Dispositivo: ${spoofingResult.deviceName}\n` +
        `🔧 Chipset: ${spoofingResult.chipset}\n` +
        `📅 Fecha: ${spoofingResult.timestamp.toLocaleString('es-ES')}\n\n` +
        `❌ Antes:\n` +
        `  VID: ${spoofingResult.originalVID}\n` +
        `  PID: ${spoofingResult.originalPID}\n\n` +
        `✅ Después:\n` +
        `  VID: ${spoofingResult.newVID}\n` +
        `  PID: ${spoofingResult.newPID}\n\n` +
        `#MIB2Controller #USBSpoofing #ASIX`;

      // Verificar si sharing está disponible
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Crear archivo temporal con el texto
        const FileSystem = require('expo-file-system');
        const fileUri = FileSystem.cacheDirectory + 'spoofing_result.txt';
        await FileSystem.writeAsStringAsync(fileUri, shareText);
        
        // Compartir archivo
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Compartir Resultado de Spoofing',
        });
      } else {
        Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo');
      }
    } catch (error) {
      console.error('Error sharing result:', error);
      Alert.alert('Error', 'No se pudo compartir el resultado');
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-foreground mb-2">
              🔧 Spoofing Automático
            </Text>
            <Text className="text-sm text-muted text-center">
              Reprogramación automática de EEPROM para adaptadores ASIX compatibles
            </Text>
          </View>

          {/* Estado del Dispositivo */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              📱 Dispositivo Conectado
            </Text>
            {device ? (
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Nombre:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {device.deviceName}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">VID:PID Actual:</Text>
                  <Text className="text-sm text-foreground font-mono">
                    {usbService.formatVIDPID(device.vendorId, device.productId)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Chipset:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {device.chipset || 'Desconocido'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Compatible:</Text>
                  <Text className={`text-sm font-bold ${canExecute ? 'text-green-500' : 'text-red-500'}`}>
                    {canExecute ? '✅ Sí' : '❌ No'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text className="text-sm text-muted">
                No hay dispositivo conectado
              </Text>
            )}
          </View>

          {/* Badge de Estado del Chipset */}
          {device && device.chipset && (
            <ChipsetStatusBadge
              chipset={device.chipset}
              compatibility={getChipsetCompatibility(device.chipset)}
              animated={true}
            />
          )}

          {/* Valores Objetivo */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              🎯 Valores Objetivo
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">VID (Vendor ID):</Text>
                <Text className="text-sm text-foreground font-mono font-bold">
                  0x2001 (D-Link)
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">PID (Product ID):</Text>
                <Text className="text-sm text-foreground font-mono font-bold">
                  0x3C05 (DUB-E100)
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Magic Value:</Text>
                <Text className="text-sm text-foreground font-mono">
                  0xDEADBEEF
                </Text>
              </View>
            </View>
          </View>

          {/* Progreso */}
          {isExecuting && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">
                ⏳ Progreso
              </Text>
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon('validating')}</Text>
                  <Text className="text-sm text-muted flex-1">Validando chipset</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon('creating_backup')}</Text>
                  <Text className="text-sm text-muted flex-1">Creando backup de seguridad</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon('writing_vid_low')}</Text>
                  <Text className="text-sm text-muted flex-1">Escribiendo VID byte bajo (0x88)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon('writing_vid_high')}</Text>
                  <Text className="text-sm text-muted flex-1">Escribiendo VID byte alto (0x89)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon('writing_pid_low')}</Text>
                  <Text className="text-sm text-muted flex-1">Escribiendo PID byte bajo (0x8A)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon('writing_pid_high')}</Text>
                  <Text className="text-sm text-muted flex-1">Escribiendo PID byte alto (0x8B)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon('verifying')}</Text>
                  <Text className="text-sm text-muted flex-1">Verificando escritura</Text>
                </View>
              </View>
              <View className="mt-4 p-4 bg-background rounded-lg">
                <Text className="text-sm text-foreground font-medium text-center">
                  {getStepText(currentStep)}
                </Text>
              </View>
            </View>
          )}

          {/* Mensaje de Éxito */}
          {currentStep === 'success' && successMessage && (
            <View className="bg-green-500/10 rounded-2xl p-6 border border-green-500">
              <Text className="text-sm text-foreground whitespace-pre-line">
                {successMessage}
              </Text>
            </View>
          )}

          {/* Mensaje de Error */}
          {currentStep === 'error' && errorMessage && (
            <View className="bg-red-500/10 rounded-2xl p-6 border border-red-500">
              <Text className="text-lg font-bold text-red-500 mb-2">
                Error
              </Text>
              <Text className="text-sm text-foreground">
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Advertencias de Seguridad */}
          <View className="bg-red-500/10 rounded-2xl p-6 border border-red-500">
            <Text className="text-lg font-bold text-red-500 mb-3">
              ⚠️ Advertencias Importantes
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-foreground">
                • Esta operación es IRREVERSIBLE sin backup
              </Text>
              <Text className="text-sm text-foreground">
                • NO desconectes el adaptador durante el proceso
              </Text>
              <Text className="text-sm text-foreground">
                • Solo funciona con ASIX AX88772A/B con EEPROM externa
              </Text>
              <Text className="text-sm text-foreground">
                • Dispositivos con eFuse NO son compatibles
              </Text>
              <Text className="text-sm text-foreground">
                • Se creará un backup automático antes de escribir
              </Text>
            </View>
          </View>

          {/* Botón de Ejecución */}
          <TouchableOpacity
            onPress={executeAutoSpoof}
            disabled={!canExecute || isExecuting}
            className={`rounded-2xl p-6 items-center ${
              canExecute && !isExecuting
                ? 'bg-primary'
                : 'bg-muted opacity-50'
            }`}
          >
            <Text className="text-2xl font-bold text-background mb-2">
              {isExecuting ? '⏳ Ejecutando...' : '🚀 Ejecutar Spoofing Automático'}
            </Text>
            {!canExecute && !isExecuting && (
              <Text className="text-xs text-background opacity-70">
                Conecta un adaptador compatible para continuar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Success Result Modal */}
      <SuccessResultModal
        visible={showSuccessModal}
        result={spoofingResult}
        onClose={() => {
          setShowSuccessModal(false);
          setSpoofingResult(null);
        }}
        onShare={handleShareResult}
      />
    </ScreenContainer>
  );
}
