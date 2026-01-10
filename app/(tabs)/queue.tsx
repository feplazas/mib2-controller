import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

import { ScreenContainer } from '@/components/screen-container';
import { CommandQueue, type QueuedCommand } from '@/lib/command-queue';
import { useTelnet } from '@/lib/telnet-provider';

export default function QueueScreen() {
  const { executeCommand, connectionStatus } = useTelnet();
  const [queue, setQueue] = useState<QueuedCommand[]>([]);
  const [stats, setStats] = useState(CommandQueue.getStats());
  const [isExecuting, setIsExecuting] = useState(false);

  const [showAddCommand, setShowAddCommand] = useState(false);
  const [newCommand, setNewCommand] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    // Inicializar cola
    CommandQueue.initialize().then(() => {
      setQueue(CommandQueue.getQueue());
      setStats(CommandQueue.getStats());
    });

    // Suscribirse a cambios
    const unsubscribe = CommandQueue.subscribe((updatedQueue) => {
      setQueue(updatedQueue);
      setStats(CommandQueue.getStats());
    });

    return unsubscribe;
  }, []);

  const handleAddCommand = async () => {
    if (!newCommand.trim()) {
      Alert.alert('Error', 'Ingresa un comando válido');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await CommandQueue.enqueue(
      newCommand.trim(),
      newDescription.trim() || newCommand.trim(),
      'normal'
    );

    if (result.success) {
      setNewCommand('');
      setNewDescription('');
      setShowAddCommand(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert('Error', result.error || 'No se pudo agregar el comando');
    }
  };

  const handleExecuteQueue = async () => {
    if (!connectionStatus.connected) {
      Alert.alert(
        'Sin Conexión',
        'Debes estar conectado a la unidad MIB2 para ejecutar la cola de comandos.'
      );
      return;
    }

    if (!CommandQueue.hasPendingCommands()) {
      Alert.alert('Cola Vacía', 'No hay comandos pendientes para ejecutar');
      return;
    }

    Alert.alert(
      'Ejecutar Cola',
      `¿Ejecutar ${stats.pending} comandos pendientes?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ejecutar',
          onPress: async () => {
            setIsExecuting(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const result = await CommandQueue.executeQueue(async (command) => {
              const response = await executeCommand(command);
              return {
                success: response.success,
                output: response.output,
                error: response.error,
              };
            });

            setIsExecuting(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
              'Ejecución Completada',
              `✅ Ejecutados: ${result.executed}\n❌ Fallidos: ${result.failed}`
            );
          },
        },
      ]
    );
  };

  const handleRemoveCommand = (id: string) => {
    Alert.alert(
      'Eliminar Comando',
      '¿Eliminar este comando de la cola?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await CommandQueue.removeCommand(id);
          },
        },
      ]
    );
  };

  const handleClearCompleted = async () => {
    const count = await CommandQueue.clearCompleted();
    if (count > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Limpieza Completada', `Se eliminaron ${count} comandos completados`);
    } else {
      Alert.alert('Sin Cambios', 'No hay comandos completados para eliminar');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      '⚠️ Limpiar Cola',
      '¿Eliminar TODOS los comandos de la cola?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await CommandQueue.clearAll();
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-warning';
      case 'executing':
        return 'text-primary';
      case 'completed':
        return 'text-success';
      case 'failed':
        return 'text-error';
      default:
        return 'text-muted';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'executing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground">Cola de Comandos</Text>
            <Text className="text-sm text-muted mt-1">
              Modo offline: encola comandos para ejecutar al reconectar
            </Text>
          </View>

          {/* Stats Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">Estadísticas</Text>
            <View className="flex-row flex-wrap gap-4">
              <View className="flex-1 min-w-[100px]">
                <Text className="text-3xl font-bold text-foreground">{stats.total}</Text>
                <Text className="text-sm text-muted">Total</Text>
              </View>
              <View className="flex-1 min-w-[100px]">
                <Text className="text-3xl font-bold text-warning">{stats.pending}</Text>
                <Text className="text-sm text-muted">Pendientes</Text>
              </View>
              <View className="flex-1 min-w-[100px]">
                <Text className="text-3xl font-bold text-success">{stats.completed}</Text>
                <Text className="text-sm text-muted">Completados</Text>
              </View>
              <View className="flex-1 min-w-[100px]">
                <Text className="text-3xl font-bold text-error">{stats.failed}</Text>
                <Text className="text-sm text-muted">Fallidos</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowAddCommand(true)}
              className="flex-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">➕ Agregar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExecuteQueue}
              disabled={stats.pending === 0 || isExecuting}
              className="flex-1 bg-success px-4 py-3 rounded-xl active:opacity-80"
              style={{ opacity: stats.pending === 0 || isExecuting ? 0.5 : 1 }}
            >
              <Text className="text-white font-semibold text-center">
                {isExecuting ? '⚙️ Ejecutando...' : '▶️ Ejecutar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClearCompleted}
              className="flex-1 bg-surface border border-border px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-foreground font-semibold text-center text-sm">
                🧹 Limpiar Completados
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearAll}
              className="flex-1 bg-error/20 border border-error px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-error font-semibold text-center text-sm">🗑️ Limpiar Todo</Text>
            </TouchableOpacity>
          </View>

          {/* Add Command Form */}
          {showAddCommand && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">Agregar Comando</Text>

              <Text className="text-sm text-muted mb-2">Comando</Text>
              <TextInput
                value={newCommand}
                onChangeText={setNewCommand}
                placeholder="ls -la"
                placeholderTextColor="#9BA1A6"
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              />

              <Text className="text-sm text-muted mb-2">Descripción (opcional)</Text>
              <TextInput
                value={newDescription}
                onChangeText={setNewDescription}
                placeholder="Listar archivos del directorio actual"
                placeholderTextColor="#9BA1A6"
                className="bg-background border border-border rounded-xl px-4 py-3 text-foreground mb-4"
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowAddCommand(false);
                    setNewCommand('');
                    setNewDescription('');
                  }}
                  className="flex-1 bg-surface border border-border px-4 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-foreground font-semibold text-center">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddCommand}
                  className="flex-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-white font-semibold text-center">Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Command List */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Comandos en Cola ({queue.length})
            </Text>

            {queue.length === 0 ? (
              <Text className="text-muted text-center py-8">
                No hay comandos en la cola.{'\n'}Agrega comandos para ejecutar más tarde.
              </Text>
            ) : (
              <View className="gap-3">
                {queue.map((cmd) => (
                  <View
                    key={cmd.id}
                    className="bg-background border border-border rounded-xl p-4"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2 flex-1">
                        <Text className="text-xl">{getStatusEmoji(cmd.status)}</Text>
                        <Text className={`text-sm font-semibold ${getStatusColor(cmd.status)}`}>
                          {cmd.status.toUpperCase()}
                        </Text>
                      </View>

                      {cmd.status !== 'executing' && (
                        <TouchableOpacity
                          onPress={() => handleRemoveCommand(cmd.id)}
                          className="bg-error/20 px-3 py-1 rounded-lg active:opacity-80"
                        >
                          <Text className="text-error font-semibold text-xs">Eliminar</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <Text className="text-foreground font-medium mb-1">{cmd.description}</Text>
                    <Text className="text-muted text-xs font-mono mb-2">{cmd.command}</Text>

                    <View className="flex-row items-center gap-4">
                      <Text className="text-muted text-xs">
                        {new Date(cmd.timestamp).toLocaleString()}
                      </Text>
                      {cmd.retries > 0 && (
                        <Text className="text-warning text-xs">
                          Reintentos: {cmd.retries}/{cmd.maxRetries}
                        </Text>
                      )}
                    </View>

                    {cmd.error && (
                      <View className="mt-2 bg-error/10 border border-error rounded-lg p-2">
                        <Text className="text-error text-xs">{cmd.error}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
