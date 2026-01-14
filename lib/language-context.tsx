import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { getLocales } from 'expo-localization';
import i18n from './i18n';

/**
 * Language Context - Simplified version that ONLY uses system locale
 * No manual language selection, no AsyncStorage, no complexity
 * The app automatically displays in the device's system language
 */

interface LanguageContextType {
  currentLanguage: string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Detectar idioma del sistema DESPUÉS de que React Native esté listo
    const systemLocale = getLocales()[0]?.languageCode || 'en';
    const supportedLanguages = ['es', 'en', 'de'];
    const detectedLanguage = supportedLanguages.includes(systemLocale) ? systemLocale : 'en';
    
    // Setear idioma en i18n
    i18n.locale = detectedLanguage;
    setCurrentLanguage(detectedLanguage);
    setIsReady(true);

    console.log('[LanguageProvider] System locale detected:', systemLocale);
    console.log('[LanguageProvider] Using language:', detectedLanguage);
    console.log('[LanguageProvider] i18n.locale set to:', i18n.locale);
  }, []);

  // No renderizar hijos hasta que el idioma esté listo
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
      return key; // Fallback mientras carga
    }
    return i18n.t(key, params);
  };
}
