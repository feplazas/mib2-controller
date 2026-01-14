import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTelnet } from "@/lib/telnet-provider";
import { useUsbStatus } from "@/lib/usb-status-context";
import {
  TOOLBOX_INSTALLATION_STEPS,
  EMMC_ACCESS_INFO,
  DIAGNOSTIC_COMMANDS,
  generateInstallationScript,
  generateToolboxVerificationCommand,
  type InstallationStep,
} from "@/lib/toolbox-installer";
import { listBackups, restoreBackup, deleteBackup, backupCriticalBinary, type BackupInfo } from "@/lib/toolbox-backup";
import { useTranslation } from "@/lib/language-context";

type StepStatus = 'pending' | 'inProgress' | 'completed' | 'error';

export default function ToolboxScreen() {
  const t = useTranslation();
  const colors = useColors();
  const { isConnected, sendCommand } = useTelnet();
  const { status: usbStatus } = useUsbStatus();
  const [selectedStep, setSelectedStep] = useState<InstallationStep | null>(null);
  const [showEmmcInfo, setShowEmmcInfo] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [stepStatuses, setStepStatuses] = useState<Record<number, StepStatus>>({});
  const [executing, setExecuting] = useState(false);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [showBackups, setShowBackups] = useState(false);

  const handleSelectStep = (step: InstallationStep) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedStep(step);
    setShowEmmcInfo(false);
    setShowDiagnostics(false);
  };

  const handleShowEmmcInfo = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowEmmcInfo(true);
    setSelectedStep(null);
    setShowDiagnostics(false);
  };

  const handleShowDiagnostics = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDiagnostics(true);
    setSelectedStep(null);
    setShowEmmcInfo(false);
  };

  const handleShowBackups = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowBackups(true);
    setSelectedStep(null);
    setShowEmmcInfo(false);
    setShowDiagnostics(false);
    await loadBackupsList();
  };

  const loadBackupsList = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Debes estar conectado por Telnet para ver los backups');
      return;
    }

    setLoadingBackups(true);
    try {
      const backupsList = await listBackups(async (cmd: string) => {
        const result = await sendCommand(cmd);
        return { output: result, success: true };
      });
      setBackups(backupsList);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los backups');
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleRestoreBackup = async (backup: BackupInfo) => {
    Alert.alert(
      '⚠️ Restaurar Backup',
      `¿Estás seguro de que deseas restaurar este backup?\n\nArchivo: ${backup.filename}\nFecha: ${backup.timestamp}\nTamaño: ${(backup.size / 1024).toFixed(2)} KB\n\nEsto sobrescribirá el archivo actual.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await restoreBackup(
                async (cmd: string) => {
                  const output = await sendCommand(cmd);
                  return { output, success: true };
                },
                backup
              );

              if (result.success) {
                Alert.alert('✅ Éxito', 'Backup restaurado correctamente');
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } else {
                Alert.alert('❌ Error', result.error || 'No se pudo restaurar el backup');
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }
              }
            } catch (error) {
              Alert.alert('❌ Error', 'Error inesperado al restaurar backup');
            }
          },
        },
      ]
    );
  };

  const handleDeleteBackup = async (backup: BackupInfo) => {
    Alert.alert(
      'Eliminar Backup',
      `¿Estás seguro de que deseas eliminar este backup?\n\n${backup.filename}\n${backup.timestamp}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteBackup(
                async (cmd: string) => {
                  const output = await sendCommand(cmd);
                  return { output, success: true };
                },
                backup.backupPath
              );

              if (success) {
                Alert.alert('✅ Éxito', 'Backup eliminado');
                await loadBackupsList();
              } else {
                Alert.alert('❌ Error', 'No se pudo eliminar el backup');
              }
            } catch (error) {
              Alert.alert('❌ Error', 'Error inesperado al eliminar backup');
            }
          },
        },
      ]
    );
  };

  const handleGenerateScript = async () => {
    try {
      const script = generateInstallationScript();
      const fileUri = `${FileSystem.documentDirectory}install_toolbox.sh`;
      
      await FileSystem.writeAsStringAsync(fileUri, script);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Script Generado",
        "El script de instalación ha sido creado exitosamente.",
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
      Alert.alert("Error", "No se pudo generar el script de instalación");
      console.error(error);
    }
  };

  const handleGenerateVerification = () => {
    const command = generateToolboxVerificationCommand();
    Alert.alert("Comando de Verificación", command, [{ text: "Cerrar" }]);
  };

  const executeStepCommand = async (step: InstallationStep) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setExecuting(true);
    setStepStatuses(prev => ({ ...prev, [step.step]: 'inProgress' }));

    try {
      sendCommand(step.command!);
      setTimeout(() => {
        setStepStatuses(prev => ({ ...prev, [step.step]: 'completed' }));
        setExecuting(false);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, 2000);
    } catch (error) {
      setStepStatuses(prev => ({ ...prev, [step.step]: 'error' }));
      setExecuting(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', 'Error al ejecutar comando');
    }
  };

  const handleExecuteStep = async (step: InstallationStep) => {
    if (!isConnected) {
      Alert.alert('No Conectado', 'Debes conectarte a la unidad MIB2 primero');
      return;
    }

    if (!step.command) {
      Alert.alert('Sin Comando', 'Este paso no tiene un comando asociado');
      return;
    }

    const isCriticalStep = step.step === 2 || step.title.toLowerCase().includes('patch');

    if (isCriticalStep) {
      Alert.alert(
        '⚠️ PASO CRÍTICO - Confirmación 1/3',
        'Este paso modifica el binario del sistema tsd.mibstd2.system.swap.\n\nEsto altera la rutina de verificación de firmas digitales.\n\n¿Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                '⚠️ PASO CRÍTICO - Confirmación 2/3',
                'Un error durante este proceso puede BRICKEAR la unidad MIB2.\n\nLa única forma de recuperarla sería mediante soldadura directa a la memoria eMMC.\n\n¿Estás seguro?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Estoy Seguro',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        '⚠️ CONFIRMACIÓN FINAL - 3/3',
                        'Una vez iniciado el proceso, NO lo interrumpas.\n\nAsegúrate de que:\n• La batería del vehículo está cargada\n• No apagarás el contacto\n• La conexión Telnet es estable\n\n¿Ejecutar parcheo AHORA?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'EJECUTAR',
                            style: 'destructive',
                            onPress: async () => {
                              // Crear backup automático antes del parcheo
                              Alert.alert(
                                '💾 Creando Backup',
                                'Creando backup del binario crítico antes de continuar...'
                              );
                              
                              try {
                                const backupResult = await backupCriticalBinary(
                                  async (cmd: string) => {
                                    const output = await sendCommand(cmd);
                                    return { output, success: true };
                                  }
                                );

                                if (backupResult.success && backupResult.backup) {
                                  Alert.alert(
                                    '✅ Backup Creado',
                                    `Backup guardado exitosamente:\n\nRuta: ${backupResult.backup.backupPath}\nTamaño: ${(backupResult.backup.size / 1024).toFixed(2)} KB\nChecksum: ${backupResult.backup.checksum?.substring(0, 16)}...\n\nProcediendo con el parcheo...`,
                                    [
                                      {
                                        text: 'Continuar',
                                        onPress: () => executeStepCommand(step),
                                      },
                                    ]
                                  );
                                } else {
                                  Alert.alert(
                                    '❌ Error en Backup',
                                    `No se pudo crear el backup: ${backupResult.error}\n\n¿Deseas continuar sin backup? (NO RECOMENDADO)`,
                                    [
                                      { text: 'Cancelar', style: 'cancel' },
                                      {
                                        text: 'Continuar Sin Backup',
                                        style: 'destructive',
                                        onPress: () => executeStepCommand(step),
                                      },
                                    ]
                                  );
                                }
                              } catch (error) {
                                Alert.alert(
                                  '❌ Error',
                                  'Error inesperado al crear backup. Operación cancelada.'
                                );
                              }
                            },
                          },
                        ]
                      );
                    },
                  },
                ]
              );
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Ejecutar Paso',
      `¿Ejecutar: ${step.title}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ejecutar',
          onPress: () => executeStepCommand(step),
        },
      ]
    );
  };

  const getStepIcon = (stepNumber: number): string => {
    const status = stepStatuses[stepNumber];
    if (status === 'completed') return '✅';
    if (status === 'inProgress') return '⏳';
    if (status === 'error') return '⚠️';
    return '▫️';
  };

  const getStepColor = (stepNumber: number): string => {
    const status = stepStatuses[stepNumber];
    if (status === 'completed') return '#22C55E';
    if (status === 'inProgress') return colors.primary;
    if (status === 'error') return '#EF4444';
    return colors.muted;
  };

  const telnetReady = isConnected;
  const usbReady = usbStatus === 'connected';
  const allReady = telnetReady && usbReady;

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              Instalación del Toolbox
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Guía paso a paso para instalar el MIB2 STD2 Toolbox
            </Text>
          </View>

          {/* CRITICAL WARNING */}
          <View className="bg-error/10 rounded-xl p-4 border-2" style={{ borderColor: '#EF4444' }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-2xl">⚠️</Text>
              <Text className="text-lg font-bold" style={{ color: '#EF4444' }}>
                ADVERTENCIA CRÍTICA
              </Text>
            </View>
            <Text className="text-sm leading-relaxed" style={{ color: colors.foreground }}>
              La instalación del MIB2 Toolbox modifica archivos del sistema QNX. <Text className="font-bold" style={{ color: '#EF4444' }}>Un error puede BRICKEAR la unidad MIB2</Text> (valor: miles de dólares).
            </Text>
            <Text className="text-sm leading-relaxed mt-2" style={{ color: colors.foreground }}>
              El parcheo de <Text className="font-mono text-xs">tsd.mibstd2.system.swap</Text> altera la rutina de verificación de firmas digitales. <Text className="font-bold">No interrumpas el proceso una vez iniciado.</Text>
            </Text>
            <Text className="text-sm leading-relaxed mt-2" style={{ color: colors.foreground }}>
              Si algo falla, la única forma de recuperar la unidad es mediante acceso directo a la memoria eMMC (soldadura).
            </Text>
          </View>

          <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              Estado de Prerequisitos
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">{telnetReady ? '✅' : '❌'}</Text>
                <Text className="text-sm" style={{ color: colors.foreground }}>
                  Conexión Telnet {telnetReady ? 'Activa' : 'Inactiva'}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">{usbReady ? '✅' : '❌'}</Text>
                <Text className="text-sm" style={{ color: colors.foreground }}>
                  Adaptador USB {usbReady ? 'Conectado' : 'Desconectado'}
                </Text>
              </View>
              {!allReady && (
                <Text className="text-xs mt-2" style={{ color: '#F59E0B' }}>
                  ⚠️ Completa los prerequisitos antes de instalar
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleShowDiagnostics}
              className="flex-1 bg-primary/10 px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-center font-semibold text-xs" style={{ color: colors.primary }}>
                🔍 Diagnósticos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShowBackups}
              className="flex-1 bg-success/10 px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-center font-semibold text-xs" style={{ color: "#22C55E" }}>
                💾 Backups
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShowEmmcInfo}
              className="flex-1 bg-warning/10 px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-center font-semibold text-xs" style={{ color: "#F59E0B" }}>
                ⚙️ Método eMMC
              </Text>
            </TouchableOpacity>
          </View>

          {!selectedStep && !showEmmcInfo && !showDiagnostics && !showBackups && (
            <View className="gap-3">
              <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                Pasos de Instalación
              </Text>
              {TOOLBOX_INSTALLATION_STEPS.map((step) => (
                <TouchableOpacity
                  key={step.step}
                  onPress={() => handleSelectStep(step)}
                  className="bg-surface rounded-xl p-4 border active:opacity-80"
                  style={{ borderColor: colors.border }}
                >
                  <View className="flex-row items-center gap-3 mb-2">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-sm font-bold" style={{ color: colors.background }}>
                        {step.step}
                      </Text>
                    </View>
                    <Text className="text-base font-semibold flex-1" style={{ color: colors.foreground }}>
                      {step.title}
                    </Text>
                    <Text className="text-2xl">{getStepIcon(step.step)}</Text>
                  </View>
                  <Text className="text-xs ml-11" style={{ color: colors.muted }}>
                    {step.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedStep && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => setSelectedStep(null)}
                className="flex-row items-center gap-2"
              >
                <Text className="text-lg" style={{ color: colors.primary }}>
                  ←
                </Text>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Volver a la lista
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                <View className="flex-row items-center gap-3 mb-3">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-base font-bold" style={{ color: colors.background }}>
                      {selectedStep.step}
                    </Text>
                  </View>
                  <Text className="text-xl font-bold flex-1" style={{ color: colors.foreground }}>
                    {selectedStep.title}
                  </Text>
                </View>

                <Text className="text-sm leading-relaxed mb-4" style={{ color: colors.foreground }}>
                  {selectedStep.description}
                </Text>

                {selectedStep.command && (
                  <View className="bg-background rounded-lg p-3 mb-4">
                    <Text className="text-xs font-mono" style={{ color: colors.muted }}>
                      {selectedStep.command}
                    </Text>
                  </View>
                )}

                {selectedStep.warnings && selectedStep.warnings.length > 0 && (
                  <View className="bg-warning/10 rounded-lg p-3 mb-4">
                    {selectedStep.warnings.map((warning, idx) => (
                      <Text key={idx} className="text-xs leading-relaxed mb-1" style={{ color: colors.foreground }}>
                        💡 {warning}
                      </Text>
                    ))}
                  </View>
                )}

                {selectedStep.command && (
                  <TouchableOpacity
                    onPress={() => handleExecuteStep(selectedStep)}
                    disabled={!allReady || executing}
                    className="bg-primary px-6 py-3 rounded-xl active:opacity-80"
                    style={{
                      backgroundColor: !allReady || executing ? colors.muted : colors.primary,
                      opacity: !allReady || executing ? 0.5 : 1,
                    }}
                  >
                    {executing ? (
                      <View className="flex-row items-center justify-center gap-2">
                        <ActivityIndicator size="small" color={colors.background} />
                        <Text className="text-center font-semibold" style={{ color: colors.background }}>
                          Ejecutando...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-center font-semibold" style={{ color: colors.background }}>
                        ▶️ Ejecutar Paso
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {showEmmcInfo && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => setShowEmmcInfo(false)}
                className="flex-row items-center gap-2"
              >
                <Text className="text-lg" style={{ color: colors.primary }}>
                  ←
                </Text>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Volver a la lista
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                  {EMMC_ACCESS_INFO.title}
                </Text>
                <Text className="text-sm leading-relaxed mb-4" style={{ color: colors.foreground }}>
                  {EMMC_ACCESS_INFO.description}
                </Text>

                <Text className="text-base font-semibold mb-2" style={{ color: colors.foreground }}>
                  Pasos:
                </Text>
                {EMMC_ACCESS_INFO.steps.map((step, index) => (
                  <Text key={index} className="text-sm leading-relaxed mb-2" style={{ color: colors.foreground }}>
                    {index + 1}. {step}
                  </Text>
                ))}

                <View className="bg-error/10 rounded-lg p-3 mt-4">
                  {EMMC_ACCESS_INFO.warnings.map((warning, idx) => (
                    <Text key={idx} className="text-xs leading-relaxed mb-1" style={{ color: '#EF4444' }}>
                      ⚠️ {warning}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          )}

          {showDiagnostics && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => setShowDiagnostics(false)}
                className="flex-row items-center gap-2"
              >
                <Text className="text-lg" style={{ color: colors.primary }}>
                  ←
                </Text>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Volver a la lista
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                  Comandos de Diagnóstico
                </Text>
                {DIAGNOSTIC_COMMANDS.map((cmd, index) => (
                  <View key={index} className="mb-4">
                    <Text className="text-sm font-semibold mb-1" style={{ color: colors.foreground }}>
                      {cmd.name}
                    </Text>
                    <Text className="text-xs mb-2" style={{ color: colors.muted }}>
                      {cmd.description}
                    </Text>
                    <View className="bg-background rounded-lg p-2">
                      <Text className="text-xs font-mono" style={{ color: colors.muted }}>
                        {cmd.command}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {showBackups && (
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => setShowBackups(false)}
                className="flex-row items-center gap-2"
              >
                <Text className="text-lg" style={{ color: colors.primary }}>
                  ←
                </Text>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Volver a la lista
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                  💾 Gestión de Backups
                </Text>
                <Text className="text-xs mb-4" style={{ color: colors.muted }}>
                  Los backups se crean automáticamente antes de modificar archivos críticos del sistema MIB2.
                </Text>

                {loadingBackups ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text className="text-sm mt-2" style={{ color: colors.muted }}>
                      Cargando backups...
                    </Text>
                  </View>
                ) : backups.length === 0 ? (
                  <View className="items-center py-8">
                    <Text className="text-4xl mb-2">📁</Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      No hay backups disponibles
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {backups.map((backup, index) => (
                      <View
                        key={index}
                        className="bg-background rounded-lg p-3 border"
                        style={{ borderColor: colors.border }}
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-sm font-semibold flex-1" style={{ color: colors.foreground }}>
                            {backup.filename}
                          </Text>
                          <Text className="text-xs" style={{ color: colors.muted }}>
                            {(backup.size / 1024).toFixed(2)} KB
                          </Text>
                        </View>
                        <Text className="text-xs mb-1" style={{ color: colors.muted }}>
                          📅 {backup.timestamp}
                        </Text>
                        {backup.checksum && (
                          <Text className="text-xs mb-2 font-mono" style={{ color: colors.muted }}>
                            MD5: {backup.checksum.substring(0, 16)}...
                          </Text>
                        )}
                        <View className="flex-row gap-2 mt-2">
                          <TouchableOpacity
                            onPress={() => handleRestoreBackup(backup)}
                            className="flex-1 bg-success/10 px-3 py-2 rounded-lg active:opacity-80"
                          >
                            <Text className="text-center text-xs font-semibold" style={{ color: "#22C55E" }}>
                              ↻ Restaurar
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteBackup(backup)}
                            className="flex-1 bg-error/10 px-3 py-2 rounded-lg active:opacity-80"
                          >
                            <Text className="text-center text-xs font-semibold" style={{ color: "#EF4444" }}>
                              🗑️ Eliminar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
