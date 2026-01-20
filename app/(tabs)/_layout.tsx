import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "@/lib/language-context";

/**
 * Tab Layout - Apple HIG Inspired
 * 
 * Simplified navigation with 5 main tabs following iOS design patterns:
 * - Home: Dashboard and connection status
 * - USB: USB adapter management and spoofing
 * - Tools: Telnet commands, macros, and utilities
 * - Toolbox: MIB2 Toolbox installation and management
 * - Settings: App configuration
 */
export default function TabLayout() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  
  // iOS-style tab bar dimensions
  const bottomPadding = Platform.OS === "web" ? 16 : Math.max(insets.bottom, 12);
  const tabBarHeight = 49 + bottomPadding; // iOS standard is 49pt

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          // iOS-style blur effect simulation
          ...(Platform.OS === 'web' ? {} : {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: -0.2,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      {/* Main visible tabs - 5 tabs following iOS HIG */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="house.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="auto-spoof"
        options={{
          title: "USB",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="cable.connector" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="commands"
        options={{
          title: t('tabs.tools'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="wrench.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="toolbox"
        options={{
          title: "Toolbox",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="hammer.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.config'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="gear" 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Hidden tabs - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="usb-status"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="recovery"
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
    </Tabs>
  );
}
