import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Platform, NativeModules } from 'react-native';
import i18n from './i18n';

/**
 * Language Context - Uses React Native's built-in locale detection
 * Works reliably in production builds by using Platform.select and NativeModules
 */

interface LanguageContextType {
  currentLanguage: string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Get system language using React Native's native modules
 * This is more reliable than expo-localization in production builds
 */
function getSystemLanguage(): string {
  try {
    let systemLocale = 'en';
    
    if (Platform.OS === 'android') {
      // Android: Use NativeModules to get locale
      const localeString = NativeModules.I18nManager?.localeIdentifier || 
                          NativeModules.SettingsManager?.settings?.AppleLocale ||
                          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                          'en_US';
      
      console.log('[getSystemLanguage] Android localeIdentifier:', localeString);
      
      // Extract language code (e.g., "en_US" -> "en", "es_ES" -> "es")
      systemLocale = localeString.split('_')[0].toLowerCase();
    } else if (Platform.OS === 'ios') {
      // iOS: Use NativeModules
      const localeString = NativeModules.SettingsManager?.settings?.AppleLocale ||
                          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                          'en';
      
      console.log('[getSystemLanguage] iOS locale:', localeString);
      
      systemLocale = localeString.split('_')[0].split('-')[0].toLowerCase();
    }
    
    console.log('[getSystemLanguage] Detected language:', systemLocale);
    return systemLocale;
  } catch (error) {
    console.error('[getSystemLanguage] Error detecting language:', error);
    return 'en';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Detect system language AFTER React Native is ready
    const systemLanguage = getSystemLanguage();
    const supportedLanguages = ['es', 'en', 'de'];
    const detectedLanguage = supportedLanguages.includes(systemLanguage) ? systemLanguage : 'en';
    
    // Set i18n locale
    i18n.locale = detectedLanguage;
    setCurrentLanguage(detectedLanguage);
    setIsReady(true);

    console.log('[LanguageProvider] System language:', systemLanguage);
    console.log('[LanguageProvider] Using language:', detectedLanguage);
    console.log('[LanguageProvider] i18n.locale set to:', i18n.locale);
  }, []);

  // Don't render children until language is ready
  if (!isReady) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

/**
 * Hook to get translation function
 * Returns a function that translates keys using i18n
 */
export function useTranslation() {
  const { isReady } = useLanguage();
  
  return (key: string, params?: Record<string, any>) => {
    if (!isReady) {
      return key; // Fallback while loading
    }
    return i18n.t(key, params);
  };
}
