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

/**
 * Read EEPROM data from ASIX adapter
 */
export async function readEEPROM(offset: number, length: number): Promise<any> {
  return await ExpoUsbHostModule.readEEPROM(offset, length);
}

/**
 * Write EEPROM data to ASIX adapter
 */
export async function writeEEPROM(offset: number, data: number[], magicValue: number): Promise<any> {
  return await ExpoUsbHostModule.writeEEPROM(offset, data, magicValue);
}

/**
 * Dump entire EEPROM content (256 bytes)
 */
export async function dumpEEPROM(): Promise<any> {
  return await ExpoUsbHostModule.dumpEEPROM();
}

/**
 * Spoof VID/PID to make adapter appear as D-Link DUB-E100
 */
export async function spoofVIDPID(targetVID: number, targetPID: number, magicValue: number): Promise<any> {
  return await ExpoUsbHostModule.spoofVIDPID(targetVID, targetPID, magicValue);
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
