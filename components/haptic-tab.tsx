/**
 * HapticTab - Botón de pestaña con feedback háptico
 * 
 * Proporciona feedback háptico sutil al cambiar de pestaña.
 * Optimizado para no interrumpir la experiencia si algo falla.
 */

import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps) {
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
    />
  );
}
