import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { ScreenContainer } from '@/components/screen-container';
import { usbLogger, type UsbLogEntry, type LogLevel } from '@/lib/usb-logger';
import { useTranslation } from "@/lib/language-context";
import { showAlert } from '@/lib/translated-alert';

export default function DiagScreen() {
  const t = useTranslation();
  const [logs, setLogs] = useState<UsbLogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Suscribirse a cambios en logs
  useEffect(() => {
    const unsubscribe = usbLogger.subscribe((newLogs) => {
      setLogs(newLogs);
      if (autoScroll && scrollViewRef.current) {
        // Auto-scroll al final
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    });

    return unsubscribe;
  }, [autoScroll]);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  const handleClearLogs = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t('diag.clear_logs_title'),
      t('diag.clear_logs_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('diag.clear'),
          style: 'destructive',
          onPress: () => {
            usbLogger.clear();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleExportLogs = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const textContent = usbLogger.exportAsText();
      const filename = `usb_logs_${Date.now()}.txt`;
      const filepath = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(filepath, textContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filepath, {
          mimeType: 'text/plain',
          dialogTitle: t('diag.share_logs'),
        });
      } else {
        Alert.alert(
          t('diag.logs_exported'),
          t('diag.logs_exported_message', { filename })
        );
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert('alerts.error', t('alerts.no_se_pudieron_exportar_logs', { error: error.message }));
    }
  };

  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case 'info':
        return 'text-blue-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
    }
  };

  const getLevelIcon = (level: LogLevel): string => {
    switch (level) {
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            {t('diag.title')}
          </Text>
          <Text className="text-sm text-muted">
            {t('diag.subtitle')}
          </Text>
        </View>

        {/* Controls */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={handleClearLogs}
            className="flex-1 bg-red-500/10 border border-red-500/30 rounded-xl p-3 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-red-400 text-center">
              🗑️ {t('diag.clear')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExportLogs}
            className="flex-1 bg-primary/10 border border-primary/30 rounded-xl p-3 active:opacity-80"
          >
            <Text className="text-sm font-semibold text-primary text-center">
              📤 {t('diag.export')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAutoScroll(!autoScroll);
            }}
            className={`flex-1 ${autoScroll ? 'bg-green-500/10 border-green-500/30' : 'bg-surface border-border'} border rounded-xl p-3 active:opacity-80`}
          >
            <Text className={`text-sm font-semibold ${autoScroll ? 'text-green-400' : 'text-muted'} text-center`}>
              {autoScroll ? `📜 ${t('diag.auto')}` : `⏸️ ${t('diag.manual')}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="flex-row gap-2 mb-4">
          {(['all', 'info', 'warning', 'error', 'success'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(level);
              }}
              className={`px-3 py-2 rounded-lg ${filter === level ? 'bg-primary' : 'bg-surface'} active:opacity-80`}
            >
              <Text className={`text-xs font-semibold ${filter === level ? 'text-background' : 'text-muted'}`}>
                {level === 'all' ? t('diag.all') : t(`diag.${level}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View className="bg-surface rounded-xl p-4 mb-4 border border-border">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-foreground">{logs.length}</Text>
              <Text className="text-xs text-muted">Total</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-red-400">
                {logs.filter(l => l.level === 'error').length}
              </Text>
              <Text className="text-xs text-muted">{t('diag.errors')}</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-yellow-400">
                {logs.filter(l => l.level === 'warning').length}
              </Text>
              <Text className="text-xs text-muted">{t('diag.warnings')}</Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl font-bold text-green-400">
                {logs.filter(l => l.level === 'success').length}
              </Text>
              <Text className="text-xs text-muted">{t('diag.successes')}</Text>
            </View>
          </View>
        </View>

        {/* Logs */}
        <View className="bg-surface rounded-xl p-4 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-3">
            📋 Logs ({filteredLogs.length})
          </Text>

          {filteredLogs.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-sm text-muted text-center">
                {filter === 'all' 
                  ? t('diag.no_logs_yet')
                  : t('diag.no_logs_of_type', { type: filter })
                }
              </Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={{ maxHeight: 400 }}
              showsVerticalScrollIndicator={true}
            >
              <View className="gap-2">
                {filteredLogs.map((log) => (
                  <View
                    key={log.id}
                    className="bg-background rounded-lg p-3 border border-border"
                  >
                    <View className="flex-row items-start gap-2">
                      <Text className="text-base">{getLevelIcon(log.level)}</Text>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text className={`text-xs font-bold ${getLevelColor(log.level)}`}>
                            {log.operation.toUpperCase()}
                          </Text>
                          <Text className="text-xs text-muted">
                            {new Date(log.timestamp).toLocaleTimeString('es-ES')}
                          </Text>
                        </View>
                        <Text className="text-sm text-foreground">{log.message}</Text>
                        {log.details && (
                          <Text className="text-xs text-muted mt-1 font-mono">
                            {typeof log.details === 'string' 
                              ? log.details 
                              : JSON.stringify(log.details, null, 2)
                            }
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
