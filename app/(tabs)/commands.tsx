import { View, Text, TextInput, ScrollView, Pressable, Modal, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
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
import {
  getMIB2State,
  subscribeMIB2State,
  setConnected,
  verifyFullSystemState,
  verifySingleState,
  isScriptEnabled,
  getRecommendedNextStep,
  getAvailableScriptCategories,
  type MIB2SystemState
} from "@/lib/mib2-state-service";

import { showAlert } from '@/lib/translated-alert';
import { InstallationGuide } from '@/components/installation-guide';

export default function CommandsScreen() {
  const t = useTranslation();
  const colors = useColors();
  const { isConnected, isConnecting, connect, disconnect, sendCommand, messages, clearMessages } = useTelnet();
  const [commandInput, setCommandInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showScriptsModal, setShowScriptsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ScriptCategory>('verification');
  const [isExecutingScript, setIsExecutingScript] = useState(false);
  const [showInstallationGuide, setShowInstallationGuide] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [currentGuideStep, setCurrentGuideStep] = useState(0);
  
  // Estado para progreso de backup dd
  const [ddProgress, setDdProgress] = useState<{
    isRunning: boolean;
    bytesTransferred: number;
    totalBytes: number;
    speed: string;
    speedBytesPerSec: number; // Para cálculos de ETA
    elapsed: string;
    elapsedSeconds: number; // Para cálculos de ETA
    scriptName: string;
    outputFile: string; // Nombre del archivo de backup para limpieza
    eta: string; // Tiempo estimado restante
  } | null>(null);
  
  // Estado del sistema MIB2
  const [mib2State, setMib2State] = useState<MIB2SystemState>(getMIB2State());
  const [isVerifyingState, setIsVerifyingState] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Suscribirse a cambios de estado MIB2
  useEffect(() => {
    const unsubscribe = subscribeMIB2State((state) => {
      setMib2State(state);
    });
    return unsubscribe;
  }, []);

  // Actualizar estado de conexión en el servicio
  useEffect(() => {
    setConnected(isConnected);
    
    // Si se conecta, verificar estado del sistema automáticamente
    if (isConnected && !mib2State.lastVerification) {
      handleVerifySystemState();
    }
  }, [isConnected]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Parsear progreso de dd desde mensajes del terminal
  useEffect(() => {
    if (!ddProgress?.isRunning) return;
    
    const lastMessages = messages.slice(-5);
    for (const msg of lastMessages) {
      if (msg.type === 'response') {
        // Formato de dd status=progress: "123456789 bytes (123 MB, 117 MiB) copied, 5.12345 s, 24.1 MB/s"
        const ddMatch = msg.text.match(/(\d+)\s+bytes.*copied,\s+([\d.]+)\s*s?,\s+([\d.]+)\s*(\w+)\/s/);
        if (ddMatch) {
          const bytesTransferred = parseInt(ddMatch[1]);
          const elapsedSeconds = parseFloat(ddMatch[2]);
          const speedValue = parseFloat(ddMatch[3]);
          const speedUnit = ddMatch[4];
          const speed = `${speedValue} ${speedUnit}/s`;
          
          // Convertir velocidad a bytes/segundo para cálculo de ETA
          let speedBytesPerSec = speedValue;
          if (speedUnit === 'kB' || speedUnit === 'KB') speedBytesPerSec = speedValue * 1024;
          else if (speedUnit === 'MB') speedBytesPerSec = speedValue * 1024 * 1024;
          else if (speedUnit === 'GB') speedBytesPerSec = speedValue * 1024 * 1024 * 1024;
          
          // Calcular ETA
          let eta = '--:--';
          if (speedBytesPerSec > 0 && ddProgress.totalBytes > bytesTransferred) {
            const bytesRemaining = ddProgress.totalBytes - bytesTransferred;
            const secondsRemaining = bytesRemaining / speedBytesPerSec;
            
            if (secondsRemaining < 3600) {
              // Menos de 1 hora: mm:ss
              eta = `${Math.floor(secondsRemaining / 60)}:${String(Math.floor(secondsRemaining % 60)).padStart(2, '0')}`;
            } else {
              // Más de 1 hora: hh:mm:ss
              const hours = Math.floor(secondsRemaining / 3600);
              const mins = Math.floor((secondsRemaining % 3600) / 60);
              const secs = Math.floor(secondsRemaining % 60);
              eta = `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }
          }
          
          setDdProgress(prev => prev ? {
            ...prev,
            bytesTransferred,
            speed,
            speedBytesPerSec,
            elapsed: `${Math.floor(elapsedSeconds / 60)}:${String(Math.floor(elapsedSeconds % 60)).padStart(2, '0')}`,
            elapsedSeconds,
            eta
          } : null);
        }
        
        // Detectar fin del backup
        if (msg.text.includes('BACKUP COMPLETADO') || msg.text.includes('ERROR: Backup')) {
          setDdProgress(null);
        }
      }
    }
  }, [messages, ddProgress?.isRunning, ddProgress?.totalBytes]);

  /**
   * Ejecutar comando y capturar respuesta para verificación de estado
   */
  const executeCommandForState = useCallback(async (cmd: string): Promise<string> => {
    return new Promise((resolve) => {
      sendCommand(cmd);
      // Esperar un poco para que llegue la respuesta
      setTimeout(() => {
        // Obtener los últimos mensajes de respuesta
        const recentResponses = messages
          .filter(m => m.type === 'response')
          .slice(-5)
          .map(m => m.text)
          .join('\n');
        resolve(recentResponses);
      }, 1000);
    });
  }, [sendCommand, messages]);

  /**
   * Verificar estado completo del sistema
   */
  const handleVerifySystemState = async () => {
    if (!isConnected) {
      showAlert('alerts.no_conectado', 'alerts.debes_conectarte_a_la_unidad_mib2_primero');
      return;
    }

    setIsVerifyingState(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Ejecutar comandos de verificación secuencialmente
      // Verificar root
      sendCommand('whoami');
      await new Promise(r => setTimeout(r, 800));
      
      // Verificar SD montada
      sendCommand('mount | grep -E "/mnt/sd|/fs/sd"');
      await new Promise(r => setTimeout(r, 800));
      
      // Verificar Toolbox instalado
      sendCommand('ls -la /eso/bin/apps 2>/dev/null || ls -la /eso 2>/dev/null || echo "NOT_FOUND"');
      await new Promise(r => setTimeout(r, 800));
      
      // Verificar sistema parcheado
      sendCommand('ls -la /eso/hmi/lsd/tsd.mibstd2.system.swap 2>/dev/null || echo "NOT_PATCHED"');
      await new Promise(r => setTimeout(r, 800));
      
      // Obtener versión QNX
      sendCommand('uname -a');
      await new Promise(r => setTimeout(r, 800));

      // Analizar respuestas de los mensajes
      await analyzeMessagesForState();
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsVerifyingState(false);
    }
  };

  /**
   * Analizar mensajes del terminal para actualizar estado
   */
  const analyzeMessagesForState = async () => {
    const recentMessages = messages.slice(-20);
    const responseText = recentMessages
      .filter(m => m.type === 'response')
      .map(m => m.text)
      .join('\n');

    // Detectar root
    const hasRoot = responseText.toLowerCase().includes('root');
    
    // Detectar SD montada
    const sdMounted = responseText.includes('/mnt/sd') || responseText.includes('/fs/sd');
    
    // Detectar Toolbox
    const toolboxInstalled = !responseText.includes('NOT_FOUND') && 
      (responseText.includes('toolbox') || responseText.includes('apps') || responseText.includes('gem'));
    
    // Detectar parche
    const systemPatched = !responseText.includes('NOT_PATCHED') && 
      responseText.includes('tsd.mibstd2.system.swap');
    
    // Detectar versión QNX
    const qnxMatch = responseText.match(/QNX\s+\S+\s+(\d+\.\d+\.\d+)/);
    const qnxVersion = qnxMatch ? qnxMatch[1] : null;

    // Actualizar estado manualmente (el servicio notificará a los suscriptores)
    setMib2State(prev => ({
      ...prev,
      hasRootAccess: hasRoot,
      isSDMounted: sdMounted,
      sdMountPath: sdMounted ? '/mnt/sd' : null,
      isToolboxInstalled: toolboxInstalled,
      toolboxPath: toolboxInstalled ? '/eso' : null,
      isSystemPatched: systemPatched,
      qnxVersion: qnxVersion,
      lastVerification: new Date()
    }));
  };

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
   * Verificar si un script está habilitado
   */
  const checkScriptEnabled = (scriptId: string): { enabled: boolean; reason?: string } => {
    return isScriptEnabled(scriptId, mib2State);
  };

  /**
   * Ejecutar un script predefinido
   */
  const executeScript = async (script: TelnetScript) => {
    if (!isConnected) {
      showAlert('alerts.no_conectado', 'alerts.debes_conectarte_a_la_unidad_mib2_primero');
      return;
    }

    // Verificar si el script está habilitado
    const { enabled, reason } = checkScriptEnabled(script.id);
    if (!enabled && reason) {
      const reasonMessage = t(`mib2_state.${reason}`);
      Alert.alert(
        t('common.warning'),
        reasonMessage,
        [{ text: t('common.confirm'), style: 'default' }]
      );
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
    
    // Detectar si es un script de backup dd para mostrar progreso
    const isDdBackup = script.id.startsWith('dd_backup');
    if (isDdBackup) {
      // Estimar tamaño total y nombre de archivo según el tipo de backup
      let estimatedSize = 8000000000; // 8GB por defecto para backup completo
      let outputFile = '/mnt/sd/mib2_full_backup.img';
      
      if (script.id === 'dd_backup_partition1') {
        estimatedSize = 2000000000; // 2GB
        outputFile = '/mnt/sd/mib2_system_backup.img';
      }
      if (script.id === 'dd_backup_partition2') {
        estimatedSize = 1000000000; // 1GB
        outputFile = '/mnt/sd/mib2_data_backup.img';
      }
      
      setDdProgress({
        isRunning: true,
        bytesTransferred: 0,
        totalBytes: estimatedSize,
        speed: '0 MB/s',
        speedBytesPerSec: 0,
        elapsed: '0:00',
        elapsedSeconds: 0,
        scriptName: t(script.nameKey),
        outputFile: outputFile,
        eta: '--:--'
      });
    }
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Ejecutar cada comando en secuencia
      for (const cmd of script.commands) {
        sendCommand(cmd);
        // Pausa más larga para comandos dd
        const delay = isDdBackup ? 1000 : 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // No mostrar éxito inmediato para dd, esperar a que termine
      if (!isDdBackup) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Mostrar mensaje de éxito si existe
        if (script.successKey) {
          setTimeout(() => {
            Alert.alert(t('common.success'), t(script.successKey!));
          }, 1000);
        }
      }
      
      // Actualizar estado después de ejecutar script
      setTimeout(() => {
        analyzeMessagesForState();
      }, 1500);
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), String(error));
      if (isDdBackup) setDdProgress(null);
    } finally {
      setIsExecutingScript(false);
    }
  };

  /**
   * Cancelar backup dd en progreso
   */
  const handleCancelBackup = () => {
    const outputFile = ddProgress?.outputFile || '/mnt/sd/mib2_backup.img';
    
    Alert.alert(
      t('telnet_scripts.cancel_backup_title'),
      t('telnet_scripts.cancel_backup_confirm'),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('common.yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              
              // Enviar señal para terminar el proceso dd
              // En QNX/Linux, Ctrl+C envía SIGINT
              sendCommand('\x03'); // Ctrl+C
              
              // También intentar matar el proceso dd directamente
              setTimeout(() => {
                sendCommand('pkill -9 dd 2>/dev/null || killall dd 2>/dev/null');
              }, 500);
              
              // Guardar referencia al archivo antes de limpiar estado
              const fileToClean = outputFile;
              
              // Limpiar estado de progreso
              setDdProgress(null);
              
              // Preguntar si desea eliminar el archivo parcial
              setTimeout(() => {
                Alert.alert(
                  t('telnet_scripts.cleanup_partial_title'),
                  t('telnet_scripts.cleanup_partial_confirm', { file: fileToClean }),
                  [
                    { 
                      text: t('common.no'), 
                      style: 'cancel',
                      onPress: () => {
                        sendCommand(`echo "Archivo parcial conservado: ${fileToClean}"`);
                      }
                    },
                    {
                      text: t('telnet_scripts.delete_file'),
                      style: 'destructive',
                      onPress: () => {
                        sendCommand(`rm -f ${fileToClean} && echo "✅ Archivo parcial eliminado: ${fileToClean}" || echo "❌ Error al eliminar archivo"`);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      },
                    },
                  ]
                );
              }, 1500);
              
            } catch (error) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(t('common.error'), String(error));
            }
          },
        },
      ]
    );
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

  // Obtener siguiente paso recomendado
  const recommendedStep = getRecommendedNextStep(mib2State);

  // Obtener categorías disponibles
  const availableCategories = getAvailableScriptCategories(mib2State);

  const renderScriptItem = (script: TelnetScript) => {
    const { enabled, reason } = checkScriptEnabled(script.id);
    
    return (
      <Pressable
        key={script.id}
        onPress={() => executeScript(script)}
        disabled={!enabled || isExecutingScript}
        style={[
          styles.scriptItem,
          (!enabled || isExecutingScript) && styles.scriptItemDisabled
        ]}
      >
        <View style={styles.scriptHeader}>
          <Text style={styles.scriptRiskIcon}>{getRiskIcon(script.riskLevel)}</Text>
          <Text style={[styles.scriptName, !enabled && { color: '#666' }]}>{t(script.nameKey)}</Text>
          {script.requiresConfirmation && enabled && (
            <View style={[styles.confirmBadge, { backgroundColor: getRiskColor(script.riskLevel) + '30' }]}>
              <Text style={[styles.confirmBadgeText, { color: getRiskColor(script.riskLevel) }]}>
                {t('telnet_scripts.requires_confirm')}
              </Text>
            </View>
          )}
          {!enabled && reason && (
            <View style={[styles.confirmBadge, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Text style={[styles.confirmBadgeText, { color: '#EF4444' }]}>
                {t(`mib2_state.${reason}_short`)}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.scriptDescription, !enabled && { color: '#555' }]}>{t(script.descriptionKey)}</Text>
        <View style={styles.scriptCommands}>
          {script.commands.map((cmd, idx) => (
            <Text key={idx} style={[styles.scriptCommand, !enabled && { color: '#555' }]}>$ {cmd}</Text>
          ))}
        </View>
      </Pressable>
    );
  };

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

        {/* System State Panel */}
        {isConnected && (
          <View style={styles.statePanel}>
            <View style={styles.statePanelHeader}>
              <Text style={styles.statePanelTitle}>{t('mib2_state.system_status')}</Text>
              <Pressable
                onPress={handleVerifySystemState}
                disabled={isVerifyingState}
                style={styles.refreshButton}
              >
                {isVerifyingState ? (
                  <ActivityIndicator size="small" color="#0a7ea4" />
                ) : (
                  <Text style={styles.refreshButtonText}>🔄 {t('mib2_state.refresh')}</Text>
                )}
              </Pressable>
            </View>
            
            <View style={styles.stateIndicators}>
              <View style={styles.stateIndicator}>
                <Text style={styles.stateIcon}>{mib2State.hasRootAccess ? '✅' : '❌'}</Text>
                <Text style={styles.stateLabel}>{t('mib2_state.root_access')}</Text>
              </View>
              <View style={styles.stateIndicator}>
                <Text style={styles.stateIcon}>{mib2State.isSDMounted ? '✅' : '❌'}</Text>
                <Text style={styles.stateLabel}>{t('mib2_state.sd_mounted')}</Text>
              </View>
              <View style={styles.stateIndicator}>
                <Text style={styles.stateIcon}>{mib2State.isToolboxInstalled ? '✅' : '❌'}</Text>
                <Text style={styles.stateLabel}>{t('mib2_state.toolbox_installed')}</Text>
              </View>
              <View style={styles.stateIndicator}>
                <Text style={styles.stateIcon}>{mib2State.isSystemPatched ? '✅' : '❌'}</Text>
                <Text style={styles.stateLabel}>{t('mib2_state.system_patched')}</Text>
              </View>
            </View>

            {/* Recommended Next Step */}
            {recommendedStep.scriptId && (
              <View style={styles.recommendedStep}>
                <Text style={styles.recommendedLabel}>💡 {t('mib2_state.recommended_next')}:</Text>
                <Text style={styles.recommendedText}>{t(`mib2_state.${recommendedStep.message}`)}</Text>
              </View>
            )}
            {!recommendedStep.scriptId && recommendedStep.message === 'system_ready' && (
              <View style={[styles.recommendedStep, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <Text style={[styles.recommendedLabel, { color: '#22C55E' }]}>✅ {t('mib2_state.system_ready')}</Text>
              </View>
            )}
          </View>
        )}

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
            onPress={() => setShowInstallationGuide(true)}
            style={styles.guideButton}
          >
            <Text style={styles.scriptsButtonIcon}>📖</Text>
            <Text style={styles.guideButtonText}>{t('installation_guide.title')}</Text>
          </Pressable>
        </View>

        {/* Barra de Progreso dd */}
        {ddProgress && (
          <View style={styles.ddProgressContainer}>
            <View style={styles.ddProgressHeader}>
              <Text style={styles.ddProgressTitle}>💾 {ddProgress.scriptName}</Text>
              <View style={styles.ddProgressTimeContainer}>
                <Text style={styles.ddProgressTime}>⏱️ {ddProgress.elapsed}</Text>
                <Text style={styles.ddProgressEta}>⏳ ETA: {ddProgress.eta}</Text>
              </View>
            </View>
            
            <View style={styles.ddProgressBarContainer}>
              <View 
                style={[
                  styles.ddProgressBar, 
                  { width: `${Math.min((ddProgress.bytesTransferred / ddProgress.totalBytes) * 100, 100)}%` }
                ]} 
              />
            </View>
            
            <View style={styles.ddProgressStats}>
              <Text style={styles.ddProgressStat}>
                {(ddProgress.bytesTransferred / 1024 / 1024).toFixed(1)} MB / {(ddProgress.totalBytes / 1024 / 1024 / 1024).toFixed(1)} GB
              </Text>
              <Text style={styles.ddProgressStat}>
                {Math.round((ddProgress.bytesTransferred / ddProgress.totalBytes) * 100)}%
              </Text>
              <Text style={styles.ddProgressStat}>
                🚀 {ddProgress.speed}
              </Text>
            </View>
            
            {/* Archivo de destino */}
            <Text style={styles.ddProgressFile}>
              📁 {ddProgress.outputFile}
            </Text>
            
            <Text style={styles.ddProgressWarning}>
              ⚠️ {t('telnet_scripts.dd_progress_warning')}
            </Text>
            
            {/* Botón de Cancelación */}
            <Pressable
              onPress={handleCancelBackup}
              style={styles.ddCancelButton}
            >
              <Text style={styles.ddCancelButtonText}>❌ {t('telnet_scripts.cancel_backup')}</Text>
            </Pressable>
          </View>
        )}

        {/* Terminal Output */}
        <View className="flex-1 bg-background border border-border rounded-xl overflow-hidden">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 p-4"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
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
              {SCRIPT_CATEGORIES.map(cat => {
                const categoryAvailable = availableCategories[cat.id as keyof typeof availableCategories];
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.categoryTab,
                      selectedCategory === cat.id && styles.categoryTabActive,
                      !categoryAvailable && styles.categoryTabDisabled
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === cat.id && styles.categoryTextActive,
                      !categoryAvailable && styles.categoryTextDisabled
                    ]}>
                      {t(cat.nameKey)}
                    </Text>
                  </Pressable>
                );
              })}
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
                {(() => {
                  const { enabled, reason } = checkScriptEnabled(guideSteps[currentGuideStep].id);
                  return (
                    <Pressable
                      onPress={() => executeScript(guideSteps[currentGuideStep])}
                      disabled={isExecutingScript || !enabled}
                      style={[
                        styles.executeButton,
                        { backgroundColor: enabled ? getRiskColor(guideSteps[currentGuideStep].riskLevel) : '#666' },
                        (isExecutingScript || !enabled) && styles.executeButtonDisabled
                      ]}
                    >
                      {isExecutingScript ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.executeButtonText}>
                          {enabled ? t('telnet_scripts.execute_step') : t(`mib2_state.${reason}_short`)}
                        </Text>
                      )}
                    </Pressable>
                  );
                })()}
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

      {/* Installation Guide Modal */}
      <Modal
        visible={showInstallationGuide}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowInstallationGuide(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('installation_guide.title')}</Text>
            <Pressable onPress={() => setShowInstallationGuide(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          <InstallationGuide />
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statePanel: {
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
  },
  statePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statePanelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ECEDEE',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(10, 126, 164, 0.15)',
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  stateIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  stateIndicator: {
    alignItems: 'center',
    gap: 4,
  },
  stateIcon: {
    fontSize: 16,
  },
  stateLabel: {
    fontSize: 10,
    color: '#9BA1A6',
    textAlign: 'center',
  },
  recommendedStep: {
    backgroundColor: 'rgba(10, 126, 164, 0.15)',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  recommendedLabel: {
    fontSize: 12,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  recommendedText: {
    fontSize: 11,
    color: '#9BA1A6',
    marginTop: 4,
  },
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
  // Estilos para barra de progreso dd
  ddProgressContainer: {
    backgroundColor: 'rgba(10, 126, 164, 0.15)',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
  },
  ddProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ddProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ECEDEE',
  },
  ddProgressTime: {
    fontSize: 14,
    color: '#9BA1A6',
    fontFamily: 'monospace',
  },
  ddProgressBarContainer: {
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  ddProgressBar: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
  },
  ddProgressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ddProgressStat: {
    fontSize: 12,
    color: '#9BA1A6',
    fontFamily: 'monospace',
  },
  ddProgressWarning: {
    fontSize: 11,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 4,
  },
  ddProgressTimeContainer: {
    alignItems: 'flex-end',
  },
  ddProgressEta: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 2,
  },
  ddProgressFile: {
    fontSize: 11,
    color: '#9BA1A6',
    textAlign: 'center',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  ddCancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  ddCancelButtonText: {
    color: '#EF4444',
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
  categoryTabDisabled: {
    opacity: 0.5,
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
  categoryTextDisabled: {
    color: '#555',
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
