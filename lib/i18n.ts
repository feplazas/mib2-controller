import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import es from '../locales/es.json';
import en from '../locales/en.json';
import de from '../locales/de.json';

// Crear instancia de i18n
const i18n = new I18n({
  es,
  en,
  de,
});

// Configurar locale por defecto
i18n.defaultLocale = 'es';

// Detectar idioma del sistema automáticamente
const systemLanguage = getLocales()[0]?.languageCode ?? 'es';
// Solo usar idiomas soportados, fallback a español
const supportedLanguages = ['es', 'en', 'de'];
i18n.locale = supportedLanguages.includes(systemLanguage) ? systemLanguage : 'es';

i18n.enableFallback = true;

console.log('[i18n] System language detected:', systemLanguage);
console.log('[i18n] Using locale:', i18n.locale);

// Función helper para traducir (no reactiva - usar useTranslation en componentes)
export function t(key: string, options?: object): string {
  return i18n.t(key, options);
}

// Hook reactivo para traducción en componentes
// NOTA: Este hook debe usarse dentro de LanguageProvider
// El renderKey del contexto fuerza re-render cuando cambia el idioma
export function useTranslation() {
  return (key: string, options?: object): string => {
    return i18n.t(key, options);
  };
}

// Función para cambiar idioma manualmente
export function setLocale(locale: string) {
  i18n.locale = locale;
}

// Función para obtener idioma actual
export function getLocale(): string {
  return i18n.locale;
}

// Función para obtener idiomas disponibles
export function getAvailableLocales(): string[] {
  return ['es', 'en', 'de'];
}

export default i18n;
