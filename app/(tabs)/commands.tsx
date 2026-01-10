import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";
import { 
  MIB2_COMMANDS, 
  getCommandsByCategory, 
  getRiskLevelColor, 
  getRiskLevelLabel,
  type CommandCategory,
  type MIB2Command 
} from "@/lib/mib2-commands";
import { useExpertMode } from "@/lib/expert-mode-provider";

export default function CommandsScreen() {
  const { connectionStatus, executeCommand } = useTelnet();
  const { isExpertMode } = useExpertMode();
  const [customCommand, setCustomCommand] = useState('');
  const [executing, setExecuting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CommandCategory | 'all'>('all');

  const handleExecuteCommand = async (cmd: MIB2Command) => {
    if (!connectionStatus.connected) {
      Alert.alert('No Conectado', 'Debes conectarte a la unidad MIB2 primero');
      return;
    }

    // Check if expert mode is required
    if (cmd.expertOnly && !isExpertMode) {
      Alert.alert(
        'Modo Experto Requerido',
        'Este comando requiere activar el Modo Experto en Configuración'
      );
      return;
    }

    const riskLabel = getRiskLevelLabel(cmd.riskLevel);
    const confirmMessage = cmd.notes 
      ? `${cmd.description}\n\nNivel de riesgo: ${riskLabel}\n\n${cmd.notes}`
      : `${cmd.description}\n\nNivel de riesgo: ${riskLabel}`;

    if (cmd.requiresConfirmation) {
      Alert.alert(
        'Confirmar Comando',
        confirmMessage,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ejecutar',
            style: cmd.riskLevel === 'critical' || cmd.riskLevel === 'high' ? 'destructive' : 'default',
            onPress: () => executeCommandInternal(cmd.command),
          },
        ]
      );
    } else {
      executeCommandInternal(cmd.command);
    }
  };

  const executeCommandInternal = async (command: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExecuting(true);

    try {
      const response = await executeCommand(command);
      
      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', response.error || 'Error al ejecutar comando');
      }
    } finally {
      setExecuting(false);
    }
  };

  const handleExecuteCustomCommand = () => {
    if (!customCommand.trim()) {
      Alert.alert('Comando Vacío', 'Ingresa un comando para ejecutar');
      return;
    }

    Alert.alert(
      'Ejecutar Comando Personalizado',
      `¿Ejecutar el siguiente comando?\n\n${customCommand}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ejecutar',
          style: 'destructive',
          onPress: () => {
            executeCommandInternal(customCommand);
            setCustomCommand('');
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: CommandCategory) => {
    switch (category) {
      case 'diagnostic':
        return 'bg-blue-500/20 border-blue-500';
      case 'configuration':
        return 'bg-purple-500/20 border-purple-500';
      case 'information':
        return 'bg-primary/20 border-primary';
      case 'adaptation':
        return 'bg-orange-500/20 border-orange-500';
      case 'skin':
        return 'bg-pink-500/20 border-pink-500';
      case 'network':
        return 'bg-green-500/20 border-green-500';
      case 'filesystem':
        return 'bg-yellow-500/20 border-yellow-500';
      case 'advanced':
        return 'bg-error/20 border-error';
      default:
        return 'bg-muted/20 border-muted';
    }
  };

  const getCategoryTextColor = (category: CommandCategory) => {
    switch (category) {
      case 'diagnostic':
        return 'text-blue-500';
      case 'configuration':
        return 'text-purple-500';
      case 'information':
        return 'text-primary';
      case 'adaptation':
        return 'text-orange-500';
      case 'skin':
        return 'text-pink-500';
      case 'network':
        return 'text-green-500';
      case 'filesystem':
        return 'text-yellow-500';
      case 'advanced':
        return 'text-error';
      default:
        return 'text-muted';
    }
  };

  const getCategoryLabel = (category: CommandCategory): string => {
    const labels: Record<CommandCategory, string> = {
      information: 'Información',
      diagnostic: 'Diagnóstico',
      configuration: 'Configuración',
      adaptation: 'Adaptaciones',
      skin: 'Skins',
      network: 'Red',
      filesystem: 'Archivos',
      advanced: 'Avanzado',
    };
    return labels[category];
  };

  // Filter commands
  let filteredCommands = selectedCategory === 'all' 
    ? MIB2_COMMANDS 
    : getCommandsByCategory(selectedCategory);

  // Hide expert commands if not in expert mode
  if (!isExpertMode) {
    filteredCommands = filteredCommands.filter(cmd => !cmd.expertOnly);
  }

  const categories: Array<CommandCategory | 'all'> = [
    'all',
    'information',
    'diagnostic',
    'adaptation',
    'skin',
    'network',
    'filesystem',
    'advanced',
  ];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Comandos</Text>
              {isExpertMode && (
                <View className="bg-error/20 border border-error px-3 py-1 rounded-full">
                  <Text className="text-error text-xs font-bold">MODO EXPERTO</Text>
                </View>
              )}
            </View>
            <Text className="text-sm text-muted mt-1">
              {connectionStatus.connected 
                ? `${filteredCommands.length} comandos disponibles` 
                : 'Conecta a MIB2 para ejecutar comandos'}
            </Text>
          </View>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === cat ? 'bg-primary border-primary' : 'bg-surface border-border'
                }`}
              >
                <Text className={selectedCategory === cat ? 'text-white font-medium' : 'text-muted'}>
                  {cat === 'all' ? 'Todos' : getCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Command List */}
          <View className="gap-3">
            {filteredCommands.map((cmd) => (
              <TouchableOpacity
                key={cmd.id}
                onPress={() => handleExecuteCommand(cmd)}
                disabled={!connectionStatus.connected || executing}
                className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
                style={{ opacity: !connectionStatus.connected || executing ? 0.5 : 1 }}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-base font-semibold text-foreground">
                      {cmd.name}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    <View className={`px-2 py-1 rounded ${getCategoryColor(cmd.category)}`}>
                      <Text className={`text-xs font-medium ${getCategoryTextColor(cmd.category)}`}>
                        {getCategoryLabel(cmd.category)}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded bg-${getRiskLevelColor(cmd.riskLevel)}/20 border-${getRiskLevelColor(cmd.riskLevel)}`}>
                      <Text className={`text-xs font-medium text-${getRiskLevelColor(cmd.riskLevel)}`}>
                        {getRiskLevelLabel(cmd.riskLevel)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-sm text-muted leading-relaxed mb-2">
                  {cmd.description}
                </Text>
                {cmd.notes && (
                  <Text className="text-xs text-warning mb-2">
                    💡 {cmd.notes}
                  </Text>
                )}
                <Text className="text-xs text-muted font-mono bg-background px-2 py-1 rounded">
                  {cmd.command}
                </Text>
                {cmd.expertOnly && (
                  <View className="mt-2">
                    <Text className="text-xs text-error font-semibold">
                      🔒 Requiere Modo Experto
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Command */}
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-base font-semibold text-foreground mb-3">
              Comando Personalizado
            </Text>
            <TextInput
              value={customCommand}
              onChangeText={setCustomCommand}
              placeholder="Ingresa un comando shell..."
              multiline
              numberOfLines={3}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground font-mono text-sm mb-3"
              editable={connectionStatus.connected && !executing}
            />
            <TouchableOpacity
              onPress={handleExecuteCustomCommand}
              disabled={!connectionStatus.connected || executing || !customCommand.trim()}
              className="bg-primary px-4 py-3 rounded-lg active:opacity-80"
              style={{ opacity: !connectionStatus.connected || executing || !customCommand.trim() ? 0.5 : 1 }}
            >
              <Text className="text-white font-semibold text-center">
                Ejecutar Comando
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
