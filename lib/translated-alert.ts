import { Alert, AlertButton, AlertOptions } from 'react-native';
import i18n from './i18n';

/**
 * Helper para mostrar Alert con textos traducidos automáticamente
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
  const title = i18n.t(titleKey);
  const message = messageKey ? i18n.t(messageKey) : undefined;
  
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
  showAlert(titleKey, messageKey, [
    {
      text: i18n.t('common.cancel'),
      style: 'cancel',
      onPress: onCancel,
    },
    {
      text: i18n.t('common.confirm'),
      onPress: onConfirm,
    },
  ]);
}
