import { requireNativeModule } from 'expo-modules-core';

export interface UsbDevice {
  deviceId: number;
  vendorId: number;
  productId: number;
  deviceName: string;
  manufacturer: string;
  product: string;
  serialNumber: string;
  deviceClass: number;
  deviceSubclass: number;
  interfaceCount: number;
  chipset: string;
}

export interface EEPROMReadResult {
  data: string; // Hex string
  bytes: number[];
}

export interface EEPROMDumpResult {
  data: string; // Hex string
  bytes: number[];
  size: number;
}

export interface SpoofResult {
  success: boolean;
  previousVID: number;
  previousPID: number;
  newVID: number;
  newPID: number;
}

interface UsbNativeModuleInterface {
  getDeviceList(): UsbDevice[];
  requestPermission(deviceId: number): Promise<boolean>;
  openDevice(deviceId: number): Promise<boolean>;
  closeDevice(): boolean;
  readEEPROM(offset: number, length: number): Promise<EEPROMReadResult>;
  writeEEPROM(offset: number, dataHex: string, magicValue: number): Promise<{ bytesWritten: number }>;
  dumpEEPROM(): Promise<EEPROMDumpResult>;
  spoofVIDPID(targetVID: number, targetPID: number): Promise<SpoofResult>;
}

const UsbNativeModule = requireNativeModule<UsbNativeModuleInterface>('UsbNative');

export default UsbNativeModule;
