/**
 * Language Store - Almacena el idioma actual de forma global
 * Permite acceder al idioma desde funciones que no pueden usar hooks (como showAlert)
 */

type SupportedLanguage = 'es' | 'en' | 'de';

let currentLanguage: SupportedLanguage = 'es';

export function setCurrentLanguage(lang: SupportedLanguage): void {
  currentLanguage = lang;
}

export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}
