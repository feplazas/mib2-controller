import { ReactNode } from "react";
import { View, Text, Platform, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/use-colors";

interface FDroidCardProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  icon?: string;
  iconBgColor?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'error' | 'primary' | 'muted';
  variant?: 'default' | 'highlight' | 'warning' | 'success' | 'error';
  style?: ViewStyle;
  compact?: boolean;
}

/**
 * FDroidCard - F-Droid Style Premium Card Component
 * 
 * Tarjeta con estilo F-Droid: icono en cuadro de color,
 * título, subtítulo, badge opcional, y animación de escala.
 */
export function FDroidCard({
  children,
  onPress,
  disabled = false,
  icon,
  iconBgColor,
  title,
  subtitle,
  badge,
  badgeColor = 'primary',
  variant = 'default',
  style,
  compact = false,
}: FDroidCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getBadgeColors = () => {
    switch (badgeColor) {
      case 'success': return { bg: '#22C55E20', text: '#22C55E' };
      case 'warning': return { bg: '#F59E0B20', text: '#F59E0B' };
      case 'error': return { bg: '#EF444420', text: '#EF4444' };
      case 'muted': return { bg: colors.muted + '20', text: colors.muted };
      default: return { bg: colors.primary + '20', text: colors.primary };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'highlight':
        return { borderColor: colors.primary, borderWidth: 2 };
      case 'warning':
        return { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.05)' };
      case 'success':
        return { borderColor: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.05)' };
      case 'error':
        return { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' };
      default:
        return { borderColor: colors.border };
    }
  };

  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !!onPress)
    .onBegin(() => {
      'worklet';
      scale.value = withTiming(0.97, { duration: 80, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(0.9, { duration: 80 });
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(1, { duration: 150 });
    })
    .onEnd(() => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (onPress) onPress();
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const variantStyles = getVariantStyles();
  const badgeColors = getBadgeColors();

  const content = (
    <View style={styles.content}>
      {/* Header con icono y título */}
      {(icon || title) && (
        <View style={styles.header}>
          {icon && (
            <View 
              style={[
                styles.iconContainer, 
                { backgroundColor: iconBgColor || colors.primary + '20' }
              ]}
            >
              <Text style={styles.icon}>{icon}</Text>
            </View>
          )}
          <View style={styles.titleContainer}>
            {title && (
              <View style={styles.titleRow}>
                <Text 
                  style={[styles.title, { color: colors.foreground }]} 
                  numberOfLines={1}
                >
                  {title}
                </Text>
                {badge && (
                  <View style={[styles.badge, { backgroundColor: badgeColors.bg }]}>
                    <Text style={[styles.badgeText, { color: badgeColors.text }]}>
                      {badge}
                    </Text>
                  </View>
                )}
              </View>
            )}
            {subtitle && (
              <Text 
                style={[styles.subtitle, { color: colors.muted }]} 
                numberOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )}
      
      {/* Contenido adicional */}
      {children}
    </View>
  );

  if (!onPress) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: variantStyles.borderColor,
            borderWidth: variantStyles.borderWidth || 1,
          },
          variantStyles.backgroundColor && { backgroundColor: variantStyles.backgroundColor },
          compact && styles.compact,
          disabled && styles.disabled,
          style,
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: variantStyles.borderColor,
            borderWidth: variantStyles.borderWidth || 1,
          },
          variantStyles.backgroundColor && { backgroundColor: variantStyles.backgroundColor },
          compact && styles.compact,
          disabled && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        {content}
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * FDroidListItem - F-Droid Style List Item
 * 
 * Elemento de lista con icono, título, subtítulo y flecha.
 */
interface FDroidListItemProps {
  icon?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

export function FDroidListItem({
  icon,
  iconBgColor,
  title,
  subtitle,
  value,
  onPress,
  showArrow = true,
  disabled = false,
  danger = false,
}: FDroidListItemProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !!onPress)
    .onBegin(() => {
      'worklet';
      scale.value = withTiming(0.98, { duration: 60 });
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withTiming(1, { duration: 100 });
    })
    .onEnd(() => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      if (onPress) onPress();
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <View style={styles.listItemContent}>
      {icon && (
        <View 
          style={[
            styles.listItemIcon, 
            { backgroundColor: iconBgColor || (danger ? '#EF444420' : colors.primary + '15') }
          ]}
        >
          <Text style={{ fontSize: 20 }}>{icon}</Text>
        </View>
      )}
      <View style={styles.listItemText}>
        <Text 
          style={[
            styles.listItemTitle, 
            { color: danger ? '#EF4444' : colors.foreground }
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.listItemSubtitle, { color: colors.muted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && (
        <Text style={[styles.listItemValue, { color: colors.muted }]}>
          {value}
        </Text>
      )}
      {showArrow && onPress && (
        <Text style={{ color: colors.muted, fontSize: 16 }}>›</Text>
      )}
    </View>
  );

  if (!onPress) {
    return <View style={[styles.listItem, disabled && styles.disabled]}>{content}</View>;
  }

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.listItem, disabled && styles.disabled, animatedStyle]}>
        {content}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  compact: {
    padding: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  // List Item styles
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemText: {
    flex: 1,
    gap: 2,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtitle: {
    fontSize: 13,
  },
  listItemValue: {
    fontSize: 14,
    marginRight: 4,
  },
});
