import type { ChipsetCompatibility } from '@/components/chipset-status-badge';

/**
 * Determine chipset compatibility for MIB2 spoofing
 */
export function getChipsetCompatibility(chipset: string): ChipsetCompatibility {
  const chipsetLower = chipset.toLowerCase();
  
  // Confirmed ASIX chipsets (tested and working)
  const confirmedASIX = ['ax88772', 'ax88772a', 'ax88772b'];
  if (confirmedASIX.some(model => chipsetLower.includes(model))) {
    return 'confirmed';
  }
  
  // Other ASIX chipsets (experimental but probably compatible)
  // Share similar EEPROM architecture
  const experimentalASIX = ['ax88172', 'ax88178', 'ax88179', 'ax88772c'];
  if (experimentalASIX.some(model => chipsetLower.includes(model))) {
    return 'experimental';
  }
  
  // Any other generic ASIX
  if (chipsetLower.includes('asix')) {
    return 'experimental';
  }
  
  // Known incompatible chipsets
  const incompatible = ['realtek', 'microchip', 'broadcom', 'davicom', 'lan'];
  if (incompatible.some(vendor => chipsetLower.includes(vendor))) {
    return 'incompatible';
  }
  
  // Unknown
  return 'unknown';
}

/**
 * Get compatibility message key for translation
 */
export function getCompatibilityMessageKey(compatibility: ChipsetCompatibility): string {
  switch (compatibility) {
    case 'confirmed':
      return 'chipset.confirmed_message';
    case 'experimental':
      return 'chipset.experimental_message';
    case 'incompatible':
      return 'chipset.incompatible_message';
    default:
      return 'chipset.unknown_message';
  }
}

/**
 * Check if chipset can attempt spoofing
 */
export function canAttemptSpoofing(compatibility: ChipsetCompatibility): boolean {
  return compatibility === 'confirmed' || compatibility === 'experimental';
}
