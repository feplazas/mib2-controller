/**
 * Ultra Premium Apple iOS 18 Theme Configuration
 * 
 * Inspired by Apple Human Interface Guidelines (HIG)
 * Refined, minimal, with premium depth and sophisticated colors
 * 
 * Design System v2.0 - January 2026
 */

/** @type {const} */
const themeColors = {
  // ═══════════════════════════════════════════════════════════════
  // PRIMARY BRAND COLOR - iOS System Blue
  // ═══════════════════════════════════════════════════════════════
  primary: { light: '#007AFF', dark: '#0A84FF' },
  
  // ═══════════════════════════════════════════════════════════════
  // BACKGROUNDS - Pure iOS style
  // ═══════════════════════════════════════════════════════════════
  // Main background - Pure white/rich black
  background: { light: '#FFFFFF', dark: '#000000' },
  
  // Elevated surfaces - iOS grouped background style
  surface: { light: '#F2F2F7', dark: '#1C1C1E' },
  
  // Secondary surface for nested elements (cards within cards)
  surfaceSecondary: { light: '#E5E5EA', dark: '#2C2C2E' },
  
  // Tertiary surface for deep nesting
  surfaceTertiary: { light: '#D1D1D6', dark: '#3A3A3C' },
  
  // ═══════════════════════════════════════════════════════════════
  // TEXT COLORS - High contrast accessibility
  // ═══════════════════════════════════════════════════════════════
  // Primary text - Maximum contrast
  foreground: { light: '#000000', dark: '#FFFFFF' },
  
  // Secondary text - iOS secondary label
  muted: { light: '#8E8E93', dark: '#8E8E93' },
  
  // Tertiary text - Even more subtle
  mutedSecondary: { light: '#AEAEB2', dark: '#636366' },
  
  // Quaternary text - Placeholder style
  mutedTertiary: { light: '#C7C7CC', dark: '#48484A' },
  
  // ═══════════════════════════════════════════════════════════════
  // BORDERS & SEPARATORS - Ultra subtle iOS style
  // ═══════════════════════════════════════════════════════════════
  border: { light: 'rgba(60,60,67,0.12)', dark: 'rgba(84,84,88,0.65)' },
  
  // Separator for lists (thinner than border)
  separator: { light: 'rgba(60,60,67,0.08)', dark: 'rgba(84,84,88,0.36)' },
  
  // ═══════════════════════════════════════════════════════════════
  // SEMANTIC COLORS - iOS 18 System Colors
  // ═══════════════════════════════════════════════════════════════
  success: { light: '#34C759', dark: '#30D158' },
  warning: { light: '#FF9500', dark: '#FF9F0A' },
  error: { light: '#FF3B30', dark: '#FF453A' },
  
  // ═══════════════════════════════════════════════════════════════
  // EXTENDED iOS SYSTEM COLORS
  // ═══════════════════════════════════════════════════════════════
  teal: { light: '#5AC8FA', dark: '#64D2FF' },
  cyan: { light: '#32ADE6', dark: '#64D2FF' },
  indigo: { light: '#5856D6', dark: '#5E5CE6' },
  purple: { light: '#AF52DE', dark: '#BF5AF2' },
  pink: { light: '#FF2D55', dark: '#FF375F' },
  mint: { light: '#00C7BE', dark: '#63E6E2' },
  brown: { light: '#A2845E', dark: '#AC8E68' },
  
  // ═══════════════════════════════════════════════════════════════
  // SPECIAL ACCENTS
  // ═══════════════════════════════════════════════════════════════
  // Premium gold accent for special elements
  accent: { light: '#FFD60A', dark: '#FFD60A' },
  
  // Link color
  link: { light: '#007AFF', dark: '#0A84FF' },
  
  // ═══════════════════════════════════════════════════════════════
  // TAB BAR SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  tabBarActive: { light: '#007AFF', dark: '#0A84FF' },
  tabBarInactive: { light: '#8E8E93', dark: '#8E8E93' },
  
  // ═══════════════════════════════════════════════════════════════
  // FILLS - iOS standard fills for buttons/controls
  // ═══════════════════════════════════════════════════════════════
  fill: { light: 'rgba(120,120,128,0.2)', dark: 'rgba(120,120,128,0.32)' },
  fillSecondary: { light: 'rgba(120,120,128,0.16)', dark: 'rgba(120,120,128,0.24)' },
  fillTertiary: { light: 'rgba(120,120,128,0.12)', dark: 'rgba(120,120,128,0.18)' },
};

/**
 * iOS Design System Constants
 * Based on Apple Human Interface Guidelines
 */
const designSystem = {
  // Spacing scale (8px grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius scale
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  
  // Typography scale (iOS Dynamic Type)
  typography: {
    largeTitle: { size: 34, weight: '700', lineHeight: 41 },
    title1: { size: 28, weight: '700', lineHeight: 34 },
    title2: { size: 22, weight: '700', lineHeight: 28 },
    title3: { size: 20, weight: '600', lineHeight: 25 },
    headline: { size: 17, weight: '600', lineHeight: 22 },
    body: { size: 17, weight: '400', lineHeight: 22 },
    callout: { size: 16, weight: '400', lineHeight: 21 },
    subheadline: { size: 15, weight: '400', lineHeight: 20 },
    footnote: { size: 13, weight: '400', lineHeight: 18 },
    caption1: { size: 12, weight: '400', lineHeight: 16 },
    caption2: { size: 11, weight: '400', lineHeight: 13 },
  },
  
  // Shadow presets
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

module.exports = { themeColors, designSystem };
