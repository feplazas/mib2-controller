import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

export default function DataScreen() {
  const dataTools = [
    { id: 'logs', title: 'Logs', description: 'Historial de comandos ejecutados', icon: '📋' },
    { id: 'stats', title: 'Estadísticas', description: 'Dashboard con gráficos y métricas', icon: '📊' },
    { id: 'backups', title: 'Backups EEPROM', description: 'Gestión de backups de adaptadores', icon: '💾' },
    { id: 'queue', title: 'Cola Offline', description: 'Comandos pendientes de ejecución', icon: '📝' },
    { id: 'config', title: 'Exportar/Importar', description: 'Backup de configuración completa', icon: '🔄' },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          <View className="mb-4">
            <Text className="text-3xl font-bold text-foreground">Datos</Text>
            <Text className="text-sm text-muted mt-1">
              Logs, estadísticas y backups
            </Text>
          </View>

          {dataTools.map((tool) => (
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
