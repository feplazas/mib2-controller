import { EventEmitter, requireNativeModule } from 'expo-modules-core';

export interface UsbDeviceInfo {
  deviceName: string;
  vendorId: number;
  productId: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  manufacturerName: string;
  productName: string;
  serialNumber: string;
}

export interface UsbDeviceDetachedInfo {
  deviceName: string;
  vendorId: number;
  productId: number;
}

export interface UsbEventResult {
  success: boolean;
  message: string;
}

const UsbEventModule = requireNativeModule('UsbEventModule');
const emitter = new EventEmitter(UsbEventModule);

/**
 * Iniciar escucha de eventos USB
 * Registra BroadcastReceiver para detectar conexión/desconexión automáticamente
 */
export function startListening(): UsbEventResult {
  return UsbEventModule.startListening();
}

/**
 * Detener escucha de eventos USB
 */
export function stopListening(): UsbEventResult {
  return UsbEventModule.stopListening();
}

/**
 * Verificar si está escuchando eventos USB
 */
export function isListening(): boolean {
  return UsbEventModule.isListening();
}

/**
 * Suscribirse a eventos de conexión de dispositivos USB
 */
export function addUsbAttachedListener(listener: (device: UsbDeviceInfo) => void) {
  return (emitter as any).addListener('onUsbDeviceAttached', listener);
}

/**
 * Suscribirse a eventos de desconexión de dispositivos USB
 */
export function addUsbDetachedListener(listener: (device: UsbDeviceDetachedInfo) => void) {
  return (emitter as any).addListener('onUsbDeviceDetached', listener);
}

/**
 * Remover todos los listeners
 */
export function removeAllListeners() {
  (emitter as any).removeAllListeners('onUsbDeviceAttached');
  (emitter as any).removeAllListeners('onUsbDeviceDetached');
}
