import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  interpolateColor,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedToggleProps {
  /** Estado actual del toggle */
  value: boolean;
  /** Callback cuando cambia el estado */
  onValueChange: (value: boolean) => void;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Tamaño del toggle */
  size?: 'small' | 'medium' | 'large';
  /** Color cuando está activo */
  activeColor?: string;
  /** Color cuando está inactivo */
  inactiveColor?: string;
  /** Color del thumb */
  thumbColor?: string;
  /** Habilitar haptics */
  hapticFeedback?: boolean;
}

const SIZES = {
  small: { width: 42, height: 26, thumbSize: 22, padding: 2 },
  medium: { width: 51, height: 31, thumbSize: 27, padding: 2 },
  large: { width: 60, height: 36, thumbSize: 32, padding: 2 },
};

/**
 * AnimatedToggle - Toggle/Switch con animaciones iOS-style premium
 * 
 * Características:
 * - Animación de spring suave para el thumb
 * - Transición de color fluida
 * - Efecto de escala al presionar
 * - Haptic feedback
 * - Sombra dinámica en el thumb
 */
export function AnimatedToggle({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  activeColor = '#34C759', // iOS green
  inactiveColor = 'rgba(120, 120, 128, 0.16)',
  thumbColor = '#FFFFFF',
  hapticFeedback = true,
}: AnimatedToggleProps) {
  const dimensions = SIZES[size];
  
  // Valores animados
  const progress = useSharedValue(value ? 1 : 0);
  const scale = useSharedValue(1);
  const thumbScale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  // Actualizar animación cuando cambia el valor
  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 180,
      mass: 0.8,
    });
  }, [value]);

  const handlePress = () => {
    if (disabled) return;

    // Haptic feedback
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onValueChange(!value);
  };

  const handlePressIn = () => {
    if (disabled) return;
    isPressed.value = true;
    
    // Escala del contenedor
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
    
    // Escala del thumb (se agranda ligeramente)
    thumbScale.value = withSpring(1.1, {
      damping: 12,
      stiffness: 250,
    });
  };

  const handlePressOut = () => {
    isPressed.value = false;
    
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
    
    thumbScale.value = withSpring(1, {
      damping: 12,
      stiffness: 250,
    });
  };

  // Estilo animado del contenedor
  const containerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
    );

    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.5 : 1,
    };
  });

  // Estilo animado del thumb
  const thumbStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 1],
      [dimensions.padding, dimensions.width - dimensions.thumbSize - dimensions.padding]
    );

    // Sombra más pronunciada cuando está activo
    const shadowOpacity = interpolate(progress.value, [0, 1], [0.1, 0.25]);
    const shadowRadius = interpolate(progress.value, [0, 1], [2, 4]);

    return {
      transform: [
        { translateX },
        { scale: thumbScale.value },
      ],
      shadowOpacity,
      shadowRadius,
    };
  });

  // Estilo del brillo interno (iOS-style)
  const innerGlowStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0, 0.15]);
    return { opacity };
  });

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: dimensions.height / 2,
          },
          containerStyle,
        ]}
      >
        {/* Brillo interno cuando está activo */}
        <Animated.View
          style={[
            styles.innerGlow,
            {
              borderRadius: dimensions.height / 2,
            },
            innerGlowStyle,
          ]}
        />

        {/* Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              width: dimensions.thumbSize,
              height: dimensions.thumbSize,
              borderRadius: dimensions.thumbSize / 2,
              backgroundColor: thumbColor,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

/**
 * AnimatedCheckbox - Checkbox con animación de checkmark
 */
export function AnimatedCheckbox({
  value,
  onValueChange,
  disabled = false,
  size = 24,
  activeColor = '#0a7ea4',
  inactiveColor = 'rgba(120, 120, 128, 0.16)',
  checkColor = '#FFFFFF',
  hapticFeedback = true,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  checkColor?: string;
  hapticFeedback?: boolean;
}) {
  const progress = useSharedValue(value ? 1 : 0);
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
    
    checkScale.value = withSpring(value ? 1 : 0, {
      damping: 10,
      stiffness: 250,
    });
  }, [value]);

  const handlePress = () => {
    if (disabled) return;

    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(
        value 
          ? Haptics.ImpactFeedbackStyle.Light 
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }

    onValueChange(!value);
  };

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const containerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
    );

    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(120, 120, 128, 0.3)', activeColor]
    );

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.5 : 1,
    };
  });

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size * 0.2,
          },
          containerStyle,
        ]}
      >
        <Animated.View style={checkStyle}>
          <View style={styles.checkmark}>
            <View
              style={[
                styles.checkmarkShort,
                { backgroundColor: checkColor },
              ]}
            />
            <View
              style={[
                styles.checkmarkLong,
                { backgroundColor: checkColor },
              ]}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/**
 * AnimatedRadio - Radio button con animación de selección
 */
export function AnimatedRadio({
  value,
  onValueChange,
  disabled = false,
  size = 22,
  activeColor = '#0a7ea4',
  inactiveColor = 'rgba(120, 120, 128, 0.3)',
  hapticFeedback = true,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  hapticFeedback?: boolean;
}) {
  const progress = useSharedValue(value ? 1 : 0);
  const scale = useSharedValue(1);
  const innerScale = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
    
    innerScale.value = withSpring(value ? 1 : 0, {
      damping: 8,
      stiffness: 300,
    });
  }, [value]);

  const handlePress = () => {
    if (disabled) return;

    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onValueChange(!value);
  };

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
    );

    return {
      borderColor,
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.5 : 1,
    };
  });

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
    opacity: innerScale.value,
  }));

  const innerSize = size * 0.5;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View
        style={[
          styles.radio,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          containerStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.radioInner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: activeColor,
            },
            innerStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  thumb: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  checkmark: {
    width: '60%',
    height: '60%',
    position: 'relative',
  },
  checkmarkShort: {
    position: 'absolute',
    width: 3,
    height: 8,
    borderRadius: 1.5,
    bottom: 2,
    left: 2,
    transform: [{ rotate: '-45deg' }],
  },
  checkmarkLong: {
    position: 'absolute',
    width: 3,
    height: 14,
    borderRadius: 1.5,
    bottom: 0,
    right: 2,
    transform: [{ rotate: '45deg' }],
  },
  radio: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  radioInner: {
    // Estilos dinámicos aplicados inline
  },
});
