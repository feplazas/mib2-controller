import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';

import { ScreenContainer } from '@/components/screen-container';
import { ConfigManager } from '@/lib/config-manager';

export default function ConfigManagementScreen() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportConfig = async () => {
    try {
      setIsExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await ConfigManager.exportConfiguration();

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          '✅ Exportación Exitosa',
          'La configuración se ha exportado correctamente. El archivo ha sido compartido.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error de Exportación',
        error instanceof Error ? error.message : 'No se pudo exportar la configuración'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportConfig = async () => {
    try {
      // Seleccionar archivo
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setIsImporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const fileUri = result.assets[0].uri;

      // Obtener información del archivo
      const infoResult = await ConfigManager.getConfigurationInfo(fileUri);

      if (!infoResult.success) {
        throw new Error(infoResult.error || 'Archivo inválido');
      }

      // Confirmar importación
      Alert.alert(
        'Confirmar Importación',
        `¿Importar configuración exportada el ${new Date(infoResult.info!.exportDate).toLocaleDateString()}?\n\n` +
          `Perfiles: ${infoResult.info!.profileCount}\n` +
          `Dispositivo origen: ${infoResult.info!.deviceInfo}\n\n` +
          `⚠️ Esto sobrescribirá tu configuración actual.`,
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => setIsImporting(false) },
          {
            text: 'Importar',
            style: 'destructive',
            onPress: async () => {
              try {
                const importResult = await ConfigManager.importConfiguration(fileUri);

                if (importResult.success) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert(
                    '✅ Importación Exitosa',
                    importResult.message || 'La configuración se ha importado correctamente.',
                    [
                      {
                        text: 'Reiniciar App',
                        onPress: () => {
                          // En producción, aquí se reiniciaría la app
                          Alert.alert('Información', 'Por favor, reinicia la app manualmente para aplicar los cambios');
                        },
                      },
                    ]
                  );
                } else {
                  throw new Error(importResult.error || 'Error desconocido');
                }
              } catch (error) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert(
                  'Error de Importación',
                  error instanceof Error ? error.message : 'No se pudo importar la configuración'
                );
              } finally {
                setIsImporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No se pudo seleccionar el archivo'
      );
      setIsImporting(false);
    }
  };

  const handleResetFactory = () => {
    Alert.alert(
      '⚠️ Reset de Fábrica',
      'Esto eliminará TODA la configuración de la app:\n\n' +
        '• Todos los perfiles\n' +
        '• Todas las macros\n' +
        '• Configuración de conexión\n' +
        '• PIN del Modo Experto\n' +
        '• Preferencias de tema\n\n' +
        '¿Estás seguro? Esta acción NO se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              
              const result = await ConfigManager.clearAllConfiguration();

              if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  '✅ Reset Completado',
                  'Toda la configuración ha sido eliminada. Por favor, reinicia la app.',
                  [{ text: 'OK' }]
                );
              } else {
                throw new Error(result.error || 'Error desconocido');
              }
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'No se pudo completar el reset'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground">Gestión de Configuración</Text>
            <Text className="text-sm text-muted mt-1">
              Exporta, importa o resetea la configuración completa de la app
            </Text>
          </View>

          {/* Export Section */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground mb-2">
                📤 Exportar Configuración
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Guarda toda tu configuración (perfiles, macros, settings) en un archivo JSON que puedes
                compartir o usar en otro dispositivo.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleExportConfig}
              disabled={isExporting}
              className="bg-primary px-6 py-4 rounded-xl active:opacity-80"
              style={{ opacity: isExporting ? 0.5 : 1 }}
            >
              <Text className="text-white font-semibold text-center text-base">
                {isExporting ? 'Exportando...' : 'Exportar Ahora'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Import Section */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground mb-2">
                📥 Importar Configuración
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Restaura una configuración previamente exportada. Esto sobrescribirá tu configuración actual.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleImportConfig}
              disabled={isImporting}
              className="bg-primary/20 border border-primary px-6 py-4 rounded-xl active:opacity-80"
              style={{ opacity: isImporting ? 0.5 : 1 }}
            >
              <Text className="text-primary font-semibold text-center text-base">
                {isImporting ? 'Importando...' : 'Seleccionar Archivo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 border border-primary rounded-2xl p-6">
            <Text className="text-primary font-semibold mb-2">💡 Consejo</Text>
            <Text className="text-foreground text-sm leading-relaxed">
              Exporta tu configuración regularmente como backup. Es especialmente útil antes de hacer
              cambios importantes o al migrar a un nuevo dispositivo.
            </Text>
          </View>

          {/* Danger Zone */}
          <View className="bg-error/10 border border-error rounded-2xl p-6">
            <View className="mb-4">
              <Text className="text-lg font-semibold text-error mb-2">
                ⚠️ Zona de Peligro
              </Text>
              <Text className="text-sm text-error leading-relaxed">
                El reset de fábrica eliminará TODA la configuración de la app de forma permanente.
                Esta acción no se puede deshacer.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleResetFactory}
              className="bg-error px-6 py-4 rounded-xl active:opacity-80"
            >
              <Text className="text-white font-semibold text-center text-base">
                Reset de Fábrica
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
