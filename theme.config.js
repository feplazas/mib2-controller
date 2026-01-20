/**
 * Premium Apple-like Theme Configuration
 * 
 * Inspired by iOS Human Interface Guidelines
 * Clean, minimal, with subtle depth and refined colors
 */

/** @type {const} */
const themeColors = {
  // Primary brand color - iOS-style blue
  primary: { light: '#007AFF', dark: '#0A84FF' },
  
  // Backgrounds - Pure white/black with subtle warmth
  background: { light: '#FFFFFF', dark: '#000000' },
  
  // Elevated surfaces - Subtle gray for cards
  surface: { light: '#F2F2F7', dark: '#1C1C1E' },
  
  // Secondary surface for nested elements
  surfaceSecondary: { light: '#E5E5EA', dark: '#2C2C2E' },
  
  // Tertiary surface for deep nesting
  surfaceTertiary: { light: '#D1D1D6', dark: '#3A3A3C' },
  
  // Text colors - High contrast
  foreground: { light: '#000000', dark: '#FFFFFF' },
  
  // Secondary text - Muted but readable
  muted: { light: '#8E8E93', dark: '#8E8E93' },
  
  // Tertiary text - Even more subtle
  mutedSecondary: { light: '#AEAEB2', dark: '#636366' },
  
  // Borders - Subtle separators
  border: { light: '#C6C6C8', dark: '#38383A' },
  
  // Semantic colors - iOS system colors
  success: { light: '#34C759', dark: '#30D158' },
  warning: { light: '#FF9500', dark: '#FF9F0A' },
  error: { light: '#FF3B30', dark: '#FF453A' },
  
  // Additional iOS colors
  teal: { light: '#5AC8FA', dark: '#64D2FF' },
  indigo: { light: '#5856D6', dark: '#5E5CE6' },
  purple: { light: '#AF52DE', dark: '#BF5AF2' },
  pink: { light: '#FF2D55', dark: '#FF375F' },
  
  // Premium accent - Subtle gold for special elements
  accent: { light: '#C7A44A', dark: '#D4AF37' },
  
  // Tab bar specific
  tabBarActive: { light: '#007AFF', dark: '#0A84FF' },
  tabBarInactive: { light: '#8E8E93', dark: '#636366' },
};

module.exports = { themeColors };
