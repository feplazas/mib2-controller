/**
 * MIB2 Compatibility Detection Service
 * 
 * Detects and validates if the connected MIB2 unit is compatible
 * with this application (STD2 Technisat Preh without navigation, 1 SD slot).
 */

export type MIB2UnitType = 
  | 'STD2_TECHNISAT_PREH'  // Compatible - sin navegación, 1 SD slot
  | 'STD2_NAVI'            // No compatible - con navegación
  | 'MIB2_HIGH'            // No compatible - MIB2 High/Discover Pro
  | 'MIB2_ENTRY'           // No compatible - MIB2 Entry
  | 'UNKNOWN';             // No se puede determinar

export type CompatibilityStatus = 
  | 'compatible'
  | 'incompatible'
  | 'unknown'
  | 'checking'
  | 'not_connected';

export interface MIB2UnitInfo {
  unitType: MIB2UnitType;
  compatibilityStatus: CompatibilityStatus;
  firmwareVersion: string | null;
  hardwareVersion: string | null;
  hasNavigation: boolean | null;
  sdSlotCount: number | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  toolboxInstalled: boolean | null;
  toolboxVersion: string | null;
  warnings: string[];
  errors: string[];
}

export interface CompatibilityCheckResult {
  isCompatible: boolean;
  unitInfo: MIB2UnitInfo;
  canProceed: boolean;
  blockingReason: string | null;
}

// Known firmware patterns for STD2 Technisat Preh
const STD2_TECHNISAT_FIRMWARE_PATTERNS = [
  /^T\d{3}$/,           // T480, T482, etc.
  /^MST2_EU_.*$/,       // MST2_EU_xxx
  /^MU-STD2-.*$/,       // MU-STD2-xxx
];

// Known firmware patterns for navigation units (NOT compatible)
const NAVI_FIRMWARE_PATTERNS = [
  /^MHI2.*$/,           // MHI2 (Discover Pro)
  /^CNS.*$/,            // CNS navigation
  /^NAV.*$/,            // Navigation units
  /^1SD.*$/,            // 1SD Navi units
];

// Known hardware identifiers for STD2 Technisat Preh
const STD2_TECHNISAT_HARDWARE = [
  '5F0 035 043',        // Common STD2 part number
  '5F0 035 044',
  '5F0 035 045',
  '5F0 035 046',
  '5F0 035 680',
  '5F0 035 681',
  '5F0 035 682',
  '5F0 035 684',
];

// Hardware identifiers for navigation units (NOT compatible)
const NAVI_HARDWARE = [
  '5F0 035 020',        // Discover Pro
  '5F0 035 021',
  '5F0 035 043 A',      // With navigation suffix
  '5F0 035 043 B',
];

class MIB2CompatibilityService {
  private lastCheckResult: CompatibilityCheckResult | null = null;
  private isChecking = false;

  /**
   * Creates an empty/default unit info object
   */
  private createEmptyUnitInfo(): MIB2UnitInfo {
    return {
      unitType: 'UNKNOWN',
      compatibilityStatus: 'not_connected',
      firmwareVersion: null,
      hardwareVersion: null,
      hasNavigation: null,
      sdSlotCount: null,
      manufacturer: null,
      model: null,
      serialNumber: null,
      toolboxInstalled: null,
      toolboxVersion: null,
      warnings: [],
      errors: [],
    };
  }

  /**
   * Checks compatibility based on firmware version string
   */
  private checkFirmwareCompatibility(firmware: string): { isCompatible: boolean; unitType: MIB2UnitType } {
    // Check for navigation firmware (NOT compatible)
    for (const pattern of NAVI_FIRMWARE_PATTERNS) {
      if (pattern.test(firmware)) {
        return { isCompatible: false, unitType: 'STD2_NAVI' };
      }
    }

    // Check for STD2 Technisat Preh firmware (compatible)
    for (const pattern of STD2_TECHNISAT_FIRMWARE_PATTERNS) {
      if (pattern.test(firmware)) {
        return { isCompatible: true, unitType: 'STD2_TECHNISAT_PREH' };
      }
    }

    // Unknown firmware
    return { isCompatible: false, unitType: 'UNKNOWN' };
  }

  /**
   * Checks compatibility based on hardware version/part number
   */
  private checkHardwareCompatibility(hardware: string): { isCompatible: boolean; hasNavigation: boolean } {
    const normalizedHardware = hardware.replace(/\s+/g, ' ').trim().toUpperCase();

    // Check for navigation hardware (NOT compatible)
    for (const navHw of NAVI_HARDWARE) {
      if (normalizedHardware.includes(navHw.toUpperCase())) {
        return { isCompatible: false, hasNavigation: true };
      }
    }

    // Check for STD2 Technisat Preh hardware (compatible)
    for (const std2Hw of STD2_TECHNISAT_HARDWARE) {
      if (normalizedHardware.includes(std2Hw.toUpperCase())) {
        return { isCompatible: true, hasNavigation: false };
      }
    }

    // Unknown hardware - assume not compatible for safety
    return { isCompatible: false, hasNavigation: false };
  }

  /**
   * Parses unit information from Telnet response
   */
  parseUnitInfoFromTelnet(response: string): Partial<MIB2UnitInfo> {
    const info: Partial<MIB2UnitInfo> = {};

    // Extract firmware version (e.g., "T480", "MST2_EU_xxx")
    const firmwareMatch = response.match(/(?:firmware|sw|version)[:\s]*([A-Z0-9_.-]+)/i);
    if (firmwareMatch) {
      info.firmwareVersion = firmwareMatch[1];
    }

    // Extract hardware version/part number
    const hardwareMatch = response.match(/(?:hardware|hw|part)[:\s]*([A-Z0-9\s.-]+)/i);
    if (hardwareMatch) {
      info.hardwareVersion = hardwareMatch[1].trim();
    }

    // Check for navigation indicators
    if (response.toLowerCase().includes('navigation') || 
        response.toLowerCase().includes('navi') ||
        response.toLowerCase().includes('discover pro')) {
      info.hasNavigation = true;
    }

    // Check for SD slot count
    const sdMatch = response.match(/(\d)\s*(?:sd|slot)/i);
    if (sdMatch) {
      info.sdSlotCount = parseInt(sdMatch[1], 10);
    }

    // Check for Toolbox
    if (response.includes('MIB2-Toolbox') || response.includes('toolbox')) {
      info.toolboxInstalled = true;
      const versionMatch = response.match(/toolbox[:\s]*v?([0-9.]+)/i);
      if (versionMatch) {
        info.toolboxVersion = versionMatch[1];
      }
    }

    return info;
  }

  /**
   * Performs a full compatibility check on the connected MIB2 unit
   */
  async checkCompatibility(
    telnetResponse?: string,
    firmwareVersion?: string,
    hardwareVersion?: string
  ): Promise<CompatibilityCheckResult> {
    this.isChecking = true;
    const unitInfo = this.createEmptyUnitInfo();
    unitInfo.compatibilityStatus = 'checking';

    try {
      // Parse Telnet response if provided
      if (telnetResponse) {
        const parsedInfo = this.parseUnitInfoFromTelnet(telnetResponse);
        Object.assign(unitInfo, parsedInfo);
      }

      // Override with explicit values if provided
      if (firmwareVersion) {
        unitInfo.firmwareVersion = firmwareVersion;
      }
      if (hardwareVersion) {
        unitInfo.hardwareVersion = hardwareVersion;
      }

      // Check firmware compatibility
      if (unitInfo.firmwareVersion) {
        const fwCheck = this.checkFirmwareCompatibility(unitInfo.firmwareVersion);
        unitInfo.unitType = fwCheck.unitType;
        
        if (!fwCheck.isCompatible && fwCheck.unitType === 'STD2_NAVI') {
          unitInfo.hasNavigation = true;
          unitInfo.errors.push('error.unit_has_navigation');
        }
      }

      // Check hardware compatibility
      if (unitInfo.hardwareVersion) {
        const hwCheck = this.checkHardwareCompatibility(unitInfo.hardwareVersion);
        if (hwCheck.hasNavigation) {
          unitInfo.hasNavigation = true;
          unitInfo.errors.push('error.hardware_has_navigation');
        }
      }

      // Check SD slot count
      if (unitInfo.sdSlotCount !== null && unitInfo.sdSlotCount > 1) {
        unitInfo.warnings.push('warning.multiple_sd_slots');
      }

      // Determine final compatibility status
      let isCompatible = false;
      let canProceed = false;
      let blockingReason: string | null = null;

      if (unitInfo.unitType === 'STD2_TECHNISAT_PREH' && !unitInfo.hasNavigation) {
        isCompatible = true;
        canProceed = true;
        unitInfo.compatibilityStatus = 'compatible';
      } else if (unitInfo.hasNavigation) {
        isCompatible = false;
        canProceed = false;
        blockingReason = 'error.navigation_unit_not_supported';
        unitInfo.compatibilityStatus = 'incompatible';
      } else if (unitInfo.unitType === 'UNKNOWN') {
        isCompatible = false;
        canProceed = true; // Allow with warning
        unitInfo.warnings.push('warning.unknown_unit_type');
        unitInfo.compatibilityStatus = 'unknown';
      } else {
        isCompatible = false;
        canProceed = false;
        blockingReason = 'error.incompatible_unit_type';
        unitInfo.compatibilityStatus = 'incompatible';
      }

      // Add warning if Toolbox not installed
      if (unitInfo.toolboxInstalled === false) {
        unitInfo.warnings.push('warning.toolbox_not_installed');
      }

      const result: CompatibilityCheckResult = {
        isCompatible,
        unitInfo,
        canProceed,
        blockingReason,
      };

      this.lastCheckResult = result;
      return result;

    } catch (error) {
      unitInfo.compatibilityStatus = 'unknown';
      unitInfo.errors.push('error.compatibility_check_failed');
      
      return {
        isCompatible: false,
        unitInfo,
        canProceed: false,
        blockingReason: 'error.compatibility_check_failed',
      };
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Quick check based only on firmware version string
   */
  quickCheckByFirmware(firmwareVersion: string): CompatibilityStatus {
    const result = this.checkFirmwareCompatibility(firmwareVersion);
    
    if (result.isCompatible) {
      return 'compatible';
    } else if (result.unitType === 'STD2_NAVI' || result.unitType === 'MIB2_HIGH') {
      return 'incompatible';
    } else {
      return 'unknown';
    }
  }

  /**
   * Returns the last check result
   */
  getLastCheckResult(): CompatibilityCheckResult | null {
    return this.lastCheckResult;
  }

  /**
   * Returns whether a check is currently in progress
   */
  isCheckInProgress(): boolean {
    return this.isChecking;
  }

  /**
   * Clears the cached check result
   */
  clearCache(): void {
    this.lastCheckResult = null;
  }

  /**
   * Returns a user-friendly description of the unit type
   */
  getUnitTypeDescription(unitType: MIB2UnitType): string {
    switch (unitType) {
      case 'STD2_TECHNISAT_PREH':
        return 'MIB2 STD2 Technisat Preh (Compatible)';
      case 'STD2_NAVI':
        return 'MIB2 STD2 with Navigation (Not Compatible)';
      case 'MIB2_HIGH':
        return 'MIB2 High / Discover Pro (Not Compatible)';
      case 'MIB2_ENTRY':
        return 'MIB2 Entry (Not Compatible)';
      case 'UNKNOWN':
      default:
        return 'Unknown MIB2 Unit';
    }
  }
}

export const mib2CompatibilityService = new MIB2CompatibilityService();
export default mib2CompatibilityService;
