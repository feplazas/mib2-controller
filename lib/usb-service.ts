import { Platform } from 'react-native';
import UsbNativeModule, { type UsbDevice as NativeUsbDevice, type EEPROMReadResult, type EEPROMDumpResult, type SpoofResult } from '../modules/usb-native';

export type UsbDevice = NativeUsbDevice;
export { type EEPROMReadResult, type EEPROMDumpResult, type SpoofResult };

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
      console.log('[UsbService] Scanning for USB devices...');
      this.devices = UsbNativeModule.getDeviceList();
      console.log(`[UsbService] Found ${this.devices.length} USB devices`);
      
      this.notifyListeners();
      return this.devices;
    } catch (error) {
      console.error('[UsbService] Error scanning USB devices:', error);
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
      console.log(`[UsbService] Requesting permission for device ${deviceId}`);
      const granted = await UsbNativeModule.requestPermission(deviceId);
      console.log(`[UsbService] Permission ${granted ? 'granted' : 'denied'} for device ${deviceId}`);
      return granted;
    } catch (error) {
      console.error('[UsbService] Error requesting USB permission:', error);
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
      console.log(`[UsbService] Opening device ${deviceId}`);
      const opened = await UsbNativeModule.openDevice(deviceId);
      if (opened) {
        this.currentDeviceId = deviceId;
        console.log(`[UsbService] Device ${deviceId} opened successfully`);
      }
      return opened;
    } catch (error) {
      console.error('[UsbService] Error opening USB device:', error);
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
      console.log('[UsbService] Closing device');
      const closed = UsbNativeModule.closeDevice();
      if (closed) {
        this.currentDeviceId = null;
        console.log('[UsbService] Device closed successfully');
      }
      return closed;
    } catch (error) {
      console.error('[UsbService] Error closing USB device:', error);
      return false;
    }
  }

  /**
   * Leer datos de EEPROM en offset específico
   */
  async readEEPROM(offset: number, length: number): Promise<EEPROMReadResult> {
    if (Platform.OS !== 'android') {
      throw new Error('USB operations only available on Android');
    }

    if (this.currentDeviceId === null) {
      throw new Error('No device connected');
    }

    try {
      console.log(`[UsbService] Reading ${length} bytes from EEPROM at offset 0x${offset.toString(16)}`);
      const result = await UsbNativeModule.readEEPROM(offset, length);
      console.log(`[UsbService] Read successful: ${result.data}`);
      return result;
    } catch (error) {
      console.error('[UsbService] Error reading EEPROM:', error);
      throw error;
    }
  }

  /**
   * Escribir datos a EEPROM en offset específico
   */
  async writeEEPROM(offset: number, dataHex: string): Promise<{ bytesWritten: number }> {
    if (Platform.OS !== 'android') {
      throw new Error('USB operations only available on Android');
    }

    if (this.currentDeviceId === null) {
      throw new Error('No device connected');
    }

    try {
      console.log(`[UsbService] Writing to EEPROM at offset 0x${offset.toString(16)}: ${dataHex}`);
      const result = await UsbNativeModule.writeEEPROM(offset, dataHex, MAGIC_VALUE);
      console.log(`[UsbService] Write successful: ${result.bytesWritten} bytes written`);
      return result;
    } catch (error) {
      console.error('[UsbService] Error writing EEPROM:', error);
      throw error;
    }
  }

  /**
   * Volcar contenido completo de EEPROM (256 bytes)
   */
  async dumpEEPROM(): Promise<EEPROMDumpResult> {
    if (Platform.OS !== 'android') {
      throw new Error('USB operations only available on Android');
    }

    if (this.currentDeviceId === null) {
      throw new Error('No device connected');
    }

    try {
      console.log('[UsbService] Dumping complete EEPROM...');
      const result = await UsbNativeModule.dumpEEPROM();
      console.log(`[UsbService] Dump successful: ${result.size} bytes`);
      return result;
    } catch (error) {
      console.error('[UsbService] Error dumping EEPROM:', error);
      throw error;
    }
  }

  /**
   * Spoof VID/PID para hacer adaptador compatible con MIB2
   */
  async spoofVIDPID(targetVID: number = TARGET_VID, targetPID: number = TARGET_PID): Promise<SpoofResult> {
    if (Platform.OS !== 'android') {
      throw new Error('USB operations only available on Android');
    }

    if (this.currentDeviceId === null) {
      throw new Error('No device connected');
    }

    try {
      console.log(`[UsbService] Spoofing VID/PID to ${this.formatVIDPID(targetVID, targetPID)}`);
      const result = await UsbNativeModule.spoofVIDPID(targetVID, targetPID);
      console.log(`[UsbService] Spoof ${result.success ? 'successful' : 'failed'}`);
      return result;
    } catch (error) {
      console.error('[UsbService] Error spoofing VID/PID:', error);
      throw error;
    }
  }

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
      this.scanDevices().catch(error => {
        console.error('[UsbService] Error in USB monitoring:', error);
      });
    }, 5000);
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
}

// Exportar instancia singleton
export const usbService = new UsbService();
export default usbService;
