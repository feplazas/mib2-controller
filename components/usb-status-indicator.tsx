import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/language-context';
import Animated, { useAnimatedStyle, withRepeat, withTiming, useSharedValue, withSequence } from 'react-native-reanimated';
import { useEffect } from 'react';

export type UsbStatus = 'disconnected' | 'detected' | 'connected';

interface UsbStatusIndicatorProps {
  status: UsbStatus;
  deviceName?: string;
  onPress?: () => void;
}

/**
 * Indicador Visual de Estado USB - Premium Design
 * 
 * Muestra el estado actual de la conexión USB con diseño sofisticado:
 * - 🔴 Rojo: Desconectado (sin dispositivos)
 * - 🟡 Amarillo: Detectado (dispositivo encontrado, sin permisos)
 * - 🟢 Verde: Conectado (dispositivo conectado y listo)
 */
export function UsbStatusIndicator({ status, deviceName, onPress }: UsbStatusIndicatorProps) {
  const router = useRouter();
  const t = useTranslation();
  const pulseOpacity = useSharedValue(1);

  // Animación de pulso para estado "detected"
  useEffect(() => {
    if (status === 'detected') {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      pulseOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [status]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(tabs)/usb-status');
    }
  };

  const statusConfig = {
    disconnected: {
      bgColor: 'bg-error/10',
      borderColor: 'border-error/30',
      dotColor: 'bg-error',
      textColor: 'text-error',
      text: t('usb.no_device'),
      description: t('usb.connect_adapter_desc'),
    },
    detected: {
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      dotColor: 'bg-warning',
      textColor: 'text-warning',
      text: t('usb.device_detected'),
      description: deviceName || t('usb.tap_for_permissions'),
    },
    connected: {
      bgColor: 'bg-success/10',
      borderColor: 'border-success/30',
      dotColor: 'bg-success',
      textColor: 'text-success',
      text: t('usb.connected'),
      description: deviceName || t('usb.device_ready'),
    },
  };

  const config = statusConfig[status];

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
      className="w-full"
    >
      <View className={cn(
        'rounded-2xl p-4 flex-row items-center gap-4 border',
        config.bgColor,
        config.borderColor
      )}>
        {/* Indicador de estado con animación */}
        <Animated.View 
          style={pulseStyle}
          className={cn(
            'w-12 h-12 rounded-xl items-center justify-center',
            config.bgColor
          )}
        >
          <View className={cn('w-4 h-4 rounded-full', config.dotColor)} />
        </Animated.View>
        
        {/* Información de estado */}
        <View className="flex-1 min-w-0">
          <Text 
            className={cn('text-base font-bold', config.textColor)}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {config.text}
          </Text>
          <Text 
            className="text-sm text-muted mt-0.5" 
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {config.description}
          </Text>
        </View>
        
        {/* Flecha premium */}
        <View className="bg-surface/50 w-8 h-8 rounded-full items-center justify-center">
          <Text className="text-muted text-lg font-light">›</Text>
        </View>
      </View>
    </Pressable>
  );
}
