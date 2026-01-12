/**
 * FEC (Feature Enablement Code) Library
 * Códigos FEC conocidos y documentados para MIB2 STD2
 */

export interface FecCode {
  code: string;
  name: string;
  description: string;
  category: 'connectivity' | 'navigation' | 'display' | 'performance' | 'other';
  tested: boolean;
  notes?: string;
}

export const FEC_CODES: FecCode[] = [
  // Connectivity
  {
    code: '00010001',
    name: 'Apple CarPlay',
    description: 'Activa Apple CarPlay para iPhone',
    category: 'connectivity',
    tested: true,
  },
  {
    code: '00010002',
    name: 'Android Auto',
    description: 'Activa Android Auto para dispositivos Android',
    category: 'connectivity',
    tested: true,
  },
  {
    code: '00010004',
    name: 'MirrorLink',
    description: 'Activa MirrorLink para dispositivos compatibles',
    category: 'connectivity',
    tested: true,
  },
  {
    code: '00010008',
    name: 'App-Connect (Full-Link)',
    description: 'Activa todas las funciones de App-Connect',
    category: 'connectivity',
    tested: true,
  },
  
  // Navigation
  {
    code: '09400008',
    name: 'Mapas Europa',
    description: 'Activa región de mapas Europa (EU)',
    category: 'navigation',
    tested: true,
  },
  {
    code: '09410008',
    name: 'Mapas Norteamérica',
    description: 'Activa región de mapas Norteamérica (NAR)',
    category: 'navigation',
    tested: true,
  },
  {
    code: '09420008',
    name: 'Mapas China',
    description: 'Activa región de mapas China (CN)',
    category: 'navigation',
    tested: false,
  },
  {
    code: '09430008',
    name: 'Mapas Resto del Mundo',
    description: 'Activa región de mapas ROW (Rest of World)',
    category: 'navigation',
    tested: false,
  },
  
  // Performance & Diagnostics
  {
    code: '00060001',
    name: 'Performance Monitor',
    description: 'Activa monitor de rendimiento del vehículo',
    category: 'performance',
    tested: true,
  },
  {
    code: '00060100',
    name: 'Vehicle Data Interface',
    description: 'Interfaz de datos del vehículo',
    category: 'performance',
    tested: false,
  },
  
  // Display
  {
    code: '00050001',
    name: 'Ambient Light Control',
    description: 'Control de iluminación ambiental',
    category: 'display',
    tested: false,
  },
  {
    code: '00050002',
    name: 'Digital Cockpit',
    description: 'Activa funciones del cockpit digital',
    category: 'display',
    tested: false,
  },
  
  // Other
  {
    code: '00070001',
    name: 'Voice Control',
    description: 'Control por voz avanzado',
    category: 'other',
    tested: false,
  },
  {
    code: '00080001',
    name: 'Gesture Control',
    description: 'Control por gestos',
    category: 'other',
    tested: false,
  },
];

export const FEC_CATEGORIES = {
  connectivity: 'Conectividad',
  navigation: 'Navegación',
  display: 'Pantalla',
  performance: 'Rendimiento',
  other: 'Otros',
} as const;

export function getFecCodesByCategory(category: FecCode['category']): FecCode[] {
  return FEC_CODES.filter((code) => code.category === category);
}

export function searchFecCodes(query: string): FecCode[] {
  const lowerQuery = query.toLowerCase();
  return FEC_CODES.filter(
    (code) =>
      code.name.toLowerCase().includes(lowerQuery) ||
      code.description.toLowerCase().includes(lowerQuery) ||
      code.code.includes(query)
  );
}

/**
 * Comandos Telnet para inyectar códigos FEC
 */
export function generateFecInjectionCommands(codes: string[]): string[] {
  return [
    '# Montar sistema de archivos',
    'mount -uw /net/rcc/dev/shmem',
    '',
    '# Inyectar códigos FEC',
    ...codes.map((code) => `echo "${code}" >> /net/rcc/dev/shmem/addfec.txt`),
    '',
    '# Reiniciar unidad para aplicar cambios',
    'reboot',
  ];
}

/**
 * URL del generador FEC online
 */
export const FEC_GENERATOR_URL = 'https://vwcoding.ru/en/utils/fec/';

/**
 * Validar formato de código FEC (8 caracteres hexadecimales)
 */
export function isValidFecCode(code: string): boolean {
  return /^[0-9A-Fa-f]{8}$/.test(code);
}

/**
 * Formatear código FEC (agregar ceros si es necesario)
 */
export function formatFecCode(code: string): string {
  const cleaned = code.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  return cleaned.padStart(8, '0');
}
