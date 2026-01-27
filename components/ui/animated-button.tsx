import { ReactNode } from "react";
import { Text, Platform, StyleSheet, ViewStyle, TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/use-colors";

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps {
  children?: ReactNode;
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * AnimatedButton - F-Droid Style Premium Button
 * 
 * Botón con animación de escala sutil, feedback háptico,
 * y múltiples variantes de estilo.
 */
export function AnimatedButton({
  children,
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth = false,
  style,
  textStyle,
}: AnimatedButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primary, text: colors.background };
      case 'secondary':
        return { bg: colors.surface, text: colors.foreground, border: colors.border };
      case 'outline':
        return { bg: 'transparent', text: colors.primary, border: colors.primary };
      case 'ghost':
        return { bg: 'transparent', text: colors.foreground };
      case 'danger':
        return { bg: '#EF4444', text: '#FFFFFF' };
      case 'success':
        return { bg: '#22C55E', text: '#FFFFFF' };
      case 'warning':
        return { bg: '#F59E0B', text: '#FFFFFF' };
      default:
        return { bg: colors.primary, text: colors.background };
    }
  };

  const getSizeStyles = (): { paddingH: number; paddingV: number; fontSize: number; iconSize: number } => {
    switch (size) {
      case 'sm':
        return { paddingH: 12, paddingV: 8, fontSize: 14, iconSize: 16 };
      case 'lg':
        return { paddingH: 24, paddingV: 16, fontSize: 18, iconSize: 24 };
      default:
        return { paddingH: 16, paddingV: 12, fontSize: 16, iconSize: 20 };
    }
  };

  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !loading && !!onPress)
    .onBegin(() => {
      'worklet';
      scale.value = withTiming(0.96, {
        duration: 60,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(0.85, {
        duration: 60,
      });
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withTiming(1, {
        duration: 120,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(1, {
        duration: 120,
      });
    })
    .onEnd(() => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      if (onPress) {
        onPress();
      }
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: variantStyles.bg,
            borderColor: variantStyles.border || 'transparent',
            borderWidth: variantStyles.border ? 1.5 : 0,
            paddingHorizontal: sizeStyles.paddingH,
            paddingVertical: sizeStyles.paddingV,
          },
          fullWidth && styles.fullWidth,
          (disabled || loading) && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        {icon && (
          <Text style={[styles.icon, { fontSize: sizeStyles.iconSize }]}>
            {icon}
          </Text>
        )}
        {loading ? (
          <Text style={[styles.text, { color: variantStyles.text, fontSize: sizeStyles.fontSize }]}>
            ...
          </Text>
        ) : children ? (
          children
        ) : title ? (
          <Text
            style={[
              styles.text,
              { color: variantStyles.text, fontSize: sizeStyles.fontSize },
              textStyle,
            ]}
          >
            {title}
          </Text>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    gap: 8,
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  icon: {
    marginRight: 4,
    flexShrink: 0,
  },
});
