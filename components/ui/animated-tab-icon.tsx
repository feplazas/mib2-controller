/**
 * AnimatedTabIcon - Efecto visual premium para pestañas activas
 * 
 * Implementa un efecto de "glow" y "pulse" sutil en el icono de la pestaña
 * activa para reforzar la experiencia de usuario ultra premium.
 * 
 * Características:
 * - Animación de escala suave (pulse)
 * - Efecto de resplandor (glow) con sombra animada
 * - Transiciones fluidas entre estados activo/inactivo
 * - Optimizado para rendimiento con react-native-reanimated
 */

import { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  cancelAnimation,
} from "react-native-reanimated";
import { IconSymbol } from "./icon-symbol";
import type { SymbolWeight, SymbolViewProps } from "expo-symbols";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

interface AnimatedTabIconProps {
  name: SymbolViewProps["name"];
  size?: number;
  color: string | OpaqueColorValue;
  focused: boolean;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
  /** Color del efecto glow (por defecto usa el color del icono) */
  glowColor?: string;
  /** Intensidad del efecto glow (0-1, por defecto 0.6) */
  glowIntensity?: number;
  /** Habilitar animación de pulse (por defecto true) */
  enablePulse?: boolean;
  /** Habilitar efecto glow (por defecto true) */
  enableGlow?: boolean;
}

export function AnimatedTabIcon({
  name,
  size = 24,
  color,
  focused,
  style,
  weight,
  glowColor,
  glowIntensity = 0.6,
  enablePulse = true,
  enableGlow = true,
}: AnimatedTabIconProps) {
  // Valores animados
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);

  // Efecto de activación/desactivación
  useEffect(() => {
    if (focused) {
      // Animación de entrada: escala suave
      scale.value = withSequence(
        withTiming(1.15, { duration: 150, easing: Easing.out(Easing.back(2)) }),
        withTiming(1.08, { duration: 100, easing: Easing.inOut(Easing.ease) })
      );

      // Efecto glow: aparecer con fade
      glowOpacity.value = withTiming(glowIntensity, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });

      // Animación de pulse continua (sutil)
      if (enablePulse) {
        scale.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.02, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Repetir infinitamente
          true // Reverse
        );

        // Pulse del glow
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      }
    } else {
      // Animación de salida
      cancelAnimation(scale);
      cancelAnimation(glowScale);
      
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
      glowOpacity.value = withTiming(0, { duration: 150, easing: Easing.out(Easing.ease) });
      glowScale.value = withTiming(1, { duration: 150 });
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(glowOpacity);
      cancelAnimation(glowScale);
    };
  }, [focused, enablePulse, glowIntensity]);

  // Estilo animado del icono
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Estilo animado del glow
  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: glowScale.value }],
    };
  });

  // Color del glow (usa el color del icono si no se especifica)
  const effectiveGlowColor = glowColor || (typeof color === "string" ? color : "#0A7EA4");

  return (
    <View style={styles.container}>
      {/* Capa de glow (detrás del icono) */}
      {enableGlow && (
        <Animated.View
          style={[
            styles.glowLayer,
            {
              backgroundColor: effectiveGlowColor,
              width: size * 1.8,
              height: size * 1.8,
              borderRadius: size,
            },
            animatedGlowStyle,
          ]}
        />
      )}

      {/* Icono principal con animación */}
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <IconSymbol
          name={name as any}
          size={size}
          color={color}
          style={style}
          weight={weight}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glowLayer: {
    position: "absolute",
    // Blur effect para el glow
    ...(Platform.OS === "web"
      ? {
          filter: "blur(12px)",
        }
      : {
          // En native, usamos opacidad reducida para simular blur
          opacity: 0.3,
        }),
  },
  iconContainer: {
    zIndex: 1,
  },
});

export default AnimatedTabIcon;
