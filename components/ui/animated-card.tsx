import { ReactNode } from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/use-colors";

interface AnimatedCardProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'highlight' | 'warning' | 'success' | 'error';
  icon?: string;
  iconColor?: string;
  className?: string;
  style?: any;
}

/**
 * AnimatedCard - F-Droid Style Premium Card
 * 
 * Tarjeta con bordes redondeados, animación de escala sutil al presionar,
 * y feedback háptico. Diseño inspirado en F-Droid.
 */
export function AnimatedCard({
  children,
  onPress,
  disabled = false,
  variant = 'default',
  icon,
  iconColor,
  className,
  style,
}: AnimatedCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getVariantStyles = () => {
    switch (variant) {
      case 'highlight':
        return {
          borderColor: colors.primary,
          borderWidth: 2,
        };
      case 'warning':
        return {
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.05)',
        };
      case 'success':
        return {
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.05)',
        };
      case 'error':
        return {
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
        };
      default:
        return {
          borderColor: colors.border,
        };
    }
  };

  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !!onPress)
    .onBegin(() => {
      'worklet';
      scale.value = withTiming(0.97, {
        duration: 80,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(0.9, {
        duration: 80,
      });
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(1, {
        duration: 150,
      });
    })
    .onEnd(() => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: variantStyles.borderColor,
            borderWidth: variantStyles.borderWidth || 1,
          },
          variantStyles.backgroundColor && { backgroundColor: variantStyles.backgroundColor },
          disabled && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
});
