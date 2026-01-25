import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  interpolate,
  cancelAnimation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/use-colors';

interface AnimatedRefreshControlProps {
  refreshing: boolean;
  pullProgress?: number; // 0-1 value representing pull distance
}

/**
 * Animated refresh indicator with iOS-style premium animation
 * Uses react-native-reanimated for smooth 60fps animations
 */
export function AnimatedRefreshControl({ 
  refreshing, 
  pullProgress = 0 
}: AnimatedRefreshControlProps) {
  const colors = useColors();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  
  // Dots animation
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);

  useEffect(() => {
    if (refreshing) {
      // Start spinning animation
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1, // infinite
        false
      );
      
      // Scale up
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });
      
      // Dots pulsing animation
      dot1Scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1,
        true
      );
      
      setTimeout(() => {
        dot2Scale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 300 }),
            withTiming(1, { duration: 300 })
          ),
          -1,
          true
        );
      }, 100);
      
      setTimeout(() => {
        dot3Scale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 300 }),
            withTiming(1, { duration: 300 })
          ),
          -1,
          true
        );
      }, 200);
      
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      // Stop animations
      cancelAnimation(rotation);
      cancelAnimation(dot1Scale);
      cancelAnimation(dot2Scale);
      cancelAnimation(dot3Scale);
      
      rotation.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      
      dot1Scale.value = withTiming(1, { duration: 200 });
      dot2Scale.value = withTiming(1, { duration: 200 });
      dot3Scale.value = withTiming(1, { duration: 200 });
    }
  }, [refreshing]);

  // Update based on pull progress when not refreshing
  useEffect(() => {
    if (!refreshing && pullProgress > 0) {
      opacity.value = withTiming(interpolate(pullProgress, [0, 0.5, 1], [0, 0.5, 1]), { duration: 100 });
      scale.value = withTiming(interpolate(pullProgress, [0, 1], [0.5, 1]), { duration: 100 });
      rotation.value = withTiming(pullProgress * 180, { duration: 100 });
    }
  }, [pullProgress, refreshing]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Circular spinner */}
      <Animated.View style={[styles.spinnerContainer, spinnerStyle]}>
        <View style={[styles.spinnerArc, { borderColor: colors.primary }]} />
        <View style={[styles.spinnerArcFaded, { borderColor: colors.primary }]} />
      </Animated.View>
      
      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, dot1Style, { backgroundColor: colors.primary }]} />
        <Animated.View style={[styles.dot, dot2Style, { backgroundColor: colors.primary }]} />
        <Animated.View style={[styles.dot, dot3Style, { backgroundColor: colors.primary }]} />
      </View>
    </Animated.View>
  );
}

/**
 * Custom RefreshControl wrapper that uses AnimatedRefreshControl
 */
export function useAnimatedRefresh(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [onRefresh]);

  return { refreshing, onRefresh: handleRefresh };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  spinnerContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerArc: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  spinnerArcFaded: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    opacity: 0.2,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default AnimatedRefreshControl;
