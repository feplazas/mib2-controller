import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { offlineGuidesService, type OfflineStatus } from "@/lib/offline-guides-service";

interface OfflineCacheIndicatorProps {
  /** Show detailed info */
  showDetails?: boolean;
  /** Compact mode for inline display */
  compact?: boolean;
  /** Custom style */
  style?: object;
}

/**
 * OfflineCacheIndicator - Shows offline cache status with animations
 * 
 * Features:
 * - Real-time online/offline status
 * - Cache availability indicator
 * - Last update timestamp
 * - Animated status dot
 */
export function OfflineCacheIndicator({
  showDetails = true,
  compact = false,
  style,
}: OfflineCacheIndicatorProps) {
  const colors = useColors();
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const pulseOpacity = useSharedValue(1);
  const dotScale = useSharedValue(1);

  // Load status on mount
  useEffect(() => {
    loadStatus();
    
    // Subscribe to status changes
    const unsubscribe = offlineGuidesService.addListener((newStatus) => {
      setStatus(newStatus);
      
      // Haptic feedback on status change
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    });

    return () => {
      unsubscribe();
      cancelAnimation(pulseOpacity);
      cancelAnimation(dotScale);
    };
  }, []);

  // Animate status dot
  useEffect(() => {
    if (status?.isOnline) {
      // Steady glow when online
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      // Faster pulse when offline
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [status?.isOnline]);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      await offlineGuidesService.initialize();
      const currentStatus = await offlineGuidesService.getStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error("[OfflineCacheIndicator] Error loading status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getStatusColor = (): string => {
    if (!status) return colors.muted;
    if (status.isOnline) return colors.success;
    if (status.guidesAvailableOffline) return colors.warning;
    return colors.error;
  };

  const getStatusText = (): string => {
    if (!status) return "Loading...";
    if (status.isOnline) return "Online";
    if (status.guidesAvailableOffline) return "Offline (cached)";
    return "Offline (no cache)";
  };

  if (isLoading) {
    return (
      <View style={[compact ? styles.compactContainer : styles.container, style]}>
        <View style={[styles.statusDot, { backgroundColor: colors.muted }]} />
        <Text style={[styles.statusText, { color: colors.muted }]}>Loading...</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <Animated.View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor() },
            dotAnimatedStyle,
          ]}
        />
        <Text style={[styles.compactText, { color: colors.foreground }]}>
          {getStatusText()}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <Animated.View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor() },
              dotAnimatedStyle,
            ]}
          />
          <Text style={[styles.statusText, { color: colors.foreground }]}>
            {getStatusText()}
          </Text>
        </View>
        
        {status?.guidesVersion && (
          <View style={[styles.versionBadge, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.versionText, { color: colors.primary }]}>
              v{status.guidesVersion}
            </Text>
          </View>
        )}
      </View>

      {/* Details */}
      {showDetails && status && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>
              📦 Cache status:
            </Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {status.guidesAvailableOffline ? "Available" : "Not available"}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>
              🕐 Last updated:
            </Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {formatDate(status.guidesSavedAt)}
            </Text>
          </View>
          
          {status.languages.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                🌐 Languages:
              </Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                {status.languages.map(l => l.toUpperCase()).join(", ")}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Offline notice */}
      {!status?.isOnline && status?.guidesAvailableOffline && (
        <View style={[styles.notice, { backgroundColor: colors.warning + "15" }]}>
          <Text style={[styles.noticeText, { color: colors.warning }]}>
            📴 You're offline. Guides are available from cache.
          </Text>
        </View>
      )}

      {!status?.isOnline && !status?.guidesAvailableOffline && (
        <View style={[styles.notice, { backgroundColor: colors.error + "15" }]}>
          <Text style={[styles.noticeText, { color: colors.error }]}>
            ⚠️ You're offline and no cached guides are available.
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Compact badge for showing offline status in headers
 */
export function OfflineStatusBadge() {
  const colors = useColors();
  const [isOnline, setIsOnline] = useState(true);
  const [hasCachedGuides, setHasCachedGuides] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await offlineGuidesService.getStatus();
      setIsOnline(status.isOnline);
      setHasCachedGuides(status.guidesAvailableOffline);
    };

    checkStatus();

    const unsubscribe = offlineGuidesService.addListener((status) => {
      setIsOnline(status.isOnline);
      setHasCachedGuides(status.guidesAvailableOffline);
    });

    return () => unsubscribe();
  }, []);

  // Only show badge when offline
  if (isOnline) return null;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: hasCachedGuides ? colors.warning : colors.error },
      ]}
    >
      <Text style={styles.badgeText}>
        {hasCachedGuides ? "📴 Offline" : "⚠️ No Cache"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  compactText: {
    fontSize: 12,
  },
  versionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  versionText: {
    fontSize: 11,
    fontWeight: "600",
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  notice: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  noticeText: {
    fontSize: 12,
    textAlign: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});
