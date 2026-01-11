import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
              Funcionalidad de spoofing EEPROM en desarrollo
            </Text>
          </View>

          {/* Info Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-3">⚠️ En Desarrollo</Text>
            <Text className="text-sm text-muted leading-relaxed mb-4">
              Las funciones de lectura y escritura de EEPROM para modificar VID/PID de adaptadores USB están actualmente en desarrollo.
            </Text>
            <Text className="text-sm text-muted leading-relaxed">
              Por ahora, puedes usar la pestaña "USB" para detectar y analizar adaptadores conectados.
            </Text>
          </View>

          {/* Navigation Button */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/usb-diag')}
            className="bg-primary px-6 py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-background font-semibold text-center text-base">
              Ir a Diagnóstico USB
            </Text>
          </TouchableOpacity>

          {/* Planned Features */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-3">Funciones Planeadas</Text>
            <View className="gap-3">
              <View className="flex-row gap-2">
                <Text className="text-muted">•</Text>
                <Text className="text-sm text-muted flex-1">Lectura de EEPROM completa</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-muted">•</Text>
                <Text className="text-sm text-muted flex-1">Escritura de VID/PID en offsets específicos</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-muted">•</Text>
                <Text className="text-sm text-muted flex-1">Backup automático antes de modificar</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-muted">•</Text>
                <Text className="text-sm text-muted flex-1">Verificación post-spoofing</Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-muted">•</Text>
                <Text className="text-sm text-muted flex-1">Soporte para chipsets ASIX, Realtek y D-Link</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
