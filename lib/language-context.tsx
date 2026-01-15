import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import i18n from './i18n';

/**
 * Language Context - Detects system language and updates when app returns to foreground
 * 
 * SOLUTION: Uses AppState listener to re-detect language when user changes system settings
 * and returns to the app. This ensures the app always shows the correct language.
 */

interface LanguageContextType {
  currentLanguage: string;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Function to detect and set language from system
  const detectAndSetLanguage = useCallback(() => {
    const locales = RNLocalize.getLocales();
    
    console.log('[LanguageProvider] Detecting language...');
    console.log('[LanguageProvider] System locales:', JSON.stringify(locales));
    
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

  // Initial language detection on mount
  useEffect(() => {
    console.log('[LanguageProvider] Initial mount - detecting language');
    detectAndSetLanguage();
  }, [detectAndSetLanguage]);

  // Listen for app state changes to detect language changes
  useEffect(() => {
    console.log('[LanguageProvider] Setting up AppState listener');
    
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('[LanguageProvider] AppState changed to:', nextAppState);
      
      // When app comes back to foreground, re-detect language
      // This handles the case where user changes system language while app is in background
      if (nextAppState === 'active') {
        console.log('[LanguageProvider] App became active - re-detecting language');
        detectAndSetLanguage();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      console.log('[LanguageProvider] Removing AppState listener');
      subscription.remove();
    };
  }, [detectAndSetLanguage]);

  // Don't render children until language is ready
  if (!isReady) {
    console.log('[LanguageProvider] Not ready yet, showing null');
    return null;
  }

  console.log('[LanguageProvider] Rendering with language:', currentLanguage);
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
 * Uses currentLanguage as dependency to force re-evaluation when language changes
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
