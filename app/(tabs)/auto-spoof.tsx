import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useReducer } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useUsbStatus } from '@/lib/usb-status-context';
import { usbService } from '@/lib/usb-service';
import { backupService } from '@/lib/backup-service';
import { ChipsetStatusBadge } from '@/components/chipset-status-badge';
import { getChipsetCompatibility, canAttemptSpoofing, getCompatibilityMessageKey } from '@/lib/chipset-compatibility';
import { SuccessResultModal } from '@/components/success-result-modal';
import { EepromProgressIndicator } from '@/components/eeprom-progress-indicator';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { spoofReducer, initialSpoofState, getStepIcon } from '@/lib/spoof-reducer';
import { useTranslation } from "@/lib/language-context";
import { usbLogger } from '@/lib/usb-logger';
import { showAlert } from '@/lib/translated-alert';
export default function AutoSpoofScreen() {
  const t = useTranslation();
  const { status, device } = useUsbStatus();
  const [state, dispatch] = useReducer(spoofReducer, initialSpoofState);

  // Helper para obtener texto de paso traducido
  const getStepText = (step: string): string => {
    const stepTexts: Record<string, string> = {
      'idle': t('auto_spoof.step_idle'),
      'validating': t('auto_spoof.step_validating'),
      'creating_backup': t('auto_spoof.step_creating_backup'),
      'writing_vid_low': t('auto_spoof.step_writing_vid_low'),
      'writing_vid_high': t('auto_spoof.step_writing_vid_high'),
      'writing_pid_low': t('auto_spoof.step_writing_pid_low'),
      'writing_pid_high': t('auto_spoof.step_writing_pid_high'),
      'verifying': t('auto_spoof.step_verifying'),
      'success': t('auto_spoof.step_success'),
      'error': t('auto_spoof.step_error'),
    };
    return stepTexts[step] || step;
  };

  const executeAutoSpoof = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    const compatibility = getChipsetCompatibility(device.chipset || '');
    
    if (!canAttemptSpoofing(compatibility)) {
      Alert.alert(
        t('auto_spoof.device_not_compatible'),
        t(getCompatibilityMessageKey(compatibility), { chipset: device.chipset || t('common.unknown') })
      );
      return;
    }
    
    // DETECCIÓN REAL de EEPROM vs eFuse
    Alert.alert(
      t('auto_spoof.detecting_eeprom_title'),
      t('auto_spoof.detecting_eeprom_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('auto_spoof.detect_now'), onPress: async () => {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            // Realizar detección REAL
            const eepromType = await usbService.detectEEPROMType();
            
            if (!eepromType.writable) {
              // eFuse detectado - BLOQUEAR spoofing
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                t('auto_spoof.spoofing_blocked'),
                t('auto_spoof.spoofing_blocked_message', { 
                  type: eepromType.type.toUpperCase(), 
                  reason: eepromType.reason 
                }),
                [{ text: t('common.understood') }]
              );
              return;
            }
            
            // EEPROM externa detectada - PERMITIR spoofing
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              t('auto_spoof.eeprom_detected'),
              t('auto_spoof.eeprom_detected_message', { type: eepromType.type.toUpperCase() }),
              [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('auto_spoof.yes_continue'), onPress: () => proceedWithSpoofing() }
              ]
            );
          } catch (error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              t('auto_spoof.detection_error'),
              t('auto_spoof.detection_error_message', { error: String(error) })
            );
          }
        }}
      ]
    );
    return;
    
    proceedWithSpoofing();
  };
  
  const proceedWithSpoofing = () => {

    if (!device) return;
    
    // Validación adicional: Verificar que el dispositivo aún está conectado
    if (status !== 'connected') {
      showAlert('alerts.error', 'alerts.el_dispositivo_usb_se_desconectó_por_favor_reconec');
      return;
    }

    // Validación: Advertir sobre cable OTG y alimentación
    Alert.alert(
      t('auto_spoof.requirements_title'),
      t('auto_spoof.requirements_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auto_spoof.yes_continue'),
          onPress: () => showCriticalWarning(),
        },
      ]
    );
  };

  const showCriticalWarning = () => {
    // Confirmación con advertencias
    Alert.alert(
      t('auto_spoof.critical_warning_title'),
      t('auto_spoof.critical_warning_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auto_spoof.continue'),
          style: 'destructive',
          onPress: () => showFinalConfirmation(),
        },
      ]
    );
  };

  const showFinalConfirmation = () => {
    Alert.alert(
      t('auto_spoof.final_confirmation_title'),
      t('auto_spoof.final_confirmation_message', {
        currentVidPid: usbService.formatVIDPID(device!.vendorId, device!.productId)
      }),
      [
        { text: t('auto_spoof.no_cancel'), style: 'cancel' },
        {
          text: t('auto_spoof.yes_execute'),
          style: 'destructive',
          onPress: () => performSpoof(),
        },
      ]
    );
  };

  const performSpoof = async () => {
    if (!device) return;

    dispatch({ type: 'START_EXECUTION' });
    dispatch({ type: 'SET_ERROR', payload: '' });
    dispatch({ type: 'SET_STEP', payload: 'validating' });

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Paso 1: Validar compatibilidad
      const compatibility = getChipsetCompatibility(device.chipset || '');
      if (!canAttemptSpoofing(compatibility)) {
        throw new Error(t('auto_spoof.error_not_compatible'));
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Paso 2: Crear backup automático
      dispatch({ type: 'SET_STEP', payload: 'creating_backup' });
      dispatch({ type: 'RESET_PROGRESS', payload: { operation: 'read', totalBytes: state.eepromProgress.totalBytes } });
      
      // Simular progreso de lectura de backup
      for (let i = 0; i <= 100; i += 10) {
        dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: i } });
        dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: Math.floor((i / 100) * 256) } });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      await backupService.createBackup(device);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Resetear progreso para escritura
      dispatch({ type: 'RESET_PROGRESS', payload: { operation: 'write', totalBytes: state.eepromProgress.totalBytes } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 0 } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 0 } });
      
      // Paso 3: Escribir VID byte bajo (0x88 = 0x01)
      dispatch({ type: 'SET_STEP', payload: 'writing_vid_low' });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 25 } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 1 } });
      await usbService.writeEEPROM(0x88, '01', state.skipVerification);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 4: Escribir VID byte alto (0x89 = 0x20)
      dispatch({ type: 'SET_STEP', payload: 'writing_vid_high' });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 50 } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 2 } });
      await usbService.writeEEPROM(0x89, '20', state.skipVerification);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 5: Escribir PID byte bajo (0x8A = 0x05)
      dispatch({ type: 'SET_STEP', payload: 'writing_pid_low' });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 75 } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 3 } });
      await usbService.writeEEPROM(0x8A, '05', state.skipVerification);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 6: Escribir PID byte alto (0x8B = 0x3C)
      dispatch({ type: 'SET_STEP', payload: 'writing_pid_high' });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 100 } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 4 } });
      await usbService.writeEEPROM(0x8B, '3C', state.skipVerification);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 7: Verificar escritura
      dispatch({ type: 'SET_STEP', payload: 'verifying' });
      const vidLow = await usbService.readEEPROM(0x88, 1);
      const vidHigh = await usbService.readEEPROM(0x89, 1);
      const pidLow = await usbService.readEEPROM(0x8A, 1);
      const pidHigh = await usbService.readEEPROM(0x8B, 1);

      if (vidLow.data !== '01' || vidHigh.data !== '20' || pidLow.data !== '05' || pidHigh.data !== '3C') {
        throw new Error(t('auto_spoof.error_verification_failed'));
      }

      // Éxito
      const verificationNote = state.skipVerification 
        ? '\n' + t('auto_spoof.verification_skipped_note')
        : '';
      
      const successMsg = t('auto_spoof.success_message') + verificationNote + '\n\n' + t('auto_spoof.reconnect_instructions');
      
      dispatch({ 
        type: 'SET_SUCCESS', 
        payload: { 
          message: successMsg,
          result: {
            originalVID: usbService.formatVIDPID(device.vendorId, 0).split(':')[0],
            originalPID: usbService.formatVIDPID(0, device.productId).split(':')[1],
            newVID: '0x2001',
            newPID: '0x3C05',
            chipset: device.chipset || t('common.unknown'),
            deviceName: device.deviceName,
            timestamp: new Date(),
          }
        } 
      });
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Mostrar modal de éxito después de un breve delay
      setTimeout(() => {
        dispatch({ type: 'SHOW_SUCCESS_MODAL', payload: true });
      }, 1000);

    } catch (error: any) {
      dispatch({ type: 'SET_STEP', payload: 'error' });
      dispatch({ type: 'SET_ERROR', payload: error.message || t('auto_spoof.error_unknown') });
      usbLogger.error('SPOOF', `Error en spoofing: ${error.message}`, error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const canExecute = status === 'connected' && device && canAttemptSpoofing(getChipsetCompatibility(device.chipset || ''));

  // Función REAL de Test de Spoofing
  const handleTestSpoofing = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    const compatibility = getChipsetCompatibility(device.chipset || '');
    
    // Si es un adaptador confirmado compatible, no tiene sentido hacer el test
    if (compatibility === 'confirmed') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('auto_spoof.already_compatible_title'),
        t('auto_spoof.already_compatible_message', { chipset: device.chipset }),
        [{ text: t('common.understood') }]
      );
      return;
    }

    dispatch({ type: 'START_TEST' });
    dispatch({ type: 'SET_TEST_RESULT', payload: null });
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Re-escanear dispositivos USB REALES
      const devices = await usbService.scanDevices();
      
      if (devices.length === 0) {
        Alert.alert(
          t('auto_spoof.device_not_detected_title'),
          t('auto_spoof.device_not_detected_message')
        );
        dispatch({ type: 'SET_TEST_RESULT', payload: 'fail' });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      
      // Verificar VID/PID del primer dispositivo detectado
      const detectedDevice = devices[0];
      const targetVID = 0x2001;
      const targetPID = 0x3C05;
      
      const isSuccess = detectedDevice.vendorId === targetVID && detectedDevice.productId === targetPID;
      
      if (isSuccess) {
        dispatch({ type: 'SET_TEST_RESULT', payload: 'success' });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          t('auto_spoof.test_success_title'),
          t('auto_spoof.test_success_message', {
            deviceName: detectedDevice.deviceName,
            vid: detectedDevice.vendorId.toString(16).toUpperCase().padStart(4, '0'),
            pid: detectedDevice.productId.toString(16).toUpperCase().padStart(4, '0'),
            chipset: detectedDevice.chipset
          })
        );
      } else {
        dispatch({ type: 'SET_TEST_RESULT', payload: 'fail' });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          t('auto_spoof.test_fail_title'),
          t('auto_spoof.test_fail_message', {
            deviceName: detectedDevice.deviceName,
            currentVid: detectedDevice.vendorId.toString(16).toUpperCase().padStart(4, '0'),
            currentPid: detectedDevice.productId.toString(16).toUpperCase().padStart(4, '0')
          })
        );
      }
    } catch (error: any) {
      dispatch({ type: 'SET_TEST_RESULT', payload: 'fail' });
      usbLogger.error('TEST', `Error en test de spoofing: ${error.message}`, error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('alerts.error', t('alerts.no_se_pudo_realizar_test', { error: error.message }));
    }
  };

  // Función REAL de Spoof Rápido (una sola confirmación)
  const handleQuickSpoof = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    const compatibility = getChipsetCompatibility(device.chipset || '');
    
    if (!canAttemptSpoofing(compatibility)) {
      Alert.alert(
        t('auto_spoof.device_not_compatible'),
        t(getCompatibilityMessageKey(compatibility), { chipset: device.chipset || t('common.unknown') })
      );
      return;
    }

    // Una sola confirmación crítica
    Alert.alert(
      t('auto_spoof.quick_spoof_title'),
      t('auto_spoof.quick_spoof_message', {
        deviceName: device.deviceName,
        chipset: device.chipset,
        currentVidPid: usbService.formatVIDPID(device.vendorId, device.productId)
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auto_spoof.yes_execute'),
          style: 'destructive',
          onPress: () => performSpoof(),
        },
      ]
    );
  };
  
  const handleShareResult = async () => {
    try {
      if (!state.spoofingResult) return;
      
      // Crear texto formateado para compartir
      const shareText = t('auto_spoof.share_text', {
        deviceName: state.spoofingResult.deviceName,
        chipset: state.spoofingResult.chipset,
        date: state.spoofingResult.timestamp.toLocaleString(),
        originalVID: state.spoofingResult.originalVID,
        originalPID: state.spoofingResult.originalPID,
        newVID: state.spoofingResult.newVID,
        newPID: state.spoofingResult.newPID
      });

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
          dialogTitle: t('auto_spoof.share_dialog_title'),
        });
      } else {
        showAlert('alerts.error', 'alerts.la_función_de_compartir_no_está_disponible_en_este');
      }
    } catch (error) {
      console.error('Error sharing result:', error);
      showAlert('alerts.error', 'alerts.no_se_pudo_compartir_el_resultado');
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-foreground mb-2">
              🔧 {t('auto_spoof.title')}
            </Text>
            <Text className="text-sm text-muted text-center">
              {t('auto_spoof.subtitle')}
            </Text>
          </View>

          {/* Estado del Dispositivo */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              📱 {t('auto_spoof.connected_device')}
            </Text>
            {device ? (
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('auto_spoof.name')}:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {device.deviceName}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('auto_spoof.current_vid_pid')}:</Text>
                  <Text className="text-sm text-foreground font-mono">
                    {usbService.formatVIDPID(device.vendorId, device.productId)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('auto_spoof.chipset')}:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {device.chipset || t('common.unknown')}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('auto_spoof.compatible')}:</Text>
                  <Text className={`text-sm font-bold ${canExecute ? 'text-green-500' : 'text-red-500'}`}>
                    {canExecute ? '✅ ' + t('common.yes') : '❌ ' + t('common.no')}
                  </Text>
                </View>
              </View>
            ) : (
              <Text className="text-sm text-muted">
                {t('auto_spoof.no_device_connected')}
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
              🎯 {t('auto_spoof.target_values')}
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
          {state.isExecuting && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">
                ⏳ {t('auto_spoof.progress')}
              </Text>
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'validating', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">{t('auto_spoof.step_validating')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'creating_backup', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">{t('auto_spoof.step_creating_backup')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'writing_vid_low', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">{t('auto_spoof.step_writing_vid_low')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'writing_vid_high', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">{t('auto_spoof.step_writing_vid_high')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'writing_pid_low', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">{t('auto_spoof.step_writing_pid_low')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'writing_pid_high', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">{t('auto_spoof.step_writing_pid_high')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'verifying', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">{t('auto_spoof.step_verifying')}</Text>
                </View>
              </View>
              <View className="mt-4 p-4 bg-background rounded-lg">
                <Text className="text-sm text-foreground font-medium text-center">
                  {getStepText(state.currentStep)}
                </Text>
              </View>
            </View>
          )}

          {/* Indicador de Progreso EEPROM */}
          {state.isExecuting && state.eepromProgress.totalBytes > 0 && (
            <EepromProgressIndicator
              progress={state.eepromProgress.progress}
              bytesProcessed={state.eepromProgress.bytesProcessed}
              totalBytes={state.eepromProgress.totalBytes}
              operation={state.eepromProgress.operation}
              estimatedTimeRemaining={
                state.eepromProgress.progress > 0 && state.eepromProgress.progress < 100
                  ? Math.round(((100 - state.eepromProgress.progress) / state.eepromProgress.progress) * 2)
                  : undefined
              }
            />
          )}

          {/* Mensaje de Éxito */}
          {state.currentStep === 'success' && state.successMessage && (
            <View className="bg-green-500/10 rounded-2xl p-6 border border-green-500">
              <Text className="text-sm text-foreground whitespace-pre-line">
                {state.successMessage}
              </Text>
            </View>
          )}

          {/* Mensaje de Error */}
          {state.currentStep === 'error' && state.errorMessage && (
            <View className="bg-red-500/10 rounded-2xl p-6 border border-red-500">
              <Text className="text-lg font-bold text-red-500 mb-2">
                {t('common.error')}
              </Text>
              <Text className="text-sm text-foreground">
                {state.errorMessage}
              </Text>
            </View>
          )}

          {/* Advertencias de Seguridad */}
          <View className="bg-red-500/10 rounded-2xl p-6 border border-red-500">
            <Text className="text-lg font-bold text-red-500 mb-3">
              {t('auto_spoof.important_warnings')}
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-foreground">
                • {t('auto_spoof.warning_1')}
              </Text>
              <Text className="text-sm text-foreground">
                • {t('auto_spoof.warning_4')}
              </Text>
              <Text className="text-sm text-foreground">
                • {t('auto_spoof.warning_2')}
              </Text>
              <Text className="text-sm text-foreground">
                • {t('auto_spoof.warning_3')}
              </Text>
              <Text className="text-sm text-foreground">
                • {t('auto_spoof.warning_5')}
              </Text>
            </View>
          </View>

          {/* Checkbox Forzar sin Verificación */}
          <TouchableOpacity
            onPress={() => {
              dispatch({ type: 'TOGGLE_SKIP_VERIFICATION' });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            disabled={state.isExecuting}
            className="flex-row items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
          >
            <View className={`w-6 h-6 rounded border-2 items-center justify-center ${
              state.skipVerification ? 'bg-yellow-500 border-yellow-500' : 'border-yellow-500'
            }`}>
              {state.skipVerification && <Text className="text-background font-bold">✓</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-yellow-500 mb-1">
                ⚠️ {t('auto_spoof.force_no_verification')}
              </Text>
              <Text className="text-xs text-muted leading-relaxed">
                {t('auto_spoof.force_no_verification_desc')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Botones de Test y Spoof Rápido */}
          <View className="gap-3">
            {/* Botón Test de Spoofing */}
            <TouchableOpacity
              onPress={handleTestSpoofing}
              disabled={state.isTesting}
              className={`rounded-xl p-4 items-center border-2 ${
                state.testResult === 'success'
                  ? 'bg-green-500/10 border-green-500'
                  : state.testResult === 'fail'
                  ? 'bg-red-500/10 border-red-500'
                  : state.isTesting
                  ? 'bg-muted/20 border-muted opacity-50'
                  : 'bg-blue-500/10 border-blue-500 active:opacity-80'
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">
                  {state.isTesting ? '⏳' : state.testResult === 'success' ? '✅' : state.testResult === 'fail' ? '❌' : '🧪'}
                </Text>
                <Text className={`text-base font-bold ${
                  state.testResult === 'success'
                    ? 'text-green-500'
                    : state.testResult === 'fail'
                    ? 'text-red-500'
                    : state.isTesting
                    ? 'text-muted'
                    : 'text-blue-500'
                }`}>
                  {state.isTesting ? t('auto_spoof.testing') : t('auto_spoof.test_spoofing')}
                </Text>
              </View>
              <Text className="text-xs text-muted mt-1">
                {t('auto_spoof.test_spoofing_desc')}
              </Text>
            </TouchableOpacity>

            {/* Botón Spoof Rápido */}
            <TouchableOpacity
              onPress={handleQuickSpoof}
              disabled={!canExecute || state.isExecuting}
              className={`rounded-xl p-4 items-center border-2 ${
                canExecute && !state.isExecuting
                  ? 'bg-orange-500/10 border-orange-500 active:opacity-80'
                  : 'bg-muted/20 border-muted opacity-50'
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">🔄</Text>
                <Text className={`text-base font-bold ${
                  canExecute && !state.isExecuting ? 'text-orange-500' : 'text-muted'
                }`}>
                  {state.isExecuting ? t('auto_spoof.executing') : t('auto_spoof.quick_spoof')}
                </Text>
              </View>
              <Text className="text-xs text-muted mt-1">
                {t('auto_spoof.quick_spoof_desc')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón de Ejecución Principal */}
          <TouchableOpacity
            onPress={executeAutoSpoof}
            disabled={!canExecute || state.isExecuting}
            className={`rounded-2xl p-6 items-center ${
              canExecute && !state.isExecuting
                ? 'bg-primary'
                : 'bg-muted opacity-50'
            }`}
          >
            <Text className="text-2xl font-bold text-background mb-2">
              {state.isExecuting ? '⏳ ' + t('auto_spoof.executing') : '🚀 ' + t('auto_spoof.execute_auto_spoof')}
            </Text>
            {!canExecute && !state.isExecuting && (
              <Text className="text-xs text-background opacity-70">
                {t('auto_spoof.connect_compatible_adapter')}
              </Text>
            )}
            {canExecute && !state.isExecuting && (
              <Text className="text-xs text-background/80 mt-1">
                {t('auto_spoof.with_triple_confirmation')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Success Result Modal */}
      <SuccessResultModal
        visible={state.showSuccessModal}
        onClose={() => dispatch({ type: 'SHOW_SUCCESS_MODAL', payload: false })}
        result={state.spoofingResult}
        onShare={handleShareResult}
      />
    </ScreenContainer>
  );
}
