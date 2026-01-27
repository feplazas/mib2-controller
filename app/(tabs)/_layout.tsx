import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import { BlurView } from "expo-blur";

import { HapticTab } from "@/components/haptic-tab";
import { AnimatedTabIcon } from "@/components/ui/animated-tab-icon";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "@/lib/language-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

/**
 * Tab Layout - Ultra Premium Apple iOS 18 Style
 * 
 * Clean, minimal navigation with 5 main tabs following iOS HIG:
 * - Home: Dashboard and connection status
 * - USB: USB adapter management and spoofing
 * - Tools: Telnet commands, macros, and utilities
 * - Actions: All tools, recovery, FEC, backups
 * - Settings: App configuration
 * 
 * Features:
 * - iOS 18 style tab bar with subtle blur
 * - Animated tab icons with glow/pulse effect
 * - Premium 49pt height matching iOS standards
 * - Smooth transitions between tabs
 */
export default function TabLayout() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  
  // iOS standard tab bar height (49pt) + safe area
  const bottomPadding = Platform.OS === "web" ? 24 : Math.max(insets.bottom, 20);
  const tabBarHeight = 49 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        // Ultra smooth transitions - iOS style
        animation: 'shift',
        tabBarHideOnKeyboard: true,
        // Transiciones suaves entre pantallas
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: Platform.OS === 'web' 
            ? colors.background 
            : 'transparent',
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          // iOS-style absolute positioning
          ...(Platform.OS === 'web' ? {} : {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }),
        },
        // iOS-style blur background for tab bar
        tabBarBackground: () => (
          Platform.OS !== 'web' ? (
            <BlurView
              intensity={80}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : (
            <View 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.background,
              }}
            />
          )
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: -0.2,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        // Performance optimizations
        lazy: true,
        freezeOnBlur: true,
      }}
    >
      {/* Main visible tabs - 5 tabs following iOS HIG */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              size={24} 
              name="house.fill" 
              color={color}
              focused={focused}
              glowColor={colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="auto-spoof"
        options={{
          title: "USB",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              size={24} 
              name="cable.connector" 
              color={color}
              focused={focused}
              glowColor={colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="commands"
        options={{
          title: t('tabs.tools'),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              size={24} 
              name="wrench.fill" 
              color={color}
              focused={focused}
              glowColor={colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: t("tabs.actions"),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              size={24} 
              name="bolt.fill" 
              color={color}
              focused={focused}
              glowColor={colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="network-scanner"
        options={{
          title: t('tabs.network'),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              size={24} 
              name="point.3.connected.trianglepath.dotted" 
              color={color}
              focused={focused}
              glowColor={colors.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.config'),
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              size={24} 
              name="gear" 
              color={color}
              focused={focused}
              glowColor={colors.primary}
            />
          ),
        }}
      />
      
      {/* Hidden tabs - accessible via navigation from Actions hub */}
      <Tabs.Screen
        name="usb-status"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="diag"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="fec"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="tools"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="backups"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="toolbox"
        options={{ href: null }}
      />
    </Tabs>
  );
}
