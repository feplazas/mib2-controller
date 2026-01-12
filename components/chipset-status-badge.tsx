import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';

export type ChipsetCompatibility = 'confirmed' | 'experimental' | 'incompatible' | 'unknown';

interface ChipsetStatusBadgeProps {
  chipset: string;
  compatibility: ChipsetCompatibility;
  animated?: boolean;
}

export function ChipsetStatusBadge({ chipset, compatibility, animated = true }: ChipsetStatusBadgeProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (animated && compatibility === 'confirmed') {
      // Animación de pulso para chipsets confirmados
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Repetir infinitamente
        false
      );
    } else if (animated && compatibility === 'experimental') {
      // Animación de fade para chipsets experimentales
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [compatibility, animated]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getStatusConfig = () => {
    switch (compatibility) {
      case 'confirmed':
        return {
          icon: '✅',
          label: 'Confirmado Compatible',
          bgColor: 'rgba(34, 197, 94, 0.1)', // green
          borderColor: 'rgba(34, 197, 94, 0.5)',
          textColor: '#22C55E',
        };
      case 'experimental':
        return {
          icon: '⚠️',
          label: 'Experimental',
          bgColor: 'rgba(251, 191, 36, 0.1)', // yellow
          borderColor: 'rgba(251, 191, 36, 0.5)',
          textColor: '#FBBF24',
        };
      case 'incompatible':
        return {
          icon: '❌',
          label: 'Incompatible',
          bgColor: 'rgba(239, 68, 68, 0.1)', // red
          borderColor: 'rgba(239, 68, 68, 0.5)',
          textColor: '#EF4444',
        };
      default:
        return {
          icon: '❓',
          label: 'Desconocido',
          bgColor: 'rgba(156, 163, 175, 0.1)', // gray
          borderColor: 'rgba(156, 163, 175, 0.5)',
          textColor: '#9CA3AF',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
        animated ? animatedStyle : {},
      ]}
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: config.textColor }]}>
          {config.label}
        </Text>
        <Text style={[styles.chipset, { color: colors.muted }]}>
          {chipset}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipset: {
    fontSize: 12,
  },
});
