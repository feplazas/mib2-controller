/**
 * Safety Configuration Validator and Warning System
 * Based on MIB2Acceso.pdf technical document
 */

export type HardwareVersion = '790' | '790A' | '790B' | '790B+' | 'unknown';
export type FirmwareVersion = 'T480' | 'T490' | 'T500' | 'unknown';
export type ValidationLevel = 'pass' | 'warning' | 'error' | 'critical';

export interface HardwareInfo {
  partNumber: string;
  version: HardwareVersion;
  descriptionKey: string;
  capabilityKeys: string[];
  limitationKeys?: string[];
}

export interface FirmwareInfo {
  version: FirmwareVersion;
  buildDate?: string;
  featureKeys: string[];
  knownIssueKeys?: string[];
}

export interface ValidationResult {
  level: ValidationLevel;
  titleKey: string;
  messageKey: string;
  recommendationKeys?: string[];
  technicalDetailsKey?: string;
  // Dynamic values for interpolation
  values?: Record<string, string>;
}

/**
 * Known hardware database
 */
export const KNOWN_HARDWARE: Record<string, HardwareInfo> = {
  '5F0920790': {
    partNumber: '5F0 920 790',
    version: '790',
    descriptionKey: 'safety.hw_790_desc',
    capabilityKeys: [
      'safety.cap_basic_digital',
      'safety.cap_carbon_skin_v2',
      'safety.cap_vcds_standard',
    ],
  },
  '5F0920790A': {
    partNumber: '5F0 920 790 A',
    version: '790A',
    descriptionKey: 'safety.hw_790a_desc',
    capabilityKeys: [
      'safety.cap_improved_digital',
      'safety.cap_carbon_skin_v2',
      'safety.cap_vcds_full',
    ],
  },
  '5F0920790B': {
    partNumber: '5F0 920 790 B',
    version: '790B',
    descriptionKey: 'safety.hw_790b_desc',
    capabilityKeys: [
      'safety.cap_advanced_digital',
      'safety.cap_carbon_cupra_skins',
      'safety.cap_vcds_full',
    ],
  },
  '5F0920790B+': {
    partNumber: '5F0 920 790 B+',
    version: '790B+',
    descriptionKey: 'safety.hw_790b_plus_desc',
    capabilityKeys: [
      'safety.cap_vista_sport_digital',
      'safety.cap_all_skins',
      'safety.cap_vcds_full',
      'safety.cap_native_perf_monitor',
    ],
  },
};

/**
 * Known firmware information
 */
export const KNOWN_FIRMWARE: Record<string, FirmwareInfo> = {
  T480: {
    version: 'T480',
    featureKeys: [
      'safety.feat_toolbox_support',
      'safety.feat_fec_compatible',
      'safety.feat_vcds_standard',
    ],
    knownIssueKeys: [
      'safety.issue_1sd_no_signature',
    ],
  },
  T490: {
    version: 'T490',
    featureKeys: [
      'safety.feat_toolbox_improved',
      'safety.feat_fec_compatible',
      'safety.feat_vcds_full',
    ],
  },
  T500: {
    version: 'T500',
    featureKeys: [
      'safety.feat_latest_stable',
      'safety.feat_toolbox_full',
      'safety.feat_fec_compatible',
      'safety.feat_vcds_full',
    ],
  },
};

/**
 * Validate hardware compatibility
 */
export function validateHardware(partNumber: string): ValidationResult {
  const hardware = KNOWN_HARDWARE[partNumber.replace(/\s/g, '')];
  
  if (!hardware) {
    return {
      level: 'warning',
      titleKey: 'safety.unknown_hardware_title',
      messageKey: 'safety.unknown_hardware_message',
      recommendationKeys: [
        'safety.rec_verify_part_number',
        'safety.rec_check_manual',
        'safety.rec_proceed_caution',
      ],
      technicalDetailsKey: 'safety.unknown_hardware_details',
      values: { partNumber },
    };
  }

  if (hardware.limitationKeys && hardware.limitationKeys.length > 0) {
    return {
      level: 'warning',
      titleKey: 'safety.limited_hardware_title',
      messageKey: 'safety.limited_hardware_message',
      recommendationKeys: hardware.limitationKeys,
      technicalDetailsKey: 'safety.hardware_capabilities',
      values: { description: hardware.descriptionKey },
    };
  }

  return {
    level: 'pass',
    titleKey: 'safety.compatible_hardware_title',
    messageKey: 'safety.compatible_hardware_message',
    recommendationKeys: hardware.capabilityKeys,
    values: { description: hardware.descriptionKey },
  };
}

/**
 * Validate firmware version
 */
export function validateFirmware(version: string): ValidationResult {
  const firmware = KNOWN_FIRMWARE[version.toUpperCase()];
  
  if (!firmware) {
    return {
      level: 'warning',
      titleKey: 'safety.unknown_firmware_title',
      messageKey: 'safety.unknown_firmware_message',
      recommendationKeys: [
        'safety.rec_verify_firmware',
        'safety.rec_check_vw_docs',
        'safety.rec_consider_update',
      ],
      values: { version },
    };
  }

  if (firmware.knownIssueKeys && firmware.knownIssueKeys.length > 0) {
    return {
      level: 'warning',
      titleKey: 'safety.firmware_issues_title',
      messageKey: 'safety.firmware_issues_message',
      recommendationKeys: firmware.knownIssueKeys,
      technicalDetailsKey: 'safety.firmware_features',
      values: { version: firmware.version },
    };
  }

  return {
    level: 'pass',
    titleKey: 'safety.compatible_firmware_title',
    messageKey: 'safety.compatible_firmware_message',
    recommendationKeys: firmware.featureKeys,
    values: { version: firmware.version },
  };
}

/**
 * Validate FEC code before injection
 */
export function validateFECInjection(fecCodes: string[], hardwareVersion: HardwareVersion, firmwareVersion: FirmwareVersion): ValidationResult {
  if (hardwareVersion === 'unknown') {
    return {
      level: 'error',
      titleKey: 'safety.unidentified_hardware_title',
      messageKey: 'safety.unidentified_hardware_message',
      recommendationKeys: [
        'safety.rec_identify_hardware',
        'safety.rec_verify_compatibility',
      ],
    };
  }

  if (firmwareVersion === 'unknown') {
    return {
      level: 'warning',
      titleKey: 'safety.unidentified_firmware_title',
      messageKey: 'safety.unidentified_firmware_message',
      recommendationKeys: [
        'safety.rec_identify_firmware',
        'safety.rec_verify_toolbox',
        'safety.rec_backup_first',
      ],
    };
  }

  return {
    level: 'warning',
    titleKey: 'safety.fec_validation_title',
    messageKey: 'safety.fec_validation_message',
    recommendationKeys: [
      'safety.rec_ensure_toolbox',
      'safety.rec_verify_patch',
      'safety.rec_create_exception_list',
      'safety.rec_full_backup',
    ],
    technicalDetailsKey: 'safety.fec_technical_details',
  };
}

/**
 * Critical safety warnings by procedure
 */
export const CRITICAL_SAFETY_WARNINGS: Record<string, ValidationResult> = {
  xds_strong: {
    level: 'critical',
    titleKey: 'safety.xds_strong_title',
    messageKey: 'safety.xds_strong_message',
    recommendationKeys: [
      'safety.xds_temp_warning',
      'safety.xds_brake_fluid_warning',
      'safety.xds_wear_warning',
      'safety.xds_pads_warning',
      'safety.xds_vaq_conflict',
    ],
    technicalDetailsKey: 'safety.xds_technical',
  },
  vaq_traction: {
    level: 'warning',
    titleKey: 'safety.vaq_traction_title',
    messageKey: 'safety.vaq_traction_message',
    recommendationKeys: [
      'safety.vaq_aggressive_lock',
      'safety.vaq_acoustic_tradeoff',
      'safety.vaq_mechanical_superior',
      'safety.vaq_noise_warning',
    ],
    technicalDetailsKey: 'safety.vaq_technical',
  },
  vista_sport_limitation: {
    level: 'warning',
    titleKey: 'safety.vista_sport_title',
    messageKey: 'safety.vista_sport_message',
    recommendationKeys: [
      'safety.vista_verify_hardware',
      'safety.vista_not_available',
      'safety.vista_consider_upgrade',
    ],
    technicalDetailsKey: 'safety.vista_technical',
  },
  emmc_access_warning: {
    level: 'critical',
    titleKey: 'safety.emmc_access_title',
    messageKey: 'safety.emmc_access_message',
    recommendationKeys: [
      'safety.emmc_microsolder_required',
      'safety.emmc_warranty_void',
      'safety.emmc_brick_risk',
      'safety.emmc_expert_only',
      'safety.emmc_last_resort',
    ],
    technicalDetailsKey: 'safety.emmc_technical',
  },
};

/**
 * Get safety warning by ID
 */
export function getSafetyWarning(id: string): ValidationResult | undefined {
  return CRITICAL_SAFETY_WARNINGS[id];
}

/**
 * Validate complete configuration before applying modifications
 */
export function validateConfiguration(
  hardwarePartNumber: string,
  firmwareVersion: string,
  procedureId: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  results.push(validateHardware(hardwarePartNumber));
  results.push(validateFirmware(firmwareVersion));

  if (procedureId === 'xds_control') {
    results.push(CRITICAL_SAFETY_WARNINGS.xds_strong);
  }

  if (procedureId === 'vaq_optimization') {
    results.push(CRITICAL_SAFETY_WARNINGS.vaq_traction);
  }

  return results;
}

/**
 * Generate validation report (returns key-based structure for translation)
 */
export function generateValidationReport(results: ValidationResult[]): {
  headerKey: string;
  summaryKey: string;
  counts: { critical: number; error: number; warning: number; pass: number };
  results: ValidationResult[];
  conclusionKey: string;
} {
  const counts = {
    critical: results.filter(r => r.level === 'critical').length,
    error: results.filter(r => r.level === 'error').length,
    warning: results.filter(r => r.level === 'warning').length,
    pass: results.filter(r => r.level === 'pass').length,
  };

  let conclusionKey = 'safety.conclusion_all_pass';
  if (counts.critical > 0 || counts.error > 0) {
    conclusionKey = 'safety.conclusion_critical';
  } else if (counts.warning > 0) {
    conclusionKey = 'safety.conclusion_warnings';
  }

  return {
    headerKey: 'safety.report_header',
    summaryKey: 'safety.report_summary',
    counts,
    results,
    conclusionKey,
  };
}
