import { I18n } from 'i18n-js';
import es from '../locales/es.json';
import en from '../locales/en.json';
import de from '../locales/de.json';

// Crear instancia de i18n
const i18n = new I18n({
  es,
  en,
  de,
});

// Configurar locale por defecto (será sobreescrito por LanguageProvider)
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

// Función helper para traducir (no reactiva - usar useTranslation en componentes)
export function t(key: string, options?: object): string {
  return i18n.t(key, options);
}

export default i18n;
