import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

interface EEPROMProgressBarProps {
  /** Current bytes processed */
  currentBytes: number;
  /** Total bytes to process */
  totalBytes: number;
  /** Operation type: 'read' or 'write' */
  operation: "read" | "write";
  /** Whether the operation is in progress */
  isActive: boolean;
  /** Optional: estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
  /** Optional: show detailed byte info */
  showDetails?: boolean;
  /** Optional: custom accent color */
  accentColor?: string;
}

/**
 * EEPROMProgressBar - Animated progress indicator for EEPROM operations
 * 
 * Features:
 * - Smooth progress bar animation
 * - Pulsing glow effect during operation
 * - Real-time byte counter with animation
 * - Time remaining estimate
 * - Haptic feedback at milestones
 */
export function EEPROMProgressBar({
  currentBytes,
  totalBytes,
  operation,
  isActive,
  estimatedTimeRemaining,
  showDetails = true,
  accentColor,
}: EEPROMProgressBarProps) {
  const colors = useColors();
  const progress = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);
  const bytesDisplay = useSharedValue(0);

  const operationColor = accentColor || (operation === "read" ? colors.primary : colors.warning);
  const percentage = totalBytes > 0 ? Math.round((currentBytes / totalBytes) * 100) : 0;

  // Update progress animation
  useEffect(() => {
    const targetProgress = totalBytes > 0 ? currentBytes / totalBytes : 0;
    progress.value = withSpring(targetProgress, {
      damping: 15,
      stiffness: 100,
    });
    bytesDisplay.value = withTiming(currentBytes, { duration: 300 });

    // Haptic feedback at milestones (25%, 50%, 75%, 100%)
    if (Platform.OS !== "web" && isActive) {
      if (percentage === 25 || percentage === 50 || percentage === 75) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (percentage === 100) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [currentBytes, totalBytes, percentage, isActive]);

  // Pulsing animation while active
  useEffect(() => {
    if (isActive) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseOpacity);
      cancelAnimation(glowScale);
      pulseOpacity.value = withTiming(0.3, { duration: 300 });
      glowScale.value = withTiming(1, { duration: 300 });
    }
  }, [isActive]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const containerGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <Animated.View style={[styles.container, containerGlowStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.operationBadge}>
          <Text style={[styles.operationIcon]}>
            {operation === "read" ? "📖" : "✏️"}
          </Text>
          <Text style={[styles.operationText, { color: operationColor }]}>
            {operation === "read" ? "Reading EEPROM" : "Writing EEPROM"}
          </Text>
        </View>
        <Text style={[styles.percentageText, { color: colors.foreground }]}>
          {percentage}%
        </Text>
      </View>

      {/* Progress Bar Container */}
      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        {/* Animated Progress Fill */}
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: operationColor },
            progressBarStyle,
          ]}
        >
          {/* Pulsing Glow Effect */}
          <Animated.View
            style={[
              styles.progressGlow,
              { backgroundColor: operationColor },
              pulseStyle,
            ]}
          />
        </Animated.View>

        {/* Animated Stripes (for active state) */}
        {isActive && (
          <View style={styles.stripesContainer}>
            <AnimatedStripes color={operationColor} />
          </View>
        )}
      </View>

      {/* Details */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>
              Bytes processed:
            </Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {formatBytes(currentBytes)} / {formatBytes(totalBytes)}
            </Text>
          </View>
          
          {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Time remaining:
              </Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                ~{formatTime(estimatedTimeRemaining)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isActive ? colors.success : colors.muted },
          ]}
        />
        <Text style={[styles.statusText, { color: colors.muted }]}>
          {isActive ? "In progress..." : percentage === 100 ? "Complete" : "Waiting"}
        </Text>
      </View>
    </Animated.View>
  );
}

/** Animated diagonal stripes for active progress */
function AnimatedStripes({ color }: { color: string }) {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(-20, { duration: 500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const stripesStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.stripes, stripesStyle]}>
      {Array.from({ length: 20 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stripe,
            { backgroundColor: `${color}30` },
          ]}
        />
      ))}
    </Animated.View>
  );
}

/**
 * Compact version for inline display
 */
export function EEPROMProgressCompact({
  currentBytes,
  totalBytes,
  operation,
  isActive,
}: Pick<EEPROMProgressBarProps, "currentBytes" | "totalBytes" | "operation" | "isActive">) {
  const colors = useColors();
  const progress = useSharedValue(0);
  const operationColor = operation === "read" ? colors.primary : colors.warning;
  const percentage = totalBytes > 0 ? Math.round((currentBytes / totalBytes) * 100) : 0;

  useEffect(() => {
    const targetProgress = totalBytes > 0 ? currentBytes / totalBytes : 0;
    progress.value = withSpring(targetProgress, { damping: 15, stiffness: 100 });
  }, [currentBytes, totalBytes]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  return (
    <View style={styles.compactContainer}>
      <Text style={[styles.compactIcon]}>
        {operation === "read" ? "📖" : "✏️"}
      </Text>
      <View style={[styles.compactProgressBg, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[styles.compactProgressFill, { backgroundColor: operationColor }, progressStyle]}
        />
      </View>
      <Text style={[styles.compactPercentage, { color: colors.foreground }]}>
        {percentage}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  operationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  operationIcon: {
    fontSize: 18,
  },
  operationText: {
    fontSize: 14,
    fontWeight: "600",
  },
  percentageText: {
    fontSize: 20,
    fontWeight: "700",
  },
  progressContainer: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
    position: "relative",
    overflow: "hidden",
  },
  progressGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
  },
  stripesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  stripes: {
    flexDirection: "row",
    position: "absolute",
    top: 0,
    left: -20,
    right: 0,
    bottom: 0,
  },
  stripe: {
    width: 10,
    height: "200%",
    marginRight: 10,
    transform: [{ rotate: "45deg" }, { translateY: -10 }],
  },
  detailsContainer: {
    marginTop: 12,
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  // Compact styles
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  compactIcon: {
    fontSize: 14,
  },
  compactProgressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  compactProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  compactPercentage: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
});
