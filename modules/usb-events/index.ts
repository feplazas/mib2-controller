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

export interface ForceRefreshResult {
  success: boolean;
  devices: Array<UsbDeviceInfo & { hasPermission: boolean }>;
  count: number;
  message?: string;
}

export interface PermissionResult {
  success: boolean;
  message: string;
  granted: number;
  pending: number;
  total: number;
}

// Mock module for web platform
const mockModule = {
  startListening: () => ({ success: false, message: 'Not available on web' }),
  stopListening: () => ({ success: false, message: 'Not available on web' }),
  isListening: () => false,
  forceRefreshDevices: () => ({ success: false, devices: [], count: 0, message: 'Not available on web' }),
  requestPermissionForAll: async () => ({ success: false, message: 'Not available on web', granted: 0, pending: 0, total: 0 }),
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

/**
 * Forzar refresco de dispositivos USB
 * Enumera todos los dispositivos conectados actualmente sin necesidad de reconectar
 * Incluye información sobre si cada dispositivo tiene permisos
 */
export function forceRefreshDevices(): ForceRefreshResult {
  return UsbEventModule.forceRefreshDevices();
}

/**
 * Solicitar permisos para todos los dispositivos USB conectados
 * Esto permite que el refresh funcione sin necesidad de reconectar
 * @returns Promesa con el resultado de las solicitudes de permisos
 */
export async function requestPermissionForAll(): Promise<PermissionResult> {
  return UsbEventModule.requestPermissionForAll();
}

/**
 * Suscribirse a eventos de resultado de permisos USB
 */
export function addUsbPermissionListener(listener: (result: { deviceName: string; granted: boolean }) => void) {
  if (!emitter) return { remove: () => {} };
  return (emitter as any).addListener('onUsbPermissionResult', listener);
}
