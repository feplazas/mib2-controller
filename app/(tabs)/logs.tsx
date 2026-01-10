import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";

export default function LogsScreen() {
  const { commandHistory, clearHistory } = useTelnet();

  const handleClearHistory = () => {
    Alert.alert(
      'Limpiar Historial',
      '¿Estás seguro de eliminar todo el historial de comandos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            clearHistory();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleExportLogs = async () => {
    if (commandHistory.length === 0) {
      Alert.alert('Sin Logs', 'No hay logs para exportar');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Format logs as text
      const logsText = commandHistory
        .map((log, index) => {
          const date = new Date(log.timestamp).toLocaleString();
          const status = log.success ? '✓ ÉXITO' : '✗ ERROR';
          return `
═══════════════════════════════════════
Log #${commandHistory.length - index}
Fecha: ${date}
Estado: ${status}
───────────────────────────────────────
Salida:
${log.output || '(sin salida)'}
${log.error ? `\nError: ${log.error}` : ''}
═══════════════════════════════════════
`;
        })
        .join('\n');

      const header = `MIB2 Controller - Logs de Comandos
Generado: ${new Date().toLocaleString()}
Total de comandos: ${commandHistory.length}
\n`;

      const fullContent = header + logsText;

      // Save to file
      const fileName = `mib2_logs_${Date.now()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, fullContent);

      // Share file
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Exportar Logs de MIB2',
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Éxito', `Logs guardados en: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      Alert.alert('Error', 'No se pudieron exportar los logs');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString();
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-1 gap-6">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">Logs</Text>
            <Text className="text-sm text-muted mt-1">
              {commandHistory.length} {commandHistory.length === 1 ? 'comando' : 'comandos'} en el historial
            </Text>
          </View>
          {commandHistory.length > 0 && (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleExportLogs}
                className="bg-primary px-4 py-2 rounded-lg active:opacity-80"
              >
                <Text className="text-white font-medium text-sm">Exportar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearHistory}
                className="bg-error px-4 py-2 rounded-lg active:opacity-80"
              >
                <Text className="text-white font-medium text-sm">Limpiar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logs List */}
        {commandHistory.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">📋</Text>
            <Text className="text-lg font-semibold text-foreground mb-2">
              Sin Logs
            </Text>
            <Text className="text-sm text-muted text-center">
              Los comandos ejecutados aparecerán aquí
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="gap-3 pb-4">
              {commandHistory.map((log, index) => (
                <View
                  key={`${log.timestamp}-${index}`}
                  className={`rounded-xl p-4 border ${
                    log.success
                      ? 'bg-success/10 border-success/30'
                      : 'bg-error/10 border-error/30'
                  }`}
                >
                  {/* Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg">
                        {log.success ? '✓' : '✗'}
                      </Text>
                      <Text className={`text-sm font-semibold ${
                        log.success ? 'text-success' : 'text-error'
                      }`}>
                        {log.success ? 'Éxito' : 'Error'}
                      </Text>
                    </View>
                    <Text className="text-xs text-muted">
                      {formatTimestamp(log.timestamp)}
                    </Text>
                  </View>

                  {/* Output */}
                  {log.output && (
                    <View className="bg-background rounded-lg p-3 mb-2">
                      <Text className="text-xs font-mono text-foreground">
                        {log.output.length > 500
                          ? log.output.substring(0, 500) + '...'
                          : log.output}
                      </Text>
                    </View>
                  )}

                  {/* Error */}
                  {log.error && (
                    <View className="bg-error/20 rounded-lg p-3">
                      <Text className="text-xs font-semibold text-error mb-1">
                        Error:
                      </Text>
                      <Text className="text-xs text-error">
                        {log.error}
                      </Text>
                    </View>
                  )}

                  {/* Timestamp */}
                  <Text className="text-xs text-muted mt-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </ScreenContainer>
  );
}
