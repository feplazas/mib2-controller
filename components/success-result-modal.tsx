import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/lib/language-context';
import * as Haptics from 'expo-haptics';

interface SpoofingResult {
  originalVID: string;
  originalPID: string;
  newVID: string;
  newPID: string;
  chipset: string;
  deviceName: string;
  timestamp: Date;
}

interface SuccessResultModalProps {
  visible: boolean;
  result: SpoofingResult | null;
  onClose: () => void;
  onShare: () => void;
}

export function SuccessResultModal({
  visible,
  result,
  onClose,
  onShare,
}: SuccessResultModalProps) {
  const colors = useColors();
  const t = useTranslation();

  if (!result) return null;

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onShare();
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <Animated.View
          entering={ZoomIn.duration(400)}
          className="bg-surface rounded-3xl p-8 w-full max-w-md border border-border"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Success Icon */}
            <Animated.View
              entering={FadeIn.delay(200).duration(400)}
              className="items-center mb-6"
            >
              <View className="bg-green-500/20 rounded-full p-6 mb-4">
                <Text className="text-6xl">✅</Text>
              </View>
              <Text className="text-2xl font-bold text-foreground text-center">
                {t('success.spoofing_success')}
              </Text>
              <Text className="text-base text-muted text-center mt-2">
                {t('success.vid_pid_modified')}
              </Text>
            </Animated.View>

            {/* Device Info */}
            <View className="bg-background rounded-2xl p-4 mb-6">
              <Text className="text-sm font-semibold text-foreground mb-3">
                {t('success.device_info')}
              </Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('success.device')}:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {result.deviceName}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('success.chipset')}:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {result.chipset}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('success.date')}:</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {result.timestamp.toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Before/After Comparison */}
            <View className="gap-4 mb-6">
              {/* Before */}
              <View className="bg-red-900/20 rounded-2xl p-4 border border-red-700">
                <Text className="text-sm font-semibold text-red-400 mb-3">
                  {t('success.before_original')}
                </Text>
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-red-300">VID:</Text>
                    <Text className="text-sm text-red-200 font-mono font-bold">
                      {result.originalVID}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-red-300">PID:</Text>
                    <Text className="text-sm text-red-200 font-mono font-bold">
                      {result.originalPID}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Arrow */}
              <View className="items-center">
                <Text className="text-3xl text-primary">⬇️</Text>
              </View>

              {/* After */}
              <View className="bg-green-900/20 rounded-2xl p-4 border border-green-700">
                <Text className="text-sm font-semibold text-green-400 mb-3">
                  {t('success.after_modified')}
                </Text>
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-green-300">VID:</Text>
                    <Text className="text-sm text-green-200 font-mono font-bold">
                      {result.newVID}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-green-300">PID:</Text>
                    <Text className="text-sm text-green-200 font-mono font-bold">
                      {result.newPID}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Next Steps */}
            <View className="bg-yellow-900/20 rounded-2xl p-4 border border-yellow-700 mb-6">
              <Text className="text-sm font-semibold text-yellow-400 mb-2">
                {t('success.next_steps')}
              </Text>
              <View className="gap-1">
                <Text className="text-sm text-yellow-300">
                  {t('success.step1')}
                </Text>
                <Text className="text-sm text-yellow-300">
                  {t('success.step2')}
                </Text>
                <Text className="text-sm text-yellow-300">
                  {t('success.step3')}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleShare}
                className="bg-primary px-6 py-4 rounded-xl active:opacity-80"
              >
                <Text className="text-background font-semibold text-center text-base">
                  📤 Compartir Resultado
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                className="bg-surface px-6 py-3 rounded-xl border border-border active:opacity-80"
              >
                <Text className="text-foreground font-medium text-center">
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
