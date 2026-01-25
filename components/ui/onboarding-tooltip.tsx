import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/use-colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TooltipPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface OnboardingTooltipProps {
  id: string; // Unique ID to track if user has seen this tooltip
  title: string;
  description: string;
  position: TooltipPosition;
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right';
  arrowOffset?: number; // Offset from center in pixels
  onDismiss?: () => void;
  delay?: number; // Delay before showing in ms
  showOnce?: boolean; // If true, only show once per user
  children?: React.ReactNode;
}

const STORAGE_KEY = '@onboarding_tooltips_seen';

/**
 * Animated onboarding tooltip with iOS-style design
 * Shows helpful hints for first-time users
 */
export function OnboardingTooltip({
  id,
  title,
  description,
  position,
  arrowPosition = 'top',
  arrowOffset = 0,
  onDismiss,
  delay = 500,
  showOnce = true,
  children,
}: OnboardingTooltipProps) {
  const colors = useColors();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(true); // Default to true to prevent flash
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(arrowPosition === 'top' ? -10 : 10);
  const pulseScale = useSharedValue(1);

  // Check if tooltip has been seen before
  useEffect(() => {
    const checkSeen = async () => {
      try {
        const seenTooltips = await AsyncStorage.getItem(STORAGE_KEY);
        const seen = seenTooltips ? JSON.parse(seenTooltips) : [];
        if (!seen.includes(id)) {
          setHasBeenSeen(false);
        }
      } catch (error) {
        setHasBeenSeen(false);
      }
    };
    
    if (showOnce) {
      checkSeen();
    } else {
      setHasBeenSeen(false);
    }
  }, [id, showOnce]);

  // Show tooltip with animation
  useEffect(() => {
    if (hasBeenSeen) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Entrance animation
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      
      // Subtle pulse animation
      pulseScale.value = withDelay(
        500,
        withSequence(
          withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        )
      );
      
      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [hasBeenSeen, delay]);

  const handleDismiss = async () => {
    // Exit animation
    opacity.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(0.8, { duration: 200 });
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Mark as seen
    if (showOnce) {
      try {
        const seenTooltips = await AsyncStorage.getItem(STORAGE_KEY);
        const seen = seenTooltips ? JSON.parse(seenTooltips) : [];
        if (!seen.includes(id)) {
          seen.push(id);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
        }
      } catch (error) {
        console.error('Error saving tooltip state:', error);
      }
    }
    
    setTimeout(() => {
      setIsVisible(false);
      setHasBeenSeen(true);
      onDismiss?.();
    }, 200);
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value * pulseScale.value },
      { translateY: translateY.value },
    ],
  }));

  // Calculate arrow styles based on position
  const getArrowStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid' as const,
    };

    switch (arrowPosition) {
      case 'top':
        return {
          ...baseStyle,
          top: -8,
          left: '50%' as const,
          marginLeft: -8 + arrowOffset,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderBottomWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'rgba(30, 32, 34, 0.95)',
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: -8,
          left: '50%' as const,
          marginLeft: -8 + arrowOffset,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderTopWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: 'rgba(30, 32, 34, 0.95)',
        };
      case 'left':
        return {
          ...baseStyle,
          left: -8,
          top: '50%' as const,
          marginTop: -8 + arrowOffset,
          borderTopWidth: 8,
          borderBottomWidth: 8,
          borderRightWidth: 8,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: 'rgba(30, 32, 34, 0.95)',
        };
      case 'right':
        return {
          ...baseStyle,
          right: -8,
          top: '50%' as const,
          marginTop: -8 + arrowOffset,
          borderTopWidth: 8,
          borderBottomWidth: 8,
          borderLeftWidth: 8,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'rgba(30, 32, 34, 0.95)',
        };
      default:
        return baseStyle;
    }
  };

  if (hasBeenSeen || !isVisible) {
    return children ? <>{children}</> : null;
  }

  return (
    <>
      {children}
      <Animated.View style={[styles.container, position, containerStyle]}>
        {/* Arrow */}
        <View style={getArrowStyle() as any} />
        
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={handleDismiss} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.description}>{description}</Text>
          
          {/* Got it button */}
          <Pressable 
            onPress={handleDismiss} 
            style={({ pressed }) => [
              styles.gotItButton,
              pressed && styles.gotItButtonPressed
            ]}
          >
            <Text style={styles.gotItText}>Entendido</Text>
          </Pressable>
        </View>
        
        {/* Glow effect */}
        <View style={styles.glowEffect} />
      </Animated.View>
    </>
  );
}

/**
 * Hook to manage onboarding state
 */
export function useOnboarding() {
  const [seenTooltips, setSeenTooltips] = useState<string[]>([]);

  useEffect(() => {
    const loadSeen = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSeenTooltips(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error);
      }
    };
    loadSeen();
  }, []);

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSeenTooltips([]);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const hasSeenTooltip = (id: string) => seenTooltips.includes(id);

  return { seenTooltips, resetOnboarding, hasSeenTooltip };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 50, // Reducido para no superponerse a modales (que usan zIndex > 100)
    maxWidth: SCREEN_WIDTH - 32,
    minWidth: 200,
  },
  content: {
    backgroundColor: 'rgba(30, 32, 34, 0.95)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(10, 126, 164, 0.3)',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a7ea4',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
    marginTop: -4,
    marginRight: -4,
  },
  closeText: {
    fontSize: 16,
    color: '#9BA1A6',
  },
  description: {
    fontSize: 14,
    color: '#ECEDEE',
    lineHeight: 20,
    marginBottom: 12,
  },
  gotItButton: {
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  gotItButtonPressed: {
    backgroundColor: 'rgba(10, 126, 164, 0.4)',
  },
  gotItText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: 'rgba(10, 126, 164, 0.05)',
    borderRadius: 32,
    zIndex: -1,
  },
});

export default OnboardingTooltip;
