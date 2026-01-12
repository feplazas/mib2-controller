import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  icon: string;
  title: string;
  description: string;
  details: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    icon: '🔌',
    title: 'Conectar Adaptador USB',
    description: 'Conecta tu adaptador USB-Ethernet al dispositivo Android usando un cable OTG con alimentación externa.',
    details: [
      'Usa un cable OTG con alimentación externa (5V)',
      'Conecta el adaptador USB-Ethernet al cable OTG',
      'Espera a que el LED del adaptador se encienda',
      'La app detectará automáticamente el dispositivo',
    ],
  },
  {
    id: 2,
    icon: '🔍',
    title: 'Verificar Compatibilidad',
    description: 'La app detectará automáticamente el chipset y mostrará si es compatible para spoofing MIB2.',
    details: [
      'Ve a la pestaña "Estado USB" para ver información del dispositivo',
      'Verifica el badge de compatibilidad:',
      '  ✅ Verde = Confirmado compatible',
      '  ⚠️ Amarillo = Experimental (probablemente funciona)',
      '  ❌ Rojo = Incompatible',
      'Solo chipsets ASIX permiten spoofing',
    ],
  },
  {
    id: 3,
    icon: '🚀',
    title: 'Ejecutar Spoofing',
    description: 'Usa Auto Spoof para modificar automáticamente el VID/PID del adaptador a valores compatibles con MIB2.',
    details: [
      'Ve a la pestaña "Auto Spoof"',
      'Presiona el botón "Ejecutar Spoofing Automático"',
      'La app creará un backup automático antes de modificar',
      'Espera a que termine el proceso (30-60 segundos)',
      'NO desconectes el adaptador durante el proceso',
    ],
  },
  {
    id: 4,
    icon: '✅',
    title: 'Verificar Resultado',
    description: 'Después del spoofing, verifica que el VID/PID se modificó correctamente y prueba la conexión con MIB2.',
    details: [
      'Verifica que el nuevo VID/PID sea 0x2001:0x3C05',
      'Desconecta y reconecta el adaptador',
      'Conecta el adaptador al puerto USB del MIB2',
      'Verifica que el MIB2 reconozca el adaptador',
      'Si falla, restaura desde backup en la pestaña "Backups"',
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
              {step.title}
            </Text>

            {/* Description */}
            <Text className="text-base text-muted text-center mb-6 leading-relaxed">
              {step.description}
            </Text>

            {/* Details */}
            <View className="bg-background rounded-2xl p-4 mb-6">
              {step.details.map((detail, index) => (
                <View key={index} className="flex-row gap-2 mb-2">
                  <Text className="text-primary">•</Text>
                  <Text className="text-sm text-foreground flex-1 leading-relaxed">
                    {detail}
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
                  {currentStep === ONBOARDING_STEPS.length - 1 ? '¡Comenzar!' : 'Siguiente'}
                </Text>
              </TouchableOpacity>

              <View className="flex-row gap-3">
                {currentStep > 0 && (
                  <TouchableOpacity
                    onPress={handlePrevious}
                    className="flex-1 bg-surface px-6 py-3 rounded-xl border border-border active:opacity-80"
                  >
                    <Text className="text-foreground font-medium text-center">
                      Anterior
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleSkip}
                  className="flex-1 px-6 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-muted font-medium text-center">
                    Saltar Tutorial
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
