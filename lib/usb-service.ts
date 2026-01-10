/**
 * Servicio USB de Bajo Nivel para Android
 * Proporciona acceso a dispositivos USB mediante control transfers
 * Específicamente diseñado para reprogramación de EEPROM en adaptadores ASIX AX88772
 */

import { Platform } from 'react-native';

// Constantes USB estándar
export const USB_DIR_OUT = 0x00;
export const USB_DIR_IN = 0x80;
export const USB_TYPE_VENDOR = 0x40;
export const USB_RECIP_DEVICE = 0x00;

// Constantes específicas de ASIX AX88772
export const ASIX_VENDOR_ID = 0x0B95;
export const ASIX_PRODUCT_ID_AX88772 = 0x7720;
export const ASIX_PRODUCT_ID_AX88772A = 0x772A;
export const ASIX_PRODUCT_ID_AX88772B = 0x772B;

// D-Link DUB-E100 (objetivo del spoofing)
export const DLINK_VENDOR_ID = 0x2001;
export const DLINK_PRODUCT_ID_B1 = 0x3C05;
export const DLINK_PRODUCT_ID_C1 = 0x1A02;

// Comandos vendor-specific de ASIX para acceso a EEPROM
export const ASIX_CMD_READ_EEPROM = 0x04;
export const ASIX_CMD_WRITE_EEPROM = 0x05;
export const ASIX_CMD_WRITE_ENABLE = 0x06;

export interface UsbDevice {
  deviceId: number;
  vendorId: number;
  productId: number;
  deviceName: string;
  manufacturerName?: string;
  productName?: string;
  serialNumber?: string;
  deviceClass: number;
  deviceSubclass: number;
  interfaceCount: number;
}

export interface EEPROMData {
  offset: number;
  length: number;
  data: number[];
}

/**
 * Servicio USB para comunicación de bajo nivel con dispositivos
 */
class UsbService {
  private usbManager: any = null;
  private currentDevice: any = null;
  private connection: any = null;

  /**
   * Inicializar el servicio USB
   */
  async initialize(): Promise<boolean> {
    if (Platform.OS === 'web') {
      throw new Error('USB service not supported on web platform');
    }

    try {
      // En React Native, necesitamos usar un módulo nativo
      // Por ahora, simulamos la estructura
      // TODO: Implementar módulo nativo real con USB Host API
      
      console.log('[UsbService] Initialized');
      return true;
    } catch (error) {
      console.error('[UsbService] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Listar todos los dispositivos USB conectados
   */
  async listDevices(): Promise<UsbDevice[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      // TODO: Implementar con módulo nativo
      // const deviceList = await NativeModules.UsbModule.getDeviceList();
      
      // Simulación para desarrollo
      const devices: UsbDevice[] = [];
      
      console.log(`[UsbService] Found ${devices.length} USB devices`);
      return devices;
    } catch (error) {
      console.error('[UsbService] Failed to list devices:', error);
      return [];
    }
  }

  /**
   * Detectar adaptadores ASIX conectados
   */
  async detectAsixAdapters(): Promise<UsbDevice[]> {
    const allDevices = await this.listDevices();
    
    const asixDevices = allDevices.filter(device => 
      device.vendorId === ASIX_VENDOR_ID && (
        device.productId === ASIX_PRODUCT_ID_AX88772 ||
        device.productId === ASIX_PRODUCT_ID_AX88772A ||
        device.productId === ASIX_PRODUCT_ID_AX88772B
      )
    );

    console.log(`[UsbService] Found ${asixDevices.length} ASIX adapters`);
    return asixDevices;
  }

  /**
   * Solicitar permiso para acceder a un dispositivo USB
   */
  async requestPermission(device: UsbDevice): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      // TODO: Implementar con módulo nativo
      // const granted = await NativeModules.UsbModule.requestPermission(device.deviceId);
      
      console.log(`[UsbService] Permission requested for device ${device.deviceName}`);
      return true; // Simulación
    } catch (error) {
      console.error('[UsbService] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Abrir conexión con un dispositivo USB
   */
  async openDevice(device: UsbDevice): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      // TODO: Implementar con módulo nativo
      // this.connection = await NativeModules.UsbModule.openDevice(device.deviceId);
      this.currentDevice = device;
      
      console.log(`[UsbService] Opened connection to ${device.deviceName}`);
      return true;
    } catch (error) {
      console.error('[UsbService] Failed to open device:', error);
      return false;
    }
  }

  /**
   * Cerrar conexión con el dispositivo actual
   */
  async closeDevice(): Promise<void> {
    if (!this.connection) {
      return;
    }

    try {
      // TODO: Implementar con módulo nativo
      // await NativeModules.UsbModule.closeDevice();
      
      this.connection = null;
      this.currentDevice = null;
      
      console.log('[UsbService] Device connection closed');
    } catch (error) {
      console.error('[UsbService] Failed to close device:', error);
    }
  }

  /**
   * Ejecutar un USB control transfer
   * 
   * @param requestType Tipo de solicitud (dirección + tipo + receptor)
   * @param request Comando específico del vendor
   * @param value Valor (típicamente offset de memoria)
   * @param index Índice (típicamente interfaz)
   * @param data Buffer de datos (para escritura) o longitud (para lectura)
   * @param timeout Timeout en milisegundos
   */
  async controlTransfer(
    requestType: number,
    request: number,
    value: number,
    index: number,
    data: number[] | number,
    timeout: number = 5000
  ): Promise<number[] | number> {
    if (!this.connection) {
      throw new Error('No device connection established');
    }

    try {
      const isRead = (requestType & USB_DIR_IN) !== 0;
      const length = Array.isArray(data) ? data.length : data;

      // TODO: Implementar con módulo nativo
      // const result = await NativeModules.UsbModule.controlTransfer(
      //   requestType,
      //   request,
      //   value,
      //   index,
      //   isRead ? length : data,
      //   timeout
      // );

      console.log(`[UsbService] Control transfer: type=0x${requestType.toString(16)}, ` +
                  `req=0x${request.toString(16)}, val=0x${value.toString(16)}, ` +
                  `idx=0x${index.toString(16)}, len=${length}`);

      // Simulación para desarrollo
      if (isRead) {
        return new Array(length).fill(0);
      }
      return length;
    } catch (error) {
      console.error('[UsbService] Control transfer failed:', error);
      throw error;
    }
  }

  /**
   * Leer un byte de la EEPROM en un offset específico
   */
  async readEepromByte(offset: number): Promise<number> {
    const requestType = USB_DIR_IN | USB_TYPE_VENDOR | USB_RECIP_DEVICE;
    
    const result = await this.controlTransfer(
      requestType,
      ASIX_CMD_READ_EEPROM,
      offset,
      0,
      1, // Leer 1 byte
      5000
    );

    if (Array.isArray(result) && result.length > 0) {
      return result[0];
    }
    
    throw new Error(`Failed to read EEPROM at offset 0x${offset.toString(16)}`);
  }

  /**
   * Leer múltiples bytes de la EEPROM
   */
  async readEeprom(offset: number, length: number): Promise<number[]> {
    const data: number[] = [];
    
    for (let i = 0; i < length; i++) {
      const byte = await this.readEepromByte(offset + i);
      data.push(byte);
    }

    console.log(`[UsbService] Read ${length} bytes from EEPROM at offset 0x${offset.toString(16)}`);
    return data;
  }

  /**
   * Habilitar escritura en EEPROM (requerido antes de escribir)
   */
  async enableEepromWrite(): Promise<void> {
    const requestType = USB_DIR_OUT | USB_TYPE_VENDOR | USB_RECIP_DEVICE;
    
    await this.controlTransfer(
      requestType,
      ASIX_CMD_WRITE_ENABLE,
      0,
      0,
      [],
      5000
    );

    console.log('[UsbService] EEPROM write enabled');
  }

  /**
   * Escribir un byte en la EEPROM en un offset específico
   */
  async writeEepromByte(offset: number, value: number): Promise<void> {
    // Primero habilitar escritura
    await this.enableEepromWrite();

    const requestType = USB_DIR_OUT | USB_TYPE_VENDOR | USB_RECIP_DEVICE;
    
    await this.controlTransfer(
      requestType,
      ASIX_CMD_WRITE_EEPROM,
      offset,
      0,
      [value],
      5000
    );

    console.log(`[UsbService] Wrote 0x${value.toString(16)} to EEPROM at offset 0x${offset.toString(16)}`);

    // Pequeña espera para que el chip procese la escritura
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  /**
   * Escribir múltiples bytes en la EEPROM
   */
  async writeEeprom(offset: number, data: number[]): Promise<void> {
    for (let i = 0; i < data.length; i++) {
      await this.writeEepromByte(offset + i, data[i]);
    }

    console.log(`[UsbService] Wrote ${data.length} bytes to EEPROM at offset 0x${offset.toString(16)}`);
  }

  /**
   * Verificar escritura leyendo de vuelta los datos
   */
  async verifyEepromWrite(offset: number, expectedData: number[]): Promise<boolean> {
    const actualData = await this.readEeprom(offset, expectedData.length);
    
    for (let i = 0; i < expectedData.length; i++) {
      if (actualData[i] !== expectedData[i]) {
        console.error(`[UsbService] Verification failed at offset 0x${(offset + i).toString(16)}: ` +
                      `expected 0x${expectedData[i].toString(16)}, got 0x${actualData[i].toString(16)}`);
        return false;
      }
    }

    console.log(`[UsbService] Verification successful for ${expectedData.length} bytes`);
    return true;
  }

  /**
   * Obtener información del dispositivo actual
   */
  getCurrentDevice(): UsbDevice | null {
    return this.currentDevice;
  }

  /**
   * Verificar si hay una conexión activa
   */
  isConnected(): boolean {
    return this.connection !== null && this.currentDevice !== null;
  }
}

// Exportar instancia singleton
export const usbService = new UsbService();
