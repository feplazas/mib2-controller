import { Alert, AlertButton, AlertOptions } from 'react-native';
import { getTranslation } from './simple-i18n';
import { getCurrentLanguage } from './language-store';

/**
 * Helper para mostrar Alert con textos traducidos automáticamente
 * Usa el mismo sistema de i18n que el resto de la app (simple-i18n + language-store)
 * 
 * Uso:
 * ```tsx
 * import { showAlert } from '@/lib/translated-alert';
 * 
 * showAlert('error.title', 'error.no_device');
 * ```
 */
export function showAlert(
  titleKey: string,
  messageKey?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
) {
  const lang = getCurrentLanguage();
  const title = getTranslation(titleKey, lang);
  const message = messageKey ? getTranslation(messageKey, lang) : undefined;
  
  Alert.alert(title, message, buttons, options);
}

/**
 * Shortcut para mostrar alert de error
 */
export function showErrorAlert(messageKey: string, buttons?: AlertButton[]) {
  showAlert('common.error', messageKey, buttons);
}

/**
 * Shortcut para mostrar alert de éxito
 */
export function showSuccessAlert(messageKey: string, buttons?: AlertButton[]) {
  showAlert('common.success', messageKey, buttons);
}

/**
 * Shortcut para mostrar alert de confirmación
 */
export function showConfirmAlert(
  titleKey: string,
  messageKey: string,
  onConfirm: () => void,
  onCancel?: () => void
) {
  const lang = getCurrentLanguage();
  showAlert(titleKey, messageKey, [
    {
      text: getTranslation('common.cancel', lang),
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: getTranslation('common.confirm', lang),
      onPress: onConfirm,
    },
  ]);
}
