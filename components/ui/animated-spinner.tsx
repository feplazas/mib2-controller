import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface AnimatedSpinnerProps {
  /** Tamaño del spinner en píxeles */
  size?: number;
  /** Color del spinner */
  color?: string;
  /** Grosor del borde */
  strokeWidth?: number;
  /** Velocidad de rotación en ms */
  duration?: number;
}

/**
 * AnimatedSpinner - Spinner de carga animado estilo iOS
 * 
 * Spinner circular con animación de rotación suave
 * para usar dentro de botones durante operaciones largas.
 */
export function AnimatedSpinner({
  size = 20,
  color = '#FFFFFF',
  strokeWidth = 2,
  duration = 1000,
}: AnimatedSpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration,
        easing: Easing.linear,
      }),
      -1, // Repetir infinitamente
      false // No reversar
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
      <View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: `${color}30`,
            borderTopColor: color,
          },
        ]}
      />
    </Animated.View>
  );
}

/**
 * AnimatedDotsSpinner - Spinner de puntos animados
 * 
 * Tres puntos que pulsan secuencialmente para indicar carga.
 */
export function AnimatedDotsSpinner({
  size = 6,
  color = '#FFFFFF',
  gap = 4,
}: {
  size?: number;
  color?: string;
  gap?: number;
}) {
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);

  useEffect(() => {
    const animateDot = (dotScale: { value: number }, delay: number) => {
      dotScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: delay, easing: Easing.linear }),
          withTiming(1.4, { duration: 200, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 200, easing: Easing.in(Easing.quad) }),
          withTiming(1, { duration: 400, easing: Easing.linear })
        ),
        -1,
        false
      );
    };

    animateDot(dot1Scale, 0);
    animateDot(dot2Scale, 200);
    animateDot(dot3Scale, 400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
    opacity: 0.4 + (dot1Scale.value - 1) * 1.5,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
    opacity: 0.4 + (dot2Scale.value - 1) * 1.5,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
    opacity: 0.4 + (dot3Scale.value - 1) * 1.5,
  }));

  return (
    <View style={[styles.dotsContainer, { gap }]}>
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          dot3Style,
        ]}
      />
    </View>
  );
}

/**
 * AnimatedPulseSpinner - Spinner con efecto de pulso
 * 
 * Círculo que pulsa con efecto de onda expansiva.
 */
export function AnimatedPulseSpinner({
  size = 24,
  color = '#FFFFFF',
}: {
  size?: number;
  color?: string;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Pulso del círculo central
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 500, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );

    // Onda expansiva
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(1.8, { duration: 1000, easing: Easing.out(Easing.quad) })
      ),
      -1,
      false
    );

    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 0 }),
        withTiming(0, { duration: 1000, easing: Easing.out(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const innerSize = size * 0.5;

  return (
    <View style={[styles.pulseContainer, { width: size, height: size }]}>
      {/* Onda expansiva */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            borderColor: color,
          },
          ringStyle,
        ]}
      />
      {/* Círculo central */}
      <Animated.View
        style={[
          styles.pulseCenter,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: color,
          },
          centerStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderStyle: 'solid',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
  pulseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  pulseCenter: {},
});
