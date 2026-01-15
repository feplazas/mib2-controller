import { describe, it, expect } from 'vitest';
import { getChipsetCompatibility, canAttemptSpoofing, getCompatibilityMessageKey } from '../lib/chipset-compatibility';

describe('chipset-compatibility', () => {
  describe('getChipsetCompatibility', () => {
    it('should identify AX88772A as confirmed compatible', () => {
      const result = getChipsetCompatibility('AX88772A');
      expect(result).toBe('confirmed');
    });

    it('should identify AX88772B as confirmed compatible', () => {
      const result = getChipsetCompatibility('AX88772B');
      expect(result).toBe('confirmed');
    });

    it('should identify AX88772 as confirmed compatible', () => {
      const result = getChipsetCompatibility('AX88772');
      expect(result).toBe('confirmed');
    });

    it('should identify AX88179 as experimental', () => {
      const result = getChipsetCompatibility('AX88179');
      expect(result).toBe('experimental');
    });

    it('should identify AX88178 as experimental', () => {
      const result = getChipsetCompatibility('AX88178');
      expect(result).toBe('experimental');
    });

    it('should identify RTL8152 as unknown', () => {
      const result = getChipsetCompatibility('RTL8152');
      expect(result).toBe('unknown');
    });

    it('should handle unknown chipsets', () => {
      const result = getChipsetCompatibility('Unknown');
      expect(result).toBe('unknown');
    });

    it('should handle empty string', () => {
      const result = getChipsetCompatibility('');
      expect(result).toBe('unknown');
    });

    it('should be case-insensitive', () => {
      expect(getChipsetCompatibility('ax88772a')).toBe('confirmed');
      expect(getChipsetCompatibility('AX88772a')).toBe('confirmed');
      expect(getChipsetCompatibility('ax88179')).toBe('experimental');
    });
  });

  describe('canAttemptSpoofing', () => {
    it('should allow spoofing for confirmed chipsets', () => {
      expect(canAttemptSpoofing('confirmed')).toBe(true);
    });

    it('should allow spoofing for experimental chipsets', () => {
      expect(canAttemptSpoofing('experimental')).toBe(true);
    });

    it('should block spoofing for incompatible chipsets', () => {
      expect(canAttemptSpoofing('incompatible')).toBe(false);
    });

    it('should block spoofing for unknown chipsets', () => {
      expect(canAttemptSpoofing('unknown')).toBe(false);
    });
  });

  describe('getCompatibilityMessageKey', () => {
    it('should return confirmed message key', () => {
      const key = getCompatibilityMessageKey('confirmed');
      expect(key).toBe('chipset.confirmed_message');
    });

    it('should return experimental message key', () => {
      const key = getCompatibilityMessageKey('experimental');
      expect(key).toBe('chipset.experimental_message');
    });

    it('should return incompatible message key', () => {
      const key = getCompatibilityMessageKey('incompatible');
      expect(key).toBe('chipset.incompatible_message');
    });

    it('should return unknown message key', () => {
      const key = getCompatibilityMessageKey('unknown');
      expect(key).toBe('chipset.unknown_message');
    });
  });

  describe('Edge cases', () => {
    it('should handle chipset names with extra whitespace', () => {
      expect(getChipsetCompatibility('  AX88772A  ')).toBe('confirmed');
    });

    it('should handle chipset names with mixed case', () => {
      expect(getChipsetCompatibility('Ax88772a')).toBe('confirmed');
    });

    it('should handle partial chipset names', () => {
      // "AX88772" should match AX88772, AX88772A, AX88772B
      expect(getChipsetCompatibility('AX88772')).toBe('confirmed');
    });
  });
});
