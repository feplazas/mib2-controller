/**
 * Haptics Service - Patrones de vibración personalizados
 * 
 * Proporciona feedback táctil consistente y distintivo para diferentes
 * tipos de acciones y notificaciones en la aplicación.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Tipos de patrones de haptic feedback disponibles
 */
export type HapticPattern = 
  | 'success'      // Éxito suave - acción completada correctamente
  | 'error'        // Error fuerte - algo salió mal
  | 'warning'      // Advertencia media - atención requerida
  | 'connection'   // Conexión - doble pulso para conexión USB
  | 'disconnect'   // Desconexión - pulso descendente
  | 'tap'          // Toque ligero - interacción básica
  | 'selection'    // Selección - cambio de opción
  | 'impact'       // Impacto - acción importante
  | 'backup'       // Backup - patrón de progreso completado
  | 'restore';     // Restauración - patrón de recuperación

/**
 * Ejecuta un patrón de haptic feedback
 * Solo funciona en dispositivos nativos (iOS/Android), no en web
 */
export async function triggerHaptic(pattern: HapticPattern): Promise<void> {
  // No ejecutar en web
  if (Platform.OS === 'web') {
    return;
  }

  try {
    switch (pattern) {
      case 'success':
        // Éxito suave: notificación de éxito
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'error':
        // Error fuerte: triple pulso pesado
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case 'warning':
        // Advertencia media: doble pulso medio
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await delay(150);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'connection':
        // Conexión USB: doble pulso ascendente (ligero -> medio)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(100);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(100);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'disconnect':
        // Desconexión: pulso descendente (medio -> ligero)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(100);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'tap':
        // Toque ligero: impacto suave
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'selection':
        // Selección: feedback de selección nativo
        await Haptics.selectionAsync();
        break;

      case 'impact':
        // Impacto: pulso medio fuerte
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'backup':
        // Backup completado: patrón de progreso (3 pulsos ascendentes + éxito)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await delay(80);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(150);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'restore':
        // Restauración: patrón de recuperación (pulso medio + éxito doble)
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await delay(120);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await delay(200);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      default:
        // Fallback: impacto ligero
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silenciar errores de haptics - no es crítico
    console.warn('[HapticsService] Error triggering haptic:', error);
  }
}

/**
 * Ejecuta un patrón de haptic con mensaje de log para debugging
 */
export async function triggerHapticWithLog(
  pattern: HapticPattern, 
  context: string
): Promise<void> {
  console.log(`[HapticsService] Triggering '${pattern}' for: ${context}`);
  await triggerHaptic(pattern);
}

/**
 * Helper para crear delays entre pulsos
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica si haptics está disponible en el dispositivo actual
 */
export function isHapticsAvailable(): boolean {
  return Platform.OS !== 'web';
}

/**
 * Objeto de conveniencia para acceso rápido a patrones
 */
export const haptics = {
  success: () => triggerHaptic('success'),
  error: () => triggerHaptic('error'),
  warning: () => triggerHaptic('warning'),
  connection: () => triggerHaptic('connection'),
  disconnect: () => triggerHaptic('disconnect'),
  tap: () => triggerHaptic('tap'),
  selection: () => triggerHaptic('selection'),
  impact: () => triggerHaptic('impact'),
  backup: () => triggerHaptic('backup'),
  restore: () => triggerHaptic('restore'),
};

export default haptics;
