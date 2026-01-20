import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTranslation } from "@/lib/language-context";

export default function ToolsScreen() {
  const t = useTranslation();
  
  const tools = [
    { id: 'fec', title: t('home.fec_title'), description: t('home.fec_desc'), icon: '🔑' },
    { id: 'toolbox', title: t('home.toolbox_title'), description: t('home.toolbox_desc'), icon: '🛠️' },
    { id: 'auto-spoof', title: t('home.spoof_title'), description: t('home.spoof_desc'), icon: '⚡' },
    { id: 'usb-status', title: t('home.usb_title'), description: t('home.usb_desc'), icon: '🔌' },
    { id: 'commands', title: t('home.telnet_title'), description: t('home.telnet_desc'), icon: '💻' },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View className="gap-4">
          <View className="mb-4">
            <Text className="text-3xl font-bold text-foreground">{t('home.tools')}</Text>
            <Text className="text-sm text-muted mt-1">
              {t('home.tools_subtitle')}
            </Text>
          </View>

          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              onPress={() => router.push(`/(tabs)/${tool.id}` as any)}
              className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-3xl">{tool.icon}</Text>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">{tool.title}</Text>
                  <Text className="text-sm text-muted mt-1">{tool.description}</Text>
                </View>
                <Text className="text-2xl text-muted">›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
