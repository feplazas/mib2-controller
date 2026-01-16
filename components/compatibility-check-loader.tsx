import { View, Text } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTranslation } from '@/lib/language-context';

interface CompatibilityCheckLoaderProps {
  visible: boolean;
  chipset?: string;
}

/**
 * Componente de animación de carga para verificación de compatibilidad
 * Muestra un indicador animado mientras se verifica el chipset y perfil VID/PID
 */
export function CompatibilityCheckLoader({ visible, chipset }: CompatibilityCheckLoaderProps) {
  const t = useTranslation();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Animación de escala pulsante
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Animación de rotación
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );

      // Fade in
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      // Fade out
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = 1;
      rotation.value = 0;
    }
  }, [visible, scale, opacity, rotation]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[animatedContainerStyle]}
      className="bg-primary/10 rounded-2xl p-6 border-2 border-primary/30"
    >
      <View className="items-center gap-3">
        {/* Icono animado */}
        <Animated.View style={[animatedIconStyle]}>
          <Text className="text-5xl">🔍</Text>
        </Animated.View>

        {/* Texto de carga */}
        <View className="items-center gap-1">
          <Text className="text-lg font-bold text-foreground">
            {t('usb.checking_compatibility')}
          </Text>
          {chipset && (
            <Text className="text-sm text-muted text-center">
              {t('usb.analyzing_chipset')}: {chipset}
            </Text>
          )}
        </View>

        {/* Puntos animados */}
        <View className="flex-row gap-2">
          <AnimatedDot delay={0} />
          <AnimatedDot delay={200} />
          <AnimatedDot delay={400} />
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Componente de punto animado para indicador de carga
 */
function AnimatedDot({ delay }: { delay: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Esperar delay inicial antes de comenzar animación
    setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }, delay);
  }, [scale, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[animatedStyle]}
      className="w-2 h-2 rounded-full bg-primary"
    />
  );
}
