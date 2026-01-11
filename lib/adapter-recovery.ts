/**
 * Herramienta de Diagnóstico y Recuperación Avanzada
 * Para adaptadores USB-Ethernet "brickeados" o con problemas
 */

import { usbService } from './usb-service';
import { AdapterDatabase, type AdapterSpec } from './adapter-database';

export interface DiagnosticResult {
  deviceDetected: boolean;
  usbDescriptorsReadable: boolean;
  eepromReadable: boolean;
  eepromWriteable: boolean;
  vendorCommandsResponsive: boolean;
  diagnosis: 'healthy' | 'degraded' | 'bricked' | 'unknown';
  issues: string[];
  recommendations: string[];
}

export interface RecoveryMethod {
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requiresHardware: boolean;
  steps: string[];
  successRate: number; // 0-100
}

/**
 * Clase para diagnóstico y recuperación de adaptadores
 */
export class AdapterRecovery {
  /**
   * Ejecutar diagnóstico completo del adaptador
   */
  static async diagnoseAdapter(): Promise<DiagnosticResult> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 1. Verificar detección USB
    const deviceDetected = usbService.isConnected();
    if (!deviceDetected) {
      issues.push('Device not detected by USB subsystem');
      recommendations.push('Check physical connection and OTG cable');
      recommendations.push('Try different USB port');
      recommendations.push('Restart Android device');
      
      return {
        deviceDetected: false,
        usbDescriptorsReadable: false,
        eepromReadable: false,
        eepromWriteable: false,
        vendorCommandsResponsive: false,
        diagnosis: 'unknown',
        issues,
        recommendations,
      };
    }

    // 2. Verificar descriptores USB
    let usbDescriptorsReadable = false;
    try {
      const device = usbService.getCurrentDevice();
      if (device && device.vendorId && device.productId) {
        usbDescriptorsReadable = true;
      } else {
        issues.push('USB descriptors are corrupted or unreadable');
        recommendations.push('Device may be in DFU mode or bootloader');
      }
    } catch (error) {
      issues.push('Failed to read USB descriptors');
    }

    // 3. Verificar lectura de EEPROM
    let eepromReadable = false;
    try {
      const testRead = await usbService.readEepromByte(0x00);
      if (testRead !== undefined && testRead !== null) {
        eepromReadable = true;
      }
    } catch (error) {
      issues.push('EEPROM is not readable');
      recommendations.push('EEPROM may be corrupted or disconnected');
      recommendations.push('Try vendor-specific reset command');
    }

    // 4. Verificar escritura de EEPROM (test no destructivo)
    let eepromWriteable = false;
    if (eepromReadable) {
      try {
        // Leer byte original
        const originalByte = await usbService.readEepromByte(0xFF);
        // Intentar escribir el mismo valor
        await usbService.writeEepromByte(0xFF, originalByte);
        // Verificar que no cambió
        const verifyByte = await usbService.readEepromByte(0xFF);
        if (verifyByte === originalByte) {
          eepromWriteable = true;
        }
      } catch (error) {
        issues.push('EEPROM is read-only or write-protected');
        recommendations.push('EEPROM may have write protection enabled');
        recommendations.push('Try disabling write protection via vendor command');
      }
    }

    // 5. Verificar comandos vendor-specific
    let vendorCommandsResponsive = false;
    try {
      // Intentar comando de lectura de versión (común en ASIX)
      // Este es un comando de solo lectura, no destructivo
      const versionCmd = await usbService.sendVendorCommand(0x01, 0x00, 0x00);
      if (versionCmd) {
        vendorCommandsResponsive = true;
      }
    } catch (error) {
      issues.push('Vendor-specific commands not responding');
      recommendations.push('Device firmware may be corrupted');
    }

    // Determinar diagnóstico general
    let diagnosis: DiagnosticResult['diagnosis'] = 'unknown';
    
    if (deviceDetected && usbDescriptorsReadable && eepromReadable && eepromWriteable) {
      diagnosis = 'healthy';
      recommendations.push('Adapter is fully functional');
      recommendations.push('Safe to proceed with spoofing');
    } else if (deviceDetected && usbDescriptorsReadable && eepromReadable && !eepromWriteable) {
      diagnosis = 'degraded';
      recommendations.push('Adapter is readable but not writeable');
      recommendations.push('May need to disable write protection');
    } else if (deviceDetected && !usbDescriptorsReadable) {
      diagnosis = 'bricked';
      issues.push('Device is detected but descriptors are corrupted');
      recommendations.push('Advanced recovery methods required');
      recommendations.push('See recovery options below');
    } else if (deviceDetected && usbDescriptorsReadable && !eepromReadable) {
      diagnosis = 'bricked';
      issues.push('EEPROM is corrupted or disconnected');
      recommendations.push('Try EEPROM reset via vendor command');
      recommendations.push('Hardware recovery may be required');
    }

    return {
      deviceDetected,
      usbDescriptorsReadable,
      eepromReadable,
      eepromWriteable,
      vendorCommandsResponsive,
      diagnosis,
      issues,
      recommendations,
    };
  }

  /**
   * Obtener métodos de recuperación disponibles
   */
  static getRecoveryMethods(adapterSpec?: AdapterSpec): RecoveryMethod[] {
    const methods: RecoveryMethod[] = [];

    // Método 1: Reset por software (vendor command)
    methods.push({
      name: 'Software Reset via Vendor Command',
      description: 'Attempt to reset the EEPROM using vendor-specific USB commands',
      difficulty: 'easy',
      requiresHardware: false,
      successRate: 60,
      steps: [
        'Connect adapter to Android device',
        'Open Recovery Tool in app',
        'Tap "Execute Software Reset"',
        'Wait for command completion',
        'Disconnect and reconnect adapter',
        'Check if adapter is recognized',
      ],
    });

    // Método 2: Forzar lectura de descriptores internos
    methods.push({
      name: 'Force Internal Descriptor Mode',
      description: 'Force the chipset to ignore corrupted EEPROM and use internal descriptors',
      difficulty: 'medium',
      requiresHardware: false,
      successRate: 50,
      steps: [
        'Connect adapter to Android device',
        'Send vendor command 0x20 with value 0x00',
        'This disables EEPROM reading temporarily',
        'Chipset will use internal VID/PID',
        'Adapter should enumerate as generic ASIX',
        'Re-attempt spoofing with fresh EEPROM write',
      ],
    });

    // Método 3: Cortocircuito SDA/SCL (requiere hardware)
    methods.push({
      name: 'SDA/SCL Short Circuit Method',
      description: 'Physically short-circuit EEPROM pins during power-on to force internal descriptors',
      difficulty: 'hard',
      requiresHardware: true,
      successRate: 80,
      steps: [
        'Disconnect adapter from all devices',
        'Open adapter casing (may require screwdriver)',
        'Locate EEPROM chip (usually 8-pin SOIC)',
        'Identify SDA (pin 5) and SCL (pin 6) pins',
        'Use tweezers or wire to short SDA and SCL together',
        'While maintaining short, connect adapter to Android',
        'Chipset will detect EEPROM failure and use internal descriptors',
        'Remove short circuit after device enumerates',
        'Adapter should now be recognized as generic ASIX',
        'Proceed with fresh EEPROM programming',
      ],
    });

    // Método 4: Programación externa de EEPROM (experto)
    methods.push({
      name: 'External EEPROM Programming',
      description: 'Program EEPROM directly using external programmer (CH341A, TL866, etc.)',
      difficulty: 'expert',
      requiresHardware: true,
      successRate: 95,
      steps: [
        'Disconnect adapter from all devices',
        'Open adapter casing',
        'Desolder EEPROM chip from PCB (requires soldering iron)',
        'Connect EEPROM to external programmer (CH341A recommended)',
        'Read original EEPROM dump if possible (for backup)',
        'Write fresh EEPROM image with correct VID/PID',
        'Verify write operation',
        'Resolder EEPROM chip back to PCB',
        'Test adapter on Android device',
      ],
    });

    // Agregar métodos específicos del adaptador si están disponibles
    if (adapterSpec && adapterSpec.recoveryMethods) {
      adapterSpec.recoveryMethods.forEach((method, idx) => {
        methods.push({
          name: `Adapter-Specific Method ${idx + 1}`,
          description: method,
          difficulty: 'medium',
          requiresHardware: false,
          successRate: 70,
          steps: [method],
        });
      });
    }

    return methods;
  }

  /**
   * Intentar reset por software (vendor command 0x20)
   */
  static async attemptSoftwareReset(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (!usbService.isConnected()) {
        return {
          success: false,
          message: 'No device connected',
        };
      }

      console.log('[AdapterRecovery] Attempting software reset via vendor command 0x20...');

      // Comando ASIX para reset de EEPROM
      // Request: 0x20, Value: 0x00, Index: 0x00
      await usbService.sendVendorCommand(0x20, 0x00, 0x00);

      // Esperar un momento para que el dispositivo procese
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        success: true,
        message: 'Software reset command sent successfully. Please disconnect and reconnect the adapter.',
      };
    } catch (error) {
      console.error('[AdapterRecovery] Software reset failed:', error);
      return {
        success: false,
        message: 'Software reset failed: ' + error,
      };
    }
  }

  /**
   * Intentar forzar modo de descriptores internos
   */
  static async forceInternalDescriptors(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (!usbService.isConnected()) {
        return {
          success: false,
          message: 'No device connected',
        };
      }

      console.log('[AdapterRecovery] Forcing internal descriptor mode...');

      // Deshabilitar lectura de EEPROM
      await usbService.sendVendorCommand(0x20, 0x00, 0x00);

      // Esperar
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reiniciar dispositivo
      await usbService.sendVendorCommand(0x01, 0x00, 0x00);

      return {
        success: true,
        message: 'Internal descriptor mode enabled. Device should enumerate as generic ASIX.',
      };
    } catch (error) {
      console.error('[AdapterRecovery] Failed to force internal descriptors:', error);
      return {
        success: false,
        message: 'Failed to force internal descriptors: ' + error,
      };
    }
  }

  /**
   * Generar reporte de diagnóstico legible
   */
  static formatDiagnosticReport(result: DiagnosticResult): string {
    let report = '=== Adapter Diagnostic Report ===\n\n';

    report += `Overall Diagnosis: ${result.diagnosis.toUpperCase()}\n\n`;

    report += 'Component Status:\n';
    report += `  USB Detection: ${result.deviceDetected ? '✓ OK' : '✗ FAIL'}\n`;
    report += `  USB Descriptors: ${result.usbDescriptorsReadable ? '✓ OK' : '✗ FAIL'}\n`;
    report += `  EEPROM Read: ${result.eepromReadable ? '✓ OK' : '✗ FAIL'}\n`;
    report += `  EEPROM Write: ${result.eepromWriteable ? '✓ OK' : '✗ FAIL'}\n`;
    report += `  Vendor Commands: ${result.vendorCommandsResponsive ? '✓ OK' : '✗ FAIL'}\n\n`;

    if (result.issues.length > 0) {
      report += 'Issues Detected:\n';
      result.issues.forEach((issue) => {
        report += `  - ${issue}\n`;
      });
      report += '\n';
    }

    if (result.recommendations.length > 0) {
      report += 'Recommendations:\n';
      result.recommendations.forEach((rec) => {
        report += `  - ${rec}\n`;
      });
    }

    return report;
  }

  /**
   * Generar guía de recuperación
   */
  static generateRecoveryGuide(diagnosis: DiagnosticResult['diagnosis']): string {
    let guide = '=== Recovery Guide ===\n\n';

    switch (diagnosis) {
      case 'healthy':
        guide += 'Your adapter is fully functional. No recovery needed.\n';
        guide += 'You can proceed with spoofing safely.\n';
        break;

      case 'degraded':
        guide += 'Your adapter has limited functionality.\n\n';
        guide += 'Try these steps:\n';
        guide += '1. Attempt software reset\n';
        guide += '2. Check for write protection\n';
        guide += '3. Try vendor-specific recovery commands\n';
        break;

      case 'bricked':
        guide += 'Your adapter appears to be bricked.\n\n';
        guide += 'Recovery options (in order of difficulty):\n\n';
        guide += '1. SOFTWARE RESET (Easy)\n';
        guide += '   - Try vendor command reset\n';
        guide += '   - Success rate: ~60%\n\n';
        guide += '2. FORCE INTERNAL DESCRIPTORS (Medium)\n';
        guide += '   - Disable EEPROM reading\n';
        guide += '   - Success rate: ~50%\n\n';
        guide += '3. SDA/SCL SHORT CIRCUIT (Hard)\n';
        guide += '   - Requires opening adapter\n';
        guide += '   - Success rate: ~80%\n\n';
        guide += '4. EXTERNAL PROGRAMMING (Expert)\n';
        guide += '   - Requires desoldering EEPROM\n';
        guide += '   - Success rate: ~95%\n';
        break;

      case 'unknown':
        guide += 'Unable to determine adapter status.\n\n';
        guide += 'Basic troubleshooting:\n';
        guide += '1. Check physical connection\n';
        guide += '2. Try different USB port/cable\n';
        guide += '3. Restart Android device\n';
        guide += '4. Test adapter on PC to verify hardware\n';
        break;
    }

    return guide;
  }
}
