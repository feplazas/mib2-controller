import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

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

export interface EEPROMTypeResult {
  type: 'external_eeprom' | 'efuse' | 'unknown';
  writable: boolean;
  reason: string;
}

interface UsbNativeModuleInterface {
  getDeviceList(): UsbDevice[];
  requestPermission(deviceId: number): Promise<boolean>;
  openDevice(deviceId: number): Promise<boolean>;
  closeDevice(): boolean;
  readEEPROM(offset: number, length: number): Promise<EEPROMReadResult>;
  writeEEPROM(offset: number, dataHex: string, magicValue: number, skipVerification: boolean): Promise<{ bytesWritten: number; verified: boolean }>;
  dumpEEPROM(): Promise<EEPROMDumpResult>;
  detectEEPROMType(): Promise<EEPROMTypeResult>;
  spoofVIDPID(targetVID: number, targetPID: number, magicValue: number): Promise<SpoofResult>;
}

// Mock module for web platform
const mockModule: UsbNativeModuleInterface = {
  getDeviceList: () => [],
  requestPermission: async () => false,
  openDevice: async () => false,
  closeDevice: () => false,
  readEEPROM: async () => ({ data: '', bytes: [] }),
  writeEEPROM: async () => ({ bytesWritten: 0, verified: false }),
  dumpEEPROM: async () => ({ data: '', bytes: [], size: 0 }),
  detectEEPROMType: async () => ({ type: 'unknown', writable: false, reason: 'Not available on web' }),
  spoofVIDPID: async () => ({ success: false, previousVID: 0, previousPID: 0, newVID: 0, newPID: 0 }),
};

const UsbNativeModule = Platform.OS === 'android' 
  ? requireNativeModule<UsbNativeModuleInterface>('UsbNative')
  : mockModule;

export default UsbNativeModule;
