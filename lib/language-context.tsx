import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import * as RNLocalize from 'react-native-localize';
import i18n from './i18n';

/**
 * Language Context - Uses react-native-localize for reliable locale detection
 * CRITICAL FIX: useTranslation now uses currentLanguage as dependency to force re-render
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
    // Get system locales using react-native-localize
    const locales = RNLocalize.getLocales();
    
    console.log('[LanguageProvider] All system locales:', JSON.stringify(locales));
    
    // Get primary locale
    const primaryLocale = locales[0];
    const systemLanguage = primaryLocale?.languageCode || 'en';
    
    console.log('[LanguageProvider] Primary locale:', primaryLocale);
    console.log('[LanguageProvider] Language code:', systemLanguage);
    
    // Check if language is supported
    const supportedLanguages = ['es', 'en', 'de'];
    const detectedLanguage = supportedLanguages.includes(systemLanguage) ? systemLanguage : 'en';
    
    // Set i18n locale
    i18n.locale = detectedLanguage;
    setCurrentLanguage(detectedLanguage);
    setIsReady(true);

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
 * CRITICAL FIX: Now uses currentLanguage as dependency to force re-evaluation
 * when language changes, ensuring all components re-render with new translations
 */
export function useTranslation() {
  const { currentLanguage, isReady } = useLanguage();
  
  // Use useCallback with currentLanguage as dependency
  // This ensures the function reference changes when language changes
  // forcing all components using this hook to re-render
  return useCallback((key: string, params?: Record<string, any>) => {
    if (!isReady) {
      return key; // Fallback while loading
    }
    // Force i18n to use current language (defensive programming)
    i18n.locale = currentLanguage;
    return i18n.t(key, params);
  }, [currentLanguage, isReady]);
}
