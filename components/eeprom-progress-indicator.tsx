import { View, Text } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/lib/language-context';

interface EepromProgressIndicatorProps {
  progress: number; // 0-100
  bytesProcessed: number;
  totalBytes: number;
  operation: 'read' | 'write';
  estimatedTimeRemaining?: number; // segundos
}

export function EepromProgressIndicator({
  progress,
  bytesProcessed,
  totalBytes,
  operation,
  estimatedTimeRemaining,
}: EepromProgressIndicatorProps) {
  const colors = useColors();
  const t = useTranslation();
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(progress, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <View className="bg-surface rounded-xl p-4 border border-border">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl">
            {operation === 'read' ? '📖' : '✍️'}
          </Text>
          <Text className="text-base font-bold text-foreground">
            {operation === 'read' ? t('eeprom_progress.reading') : t('eeprom_progress.writing')}
          </Text>
        </View>
        <Text className="text-lg font-bold text-primary">
          {Math.round(progress)}%
        </Text>
      </View>

      {/* Barra de Progreso */}
      <View className="h-3 bg-muted/20 rounded-full overflow-hidden mb-3">
        <Animated.View
          style={[
            animatedStyle,
            {
              height: '100%',
              backgroundColor: colors.primary,
              borderRadius: 999,
            },
          ]}
        />
      </View>

      {/* Información Detallada */}
      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-sm text-muted">{t('eeprom_progress.bytes_processed')}:</Text>
          <Text className="text-sm text-foreground font-mono">
            {formatBytes(bytesProcessed)} / {formatBytes(totalBytes)}
          </Text>
        </View>

        {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">{t('eeprom_progress.time_remaining')}:</Text>
            <Text className="text-sm text-foreground font-mono">
              ~{formatTime(estimatedTimeRemaining)}
            </Text>
          </View>
        )}

        {progress >= 100 && (
          <View className="mt-2 bg-green-500/10 rounded-lg p-2">
            <Text className="text-sm text-green-500 font-semibold text-center">
              ✅ {operation === 'read' ? t('eeprom_progress.read_completed') : t('eeprom_progress.write_completed')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
