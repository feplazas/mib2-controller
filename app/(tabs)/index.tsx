import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";
import { parseFirmwareVersion } from "@/lib/telnet-client";

export default function HomeScreen() {
  const { connectionStatus, isConnecting, config, updateConfig, connect, disconnect } = useTelnet();
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port.toString());

  const handleConnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Update config before connecting
    await updateConfig({
      host,
      port: parseInt(port, 10),
    });

    const response = await connect();
    
    if (response.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDisconnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await disconnect();
  };

  const getStatusColor = () => {
    if (connectionStatus.connected) return 'bg-success';
    if (isConnecting) return 'bg-warning';
    return 'bg-muted';
  };

  const getStatusText = () => {
    if (connectionStatus.connected) return 'Conectado';
    if (isConnecting) return 'Conectando...';
    return 'Desconectado';
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">MIB2 Controller</Text>
            <Text className="text-sm text-muted text-center">
              Control remoto para unidades MIB2 STD2 Technisat Preh
            </Text>
          </View>

          {/* Connection Status Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center gap-3 mb-4">
              <View className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
              <Text className="text-lg font-semibold text-foreground">{getStatusText()}</Text>
            </View>

            {connectionStatus.connected && (
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Host:</Text>
                  <Text className="text-sm text-foreground font-medium">{connectionStatus.host}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Puerto:</Text>
                  <Text className="text-sm text-foreground font-medium">{connectionStatus.port}</Text>
                </View>
                {connectionStatus.lastActivity && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Última actividad:</Text>
                    <Text className="text-sm text-foreground font-medium">
                      {new Date(connectionStatus.lastActivity).toLocaleTimeString()}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Connection Form */}
          {!connectionStatus.connected && (
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Dirección IP</Text>
                <TextInput
                  value={host}
                  onChangeText={setHost}
                  placeholder="192.168.1.4"
                  keyboardType="numeric"
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  editable={!isConnecting}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">Puerto</Text>
                <TextInput
                  value={port}
                  onChangeText={setPort}
                  placeholder="23"
                  keyboardType="numeric"
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  editable={!isConnecting}
                />
              </View>
            </View>
          )}

          {/* Action Button */}
          <View className="items-center">
            {connectionStatus.connected ? (
              <TouchableOpacity
                onPress={handleDisconnect}
                className="bg-error px-8 py-4 rounded-full active:opacity-80 min-w-[200px]"
              >
                <Text className="text-white font-semibold text-center text-base">
                  Desconectar
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleConnect}
                disabled={isConnecting}
                className="bg-primary px-8 py-4 rounded-full active:opacity-80 min-w-[200px]"
                style={{ opacity: isConnecting ? 0.6 : 1 }}
              >
                {isConnecting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center text-base">
                    Conectar a MIB2
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Info Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-base font-semibold text-foreground mb-3">
              Instrucciones de Conexión
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted leading-relaxed">
                1. Conecta el adaptador USB-Ethernet al puerto USB de la unidad MIB2
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                2. Conecta tu dispositivo Android a la misma red (WiFi o adaptador Ethernet)
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                3. Verifica que la unidad MIB2 tenga Telnet habilitado (root/root)
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                4. Ingresa la dirección IP de la unidad (por defecto: 192.168.1.4)
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                5. Presiona "Conectar a MIB2" para establecer la conexión
              </Text>
            </View>
          </View>

          {/* Warning Card */}
          <View className="bg-warning/10 border border-warning rounded-2xl p-4">
            <Text className="text-sm text-warning font-medium mb-1">⚠️ Advertencia</Text>
            <Text className="text-xs text-muted leading-relaxed">
              Esta aplicación permite ejecutar comandos directamente en la unidad MIB2. 
              Usa con precaución y solo si sabes lo que estás haciendo. Los comandos 
              incorrectos pueden dañar el sistema.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
