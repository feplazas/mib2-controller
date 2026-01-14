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
i18n.locale = getLocales()[0]?.languageCode ?? 'es';
i18n.enableFallback = true;

// Función helper para traducir
export function t(key: string, options?: object): string {
  return i18n.t(key, options);
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
