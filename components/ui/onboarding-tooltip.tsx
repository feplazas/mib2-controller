import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform, LayoutChangeEvent } from 'react-native';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Márgenes de seguridad para evitar cortes en bordes
const SAFE_MARGIN = 16;
const AUTO_DISMISS_TIMEOUT = 6000; // 6 segundos

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
  autoDismiss?: boolean; // If true, auto-dismiss after timeout
  autoDismissTimeout?: number; // Custom timeout in ms
}

const STORAGE_KEY = '@onboarding_tooltips_seen';

// Context para detectar si hay un modal abierto
interface ModalContextType {
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType>({
  isModalOpen: false,
  setModalOpen: () => {},
});

/**
 * Provider para gestionar el estado de modales abiertos
 * Envuelve la app para que los tooltips sepan cuándo ocultarse
 */
export function ModalStateProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setModalOpen] = useState(false);
  
  return (
    <ModalContext.Provider value={{ isModalOpen, setModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

/**
 * Hook para notificar cuando un modal se abre/cierra
 */
export function useModalState() {
  return useContext(ModalContext);
}

/**
 * Animated onboarding tooltip with iOS-style design
 * Shows helpful hints for first-time users
 * Features:
 * - Auto-dismiss after 6 seconds
 * - Hides when modal is open
 * - Adaptive positioning to avoid screen edges
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
  autoDismiss = true,
  autoDismissTimeout = AUTO_DISMISS_TIMEOUT,
}: OnboardingTooltipProps) {
  const colors = useColors();
  const { isModalOpen } = useContext(ModalContext);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(true); // Default to true to prevent flash
  const [adaptedPosition, setAdaptedPosition] = useState<TooltipPosition>(position);
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });
  
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

  // Calcular posición adaptativa para evitar cortes en bordes
  const calculateAdaptivePosition = useCallback((layout: { width: number; height: number }) => {
    const newPosition = { ...position };
    
    // Ajustar posición horizontal
    if (position.left !== undefined) {
      const rightEdge = position.left + layout.width;
      if (rightEdge > SCREEN_WIDTH - SAFE_MARGIN) {
        // Se sale por la derecha, ajustar
        newPosition.left = Math.max(SAFE_MARGIN, SCREEN_WIDTH - layout.width - SAFE_MARGIN);
      }
      if (position.left < SAFE_MARGIN) {
        newPosition.left = SAFE_MARGIN;
      }
    }
    
    if (position.right !== undefined) {
      const leftEdge = SCREEN_WIDTH - position.right - layout.width;
      if (leftEdge < SAFE_MARGIN) {
        newPosition.right = Math.max(SAFE_MARGIN, SCREEN_WIDTH - layout.width - SAFE_MARGIN);
      }
    }
    
    // Ajustar posición vertical
    if (position.top !== undefined) {
      const bottomEdge = position.top + layout.height;
      if (bottomEdge > SCREEN_HEIGHT - SAFE_MARGIN - 100) { // 100 para tab bar
        newPosition.top = Math.max(SAFE_MARGIN, SCREEN_HEIGHT - layout.height - SAFE_MARGIN - 100);
      }
      if (position.top < SAFE_MARGIN) {
        newPosition.top = SAFE_MARGIN;
      }
    }
    
    if (position.bottom !== undefined) {
      const topEdge = SCREEN_HEIGHT - position.bottom - layout.height;
      if (topEdge < SAFE_MARGIN) {
        newPosition.bottom = Math.max(SAFE_MARGIN, SCREEN_HEIGHT - layout.height - SAFE_MARGIN);
      }
    }
    
    setAdaptedPosition(newPosition);
  }, [position]);

  // Manejar medición del tooltip para posicionamiento adaptativo
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width !== tooltipSize.width || height !== tooltipSize.height) {
      setTooltipSize({ width, height });
      calculateAdaptivePosition({ width, height });
    }
  }, [tooltipSize, calculateAdaptivePosition]);

  // Show tooltip with animation
  useEffect(() => {
    if (hasBeenSeen || isModalOpen) return;

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
  }, [hasBeenSeen, delay, isModalOpen]);

  // Auto-dismiss después de timeout
  useEffect(() => {
    if (!isVisible || !autoDismiss || hasBeenSeen) return;
    
    const autoDismissTimer = setTimeout(() => {
      handleDismiss();
    }, autoDismissTimeout);
    
    return () => clearTimeout(autoDismissTimer);
  }, [isVisible, autoDismiss, autoDismissTimeout, hasBeenSeen]);

  // Ocultar cuando se abre un modal
  useEffect(() => {
    if (isModalOpen && isVisible) {
      // Ocultar temporalmente sin marcar como visto
      opacity.value = withTiming(0, { duration: 150 });
    } else if (!isModalOpen && isVisible && !hasBeenSeen) {
      // Mostrar de nuevo cuando se cierra el modal
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [isModalOpen, isVisible, hasBeenSeen]);

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
      <Animated.View 
        style={[styles.container, adaptedPosition, containerStyle]}
        onLayout={handleLayout}
      >
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
          
          {/* Progress indicator for auto-dismiss */}
          {autoDismiss && (
            <View style={styles.progressContainer}>
              <Animated.View style={styles.progressBar} />
            </View>
          )}
          
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
  progressContainer: {
    height: 2,
    backgroundColor: 'rgba(155, 161, 166, 0.2)',
    borderRadius: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    width: '100%',
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
