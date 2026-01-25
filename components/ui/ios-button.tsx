/**
 * iOS Button Component - Ultra Premium Apple HIG Style
 * 
 * A button component that follows Apple's Human Interface Guidelines
 * with proper haptic feedback, animations, and styling.
 */

import { 
  TouchableOpacity, 
  Text, 
  View, 
  ActivityIndicator,
  type TouchableOpacityProps,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";
import { useColors } from "@/hooks/use-colors";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export interface IOSButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;
  /**
   * Right icon component
   */
  rightIcon?: React.ReactNode;
  /**
   * Button label
   */
  children: React.ReactNode;
  /**
   * Haptic feedback type
   */
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
  /**
   * Additional className for container
   */
  className?: string;
  /**
   * Additional className for text
   */
  textClassName?: string;
}

const sizeStyles = {
  sm: {
    container: 'px-4 py-2 rounded-lg',
    text: 'text-sm font-semibold',
    iconSize: 16,
  },
  md: {
    container: 'px-5 py-3 rounded-xl',
    text: 'text-base font-semibold',
    iconSize: 20,
  },
  lg: {
    container: 'px-6 py-4 rounded-2xl',
    text: 'text-lg font-semibold',
    iconSize: 24,
  },
};

export function IOSButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  haptic = 'light',
  className,
  textClassName,
  onPress,
  ...props
}: IOSButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withTiming(0.97, { 
      duration: 100, 
      easing: Easing.out(Easing.ease) 
    });
  };
  
  const handlePressOut = () => {
    scale.value = withTiming(1, { 
      duration: 150, 
      easing: Easing.out(Easing.ease) 
    });
  };
  
  const handlePress = (e: any) => {
    if (disabled || loading) return;
    
    // Haptic feedback
    if (haptic !== 'none' && Platform.OS !== 'web') {
      const hapticMap = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      Haptics.impactAsync(hapticMap[haptic]);
    }
    
    onPress?.(e);
  };
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-primary',
          text: 'text-white',
          loader: '#FFFFFF',
        };
      case 'secondary':
        return {
          container: 'bg-fill',
          text: 'text-primary',
          loader: colors.primary,
        };
      case 'tertiary':
        return {
          container: 'bg-transparent',
          text: 'text-primary',
          loader: colors.primary,
        };
      case 'destructive':
        return {
          container: 'bg-error',
          text: 'text-white',
          loader: '#FFFFFF',
        };
      case 'ghost':
        return {
          container: 'bg-transparent',
          text: 'text-foreground',
          loader: colors.foreground,
        };
      default:
        return {
          container: 'bg-primary',
          text: 'text-white',
          loader: '#FFFFFF',
        };
    }
  };
  
  const variantStyles = getVariantStyles();
  const sizeStyle = sizeStyles[size];
  
  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        animatedStyle,
        (disabled || loading) && { opacity: 0.5 },
      ]}
      {...props}
    >
      <View
        className={cn(
          'flex-row items-center justify-center gap-2',
          variantStyles.container,
          sizeStyle.container,
          fullWidth && 'w-full',
          className
        )}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variantStyles.loader} 
          />
        ) : (
          <>
            {leftIcon}
            {typeof children === 'string' ? (
              <Text
                className={cn(
                  variantStyles.text,
                  sizeStyle.text,
                  textClassName
                )}
              >
                {children}
              </Text>
            ) : (
              children
            )}
            {rightIcon}
          </>
        )}
      </View>
    </AnimatedTouchable>
  );
}

/**
 * iOS Text Button - Simple text-only button
 */
export function IOSTextButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onPress,
  className,
  ...props
}: Omit<IOSButtonProps, 'leftIcon' | 'rightIcon' | 'fullWidth' | 'loading'>) {
  const colors = useColors();
  
  const getTextColor = () => {
    if (disabled) return 'text-muted';
    switch (variant) {
      case 'primary':
        return 'text-primary';
      case 'destructive':
        return 'text-error';
      default:
        return 'text-primary';
    }
  };
  
  const handlePress = (e: any) => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.6}
      {...props}
    >
      <Text
        className={cn(
          getTextColor(),
          sizeStyles[size].text,
          className
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export default IOSButton;
