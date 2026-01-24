/**
 * Ultra Premium Apple-like Theme Configuration
 * 
 * Inspired by iOS 18 Human Interface Guidelines
 * Refined, minimal, with premium depth and sophisticated colors
 */

/** @type {const} */
const themeColors = {
  // Primary brand color - iOS-style blue (slightly deeper)
  primary: { light: '#0071E3', dark: '#2997FF' },
  
  // Backgrounds - Pure white/rich black
  background: { light: '#FFFFFF', dark: '#000000' },
  
  // Elevated surfaces - Subtle gray for cards (warmer)
  surface: { light: '#F5F5F7', dark: '#1D1D1F' },
  
  // Secondary surface for nested elements
  surfaceSecondary: { light: '#E8E8ED', dark: '#2D2D2D' },
  
  // Tertiary surface for deep nesting
  surfaceTertiary: { light: '#D2D2D7', dark: '#3D3D3D' },
  
  // Text colors - High contrast
  foreground: { light: '#1D1D1F', dark: '#F5F5F7' },
  
  // Secondary text - Muted but readable
  muted: { light: '#86868B', dark: '#98989D' },
  
  // Tertiary text - Even more subtle
  mutedSecondary: { light: '#AEAEB2', dark: '#6E6E73' },
  
  // Borders - Ultra subtle separators
  border: { light: 'rgba(0,0,0,0.08)', dark: 'rgba(255,255,255,0.1)' },
  
  // Semantic colors - iOS 18 system colors
  success: { light: '#30D158', dark: '#32D74B' },
  warning: { light: '#FF9F0A', dark: '#FFD60A' },
  error: { light: '#FF3B30', dark: '#FF453A' },
  
  // Additional iOS colors
  teal: { light: '#5AC8FA', dark: '#64D2FF' },
  indigo: { light: '#5856D6', dark: '#5E5CE6' },
  purple: { light: '#AF52DE', dark: '#BF5AF2' },
  pink: { light: '#FF2D55', dark: '#FF375F' },
  
  // Premium accent - Subtle gold for special elements
  accent: { light: '#BF9B30', dark: '#D4AF37' },
  
  // Tab bar specific
  tabBarActive: { light: '#0071E3', dark: '#2997FF' },
  tabBarInactive: { light: '#86868B', dark: '#6E6E73' },
};

module.exports = { themeColors };
