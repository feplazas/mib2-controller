import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { cn } from '@/lib/utils';

export type UsbStatus = 'disconnected' | 'detected' | 'connected';

interface UsbStatusIndicatorProps {
  status: UsbStatus;
  deviceName?: string;
  onPress?: () => void;
}

/**
 * Indicador Visual de Estado USB
 * 
 * Muestra el estado actual de la conexión USB con colores:
 * - 🔴 Rojo: Desconectado (sin dispositivos)
 * - 🟡 Amarillo: Detectado (dispositivo encontrado, sin permisos)
 * - 🟢 Verde: Conectado (dispositivo conectado y listo)
 */
export const UsbStatusIndicator = memo(function UsbStatusIndicator({ status, deviceName, onPress }: UsbStatusIndicatorProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Por defecto, navegar a la pantalla USB Status
      router.push('/(tabs)/usb-status');
    }
  };

  const statusConfig = {
    disconnected: {
      color: 'bg-red-500',
      icon: '🔴',
      text: 'Sin Dispositivo USB',
      description: 'Conecta un adaptador USB-Ethernet',
    },
    detected: {
      color: 'bg-yellow-500',
      icon: '🟡',
      text: 'Dispositivo Detectado',
      description: deviceName || 'Toca para solicitar permisos',
    },
    connected: {
      color: 'bg-green-500',
      icon: '🟢',
      text: 'USB Conectado',
      description: deviceName || 'Dispositivo listo',
    },
  };

  const config = statusConfig[status];

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        { opacity: pressed ? 0.7 : 1 },
      ]}
      className="w-full"
    >
      <View className="bg-surface border border-border rounded-xl p-4 flex-row items-center gap-3">
        {/* Indicador de color */}
        <View className={cn('w-3 h-3 rounded-full', config.color)} />
        
        {/* Icono de estado */}
        <Text className="text-2xl">{config.icon}</Text>
        
        {/* Información de estado */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {config.text}
          </Text>
          <Text className="text-sm text-muted mt-0.5">
            {config.description}
          </Text>
        </View>
        
        {/* Flecha para indicar que es clickeable */}
        <Text className="text-muted text-xl">›</Text>
      </View>
    </Pressable>
  );
});
