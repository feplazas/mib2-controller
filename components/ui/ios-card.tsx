/**
 * iOS Card Component - Ultra Premium Apple HIG Style
 * 
 * A card component that follows Apple's Human Interface Guidelines
 * with proper shadows, borders, and spacing.
 */

import { View, type ViewProps, Platform, StyleSheet } from "react-native";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

export interface IOSCardProps extends ViewProps {
  /**
   * Card variant - determines background and elevation
   */
  variant?: 'default' | 'grouped' | 'inset' | 'elevated';
  /**
   * Whether to show a subtle border
   */
  bordered?: boolean;
  /**
   * Padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Border radius size
   */
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Additional className
   */
  className?: string;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const radiusMap = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
};

export function IOSCard({
  children,
  variant = 'default',
  bordered = true,
  padding = 'md',
  radius = 'lg',
  className,
  style,
  ...props
}: IOSCardProps) {
  const colors = useColors();
  
  const getBackgroundClass = () => {
    switch (variant) {
      case 'grouped':
        return 'bg-surface';
      case 'inset':
        return 'bg-surfaceSecondary';
      case 'elevated':
        return 'bg-surface';
      default:
        return 'bg-surface';
    }
  };
  
  const getShadowStyle = () => {
    if (variant === 'elevated') {
      return Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
        web: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      });
    }
    return {};
  };

  return (
    <View
      className={cn(
        getBackgroundClass(),
        radiusMap[radius],
        paddingMap[padding],
        bordered && 'border border-border',
        className
      )}
      style={[getShadowStyle(), style]}
      {...props}
    >
      {children}
    </View>
  );
}

/**
 * iOS List Group - Container for grouped list items
 */
export function IOSListGroup({
  children,
  className,
  ...props
}: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        'bg-surface rounded-xl overflow-hidden border border-border',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

/**
 * iOS List Item - Individual item in a list group
 */
export interface IOSListItemProps extends ViewProps {
  /**
   * Show separator below item
   */
  separator?: boolean;
  /**
   * Padding size
   */
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

const itemPaddingMap = {
  sm: 'px-4 py-2',
  md: 'px-4 py-3',
  lg: 'px-4 py-4',
};

export function IOSListItem({
  children,
  separator = true,
  padding = 'md',
  className,
  ...props
}: IOSListItemProps) {
  return (
    <View
      className={cn(
        itemPaddingMap[padding],
        separator && 'border-b border-separator',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export default IOSCard;
