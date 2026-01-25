import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedScreenTransitionProps {
  children: React.ReactNode;
  /** Tipo de animación de entrada */
  type?: 'fade' | 'slide-up' | 'slide-right' | 'scale' | 'fade-scale';
  /** Duración de la animación en ms */
  duration?: number;
  /** Retraso antes de iniciar la animación */
  delay?: number;
  /** Estilo adicional del contenedor */
  style?: ViewStyle;
}

/**
 * AnimatedScreenTransition - Wrapper para transiciones suaves de pantalla
 * 
 * Envuelve el contenido de una pantalla para aplicar animaciones
 * de entrada suaves estilo iOS.
 */
export function AnimatedScreenTransition({
  children,
  type = 'fade-scale',
  duration = 350,
  delay = 0,
  style,
}: AnimatedScreenTransitionProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      progress.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case 'fade':
        return {
          opacity: progress.value,
        };

      case 'slide-up':
        return {
          opacity: progress.value,
          transform: [
            {
              translateY: interpolate(progress.value, [0, 1], [30, 0]),
            },
          ],
        };

      case 'slide-right':
        return {
          opacity: progress.value,
          transform: [
            {
              translateX: interpolate(progress.value, [0, 1], [-30, 0]),
            },
          ],
        };

      case 'scale':
        return {
          opacity: progress.value,
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [0.95, 1]),
            },
          ],
        };

      case 'fade-scale':
      default:
        return {
          opacity: progress.value,
          transform: [
            {
              scale: interpolate(progress.value, [0, 1], [0.97, 1]),
            },
            {
              translateY: interpolate(progress.value, [0, 1], [10, 0]),
            },
          ],
        };
    }
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * AnimatedListItem - Animación escalonada para items de lista
 * 
 * Cada item aparece con un pequeño retraso respecto al anterior.
 */
export function AnimatedListItem({
  children,
  index,
  baseDelay = 50,
  duration = 300,
  style,
}: {
  children: React.ReactNode;
  index: number;
  baseDelay?: number;
  duration?: number;
  style?: ViewStyle;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const delay = index * baseDelay;
    const timeout = setTimeout(() => {
      progress.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [20, 0]),
      },
      {
        scale: interpolate(progress.value, [0, 1], [0.95, 1]),
      },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * AnimatedCard - Animación de entrada para tarjetas
 */
export function AnimatedCard({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      progress.value = withSpring(1, {
        damping: 12,
        stiffness: 120,
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [0.92, 1]),
      },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
