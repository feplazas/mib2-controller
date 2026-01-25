/**
 * Ultra Premium Apple iOS 18 Theme Configuration Types
 */

export const themeColors: {
  // Primary
  primary: { light: string; dark: string };
  
  // Backgrounds
  background: { light: string; dark: string };
  surface: { light: string; dark: string };
  surfaceSecondary: { light: string; dark: string };
  surfaceTertiary: { light: string; dark: string };
  
  // Text
  foreground: { light: string; dark: string };
  muted: { light: string; dark: string };
  mutedSecondary: { light: string; dark: string };
  mutedTertiary: { light: string; dark: string };
  
  // Borders
  border: { light: string; dark: string };
  separator: { light: string; dark: string };
  
  // Semantic
  success: { light: string; dark: string };
  warning: { light: string; dark: string };
  error: { light: string; dark: string };
  
  // Extended iOS colors
  teal: { light: string; dark: string };
  cyan: { light: string; dark: string };
  indigo: { light: string; dark: string };
  purple: { light: string; dark: string };
  pink: { light: string; dark: string };
  mint: { light: string; dark: string };
  brown: { light: string; dark: string };
  
  // Special
  accent: { light: string; dark: string };
  link: { light: string; dark: string };
  
  // Tab bar
  tabBarActive: { light: string; dark: string };
  tabBarInactive: { light: string; dark: string };
  
  // Fills
  fill: { light: string; dark: string };
  fillSecondary: { light: string; dark: string };
  fillTertiary: { light: string; dark: string };
};

export const designSystem: {
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    largeTitle: { size: number; weight: string; lineHeight: number };
    title1: { size: number; weight: string; lineHeight: number };
    title2: { size: number; weight: string; lineHeight: number };
    title3: { size: number; weight: string; lineHeight: number };
    headline: { size: number; weight: string; lineHeight: number };
    body: { size: number; weight: string; lineHeight: number };
    callout: { size: number; weight: string; lineHeight: number };
    subheadline: { size: number; weight: string; lineHeight: number };
    footnote: { size: number; weight: string; lineHeight: number };
    caption1: { size: number; weight: string; lineHeight: number };
    caption2: { size: number; weight: string; lineHeight: number };
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
};

declare const themeConfig: {
  themeColors: typeof themeColors;
  designSystem: typeof designSystem;
};

export default themeConfig;
