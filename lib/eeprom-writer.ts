/**
 * Escritor de EEPROM con Validaciones de Seguridad
 * Maneja la reprogramación segura de adaptadores ASIX AX88772
 */

import { usbService, DLINK_VENDOR_ID, DLINK_PRODUCT_ID_B1 } from './usb-service';
import { EepromAnalyzer, type EepromAnalysis } from './eeprom-analyzer';
import { EepromBackupManager } from './eeprom-backup';
import { OperationHistoryManager } from './operation-history';

export interface SpoofingProgress {
  step: number;
  totalSteps: number;
  message: string;
  percentage: number;
}

export interface SpoofingResult {
  success: boolean;
  message: string;
  verificationPassed: boolean;
  newVid?: number;
  newPid?: number;
  error?: string;
  dryRun?: boolean;
  simulatedChanges?: Array<{
    offset: number;
    offsetName: string;
    oldValue: number;
    newValue: number;
  }>;
}

export type ProgressCallback = (progress: SpoofingProgress) => void;

/**
 * Escritor de EEPROM
 */
export class EepromWriter {
  /**
   * Ejecutar el procedimiento completo de spoofing
   */
  static async performSpoofing(
    analysis: EepromAnalysis,
    onProgress?: ProgressCallback,
    dryRun: boolean = false
  ): Promise<SpoofingResult> {
    const totalSteps = 7;
    let currentStep = 0;

    const reportProgress = (message: string) => {
      currentStep++;
      if (onProgress) {
        onProgress({
          step: currentStep,
          totalSteps,
          message,
          percentage: Math.round((currentStep / totalSteps) * 100),
        });
      }
    };

    try {
      // Paso 1: Validar compatibilidad
      reportProgress('Validating adapter compatibility...');
      const compatibility = EepromAnalyzer.validateCompatibility(analysis);
      if (!compatibility.compatible) {
        return {
          success: false,
          message: 'Adapter is not compatible for spoofing',
          verificationPassed: false,
          error: compatibility.reason,
        };
      }

      // Paso 2: Crear backup de EEPROM original
      reportProgress('Creating backup of original EEPROM...');
      const backup = [...analysis.rawData];
      
      // Crear backup persistente automáticamente
      try {
        const backupId = await EepromBackupManager.createBackup(
          analysis,
          `Auto-backup before spoofing (${dryRun ? 'Dry Run' : 'Real Operation'})`
        );
        console.log(`[EepromWriter] Auto-backup created: ${backupId}`);
      } catch (backupError) {
        console.error('[EepromWriter] Failed to create auto-backup:', backupError);
        // Continue anyway, we have the in-memory backup
      }

      // Paso 3: Preparar datos para escritura
      reportProgress('Preparing new VID/PID values...');
      const { vidPidLocation } = analysis;
      const targetVid = DLINK_VENDOR_ID;
      const targetPid = DLINK_PRODUCT_ID_B1;

      const newVidLow = targetVid & 0xFF;
      const newVidHigh = (targetVid >> 8) & 0xFF;
      const newPidLow = targetPid & 0xFF;
      const newPidHigh = (targetPid >> 8) & 0xFF;

      // Si es Dry Run, solo simular los cambios
      if (dryRun) {
        reportProgress('[DRY RUN] Simulating VID write...');
        reportProgress('[DRY RUN] Simulating PID write...');
        if (analysis.checksumOffset) {
          reportProgress('[DRY RUN] Simulating checksum update...');
        }
        reportProgress('[DRY RUN] Simulation complete');

        const simulatedChanges = [
          {
            offset: vidPidLocation.vidOffsetLow,
            offsetName: 'VID Low Byte',
            oldValue: backup[vidPidLocation.vidOffsetLow],
            newValue: newVidLow,
          },
          {
            offset: vidPidLocation.vidOffsetHigh,
            offsetName: 'VID High Byte',
            oldValue: backup[vidPidLocation.vidOffsetHigh],
            newValue: newVidHigh,
          },
          {
            offset: vidPidLocation.pidOffsetLow,
            offsetName: 'PID Low Byte',
            oldValue: backup[vidPidLocation.pidOffsetLow],
            newValue: newPidLow,
          },
          {
            offset: vidPidLocation.pidOffsetHigh,
            offsetName: 'PID High Byte',
            oldValue: backup[vidPidLocation.pidOffsetHigh],
            newValue: newPidHigh,
          },
        ];

        return {
          success: true,
          message: '[DRY RUN] Simulation completed successfully. No actual changes were made to EEPROM.',
          verificationPassed: true,
          newVid: targetVid,
          newPid: targetPid,
          dryRun: true,
          simulatedChanges,
        };
      }

      // Paso 4: Escribir VID (2 bytes)
      reportProgress('Writing new Vendor ID to EEPROM...');
      await usbService.writeEepromByte(vidPidLocation.vidOffsetLow, newVidLow);
      await usbService.writeEepromByte(vidPidLocation.vidOffsetHigh, newVidHigh);

      // Paso 5: Escribir PID (2 bytes)
      reportProgress('Writing new Product ID to EEPROM...');
      await usbService.writeEepromByte(vidPidLocation.pidOffsetLow, newPidLow);
      await usbService.writeEepromByte(vidPidLocation.pidOffsetHigh, newPidHigh);

      // Paso 6: Actualizar checksum si es necesario
      if (analysis.checksumOffset) {
        reportProgress('Updating EEPROM checksum...');
        await this.updateChecksum(analysis, vidPidLocation);
      }

      // Paso 7: Verificar escritura
      reportProgress('Verifying EEPROM write operation...');
      const verificationResult = await this.verifySpoof(vidPidLocation);

      if (!verificationResult.success) {
        // Intentar restaurar backup
        console.error('[EepromWriter] Verification failed, attempting rollback...');
        try {
          await this.restoreBackup(backup, vidPidLocation);
        } catch (rollbackError) {
          console.error('[EepromWriter] Rollback failed:', rollbackError);
        }

        return {
          success: false,
          message: 'Verification failed after write',
          verificationPassed: false,
          error: verificationResult.error,
        };
      }

      return {
        success: true,
        message: 'Spoofing completed successfully! Please disconnect and reconnect the adapter.',
        verificationPassed: true,
        newVid: targetVid,
        newPid: targetPid,
      };
    } catch (error) {
      console.error('[EepromWriter] Spoofing failed:', error);
      return {
        success: false,
        message: 'Spoofing operation failed',
        verificationPassed: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Verificar que la escritura fue exitosa
   */
  private static async verifySpoof(vidPidLocation: EepromAnalysis['vidPidLocation']): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Leer VID
      const vidLow = await usbService.readEepromByte(vidPidLocation.vidOffsetLow);
      const vidHigh = await usbService.readEepromByte(vidPidLocation.vidOffsetHigh);
      const actualVid = vidLow | (vidHigh << 8);

      // Leer PID
      const pidLow = await usbService.readEepromByte(vidPidLocation.pidOffsetLow);
      const pidHigh = await usbService.readEepromByte(vidPidLocation.pidOffsetHigh);
      const actualPid = pidLow | (pidHigh << 8);

      // Verificar valores
      const expectedVid = DLINK_VENDOR_ID;
      const expectedPid = DLINK_PRODUCT_ID_B1;

      if (actualVid !== expectedVid) {
        return {
          success: false,
          error: `VID mismatch: expected 0x${expectedVid.toString(16)}, got 0x${actualVid.toString(16)}`,
        };
      }

      if (actualPid !== expectedPid) {
        return {
          success: false,
          error: `PID mismatch: expected 0x${expectedPid.toString(16)}, got 0x${actualPid.toString(16)}`,
        };
      }

      console.log('[EepromWriter] Verification successful');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Verification read failed: ${error}`,
      };
    }
  }

  /**
   * Actualizar checksum de la EEPROM
   */
  private static async updateChecksum(
    analysis: EepromAnalysis,
    vidPidLocation: EepromAnalysis['vidPidLocation']
  ): Promise<void> {
    if (!analysis.checksumOffset) {
      return;
    }

    try {
      // Leer toda la EEPROM actualizada
      const updatedData = await usbService.readEeprom(0, analysis.size);

      // Calcular nuevo checksum
      const newChecksum = EepromAnalyzer.calculateChecksum(updatedData, 2);

      // Escribir checksum (Little Endian)
      const checksumLow = newChecksum & 0xFF;
      const checksumHigh = (newChecksum >> 8) & 0xFF;

      await usbService.writeEepromByte(analysis.checksumOffset, checksumLow);
      await usbService.writeEepromByte(analysis.checksumOffset + 1, checksumHigh);

      console.log(`[EepromWriter] Updated checksum: 0x${newChecksum.toString(16)}`);
    } catch (error) {
      console.error('[EepromWriter] Failed to update checksum:', error);
      throw error;
    }
  }

  /**
   * Restaurar backup de EEPROM en caso de fallo
   */
  private static async restoreBackup(
    backup: number[],
    vidPidLocation: EepromAnalysis['vidPidLocation']
  ): Promise<void> {
    console.log('[EepromWriter] Restoring EEPROM from backup...');

    try {
      // Restaurar VID
      await usbService.writeEepromByte(vidPidLocation.vidOffsetLow, backup[vidPidLocation.vidOffsetLow]);
      await usbService.writeEepromByte(vidPidLocation.vidOffsetHigh, backup[vidPidLocation.vidOffsetHigh]);

      // Restaurar PID
      await usbService.writeEepromByte(vidPidLocation.pidOffsetLow, backup[vidPidLocation.pidOffsetLow]);
      await usbService.writeEepromByte(vidPidLocation.pidOffsetHigh, backup[vidPidLocation.pidOffsetHigh]);

      console.log('[EepromWriter] Backup restored successfully');
    } catch (error) {
      console.error('[EepromWriter] Failed to restore backup:', error);
      throw new Error('Critical error: Failed to restore original EEPROM data');
    }
  }

  /**
   * Validar pre-requisitos antes de iniciar spoofing
   */
  static validatePrerequisites(analysis: EepromAnalysis): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar compatibilidad
    const compatibility = EepromAnalyzer.validateCompatibility(analysis);
    if (!compatibility.compatible) {
      errors.push(compatibility.reason || 'Adapter is not compatible');
    }

    // Verificar conexión USB
    if (!usbService.isConnected()) {
      errors.push('No USB device connected');
    }

    // Verificar que no esté ya spoofed
    if (analysis.currentVid === DLINK_VENDOR_ID && analysis.currentPid === DLINK_PRODUCT_ID_B1) {
      warnings.push('Adapter already appears to be spoofed as D-Link DUB-E100');
    }

    // Verificar confianza en offsets
    if (analysis.vidPidLocation.confidence === 'low') {
      warnings.push('VID/PID location confidence is low. Proceed with caution.');
    }

    // Verificar chipset
    if (analysis.chipsetVersion === 'Unknown') {
      warnings.push('Chipset version could not be determined');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generar resumen de la operación de spoofing
   */
  static generateOperationSummary(analysis: EepromAnalysis): string {
    const preview = EepromAnalyzer.generateSpoofingPreview(analysis);

    let summary = '=== Spoofing Operation Summary ===\n\n';

    summary += 'Current Identification:\n';
    summary += `  VID: ${preview.before.vid} (ASIX Electronics)\n`;
    summary += `  PID: ${preview.before.pid} (AX88772)\n\n`;

    summary += 'Target Identification:\n';
    summary += `  VID: ${preview.after.vid} (D-Link Corp.)\n`;
    summary += `  PID: ${preview.after.pid} (DUB-E100 Fast Ethernet Adapter)\n\n`;

    summary += 'Bytes to Modify:\n';
    preview.bytesToModify.forEach((mod) => {
      summary += `  Offset 0x${mod.offset.toString(16).padStart(2, '0')}: `;
      summary += `0x${mod.oldValue.toString(16).padStart(2, '0')} → `;
      summary += `0x${mod.newValue.toString(16).padStart(2, '0')}\n`;
    });

    summary += '\nWARNING: This operation will permanently modify the adapter\'s EEPROM.\n';
    summary += 'There is a risk of "bricking" the device if the operation fails.\n';
    summary += 'Ensure the adapter remains connected during the entire process.\n';

    return summary;
  }

  /**
   * Estimar tiempo de operación
   */
  static estimateOperationTime(): number {
    // Tiempo estimado en segundos
    // - Validación: 1s
    // - Backup: 2s
    // - Preparación: 1s
    // - Escritura VID: 2s
    // - Escritura PID: 2s
    // - Checksum: 2s
    // - Verificación: 2s
    return 12;
  }
}
