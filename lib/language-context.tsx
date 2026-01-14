import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocale, getLocale, getAvailableLocales } from './i18n';

const LANGUAGE_STORAGE_KEY = '@mib2_controller:language';

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: string[];
  changeLanguage: (language: string) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(getLocale());
  const [isLoading, setIsLoading] = useState(true);

  // Cargar idioma guardado al iniciar
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        setLocale(savedLanguage);
        setCurrentLanguage(savedLanguage);
        console.log('[LanguageProvider] Loaded saved language:', savedLanguage);
      } else {
        // Usar idioma del sistema por defecto
        const systemLanguage = getLocale();
        setCurrentLanguage(systemLanguage);
        console.log('[LanguageProvider] Using system language:', systemLanguage);
      }
    } catch (error) {
      console.error('[LanguageProvider] Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (language: string) => {
    try {
      setLocale(language);
      setCurrentLanguage(language);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      console.log('[LanguageProvider] Language changed to:', language);
    } catch (error) {
      console.error('[LanguageProvider] Error saving language:', error);
    }
  }, []);

  const value: LanguageContextType = {
    currentLanguage,
    availableLanguages: getAvailableLocales(),
    changeLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
