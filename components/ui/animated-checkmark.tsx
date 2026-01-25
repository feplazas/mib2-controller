import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedCheckmarkProps {
  visible: boolean;
  onComplete?: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  message?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

/**
 * AnimatedCheckmark - Componente de micro-interacción para éxito
 * Muestra una animación de checkmark con círculo
 */
export function AnimatedCheckmark({
  visible,
  onComplete,
  size = 80,
  color = '#22C55E',
  backgroundColor = 'rgba(34, 197, 94, 0.1)',
  message,
  autoHide = true,
  autoHideDelay = 2000,
}: AnimatedCheckmarkProps) {
  const [isVisible, setIsVisible] = useState(visible);
  
  // Animaciones
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const messageOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Secuencia de animación
      opacity.value = withTiming(1, { duration: 200 });
      
      // Círculo exterior
      ringScale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      
      // Contenedor principal
      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      
      // Checkmark aparece con bounce
      checkScale.value = withDelay(
        300,
        withSequence(
          withSpring(1.2, { damping: 6, stiffness: 300 }),
          withSpring(1, { damping: 10, stiffness: 200 })
        )
      );
      
      // Mensaje aparece
      if (message) {
        messageOpacity.value = withDelay(
          500,
          withTiming(1, { duration: 300 })
        );
      }
      
      // Auto-hide
      if (autoHide && onComplete) {
        setTimeout(() => {
          hideAnimation();
        }, autoHideDelay);
      }
    }
  }, [visible]);

  const hideAnimation = () => {
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(handleComplete)();
      }
    });
    scale.value = withTiming(0.8, { duration: 300 });
    messageOpacity.value = withTiming(0, { duration: 200 });
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Reset valores
    checkScale.value = 0;
    ringScale.value = 0;
    scale.value = 0;
    messageOpacity.value = 0;
    onComplete?.();
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [
      {
        translateY: interpolate(messageOpacity.value, [0, 1], [10, 0]),
      },
    ],
  }));

  if (!isVisible) return null;

  const iconSize = size * 0.5;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
    >
      <Pressable
        style={styles.overlay}
        onPress={() => {
          if (!autoHide) {
            hideAnimation();
          }
        }}
      >
        <Animated.View style={[styles.container, containerStyle]}>
          <View
            style={[
              styles.iconContainer,
              {
                width: size + 40,
                height: size + 40,
                borderRadius: (size + 40) / 2,
                backgroundColor,
              },
            ]}
          >
            {/* Anillo exterior */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 3,
                  borderColor: color,
                },
                ringStyle,
              ]}
            />
            
            {/* Checkmark */}
            <Animated.View style={[styles.checkContainer, checkStyle]}>
              <Text style={[styles.checkIcon, { fontSize: iconSize, color }]}>✓</Text>
            </Animated.View>
          </View>
          
          {message && (
            <Animated.Text style={[styles.message, messageStyle]}>
              {message}
            </Animated.Text>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

/**
 * AnimatedError - Variante para errores con X animada
 */
export function AnimatedError({
  visible,
  onComplete,
  size = 80,
  color = '#EF4444',
  backgroundColor = 'rgba(239, 68, 68, 0.1)',
  message,
  autoHide = true,
  autoHideDelay = 2000,
}: AnimatedCheckmarkProps) {
  const [isVisible, setIsVisible] = useState(visible);
  
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const xScale = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      opacity.value = withTiming(1, { duration: 200 });
      
      ringScale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      
      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      
      xScale.value = withDelay(
        300,
        withSequence(
          withSpring(1.2, { damping: 6, stiffness: 300 }),
          withSpring(1, { damping: 10, stiffness: 200 })
        )
      );
      
      // Shake effect
      shake.value = withDelay(
        500,
        withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-8, { duration: 50 }),
          withTiming(0, { duration: 50 })
        )
      );
      
      if (message) {
        messageOpacity.value = withDelay(
          500,
          withTiming(1, { duration: 300 })
        );
      }
      
      if (autoHide && onComplete) {
        setTimeout(() => {
          hideAnimation();
        }, autoHideDelay);
      }
    }
  }, [visible]);

  const hideAnimation = () => {
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(handleComplete)();
      }
    });
    scale.value = withTiming(0.8, { duration: 300 });
    messageOpacity.value = withTiming(0, { duration: 200 });
  };

  const handleComplete = () => {
    setIsVisible(false);
    xScale.value = 0;
    ringScale.value = 0;
    scale.value = 0;
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
  }));

  const xStyle = useAnimatedStyle(() => ({
    transform: [{ scale: xScale.value }],
    opacity: xScale.value,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [
      {
        translateY: interpolate(messageOpacity.value, [0, 1], [10, 0]),
      },
    ],
  }));

  if (!isVisible) return null;

  const iconSize = size * 0.5;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
    >
      <Pressable
        style={styles.overlay}
        onPress={() => {
          if (!autoHide) {
            hideAnimation();
          }
        }}
      >
        <Animated.View style={[styles.container, containerStyle]}>
          <View
            style={[
              styles.iconContainer,
              {
                width: size + 40,
                height: size + 40,
                borderRadius: (size + 40) / 2,
                backgroundColor,
              },
            ]}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 3,
                  borderColor: color,
                },
                ringStyle,
              ]}
            />
            
            <Animated.View style={[styles.checkContainer, xStyle]}>
              <Text style={[styles.checkIcon, { fontSize: iconSize, color }]}>✕</Text>
            </Animated.View>
          </View>
          
          {message && (
            <Animated.Text style={[styles.message, { color }, messageStyle]}>
              {message}
            </Animated.Text>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

/**
 * AnimatedWarning - Variante para advertencias
 */
export function AnimatedWarning({
  visible,
  onComplete,
  size = 80,
  color = '#F59E0B',
  backgroundColor = 'rgba(245, 158, 11, 0.1)',
  message,
  autoHide = true,
  autoHideDelay = 2500,
}: AnimatedCheckmarkProps) {
  const [isVisible, setIsVisible] = useState(visible);
  
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      opacity.value = withTiming(1, { duration: 200 });
      
      ringScale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      
      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      
      iconScale.value = withDelay(
        300,
        withSequence(
          withSpring(1.2, { damping: 6, stiffness: 300 }),
          withSpring(1, { damping: 10, stiffness: 200 })
        )
      );
      
      // Pulse effect
      pulse.value = withDelay(
        600,
        withSequence(
          withTiming(1.05, { duration: 200 }),
          withTiming(1, { duration: 200 }),
          withTiming(1.05, { duration: 200 }),
          withTiming(1, { duration: 200 })
        )
      );
      
      if (message) {
        messageOpacity.value = withDelay(
          500,
          withTiming(1, { duration: 300 })
        );
      }
      
      if (autoHide && onComplete) {
        setTimeout(() => {
          hideAnimation();
        }, autoHideDelay);
      }
    }
  }, [visible]);

  const hideAnimation = () => {
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(handleComplete)();
      }
    });
    scale.value = withTiming(0.8, { duration: 300 });
    messageOpacity.value = withTiming(0, { duration: 200 });
  };

  const handleComplete = () => {
    setIsVisible(false);
    iconScale.value = 0;
    ringScale.value = 0;
    scale.value = 0;
    messageOpacity.value = 0;
    pulse.value = 1;
    onComplete?.();
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value * pulse.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconScale.value,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [
      {
        translateY: interpolate(messageOpacity.value, [0, 1], [10, 0]),
      },
    ],
  }));

  if (!isVisible) return null;

  const iconSize = size * 0.5;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
    >
      <Pressable
        style={styles.overlay}
        onPress={() => {
          if (!autoHide) {
            hideAnimation();
          }
        }}
      >
        <Animated.View style={[styles.container, containerStyle]}>
          <View
            style={[
              styles.iconContainer,
              {
                width: size + 40,
                height: size + 40,
                borderRadius: (size + 40) / 2,
                backgroundColor,
              },
            ]}
          >
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 3,
                  borderColor: color,
                },
                ringStyle,
              ]}
            />
            
            <Animated.View style={[styles.checkContainer, iconStyle]}>
              <Text style={[styles.checkIcon, { fontSize: iconSize, color }]}>!</Text>
            </Animated.View>
          </View>
          
          {message && (
            <Animated.Text style={[styles.message, { color }, messageStyle]}>
              {message}
            </Animated.Text>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

/**
 * AnimatedLoading - Variante para carga/procesando
 */
export function AnimatedLoading({
  visible,
  onComplete,
  size = 80,
  color = '#0a7ea4',
  backgroundColor = 'rgba(10, 126, 164, 0.1)',
  message,
  autoHide = false,
  autoHideDelay = 0,
}: AnimatedCheckmarkProps) {
  const [isVisible, setIsVisible] = useState(visible);
  
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const messageOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      opacity.value = withTiming(1, { duration: 200 });
      
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
      
      // Rotación continua
      rotation.value = withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      });
      
      // Loop de rotación
      const startRotation = () => {
        rotation.value = 0;
        rotation.value = withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        });
      };
      
      const interval = setInterval(startRotation, 1000);
      
      if (message) {
        messageOpacity.value = withDelay(
          200,
          withTiming(1, { duration: 300 })
        );
      }
      
      return () => clearInterval(interval);
    } else {
      hideAnimation();
    }
  }, [visible]);

  const hideAnimation = () => {
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(handleComplete)();
      }
    });
    scale.value = withTiming(0.8, { duration: 300 });
    messageOpacity.value = withTiming(0, { duration: 200 });
  };

  const handleComplete = () => {
    setIsVisible(false);
    scale.value = 0;
    messageOpacity.value = 0;
    rotation.value = 0;
    onComplete?.();
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [
      {
        translateY: interpolate(messageOpacity.value, [0, 1], [10, 0]),
      },
    ],
  }));

  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, containerStyle]}>
          <View
            style={[
              styles.iconContainer,
              {
                width: size + 40,
                height: size + 40,
                borderRadius: (size + 40) / 2,
                backgroundColor,
              },
            ]}
          >
            <Animated.View
              style={[
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: 3,
                  borderColor: `${color}30`,
                  borderTopColor: color,
                },
                spinnerStyle,
              ]}
            />
          </View>
          
          {message && (
            <Animated.Text style={[styles.message, { color }, messageStyle]}>
              {message}
            </Animated.Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontWeight: 'bold',
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#22C55E',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
