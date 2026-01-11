import { ScrollView, Text, View, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { backupService, type EEPROMBackup } from '@/lib/backup-service';
import * as Haptics from 'expo-haptics';

export default function BackupsScreen() {
  const [backups, setBackups] = useState<EEPROMBackup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [stats, setStats] = useState<{ total: number; totalSize: number; oldestDate: number | null; newestDate: number | null }>({
    total: 0,
    totalSize: 0,
    oldestDate: null,
    newestDate: null,
  });

  const loadBackups = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedBackups = await backupService.loadBackups();
      const loadedStats = await backupService.getStats();
      setBackups(loadedBackups);
      setStats(loadedStats);
    } catch (error) {
      console.error('[Backups] Error loading backups:', error);
      Alert.alert('Error', 'No se pudieron cargar los backups');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number): string => {
    return `${bytes} bytes`;
  };

  const formatVIDPID = (vid: number, pid: number): string => {
    return `${vid.toString(16).padStart(4, '0').toUpperCase()}:${pid.toString(16).padStart(4, '0').toUpperCase()}`;
  };

  const handleRestore = async (backup: EEPROMBackup) => {
    Alert.alert(
      '⚠️ Confirmar Restauración',
      `¿Deseas restaurar este backup?\n\n` +
      `Dispositivo: ${backup.deviceName}\n` +
      `VID:PID: ${formatVIDPID(backup.vendorId, backup.productId)}\n` +
      `Fecha: ${formatDate(backup.timestamp)}\n\n` +
      `Esta operación escribirá los valores originales en la EEPROM del dispositivo conectado.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: () => performRestore(backup),
        },
      ]
    );
  };

  const performRestore = async (backup: EEPROMBackup) => {
    setIsRestoring(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await backupService.restoreBackup(backup.id);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '✅ Restauración Exitosa',
        `Se han restaurado ${result.bytesWritten} bytes desde el backup.\n\n` +
        `🔌 SIGUIENTE PASO:\n` +
        `1. Desconecta el adaptador USB\n` +
        `2. Espera 5 segundos\n` +
        `3. Vuelve a conectarlo\n` +
        `4. Verifica el VID/PID restaurado en "Estado USB"`
      );
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'No se pudo restaurar el backup');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDelete = async (backup: EEPROMBackup) => {
    Alert.alert(
      '⚠️ Confirmar Eliminación',
      `¿Deseas eliminar este backup?\n\n` +
      `Dispositivo: ${backup.deviceName}\n` +
      `Fecha: ${formatDate(backup.timestamp)}\n\n` +
      `Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const deleted = await backupService.deleteBackup(backup.id);
            if (deleted) {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              loadBackups();
            } else {
              Alert.alert('Error', 'No se pudo eliminar el backup');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      '⚠️ Confirmar Eliminación Masiva',
      `¿Deseas eliminar TODOS los backups (${stats.total})?\n\n` +
      `Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todos',
          style: 'destructive',
          onPress: async () => {
            const cleared = await backupService.clearAllBackups();
            if (cleared) {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              loadBackups();
            } else {
              Alert.alert('Error', 'No se pudieron eliminar los backups');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadBackups} />
        }
      >
        <View className="gap-4">
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-foreground mb-2">
              💾 Backups de EEPROM
            </Text>
            <Text className="text-sm text-muted text-center">
              Gestión de copias de seguridad y restauración
            </Text>
          </View>

          {/* Estadísticas */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              📊 Estadísticas
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Total de Backups:</Text>
                <Text className="text-sm text-foreground font-bold">
                  {stats.total}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Tamaño Total:</Text>
                <Text className="text-sm text-foreground font-mono">
                  {formatSize(stats.totalSize)}
                </Text>
              </View>
              {stats.newestDate && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Más Reciente:</Text>
                  <Text className="text-sm text-foreground">
                    {formatDate(stats.newestDate)}
                  </Text>
                </View>
              )}
              {stats.oldestDate && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Más Antiguo:</Text>
                  <Text className="text-sm text-foreground">
                    {formatDate(stats.oldestDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Lista de Backups */}
          {backups.length === 0 ? (
            <View className="bg-surface rounded-2xl p-8 border border-border items-center">
              <Text className="text-4xl mb-4">📦</Text>
              <Text className="text-lg font-bold text-foreground mb-2">
                No hay backups
              </Text>
              <Text className="text-sm text-muted text-center">
                Los backups se crean automáticamente antes de cada spoofing
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-foreground">
                  📋 Backups Guardados
                </Text>
                {backups.length > 0 && (
                  <TouchableOpacity onPress={handleClearAll}>
                    <Text className="text-sm text-red-500 font-medium">
                      Eliminar Todos
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {backups.map((backup) => (
                <View
                  key={backup.id}
                  className="bg-surface rounded-2xl p-6 border border-border"
                >
                  {/* Header del Backup */}
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground mb-1">
                        {backup.deviceName}
                      </Text>
                      <Text className="text-xs text-muted">
                        {formatDate(backup.timestamp)}
                      </Text>
                    </View>
                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                      <Text className="text-xs text-primary font-mono font-bold">
                        {formatVIDPID(backup.vendorId, backup.productId)}
                      </Text>
                    </View>
                  </View>

                  {/* Información del Backup */}
                  <View className="gap-2 mb-4">
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Chipset:</Text>
                      <Text className="text-sm text-foreground font-medium">
                        {backup.chipset}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Serial:</Text>
                      <Text className="text-sm text-foreground font-mono">
                        {backup.serialNumber}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Tamaño:</Text>
                      <Text className="text-sm text-foreground font-mono">
                        {formatSize(backup.size)}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-muted">Checksum:</Text>
                      <Text className="text-xs text-foreground font-mono">
                        {backup.checksum.substring(0, 8)}...
                      </Text>
                    </View>
                  </View>

                  {/* Notas */}
                  {backup.notes && (
                    <View className="bg-background rounded-lg p-3 mb-4">
                      <Text className="text-xs text-muted">
                        {backup.notes}
                      </Text>
                    </View>
                  )}

                  {/* Botones de Acción */}
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleRestore(backup)}
                      disabled={isRestoring}
                      className="flex-1 bg-primary rounded-xl p-3 items-center"
                    >
                      <Text className="text-sm font-bold text-background">
                        {isRestoring ? '⏳ Restaurando...' : '🔄 Restaurar'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(backup)}
                      disabled={isRestoring}
                      className="bg-red-500/10 rounded-xl px-4 py-3 items-center border border-red-500"
                    >
                      <Text className="text-sm font-bold text-red-500">
                        🗑️
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Información */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              ℹ️ Información
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">
                • Los backups se crean automáticamente antes de cada spoofing
              </Text>
              <Text className="text-sm text-muted">
                • Cada backup contiene una copia completa de la EEPROM (256 bytes)
              </Text>
              <Text className="text-sm text-muted">
                • La restauración sobrescribe los valores VID/PID actuales
              </Text>
              <Text className="text-sm text-muted">
                • Requiere reconexión del adaptador después de restaurar
              </Text>
              <Text className="text-sm text-muted">
                • Los backups se almacenan localmente en el dispositivo
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
