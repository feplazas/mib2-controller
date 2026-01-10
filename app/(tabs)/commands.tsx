import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";

interface MIB2Command {
  id: string;
  name: string;
  category: 'diagnostic' | 'configuration' | 'information';
  description: string;
  command: string;
  requiresConfirmation: boolean;
}

const PREDEFINED_COMMANDS: MIB2Command[] = [
  {
    id: 'firmware_version',
    name: 'Versión de Firmware',
    category: 'information',
    description: 'Obtiene la versión actual del firmware instalado',
    command: 'cat /net/rcc/mnt/efs-persist/FW/version.txt',
    requiresConfirmation: false,
  },
  {
    id: 'system_info',
    name: 'Información del Sistema',
    category: 'information',
    description: 'Muestra información del sistema operativo QNX',
    command: 'uname -a',
    requiresConfirmation: false,
  },
  {
    id: 'cpu_info',
    name: 'Información de CPU',
    category: 'diagnostic',
    description: 'Muestra información del procesador',
    command: 'cat /proc/cpuinfo',
    requiresConfirmation: false,
  },
  {
    id: 'memory_info',
    name: 'Uso de Memoria',
    category: 'diagnostic',
    description: 'Muestra el uso actual de memoria',
    command: 'free',
    requiresConfirmation: false,
  },
  {
    id: 'mounted_devices',
    name: 'Dispositivos Montados',
    category: 'information',
    description: 'Lista todos los dispositivos y puntos de montaje',
    command: 'mount',
    requiresConfirmation: false,
  },
  {
    id: 'network_interfaces',
    name: 'Interfaces de Red',
    category: 'diagnostic',
    description: 'Muestra configuración de interfaces de red',
    command: 'ifconfig',
    requiresConfirmation: false,
  },
  {
    id: 'running_processes',
    name: 'Procesos en Ejecución',
    category: 'diagnostic',
    description: 'Lista todos los procesos activos',
    command: 'ps aux',
    requiresConfirmation: false,
  },
  {
    id: 'disk_usage',
    name: 'Uso de Disco',
    category: 'diagnostic',
    description: 'Muestra el uso de espacio en disco',
    command: 'df -h',
    requiresConfirmation: false,
  },
];

export default function CommandsScreen() {
  const { connectionStatus, executeCommand } = useTelnet();
  const [customCommand, setCustomCommand] = useState('');
  const [executing, setExecuting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleExecuteCommand = async (cmd: MIB2Command) => {
    if (!connectionStatus.connected) {
      Alert.alert('No Conectado', 'Debes conectarte a la unidad MIB2 primero');
      return;
    }

    if (cmd.requiresConfirmation) {
      Alert.alert(
        'Confirmar Comando',
        `¿Estás seguro de ejecutar: ${cmd.name}?\n\n${cmd.description}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ejecutar',
            style: 'destructive',
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diagnostic':
        return 'bg-warning/20 border-warning';
      case 'configuration':
        return 'bg-error/20 border-error';
      case 'information':
        return 'bg-primary/20 border-primary';
      default:
        return 'bg-muted/20 border-muted';
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category) {
      case 'diagnostic':
        return 'text-warning';
      case 'configuration':
        return 'text-error';
      case 'information':
        return 'text-primary';
      default:
        return 'text-muted';
    }
  };

  const filteredCommands = selectedCategory === 'all'
    ? PREDEFINED_COMMANDS
    : PREDEFINED_COMMANDS.filter(cmd => cmd.category === selectedCategory);

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground">Comandos</Text>
            <Text className="text-sm text-muted mt-1">
              {connectionStatus.connected ? 'Selecciona un comando para ejecutar' : 'Conecta a MIB2 para ejecutar comandos'}
            </Text>
          </View>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === 'all' ? 'bg-primary border-primary' : 'bg-surface border-border'
              }`}
            >
              <Text className={selectedCategory === 'all' ? 'text-white font-medium' : 'text-muted'}>
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedCategory('information')}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === 'information' ? 'bg-primary border-primary' : 'bg-surface border-border'
              }`}
            >
              <Text className={selectedCategory === 'information' ? 'text-white font-medium' : 'text-muted'}>
                Información
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedCategory('diagnostic')}
              className={`px-4 py-2 rounded-full border ${
                selectedCategory === 'diagnostic' ? 'bg-primary border-primary' : 'bg-surface border-border'
              }`}
            >
              <Text className={selectedCategory === 'diagnostic' ? 'text-white font-medium' : 'text-muted'}>
                Diagnóstico
              </Text>
            </TouchableOpacity>
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
                  <Text className="text-base font-semibold text-foreground flex-1">
                    {cmd.name}
                  </Text>
                  <View className={`px-2 py-1 rounded ${getCategoryColor(cmd.category)}`}>
                    <Text className={`text-xs font-medium ${getCategoryTextColor(cmd.category)}`}>
                      {cmd.category === 'diagnostic' && 'Diagnóstico'}
                      {cmd.category === 'configuration' && 'Configuración'}
                      {cmd.category === 'information' && 'Info'}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-muted leading-relaxed mb-2">
                  {cmd.description}
                </Text>
                <Text className="text-xs text-muted font-mono bg-background px-2 py-1 rounded">
                  {cmd.command}
                </Text>
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
