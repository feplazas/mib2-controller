import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "@/lib/language-context";

export default function TabLayout() {
  const colors = useColors();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 64 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 12,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="usb-status"
        options={{
          title: t('tabs.usb'),
          tabBarIcon: ({ color}) => <IconSymbol size={24} name="antenna.radiowaves.left.and.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="auto-spoof"
        options={{
          title: t('tabs.spoof'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="bolt.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="commands"
        options={{
          title: t('tabs.telnet'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="chevron.left.forwardslash.chevron.right" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="toolbox"
        options={{
          title: t('tabs.toolbox'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="wrench.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="recovery"
        options={{
          title: t('tabs.recovery'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="bandage.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diag"
        options={{
          title: t('tabs.diag'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="fec"
        options={{
          title: t('tabs.fec'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="key.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.config'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gear" color={color} />,
        }}
      />
      
      {/* Hidden tabs - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="tools"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="backups"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
