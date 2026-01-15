import React, { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';
import { getTranslation, getFallbackLanguage, isSupportedLanguage } from './simple-i18n';
import { setCurrentLanguage as setLanguageStore } from './language-store';

/**
 * Language Context - Supports both automatic system detection and manual override
 * 
 * Features:
 * - Automatic detection of system language
 * - Manual override via setLanguage()
 * - Persistence of manual selection in AsyncStorage
 * - "auto" option to revert to system language
 */

const LANGUAGE_STORAGE_KEY = '@mib2_controller_language';

export type LanguageOption = 'auto' | 'es' | 'en' | 'de';

interface LanguageContextType {
  currentLanguage: string;
  selectedLanguage: LanguageOption;
  isReady: boolean;
  setLanguage: (language: LanguageOption) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('auto');

  // Function to detect system language
  const detectSystemLanguage = useCallback((): string => {
    const locales = RNLocalize.getLocales();
    const primaryLocale = locales[0];
    const systemLanguage = primaryLocale?.languageCode || 'en';
    return getFallbackLanguage(systemLanguage);
  }, []);

  // Function to set language manually
  const setLanguage = useCallback(async (language: LanguageOption) => {
    console.log('[LanguageProvider] Setting language to:', language);
    
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      setSelectedLanguage(language);
      
      // Determine actual language to use
      if (language === 'auto') {
        const systemLang = detectSystemLanguage();
        setCurrentLanguage(systemLang);
        setLanguageStore(systemLang as 'es' | 'en' | 'de');
        console.log('[LanguageProvider] Using system language:', systemLang);
      } else {
        setCurrentLanguage(language);
        setLanguageStore(language as 'es' | 'en' | 'de');
        console.log('[LanguageProvider] Using manual language:', language);
      }
    } catch (error) {
      console.error('[LanguageProvider] Error saving language:', error);
    }
  }, [detectSystemLanguage]);

  // Load saved language preference on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      console.log('[LanguageProvider] Loading language preference...');
      
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        console.log('[LanguageProvider] Saved language:', savedLanguage);
        
        if (savedLanguage && (savedLanguage === 'auto' || isSupportedLanguage(savedLanguage))) {
          setSelectedLanguage(savedLanguage as LanguageOption);
          
          if (savedLanguage === 'auto') {
            const systemLang = detectSystemLanguage();
            setCurrentLanguage(systemLang);
            setLanguageStore(systemLang as 'es' | 'en' | 'de');
            console.log('[LanguageProvider] Using system language:', systemLang);
          } else {
            setCurrentLanguage(savedLanguage);
            setLanguageStore(savedLanguage as 'es' | 'en' | 'de');
            console.log('[LanguageProvider] Using saved language:', savedLanguage);
          }
        } else {
          // No saved preference, use system language
        const systemLang = detectSystemLanguage();
        setCurrentLanguage(systemLang);
        setLanguageStore(systemLang as 'es' | 'en' | 'de');
        setSelectedLanguage('auto');
        console.log('[LanguageProvider] No saved preference, using system:', systemLang);
        }
      } catch (error) {
        console.error('[LanguageProvider] Error loading language:', error);
        const systemLang = detectSystemLanguage();
        setCurrentLanguage(systemLang);
        setLanguageStore(systemLang as 'es' | 'en' | 'de');
        setSelectedLanguage('auto');
      }
      
      setIsReady(true);
    };

    loadLanguagePreference();
  }, [detectSystemLanguage]);

  // Listen for app state changes to detect language changes (only when auto)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && selectedLanguage === 'auto') {
        console.log('[LanguageProvider] App became active - re-detecting system language');
        const systemLang = detectSystemLanguage();
        setCurrentLanguage(systemLang);
        setLanguageStore(systemLang as 'es' | 'en' | 'de');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [detectSystemLanguage, selectedLanguage]);

  // Don't render children until language is ready
  if (!isReady) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, selectedLanguage, isReady, setLanguage }}>
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
 */
export function useTranslation() {
  const { currentLanguage, isReady } = useLanguage();
  
  return useCallback((key: string, params?: Record<string, any>) => {
    if (!isReady) {
      return key;
    }
    return getTranslation(key, currentLanguage, params);
  }, [currentLanguage, isReady]);
}
