import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/lib/language-context';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  detailKeys: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    icon: '🔌',
    titleKey: 'onboarding.step1_title',
    descriptionKey: 'onboarding.step1_desc',
    detailKeys: [
      'onboarding.step1_detail1',
      'onboarding.step1_detail2',
      'onboarding.step1_detail3',
      'onboarding.step1_detail4',
    ],
  },
  {
    id: 2,
    icon: '🔍',
    titleKey: 'onboarding.step2_title',
    descriptionKey: 'onboarding.step2_desc',
    detailKeys: [
      'onboarding.step2_detail1',
      'onboarding.step2_detail2',
      'onboarding.step2_detail3',
      'onboarding.step2_detail4',
      'onboarding.step2_detail5',
      'onboarding.step2_detail6',
    ],
  },
  {
    id: 3,
    icon: '🚀',
    titleKey: 'onboarding.step3_title',
    descriptionKey: 'onboarding.step3_desc',
    detailKeys: [
      'onboarding.step3_detail1',
      'onboarding.step3_detail2',
      'onboarding.step3_detail3',
      'onboarding.step3_detail4',
      'onboarding.step3_detail5',
    ],
  },
  {
    id: 4,
    icon: '✅',
    titleKey: 'onboarding.step4_title',
    descriptionKey: 'onboarding.step4_desc',
    detailKeys: [
      'onboarding.step4_detail1',
      'onboarding.step4_detail2',
      'onboarding.step4_detail3',
      'onboarding.step4_detail4',
      'onboarding.step4_detail5',
    ],
  },
];

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const colors = useColors();
  const t = useTranslation();

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-6">
        <Animated.View
          key={currentStep}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(300)}
          className="bg-surface rounded-3xl p-8 w-full max-w-md border border-border"
          style={{ maxHeight: '80%' }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Progress Indicator */}
            <View className="flex-row justify-center gap-2 mb-6">
              {ONBOARDING_STEPS.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-primary w-8'
                      : index < currentStep
                      ? 'bg-primary/50 w-2'
                      : 'bg-border w-2'
                  }`}
                />
              ))}
            </View>

            {/* Icon */}
            <Text className="text-6xl text-center mb-4">{step.icon}</Text>

            {/* Title */}
            <Text className="text-2xl font-bold text-foreground text-center mb-3">
              {t(step.titleKey)}
            </Text>

            {/* Description */}
            <Text className="text-base text-muted text-center mb-6 leading-relaxed">
              {t(step.descriptionKey)}
            </Text>

            {/* Details */}
            <View className="bg-background rounded-2xl p-4 mb-6">
              {step.detailKeys.map((detailKey, index) => (
                <View key={index} className="flex-row gap-2 mb-2">
                  <Text className="text-primary">•</Text>
                  <Text className="text-sm text-foreground flex-1 leading-relaxed">
                    {t(detailKey)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Navigation Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleNext}
                className="bg-primary px-6 py-4 rounded-xl active:opacity-80"
              >
                <Text className="text-background font-semibold text-center text-base">
                  {currentStep === ONBOARDING_STEPS.length - 1 ? t('onboarding.start') : t('onboarding.next')}
                </Text>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                {currentStep > 0 && (
                  <TouchableOpacity
                    onPress={handlePrevious}
                    className="flex-1 bg-surface px-6 py-3 rounded-xl border border-border active:opacity-80"
                  >
                    <Text className="text-foreground font-medium text-center">
                      {t('onboarding.previous')}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleSkip}
                  className="flex-1 px-6 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-muted font-medium text-center">
                    {t('onboarding.skip')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
