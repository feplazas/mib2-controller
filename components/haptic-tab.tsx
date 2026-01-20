/**
 * HapticTab - Botón de pestaña con feedback háptico y sonido premium
 * 
 * Proporciona una experiencia multisensorial al cambiar de pestaña:
 * - Haptic feedback sutil al presionar
 * - Sonido de click premium al soltar
 * 
 * Optimizado para no interrumpir la experiencia si algo falla.
 */

import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { useTabSound } from "@/lib/tab-sound-service";

export function HapticTab(props: BottomTabBarButtonProps) {
  const { playTabSound } = useTabSound();

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Haptic feedback al presionar (solo en dispositivos móviles)
        if (Platform.OS !== "web") {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (error) {
            // Silenciar errores de haptics
          }
        }
        props.onPressIn?.(ev);
      }}
      onPress={(ev) => {
        // Sonido premium al cambiar de pestaña
        if (Platform.OS !== "web") {
          try {
            playTabSound();
          } catch (error) {
            // Silenciar errores de sonido
          }
        }
        props.onPress?.(ev);
      }}
    />
  );
}
