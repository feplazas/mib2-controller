import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";

export default function SettingsScreen() {
  const { config, updateConfig, clearHistory } = useTelnet();
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port.toString());
  const [username, setUsername] = useState(config.username);
  const [password, setPassword] = useState(config.password);

  const handleSaveSettings = async () => {
    try {
      await updateConfig({
        host,
        port: parseInt(port, 10),
        username,
        password,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Éxito', 'Configuración guardada correctamente');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Restablecer Valores',
      '¿Restaurar la configuración a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            setHost('192.168.1.4');
            setPort('23');
            setUsername('root');
            setPassword('root');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
            <Text className="text-2xl font-bold text-foreground">Configuración</Text>
            <Text className="text-sm text-muted mt-1">
              Ajusta los parámetros de conexión
            </Text>
          </View>

          {/* Connection Settings */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Configuración de Conexión
            </Text>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Dirección IP
                </Text>
                <TextInput
                  value={host}
                  onChangeText={setHost}
                  placeholder="192.168.1.4"
                  keyboardType="numeric"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  Dirección IP de la unidad MIB2 en la red local
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Puerto
                </Text>
                <TextInput
                  value={port}
                  onChangeText={setPort}
                  placeholder="23"
                  keyboardType="numeric"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  Puerto Telnet (por defecto: 23)
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Usuario
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="root"
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  Usuario para autenticación Telnet
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Contraseña
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="root"
                  secureTextEntry
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  Contraseña para autenticación Telnet
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={handleResetDefaults}
                className="flex-1 bg-muted/20 border border-border px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-foreground font-semibold text-center">
                  Restablecer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveSettings}
                className="flex-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold text-center">
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Data Management */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Gestión de Datos
            </Text>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Limpiar Historial',
                  '¿Eliminar todo el historial de comandos?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Limpiar',
                      style: 'destructive',
                      onPress: () => {
                        clearHistory();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert('Éxito', 'Historial eliminado');
                      },
                    },
                  ]
                );
              }}
              className="bg-error/10 border border-error px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-error font-semibold text-center">
                Limpiar Historial de Comandos
              </Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Información de la App
            </Text>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Versión</Text>
                <Text className="text-sm text-foreground font-medium">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Plataforma</Text>
                <Text className="text-sm text-foreground font-medium">Android</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Compatible con</Text>
                <Text className="text-sm text-foreground font-medium">MIB2 STD2</Text>
              </View>
            </View>
          </View>

          {/* Warning */}
          <View className="bg-error/10 border border-error rounded-2xl p-4">
            <Text className="text-sm text-error font-medium mb-2">
              ⚠️ Advertencia de Seguridad
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Esta aplicación permite ejecutar comandos con privilegios root en la unidad MIB2. 
              El uso incorrecto puede resultar en daños permanentes al sistema. 
              Usa esta herramienta bajo tu propia responsabilidad.
            </Text>
          </View>

          {/* Credits */}
          <View className="items-center py-4">
            <Text className="text-xs text-muted text-center">
              MIB2 Controller v1.0.0
            </Text>
            <Text className="text-xs text-muted text-center mt-1">
              Para unidades MIB2 STD2 Technisat/Preh
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
