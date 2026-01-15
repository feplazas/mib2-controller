import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import { getTranslation, getFallbackLanguage } from './simple-i18n';

/**
 * Language Context - Detects system language and provides reactive translations
 * 
 * SOLUTION: Instead of using i18n-js which doesn't trigger re-renders,
 * we use React state (currentLanguage) that components subscribe to.
 * When currentLanguage changes, ALL components using useTranslation re-render automatically.
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
    
    // Get fallback language if not supported
    const detectedLanguage = getFallbackLanguage(systemLanguage);
    
    // Update state - this will trigger re-render of all components using useTranslation
    setCurrentLanguage(detectedLanguage);
    setIsReady(true);

    console.log('[LanguageProvider] Using language:', detectedLanguage);
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
 * 
 * CRITICAL: This hook returns a function that uses currentLanguage from context.
 * When currentLanguage changes in the context, React automatically re-renders
 * ALL components that call this hook, because they're subscribed to the context value.
 */
export function useTranslation() {
  const { currentLanguage, isReady } = useLanguage();
  
  // Return a translation function
  // Components will re-render when currentLanguage changes because they're subscribed to the context
  return useCallback((key: string, params?: Record<string, any>) => {
    if (!isReady) {
      return key; // Fallback while loading
    }
    const translation = getTranslation(key, currentLanguage, params);
    console.log(`[useTranslation] key=${key}, lang=${currentLanguage}, result=${translation}`);
    return translation;
  }, [currentLanguage, isReady]);
}
