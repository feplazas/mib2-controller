import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

// Theme mode: 'system' follows device, 'light'/'dark' are manual overrides
type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  colorScheme: ColorScheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  // Legacy support
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = '@mib2_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get system color scheme using React Native hook
  const systemSchemeFromHook = useSystemColorScheme();
  
  // Also get it directly from Appearance API for more reliability
  const [systemSchemeFromAppearance, setSystemSchemeFromAppearance] = useState<ColorScheme>(
    () => (Appearance.getColorScheme() as ColorScheme) ?? "light"
  );
  
  // Use the most reliable source - prefer Appearance API as it's more direct
  const systemScheme: ColorScheme = systemSchemeFromAppearance ?? systemSchemeFromHook ?? "light";
  
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Track if we've applied the initial scheme
  const hasAppliedInitial = useRef(false);

  // Calculate actual color scheme based on mode
  const colorScheme: ColorScheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme;
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    console.log('[ThemeProvider] Applying scheme:', scheme);
    nativewindColorScheme.set(scheme);
    // Don't call Appearance.setColorScheme as it can interfere with detection
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  // Load saved theme mode on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        console.log('[ThemeProvider] Loaded saved mode:', savedMode);
        if (savedMode && ['system', 'light', 'dark'].includes(savedMode)) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme mode:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadThemeMode();
  }, []);

  // Apply scheme when colorScheme changes
  useEffect(() => {
    if (isLoaded) {
      applyScheme(colorScheme);
      hasAppliedInitial.current = true;
    }
  }, [applyScheme, colorScheme, isLoaded]);

  // Listen to system theme changes - always listen, but only react when in 'system' mode
  useEffect(() => {
    console.log('[ThemeProvider] Setting up Appearance listener, current mode:', themeMode);
    
    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      console.log('[ThemeProvider] Appearance changed to:', newScheme, 'themeMode:', themeMode);
      
      // Update our local state of system scheme
      if (newScheme) {
        setSystemSchemeFromAppearance(newScheme as ColorScheme);
      }
      
      // Only apply if we're in system mode
      if (themeMode === 'system' && newScheme) {
        console.log('[ThemeProvider] Applying new system scheme:', newScheme);
        applyScheme(newScheme as ColorScheme);
      }
    });

    return () => {
      console.log('[ThemeProvider] Removing Appearance listener');
      subscription.remove();
    };
  }, [themeMode, applyScheme]);

  // Set theme mode and persist
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    console.log('[ThemeProvider] Setting theme mode to:', mode);
    setThemeModeState(mode);
    
    // If switching to system mode, immediately apply the current system scheme
    if (mode === 'system') {
      const currentSystemScheme = Appearance.getColorScheme() as ColorScheme ?? 'light';
      console.log('[ThemeProvider] Switching to system mode, current system scheme:', currentSystemScheme);
      setSystemSchemeFromAppearance(currentSystemScheme);
      applyScheme(currentSystemScheme);
    }
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme mode:', error);
    }
  }, [applyScheme]);

  // Legacy support - directly set color scheme (sets manual mode)
  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setThemeMode(scheme);
  }, [setThemeMode]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      themeMode,
      setThemeMode,
      setColorScheme,
    }),
    [colorScheme, themeMode, setThemeMode, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
