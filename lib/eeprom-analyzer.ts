/**
 * Analizador de EEPROM para Adaptadores ASIX AX88772
 * Detecta offsets de VID/PID, identifica versión del chipset, y analiza estructura de memoria
 */

import { usbService, ASIX_VENDOR_ID, DLINK_VENDOR_ID, DLINK_PRODUCT_ID_B1 } from './usb-service';
import { AdapterDatabase, type AdapterSpec } from './adapter-database';

// Offsets típicos para AX88772B/C (pueden variar según fabricante)
export const TYPICAL_VID_OFFSET_LOW = 0x88;
export const TYPICAL_VID_OFFSET_HIGH = 0x89;
export const TYPICAL_PID_OFFSET_LOW = 0x8A;
export const TYPICAL_PID_OFFSET_HIGH = 0x8B;

// Tamaño típico de EEPROM en AX88772
export const EEPROM_SIZE_93C46 = 128; // 64 words x 16 bits
export const EEPROM_SIZE_93C56 = 256; // 128 words x 16 bits
export const EEPROM_SIZE_93C66 = 512; // 256 words x 16 bits

export interface VidPidLocation {
  vidOffsetLow: number;
  vidOffsetHigh: number;
  pidOffsetLow: number;
  pidOffsetHigh: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface EepromAnalysis {
  size: number;
  currentVid: number;
  currentPid: number;
  vidPidLocation: VidPidLocation;
  chipsetVersion: 'AX88772' | 'AX88772A' | 'AX88772B' | 'AX88772C' | 'Unknown';
  hasEfuse: boolean;
  checksumOffset?: number;
  rawData: number[];
  hexDump: string;
  adapterSpec?: AdapterSpec;
  compatibilityReport?: ReturnType<typeof AdapterDatabase.generateCompatibilityReport>;
}

/**
 * Analizador de EEPROM
 */
export class EepromAnalyzer {
  /**
   * Leer y analizar la EEPROM completa del adaptador
   */
  static async analyzeEeprom(): Promise<EepromAnalysis> {
    if (!usbService.isConnected()) {
      throw new Error('No USB device connected');
    }

    const device = usbService.getCurrentDevice();
    if (!device) {
      throw new Error('No device information available');
    }

    // Intentar leer 256 bytes (tamaño más común)
    let rawData: number[];
    try {
      rawData = await usbService.readEeprom(0, EEPROM_SIZE_93C56);
    } catch (error) {
      // Si falla, intentar con 128 bytes
      try {
        rawData = await usbService.readEeprom(0, EEPROM_SIZE_93C46);
      } catch (innerError) {
        throw new Error('Failed to read EEPROM: ' + innerError);
      }
    }

    // Buscar especificaciones en base de datos primero para usar offsets conocidos
    const adapterSpec = AdapterDatabase.findByVidPid(device.vendorId, device.productId);

    // Buscar VID/PID en la memoria
    const vidPidLocation = this.findVidPidOffsets(rawData, device.vendorId, device.productId, adapterSpec);

    // Extraer VID/PID actual
    const currentVid = this.extractWord(
      rawData,
      vidPidLocation.vidOffsetLow,
      vidPidLocation.vidOffsetHigh
    );
    const currentPid = this.extractWord(
      rawData,
      vidPidLocation.pidOffsetLow,
      vidPidLocation.pidOffsetHigh
    );

    // Detectar versión del chipset
    const chipsetVersion = this.detectChipsetVersion(device.productId);

    // Detectar si tiene eFuse (AX88772C)
    const hasEfuse = chipsetVersion === 'AX88772C';

    // Buscar offset de checksum (típicamente últimos 2 bytes)
    const checksumOffset = rawData.length >= 2 ? rawData.length - 2 : undefined;

    // Generar hex dump
    const hexDump = this.generateHexDump(rawData);

    // Generar reporte de compatibilidad
    const compatibilityReport = AdapterDatabase.generateCompatibilityReport(device.vendorId, device.productId);

    return {
      size: rawData.length,
      currentVid,
      currentPid,
      vidPidLocation,
      chipsetVersion,
      hasEfuse,
      checksumOffset,
      rawData,
      hexDump,
      adapterSpec,
      compatibilityReport,
    };
  }

  /**
   * Buscar offsets de VID/PID en la memoria EEPROM
   */
  private static findVidPidOffsets(
    data: number[],
    expectedVid: number,
    expectedPid: number,
    adapterSpec?: AdapterSpec
  ): VidPidLocation {
    // Convertir VID/PID a bytes Little Endian
    const vidLow = expectedVid & 0xFF;
    const vidHigh = (expectedVid >> 8) & 0xFF;
    const pidLow = expectedPid & 0xFF;
    const pidHigh = (expectedPid >> 8) & 0xFF;

    // Si tenemos especificaciones de la base de datos, usar esos offsets primero
    if (adapterSpec && adapterSpec.eepromOffsets) {
      const offsets = adapterSpec.eepromOffsets;
      if (
        data.length > offsets.pidHigh &&
        data[offsets.vidLow] === vidLow &&
        data[offsets.vidHigh] === vidHigh &&
        data[offsets.pidLow] === pidLow &&
        data[offsets.pidHigh] === pidHigh
      ) {
        console.log('[EepromAnalyzer] Using offsets from adapter database');
        return {
          vidOffsetLow: offsets.vidLow,
          vidOffsetHigh: offsets.vidHigh,
          pidOffsetLow: offsets.pidLow,
          pidOffsetHigh: offsets.pidHigh,
          confidence: 'high',
        };
      }
    }

    // Primero intentar con offsets típicos
    if (
      data.length > TYPICAL_PID_OFFSET_HIGH &&
      data[TYPICAL_VID_OFFSET_LOW] === vidLow &&
      data[TYPICAL_VID_OFFSET_HIGH] === vidHigh &&
      data[TYPICAL_PID_OFFSET_LOW] === pidLow &&
      data[TYPICAL_PID_OFFSET_HIGH] === pidHigh
    ) {
      return {
        vidOffsetLow: TYPICAL_VID_OFFSET_LOW,
        vidOffsetHigh: TYPICAL_VID_OFFSET_HIGH,
        pidOffsetLow: TYPICAL_PID_OFFSET_LOW,
        pidOffsetHigh: TYPICAL_PID_OFFSET_HIGH,
        confidence: 'high',
      };
    }

    // Buscar secuencia en toda la memoria
    for (let i = 0; i < data.length - 3; i++) {
      if (
        data[i] === vidLow &&
        data[i + 1] === vidHigh &&
        data[i + 2] === pidLow &&
        data[i + 3] === pidHigh
      ) {
        return {
          vidOffsetLow: i,
          vidOffsetHigh: i + 1,
          pidOffsetLow: i + 2,
          pidOffsetHigh: i + 3,
          confidence: 'medium',
        };
      }
    }

    // Si no se encuentra, usar offsets típicos con baja confianza
    console.warn('[EepromAnalyzer] VID/PID not found in expected locations, using typical offsets');
    return {
      vidOffsetLow: TYPICAL_VID_OFFSET_LOW,
      vidOffsetHigh: TYPICAL_VID_OFFSET_HIGH,
      pidOffsetLow: TYPICAL_PID_OFFSET_LOW,
      pidOffsetHigh: TYPICAL_PID_OFFSET_HIGH,
      confidence: 'low',
    };
  }

  /**
   * Extraer un word (16 bits) de dos bytes en Little Endian
   */
  private static extractWord(data: number[], offsetLow: number, offsetHigh: number): number {
    if (offsetLow >= data.length || offsetHigh >= data.length) {
      return 0;
    }
    return data[offsetLow] | (data[offsetHigh] << 8);
  }

  /**
   * Detectar versión del chipset según Product ID
   */
  private static detectChipsetVersion(productId: number): EepromAnalysis['chipsetVersion'] {
    switch (productId) {
      case 0x7720:
        return 'AX88772';
      case 0x772A:
        return 'AX88772A';
      case 0x772B:
        return 'AX88772B';
      case 0x772C:
        return 'AX88772C';
      default:
        return 'Unknown';
    }
  }

  /**
   * Generar hex dump legible de la memoria EEPROM
   */
  private static generateHexDump(data: number[]): string {
    let dump = '';
    const bytesPerLine = 16;

    for (let i = 0; i < data.length; i += bytesPerLine) {
      // Offset
      dump += `0x${i.toString(16).padStart(4, '0')}:  `;

      // Bytes en hexadecimal
      for (let j = 0; j < bytesPerLine; j++) {
        if (i + j < data.length) {
          dump += data[i + j].toString(16).padStart(2, '0') + ' ';
        } else {
          dump += '   ';
        }

        // Espacio extra en la mitad
        if (j === 7) {
          dump += ' ';
        }
      }

      // Representación ASCII
      dump += ' |';
      for (let j = 0; j < bytesPerLine && i + j < data.length; j++) {
        const byte = data[i + j];
        dump += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
      }
      dump += '|\n';
    }

    return dump;
  }

  /**
   * Calcular checksum simple (suma de todos los bytes)
   */
  static calculateChecksum(data: number[], excludeLastNBytes: number = 2): number {
    let sum = 0;
    const endIndex = data.length - excludeLastNBytes;

    for (let i = 0; i < endIndex; i++) {
      sum += data[i];
    }

    return sum & 0xFFFF; // 16-bit checksum
  }

  /**
   * Validar si el adaptador es compatible para spoofing
   */
  static validateCompatibility(analysis: EepromAnalysis): {
    compatible: boolean;
    reason?: string;
  } {
    // AX88772C tiene eFuse, no es compatible
    if (analysis.hasEfuse) {
      return {
        compatible: false,
        reason: 'AX88772C chipset detected. This version uses eFuse technology which cannot be reprogrammed. Only AX88772A/B are compatible.',
      };
    }

    // Verificar que se encontraron los offsets con confianza razonable
    if (analysis.vidPidLocation.confidence === 'low') {
      return {
        compatible: false,
        reason: 'Could not reliably locate VID/PID in EEPROM memory. The memory map may be non-standard.',
      };
    }

    // Verificar que el VID/PID actual coincide con lo esperado
    if (analysis.currentVid !== ASIX_VENDOR_ID) {
      return {
        compatible: false,
        reason: `Unexpected Vendor ID: 0x${analysis.currentVid.toString(16)}. Expected ASIX (0x${ASIX_VENDOR_ID.toString(16)}).`,
      };
    }

    return {
      compatible: true,
    };
  }

  /**
   * Generar preview de cómo quedaría la EEPROM después del spoofing
   */
  static generateSpoofingPreview(analysis: EepromAnalysis): {
    before: { vid: string; pid: string };
    after: { vid: string; pid: string };
    bytesToModify: Array<{ offset: number; oldValue: number; newValue: number }>;
  } {
    const { vidPidLocation } = analysis;

    // Valores objetivo (D-Link DUB-E100)
    const targetVid = DLINK_VENDOR_ID;
    const targetPid = DLINK_PRODUCT_ID_B1;

    const targetVidLow = targetVid & 0xFF;
    const targetVidHigh = (targetVid >> 8) & 0xFF;
    const targetPidLow = targetPid & 0xFF;
    const targetPidHigh = (targetPid >> 8) & 0xFF;

    const bytesToModify = [
      {
        offset: vidPidLocation.vidOffsetLow,
        oldValue: analysis.rawData[vidPidLocation.vidOffsetLow],
        newValue: targetVidLow,
      },
      {
        offset: vidPidLocation.vidOffsetHigh,
        oldValue: analysis.rawData[vidPidLocation.vidOffsetHigh],
        newValue: targetVidHigh,
      },
      {
        offset: vidPidLocation.pidOffsetLow,
        oldValue: analysis.rawData[vidPidLocation.pidOffsetLow],
        newValue: targetPidLow,
      },
      {
        offset: vidPidLocation.pidOffsetHigh,
        oldValue: analysis.rawData[vidPidLocation.pidOffsetHigh],
        newValue: targetPidHigh,
      },
    ];

    return {
      before: {
        vid: `0x${analysis.currentVid.toString(16).padStart(4, '0')}`,
        pid: `0x${analysis.currentPid.toString(16).padStart(4, '0')}`,
      },
      after: {
        vid: `0x${targetVid.toString(16).padStart(4, '0')}`,
        pid: `0x${targetPid.toString(16).padStart(4, '0')}`,
      },
      bytesToModify,
    };
  }

  /**
   * Formatear información del análisis para mostrar al usuario
   */
  static formatAnalysisReport(analysis: EepromAnalysis): string {
    let report = '=== EEPROM Analysis Report ===\n\n';

    report += `Chipset Version: ${analysis.chipsetVersion}\n`;
    report += `EEPROM Size: ${analysis.size} bytes\n`;
    report += `Current VID: 0x${analysis.currentVid.toString(16).padStart(4, '0')}\n`;
    report += `Current PID: 0x${analysis.currentPid.toString(16).padStart(4, '0')}\n`;
    report += `Has eFuse: ${analysis.hasEfuse ? 'Yes (NOT COMPATIBLE)' : 'No (Compatible)'}\n\n`;

    report += `VID/PID Location:\n`;
    report += `  VID Low Byte:  Offset 0x${analysis.vidPidLocation.vidOffsetLow.toString(16)}\n`;
    report += `  VID High Byte: Offset 0x${analysis.vidPidLocation.vidOffsetHigh.toString(16)}\n`;
    report += `  PID Low Byte:  Offset 0x${analysis.vidPidLocation.pidOffsetLow.toString(16)}\n`;
    report += `  PID High Byte: Offset 0x${analysis.vidPidLocation.pidOffsetHigh.toString(16)}\n`;
    report += `  Confidence: ${analysis.vidPidLocation.confidence}\n\n`;

    if (analysis.checksumOffset) {
      report += `Checksum Offset: 0x${analysis.checksumOffset.toString(16)}\n\n`;
    }

    const compatibility = this.validateCompatibility(analysis);
    report += `Compatibility: ${compatibility.compatible ? 'COMPATIBLE' : 'NOT COMPATIBLE'}\n`;
    if (compatibility.reason) {
      report += `Reason: ${compatibility.reason}\n`;
    }

    return report;
  }
}
