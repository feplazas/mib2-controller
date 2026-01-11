import { NativeModulesProxy } from 'expo-modules-core';

const ExpoUsbHostModule = NativeModulesProxy.ExpoUsbHost as any;

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

export interface ControlTransferParams {
  requestType: number;
  request: number;
  value: number;
  index: number;
  data?: number[];
  length?: number;
  timeout?: number;
}

/**
 * Get list of all connected USB devices
 */
export async function getDeviceList(): Promise<UsbDevice[]> {
  return await ExpoUsbHostModule.getDeviceList();
}

/**
 * Request permission to access a USB device
 */
export async function requestPermission(deviceId: number): Promise<boolean> {
  return await ExpoUsbHostModule.requestPermission(deviceId);
}

/**
 * Open connection to a USB device
 */
export async function openDevice(deviceId: number): Promise<boolean> {
  return await ExpoUsbHostModule.openDevice(deviceId);
}

/**
 * Close connection to the currently open device
 */
export async function closeDevice(): Promise<void> {
  return await ExpoUsbHostModule.closeDevice();
}

/**
 * Perform a USB control transfer
 */
export async function controlTransfer(params: ControlTransferParams): Promise<number[]> {
  return await ExpoUsbHostModule.controlTransfer(
    params.requestType,
    params.request,
    params.value,
    params.index,
    params.data || [],
    params.length || 0,
    params.timeout || 5000
  );
}

/**
 * Check if a device has permission
 */
export async function hasPermission(deviceId: number): Promise<boolean> {
  return await ExpoUsbHostModule.hasPermission(deviceId);
}

// Event listeners for USB device attach/detach events
export function addUsbDeviceAttachedListener(listener: (device: UsbDevice) => void) {
  // TODO: Implement event listener when native module supports it
  console.warn('[ExpoUsbHost] Event listeners not yet implemented');
  return { remove: () => {} };
}

export function addUsbDeviceDetachedListener(listener: (device: UsbDevice) => void) {
  // TODO: Implement event listener when native module supports it
  console.warn('[ExpoUsbHost] Event listeners not yet implemented');
  return { remove: () => {} };
}
