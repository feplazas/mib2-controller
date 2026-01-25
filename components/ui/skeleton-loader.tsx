import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * SkeletonLoader - Componente base con efecto shimmer
 * Muestra un placeholder animado mientras cargan los datos
 */
export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1, // Repetir infinitamente
      false // No reversar
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-100, 100]
    );
    return {
      transform: [{ translateX: `${translateX}%` as any }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

/**
 * SkeletonText - Skeleton para líneas de texto
 */
export function SkeletonText({
  lines = 1,
  lineHeight = 16,
  spacing = 8,
  lastLineWidth = '60%',
  style,
}: {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: string | number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          borderRadius={4}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
        />
      ))}
    </View>
  );
}

/**
 * SkeletonCard - Skeleton para tarjetas completas
 */
export function SkeletonCard({
  showIcon = true,
  showTitle = true,
  showSubtitle = true,
  showContent = true,
  contentLines = 2,
  style,
}: {
  showIcon?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showContent?: boolean;
  contentLines?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        {showIcon && (
          <SkeletonLoader
            width={48}
            height={48}
            borderRadius={12}
            style={{ marginRight: 12 }}
          />
        )}
        <View style={styles.cardHeaderText}>
          {showTitle && (
            <SkeletonLoader
              width="70%"
              height={20}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
          )}
          {showSubtitle && (
            <SkeletonLoader
              width="50%"
              height={14}
              borderRadius={4}
            />
          )}
        </View>
      </View>
      {showContent && (
        <View style={styles.cardContent}>
          <SkeletonText lines={contentLines} lineHeight={14} />
        </View>
      )}
    </View>
  );
}

/**
 * SkeletonList - Skeleton para listas de items
 */
export function SkeletonList({
  items = 3,
  itemHeight = 72,
  showIcon = true,
  spacing = 12,
  style,
}: {
  items?: number;
  itemHeight?: number;
  showIcon?: boolean;
  spacing?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {Array.from({ length: items }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.listItem,
            { height: itemHeight, marginBottom: index < items - 1 ? spacing : 0 },
          ]}
        >
          {showIcon && (
            <SkeletonLoader
              width={40}
              height={40}
              borderRadius={20}
              style={{ marginRight: 12 }}
            />
          )}
          <View style={styles.listItemContent}>
            <SkeletonLoader
              width="60%"
              height={16}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <SkeletonLoader
              width="80%"
              height={12}
              borderRadius={4}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * SkeletonButton - Skeleton para botones
 */
export function SkeletonButton({
  width = '100%',
  height = 48,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <SkeletonLoader
      width={width}
      height={height}
      borderRadius={12}
      style={style}
    />
  );
}

/**
 * SkeletonAvatar - Skeleton para avatares/iconos circulares
 */
export function SkeletonAvatar({
  size = 48,
  style,
}: {
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <SkeletonLoader
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(155, 161, 166, 0.2)',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardContent: {
    marginTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  listItemContent: {
    flex: 1,
  },
});
