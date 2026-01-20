import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "@/lib/language-context";

/**
 * Tab Layout - Ultra Premium Apple HIG Inspired
 * 
 * Clean, minimal navigation with 5 main tabs following iOS design patterns:
 * - Home: Dashboard and connection status
 * - USB: USB adapter management and spoofing
 * - Tools: Telnet commands, macros, and utilities
 * - Diagnostics: All diagnostic tools, recovery, FEC, backups
 * - Settings: App configuration
 */
export default function TabLayout() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  
  // iOS-style tab bar dimensions (49pt standard height)
  const bottomPadding = Platform.OS === "web" ? 20 : Math.max(insets.bottom, 16);
  const tabBarHeight = 49 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          // iOS-style positioning
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
          letterSpacing: -0.1,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
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
        name="diagnostics"
        options={{
          title: t('tabs.diagnostics'),
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="waveform.path.ecg" 
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
      
      {/* Hidden tabs - accessible via navigation from Diagnostics hub */}
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
      <Tabs.Screen
        name="toolbox"
        options={{ href: null }}
      />
    </Tabs>
  );
}
