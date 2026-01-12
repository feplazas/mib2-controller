import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { router } from 'expo-router';

export default function SpoofingScreen() {
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">USB Spoofing</Text>
            <Text className="text-base text-muted">
              Modificación de VID/PID en adaptadores USB-Ethernet ASIX
            </Text>
          </View>

          {/* Status Card */}
          <View className="bg-green-900/20 rounded-2xl p-6 border border-green-700">
            <Text className="text-lg font-semibold text-green-400 mb-3">✅ Funcionalidad Implementada</Text>
            <Text className="text-sm text-green-300 leading-relaxed mb-4">
              El spoofing de EEPROM está completamente funcional para adaptadores ASIX compatibles con MIB2 STD2 Technisat Preh.
            </Text>
            <Text className="text-sm text-green-300 leading-relaxed">
              Usa las herramientas Auto Spoof o Manual Spoof para modificar el VID/PID de tu adaptador.
            </Text>
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/auto-spoof')}
              className="bg-primary px-6 py-4 rounded-xl active:opacity-80"
            >
              <Text className="text-background font-semibold text-center text-base">
                🚀 Auto Spoof (Recomendado)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/usb-diag')}
              className="bg-surface px-6 py-4 rounded-xl border border-border active:opacity-80"
            >
              <Text className="text-foreground font-semibold text-center text-base">
                🔍 Diagnóstico USB
              </Text>
            </TouchableOpacity>
          </View>

          {/* Compatibility Info */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-3">Chipsets Compatibles</Text>
            
            <Text className="text-sm font-semibold text-green-500 mb-2">✅ Confirmados (100% funcionales):</Text>
            <View className="gap-2 mb-4 ml-4">
              <Text className="text-sm text-muted">• ASIX AX88772</Text>
              <Text className="text-sm text-muted">• ASIX AX88772A</Text>
              <Text className="text-sm text-muted">• ASIX AX88772B</Text>
            </View>

            <Text className="text-sm font-semibold text-yellow-500 mb-2">⚠️ Experimentales (probablemente funcionales):</Text>
            <View className="gap-2 mb-4 ml-4">
              <Text className="text-sm text-muted">• ASIX AX88172</Text>
              <Text className="text-sm text-muted">• ASIX AX88178</Text>
              <Text className="text-sm text-muted">• ASIX AX88179</Text>
              <Text className="text-sm text-muted">• ASIX AX88772C</Text>
            </View>

            <Text className="text-sm font-semibold text-red-500 mb-2">❌ Incompatibles:</Text>
            <View className="gap-2 ml-4">
              <Text className="text-sm text-muted">• Realtek (RTL8150, RTL8152, RTL8153, RTL8156)</Text>
              <Text className="text-sm text-muted">• Microchip (LAN78XX, LAN95XX)</Text>
              <Text className="text-sm text-muted">• Broadcom (BCM57XX)</Text>
              <Text className="text-sm text-muted">• Davicom (DM9601)</Text>
            </View>
          </View>

          {/* Implemented Features */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-3">Funciones Implementadas</Text>
            <View className="gap-3">
              <View className="flex-row gap-2">
                <Text className="text-green-500">✅</Text>
                <Text className="text-sm text-foreground flex-1">Lectura de EEPROM completa</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-green-500">✅</Text>
                <Text className="text-sm text-foreground flex-1">Escritura de VID/PID en offsets específicos</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-green-500">✅</Text>
                <Text className="text-sm text-foreground flex-1">Backup automático antes de modificar</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-green-500">✅</Text>
                <Text className="text-sm text-foreground flex-1">Verificación post-spoofing</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-green-500">✅</Text>
                <Text className="text-sm text-foreground flex-1">Detección automática de chipset</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-green-500">✅</Text>
                <Text className="text-sm text-foreground flex-1">Validación de compatibilidad en tiempo real</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-green-500">✅</Text>
                <Text className="text-sm text-foreground flex-1">Feedback visual animado de estado</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-green-500">✅</Text>
                <Text className="text-sm text-foreground flex-1">Restauración desde backup</Text>
              </View>
            </View>
          </View>

          {/* Warning */}
          <View className="bg-yellow-900/20 rounded-2xl p-6 border border-yellow-700">
            <Text className="text-lg font-semibold text-yellow-400 mb-3">⚠️ Advertencia Importante</Text>
            <Text className="text-sm text-yellow-300 leading-relaxed">
              El spoofing de EEPROM modifica permanentemente el hardware del adaptador USB. Siempre se crea un backup automático, pero asegúrate de tener un cable OTG con alimentación externa y de seguir las instrucciones cuidadosamente.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
