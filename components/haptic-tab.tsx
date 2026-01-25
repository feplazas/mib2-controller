/**
 * HapticTab - Ultra Premium Tab Button with Haptic Feedback
 * 
 * Provides refined haptic feedback when switching tabs.
 * Follows Apple HIG for subtle, meaningful feedback.
 * 
 * Features:
 * - Light haptic on press
 * - Selection haptic on successful navigation
 * - Silent fallback if haptics unavailable
 */

import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(PlatformPressable);

export function HapticTab(props: BottomTabBarButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const handlePressIn = (ev: any) => {
    // Subtle scale animation
    scale.value = withTiming(0.92, { 
      duration: 80, 
      easing: Easing.out(Easing.ease) 
    });
    opacity.value = withTiming(0.7, { 
      duration: 80, 
      easing: Easing.out(Easing.ease) 
    });
    
    // Light haptic feedback (mobile only)
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Silent fallback
      }
    }
    
    props.onPressIn?.(ev);
  };
  
  const handlePressOut = (ev: any) => {
    // Restore scale with spring-like timing
    scale.value = withTiming(1, { 
      duration: 150, 
      easing: Easing.out(Easing.back(1.5)) 
    });
    opacity.value = withTiming(1, { 
      duration: 150, 
      easing: Easing.out(Easing.ease) 
    });
    
    props.onPressOut?.(ev);
  };
  
  const handlePress = (ev: any) => {
    // Selection haptic on successful press
    if (Platform.OS !== "web") {
      try {
        Haptics.selectionAsync();
      } catch (error) {
        // Silent fallback
      }
    }
    
    props.onPress?.(ev);
  };

  return (
    <AnimatedPressable
      {...props}
      style={[props.style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    />
  );
}
