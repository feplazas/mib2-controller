/**
 * Tab Sound Service - Efecto de sonido premium para cambio de pestaña
 * 
 * Proporciona un sonido sutil y premium al cambiar de pestaña,
 * complementando el haptic feedback para una experiencia multisensorial.
 * 
 * Características:
 * - Sonido de click UI sutil y profesional
 * - Volumen bajo para no ser intrusivo
 * - Manejo de errores silencioso (no interrumpe la app)
 * - Compatible con iOS y Android
 * - Deshabilitado en web para evitar autoplay restrictions
 */

import { Platform } from "react-native";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import { useEffect, useCallback } from "react";

// Importar el sonido de tab switch
const TAB_SWITCH_SOUND = require("@/assets/sounds/tab-switch.mp3");

// Volumen del sonido (0-1, bajo para ser sutil)
const SOUND_VOLUME = 0.15;

// Estado global para habilitar/deshabilitar sonido
let soundEnabled = true;

/**
 * Obtener estado actual del sonido
 */
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Habilitar o deshabilitar sonido de pestañas
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

/**
 * Hook para reproducir sonido de cambio de pestaña
 * 
 * Uso:
 * ```tsx
 * const { playTabSound } = useTabSound();
 * 
 * // En el handler de cambio de pestaña:
 * playTabSound();
 * ```
 */
export function useTabSound() {
  const player = useAudioPlayer(TAB_SWITCH_SOUND);

  // Inicializar audio mode para iOS silent mode
  useEffect(() => {
    const initAudio = async () => {
      if (Platform.OS === "web") return;
      
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
        });
      } catch (error) {
        console.warn("[TabSound] Failed to initialize audio mode:", error);
      }
    };

    initAudio();

    // Cleanup
    return () => {
      try {
        player.release();
      } catch (error) {
        // Ignorar errores de cleanup
      }
    };
  }, [player]);

  // Función para reproducir el sonido
  const playTabSound = useCallback(() => {
    // No reproducir si está deshabilitado o en web
    if (!soundEnabled || Platform.OS === "web") return;

    try {
      // Configurar volumen bajo
      player.volume = SOUND_VOLUME;
      
      // Reiniciar si ya estaba reproduciéndose
      if (player.playing) {
        player.seekTo(0);
      } else {
        player.play();
      }
    } catch (error) {
      // Silenciar errores para no interrumpir la experiencia
      console.warn("[TabSound] Failed to play sound:", error);
    }
  }, [player]);

  return { playTabSound };
}
