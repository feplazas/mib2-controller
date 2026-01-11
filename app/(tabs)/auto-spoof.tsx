import { ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useUsbStatus } from '@/lib/usb-status-context';
import { usbService } from '@/lib/usb-service';
import * as Haptics from 'expo-haptics';

type SpoofStep = 'idle' | 'validating' | 'writing_vid_low' | 'writing_vid_high' | 'writing_pid_low' | 'writing_pid_high' | 'verifying' | 'success' | 'error';

export default function AutoSpoofScreen() {
  const { status, device } = useUsbStatus();
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<SpoofStep>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getStepText = (step: SpoofStep): string => {
    switch (step) {
      case 'idle':
        return 'Listo para iniciar';
      case 'validating':
        return 'Validando compatibilidad del chipset...';
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
    if (currentStep === 'success' && ['validating', 'writing_vid_low', 'writing_vid_high', 'writing_pid_low', 'writing_pid_high', 'verifying'].includes(step)) return '✅';
    if (currentStep === 'error') return '❌';
    return '⚪';
  };

  const executeAutoSpoof = async () => {
    if (!device) {
      Alert.alert('Error', 'No hay dispositivo USB conectado');
      return;
    }

    if (!usbService.isCompatibleForSpoofing(device)) {
      Alert.alert(
        'Dispositivo No Compatible',
        `El dispositivo ${device.chipset || 'desconocido'} no es compatible para spoofing.\n\nSolo se soportan adaptadores ASIX AX88772A/B con EEPROM externa.`
      );
      return;
    }

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
          onPress: () => executeWithConfirmation(),
        },
      ]
    );
  };

  const executeWithConfirmation = () => {
    Alert.alert(
      '⚠️ Última Confirmación',
      'Esta es tu última oportunidad para cancelar.\n\n' +
      'El proceso escribirá:\n' +
      '• VID: 0x2001 (D-Link)\n' +
      '• PID: 0x3C05 (DUB-E100)\n\n' +
      '¿Estás ABSOLUTAMENTE seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ejecutar Ahora',
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar que el dispositivo esté abierto
      if (!device.deviceId) {
        throw new Error('Dispositivo no tiene ID válido');
      }

      // Paso 2: Escribir VID byte bajo (0x88 = 0x01)
      setCurrentStep('writing_vid_low');
      await usbService.writeEEPROM(0x88, '01');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 3: Escribir VID byte alto (0x89 = 0x20)
      setCurrentStep('writing_vid_high');
      await usbService.writeEEPROM(0x89, '20');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 4: Escribir PID byte bajo (0x8A = 0x05)
      setCurrentStep('writing_pid_low');
      await usbService.writeEEPROM(0x8A, '05');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 5: Escribir PID byte alto (0x8B = 0x3C)
      setCurrentStep('writing_pid_high');
      await usbService.writeEEPROM(0x8B, '3C');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 6: Verificar escritura
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

    } catch (error: any) {
      setCurrentStep('error');
      setErrorMessage(error.message || 'Error desconocido durante el spoofing');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsExecuting(false);
    }
  };

  const canExecute = status === 'connected' && device && usbService.isCompatibleForSpoofing(device);

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
              Reprogramación automática de EEPROM según Guíaspoofing.pdf
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

          {/* Valores Objetivo */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              🎯 Valores Objetivo
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Nuevo VID:</Text>
                <Text className="text-sm text-foreground font-mono font-bold">
                  0x2001 (D-Link)
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Nuevo PID:</Text>
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
            <Text className="text-sm text-background/80 text-center">
              {canExecute
                ? 'Reprogramar EEPROM con un solo toque'
                : 'Conecta un adaptador compatible para continuar'}
            </Text>
          </TouchableOpacity>

          {/* Advertencias */}
          <View className="bg-red-500/10 rounded-2xl p-6 border border-red-500">
            <Text className="text-lg font-bold text-red-500 mb-4">
              ⚠️ Advertencias Importantes
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-foreground">
                • Esta operación es IRREVERSIBLE sin herramientas especializadas
              </Text>
              <Text className="text-sm text-foreground">
                • Puede inutilizar el adaptador si falla ("bricking")
              </Text>
              <Text className="text-sm text-foreground">
                • NO interrumpas el proceso una vez iniciado
              </Text>
              <Text className="text-sm text-foreground">
                • Asegúrate de tener alimentación estable
              </Text>
              <Text className="text-sm text-foreground">
                • Solo para adaptadores ASIX AX88772A/B con EEPROM externa
              </Text>
              <Text className="text-sm text-foreground">
                • NO funciona con chips AX88772C (eFuse bloqueado)
              </Text>
            </View>
          </View>

          {/* Información Técnica */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              📚 Información Técnica
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">
                • Offsets EEPROM: 0x88 (VID), 0x8A (PID)
              </Text>
              <Text className="text-sm text-muted">
                • Formato: Little Endian (byte menos significativo primero)
              </Text>
              <Text className="text-sm text-muted">
                • Comandos USB: ASIX_CMD_WRITE_EEPROM (0x05)
              </Text>
              <Text className="text-sm text-muted">
                • Basado en: Guíaspoofing.pdf (ethtool method)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
