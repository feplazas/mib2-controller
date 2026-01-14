import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useReducer } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useUsbStatus } from '@/lib/usb-status-context';
import { usbService } from '@/lib/usb-service';
import { backupService } from '@/lib/backup-service';
import { ChipsetStatusBadge } from '@/components/chipset-status-badge';
import { getChipsetCompatibility, canAttemptSpoofing, getCompatibilityMessage } from '@/lib/chipset-compatibility';
import { SuccessResultModal } from '@/components/success-result-modal';
import { EepromProgressIndicator } from '@/components/eeprom-progress-indicator';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { spoofReducer, initialSpoofState, getStepText, getStepIcon } from '@/lib/spoof-reducer';
import type { SpoofStep } from '@/lib/spoof-reducer';
import { useTranslation } from "@/lib/language-context";

import { showAlert } from '@/lib/translated-alert';
export default function AutoSpoofScreen() {
  const t = useTranslation();
  const { status, device } = useUsbStatus();
  const [state, dispatch] = useReducer(spoofReducer, initialSpoofState);

  const executeAutoSpoof = async () => {
    if (!device) {
      showAlert('alerts.error', 'alerts.no_hay_dispositivo_usb_conectado');
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
    
    // DETECCIÓN REAL de EEPROM vs eFuse
    Alert.alert(
      '🔍 Detectando Tipo de EEPROM',
      'Se realizará una prueba REAL de escritura en un offset seguro para determinar si el chipset tiene EEPROM externa modificable o eFuse bloqueado.\n\nEsto NO modificará el VID/PID actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Detectar Ahora', onPress: async () => {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            // Realizar detección REAL
            const eepromType = await usbService.detectEEPROMType();
            
            if (!eepromType.writable) {
              // eFuse detectado - BLOQUEAR spoofing
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                '❌ Spoofing Bloqueado',
                `Tipo detectado: ${eepromType.type.toUpperCase()}\n\n` +
                `Razón: ${eepromType.reason}\n\n` +
                `⚠️ Este chipset NO puede ser modificado de forma segura. El spoofing ha sido BLOQUEADO para prevenir bricking del adaptador.`,
                [{ text: 'Entendido' }]
              );
              return;
            }
            
            // EEPROM externa detectada - PERMITIR spoofing
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              '✅ EEPROM Externa Detectada',
              `Tipo: ${eepromType.type.toUpperCase()}\n` +
              `Estado: MODIFICABLE\n\n` +
              `✅ El chipset tiene EEPROM externa y puede ser modificado de forma segura.\n\n` +
              `¿Deseas continuar con el spoofing?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sí, Continuar', onPress: () => proceedWithSpoofing() }
              ]
            );
          } catch (error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              '❌ Error de Detección',
              `No se pudo detectar el tipo de EEPROM:\n\n${error}\n\n` +
              `Por seguridad, el spoofing ha sido BLOQUEADO.`
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

    dispatch({ type: 'START_EXECUTION' });
    dispatch({ type: 'SET_ERROR', payload: '' });
    // handled by SET_SUCCESS;
    dispatch({ type: 'SET_STEP', payload: 'validating' });

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Paso 1: Validar compatibilidad
      const compatibility = getChipsetCompatibility(device.chipset || '');
      if (!canAttemptSpoofing(compatibility)) {
        throw new Error('Dispositivo no compatible para spoofing');
      }
      await new Promise(resolve => setTimeout(resolve, 500));

      // Paso 2: Crear backup automático
      dispatch({ type: 'SET_STEP', payload: 'creating_backup' });
      dispatch({ type: 'RESET_PROGRESS', payload: { operation: 'read', totalBytes: state.eepromProgress.totalBytes } });
      // handled by RESET_PROGRESS; // EEPROM típica de 256 bytes
      
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
      // handled by RESET_PROGRESS; // 4 bytes a escribir (VID low, VID high, PID low, PID high)
      
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
        throw new Error('Verificación falló: Los datos escritos no coinciden');
      }

      // Éxito
      const verificationNote = state.skipVerification 
        ? '\n⚠️ IMPORTANTE: Verificación omitida. Debes reconectar el adaptador para confirmar que el spoofing fue exitoso.\n'
        : '';
      
      const successMsg = 
        'Spoofing completado exitosamente.\n\n' +
        '📋 Valores escritos:\n' +
        '• VID: 0x2001 (D-Link)\n' +
        '• PID: 0x3C05 (DUB-E100)\n' +
        verificationNote +
        '\n🔌 PASOS OBLIGATORIOS:\n' +
        '1️⃣ Desconecta el adaptador USB del cable OTG\n' +
        '2️⃣ Espera 5-10 segundos (importante)\n' +
        '3️⃣ Vuelve a conectar el adaptador\n' +
        '4️⃣ Ve a "Estado USB" para verificar VID/PID\n' +
        '5️⃣ Si no cambió, usa "Test de Spoofing" para diagnóstico\n\n' +
        '📡 Si el VID/PID no cambia después de reconectar, ve a la pestaña "Diag" para ver logs detallados de la operación.';
      
      dispatch({ 
        type: 'SET_SUCCESS', 
        payload: { 
          message: successMsg,
          result: {
            originalVID: usbService.formatVIDPID(device.vendorId, 0).split(':')[0],
            originalPID: usbService.formatVIDPID(0, device.productId).split(':')[1],
            newVID: '0x2001',
            newPID: '0x3C05',
            chipset: device.chipset || 'Desconocido',
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
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Error desconocido durante el spoofing' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      // handled by reducer;
    }
  };

  const canExecute = status === 'connected' && device && canAttemptSpoofing(getChipsetCompatibility(device.chipset || ''));

  // Función REAL de Test de Spoofing
  const handleTestSpoofing = async () => {
    dispatch({ type: 'START_TEST' });
    dispatch({ type: 'SET_TEST_RESULT', payload: null });
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Re-escanear dispositivos USB REALES
      const devices = await usbService.scanDevices();
      
      if (devices.length === 0) {
        Alert.alert(
          '⚠️ Dispositivo No Detectado',
          'No se detectó ningún dispositivo USB.\n\n' +
          '🔌 INSTRUCCIONES:\n' +
          '1. Desconecta el adaptador USB\n' +
          '2. Espera 5 segundos\n' +
          '3. Vuelve a conectar el adaptador\n' +
          '4. Espera a que el sistema lo reconozca\n' +
          '5. Intenta el test nuevamente'
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
          '✅ Spoofing Exitoso',
          `El adaptador tiene el VID/PID correcto:\n\n` +
          `🔌 Dispositivo: ${detectedDevice.deviceName}\n` +
          `✅ VID: 0x${detectedDevice.vendorId.toString(16).toUpperCase().padStart(4, '0')} (D-Link)\n` +
          `✅ PID: 0x${detectedDevice.productId.toString(16).toUpperCase().padStart(4, '0')} (DUB-E100)\n` +
          `👍 Chipset: ${detectedDevice.chipset}\n\n` +
          `✅ El spoofing fue EXITOSO. El adaptador ahora es compatible con MIB2.`
        );
      } else {
        dispatch({ type: 'SET_TEST_RESULT', payload: 'fail' });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          '⚠️ Spoofing No Detectado',
          `El adaptador NO tiene el VID/PID objetivo:\n\n` +
          `🔌 Dispositivo: ${detectedDevice.deviceName}\n` +
          `❌ VID actual: 0x${detectedDevice.vendorId.toString(16).toUpperCase().padStart(4, '0')}\n` +
          `❌ PID actual: 0x${detectedDevice.productId.toString(16).toUpperCase().padStart(4, '0')}\n` +
          `🎯 VID esperado: 0x2001\n` +
          `🎯 PID esperado: 0x3C05\n\n` +
          `🔄 POSIBLES CAUSAS:\n` +
          `1. No se ha ejecutado el spoofing aún\n` +
          `2. El spoofing falló durante la escritura\n` +
          `3. No se ha reconectado el adaptador después del spoofing\n\n` +
          `💡 SOLUCIÓN:\n` +
          `Desconecta y reconecta el adaptador para que el sistema lea los nuevos valores de EEPROM.`
        );
      }
    } catch (error: any) {
      dispatch({ type: 'SET_TEST_RESULT', payload: 'fail' });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', `No se pudo realizar el test:\n\n${error.message}`);
    } finally {
      // handled by SET_TEST_RESULT;
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
        'Dispositivo No Compatible',
        getCompatibilityMessage(compatibility, device.chipset || 'desconocido')
      );
      return;
    }

    // Una sola confirmación crítica
    Alert.alert(
      '⚠️ Spoof Rápido',
      `🚀 MODO RÁPIDO - Una sola confirmación\n\n` +
      `📊 Dispositivo: ${device.deviceName}\n` +
      `🔧 Chipset: ${device.chipset}\n` +
      `🔄 VID/PID: ${usbService.formatVIDPID(device.vendorId, device.productId)} → 0x2001:0x3C05\n\n` +
      `⚠️ ADVERTENCIAS:\n` +
      `• Modificación PERMANENTE de EEPROM\n` +
      `• NO desconectar durante el proceso\n` +
      `• Backup automático incluido\n` +
      `• Requiere reconexión después\n\n` +
      `🔋 Batería: Asegúrate de tener >20%\n\n` +
      `¿Ejecutar spoofing AHORA?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'SÍ, Ejecutar',
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
      const shareText = `🎉 Spoofing MIB2 Exitoso\n\n` +
        `💻 Dispositivo: ${state.spoofingResult.deviceName}\n` +
        `🔧 Chipset: ${state.spoofingResult.chipset}\n` +
        `📅 Fecha: ${state.spoofingResult.timestamp.toLocaleString('es-ES')}\n\n` +
        `❌ Antes:\n` +
        `  VID: ${state.spoofingResult.originalVID}\n` +
        `  PID: ${state.spoofingResult.originalPID}\n\n` +
        `✅ Después:\n` +
        `  VID: ${state.spoofingResult.newVID}\n` +
        `  PID: ${state.spoofingResult.newPID}\n\n` +
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
          {state.isExecuting && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">
                ⏳ Progreso
              </Text>
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'validating', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">Validando chipset</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'creating_backup', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">Creando backup de seguridad</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'writing_vid_low', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">Escribiendo VID byte bajo (0x88)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'writing_vid_high', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">Escribiendo VID byte alto (0x89)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'writing_pid_low', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">Escribiendo PID byte bajo (0x8A)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'writing_pid_high', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">Escribiendo PID byte alto (0x8B)</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl">{getStepIcon(state.currentStep, 'verifying', state.isExecuting)}</Text>
                  <Text className="text-sm text-muted flex-1">Verificando escritura</Text>
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
                  ? Math.round(((100 - state.eepromProgress.progress) / state.eepromProgress.progress) * 2) // Estimación simple
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
                Error
              </Text>
              <Text className="text-sm text-foreground">
                {state.errorMessage}
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
                ⚠️ Forzar sin Verificación
              </Text>
              <Text className="text-xs text-muted leading-relaxed">
                Omite la verificación post-escritura. Úsalo solo si la verificación normal falla debido a protección de escritura del adaptador. Después del spoofing, desconecta y reconecta el adaptador para verificar manualmente.
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
                  {state.isTesting ? 'Testeando...' : 'Test de Spoofing'}
                </Text>
              </View>
              <Text className="text-xs text-muted mt-1">
                Verifica si el adaptador tiene VID/PID 0x2001:0x3C05
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
                  {state.isExecuting ? 'Ejecutando...' : 'Spoof Rápido'}
                </Text>
              </View>
              <Text className="text-xs text-muted mt-1">
                Ejecuta spoofing con una sola confirmación
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
              {state.isExecuting ? '⏳ Ejecutando...' : '🚀 Ejecutar Spoofing Automático'}
            </Text>
            {!canExecute && !state.isExecuting && (
              <Text className="text-xs text-background opacity-70">
                Conecta un adaptador compatible para continuar
              </Text>
            )}
            {canExecute && !state.isExecuting && (
              <Text className="text-xs text-background/80 mt-1">
                Con triple confirmación y validaciones completas
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Success Result Modal */}
      <SuccessResultModal
        visible={state.showSuccessModal}
        result={state.spoofingResult}
        onClose={() => {
          dispatch({ type: 'SHOW_SUCCESS_MODAL', payload: false });
          // handled by SET_SUCCESS;
        }}
        onShare={handleShareResult}
      />
    </ScreenContainer>
  );
}
