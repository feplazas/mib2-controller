import { Alert, Pressable, ScrollView, Text, TextInput, View, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";
import { MIB2_COMMANDS } from "@/lib/telnet-client";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "@/lib/language-context";
import { 
  TELNET_SCRIPTS, 
  SCRIPT_CATEGORIES, 
  getScriptsByCategory, 
  getRecommendedFlow,
  type TelnetScript,
  type ScriptCategory,
  type ScriptRiskLevel
} from "@/lib/telnet-scripts-service";

import { showAlert } from '@/lib/translated-alert';

export default function CommandsScreen() {
  const t = useTranslation();
  const colors = useColors();
  const { isConnected, isConnecting, connect, disconnect, sendCommand, messages, clearMessages } = useTelnet();
  const [commandInput, setCommandInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ScriptCategory>('verification');
  const [isExecutingScript, setIsExecutingScript] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Filter suggestions based on input
  const suggestions = Object.entries(MIB2_COMMANDS)
    .filter(([key, cmd]) => 
      commandInput && (
        key.toLowerCase().includes(commandInput.toLowerCase()) ||
        cmd.toLowerCase().includes(commandInput.toLowerCase())
      )
    )
    .slice(0, 5);

  const handleSendCommand = () => {
    if (!commandInput.trim()) return;

    if (!isConnected) {
      showAlert('alerts.no_conectado', 'alerts.debes_conectarte_a_la_unidad_mib2_primero');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendCommand(commandInput);
    setCommandInput('');
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (command: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCommandInput(command);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleCopyMessage = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClearTerminal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearMessages();
  };

  const handleConnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await connect();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDisconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    disconnect();
  };

  /**
   * Ejecutar un script predefinido
   */
  const executeScript = async (script: TelnetScript) => {
    if (!isConnected) {
      showAlert('alerts.no_conectado', 'alerts.debes_conectarte_a_la_unidad_mib2_primero');
      return;
    }

    // Si requiere confirmación, mostrar alerta
    if (script.requiresConfirmation) {
      const warningText = script.warningKey ? t(script.warningKey) : t('telnet_scripts.default_warning');
      
      Alert.alert(
        t('telnet_scripts.confirm_execution'),
        `${t(script.descriptionKey)}\n\n⚠️ ${warningText}`,
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('telnet_scripts.execute'),
            style: script.riskLevel === 'danger' ? 'destructive' : 'default',
            onPress: () => runScriptCommands(script),
          },
        ]
      );
    } else {
      runScriptCommands(script);
    }
  };

  /**
   * Ejecutar los comandos de un script
   */
  const runScriptCommands = async (script: TelnetScript) => {
    setIsExecutingScript(true);
    setShowScriptsModal(false);
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Ejecutar cada comando en secuencia
      for (const cmd of script.commands) {
        sendCommand(cmd);
        // Pequeña pausa entre comandos para que el sistema procese
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Mostrar mensaje de éxito si existe
      if (script.successKey) {
        setTimeout(() => {
          Alert.alert(t('common.success'), t(script.successKey!));
        }, 1000);
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), String(error));
    } finally {
      setIsExecutingScript(false);
    }
  };

  /**
   * Obtener color según nivel de riesgo
   */
  const getRiskColor = (level: ScriptRiskLevel): string => {
    switch (level) {
      case 'info': return '#22C55E';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      default: return colors.muted;
    }
  };

  /**
   * Obtener icono según nivel de riesgo
   */
  const getRiskIcon = (level: ScriptRiskLevel): string => {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'danger': return '🔴';
      default: return '•';
    }
  };

  const getMessageColor = (type: string): string => {
    switch (type) {
      case 'command':
        return colors.primary;
      case 'error':
        return '#EF4444';
      case 'info':
        return '#F59E0B';
      case 'response':
      default:
        return colors.foreground;
    }
  };

  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Guía de instalación paso a paso
  const guideSteps = getRecommendedFlow();

  const renderScriptItem = (script: TelnetScript) => (
    <Pressable
      key={script.id}
      onPress={() => executeScript(script)}
      disabled={!isConnected || isExecutingScript}
      style={[
        styles.scriptItem,
        (!isConnected || isExecutingScript) && styles.scriptItemDisabled
      ]}
    >
      <View style={styles.scriptHeader}>
        <Text style={styles.scriptRiskIcon}>{getRiskIcon(script.riskLevel)}</Text>
        <Text style={styles.scriptName}>{t(script.nameKey)}</Text>
        {script.requiresConfirmation && (
          <View style={[styles.confirmBadge, { backgroundColor: getRiskColor(script.riskLevel) + '30' }]}>
            <Text style={[styles.confirmBadgeText, { color: getRiskColor(script.riskLevel) }]}>
              {t('telnet_scripts.requires_confirm')}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.scriptDescription}>{t(script.descriptionKey)}</Text>
      <View style={styles.scriptCommands}>
        {script.commands.map((cmd, idx) => (
          <Text key={idx} style={styles.scriptCommand}>$ {cmd}</Text>
        ))}
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="flex-1">
      <View className="flex-1 p-4 gap-4">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">{t('commands.terminal_title')}</Text>
            <Text className="text-sm text-muted">
              {isConnected ? '🟢 ' + t('commands.connected') : '🔴 ' + t('commands.disconnected')}
            </Text>
          </View>
          <View className="flex-row gap-2">
            {!isConnected ? (
              <Pressable
                onPress={handleConnect}
                disabled={isConnecting}
                className="bg-success px-4 py-2 rounded-lg active:opacity-80"
              >
                <Text className="text-background font-semibold">
                  {isConnecting ? t('commands.connecting') : t('commands.connect')}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleDisconnect}
                className="bg-error px-4 py-2 rounded-lg active:opacity-80"
              >
                <Text className="text-background font-semibold">{t('commands.disconnect')}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Scripts Buttons */}
        <View style={styles.scriptsButtonsRow}>
          <Pressable
            onPress={() => setShowScriptsModal(true)}
            style={[styles.scriptsButton, !isConnected && styles.scriptsButtonDisabled]}
            disabled={!isConnected}
          >
            <Text style={styles.scriptsButtonIcon}>📜</Text>
            <Text style={styles.scriptsButtonText}>{t('telnet_scripts.scripts_library')}</Text>
          </Pressable>
          <Pressable
            onPress={() => { setCurrentGuideStep(0); setShowGuideModal(true); }}
            style={[styles.guideButton, !isConnected && styles.scriptsButtonDisabled]}
            disabled={!isConnected}
          >
            <Text style={styles.scriptsButtonIcon}>🚀</Text>
            <Text style={styles.guideButtonText}>{t('telnet_scripts.installation_guide')}</Text>
          </Pressable>
        </View>

        {/* Terminal Output */}
        <View className="flex-1 bg-background border border-border rounded-xl overflow-hidden">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 p-4"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-muted text-center">
                  {t('commands.terminal_empty')}{'\n'}
                  {isConnected ? t('commands.type_command_below') : t('commands.connect_first_to_send')}
                </Text>
              </View>
            ) : (
              <View className="gap-1">
                {messages.map((msg, index) => (
                  <Pressable
                    key={index}
                    onLongPress={() => handleCopyMessage(msg.text)}
                    className="active:opacity-70"
                  >
                    <View className="flex-row gap-2">
                      <Text className="text-xs text-muted font-mono">
                        {formatTimestamp(msg.timestamp)}
                      </Text>
                      <Text
                        className="flex-1 text-sm font-mono"
                        style={{ color: getMessageColor(msg.type) }}
                      >
                        {msg.text}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Clear Button */}
          {messages.length > 0 && (
            <Pressable
              onPress={handleClearTerminal}
              className="absolute top-2 right-2 bg-surface/90 px-3 py-1 rounded-lg active:opacity-80"
            >
              <Text className="text-xs text-muted font-semibold">{t('commands.clear')}</Text>
            </Pressable>
          )}
        </View>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View className="bg-surface border border-border rounded-xl p-2 max-h-40">
            <ScrollView>
              {suggestions.map(([key, cmd]) => (
                <Pressable
                  key={key}
                  onPress={() => handleSelectSuggestion(cmd)}
                  className="p-2 active:bg-primary/10 rounded-lg"
                >
                  <Text className="text-sm font-semibold text-foreground">{key}</Text>
                  <Text className="text-xs text-muted font-mono" numberOfLines={1}>
                    {cmd}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Command Input */}
        <View className="flex-row gap-2">
          <View className="flex-1">
            <TextInput
              ref={inputRef}
              value={commandInput}
              onChangeText={(text) => {
                setCommandInput(text);
                setShowSuggestions(text.length > 0);
              }}
              onSubmitEditing={handleSendCommand}
              placeholder={isConnected ? t('commands.type_command') : t('commands.connect_first')}
              placeholderTextColor={colors.muted}
              editable={isConnected}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground font-mono"
            />
          </View>
          <Pressable
            onPress={handleSendCommand}
            disabled={!isConnected || !commandInput.trim()}
            className={`px-6 py-3 rounded-xl active:opacity-80 ${
              isConnected && commandInput.trim() ? 'bg-primary' : 'bg-muted/20'
            }`}
          >
            <Text
              className={`font-semibold ${
                isConnected && commandInput.trim() ? 'text-background' : 'text-muted'
              }`}
            >
              {t('commands.send')}
            </Text>
          </Pressable>
        </View>

        {/* Quick Commands */}
        <View>
          <Text className="text-sm font-semibold text-foreground mb-2">{t('commands.quick_commands')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {Object.entries(MIB2_COMMANDS).slice(0, 6).map(([key, cmd]) => (
              <Pressable
                key={key}
                onPress={() => {
                  setCommandInput(cmd);
                  setShowSuggestions(false);
                }}
                className="bg-surface border border-border px-4 py-2 rounded-full active:opacity-80"
              >
                <Text className="text-xs font-semibold text-foreground">{key}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Scripts Library Modal */}
      <Modal
        visible={showScriptsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScriptsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('telnet_scripts.scripts_library')}</Text>
              <Pressable onPress={() => setShowScriptsModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Warning Banner */}
            <View style={styles.warningBanner}>
              <Text style={styles.warningBannerText}>
                ⚠️ {t('telnet_scripts.scripts_warning')}
              </Text>
            </View>

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
              {SCRIPT_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryTab,
                    selectedCategory === cat.id && styles.categoryTabActive
                  ]}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive
                  ]}>
                    {t(cat.nameKey)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Scripts List */}
            <ScrollView style={styles.scriptsList}>
              {getScriptsByCategory(selectedCategory).map(renderScriptItem)}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Installation Guide Modal */}
      <Modal
        visible={showGuideModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGuideModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('telnet_scripts.installation_guide')}</Text>
              <Pressable onPress={() => setShowGuideModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Progress */}
            <View style={styles.guideProgress}>
              <Text style={styles.guideProgressText}>
                {t('telnet_scripts.step')} {currentGuideStep + 1} / {guideSteps.length}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((currentGuideStep + 1) / guideSteps.length) * 100}%` }]} />
              </View>
            </View>

            {/* Current Step */}
            {guideSteps[currentGuideStep] && (
              <View style={styles.guideStep}>
                <View style={styles.guideStepHeader}>
                  <Text style={styles.guideStepIcon}>{getRiskIcon(guideSteps[currentGuideStep].riskLevel)}</Text>
                  <Text style={styles.guideStepTitle}>{t(guideSteps[currentGuideStep].nameKey)}</Text>
                </View>
                <Text style={styles.guideStepDescription}>
                  {t(guideSteps[currentGuideStep].descriptionKey)}
                </Text>
                <View style={styles.guideStepCommands}>
                  {guideSteps[currentGuideStep].commands.map((cmd, idx) => (
                    <Text key={idx} style={styles.guideStepCommand}>$ {cmd}</Text>
                  ))}
                </View>

                {/* Execute Button */}
                <Pressable
                  onPress={() => executeScript(guideSteps[currentGuideStep])}
                  disabled={isExecutingScript}
                  style={[
                    styles.executeButton,
                    { backgroundColor: getRiskColor(guideSteps[currentGuideStep].riskLevel) },
                    isExecutingScript && styles.executeButtonDisabled
                  ]}
                >
                  {isExecutingScript ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.executeButtonText}>{t('telnet_scripts.execute_step')}</Text>
                  )}
                </Pressable>
              </View>
            )}

            {/* Navigation */}
            <View style={styles.guideNavigation}>
              <Pressable
                onPress={() => setCurrentGuideStep(Math.max(0, currentGuideStep - 1))}
                disabled={currentGuideStep === 0}
                style={[styles.navButton, currentGuideStep === 0 && styles.navButtonDisabled]}
              >
                <Text style={styles.navButtonText}>← {t('common.back')}</Text>
              </Pressable>
              <Pressable
                onPress={() => setCurrentGuideStep(Math.min(guideSteps.length - 1, currentGuideStep + 1))}
                disabled={currentGuideStep === guideSteps.length - 1}
                style={[styles.navButton, currentGuideStep === guideSteps.length - 1 && styles.navButtonDisabled]}
              >
                <Text style={styles.navButtonText}>{t('common.next')} →</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scriptsButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scriptsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.15)',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  scriptsButtonDisabled: {
    opacity: 0.5,
  },
  scriptsButtonIcon: {
    fontSize: 18,
  },
  scriptsButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
    fontSize: 14,
  },
  guideButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  guideButtonText: {
    color: '#22C55E',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e2022',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ECEDEE',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#9BA1A6',
  },
  warningBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  warningBannerText: {
    color: '#FBBF24',
    fontSize: 12,
    lineHeight: 18,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryTabActive: {
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
    borderColor: '#0a7ea4',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    color: '#9BA1A6',
    fontSize: 13,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#0a7ea4',
  },
  scriptsList: {
    paddingHorizontal: 16,
  },
  scriptItem: {
    backgroundColor: 'rgba(30, 32, 34, 0.6)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scriptItemDisabled: {
    opacity: 0.5,
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  scriptRiskIcon: {
    fontSize: 14,
  },
  scriptName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ECEDEE',
    flex: 1,
  },
  confirmBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confirmBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  scriptDescription: {
    fontSize: 13,
    color: '#9BA1A6',
    marginBottom: 12,
    lineHeight: 18,
  },
  scriptCommands: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
  },
  scriptCommand: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#22C55E',
    marginBottom: 2,
  },
  guideProgress: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  guideProgressText: {
    color: '#9BA1A6',
    fontSize: 13,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 2,
  },
  guideStep: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  guideStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guideStepIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  guideStepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ECEDEE',
  },
  guideStepDescription: {
    fontSize: 14,
    color: '#9BA1A6',
    lineHeight: 22,
    marginBottom: 16,
  },
  guideStepCommands: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  guideStepCommand: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#22C55E',
    marginBottom: 4,
  },
  executeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  executeButtonDisabled: {
    opacity: 0.6,
  },
  executeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  guideNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
    fontSize: 14,
  },
});
