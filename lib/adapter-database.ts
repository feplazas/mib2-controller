/**
 * Base de Datos de Adaptadores USB-Ethernet Conocidos
 * Contiene especificaciones técnicas, offsets de EEPROM y nivel de compatibilidad
 */

export type EepromType = '93C46' | '93C56' | '93C66' | 'eFuse' | 'Unknown';
export type CompatibilityLevel = 'high' | 'medium' | 'low' | 'incompatible';
export type ChipsetFamily = 'ASIX' | 'Realtek' | 'Microchip' | 'Other';

export interface EepromOffsets {
  vidLow: number;
  vidHigh: number;
  pidLow: number;
  pidHigh: number;
  checksum?: number;
  macAddress?: number;
  serialNumber?: number;
}

export interface AdapterSpec {
  // Identificación
  vendorId: number;
  productId: number;
  vendorName: string;
  productName: string;
  revision?: string;
  
  // Chipset
  chipset: string;
  chipsetFamily: ChipsetFamily;
  chipsetVersion?: string;
  
  // EEPROM
  eepromType: EepromType;
  eepromSize: number; // en bytes
  eepromOffsets: EepromOffsets;
  
  // Compatibilidad
  spoofingCompatibility: CompatibilityLevel;
  mib2Whitelisted: boolean;
  
  // Notas técnicas
  notes?: string;
  quirks?: string[];
  recoveryMethods?: string[];
}

/**
 * Base de datos de adaptadores conocidos
 */
export const ADAPTER_DATABASE: AdapterSpec[] = [
  // ========== ASIX Electronics ==========
  {
    vendorId: 0x0B95,
    productId: 0x7720,
    vendorName: 'ASIX Electronics',
    productName: 'AX88772 USB 2.0 to Fast Ethernet Adapter',
    chipset: 'AX88772',
    chipsetFamily: 'ASIX',
    eepromType: '93C56',
    eepromSize: 256,
    eepromOffsets: {
      vidLow: 0x88,
      vidHigh: 0x89,
      pidLow: 0x8A,
      pidHigh: 0x8B,
      checksum: 0xFE,
      macAddress: 0x04,
    },
    spoofingCompatibility: 'high',
    mib2Whitelisted: false,
    notes: 'Generic ASIX AX88772 adapter. Most common chipset for USB-Ethernet adapters.',
    quirks: [
      'EEPROM offsets may vary by manufacturer',
      'Some clones use different memory maps',
    ],
    recoveryMethods: [
      'SDA/SCL short circuit during power-on',
      'Vendor command 0x20 for EEPROM reset',
    ],
  },
  {
    vendorId: 0x0B95,
    productId: 0x772A,
    vendorName: 'ASIX Electronics',
    productName: 'AX88772A USB 2.0 to Fast Ethernet Adapter',
    chipset: 'AX88772A',
    chipsetFamily: 'ASIX',
    chipsetVersion: 'A',
    eepromType: '93C56',
    eepromSize: 256,
    eepromOffsets: {
      vidLow: 0x88,
      vidHigh: 0x89,
      pidLow: 0x8A,
      pidHigh: 0x8B,
      checksum: 0xFE,
      macAddress: 0x04,
    },
    spoofingCompatibility: 'high',
    mib2Whitelisted: false,
    notes: 'Improved version with better power management. Fully compatible with spoofing.',
    recoveryMethods: [
      'SDA/SCL short circuit during power-on',
      'Vendor command 0x20 for EEPROM reset',
    ],
  },
  {
    vendorId: 0x0B95,
    productId: 0x772B,
    vendorName: 'ASIX Electronics',
    productName: 'AX88772B USB 2.0 to Fast Ethernet Adapter',
    chipset: 'AX88772B',
    chipsetFamily: 'ASIX',
    chipsetVersion: 'B',
    eepromType: '93C66',
    eepromSize: 512,
    eepromOffsets: {
      vidLow: 0x88,
      vidHigh: 0x89,
      pidLow: 0x8A,
      pidHigh: 0x8B,
      checksum: 0x1FE,
      macAddress: 0x04,
    },
    spoofingCompatibility: 'high',
    mib2Whitelisted: false,
    notes: 'Larger EEPROM (512 bytes). Fully compatible with spoofing.',
    quirks: [
      'Checksum offset at 0x1FE instead of 0xFE',
    ],
    recoveryMethods: [
      'SDA/SCL short circuit during power-on',
      'Vendor command 0x20 for EEPROM reset',
    ],
  },
  {
    vendorId: 0x0B95,
    productId: 0x772C,
    vendorName: 'ASIX Electronics',
    productName: 'AX88772C USB 2.0 to Fast Ethernet Adapter',
    chipset: 'AX88772C',
    chipsetFamily: 'ASIX',
    chipsetVersion: 'C',
    eepromType: 'eFuse',
    eepromSize: 0,
    eepromOffsets: {
      vidLow: 0,
      vidHigh: 0,
      pidLow: 0,
      pidHigh: 0,
    },
    spoofingCompatibility: 'incompatible',
    mib2Whitelisted: false,
    notes: 'Uses eFuse technology instead of external EEPROM. CANNOT be reprogrammed.',
    quirks: [
      'VID/PID burned into internal eFuse',
      'No external EEPROM present',
      'Impossible to spoof',
    ],
    recoveryMethods: [],
  },

  // ========== D-Link ==========
  {
    vendorId: 0x2001,
    productId: 0x3C05,
    vendorName: 'D-Link Corp.',
    productName: 'DUB-E100 Fast Ethernet Adapter (Rev B1)',
    revision: 'B1',
    chipset: 'AX88772',
    chipsetFamily: 'ASIX',
    eepromType: '93C56',
    eepromSize: 256,
    eepromOffsets: {
      vidLow: 0x88,
      vidHigh: 0x89,
      pidLow: 0x8A,
      pidHigh: 0x8B,
      checksum: 0xFE,
      macAddress: 0x04,
    },
    spoofingCompatibility: 'medium',
    mib2Whitelisted: true,
    notes: 'Target VID/PID for spoofing. This adapter is whitelisted by MIB2.',
    quirks: [
      'Original D-Link adapters are expensive',
      'Can be emulated by spoofing ASIX adapters',
    ],
  },
  {
    vendorId: 0x2001,
    productId: 0x1A02,
    vendorName: 'D-Link Corp.',
    productName: 'DUB-E100 Fast Ethernet Adapter (Rev C1)',
    revision: 'C1',
    chipset: 'AX88772',
    chipsetFamily: 'ASIX',
    eepromType: '93C56',
    eepromSize: 256,
    eepromOffsets: {
      vidLow: 0x88,
      vidHigh: 0x89,
      pidLow: 0x8A,
      pidHigh: 0x8B,
      checksum: 0xFE,
      macAddress: 0x04,
    },
    spoofingCompatibility: 'medium',
    mib2Whitelisted: true,
    notes: 'Newer revision. Also whitelisted by MIB2 (firmware T490+).',
  },

  // ========== Otros Fabricantes ==========
  {
    vendorId: 0x0B95,
    productId: 0x1780,
    vendorName: 'ASIX Electronics',
    productName: 'AX88178 USB 2.0 to Gigabit Ethernet Adapter',
    chipset: 'AX88178',
    chipsetFamily: 'ASIX',
    eepromType: '93C66',
    eepromSize: 512,
    eepromOffsets: {
      vidLow: 0x88,
      vidHigh: 0x89,
      pidLow: 0x8A,
      pidHigh: 0x8B,
      checksum: 0x1FE,
      macAddress: 0x04,
    },
    spoofingCompatibility: 'low',
    mib2Whitelisted: false,
    notes: 'Gigabit adapter. Not recommended for MIB2 (requires Fast Ethernet 100Mbps).',
    quirks: [
      'Gigabit chipset may not be compatible with MIB2',
      'Larger EEPROM size',
    ],
  },
  {
    vendorId: 0x0B95,
    productId: 0x1790,
    vendorName: 'ASIX Electronics',
    productName: 'AX88179 USB 3.0 to Gigabit Ethernet Adapter',
    chipset: 'AX88179',
    chipsetFamily: 'ASIX',
    eepromType: '93C66',
    eepromSize: 512,
    eepromOffsets: {
      vidLow: 0x88,
      vidHigh: 0x89,
      pidLow: 0x8A,
      pidHigh: 0x8B,
      checksum: 0x1FE,
      macAddress: 0x04,
    },
    spoofingCompatibility: 'low',
    mib2Whitelisted: false,
    notes: 'USB 3.0 Gigabit adapter. Not recommended for MIB2.',
    quirks: [
      'USB 3.0 may cause compatibility issues',
      'Gigabit chipset not needed for MIB2',
    ],
  },
];

/**
 * Clase para consultar la base de datos de adaptadores
 */
export class AdapterDatabase {
  /**
   * Buscar adaptador por VID/PID
   */
  static findByVidPid(vendorId: number, productId: number): AdapterSpec | undefined {
    return ADAPTER_DATABASE.find(
      (adapter) => adapter.vendorId === vendorId && adapter.productId === productId
    );
  }

  /**
   * Buscar todos los adaptadores de un fabricante
   */
  static findByVendor(vendorId: number): AdapterSpec[] {
    return ADAPTER_DATABASE.filter((adapter) => adapter.vendorId === vendorId);
  }

  /**
   * Buscar adaptadores por familia de chipset
   */
  static findByChipsetFamily(family: ChipsetFamily): AdapterSpec[] {
    return ADAPTER_DATABASE.filter((adapter) => adapter.chipsetFamily === family);
  }

  /**
   * Buscar adaptadores compatibles para spoofing
   */
  static findSpoofingCompatible(): AdapterSpec[] {
    return ADAPTER_DATABASE.filter(
      (adapter) => adapter.spoofingCompatibility === 'high' || adapter.spoofingCompatibility === 'medium'
    );
  }

  /**
   * Buscar adaptadores en lista blanca de MIB2
   */
  static findMib2Whitelisted(): AdapterSpec[] {
    return ADAPTER_DATABASE.filter((adapter) => adapter.mib2Whitelisted);
  }

  /**
   * Obtener información detallada de un adaptador
   */
  static getAdapterInfo(vendorId: number, productId: number): string {
    const adapter = this.findByVidPid(vendorId, productId);
    if (!adapter) {
      return 'Unknown adapter';
    }

    let info = `${adapter.vendorName} ${adapter.productName}\n`;
    if (adapter.revision) {
      info += `Revision: ${adapter.revision}\n`;
    }
    info += `Chipset: ${adapter.chipset}\n`;
    info += `EEPROM: ${adapter.eepromType} (${adapter.eepromSize} bytes)\n`;
    info += `Spoofing Compatibility: ${adapter.spoofingCompatibility}\n`;
    info += `MIB2 Whitelisted: ${adapter.mib2Whitelisted ? 'Yes' : 'No'}\n`;
    
    if (adapter.notes) {
      info += `\nNotes: ${adapter.notes}\n`;
    }

    if (adapter.quirks && adapter.quirks.length > 0) {
      info += `\nQuirks:\n`;
      adapter.quirks.forEach((quirk) => {
        info += `- ${quirk}\n`;
      });
    }

    if (adapter.recoveryMethods && adapter.recoveryMethods.length > 0) {
      info += `\nRecovery Methods:\n`;
      adapter.recoveryMethods.forEach((method) => {
        info += `- ${method}\n`;
      });
    }

    return info;
  }

  /**
   * Verificar si un adaptador es compatible para spoofing
   */
  static isSpoofingCompatible(vendorId: number, productId: number): boolean {
    const adapter = this.findByVidPid(vendorId, productId);
    if (!adapter) {
      return false;
    }
    return adapter.spoofingCompatibility === 'high' || adapter.spoofingCompatibility === 'medium';
  }

  /**
   * Obtener offsets de EEPROM sugeridos
   */
  static getSuggestedOffsets(vendorId: number, productId: number): EepromOffsets | null {
    const adapter = this.findByVidPid(vendorId, productId);
    if (!adapter) {
      return null;
    }
    return adapter.eepromOffsets;
  }

  /**
   * Obtener adaptador objetivo para spoofing (D-Link DUB-E100 B1)
   */
  static getTargetAdapter(): AdapterSpec {
    const target = this.findByVidPid(0x2001, 0x3C05);
    if (!target) {
      throw new Error('common.target_adapter_not_found');
    }
    return target;
  }

  /**
   * Generar reporte de compatibilidad
   */
  static generateCompatibilityReport(vendorId: number, productId: number): {
    compatible: boolean;
    level: CompatibilityLevel;
    reason: string;
    warnings: string[];
    recommendations: string[];
  } {
    const adapter = this.findByVidPid(vendorId, productId);
    
    if (!adapter) {
      return {
        compatible: false,
        level: 'incompatible',
        reason: 'Adapter not found in database. Unknown compatibility.',
        warnings: ['This adapter has not been tested'],
        recommendations: ['Use a known compatible adapter like ASIX AX88772A/B'],
      };
    }

    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Verificar eFuse
    if (adapter.eepromType === 'eFuse') {
      return {
        compatible: false,
        level: 'incompatible',
        reason: 'This adapter uses eFuse technology which cannot be reprogrammed.',
        warnings: ['VID/PID is burned into internal eFuse', 'Spoofing is impossible'],
        recommendations: ['Purchase an AX88772A or AX88772B adapter instead'],
      };
    }

    // Agregar quirks como warnings
    if (adapter.quirks) {
      warnings.push(...adapter.quirks);
    }

    // Generar recomendaciones
    if (adapter.spoofingCompatibility === 'high') {
      recommendations.push('This adapter is highly compatible with spoofing');
      recommendations.push('Follow the standard spoofing procedure');
    } else if (adapter.spoofingCompatibility === 'medium') {
      recommendations.push('This adapter may work but has some quirks');
      recommendations.push('Proceed with caution and make sure to backup');
    } else if (adapter.spoofingCompatibility === 'low') {
      recommendations.push('This adapter is not recommended for spoofing');
      recommendations.push('Consider using a different model');
    }

    return {
      compatible: adapter.spoofingCompatibility !== 'incompatible',
      level: adapter.spoofingCompatibility,
      reason: adapter.notes || 'See adapter specifications',
      warnings,
      recommendations,
    };
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  static getStatistics(): {
    totalAdapters: number;
    byCompatibility: Record<CompatibilityLevel, number>;
    byChipsetFamily: Record<ChipsetFamily, number>;
    whitelistedCount: number;
  } {
    const byCompatibility: Record<CompatibilityLevel, number> = {
      high: 0,
      medium: 0,
      low: 0,
      incompatible: 0,
    };

    const byChipsetFamily: Record<ChipsetFamily, number> = {
      ASIX: 0,
      Realtek: 0,
      Microchip: 0,
      Other: 0,
    };

    let whitelistedCount = 0;

    ADAPTER_DATABASE.forEach((adapter) => {
      byCompatibility[adapter.spoofingCompatibility]++;
      byChipsetFamily[adapter.chipsetFamily]++;
      if (adapter.mib2Whitelisted) {
        whitelistedCount++;
      }
    });

    return {
      totalAdapters: ADAPTER_DATABASE.length,
      byCompatibility,
      byChipsetFamily,
      whitelistedCount,
    };
  }
}
