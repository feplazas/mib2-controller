import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 64 + bottomPadding; // Increased height for better touch targets

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
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="usb-status"
        options={{
          title: "Estado USB",
          tabBarIcon: ({ color}) => <IconSymbol size={24} name="antenna.radiowaves.left.and.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="auto-spoof"
        options={{
          title: "Auto Spoof",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="bolt.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="commands"
        options={{
          title: "Comandos",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="chevron.left.forwardslash.chevron.right" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Herramientas",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="wrench.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: "Datos",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diagnostic"
        options={{
          title: "Diag",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="stethoscope" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          title: "Perfiles",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Config",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gear" color={color} />,
        }}
      />
      
      {/* Hidden tabs - accessible via navigation but not shown in tab bar */}
      <Tabs.Screen
        name="usb-diag"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vcds"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="fec"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="toolbox"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="spoofing"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="recovery"
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
      <Tabs.Screen
        name="advanced-diag"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vidpid-profiles"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="macros"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
