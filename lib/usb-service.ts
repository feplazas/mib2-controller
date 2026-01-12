import { Platform } from 'react-native';
import UsbNativeModule, { type UsbDevice as NativeUsbDevice, type EEPROMReadResult, type EEPROMDumpResult, type SpoofResult } from '../modules/usb-native';
import { usbLogger } from './usb-logger';

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
      usbLogger.info('scan', 'Escaneando dispositivos USB...');
      this.devices = UsbNativeModule.getDeviceList();
      usbLogger.success('scan', `Encontrados ${this.devices.length} dispositivos USB`, 
        this.devices.map(d => `${d.deviceName} (${d.vendorId.toString(16)}:${d.productId.toString(16)})`)  
      );
      
      this.notifyListeners();
      return this.devices;
    } catch (error: any) {
      usbLogger.error('scan', 'Error al escanear dispositivos', error.message);
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
      usbLogger.info('permission', `Solicitando permisos para dispositivo ${deviceId}...`);
      const granted = await UsbNativeModule.requestPermission(deviceId);
      if (granted) {
        usbLogger.success('permission', `Permisos concedidos para dispositivo ${deviceId}`);
      } else {
        usbLogger.warning('permission', `Permisos denegados para dispositivo ${deviceId}`);
      }
      return granted;
    } catch (error: any) {
      usbLogger.error('permission', 'Error al solicitar permisos', error.message);
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
      usbLogger.info('connect', `Abriendo conexión a dispositivo ${deviceId}...`);
      const opened = await UsbNativeModule.openDevice(deviceId);
      if (opened) {
        this.currentDeviceId = deviceId;
        usbLogger.success('connect', `Dispositivo ${deviceId} conectado exitosamente`);
      } else {
        usbLogger.error('connect', `No se pudo abrir dispositivo ${deviceId}`);
      }
      return opened;
    } catch (error: any) {
      usbLogger.error('connect', 'Error al abrir dispositivo', error.message);
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
      usbLogger.info('disconnect', 'Cerrando dispositivo USB...');
      const closed = UsbNativeModule.closeDevice();
      if (closed) {
        this.currentDeviceId = null;
        usbLogger.success('disconnect', 'Dispositivo desconectado exitosamente');
      } else {
        usbLogger.warning('disconnect', 'No se pudo cerrar el dispositivo');
      }
      return closed;
    } catch (error: any) {
      usbLogger.error('disconnect', 'Error al cerrar dispositivo', error.message);
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
      usbLogger.info('read', `Leyendo ${length} bytes desde EEPROM offset 0x${offset.toString(16)}...`);
      const result = await UsbNativeModule.readEEPROM(offset, length);
      usbLogger.success('read', `Lectura exitosa: ${length} bytes`, `Data: ${result.data.substring(0, 32)}${result.data.length > 32 ? '...' : ''}`);
      return result;
    } catch (error: any) {
      usbLogger.error('read', 'Error al leer EEPROM', error.message);
      throw error;
    }
  }

  /**
   * Escribir datos a EEPROM en offset específico
   */
  async writeEEPROM(offset: number, dataHex: string, skipVerification: boolean = false): Promise<{ bytesWritten: number; verified: boolean }> {
    if (Platform.OS !== 'android') {
      throw new Error('USB operations only available on Android');
    }

    if (this.currentDeviceId === null) {
      throw new Error('No device connected');
    }

    try {
      const mode = skipVerification ? '(SIN VERIFICACIÓN)' : '(con verificación)';
      usbLogger.info('write', `Escribiendo en EEPROM offset 0x${offset.toString(16)} ${mode}...`, `Data: ${dataHex}`);
      const result = await UsbNativeModule.writeEEPROM(offset, dataHex, MAGIC_VALUE, skipVerification);
      
      if (skipVerification) {
        usbLogger.warning('write', `Escritura completada: ${result.bytesWritten} bytes (verificación omitida)`);
      } else {
        usbLogger.success('write', `Escritura y verificación exitosa: ${result.bytesWritten} bytes`);
      }
      
      return result;
    } catch (error: any) {
      usbLogger.error('write', 'Error al escribir EEPROM', error.message);
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
      usbLogger.info('dump', 'Volcando EEPROM completa (256 bytes)...');
      const result = await UsbNativeModule.dumpEEPROM();
      usbLogger.success('dump', `Volcado exitoso: ${result.size} bytes`);
      return result;
    } catch (error: any) {
      usbLogger.error('dump', 'Error al volcar EEPROM', error.message);
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
