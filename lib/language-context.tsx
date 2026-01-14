import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLocale, getLocale, getAvailableLocales } from './i18n';

const LANGUAGE_STORAGE_KEY = '@mib2_controller:language';

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: string[];
  changeLanguage: (language: string) => Promise<void>;
  isLoading: boolean;
  // Contador para forzar re-render cuando cambia idioma
  renderKey: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(getLocale());
  const [isLoading, setIsLoading] = useState(true);
  const [renderKey, setRenderKey] = useState(0);

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
      // Forzar re-render de todos los componentes hijos
      setRenderKey(prev => prev + 1);
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
    renderKey,
  };

  return (
    <LanguageContext.Provider value={value}>
      <React.Fragment key={renderKey}>
        {children}
      </React.Fragment>
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

// Hook reactivo para traducciones que se actualiza cuando cambia el idioma
export function useTranslation() {
  const { renderKey } = useLanguage();
  
  // Usar useMemo para crear nueva función cada vez que cambia renderKey
  // Esto fuerza a los componentes a re-evaluar todas las llamadas a t()
  return useMemo(() => {
    return (key: string, options?: object): string => {
      return require('./i18n').default.t(key, options);
    };
  }, [renderKey]);
}
