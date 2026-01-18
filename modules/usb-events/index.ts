import { EventEmitter, requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

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

// Mock module for web platform
const mockModule = {
  startListening: () => ({ success: false, message: 'Not available on web' }),
  stopListening: () => ({ success: false, message: 'Not available on web' }),
  isListening: () => false,
};

const UsbEventModule = Platform.OS === 'android' 
  ? requireNativeModule('UsbEventModule')
  : mockModule;

const emitter = Platform.OS === 'android' 
  ? new EventEmitter(UsbEventModule)
  : null;

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
  if (!emitter) return { remove: () => {} };
  return (emitter as any).addListener('onUsbDeviceAttached', listener);
}

/**
 * Suscribirse a eventos de desconexión de dispositivos USB
 */
export function addUsbDetachedListener(listener: (device: UsbDeviceDetachedInfo) => void) {
  if (!emitter) return { remove: () => {} };
  return (emitter as any).addListener('onUsbDeviceDetached', listener);
}

/**
 * Remover todos los listeners
 */
export function removeAllListeners() {
  if (!emitter) return;
  (emitter as any).removeAllListeners('onUsbDeviceAttached');
  (emitter as any).removeAllListeners('onUsbDeviceDetached');
}
