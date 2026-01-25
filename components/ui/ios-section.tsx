/**
 * iOS Section Components - Ultra Premium Apple HIG Style
 * 
 * Section header and footer components following Apple's
 * Human Interface Guidelines for grouped content.
 */

import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export interface IOSSectionHeaderProps extends ViewProps {
  /**
   * Section title
   */
  title: string;
  /**
   * Optional subtitle/description
   */
  subtitle?: string;
  /**
   * Right accessory component
   */
  rightAccessory?: React.ReactNode;
  /**
   * Use uppercase title (iOS style)
   */
  uppercase?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

export function IOSSectionHeader({
  title,
  subtitle,
  rightAccessory,
  uppercase = true,
  className,
  ...props
}: IOSSectionHeaderProps) {
  return (
    <View
      className={cn(
        'px-4 pt-6 pb-2',
        className
      )}
      {...props}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className={cn(
            'text-muted font-medium',
            uppercase ? 'text-xs uppercase tracking-wider' : 'text-sm'
          )}
        >
          {uppercase ? title.toUpperCase() : title}
        </Text>
        {rightAccessory}
      </View>
      {subtitle && (
        <Text className="text-xs text-mutedSecondary mt-1">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export interface IOSSectionFooterProps extends ViewProps {
  /**
   * Footer text
   */
  text: string;
  /**
   * Additional className
   */
  className?: string;
}

export function IOSSectionFooter({
  text,
  className,
  ...props
}: IOSSectionFooterProps) {
  return (
    <View
      className={cn(
        'px-4 pt-2 pb-4',
        className
      )}
      {...props}
    >
      <Text className="text-xs text-mutedSecondary leading-relaxed">
        {text}
      </Text>
    </View>
  );
}

/**
 * iOS Section Container - Groups related content
 */
export interface IOSSectionProps extends ViewProps {
  /**
   * Section header title
   */
  title?: string;
  /**
   * Section header subtitle
   */
  subtitle?: string;
  /**
   * Section footer text
   */
  footer?: string;
  /**
   * Right accessory for header
   */
  headerAccessory?: React.ReactNode;
  /**
   * Children content
   */
  children: React.ReactNode;
  /**
   * Additional className
   */
  className?: string;
}

export function IOSSection({
  title,
  subtitle,
  footer,
  headerAccessory,
  children,
  className,
  ...props
}: IOSSectionProps) {
  return (
    <View className={cn('mb-4', className)} {...props}>
      {title && (
        <IOSSectionHeader
          title={title}
          subtitle={subtitle}
          rightAccessory={headerAccessory}
        />
      )}
      <View className="bg-surface rounded-xl overflow-hidden border border-border mx-4">
        {children}
      </View>
      {footer && <IOSSectionFooter text={footer} />}
    </View>
  );
}

/**
 * iOS Row - Standard row for settings/lists
 */
export interface IOSRowProps extends ViewProps {
  /**
   * Row label
   */
  label: string;
  /**
   * Row value/detail
   */
  value?: string;
  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;
  /**
   * Right accessory component
   */
  rightAccessory?: React.ReactNode;
  /**
   * Show chevron indicator
   */
  showChevron?: boolean;
  /**
   * Show separator
   */
  separator?: boolean;
  /**
   * Destructive style (red text)
   */
  destructive?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

export function IOSRow({
  label,
  value,
  leftIcon,
  rightAccessory,
  showChevron = false,
  separator = true,
  destructive = false,
  className,
  ...props
}: IOSRowProps) {
  return (
    <View
      className={cn(
        'flex-row items-center px-4 py-3 min-h-[44px]',
        separator && 'border-b border-separator',
        className
      )}
      {...props}
    >
      {leftIcon && (
        <View className="mr-3">
          {leftIcon}
        </View>
      )}
      <View className="flex-1 flex-row items-center justify-between">
        <Text
          className={cn(
            'text-base',
            destructive ? 'text-error' : 'text-foreground'
          )}
        >
          {label}
        </Text>
        <View className="flex-row items-center gap-2">
          {value && (
            <Text className="text-base text-muted">
              {value}
            </Text>
          )}
          {rightAccessory}
          {showChevron && (
            <Text className="text-muted text-lg">›</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default IOSSection;
