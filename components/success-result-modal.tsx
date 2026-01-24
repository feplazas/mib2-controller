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
      <View className="flex-1 bg-black/70 justify-center items-center px-5">
        <Animated.View
          entering={ZoomIn.duration(300)}
          className="bg-surface rounded-3xl p-6 w-full max-w-sm"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Success Icon - iOS style */}
            <Animated.View
              entering={FadeIn.delay(150).duration(300)}
              className="items-center mb-5"
            >
              <View className="bg-success/15 rounded-full p-5 mb-3">
                <Text className="text-5xl">✅</Text>
              </View>
              <Text className="text-xl font-bold text-foreground text-center">
                {t('success.spoofing_success')}
              </Text>
              <Text className="text-sm text-muted text-center mt-1">
                {t('success.vid_pid_modified')}
              </Text>
            </Animated.View>

            {/* Device Info - Clean card */}
            <View className="bg-background rounded-xl p-4 mb-4">
              <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                {t('success.device_info')}
              </Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('success.device')}</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {result.deviceName}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('success.chipset')}</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {result.chipset}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">{t('success.date')}</Text>
                  <Text className="text-sm text-foreground font-medium">
                    {result.timestamp.toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}, {result.timestamp.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Before/After Comparison - Simplified */}
            <View className="gap-3 mb-4">
              {/* Before */}
              <View className="bg-error/10 rounded-xl p-4">
                <Text className="text-xs font-semibold text-error uppercase tracking-wide mb-2">
                  {t('success.before_original')}
                </Text>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">VID</Text>
                  <Text className="text-sm text-foreground font-mono font-semibold">
                    {result.originalVID}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-sm text-muted">PID</Text>
                  <Text className="text-sm text-foreground font-mono font-semibold">
                    {result.originalPID}
                  </Text>
                </View>
              </View>

              {/* Arrow */}
              <View className="items-center">
                <Text className="text-2xl">⬇️</Text>
              </View>

              {/* After */}
              <View className="bg-success/10 rounded-xl p-4">
                <Text className="text-xs font-semibold text-success uppercase tracking-wide mb-2">
                  {t('success.after_modified')}
                </Text>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">VID</Text>
                  <Text className="text-sm text-foreground font-mono font-semibold">
                    {result.newVID}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-sm text-muted">PID</Text>
                  <Text className="text-sm text-foreground font-mono font-semibold">
                    {result.newPID}
                  </Text>
                </View>
              </View>
            </View>

            {/* Next Steps - Subtle warning style */}
            <View className="bg-warning/10 rounded-xl p-4 mb-5">
              <Text className="text-xs font-semibold text-warning uppercase tracking-wide mb-2">
                {t('success.next_steps')}
              </Text>
              <View className="gap-1">
                <Text className="text-sm text-foreground">
                  {t('success.step1')}
                </Text>
                <Text className="text-sm text-foreground">
                  {t('success.step2')}
                </Text>
                <Text className="text-sm text-foreground">
                  {t('success.step3')}
                </Text>
              </View>
            </View>

            {/* Action Buttons - iOS style */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleShare}
                className="bg-primary py-4 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold text-center text-base">
                  📤 {t('success.share_result')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                className="py-3 rounded-xl active:opacity-60"
              >
                <Text className="text-primary font-medium text-center text-base">
                  {t('success.close')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
