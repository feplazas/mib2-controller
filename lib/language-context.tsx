import React, { createContext, useContext, ReactNode } from 'react';
import { getLocales } from 'expo-localization';
import i18n from './i18n';

/**
 * Language Context - Simplified version that ONLY uses system locale
 * No manual language selection, no AsyncStorage, no renderKey, no complexity
 * The app automatically displays in the device's system language
 */

interface LanguageContextType {
  currentLanguage: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Get system locale once on mount
  const systemLocale = getLocales()[0]?.languageCode || 'en';
  const supportedLanguages = ['es', 'en', 'de'];
  const currentLanguage = supportedLanguages.includes(systemLocale) ? systemLocale : 'en';
  
  // Set i18n locale to system language
  i18n.locale = currentLanguage;

  console.log('[LanguageProvider] Using system language:', currentLanguage);

  return (
    <LanguageContext.Provider value={{ currentLanguage }}>
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
  // No need for renderKey - system language never changes during app lifetime
  return (key: string, params?: Record<string, any>) => {
    return i18n.t(key, params);
  };
}
