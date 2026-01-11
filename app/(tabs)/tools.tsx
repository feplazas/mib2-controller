import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

export default function ToolsScreen() {
  const tools = [
    { id: 'vcds', title: 'VCDS', description: 'Procedimientos VCDS con traducciones', icon: '🔧' },
    { id: 'fec', title: 'Generador FEC', description: 'Generar códigos FEC personalizados', icon: '🔑' },
    { id: 'toolbox', title: 'MIB2 Toolbox', description: 'Asistente de instalación', icon: '🛠️' },
    { id: 'macros', title: 'Macros', description: 'Secuencias de comandos automatizadas', icon: '▶️' },
    { id: 'spoofing', title: 'USB Spoofing', description: 'Modificar adaptadores ASIX', icon: '⚡' },
    { id: 'recovery', title: 'Recovery', description: 'Recuperar adaptadores brickeados', icon: '🔄' },
    { id: 'backups', title: 'Backups EEPROM', description: 'Gestionar copias de seguridad', icon: '💾' },
    { id: 'advanced-diag', title: 'Diagnóstico Avanzado', description: 'Editor hexadecimal de EEPROM', icon: '🔬' },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          <View className="mb-4">
            <Text className="text-3xl font-bold text-foreground">Herramientas</Text>
            <Text className="text-sm text-muted mt-1">
              Utilidades avanzadas para MIB2
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
