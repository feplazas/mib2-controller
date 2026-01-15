/**
 * FEC (Feature Enablement Code) Library
 * Known and documented FEC codes for MIB2 STD2
 */

export interface FecCode {
  code: string;
  nameKey: string;
  descriptionKey: string;
  category: 'connectivity' | 'navigation' | 'display' | 'performance' | 'other';
  tested: boolean;
  notesKey?: string;
}

export const FEC_CODES: FecCode[] = [
  // Connectivity
  {
    code: '00010001',
    nameKey: 'fec.apple_carplay',
    descriptionKey: 'fec.apple_carplay_desc',
    category: 'connectivity',
    tested: true,
  },
  {
    code: '00010002',
    nameKey: 'fec.android_auto',
    descriptionKey: 'fec.android_auto_desc',
    category: 'connectivity',
    tested: true,
  },
  {
    code: '00010004',
    nameKey: 'fec.mirrorlink',
    descriptionKey: 'fec.mirrorlink_desc',
    category: 'connectivity',
    tested: true,
  },
  {
    code: '00010008',
    nameKey: 'fec.app_connect',
    descriptionKey: 'fec.app_connect_desc',
    category: 'connectivity',
    tested: true,
  },
  
  // Navigation
  {
    code: '09400008',
    nameKey: 'fec.maps_europe',
    descriptionKey: 'fec.maps_europe_desc',
    category: 'navigation',
    tested: true,
  },
  {
    code: '09410008',
    nameKey: 'fec.maps_north_america',
    descriptionKey: 'fec.maps_north_america_desc',
    category: 'navigation',
    tested: true,
  },
  {
    code: '09420008',
    nameKey: 'fec.maps_china',
    descriptionKey: 'fec.maps_china_desc',
    category: 'navigation',
    tested: false,
  },
  {
    code: '09430008',
    nameKey: 'fec.maps_row',
    descriptionKey: 'fec.maps_row_desc',
    category: 'navigation',
    tested: false,
  },
  
  // Performance & Diagnostics
  {
    code: '00060001',
    nameKey: 'fec.performance_monitor',
    descriptionKey: 'fec.performance_monitor_desc',
    category: 'performance',
    tested: true,
  },
  {
    code: '00060100',
    nameKey: 'fec.vehicle_data_interface',
    descriptionKey: 'fec.vehicle_data_interface_desc',
    category: 'performance',
    tested: false,
  },
  
  // Display
  {
    code: '00050001',
    nameKey: 'fec.ambient_light',
    descriptionKey: 'fec.ambient_light_desc',
    category: 'display',
    tested: false,
  },
  {
    code: '00050002',
    nameKey: 'fec.digital_cockpit',
    descriptionKey: 'fec.digital_cockpit_desc',
    category: 'display',
    tested: false,
  },
  
  // Other
  {
    code: '00070001',
    nameKey: 'fec.voice_control',
    descriptionKey: 'fec.voice_control_desc',
    category: 'other',
    tested: false,
  },
  {
    code: '00080001',
    nameKey: 'fec.gesture_control',
    descriptionKey: 'fec.gesture_control_desc',
    category: 'other',
    tested: false,
  },
];

// Category keys for translation
export const FEC_CATEGORY_KEYS = {
  connectivity: 'fec.category_connectivity',
  navigation: 'fec.category_navigation',
  display: 'fec.category_display',
  performance: 'fec.category_performance',
  other: 'fec.category_other',
} as const;

export function getFecCodesByCategory(category: FecCode['category']): FecCode[] {
  return FEC_CODES.filter((code) => code.category === category);
}

export function searchFecCodes(query: string, t: (key: string) => string): FecCode[] {
  const lowerQuery = query.toLowerCase();
  return FEC_CODES.filter(
    (code) =>
      t(code.nameKey).toLowerCase().includes(lowerQuery) ||
      t(code.descriptionKey).toLowerCase().includes(lowerQuery) ||
      code.code.includes(query)
  );
}

/**
 * Telnet commands for FEC code injection - returns translation keys
 */
export function generateFecInjectionCommandKeys(codes: string[]): { key: string; params?: Record<string, string> }[] {
  return [
    { key: 'fec.cmd_mount_filesystem' },
    { key: 'fec.cmd_mount', params: {} },
    { key: 'fec.cmd_inject_codes' },
    ...codes.map((code) => ({ key: 'fec.cmd_echo', params: { code } })),
    { key: 'fec.cmd_reboot_apply' },
    { key: 'fec.cmd_reboot', params: {} },
  ];
}

/**
 * Generate raw commands (for actual execution)
 */
export function generateFecInjectionCommands(codes: string[]): string[] {
  return [
    'mount -uw /net/rcc/dev/shmem',
    ...codes.map((code) => `echo "${code}" >> /net/rcc/dev/shmem/addfec.txt`),
    'reboot',
  ];
}

/**
 * FEC online generator URL
 */
export const FEC_GENERATOR_URL = 'https://vwcoding.ru/en/utils/fec/';

/**
 * Validate FEC code format (8 hexadecimal characters)
 */
export function isValidFecCode(code: string): boolean {
  return /^[0-9A-Fa-f]{8}$/.test(code);
}

/**
 * Format FEC code (add leading zeros if necessary)
 */
export function formatFecCode(code: string): string {
  const cleaned = code.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  return cleaned.padStart(8, '0');
}
