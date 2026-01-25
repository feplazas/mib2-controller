import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useReducer, useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { Toast } from '@/components/toast';
import { useUsbStatus } from '@/lib/usb-status-context';
import { usbService } from '@/lib/usb-service';
import { backupService } from '@/lib/backup-service';
import { ChipsetStatusBadge } from '@/components/chipset-status-badge';
import { getChipsetCompatibility, canAttemptSpoofing, getCompatibilityMessageKey } from '@/lib/chipset-compatibility';
import { SuccessResultModal } from '@/components/success-result-modal';
import { EepromProgressIndicator } from '@/components/eeprom-progress-indicator';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { haptics } from '@/lib/haptics-service';
import { spoofReducer, initialSpoofState, getStepIcon } from '@/lib/spoof-reducer';
import { useTranslation } from "@/lib/language-context";
import { usbLogger } from '@/lib/usb-logger';
import { showAlert } from '@/lib/translated-alert';

// UI Configuration - Control which buttons are visible
const UI_CONFIG = {
  showDryRun: false,        // Oculto: Safe Test es más completo
  showChecksum: false,      // Oculto: muy técnico para usuarios normales
  showTestSpoofing: false,  // Oculto: redundante con Safe Test
  showQuickSpoof: false,    // Oculto: redundante con Execute
  showSafeTest: true,       // Visible: único modo de prueba
  showForceOption: true,    // Visible: opción avanzada
  showExecute: true,        // Visible: botón principal
};

export default function AutoSpoofScreen() {
  const t = useTranslation();
  const { status, device } = useUsbStatus();
  const [state, dispatch] = useReducer(spoofReducer, initialSpoofState);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fallbacks legibles para claves de safe_test
  const SAFE_TEST_FALLBACKS: Record<string, string> = {
    // Steps
    'safe_test.step.device_validation': 'Validación de dispositivo',
    'safe_test.step.eeprom_detection': 'Detección de EEPROM',
    'safe_test.step.vidpid_read': 'Lectura de VID/PID',
    'safe_test.step.status_check': 'Verificación de estado',
    'safe_test.step.checksum_verify': 'Verificación de checksum',
    'safe_test.step.backup_simulation': 'Simulación de backup',
    'safe_test.step.vid_write_simulation': 'Simulación escritura VID',
    'safe_test.step.pid_write_simulation': 'Simulación escritura PID',
    'safe_test.step.verify_simulation': 'Simulación verificación',
    // Details
    'safe_test.detail.already_spoofed': 'El adaptador ya tiene el VID/PID objetivo - No se requieren cambios',
    'safe_test.detail.checksum_invalid_no_affect': 'Checksum inválido pero no afecta VID/PID',
    'safe_test.detail.device_compatible': 'Dispositivo compatible',
    'safe_test.detail.external_eeprom_writable': 'EEPROM externa detectada - Escritura posible',
    'safe_test.detail.current_vidpid': 'VID actual: {{0}}, PID actual: {{1}}',
    'safe_test.detail.checksum_valid': 'Checksum válido: {{0}}',
    'safe_test.detail.backup_simulated': 'Backup simulado: VID={{0}}, PID={{1}}',
    'safe_test.detail.would_write': 'Escribiría: offset {{0}} = {{1}} ({{2}})',
    'safe_test.detail.would_verify': 'Verificaría que VID/PID = {{0}}',
    // Warnings
    'safe_test.warning.already_configured': 'El adaptador ya está configurado con el VID/PID de D-Link',
    'safe_test.warning.device_may_not_be_compatible': 'El dispositivo puede no ser compatible con MIB2',
  };

  // Helper para traducir claves de safe_test con parámetros
  const translateSafeTestKey = (key: string, t: (key: string) => string): string => {
    // Si la clave contiene '|', tiene parámetros
    if (key.includes('|')) {
      const parts = key.split('|');
      const translationKey = parts[0];
      const params = parts.slice(1);
      
      // Obtener la traducción base (primero intentar t(), luego fallback)
      let translated = t(translationKey);
      if (translated === translationKey) {
        translated = SAFE_TEST_FALLBACKS[translationKey] || translationKey;
      }
      
      // Si aún es la clave, crear texto legible
      if (translated === translationKey) {
        // Convertir safe_test.detail.current_vidpid a "VID actual: param1, PID actual: param2"
        const lastPart = translationKey.split('.').pop() || '';
        translated = lastPart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        // Agregar parámetros al final
        return `${translated}: ${params.join(', ')}`;
      }
      
      // Reemplazar {{0}}, {{1}}, etc. con los parámetros
      params.forEach((param, index) => {
        translated = translated.replace(`{{${index}}}`, param);
      });
      
      return translated;
    }
    
    // Si la clave empieza con 'safe_test.', intentar traducir
    if (key.startsWith('safe_test.')) {
      const translated = t(key);
      if (translated !== key) return translated;
      
      // Usar fallback si existe
      if (SAFE_TEST_FALLBACKS[key]) return SAFE_TEST_FALLBACKS[key];
      
      // Crear texto legible de la clave
      const lastPart = key.split('.').pop() || '';
      return lastPart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Devolver la clave original si no es una clave de traducción
    return key;
  };

  // Generar reporte de Safe Test para copiar
  const generateSafeTestReport = (): string => {
    if (!state.safeTestResult) return '';
    const r = state.safeTestResult;
    let report = `=== Resultado de Prueba Segura ===\n`;
    report += `VID/PID Actual: ${r.summary.currentVID}:${r.summary.currentPID}\n`;
    report += `VID/PID Objetivo: ${r.summary.targetVID}:${r.summary.targetPID}\n`;
    report += `Tipo EEPROM: ${r.summary.eepromType}\n`;
    report += `Escribible: ${r.summary.isWritable ? 'Sí' : 'No'}\n`;
    report += `Tiempo estimado: ${(r.summary.estimatedRealTime / 1000).toFixed(1)}s\n\n`;
    report += `Pasos ejecutados:\n`;
    r.steps.forEach((step, i) => {
      const icon = step.status === 'passed' ? '✓' : step.status === 'failed' ? '✗' : step.status === 'warning' ? '!' : '-';
      report += `[${icon}] ${translateSafeTestKey(step.name, t)}\n`;
      report += `    ${translateSafeTestKey(step.details, t)}\n`;
    });
    if (r.warnings.length > 0) {
      report += `\nAdvertencias:\n`;
      r.warnings.forEach(w => report += `! ${translateSafeTestKey(w, t)}\n`);
    }
    report += `\nResultado: ${r.wouldSucceedInRealMode ? 'El spoofing real FUNCIONARÍA correctamente' : 'El spoofing podría tener problemas'}\n`;
    return report;
  };

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
      'rolling_back': t('auto_spoof.step_rolling_back'),
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

      // Paso 1.5: Detectar si hay VID/PID duplicado en offset 0x48
      usbLogger.info('SPOOF', 'Detecting dual VID/PID locations...');
      let dualVIDPID: Awaited<ReturnType<typeof usbService.detectDualVIDPID>> | null = null;
      try {
        dualVIDPID = await usbService.detectDualVIDPID();
        if (dualVIDPID.hasDualLocation) {
          usbLogger.warning('SPOOF', `DUAL VID/PID DETECTED! Will write to both 0x48 and 0x88`);
        }
      } catch (detectError) {
        usbLogger.warning('SPOOF', `Could not detect dual VID/PID: ${detectError}. Proceeding with primary location only.`);
      }

      // Paso 1.6: Guardar valores originales para Emergency Restore mejorado
      usbLogger.info('SPOOF', 'Saving original values for emergency restore...');
      await usbService.saveOriginalValues(device);
      
      // Mostrar toast de confirmación
      setToastMessage(t('auto_spoof.original_values_saved'));
      setToastVisible(true);

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
      // Si hay dual location, tenemos 8 bytes en total (4 en cada ubicación)
      const totalBytesToWrite = dualVIDPID?.hasDualLocation ? 8 : 4;
      dispatch({ type: 'RESET_PROGRESS', payload: { operation: 'write', totalBytes: totalBytesToWrite } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 0 } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 0 } });
      
      // ============================================
      // ESCRITURA EN UBICACIÓN PRIMARIA (0x88-0x8B)
      // ============================================
      usbLogger.info('SPOOF', 'Writing to PRIMARY location (0x88-0x8B)...');
      
      // Paso 3: Escribir VID completo (word en offset 0x88 = 0x0120 para VID 0x2001 en little-endian)
      dispatch({ type: 'SET_STEP', payload: 'writing_vid_low' });
      const progressStep = dualVIDPID?.hasDualLocation ? 12.5 : 25;
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: progressStep } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 1 } });
      await usbService.writeEEPROM(0x88, '0120', state.skipVerification);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Actualizar progreso para VID completo
      dispatch({ type: 'SET_STEP', payload: 'writing_vid_high' });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: progressStep * 2 } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 2 } });
      await new Promise(resolve => setTimeout(resolve, 100));

      // Paso 4: Escribir PID completo (word en offset 0x8A = 0x053C para PID 0x3C05 en little-endian)
      dispatch({ type: 'SET_STEP', payload: 'writing_pid_low' });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: progressStep * 3 } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 3 } });
      await usbService.writeEEPROM(0x8A, '053C', state.skipVerification);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Actualizar progreso para PID completo
      dispatch({ type: 'SET_STEP', payload: 'writing_pid_high' });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: progressStep * 4 } });
      dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 4 } });
      await new Promise(resolve => setTimeout(resolve, 100));

      // ============================================
      // ESCRITURA EN UBICACIÓN SECUNDARIA (0x48-0x4B) SI EXISTE
      // ============================================
      if (dualVIDPID?.hasDualLocation) {
        usbLogger.info('SPOOF', 'Writing to SECONDARY location (0x48-0x4B)...');
        
        // Escribir VID en ubicación secundaria
        dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: progressStep * 5 } });
        dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 5 } });
        await usbService.writeEEPROM(0x48, '0120', state.skipVerification);
        await new Promise(resolve => setTimeout(resolve, 100));

        dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: progressStep * 6 } });
        dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 6 } });
        await new Promise(resolve => setTimeout(resolve, 100));

        // Escribir PID en ubicación secundaria
        dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: progressStep * 7 } });
        dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 7 } });
        await usbService.writeEEPROM(0x4A, '053C', state.skipVerification);
        await new Promise(resolve => setTimeout(resolve, 100));

        dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 100 } });
        dispatch({ type: 'UPDATE_PROGRESS', payload: { bytesProcessed: 8 } });
        
        usbLogger.success('SPOOF', 'Successfully wrote to BOTH locations (0x48 and 0x88)');
      }

      // Paso 7: Verificar escritura en ubicación primaria
      dispatch({ type: 'SET_STEP', payload: 'verifying' });
      usbLogger.info('VERIFY', 'Verifying PRIMARY location (0x88-0x8B)...');
      
      // Read 2 bytes (1 word) at a time for correct endianness handling
      const vidWord = await usbService.readEEPROM(0x88, 2);
      const pidWord = await usbService.readEEPROM(0x8A, 2);
      
      // The readEEPROM function now returns data in correct byte order:
      // For VID 0x2001: should return "0120" (low byte first in hex string)
      // For PID 0x3C05: should return "053C" (low byte first in hex string)
      usbLogger.info('VERIFY', `Read VID word: ${vidWord.data}, PID word: ${pidWord.data}`);
      
      // Check both possible byte orders since ASIX endianness can vary
      const primaryVerified = 
        (vidWord.data.toUpperCase() === '0120' || vidWord.data.toUpperCase() === '2001') &&
        (pidWord.data.toUpperCase() === '053C' || pidWord.data.toUpperCase() === '3C05');
      
      // Verificar ubicación secundaria si existe
      let secondaryVerified = true;
      if (dualVIDPID?.hasDualLocation) {
        usbLogger.info('VERIFY', 'Verifying SECONDARY location (0x48-0x4B)...');
        const secVidWord = await usbService.readEEPROM(0x48, 2);
        const secPidWord = await usbService.readEEPROM(0x4A, 2);
        
        usbLogger.info('VERIFY', `Read secondary VID word: ${secVidWord.data}, PID word: ${secPidWord.data}`);
        
        secondaryVerified = 
          (secVidWord.data.toUpperCase() === '0120' || secVidWord.data.toUpperCase() === '2001') &&
          (secPidWord.data.toUpperCase() === '053C' || secPidWord.data.toUpperCase() === '3C05');
        
        if (!secondaryVerified) {
          usbLogger.warning('VERIFY', `Secondary location verification failed: VID=${secVidWord.data}, PID=${secPidWord.data}`);
        }
      }

      // Verificar que AMBAS ubicaciones estén correctas si hay dual location
      const allVerified = primaryVerified && secondaryVerified;
      
      if (!allVerified) {
        // ROLLBACK AUTOMÁTICO: Restaurar VID/PID original
        const failLocation = !primaryVerified ? 'primary (0x88)' : 'secondary (0x48)';
        usbLogger.error('SPOOF', `Verification failed at ${failLocation} location - starting automatic rollback`);
        dispatch({ type: 'SET_STEP', payload: 'rolling_back' });
        
        try {
          // Obtener VID/PID original del dispositivo
          const originalVidLow = device.vendorId & 0xFF;
          const originalVidHigh = (device.vendorId >> 8) & 0xFF;
          const originalPidLow = device.productId & 0xFF;
          const originalPidHigh = (device.productId >> 8) & 0xFF;
          
          const originalVidHex = originalVidLow.toString(16).padStart(2, '0') + originalVidHigh.toString(16).padStart(2, '0');
          const originalPidHex = originalPidLow.toString(16).padStart(2, '0') + originalPidHigh.toString(16).padStart(2, '0');
          
          // Rollback ubicación primaria
          usbLogger.info('ROLLBACK', `Restoring original VID at 0x88: 0x${originalVidHex.toUpperCase()}`);
          await usbService.writeEEPROM(0x88, originalVidHex, false);
          
          usbLogger.info('ROLLBACK', `Restoring original PID at 0x8A: 0x${originalPidHex.toUpperCase()}`);
          await usbService.writeEEPROM(0x8A, originalPidHex, false);
          
          // Rollback ubicación secundaria si existe
          if (dualVIDPID?.hasDualLocation) {
            usbLogger.info('ROLLBACK', `Restoring original VID at 0x48: 0x${originalVidHex.toUpperCase()}`);
            await usbService.writeEEPROM(0x48, originalVidHex, false);
            
            usbLogger.info('ROLLBACK', `Restoring original PID at 0x4A: 0x${originalPidHex.toUpperCase()}`);
            await usbService.writeEEPROM(0x4A, originalPidHex, false);
          }
          
          // Verificar rollback - read word and check both byte orders
          const rollbackVidWord = await usbService.readEEPROM(0x88, 2);
          
          // Expected VID in both possible byte orders
          const expectedVidLE = originalVidLow.toString(16).padStart(2, '0') + originalVidHigh.toString(16).padStart(2, '0');
          const expectedVidBE = originalVidHigh.toString(16).padStart(2, '0') + originalVidLow.toString(16).padStart(2, '0');
          
          usbLogger.info('ROLLBACK', `Read VID after rollback: ${rollbackVidWord.data}, expected: ${expectedVidLE} or ${expectedVidBE}`);
          
          if (rollbackVidWord.data.toLowerCase() === expectedVidLE.toLowerCase() || 
              rollbackVidWord.data.toLowerCase() === expectedVidBE.toLowerCase()) {
            usbLogger.success('ROLLBACK', 'Rollback successful - original VID/PID restored');
            throw new Error(t('auto_spoof.error_verification_failed_rollback_success'));
          } else {
            usbLogger.error('ROLLBACK', 'Rollback failed - adapter may be in inconsistent state');
            throw new Error(t('auto_spoof.error_verification_failed_rollback_failed'));
          }
        } catch (rollbackError: any) {
          if (rollbackError.message.includes('rollback')) {
            throw rollbackError; // Re-throw si es nuestro error de rollback
          }
          usbLogger.error('ROLLBACK', `Error during rollback: ${rollbackError.message}`);
          throw new Error(t('auto_spoof.error_verification_failed_rollback_error'));
        }
      }

      // Success
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

  // Función Dry-Run (Simulación sin escribir)
  const handleDryRun = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    dispatch({ type: 'START_DRY_RUN' });

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await usbService.dryRunSpoof();
      
      dispatch({ type: 'SET_DRY_RUN_RESULT', payload: result });
      
      if (result.wouldSucceed) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error: any) {
      dispatch({ type: 'SET_DRY_RUN_RESULT', payload: null });
      usbLogger.error('DRY_RUN', `Error en dry-run: ${error.message}`, error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('alerts.error', error.message);
    }
  };

  // Función Verificar Checksum
  const handleVerifyChecksum = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    dispatch({ type: 'START_CHECKSUM_VERIFY' });

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await usbService.verifyEEPROMChecksum();
      
      dispatch({ type: 'SET_CHECKSUM_RESULT', payload: result });
      
      if (result.valid) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error: any) {
      dispatch({ type: 'SET_CHECKSUM_RESULT', payload: null });
      usbLogger.error('CHECKSUM', `Error verificando checksum: ${error.message}`, error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('alerts.error', error.message);
    }
  };

  // Función Safe Test Mode - Simulación completa sin escribir
  const handleSafeTest = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
      return;
    }

    dispatch({ type: 'START_SAFE_TEST' });

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await usbService.simulateFullSpoofProcess(
        0x2001, // Target VID (D-Link)
        0x3C05, // Target PID (D-Link)
        (step, progress, details) => {
          dispatch({ type: 'UPDATE_SAFE_TEST_PROGRESS', payload: { progress, details } });
        }
      );
      
      dispatch({ type: 'SET_SAFE_TEST_RESULT', payload: result });
      
      if (result.wouldSucceedInRealMode) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error: any) {
      dispatch({ type: 'SET_SAFE_TEST_RESULT', payload: null });
      usbLogger.error('SAFE_TEST', `Error en Safe Test Mode: ${error.message}`, error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('alerts.error', error.message);
    }
  };

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
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center mb-5">
            <Text className="text-2xl font-bold text-foreground">
              {t('auto_spoof.title')}
            </Text>
            <Text className="text-sm text-muted text-center mt-1">
              {t('auto_spoof.subtitle')}
            </Text>
          </View>

          {/* Estado del Dispositivo */}
          <View className="bg-surface rounded-2xl p-5">
            <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
              {t('auto_spoof.connected_device')}
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
          <View className="bg-surface rounded-2xl p-5">
            <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
              {t('auto_spoof.target_values')}
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
          <View className="bg-warning/10 rounded-2xl p-5">
            <Text className="text-sm font-semibold text-warning uppercase tracking-wide mb-3">
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

          {/* Checkbox Forzar sin Verificación - Opción avanzada discreta */}
          <TouchableOpacity
            onPress={() => {
              dispatch({ type: 'TOGGLE_SKIP_VERIFICATION' });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            disabled={state.isExecuting}
            activeOpacity={0.8}
            className={`flex-row items-center gap-3 p-3 rounded-xl ${
              state.skipVerification ? 'bg-yellow-500/15' : 'bg-surface'
            }`}
          >
            <View className={`w-5 h-5 rounded-md items-center justify-center ${
              state.skipVerification ? 'bg-yellow-500' : 'bg-muted/30'
            }`}>
              {state.skipVerification && <Text className="text-background text-xs font-bold">✓</Text>}
            </View>
            <View className="flex-1">
              <Text className={`text-sm font-medium ${
                state.skipVerification ? 'text-yellow-500' : 'text-muted'
              }`}>
                {t('auto_spoof.force_no_verification')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Botones de Seguridad: Dry-Run y Checksum */}
          <View className="gap-3">
            {/* Botón Dry-Run (Simulación) */}
            {UI_CONFIG.showDryRun && <TouchableOpacity
              onPress={handleDryRun}
              disabled={state.isDryRunning || !device}
              activeOpacity={0.8}
              className={`rounded-xl p-4 items-center border-2 ${
                state.dryRunResult?.wouldSucceed
                  ? 'bg-green-500/10 border-green-500'
                  : state.dryRunResult && !state.dryRunResult.wouldSucceed
                  ? 'bg-yellow-500/10 border-yellow-500'
                  : state.isDryRunning
                  ? 'bg-muted/20 border-muted opacity-50'
                  : 'bg-cyan-500/10 border-cyan-500'
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">
                  {state.isDryRunning ? '⏳' : state.dryRunResult?.wouldSucceed ? '✅' : state.dryRunResult ? '⚠️' : '🔍'}
                </Text>
                <Text className={`text-base font-bold ${
                  state.dryRunResult?.wouldSucceed
                    ? 'text-green-500'
                    : state.dryRunResult && !state.dryRunResult.wouldSucceed
                    ? 'text-yellow-500'
                    : state.isDryRunning
                    ? 'text-muted'
                    : 'text-cyan-500'
                }`}>
                  {state.isDryRunning ? t('auto_spoof.simulating') : t('auto_spoof.dry_run')}
                </Text>
              </View>
              <Text className="text-xs text-muted mt-1">
                {t('auto_spoof.dry_run_desc')}
              </Text>
            </TouchableOpacity>}

            {/* Resultado Dry-Run */}
            {UI_CONFIG.showDryRun && state.dryRunResult && (
              <View className={`rounded-xl p-4 border ${
                state.dryRunResult.wouldSucceed ? 'bg-green-500/5 border-green-500/30' : 'bg-yellow-500/5 border-yellow-500/30'
              }`}>
                <Text className={`text-sm font-semibold mb-2 ${
                  state.dryRunResult.wouldSucceed ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {t('auto_spoof.dry_run_result')}
                </Text>
                <View className="gap-1">
                  <Text className="text-xs text-muted">
                    VID/PID Actual: 0x{state.dryRunResult.currentVID.toString(16).toUpperCase()}:0x{state.dryRunResult.currentPID.toString(16).toUpperCase()}
                  </Text>
                  <Text className="text-xs text-muted">
                    {t('auto_spoof.target_vid_pid')}: 0x{state.dryRunResult.targetVID.toString(16).toUpperCase()}:0x{state.dryRunResult.targetPID.toString(16).toUpperCase()}
                  </Text>
                  <Text className="text-xs text-muted">
                    {t('auto_spoof.changes_needed')}: {state.dryRunResult.changes.length}
                  </Text>
                  {state.dryRunResult.warnings.length > 0 && (
                    <View className="mt-2">
                      {state.dryRunResult.warnings.map((w, i) => (
                        <Text key={i} className="text-xs text-yellow-500">⚠️ {w}</Text>
                      ))}
                    </View>
                  )}
                  <Text className={`text-xs mt-2 font-medium ${
                    state.dryRunResult.wouldSucceed ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {state.dryRunResult.wouldSucceed ? t('auto_spoof.dry_run_would_succeed') : t('auto_spoof.dry_run_would_fail')}
                  </Text>
                </View>
              </View>
            )}

            {/* Botón Verificar Checksum */}
            {UI_CONFIG.showChecksum && <TouchableOpacity
              onPress={handleVerifyChecksum}
              disabled={state.isVerifyingChecksum || !device}
              activeOpacity={0.8}
              className={`rounded-xl p-4 items-center border-2 ${
                state.checksumResult?.valid
                  ? 'bg-green-500/10 border-green-500'
                  : state.checksumResult && !state.checksumResult.valid
                  ? 'bg-red-500/10 border-red-500'
                  : state.isVerifyingChecksum
                  ? 'bg-muted/20 border-muted opacity-50'
                  : 'bg-purple-500/10 border-purple-500'
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-xl">
                  {state.isVerifyingChecksum ? '⏳' : state.checksumResult?.valid ? '✅' : state.checksumResult ? '❌' : '📏'}
                </Text>
                <Text className={`text-base font-bold ${
                  state.checksumResult?.valid
                    ? 'text-green-500'
                    : state.checksumResult && !state.checksumResult.valid
                    ? 'text-red-500'
                    : state.isVerifyingChecksum
                    ? 'text-muted'
                    : 'text-purple-500'
                }`}>
                  {state.isVerifyingChecksum ? t('auto_spoof.verifying_checksum') : t('auto_spoof.verify_checksum')}
                </Text>
              </View>
              <Text className="text-xs text-muted mt-1">
                {t('auto_spoof.verify_checksum_desc')}
              </Text>
            </TouchableOpacity>}

            {/* Resultado Checksum */}
            {UI_CONFIG.showChecksum && state.checksumResult && (
              <View className={`rounded-xl p-4 border ${
                state.checksumResult.valid ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'
              }`}>
                <Text className={`text-sm font-semibold mb-2 ${
                  state.checksumResult.valid ? 'text-green-500' : 'text-red-500'
                }`}>
                  {t('auto_spoof.checksum_result')}
                </Text>
                <View className="gap-1">
                  <Text className="text-xs text-muted">
                    {t('auto_spoof.stored_checksum')}: 0x{state.checksumResult.storedChecksum.toString(16).toUpperCase().padStart(2, '0')}
                  </Text>
                  <Text className="text-xs text-muted">
                    {t('auto_spoof.calculated_checksum')}: 0x{state.checksumResult.calculatedChecksum.toString(16).toUpperCase().padStart(2, '0')}
                  </Text>
                  <Text className="text-xs text-muted">
                    {t('auto_spoof.data_range')}: {state.checksumResult.dataRange}
                  </Text>
                  <Text className={`text-xs mt-2 font-medium ${
                    state.checksumResult.valid ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {state.checksumResult.valid ? t('auto_spoof.checksum_valid') : t('auto_spoof.checksum_invalid')}
                  </Text>
                  {/* Explicación detallada cuando el checksum es inválido */}
                  {!state.checksumResult.valid && (
                    <View className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <Text className="text-xs text-blue-400 leading-relaxed">
                        {t('auto_spoof.checksum_invalid_explanation')}
                      </Text>
                    </View>
                  )}
                  <Text className="text-xs text-muted mt-2 italic">
                    {t('auto_spoof.checksum_not_affects_vidpid')}
                  </Text>
                </View>
              </View>
            )}

            {/* Botón Safe Test Mode - Simulación Completa */}
            <TouchableOpacity
              onPress={handleSafeTest}
              disabled={state.isSafeTestRunning || !device}
              activeOpacity={0.8}
              className={`rounded-xl p-4 ${
                state.safeTestResult?.wouldSucceedInRealMode
                  ? 'bg-success/10'
                  : state.safeTestResult && !state.safeTestResult.wouldSucceedInRealMode
                  ? 'bg-warning/10'
                  : state.isSafeTestRunning
                  ? 'bg-surface opacity-50'
                  : 'bg-surface'
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">
                  {state.isSafeTestRunning ? '⏳' : state.safeTestResult?.wouldSucceedInRealMode ? '✅' : state.safeTestResult ? '⚠️' : '🛡️'}
                </Text>
                <View className="flex-1">
                  <Text className={`text-base font-semibold ${
                    state.safeTestResult?.wouldSucceedInRealMode
                      ? 'text-success'
                      : state.safeTestResult && !state.safeTestResult.wouldSucceedInRealMode
                      ? 'text-warning'
                      : 'text-foreground'
                  }`}>
                    {state.isSafeTestRunning ? t('auto_spoof.safe_test_running') : t('auto_spoof.safe_test_mode')}
                  </Text>
                  <Text className="text-xs text-muted mt-0.5">
                    {t('auto_spoof.safe_test_desc')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Progreso Safe Test */}
            {state.isSafeTestRunning && (
              <View className="rounded-xl p-4 bg-indigo-500/5 border border-indigo-500/30">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-semibold text-indigo-500">
                    {t('auto_spoof.safe_test_progress')}
                  </Text>
                  <Text className="text-sm font-bold text-indigo-500">
                    {state.safeTestProgress}%
                  </Text>
                </View>
                <View className="h-2 bg-muted/20 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${state.safeTestProgress}%` }}
                  />
                </View>
                <Text className="text-xs text-muted mt-2">
                  {state.safeTestProgressDetails}
                </Text>
              </View>
            )}

            {/* Resultado Safe Test */}
            {state.safeTestResult && (
              <View className={`rounded-xl p-4 border ${
                state.safeTestResult.wouldSucceedInRealMode ? 'bg-green-500/5 border-green-500/30' : 'bg-yellow-500/5 border-yellow-500/30'
              }`}>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className={`text-sm font-semibold ${
                    state.safeTestResult.wouldSucceedInRealMode ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {t('auto_spoof.safe_test_result')}
                  </Text>
                  <TouchableOpacity
                    onPress={async () => {
                      const report = generateSafeTestReport();
                      await Clipboard.setStringAsync(report);
                      haptics.success();
                      setToastMessage(t('guides.command_copied') || 'Copiado al portapapeles');
                      setToastVisible(true);
                    }}
                    activeOpacity={0.8}
                    className="bg-primary/20 px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-xs text-primary font-medium">{t('guides.copy_command') || 'Copiar'}</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Resumen */}
                <View className="gap-1 mb-3">
                  <Text className="text-xs text-muted">
                    VID/PID Actual: {state.safeTestResult.summary.currentVID}:{state.safeTestResult.summary.currentPID}
                  </Text>
                  <Text className="text-xs text-muted">
                    VID/PID Objetivo: {state.safeTestResult.summary.targetVID}:{state.safeTestResult.summary.targetPID}
                  </Text>
                  <Text className="text-xs text-muted">
                    {t('auto_spoof.eeprom_type')}: {state.safeTestResult.summary.eepromType}
                  </Text>
                  <Text className="text-xs text-muted">
                    {t('auto_spoof.writable')}: {state.safeTestResult.summary.isWritable ? t('common.yes') : t('common.no')}
                  </Text>
                  <Text className="text-xs text-muted">
                    {t('auto_spoof.estimated_time')}: {(state.safeTestResult.summary.estimatedRealTime / 1000).toFixed(1)}s
                  </Text>
                </View>

                {/* Pasos ejecutados */}
                <Text className="text-xs font-semibold text-foreground mb-2">
                  {t('auto_spoof.steps_executed')}:
                </Text>
                <View className="gap-1 mb-3">
                  {state.safeTestResult.steps.map((step, i) => (
                    <View key={i} className="flex-row items-start gap-2">
                      <Text className="text-xs">
                        {step.status === 'passed' ? '✅' : step.status === 'failed' ? '❌' : step.status === 'warning' ? '⚠️' : '⏭️'}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-xs text-foreground font-medium">{translateSafeTestKey(step.name, t)}</Text>
                        <Text className="text-xs text-muted">{translateSafeTestKey(step.details, t)}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Advertencias */}
                {state.safeTestResult.warnings.length > 0 && (
                  <View className="mt-2">
                    <Text className="text-xs font-semibold text-yellow-500 mb-1">
                      {t('auto_spoof.warnings')}:
                    </Text>
                    {state.safeTestResult.warnings.map((w, i) => (
                      <Text key={i} className="text-xs text-yellow-500">⚠️ {translateSafeTestKey(w, t)}</Text>
                    ))}
                  </View>
                )}

                {/* Errores */}
                {state.safeTestResult.errors.length > 0 && (
                  <View className="mt-2">
                    <Text className="text-xs font-semibold text-red-500 mb-1">
                      {t('auto_spoof.errors')}:
                    </Text>
                    {state.safeTestResult.errors.map((e, i) => (
                      <Text key={i} className="text-xs text-red-500">❌ {e}</Text>
                    ))}
                  </View>
                )}

                {/* Conclusión */}
                <Text className={`text-xs mt-3 font-bold ${
                  state.safeTestResult.wouldSucceedInRealMode ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {state.safeTestResult.wouldSucceedInRealMode 
                    ? t('auto_spoof.safe_test_would_succeed') 
                    : t('auto_spoof.safe_test_would_fail')}
                </Text>
              </View>
            )}
          </View>

          {/* Botones de Test y Spoof Rápido */}
          <View className="gap-3">
            {/* Botón Test de Spoofing */}
            {UI_CONFIG.showTestSpoofing && <TouchableOpacity
              onPress={handleTestSpoofing}
              disabled={state.isTesting}
              activeOpacity={0.8}
              className={`rounded-xl p-4 items-center border-2 ${
                state.testResult === 'success'
                  ? 'bg-green-500/10 border-green-500'
                  : state.testResult === 'fail'
                  ? 'bg-red-500/10 border-red-500'
                  : state.isTesting
                  ? 'bg-muted/20 border-muted opacity-50'
                  : 'bg-blue-500/10 border-blue-500'
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
            </TouchableOpacity>}

            {/* Botón Spoof Rápido */}
            {UI_CONFIG.showQuickSpoof && <TouchableOpacity
              onPress={handleQuickSpoof}
              disabled={!canExecute || state.isExecuting}
              activeOpacity={0.8}
              className={`rounded-xl p-4 items-center border-2 ${
                canExecute && !state.isExecuting
                  ? 'bg-orange-500/10 border-orange-500'
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
            </TouchableOpacity>}
          </View>

          {/* Botón de Ejecución Principal */}
          <TouchableOpacity
            onPress={executeAutoSpoof}
            disabled={!canExecute || state.isExecuting}
            activeOpacity={0.8}
            className={`rounded-xl py-4 items-center ${
              canExecute && !state.isExecuting
                ? 'bg-primary'
                : 'bg-muted/30'
            }`}
          >
            <Text className={`text-base font-semibold ${
              canExecute && !state.isExecuting ? 'text-white' : 'text-muted'
            }`}>
              {state.isExecuting ? t('auto_spoof.executing') : t('auto_spoof.execute_auto_spoof')}
            </Text>
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
      
      {/* Toast para notificaciones */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type="success"
        duration={3000}
        onHide={() => setToastVisible(false)}
      />
    </ScreenContainer>
  );
}
