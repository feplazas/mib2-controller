/**
 * Validador de Configuraciones y Sistema de Advertencias de Seguridad
 * Basado en el documento técnico MIB2Acceso.pdf
 */

export type HardwareVersion = '790' | '790A' | '790B' | '790B+' | 'unknown';
export type FirmwareVersion = 'T480' | 'T490' | 'T500' | 'unknown';
export type ValidationLevel = 'pass' | 'warning' | 'error' | 'critical';

export interface HardwareInfo {
  partNumber: string;
  version: HardwareVersion;
  description: string;
  capabilities: string[];
  limitations?: string[];
}

export interface FirmwareInfo {
  version: FirmwareVersion;
  buildDate?: string;
  features: string[];
  knownIssues?: string[];
}

export interface ValidationResult {
  level: ValidationLevel;
  title: string;
  message: string;
  recommendations?: string[];
  technicalDetails?: string;
}

/**
 * Base de datos de hardware conocido
 */
export const KNOWN_HARDWARE: Record<string, HardwareInfo> = {
  '5F0920790': {
    partNumber: '5F0 920 790',
    version: '790',
    description: 'MIB2 STD2 Base (sin letra)',
    capabilities: [
      'Cuadro digital básico',
      'Compatible con skin Carbono (Variante 2)',
      'Soporte para modificaciones VCDS estándar',
    ],
  },
  '5F0920790A': {
    partNumber: '5F0 920 790 A',
    version: '790A',
    description: 'MIB2 STD2 Revisión A',
    capabilities: [
      'Cuadro digital mejorado',
      'Compatible con skin Carbono (Variante 2)',
      'Soporte completo para VCDS',
    ],
  },
  '5F0920790B': {
    partNumber: '5F0 920 790 B',
    version: '790B',
    description: 'MIB2 STD2 Revisión B',
    capabilities: [
      'Cuadro digital avanzado',
      'Compatible con skins Carbono y Cupra (Variantes 2 y 3)',
      'Soporte completo para VCDS',
    ],
  },
  '5F0920790B+': {
    partNumber: '5F0 920 790 B+',
    version: '790B+',
    description: 'MIB2 STD2 Revisión B+ (Vista Sport)',
    capabilities: [
      'Cuadro digital con Vista Sport',
      'Compatible con todos los skins',
      'Soporte completo para VCDS',
      'Performance Monitor nativo',
    ],
  },
};

/**
 * Información de firmware conocido
 */
export const KNOWN_FIRMWARE: Record<string, FirmwareInfo> = {
  T480: {
    version: 'T480',
    features: [
      'Soporte para MIB2 Toolbox',
      'Compatible con códigos FEC',
      'Modificaciones VCDS estándar',
    ],
    knownIssues: [
      'Algunas unidades 1-SD carecen de rutinas de validación de firmas',
    ],
  },
  T490: {
    version: 'T490',
    features: [
      'Soporte mejorado para MIB2 Toolbox',
      'Compatible con códigos FEC',
      'Modificaciones VCDS completas',
    ],
  },
  T500: {
    version: 'T500',
    features: [
      'Última versión estable',
      'Soporte completo para MIB2 Toolbox',
      'Compatible con códigos FEC',
      'Modificaciones VCDS completas',
    ],
  },
};

/**
 * Validar compatibilidad de hardware
 */
export function validateHardware(partNumber: string): ValidationResult {
  const hardware = KNOWN_HARDWARE[partNumber.replace(/\s/g, '')];
  
  if (!hardware) {
    return {
      level: 'warning',
      title: 'Hardware Desconocido',
      message: `El número de parte "${partNumber}" no está en la base de datos de hardware conocido.`,
      recommendations: [
        'Verificar el número de parte en la etiqueta de la unidad',
        'Consultar el manual del vehículo para confirmar la versión',
        'Proceder con precaución al aplicar modificaciones',
      ],
      technicalDetails: 'Las modificaciones pueden funcionar, pero no hay garantía de compatibilidad completa.',
    };
  }

  if (hardware.limitations && hardware.limitations.length > 0) {
    return {
      level: 'warning',
      title: 'Hardware con Limitaciones',
      message: `Hardware ${hardware.description} identificado con limitaciones conocidas.`,
      recommendations: hardware.limitations,
      technicalDetails: `Capacidades: ${hardware.capabilities.join(', ')}`,
    };
  }

  return {
    level: 'pass',
    title: 'Hardware Compatible',
    message: `Hardware ${hardware.description} identificado correctamente.`,
    recommendations: [`Capacidades disponibles: ${hardware.capabilities.join(', ')}`],
  };
}

/**
 * Validar versión de firmware
 */
export function validateFirmware(version: string): ValidationResult {
  const firmware = KNOWN_FIRMWARE[version.toUpperCase()];
  
  if (!firmware) {
    return {
      level: 'warning',
      title: 'Firmware Desconocido',
      message: `La versión de firmware "${version}" no está en la base de datos.`,
      recommendations: [
        'Verificar la versión de firmware en el menú del sistema',
        'Consultar la documentación oficial de VW',
        'Considerar actualizar a una versión conocida',
      ],
    };
  }

  if (firmware.knownIssues && firmware.knownIssues.length > 0) {
    return {
      level: 'warning',
      title: 'Firmware con Problemas Conocidos',
      message: `Firmware ${firmware.version} tiene problemas conocidos.`,
      recommendations: firmware.knownIssues,
      technicalDetails: `Características: ${firmware.features.join(', ')}`,
    };
  }

  return {
    level: 'pass',
    title: 'Firmware Compatible',
    message: `Firmware ${firmware.version} identificado correctamente.`,
    recommendations: [`Características disponibles: ${firmware.features.join(', ')}`],
  };
}

/**
 * Validar código FEC antes de inyección
 */
export function validateFECInjection(fecCodes: string[], hardwareVersion: HardwareVersion, firmwareVersion: FirmwareVersion): ValidationResult {
  // Validar que el hardware soporte códigos FEC
  if (hardwareVersion === 'unknown') {
    return {
      level: 'error',
      title: 'Hardware No Identificado',
      message: 'No se puede validar la compatibilidad de códigos FEC sin identificar el hardware.',
      recommendations: [
        'Identificar el número de parte del hardware',
        'Verificar la compatibilidad antes de inyectar códigos',
      ],
    };
  }

  // Validar que el firmware soporte el método de inyección
  if (firmwareVersion === 'unknown') {
    return {
      level: 'warning',
      title: 'Firmware No Identificado',
      message: 'No se puede garantizar que el método de inyección funcione con este firmware.',
      recommendations: [
        'Identificar la versión de firmware',
        'Verificar que el MIB2 Toolbox esté instalado',
        'Realizar backup antes de proceder',
      ],
    };
  }

  // Advertencia sobre el método de parcheo
  return {
    level: 'warning',
    title: 'Validación de Inyección FEC',
    message: 'La inyección de códigos FEC sortea la validación de firmware digital de VW AG.',
    recommendations: [
      'Asegurarse de que el MIB2 Toolbox esté instalado',
      'Verificar que el sistema esté parcheado (tsd.mibstd2.system.swap)',
      'Crear ExceptionList.txt con los códigos seleccionados',
      'Realizar backup completo antes de proceder',
    ],
    technicalDetails: 'El método de parcheo modifica el binario del sistema para alterar la rutina de verificación de firmas. Una vez parcheado, el sistema consulta la ExceptionList.txt generada por el usuario.',
  };
}

/**
 * Advertencias críticas de seguridad por procedimiento
 */
export const CRITICAL_SAFETY_WARNINGS: Record<string, ValidationResult> = {
  xds_strong: {
    level: 'critical',
    title: '⚠️ ADVERTENCIA CRÍTICA: XDS+ en Modo "Strong"',
    message: 'NO configurar el XDS+ en modo "Strong" (Stark). Este ajuste genera desgaste parasitario de frenos y estrés térmico sin beneficios tangibles.',
    recommendations: [
      'Las temperaturas del disco pueden superar 600°C-700°C',
      'El líquido de frenos puede alcanzar su punto de ebullición (vapor lock)',
      'El desgaste se acelera exponencialmente',
      'Un juego de pastillas puede destruirse en una sola sesión de pista',
      'En vehículos con VAQ, genera un bucle de control conflictivo',
    ],
    technicalDetails: 'Configuración recomendada: "Standard" (Estándar). El XDS+ debe actuar solo como red de seguridad de último recurso, no como sistema de vectorización primario.',
  },
  vaq_traction: {
    level: 'warning',
    title: 'Recomendación: VAQ Tracción Aumentada',
    message: 'Para maximizar tracción, ajustar el VAQ a "Tracción Aumentada" en lugar de modificar XDS+.',
    recommendations: [
      'Permite un bloqueo más agresivo y rápido de los discos del embrague',
      'Sacrifica suavidad acústica a cambio de mayor rendimiento',
      'El VAQ es mecánicamente superior y térmicamente eficiente',
      'Pueden escucharse crujidos o arrastre de neumáticos en giros cerrados a baja velocidad',
    ],
    technicalDetails: 'El VAQ (Vorderachsquersperre) es el diferencial de deslizamiento limitado electrohidráulico situado entre la caja del diferencial y el semieje derecho.',
  },
  vista_sport_limitation: {
    level: 'warning',
    title: 'Limitación: Vista Sport',
    message: 'La Vista Sport solo está disponible en unidades de hardware 790 B+.',
    recommendations: [
      'Verificar el número de parte del hardware antes de intentar activar',
      'En unidades 790, 790A o 790B sin el sufijo "+", la Vista Sport no estará disponible',
      'Considerar actualización de hardware si se requiere esta función',
    ],
    technicalDetails: 'La Vista Sport es una característica de hardware que requiere el cuadro digital específico de la revisión B+.',
  },
  emmc_access_warning: {
    level: 'critical',
    title: '⚠️ ADVERTENCIA CRÍTICA: Acceso Directo eMMC',
    message: 'El acceso directo al chip eMMC es un método avanzado que puede dañar permanentemente la unidad.',
    recommendations: [
      'Requiere habilidades avanzadas de microsoldadura',
      'Puede anular la garantía',
      'Riesgo de "brickear" la unidad permanentemente',
      'Solo para usuarios con experiencia en electrónica',
      'Último recurso cuando otros métodos fallan',
    ],
    technicalDetails: 'Este método implica soldadura directa a los pines del chip eMMC para acceder a la memoria no volátil. Ofrece control total pero es destructivo potencialmente.',
  },
};

/**
 * Obtener advertencia de seguridad por ID
 */
export function getSafetyWarning(id: string): ValidationResult | undefined {
  return CRITICAL_SAFETY_WARNINGS[id];
}

/**
 * Validar configuración completa antes de aplicar modificaciones
 */
export function validateConfiguration(
  hardwarePartNumber: string,
  firmwareVersion: string,
  procedureId: string
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Validar hardware
  results.push(validateHardware(hardwarePartNumber));

  // Validar firmware
  results.push(validateFirmware(firmwareVersion));

  // Agregar advertencias específicas del procedimiento
  if (procedureId === 'xds_control') {
    results.push(CRITICAL_SAFETY_WARNINGS.xds_strong);
  }

  if (procedureId === 'vaq_optimization') {
    results.push(CRITICAL_SAFETY_WARNINGS.vaq_traction);
  }

  return results;
}

/**
 * Generar reporte de validación
 */
export function generateValidationReport(results: ValidationResult[]): string {
  const report = `# Reporte de Validación de Configuración
# Generado por MIB2 Controller
# Fecha: ${new Date().toISOString()}

## Resumen

Total de validaciones: ${results.length}
- Críticas: ${results.filter(r => r.level === 'critical').length}
- Errores: ${results.filter(r => r.level === 'error').length}
- Advertencias: ${results.filter(r => r.level === 'warning').length}
- Aprobadas: ${results.filter(r => r.level === 'pass').length}

## Detalles

${results.map((result, index) => `
### ${index + 1}. ${result.title} [${result.level.toUpperCase()}]

${result.message}

${result.recommendations ? `**Recomendaciones:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}` : ''}

${result.technicalDetails ? `**Detalles Técnicos:**\n${result.technicalDetails}` : ''}
`).join('\n---\n')}

## Conclusión

${results.some(r => r.level === 'critical' || r.level === 'error') 
  ? '⚠️ Se encontraron problemas críticos o errores. Revisar las recomendaciones antes de proceder.' 
  : results.some(r => r.level === 'warning')
  ? '⚠️ Se encontraron advertencias. Proceder con precaución.'
  : '✅ Todas las validaciones pasaron correctamente.'}
`;

  return report;
}
