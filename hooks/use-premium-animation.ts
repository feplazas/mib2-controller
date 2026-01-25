/**
 * Premium Animation Hooks - Ultra Smooth iOS-style Animations
 * 
 * Provides reusable animation hooks following Apple HIG guidelines
 * for subtle, meaningful animations.
 */

import { useCallback } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  interpolate,
  SharedValue,
} from "react-native-reanimated";

/**
 * iOS-style timing configurations
 */
export const IOSTimings = {
  // Quick interactions (button press)
  quick: {
    duration: 100,
    easing: Easing.out(Easing.ease),
  },
  // Standard transitions
  standard: {
    duration: 250,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  // Emphasized transitions
  emphasized: {
    duration: 350,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  },
  // Spring-like bounce
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
} as const;

/**
 * Hook for press feedback animation
 * Returns scale and opacity animations for button/card press states
 */
export function usePressAnimation(options?: {
  scalePressed?: number;
  opacityPressed?: number;
}) {
  const { scalePressed = 0.97, opacityPressed = 0.8 } = options || {};
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const onPressIn = useCallback(() => {
    scale.value = withTiming(scalePressed, IOSTimings.quick);
    opacity.value = withTiming(opacityPressed, IOSTimings.quick);
  }, [scalePressed, opacityPressed]);
  
  const onPressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.back(1.5)),
    });
    opacity.value = withTiming(1, IOSTimings.quick);
  }, []);
  
  return {
    animatedStyle,
    onPressIn,
    onPressOut,
    scale,
    opacity,
  };
}

/**
 * Hook for fade-in animation on mount
 */
export function useFadeIn(options?: {
  delay?: number;
  duration?: number;
}) {
  const { delay = 0, duration = 300 } = options || {};
  
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  
  const startAnimation = useCallback(() => {
    opacity.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration,
      easing: Easing.out(Easing.ease),
    });
  }, [duration]);
  
  return {
    animatedStyle,
    startAnimation,
    opacity,
    translateY,
  };
}

/**
 * Hook for pulse animation (loading states, attention)
 */
export function usePulse(options?: {
  minOpacity?: number;
  maxOpacity?: number;
  duration?: number;
}) {
  const { minOpacity = 0.4, maxOpacity = 1, duration = 1000 } = options || {};
  
  const opacity = useSharedValue(maxOpacity);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  const startPulse = useCallback(() => {
    opacity.value = withSequence(
      withTiming(minOpacity, { duration: duration / 2 }),
      withTiming(maxOpacity, { duration: duration / 2 })
    );
  }, [minOpacity, maxOpacity, duration]);
  
  return {
    animatedStyle,
    startPulse,
    opacity,
  };
}

/**
 * Hook for scale animation (icons, badges)
 */
export function useScaleAnimation() {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const bounce = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1, IOSTimings.spring)
    );
  }, []);
  
  const pop = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.8, { duration: 50 }),
      withSpring(1, IOSTimings.spring)
    );
  }, []);
  
  return {
    animatedStyle,
    bounce,
    pop,
    scale,
  };
}

/**
 * Hook for slide animation (sheets, modals)
 */
export function useSlideAnimation(options?: {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}) {
  const { direction = 'up', distance = 100 } = options || {};
  
  const progress = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => {
    const translateX = direction === 'left' 
      ? interpolate(progress.value, [0, 1], [-distance, 0])
      : direction === 'right'
      ? interpolate(progress.value, [0, 1], [distance, 0])
      : 0;
      
    const translateY = direction === 'up'
      ? interpolate(progress.value, [0, 1], [distance, 0])
      : direction === 'down'
      ? interpolate(progress.value, [0, 1], [-distance, 0])
      : 0;
    
    return {
      opacity: progress.value,
      transform: [{ translateX }, { translateY }],
    };
  });
  
  const slideIn = useCallback(() => {
    progress.value = withTiming(1, IOSTimings.emphasized);
  }, []);
  
  const slideOut = useCallback(() => {
    progress.value = withTiming(0, IOSTimings.standard);
  }, []);
  
  return {
    animatedStyle,
    slideIn,
    slideOut,
    progress,
  };
}

export default {
  usePressAnimation,
  useFadeIn,
  usePulse,
  useScaleAnimation,
  useSlideAnimation,
  IOSTimings,
};
