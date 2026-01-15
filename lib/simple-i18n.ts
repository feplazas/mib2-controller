/**
 * Simple i18n system without external dependencies
 * Uses plain JavaScript objects for translations
 */

import es from '../locales/es.json';
import en from '../locales/en.json';
import de from '../locales/de.json';

type Translations = typeof es;
type TranslationKey = keyof Translations;

const translations: Record<string, Translations> = {
  es,
  en,
  de,
};

/**
 * Get translation for a key in a specific language
 */
export function getTranslation(
  key: string,
  language: string,
  params?: Record<string, any>
): string {
  const languageTranslations = translations[language] || translations.en;
  
  // Navigate nested keys (e.g., "home.title")
  const keys = key.split('.');
  let value: any = languageTranslations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`[simple-i18n] Translation not found: ${key} in ${language}`);
      return key; // Fallback to key itself
    }
  }
  
  // Handle string interpolation {{variable}}
  if (typeof value === 'string' && params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value?.toString() || key;
}

/**
 * Check if a language is supported
 */
export function isSupportedLanguage(language: string): boolean {
  return ['es', 'en', 'de'].includes(language);
}

/**
 * Get fallback language if not supported
 */
export function getFallbackLanguage(language: string): string {
  return isSupportedLanguage(language) ? language : 'en';
}
