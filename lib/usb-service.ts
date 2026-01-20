import { Platform } from 'react-native';
import UsbNativeModule, { type UsbDevice as NativeUsbDevice, type EEPROMReadResult, type EEPROMDumpResult } from '../modules/usb-native';
import { usbLogger } from './usb-logger';

export type UsbDevice = NativeUsbDevice;
export { type EEPROMReadResult, type EEPROMDumpResult };

// NOTA: SpoofResult y spoofVIDPID fueron ELIMINADOS por seguridad.
// La función spoofVIDPID tenía errores críticos que podían causar bricking.
// En su lugar, usar writeEEPROM() que implementa correctamente la escritura.

// Magic value for EEPROM write authorization (as specified in Guíaspoofing.pdf)
export const MAGIC_VALUE = 0xDEADBEEF;

// EEPROM offsets for VID/PID (as specified in Guíaspoofing.pdf)
export const EEPROM_VID_OFFSET = 0x88;
export const EEPROM_PID_OFFSET = 0x8A;

// Target VID/PID for D-Link DUB-E100 (MIB2 compatible)
export const TARGET_VID = 0x2001;
export const TARGET_PID = 0x3C05;

/**
 * USB Service - Detección y gestión de dispositivos USB con funciones EEPROM
 */
class UsbService {
  private devices: UsbDevice[] = [];
  private listeners: Set<(devices: UsbDevice[]) => void> = new Set();
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private currentDeviceId: number | null = null;

  /**
   * Inicializar el servicio USB
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('[UsbService] USB service only available on Android');
      return false;
    }

    console.log('[UsbService] Initialized with native module');
    this.startMonitoring();
    return true;
  }

  /**
   * Escanear dispositivos USB conectados
   */
  async scanDevices(): Promise<UsbDevice[]> {
    if (Platform.OS !== 'android') {
      return [];
    }

    try {
      usbLogger.info('scan', 'logs.usb.scanning');
      this.devices = UsbNativeModule.getDeviceList();
      usbLogger.success('scan', 'logs.usb.found_devices', { count: this.devices.length }  
      );
      
      this.notifyListeners();
      return this.devices;
    } catch (error: any) {
      usbLogger.error('scan', 'logs.usb.scan_error', error.message);
      return [];
    }
  }

  /**
   * Solicitar permisos para dispositivo USB
   */
  async requestPermission(deviceId: number): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      usbLogger.info('permission', 'logs.usb.requesting_permission', { deviceId });
      const granted = await UsbNativeModule.requestPermission(deviceId);
      if (granted) {
        usbLogger.success('permission', 'logs.usb.permission_granted', { deviceId });
      } else {
        usbLogger.warning('permission', 'logs.usb.permission_denied', { deviceId });
      }
      return granted;
    } catch (error: any) {
      usbLogger.error('permission', 'logs.usb.permission_error', error.message);
      return false;
    }
  }

  /**
   * Abrir conexión a dispositivo USB
   */
  async openDevice(deviceId: number): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      usbLogger.info('connect', 'logs.usb.opening_connection', { deviceId });
      const opened = await UsbNativeModule.openDevice(deviceId);
      if (opened) {
        this.currentDeviceId = deviceId;
        usbLogger.success('connect', 'logs.usb.device_connected', { deviceId });
      } else {
        usbLogger.error('connect', 'logs.usb.could_not_open_device', { deviceId });
      }
      return opened;
    } catch (error: any) {
      usbLogger.error('connect', 'logs.usb.open_error', error.message);
      return false;
    }
  }

  /**
   * Cerrar conexión a dispositivo USB
   */
  closeDevice(): boolean {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      usbLogger.info('disconnect', 'logs.usb.closing_device');
      const closed = UsbNativeModule.closeDevice();
      if (closed) {
        this.currentDeviceId = null;
        usbLogger.success('disconnect', 'logs.usb.device_disconnected');
      } else {
        usbLogger.warning('disconnect', 'logs.usb.could_not_close');
      }
      return closed;
    } catch (error: any) {
      usbLogger.error('disconnect', 'logs.usb.close_error', error.message);
      return false;
    }
  }

  /**
   * Leer datos de EEPROM en offset específico
   */
  async readEEPROM(offset: number, length: number): Promise<EEPROMReadResult> {
    if (Platform.OS !== 'android') {
      throw new Error('common.usb_operations_android_only');
    }

    if (this.currentDeviceId === null) {
      throw new Error('common.no_device_connected');
    }

    try {
      usbLogger.info('read', 'logs.eeprom.reading', { length, offset: `0x${offset.toString(16)}` });
      const result = await UsbNativeModule.readEEPROM(offset, length);
      usbLogger.success('read', 'logs.eeprom.read_success', { length });
      return result;
    } catch (error: any) {
      usbLogger.error('read', 'logs.eeprom.read_error', error.message);
      throw error;
    }
  }

  /**
   * Escribir datos a EEPROM en offset específico
   */
  async writeEEPROM(offset: number, dataHex: string, skipVerification: boolean = false): Promise<{ bytesWritten: number; verified: boolean }> {
    if (Platform.OS !== 'android') {
      throw new Error('common.usb_operations_android_only');
    }

    if (this.currentDeviceId === null) {
      throw new Error('common.no_device_connected');
    }

    try {
      const mode = skipVerification ? '(NO VERIFY)' : '(with verify)';
      usbLogger.info('write', 'logs.eeprom.writing', { offset: `0x${offset.toString(16)}`, mode });
      const result = await UsbNativeModule.writeEEPROM(offset, dataHex, MAGIC_VALUE, skipVerification);
      
      if (skipVerification) {
        usbLogger.warning('write', 'logs.eeprom.write_no_verify', { bytes: result.bytesWritten });
      } else {
        usbLogger.success('write', 'logs.eeprom.write_success', { bytes: result.bytesWritten });
      }
      
      return result;
    } catch (error: any) {
      usbLogger.error('write', 'logs.eeprom.write_error', error.message);
      throw error;
    }
  }

  /**
   * Volcar contenido completo de EEPROM (256 bytes)
   */
  async dumpEEPROM(): Promise<EEPROMDumpResult> {
    if (Platform.OS !== 'android') {
      throw new Error('common.usb_operations_android_only');
    }

    if (this.currentDeviceId === null) {
      throw new Error('common.no_device_connected');
    }

    try {
      usbLogger.info('dump', 'logs.eeprom.dumping');
      const result = await UsbNativeModule.dumpEEPROM();
      usbLogger.success('dump', 'logs.eeprom.dump_success', { size: result.size });
      return result;
    } catch (error: any) {
      usbLogger.error('dump', 'logs.eeprom.dump_error', error.message);
      throw error;
    }
  }

  // NOTA: La función spoofVIDPID fue ELIMINADA por seguridad.
  // Tenía errores críticos:
  // 1. No habilitaba modo de escritura EEPROM
  // 2. Usaba byte offsets en lugar de word offsets
  // 3. Escribía bytes individuales en lugar de words
  // En su lugar, usar writeEEPROM() directamente desde auto-spoof.tsx

  /**
   * Crear backup automático de EEPROM
   */
  async createEEPROMBackup(): Promise<{ data: string; timestamp: number }> {
    const dump = await this.dumpEEPROM();
    const timestamp = Date.now();
    
    const backup = {
      data: dump.data,
      timestamp,
    };
    
    console.log('[UsbService] EEPROM backup created:', new Date(timestamp).toISOString());
    return backup;
  }

  /**
   * Obtener lista de dispositivos en caché
   */
  getDevices(): UsbDevice[] {
    return [...this.devices];
  }

  /**
   * Suscribirse a cambios de dispositivos
   */
  subscribe(listener: (devices: UsbDevice[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.devices]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notificar a todos los listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.devices]);
    });
  }

  /**
   * Iniciar monitoreo de cambios USB
   */
  private startMonitoring(): void {
    this.scanInterval = setInterval(() => {
      this.scanDevices().catch((error) => {
        console.error('[UsbService] Error in USB monitoring:', error);
      });
    }, 10000); // Optimizado: 10s en lugar de 5s para reducir consumo de batería
  }

  /**
   * Detener monitoreo
   */
  stopMonitoring(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  /**
   * Limpiar recursos
   */
  destroy(): void {
    this.closeDevice();
    this.stopMonitoring();
    this.listeners.clear();
    this.devices = [];
  }

  /**
   * Helper: Formatear VID/PID para display
   */
  formatVIDPID(vid: number, pid: number): string {
    return `${vid.toString(16).toUpperCase().padStart(4, '0')}:${pid.toString(16).toUpperCase().padStart(4, '0')}`;
  }

  /**
   * Helper: Identificar si dispositivo es adaptador ASIX
   */
  isASIXAdapter(device: UsbDevice): boolean {
    return device.vendorId === 0x0B95;
  }

  /**
   * Helper: Identificar si dispositivo ya está spoofed a D-Link
   */
  isDLinkAdapter(device: UsbDevice): boolean {
    return device.vendorId === 0x2001 && device.productId === 0x3C05;
  }

  /**
   * Helper: Verificar si dispositivo es compatible para spoofing
   */
  isCompatibleForSpoofing(device: UsbDevice): boolean {
    return this.isASIXAdapter(device) || this.isDLinkAdapter(device);
  }

  /**
   * Detectar tipo de EEPROM (externa vs eFuse) mediante prueba REAL de escritura
   * 
   * Realiza:
   * 1. Lectura REAL de EEPROM en offset seguro
   * 2. Escritura de prueba REAL en offset seguro (no modifica VID/PID)
   * 3. Verificación REAL de escritura
   * 4. Restauración del valor original
   * 
   * @returns Tipo de EEPROM y si es modificable
   */
  async detectEEPROMType(): Promise<{ type: 'external_eeprom' | 'efuse' | 'unknown'; writable: boolean; reason: string }> {
    if (Platform.OS !== 'android') {
      throw new Error('common.eeprom_detection_android_only');
    }

    try {
      usbLogger.log('info', 'detectEEPROMType', '🔍 Starting REAL EEPROM type detection...');
      
      const result = await UsbNativeModule.detectEEPROMType();
      
      usbLogger.log('success', 'detectEEPROMType', `✅ Detection completed: ${result.type} (writable: ${result.writable})`);
      usbLogger.log('info', 'detectEEPROMType', `📝 Reason: ${result.reason}`);
      
      return result;
    } catch (error) {
      usbLogger.log('error', 'detectEEPROMType', `❌ EEPROM detection error: ${error}`);
      throw error;
    }
  }

  /**
   * DRY-RUN: Simular spoofing sin escribir en EEPROM
   * 
   * Muestra qué cambios se realizarían sin modificar el hardware.
   * Útil para verificar antes de ejecutar el spoofing real.
   */
  async dryRunSpoof(targetVID: number = TARGET_VID, targetPID: number = TARGET_PID): Promise<{
    wouldSucceed: boolean;
    currentVID: number;
    currentPID: number;
    targetVID: number;
    targetPID: number;
    changes: Array<{
      offset: number;
      offsetHex: string;
      currentValue: string;
      newValue: string;
      description: string;
    }>;
    warnings: string[];
    eepromType: 'external_eeprom' | 'efuse' | 'unknown';
  }> {
    if (Platform.OS !== 'android') {
      throw new Error('common.dryrun_android_only');
    }

    if (this.currentDeviceId === null) {
      throw new Error('common.no_device_connected');
    }

    const warnings: string[] = [];
    const changes: Array<{
      offset: number;
      offsetHex: string;
      currentValue: string;
      newValue: string;
      description: string;
    }> = [];

    try {
      usbLogger.info('dryRun', 'logs.spoof.dry_run_start');

      // 1. Detectar tipo de EEPROM
      const eepromTypeResult = await this.detectEEPROMType();
      
      if (eepromTypeResult.type === 'efuse') {
        warnings.push('EEPROM tipo eFuse detectado - spoofing NO es posible');
      } else if (eepromTypeResult.type === 'unknown') {
        warnings.push('No se pudo determinar el tipo de EEPROM');
      }

      // 2. Leer VID/PID actuales
      const vidResult = await this.readEEPROM(EEPROM_VID_OFFSET, 2);
      const pidResult = await this.readEEPROM(EEPROM_PID_OFFSET, 2);

      // Parsear VID/PID (little-endian en EEPROM)
      const currentVID = (vidResult.bytes[1] << 8) | vidResult.bytes[0];
      const currentPID = (pidResult.bytes[1] << 8) | pidResult.bytes[0];

      // 3. Calcular cambios necesarios
      const targetVIDLow = targetVID & 0xFF;
      const targetVIDHigh = (targetVID >> 8) & 0xFF;
      const targetPIDLow = targetPID & 0xFF;
      const targetPIDHigh = (targetPID >> 8) & 0xFF;

      // VID byte bajo
      if (vidResult.bytes[0] !== targetVIDLow) {
        changes.push({
          offset: EEPROM_VID_OFFSET,
          offsetHex: `0x${EEPROM_VID_OFFSET.toString(16).toUpperCase()}`,
          currentValue: `0x${vidResult.bytes[0].toString(16).toUpperCase().padStart(2, '0')}`,
          newValue: `0x${targetVIDLow.toString(16).toUpperCase().padStart(2, '0')}`,
          description: 'VID byte bajo'
        });
      }

      // VID byte alto
      if (vidResult.bytes[1] !== targetVIDHigh) {
        changes.push({
          offset: EEPROM_VID_OFFSET + 1,
          offsetHex: `0x${(EEPROM_VID_OFFSET + 1).toString(16).toUpperCase()}`,
          currentValue: `0x${vidResult.bytes[1].toString(16).toUpperCase().padStart(2, '0')}`,
          newValue: `0x${targetVIDHigh.toString(16).toUpperCase().padStart(2, '0')}`,
          description: 'VID byte alto'
        });
      }

      // PID byte bajo
      if (pidResult.bytes[0] !== targetPIDLow) {
        changes.push({
          offset: EEPROM_PID_OFFSET,
          offsetHex: `0x${EEPROM_PID_OFFSET.toString(16).toUpperCase()}`,
          currentValue: `0x${pidResult.bytes[0].toString(16).toUpperCase().padStart(2, '0')}`,
          newValue: `0x${targetPIDLow.toString(16).toUpperCase().padStart(2, '0')}`,
          description: 'PID byte bajo'
        });
      }

      // PID byte alto
      if (pidResult.bytes[1] !== targetPIDHigh) {
        changes.push({
          offset: EEPROM_PID_OFFSET + 1,
          offsetHex: `0x${(EEPROM_PID_OFFSET + 1).toString(16).toUpperCase()}`,
          currentValue: `0x${pidResult.bytes[1].toString(16).toUpperCase().padStart(2, '0')}`,
          newValue: `0x${targetPIDHigh.toString(16).toUpperCase().padStart(2, '0')}`,
          description: 'PID byte alto'
        });
      }

      // 4. Verificar si ya está spoofed
      if (currentVID === targetVID && currentPID === targetPID) {
        warnings.push('El adaptador ya tiene el VID/PID objetivo');
      }

      const wouldSucceed = eepromTypeResult.writable && changes.length > 0;

      usbLogger.success('dryRun', 'logs.spoof.dry_run_complete', { 
        changes: changes.length,
        wouldSucceed 
      });

      return {
        wouldSucceed,
        currentVID,
        currentPID,
        targetVID,
        targetPID,
        changes,
        warnings,
        eepromType: eepromTypeResult.type
      };
    } catch (error: any) {
      usbLogger.error('dryRun', 'logs.spoof.dry_run_error', error.message);
      throw error;
    }
  }

  /**
   * Verificar checksum de EEPROM ASIX
   * 
   * Según el datasheet de AX88772B:
   * - El checksum está en offset 0x18 (byte bajo)
   * - Fórmula: EEPROM[0x18] = 0xFF - SUM[EEPROM offset 0x07 ~ 0x0E]
   * 
   * NOTA: El checksum NO incluye VID/PID (offsets 0x88-0x8B),
   * por lo que modificar VID/PID no afecta la integridad del checksum.
   */
  async verifyEEPROMChecksum(): Promise<{
    valid: boolean;
    storedChecksum: number;
    calculatedChecksum: number;
    checksumOffset: number;
    dataRange: string;
    affectsVIDPID: boolean;
    details: string;
  }> {
    if (Platform.OS !== 'android') {
      throw new Error('common.checksum_verification_android_only');
    }

    if (this.currentDeviceId === null) {
      throw new Error('common.no_device_connected');
    }

    try {
      usbLogger.info('checksum', 'logs.eeprom.verifying_checksum');

      // Leer bytes 0x07-0x0E (8 bytes) que se usan para calcular checksum
      const dataResult = await this.readEEPROM(0x07, 8);
      
      // Leer checksum almacenado en offset 0x18
      const checksumResult = await this.readEEPROM(0x18, 1);
      const storedChecksum = checksumResult.bytes[0];

      // Calcular checksum: 0xFF - SUM[bytes 0x07-0x0E]
      let sum = 0;
      for (const byte of dataResult.bytes) {
        sum += byte;
      }
      const calculatedChecksum = (0xFF - (sum & 0xFF)) & 0xFF;

      const valid = storedChecksum === calculatedChecksum;

      const result = {
        valid,
        storedChecksum,
        calculatedChecksum,
        checksumOffset: 0x18,
        dataRange: '0x07-0x0E',
        affectsVIDPID: false,
        details: valid 
          ? 'Checksum válido - EEPROM íntegra'
          : `Checksum inválido: almacenado=0x${storedChecksum.toString(16).toUpperCase()}, calculado=0x${calculatedChecksum.toString(16).toUpperCase()}`
      };

      if (valid) {
        usbLogger.success('checksum', 'logs.eeprom.checksum_valid');
      } else {
        usbLogger.warning('checksum', 'logs.eeprom.checksum_invalid', {
          stored: `0x${storedChecksum.toString(16)}`,
          calculated: `0x${calculatedChecksum.toString(16)}`
        });
      }

      return result;
    } catch (error: any) {
      usbLogger.error('checksum', 'logs.eeprom.checksum_error', error.message);
      throw error;
    }
  }

  /**
   * SAFE TEST MODE: Simular todo el proceso de spoofing sin escribir en EEPROM
   * 
   * Este modo ejecuta todos los pasos del spoofing real pero sin realizar
   * escrituras en la EEPROM. Permite verificar que todo funcionará correctamente
   * antes de ejecutar el spoofing real.
   * 
   * Pasos simulados:
   * 1. Validación de compatibilidad del dispositivo
   * 2. Detección de tipo de EEPROM (externa vs eFuse)
   * 3. Lectura de VID/PID actuales
   * 4. Simulación de backup (sin crear archivo real)
   * 5. Simulación de escritura de cada byte (con delays realistas)
   * 6. Simulación de verificación post-escritura
   * 7. Generación de reporte detallado
   * 
   * @param targetVID VID objetivo (default: D-Link 0x2001)
   * @param targetPID PID objetivo (default: D-Link 0x3C05)
   * @param onProgress Callback para reportar progreso de cada paso
   * @returns Reporte detallado de la simulación
   */
  async simulateFullSpoofProcess(
    targetVID: number = TARGET_VID,
    targetPID: number = TARGET_PID,
    onProgress?: (step: string, progress: number, details: string) => void
  ): Promise<{
    success: boolean;
    wouldSucceedInRealMode: boolean;
    steps: Array<{
      name: string;
      status: 'passed' | 'failed' | 'warning' | 'skipped';
      duration: number;
      details: string;
    }>;
    summary: {
      currentVID: string;
      currentPID: string;
      targetVID: string;
      targetPID: string;
      eepromType: string;
      isWritable: boolean;
      totalChanges: number;
      estimatedRealTime: number;
    };
    warnings: string[];
    errors: string[];
  }> {
    if (Platform.OS !== 'android') {
      throw new Error('common.safe_test_mode_android_only');
    }

    if (this.currentDeviceId === null) {
      throw new Error('common.no_device_connected');
    }

    const steps: Array<{
      name: string;
      status: 'passed' | 'failed' | 'warning' | 'skipped';
      duration: number;
      details: string;
    }> = [];
    const warnings: string[] = [];
    const errors: string[] = [];
    let wouldSucceedInRealMode = true;

    const reportProgress = (step: string, progress: number, details: string) => {
      if (onProgress) {
        onProgress(step, progress, details);
      }
    };

    const addStep = (name: string, status: 'passed' | 'failed' | 'warning' | 'skipped', duration: number, details: string) => {
      steps.push({ name, status, duration, details });
      if (status === 'failed') {
        wouldSucceedInRealMode = false;
        errors.push(`${name}: ${details}`);
      } else if (status === 'warning') {
        warnings.push(`${name}: ${details}`);
      }
    };

    try {
      usbLogger.info('safeTest', 'logs.spoof.safe_test_start');
      reportProgress('init', 0, 'Iniciando modo de prueba seguro...');

      // ========== PASO 1: Validación de compatibilidad ==========
      const step1Start = Date.now();
      reportProgress('validating', 10, 'Validando compatibilidad del dispositivo...');
      await this.delay(500); // Simular tiempo de validación

      const devices = await this.scanDevices();
      const currentDevice = devices.find(d => d.deviceId === this.currentDeviceId);
      
      if (!currentDevice) {
        addStep('Validación de dispositivo', 'failed', Date.now() - step1Start, 'Dispositivo no encontrado');
        throw new Error('common.device_not_found');
      }

      const isCompatible = this.isCompatibleForSpoofing(currentDevice);
      if (isCompatible) {
        addStep('Validación de dispositivo', 'passed', Date.now() - step1Start, 
          `Dispositivo compatible: ${currentDevice.deviceName || 'USB Device'} (${this.formatVIDPID(currentDevice.vendorId, currentDevice.productId)})`);
      } else {
        addStep('Validación de dispositivo', 'warning', Date.now() - step1Start, 
          `Dispositivo no es ASIX ni D-Link: ${this.formatVIDPID(currentDevice.vendorId, currentDevice.productId)}`);
        warnings.push('El dispositivo puede no ser compatible con MIB2');
      }

      // ========== PASO 2: Detección de tipo de EEPROM ==========
      const step2Start = Date.now();
      reportProgress('detecting_eeprom', 20, 'Detectando tipo de EEPROM...');
      
      let eepromType: 'external_eeprom' | 'efuse' | 'unknown' = 'unknown';
      let isWritable = false;
      
      try {
        const eepromResult = await this.detectEEPROMType();
        eepromType = eepromResult.type;
        isWritable = eepromResult.writable;
        
        if (eepromType === 'efuse') {
          addStep('Detección de EEPROM', 'failed', Date.now() - step2Start, 
            'EEPROM tipo eFuse detectado - NO es posible modificar VID/PID');
          wouldSucceedInRealMode = false;
        } else if (eepromType === 'external_eeprom' && isWritable) {
          addStep('Detección de EEPROM', 'passed', Date.now() - step2Start, 
            'EEPROM externa detectada - Escritura posible');
        } else {
          addStep('Detección de EEPROM', 'warning', Date.now() - step2Start, 
            `Tipo: ${eepromType}, Escribible: ${isWritable}`);
        }
      } catch (error: any) {
        addStep('Detección de EEPROM', 'warning', Date.now() - step2Start, 
          `No se pudo detectar tipo de EEPROM: ${error.message}`);
      }

      // ========== PASO 3: Lectura de VID/PID actuales ==========
      const step3Start = Date.now();
      reportProgress('reading_vidpid', 35, 'Leyendo VID/PID actuales...');
      
      let currentVID = 0;
      let currentPID = 0;
      
      try {
        const vidResult = await this.readEEPROM(EEPROM_VID_OFFSET, 2);
        const pidResult = await this.readEEPROM(EEPROM_PID_OFFSET, 2);
        
        currentVID = (vidResult.bytes[1] << 8) | vidResult.bytes[0];
        currentPID = (pidResult.bytes[1] << 8) | pidResult.bytes[0];
        
        addStep('Lectura de VID/PID', 'passed', Date.now() - step3Start, 
          `VID actual: 0x${currentVID.toString(16).toUpperCase()}, PID actual: 0x${currentPID.toString(16).toUpperCase()}`);
        
        // Verificar si ya está spoofed
        if (currentVID === targetVID && currentPID === targetPID) {
          addStep('Verificación de estado', 'warning', 0, 
            'El adaptador ya tiene el VID/PID objetivo - No se requieren cambios');
          warnings.push('El adaptador ya está configurado con el VID/PID de D-Link');
        }
      } catch (error: any) {
        addStep('Lectura de VID/PID', 'failed', Date.now() - step3Start, 
          `Error leyendo EEPROM: ${error.message}`);
        wouldSucceedInRealMode = false;
      }

      // ========== PASO 4: Verificación de checksum ==========
      const step4Start = Date.now();
      reportProgress('verifying_checksum', 45, 'Verificando checksum de EEPROM...');
      
      try {
        const checksumResult = await this.verifyEEPROMChecksum();
        if (checksumResult.valid) {
          addStep('Verificación de checksum', 'passed', Date.now() - step4Start, 
            `Checksum válido: 0x${checksumResult.storedChecksum.toString(16).toUpperCase()}`);
        } else {
          addStep('Verificación de checksum', 'warning', Date.now() - step4Start, 
            `Checksum inválido pero no afecta VID/PID`);
        }
      } catch (error: any) {
        addStep('Verificación de checksum', 'warning', Date.now() - step4Start, 
          `No se pudo verificar checksum: ${error.message}`);
      }

      // ========== PASO 5: Simulación de backup ==========
      const step5Start = Date.now();
      reportProgress('simulating_backup', 55, 'Simulando creación de backup...');
      await this.delay(300); // Simular tiempo de backup
      
      addStep('Simulación de backup', 'passed', Date.now() - step5Start, 
        `Backup simulado: VID=0x${currentVID.toString(16).toUpperCase()}, PID=0x${currentPID.toString(16).toUpperCase()}`);

      // ========== PASO 6: Simulación de escritura de VID ==========
      const step6Start = Date.now();
      reportProgress('simulating_write_vid', 65, 'Simulando escritura de VID...');
      await this.delay(400); // Simular tiempo de escritura
      
      const vidLow = targetVID & 0xFF;
      const vidHigh = (targetVID >> 8) & 0xFF;
      
      if (isWritable || eepromType === 'unknown') {
        addStep('Simulación escritura VID', 'passed', Date.now() - step6Start, 
          `Escribiría: offset 0x${EEPROM_VID_OFFSET.toString(16)} = 0x${vidLow.toString(16).padStart(2, '0')}${vidHigh.toString(16).padStart(2, '0')} (${targetVID.toString(16).toUpperCase()})`);
      } else {
        addStep('Simulación escritura VID', 'skipped', Date.now() - step6Start, 
          'Escritura omitida - EEPROM no es escribible');
      }

      // ========== PASO 7: Simulación de escritura de PID ==========
      const step7Start = Date.now();
      reportProgress('simulating_write_pid', 80, 'Simulando escritura de PID...');
      await this.delay(400); // Simular tiempo de escritura
      
      const pidLow = targetPID & 0xFF;
      const pidHigh = (targetPID >> 8) & 0xFF;
      
      if (isWritable || eepromType === 'unknown') {
        addStep('Simulación escritura PID', 'passed', Date.now() - step7Start, 
          `Escribiría: offset 0x${EEPROM_PID_OFFSET.toString(16)} = 0x${pidLow.toString(16).padStart(2, '0')}${pidHigh.toString(16).padStart(2, '0')} (${targetPID.toString(16).toUpperCase()})`);
      } else {
        addStep('Simulación escritura PID', 'skipped', Date.now() - step7Start, 
          'Escritura omitida - EEPROM no es escribible');
      }

      // ========== PASO 8: Simulación de verificación ==========
      const step8Start = Date.now();
      reportProgress('simulating_verify', 90, 'Simulando verificación post-escritura...');
      await this.delay(300); // Simular tiempo de verificación
      
      if (isWritable || eepromType === 'unknown') {
        addStep('Simulación verificación', 'passed', Date.now() - step8Start, 
          `Verificaría que VID/PID = ${this.formatVIDPID(targetVID, targetPID)}`);
      } else {
        addStep('Simulación verificación', 'skipped', Date.now() - step8Start, 
          'Verificación omitida - No se realizó escritura');
      }

      // ========== PASO 9: Generación de reporte ==========
      reportProgress('generating_report', 100, 'Generando reporte de simulación...');

      const totalChanges = (currentVID !== targetVID ? 2 : 0) + (currentPID !== targetPID ? 2 : 0);
      const estimatedRealTime = 2000 + (totalChanges * 500); // Base + tiempo por cambio

      usbLogger.success('safeTest', 'logs.spoof.safe_test_complete', {
        wouldSucceed: wouldSucceedInRealMode,
        steps: steps.length
      });

      return {
        success: true,
        wouldSucceedInRealMode,
        steps,
        summary: {
          currentVID: `0x${currentVID.toString(16).toUpperCase().padStart(4, '0')}`,
          currentPID: `0x${currentPID.toString(16).toUpperCase().padStart(4, '0')}`,
          targetVID: `0x${targetVID.toString(16).toUpperCase().padStart(4, '0')}`,
          targetPID: `0x${targetPID.toString(16).toUpperCase().padStart(4, '0')}`,
          eepromType,
          isWritable,
          totalChanges,
          estimatedRealTime
        },
        warnings,
        errors
      };
    } catch (error: any) {
      usbLogger.error('safeTest', 'logs.spoof.safe_test_error', error.message);
      
      return {
        success: false,
        wouldSucceedInRealMode: false,
        steps,
        summary: {
          currentVID: 'N/A',
          currentPID: 'N/A',
          targetVID: `0x${targetVID.toString(16).toUpperCase().padStart(4, '0')}`,
          targetPID: `0x${targetPID.toString(16).toUpperCase().padStart(4, '0')}`,
          eepromType: 'unknown',
          isWritable: false,
          totalChanges: 0,
          estimatedRealTime: 0
        },
        warnings,
        errors: [...errors, error.message]
      };
    }
  }

  /**
   * Helper: Delay para simulaciones
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Exportar instancia singleton
export const usbService = new UsbService();
export default usbService;
