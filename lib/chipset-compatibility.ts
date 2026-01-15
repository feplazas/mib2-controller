import type { ChipsetCompatibility } from '@/components/chipset-status-badge';

/**
 * Determinar compatibilidad de chipset para spoofing MIB2
 */
export function getChipsetCompatibility(chipset: string): ChipsetCompatibility {
  const chipsetLower = chipset.toLowerCase();
  
  // Chipsets ASIX confirmados (probados y funcionando)
  const confirmedASIX = ['ax88772', 'ax88772a', 'ax88772b'];
  if (confirmedASIX.some(model => chipsetLower.includes(model))) {
    return 'confirmed';
  }
  
  // Otros chipsets ASIX (experimentales pero probablemente compatibles)
  // Comparten arquitectura de EEPROM similar
  const experimentalASIX = ['ax88172', 'ax88178', 'ax88179', 'ax88772c'];
  if (experimentalASIX.some(model => chipsetLower.includes(model))) {
    return 'experimental';
  }
  
  // Cualquier otro ASIX genérico
  if (chipsetLower.includes('asix')) {
    return 'experimental';
  }
  
  // Chipsets incompatibles conocidos
  const incompatible = ['realtek', 'microchip', 'broadcom', 'davicom', 'lan'];
  if (incompatible.some(vendor => chipsetLower.includes(vendor))) {
    return 'incompatible';
  }
  
  // Desconocido
  return 'unknown';
}

/**
 * Obtener mensaje descriptivo de compatibilidad
 */
export function getCompatibilityMessage(compatibility: ChipsetCompatibility, chipset: string): string {
  switch (compatibility) {
    case 'confirmed':
      return `${chipset} está confirmado como compatible para spoofing MIB2. Probado y funcionando correctamente.`;
    case 'experimental':
      return `${chipset} es experimental. Comparte arquitectura ASIX similar y debería funcionar, pero no está 100% confirmado.`;
    case 'incompatible':
      return `${chipset} NO es compatible con spoofing en Android. Requiere herramientas específicas o no soporta modificación de VID/PID.`;
    default:
      return `${chipset} es desconocido. No hay información sobre compatibilidad para spoofing MIB2.`;
  }
}

/**
 * Verificar si chipset puede intentar spoofing
 */
export function canAttemptSpoofing(compatibility: ChipsetCompatibility): boolean {
  return compatibility === 'confirmed' || compatibility === 'experimental';
}
