import * as ExpoUsbHost from '@/modules/expo-usb-host';

export interface EEPROMReadResult {
  success: boolean;
  offset?: number;
  length?: number;
  data?: number[];
  error?: string;
}

export interface EEPROMWriteResult {
  success: boolean;
  bytesWritten?: number;
  error?: string;
}

export interface EEPROMDumpResult {
  success: boolean;
  data?: number[];
  size?: number;
  error?: string;
}

export interface SpoofResult {
  success: boolean;
  backup?: number[];
  oldVID?: number;
  oldPID?: number;
  newVID?: number;
  newPID?: number;
  verified?: boolean;
  error?: string;
}

/**
 * EEPROM Service
 * 
 * Provides functions to read/write EEPROM on ASIX USB-Ethernet adapters
 * for VID/PID spoofing to make them compatible with MIB2 units.
 */
export const eepromService = {
  /**
   * Magic value required for EEPROM write operations
   * This is a security feature of ASIX adapters
   */
  MAGIC_VALUE: 0xDEADBEEF,

  /**
   * EEPROM offsets for VID/PID (Little Endian)
   */
  OFFSETS: {
    VID_LOW: 0x88,
    VID_HIGH: 0x89,
    PID_LOW: 0x8A,
    PID_HIGH: 0x8B,
  },

  /**
   * Target VID/PID for D-Link DUB-E100 (Rev C1)
   * Compatible with MIB2 units
   */
  TARGET_DLINK: {
    VID: 0x2001,
    PID: 0x3C05,
  },

  /**
   * Read data from EEPROM at specific offset
   */
  async readEEPROM(offset: number, length: number): Promise<EEPROMReadResult> {
    try {
      const result = await ExpoUsbHost.readEEPROM(offset, length);
      return result as EEPROMReadResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Write data to EEPROM at specific offset
   * Requires magic value 0xDEADBEEF for authorization
   */
  async writeEEPROM(offset: number, data: number[], magicValue?: number): Promise<EEPROMWriteResult> {
    const magic = magicValue ?? 0xDEADBEEF;
    try {
      const result = await ExpoUsbHost.writeEEPROM(offset, data, magic);
      return result as EEPROMWriteResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Dump entire EEPROM content (256 bytes)
   * Useful for backup before modifications
   */
  async dumpEEPROM(): Promise<EEPROMDumpResult> {
    try {
      const result = await ExpoUsbHost.dumpEEPROM();
      return result as EEPROMDumpResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Spoof VID/PID to make adapter appear as D-Link DUB-E100
   * 
   * This function:
   * 1. Backs up current EEPROM
   * 2. Reads current VID/PID
   * 3. Writes new VID/PID
   * 4. Verifies changes
   * 
   * After successful spoofing, disconnect and reconnect the adapter
   * for changes to take effect.
   */
  async spoofVIDPID(
    targetVID?: number,
    targetPID?: number,
    magicValue?: number
  ): Promise<SpoofResult> {
    const vid = targetVID ?? 0x2001;
    const pid = targetPID ?? 0x3C05;
    const magic = magicValue ?? 0xDEADBEEF;
    try {
      const result = await ExpoUsbHost.spoofVIDPID(vid, pid, magic);
      return result as SpoofResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Format hex dump for display
   */
  formatHexDump(data: number[]): string {
    const lines: string[] = [];
    for (let i = 0; i < data.length; i += 16) {
      const chunk = data.slice(i, i + 16);
      const offset = `0x${i.toString(16).toUpperCase().padStart(4, '0')}`;
      const hex = chunk.map(b => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`).join(' ');
      lines.push(`${offset}: ${hex}`);
    }
    return lines.join('\n');
  },

  /**
   * Parse VID/PID from EEPROM data (Little Endian)
   */
  parseVIDPID(data: number[]): { vid: number; pid: number } | null {
    if (data.length < 4) return null;
    const vid = data[0] | (data[1] << 8);
    const pid = data[2] | (data[3] << 8);
    return { vid, pid };
  },

  /**
   * Format VID/PID for display
   */
  formatVIDPID(vid: number, pid: number): string {
    return `VID: 0x${vid.toString(16).toUpperCase().padStart(4, '0')}, PID: 0x${pid.toString(16).toUpperCase().padStart(4, '0')}`;
  },
};
