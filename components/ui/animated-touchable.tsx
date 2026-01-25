import { ReactNode } from "react";
import { Platform, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

interface AnimatedTouchableProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  className?: string;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';
  scaleAmount?: number;
}

/**
 * AnimatedTouchable - Animated TouchableOpacity Replacement
 * 
 * Reemplaza TouchableOpacity con animaciones de escala suaves
 * y feedback háptico configurable.
 */
export function AnimatedTouchable({
  children,
  onPress,
  disabled = false,
  style,
  className,
  hapticFeedback = 'light',
  scaleAmount = 0.97,
}: AnimatedTouchableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !!onPress)
    .onBegin(() => {
      'worklet';
      scale.value = withTiming(scaleAmount, {
        duration: 80,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(0.9, { duration: 80 });
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
      opacity.value = withTiming(1, { duration: 150 });
    })
    .onEnd(() => {
      if (Platform.OS !== 'web' && hapticFeedback !== 'none') {
        const feedbackStyle = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        }[hapticFeedback];
        Haptics.impactAsync(feedbackStyle);
      }
      if (onPress) onPress();
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[style, disabled && { opacity: 0.5 }, animatedStyle]}
        className={className}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
