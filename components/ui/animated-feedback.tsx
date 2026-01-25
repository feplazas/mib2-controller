import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface AnimatedFeedbackProps {
  /** Tipo de feedback */
  type: 'success' | 'error' | 'warning' | 'info';
  /** Si está visible */
  visible: boolean;
  /** Callback cuando se completa la animación */
  onComplete?: () => void;
  /** Tamaño del icono */
  size?: number;
  /** Mensaje opcional */
  message?: string;
  /** Auto-ocultar después de un tiempo */
  autoHide?: boolean;
  /** Tiempo antes de auto-ocultar */
  autoHideDelay?: number;
  /** Estilo inline (no modal) */
  inline?: boolean;
}

const FEEDBACK_CONFIG = {
  success: {
    icon: '✓',
    color: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    haptic: Haptics.NotificationFeedbackType.Success,
  },
  error: {
    icon: '✕',
    color: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    haptic: Haptics.NotificationFeedbackType.Error,
  },
  warning: {
    icon: '!',
    color: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    haptic: Haptics.NotificationFeedbackType.Warning,
  },
  info: {
    icon: 'i',
    color: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    haptic: Haptics.NotificationFeedbackType.Success,
  },
};

/**
 * AnimatedFeedback - Feedback visual inline con animación
 * 
 * Muestra un icono animado de éxito/error/warning/info
 * directamente en el flujo del contenido (no modal).
 */
export function AnimatedFeedback({
  type,
  visible,
  onComplete,
  size = 48,
  message,
  autoHide = true,
  autoHideDelay = 2000,
  inline = true,
}: AnimatedFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);
  const config = FEEDBACK_CONFIG[type];

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);

      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(config.haptic);
      }

      // Animación de entrada
      opacity.value = withTiming(1, { duration: 200 });

      // Contenedor
      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );

      // Anillo
      ringScale.value = withSequence(
        withSpring(1.2, { damping: 6, stiffness: 250 }),
        withSpring(1, { damping: 12, stiffness: 180 })
      );

      // Icono con bounce
      iconScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.3, { damping: 5, stiffness: 350 }),
          withSpring(1, { damping: 10, stiffness: 200 })
        )
      );

      // Shake para error
      if (type === 'error') {
        shake.value = withDelay(
          400,
          withSequence(
            withTiming(-6, { duration: 40 }),
            withTiming(6, { duration: 40 }),
            withTiming(-6, { duration: 40 }),
            withTiming(6, { duration: 40 }),
            withTiming(0, { duration: 40 })
          )
        );
      }

      // Mensaje
      if (message) {
        messageOpacity.value = withDelay(
          350,
          withTiming(1, { duration: 250 })
        );
      }

      // Auto-hide
      if (autoHide) {
        setTimeout(() => {
          hideAnimation();
        }, autoHideDelay);
      }
    } else {
      // Reset cuando se oculta externamente
      if (isVisible) {
        hideAnimation();
      }
    }
  }, [visible, type]);

  const hideAnimation = () => {
    opacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(handleComplete)();
      }
    });
    scale.value = withTiming(0.8, { duration: 250 });
    messageOpacity.value = withTiming(0, { duration: 150 });
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Reset valores
    scale.value = 0;
    iconScale.value = 0;
    ringScale.value = 0;
    messageOpacity.value = 0;
    shake.value = 0;
    onComplete?.();
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateX: shake.value },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: interpolate(ringScale.value, [0, 0.5, 1], [0, 0.8, 1]),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconScale.value,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [
      {
        translateY: interpolate(messageOpacity.value, [0, 1], [8, 0]),
      },
    ],
  }));

  if (!isVisible) return null;

  const iconSize = size * 0.5;

  return (
    <Animated.View style={[styles.container, containerStyle, inline && styles.inline]}>
      <View
        style={[
          styles.iconContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: config.backgroundColor,
          },
        ]}
      >
        {/* Anillo exterior */}
        <Animated.View
          style={[
            styles.ring,
            {
              width: size - 8,
              height: size - 8,
              borderRadius: (size - 8) / 2,
              borderColor: config.color,
            },
            ringStyle,
          ]}
        />

        {/* Icono */}
        <Animated.View style={[styles.iconWrapper, iconStyle]}>
          <Text
            style={[
              styles.icon,
              {
                fontSize: iconSize,
                color: config.color,
              },
            ]}
          >
            {config.icon}
          </Text>
        </Animated.View>
      </View>

      {message && (
        <Animated.Text
          style={[
            styles.message,
            { color: config.color },
            messageStyle,
          ]}
        >
          {message}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

/**
 * AnimatedSuccessInline - Checkmark de éxito inline
 */
export function AnimatedSuccessInline({
  visible,
  size = 24,
  onComplete,
}: {
  visible: boolean;
  size?: number;
  onComplete?: () => void;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      opacity.value = withTiming(1, { duration: 150 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      // Auto-hide después de 1.5s
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        });
        scale.value = withTiming(0.8, { duration: 200 });
      }, 1500);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.inlineIcon, animatedStyle]}>
      <Text style={[styles.successIcon, { fontSize: size }]}>✓</Text>
    </Animated.View>
  );
}

/**
 * AnimatedErrorInline - X de error inline
 */
export function AnimatedErrorInline({
  visible,
  size = 24,
  onComplete,
}: {
  visible: boolean;
  size?: number;
  onComplete?: () => void;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      opacity.value = withTiming(1, { duration: 150 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      // Shake
      shake.value = withDelay(
        200,
        withSequence(
          withTiming(-4, { duration: 30 }),
          withTiming(4, { duration: 30 }),
          withTiming(-4, { duration: 30 }),
          withTiming(0, { duration: 30 })
        )
      );

      // Auto-hide
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        });
        scale.value = withTiming(0.8, { duration: 200 });
      }, 1500);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateX: shake.value },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.inlineIcon, animatedStyle]}>
      <Text style={[styles.errorIcon, { fontSize: size }]}>✕</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    marginVertical: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontWeight: '700',
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inlineIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    color: '#22C55E',
    fontWeight: '700',
  },
  errorIcon: {
    color: '#EF4444',
    fontWeight: '700',
  },
});
