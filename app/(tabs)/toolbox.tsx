import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTelnet } from "@/lib/telnet-provider";
import { useUsbStatus } from "@/lib/usb-status-context";
import { showAlert } from '@/lib/translated-alert';
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
      showAlert('alerts.error', 'alerts.debes_estar_conectado_por_telnet_para_ver_los_back');
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
      showAlert('alerts.error', 'alerts.no_se_pudieron_cargar_los_backups');
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleRestoreBackup = async (backup: BackupInfo) => {
    Alert.alert(
      t('toolbox.restore_backup_title'),
      t('toolbox.restore_backup_message', { filename: backup.filename, date: backup.timestamp, size: (backup.size / 1024).toFixed(2) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('toolbox.restore'),
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
                showAlert('alerts.éxito', 'alerts.backup_restaurado_correctamente');
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } else {
                Alert.alert(t('common.error'), result.error || t('toolbox.restore_error'));
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }
              }
            } catch (error) {
              showAlert('alerts.error', 'alerts.error_inesperado_al_restaurar_backup');
            }
          },
        },
      ]
    );
  };

  const handleDeleteBackup = async (backup: BackupInfo) => {
    Alert.alert(
      t('toolbox.delete_backup_title'),
      t('toolbox.delete_backup_message', { filename: backup.filename, date: backup.timestamp }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('toolbox.delete'),
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
                showAlert('alerts.éxito', 'alerts.backup_eliminado');
                await loadBackupsList();
              } else {
                showAlert('alerts.error', 'alerts.no_se_pudo_eliminar_el_backup');
              }
            } catch (error) {
              showAlert('alerts.error', 'alerts.error_inesperado_al_eliminar_backup');
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
        t('toolbox.script_generated'),
        t('toolbox.script_generated_message'),
        [
          { text: "OK" },
          {
            text: t('common.share'),
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
              }
            },
          },
        ]
      );
    } catch (error) {
      showAlert('alerts.error', 'alerts.no_se_pudo_generar_el_script_de_instalación');
      console.error(error);
    }
  };

  const handleGenerateVerification = () => {
    const command = generateToolboxVerificationCommand();
    Alert.alert(t('toolbox.verification_command'), command, [{ text: t('common.close') }]);
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
      showAlert('alerts.error', 'alerts.error_al_ejecutar_comando');
    }
  };

  const handleExecuteStep = async (step: InstallationStep) => {
    if (!isConnected) {
      showAlert('alerts.no_conectado', 'alerts.debes_conectarte_a_la_unidad_mib2_primero');
      return;
    }

    if (!step.command) {
      showAlert('alerts.sin_comando', 'alerts.este_paso_no_tiene_un_comando_asociado');
      return;
    }

    const isCriticalStep = step.step === 2 || step.titleKey.toLowerCase().includes('patch');

    if (isCriticalStep) {
      Alert.alert(
        t('toolbox.critical_step_1'),
        t('toolbox.critical_step_1_message'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.continue'),
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                t('toolbox.critical_step_2'),
                t('toolbox.critical_step_2_message'),
                [
                  { text: t('common.cancel'), style: 'cancel' },
                  {
                    text: t('toolbox.im_sure'),
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        t('toolbox.critical_step_3'),
                        t('toolbox.critical_step_3_message'),
                        [
                          { text: t('common.cancel'), style: 'cancel' },
                          {
                            text: t('toolbox.execute'),
                            style: 'destructive',
                            onPress: async () => {
                              // Crear backup automático antes del parcheo
                              showAlert('alerts.creando_backup', 'alerts.creando_backup_del_binario_crítico_antes_de_contin');
                              
                              try {
                                const backupResult = await backupCriticalBinary(
                                  async (cmd: string) => {
                                    const output = await sendCommand(cmd);
                                    return { output, success: true };
                                  }
                                );

                                if (backupResult.success && backupResult.backup) {
                                  Alert.alert(
                                    t('toolbox.backup_created'),
                                    t('toolbox.backup_created_message', { path: backupResult.backup.backupPath, size: (backupResult.backup.size / 1024).toFixed(2), checksum: backupResult.backup.checksum?.substring(0, 16) }),
                                    [
                                      {
                                        text: t('common.continue'),
                                        onPress: () => executeStepCommand(step),
                                      },
                                    ]
                                  );
                                } else {
                                  Alert.alert(
                                    t('toolbox.backup_error'),
                                    t('toolbox.backup_error_message', { error: backupResult.error }),
                                    [
                                      { text: t('common.cancel'), style: 'cancel' },
                                      {
                                        text: t('toolbox.continue_without_backup'),
                                        style: 'destructive',
                                        onPress: () => executeStepCommand(step),
                                      },
                                    ]
                                  );
                                }
                              } catch (error) {
                                showAlert('alerts.error', 'alerts.error_inesperado_al_crear_backup_operación_cancela');
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
      t('toolbox.execute_step'),
      t('toolbox.execute_step_confirm', { title: t(step.titleKey) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('toolbox.execute'),
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
              {t('toolbox.title')}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('toolbox.subtitle')}
            </Text>
          </View>

          {/* CRITICAL WARNING */}
          <View className="bg-error/10 rounded-xl p-4 border-2" style={{ borderColor: '#EF4444' }}>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-2xl">⚠️</Text>
              <Text className="text-lg font-bold" style={{ color: '#EF4444' }}>
                {t('toolbox.critical_warning')}
              </Text>
            </View>
            <Text className="text-sm leading-relaxed" style={{ color: colors.foreground }}>
              {t('toolbox.warning_text_1')}
            </Text>
            <Text className="text-sm leading-relaxed mt-2" style={{ color: colors.foreground }}>
              {t('toolbox.warning_text_2')}
            </Text>
            <Text className="text-sm leading-relaxed mt-2" style={{ color: colors.foreground }}>
              {t('toolbox.warning_text_3')}
            </Text>
          </View>

          <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
              {t('toolbox.prerequisites_status')}
            </Text>
            <View className="gap-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">{telnetReady ? '✅' : '❌'}</Text>
                <Text className="text-sm" style={{ color: colors.foreground }}>
                  {t('toolbox.telnet_connection')} {telnetReady ? t('toolbox.active') : t('toolbox.inactive')}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl">{usbReady ? '✅' : '❌'}</Text>
                <Text className="text-sm" style={{ color: colors.foreground }}>
                  {t('toolbox.usb_adapter')} {usbReady ? t('usb.status_connected') : t('usb.status_disconnected')}
                </Text>
              </View>
              {!allReady && (
                <Text className="text-xs mt-2" style={{ color: '#F59E0B' }}>
                  ⚠️ {t('toolbox.complete_prerequisites')}
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
                🔍 {t('toolbox.diagnostics')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShowBackups}
              className="flex-1 bg-success/10 px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-center font-semibold text-xs" style={{ color: "#22C55E" }}>
                💾 {t('toolbox.backups')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShowEmmcInfo}
              className="flex-1 bg-warning/10 px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-center font-semibold text-xs" style={{ color: "#F59E0B" }}>
                ⚙️ {t('toolbox.emmc_method')}
              </Text>
            </TouchableOpacity>
          </View>

          {!selectedStep && !showEmmcInfo && !showDiagnostics && !showBackups && (
            <View className="gap-3">
              <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
                {t('toolbox.installation_steps')}
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
                      {t(step.titleKey)}
                    </Text>
                    <Text className="text-2xl">{getStepIcon(step.step)}</Text>
                  </View>
                  <Text className="text-xs ml-11" style={{ color: colors.muted }}>
                    {t(step.descriptionKey)}
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
                  {t('toolbox.back_to_list')}
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
                    {t(selectedStep.titleKey)}
                  </Text>
                </View>

                <Text className="text-sm leading-relaxed mb-4" style={{ color: colors.foreground }}>
                  {t(selectedStep.descriptionKey)}
                </Text>

                {selectedStep.command && (
                  <View className="bg-background rounded-lg p-3 mb-4">
                    <Text className="text-xs font-mono" style={{ color: colors.muted }}>
                      {selectedStep.command}
                    </Text>
                  </View>
                )}

                {selectedStep.warningKeys && selectedStep.warningKeys.length > 0 && (
                  <View className="bg-warning/10 rounded-lg p-3 mb-4">
                    {selectedStep.warningKeys.map((warningKey: string, idx: number) => (
                      <Text key={idx} className="text-xs leading-relaxed mb-1" style={{ color: colors.foreground }}>
                        💡 {t(warningKey)}
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
                          {t('toolbox.executing')}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-center font-semibold" style={{ color: colors.background }}>
                        ▶️ {t('toolbox.execute_step')}
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
                  {t('toolbox.back_to_list')}
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                  {t(EMMC_ACCESS_INFO.titleKey)}
                </Text>
                <Text className="text-sm leading-relaxed mb-4" style={{ color: colors.foreground }}>
                  {t(EMMC_ACCESS_INFO.descriptionKey)}
                </Text>

                <Text className="text-base font-semibold mb-2" style={{ color: colors.foreground }}>
                  {t('toolbox.steps')}:
                </Text>
                {EMMC_ACCESS_INFO.stepKeys.map((stepKey, index) => (
                  <Text key={index} className="text-sm leading-relaxed mb-2" style={{ color: colors.foreground }}>
                    {index + 1}. {t(stepKey)}
                  </Text>
                ))}

                <View className="bg-error/10 rounded-lg p-3 mt-4">
                  {EMMC_ACCESS_INFO.warningKeys.map((warningKey: string, idx: number) => (
                    <Text key={idx} className="text-xs leading-relaxed mb-1" style={{ color: '#EF4444' }}>
                      ⚠️ {t(warningKey)}
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
                  {t('toolbox.back_to_list')}
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                  {t('toolbox.diagnostic_commands')}
                </Text>
                {DIAGNOSTIC_COMMANDS.map((cmd, index) => (
                  <View key={index} className="mb-4">
                    <Text className="text-sm font-semibold mb-1" style={{ color: colors.foreground }}>
                      {t(cmd.nameKey)}
                    </Text>
                    <Text className="text-xs mb-2" style={{ color: colors.muted }}>
                      {t(cmd.descriptionKey)}
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
                  {t('toolbox.back_to_list')}
                </Text>
              </TouchableOpacity>

              <View className="bg-surface rounded-xl p-4 border" style={{ borderColor: colors.border }}>
                <Text className="text-lg font-bold mb-3" style={{ color: colors.foreground }}>
                  💾 {t('toolbox.backup_management')}
                </Text>
                <Text className="text-xs mb-4" style={{ color: colors.muted }}>
                  {t('toolbox.backups_auto_created')}
                </Text>

                {loadingBackups ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text className="text-sm mt-2" style={{ color: colors.muted }}>
                      {t('toolbox.loading_backups')}
                    </Text>
                  </View>
                ) : backups.length === 0 ? (
                  <View className="items-center py-8">
                    <Text className="text-4xl mb-2">📁</Text>
                    <Text className="text-sm" style={{ color: colors.muted }}>
                      {t('toolbox.no_backups_available')}
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
                              ↻ {t('toolbox.restore')}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteBackup(backup)}
                            className="flex-1 bg-error/10 px-3 py-2 rounded-lg active:opacity-80"
                          >
                            <Text className="text-center text-xs font-semibold" style={{ color: "#EF4444" }}>
                              🗑️ {t('common.delete')}
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
