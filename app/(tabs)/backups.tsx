import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
// import { EepromBackupManager, type BackupMetadata } from '@/lib/eeprom-backup';

type BackupMetadata = {
  id: string;
  deviceName: string;
  timestamp: number;
  size: number;
  checksum: string;
};
import * as Haptics from 'expo-haptics';

export default function BackupsScreen() {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      // Mock data - EEPROM backup functionality in development
      setBackups([]);
      setTotalSize(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = (backupId: string, deviceName: string) => {
    Alert.alert(
      'Restore EEPROM',
      `This will restore the EEPROM from backup:\n\n${deviceName}\n\nThis operation will overwrite the current EEPROM data. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => executeRestore(backupId),
        },
      ]
    );
  };

  const executeRestore = async (backupId: string) => {
    setLoading(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('En Desarrollo', 'Funcionalidad de restauración en desarrollo');
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to restore backup: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = async (backupId: string) => {
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert('En Desarrollo', 'Funcionalidad de exportación en desarrollo');
    } catch (error) {
      Alert.alert('Error', 'Export failed: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = (backupId: string, deviceName: string) => {
    Alert.alert(
      'Delete Backup',
      `Are you sure you want to delete this backup?\n\n${deviceName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('En Desarrollo', 'Funcionalidad de eliminación en desarrollo');
          },
        },
      ]
    );
  };

  const handleCleanOldBackups = () => {
    Alert.alert(
      'Clean Old Backups',
      'This will keep only the 10 most recent backups and delete the rest. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clean',
          onPress: async () => {
            setLoading(true);
            try {
              Alert.alert('En Desarrollo', 'Funcionalidad de limpieza en desarrollo');
            } catch (error) {
              Alert.alert('Error', 'Failed to clean backups');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">EEPROM Backups</Text>
            <Text className="text-sm text-muted mt-2">
              Manage your EEPROM backup files
            </Text>
          </View>

          {/* Stats */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-bold text-foreground">{backups.length}</Text>
                <Text className="text-sm text-muted">Total Backups</Text>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold text-foreground">{formatSize(totalSize)}</Text>
                <Text className="text-sm text-muted">Storage Used</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={loadBackups}
              disabled={loading}
              className="flex-1 bg-primary px-4 py-3 rounded-full active:opacity-80"
            >
              <Text className="text-background font-semibold text-center">Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCleanOldBackups}
              disabled={loading || backups.length <= 10}
              className={`flex-1 px-4 py-3 rounded-full active:opacity-80 ${
                backups.length > 10 ? 'bg-warning' : 'bg-border'
              }`}
            >
              <Text className={`font-semibold text-center ${backups.length > 10 ? 'text-background' : 'text-muted'}`}>
                Clean Old
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {loading && (
            <View className="py-8">
              <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
          )}

          {/* Backup List */}
          {!loading && backups.length === 0 && (
            <View className="bg-surface rounded-2xl p-8 border border-border items-center">
              <Text className="text-lg font-semibold text-foreground mb-2">No Backups Found</Text>
              <Text className="text-sm text-muted text-center">
                Backups are automatically created before spoofing operations
              </Text>
            </View>
          )}

          {!loading && backups.map((backup) => (
            <View key={backup.id} className="bg-surface rounded-2xl p-6 border border-border">
              <View className="mb-4">
                <Text className="text-base font-semibold text-foreground mb-1">
                  {backup.deviceName}
                </Text>
                <Text className="text-xs text-muted">{formatDate(backup.timestamp)}</Text>
              </View>

              <View className="flex-row gap-2 mb-4">
                <View className="flex-1 bg-background rounded-xl p-3 border border-border">
                  <Text className="text-xs text-muted mb-1">Size</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatSize(backup.size)}
                  </Text>
                </View>
                <View className="flex-1 bg-background rounded-xl p-3 border border-border">
                  <Text className="text-xs text-muted mb-1">Checksum</Text>
                  <Text className="text-sm font-mono text-foreground">
                    {backup.checksum}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => handleRestoreBackup(backup.id, backup.deviceName)}
                  className="flex-1 bg-primary px-4 py-3 rounded-full active:opacity-80"
                >
                  <Text className="text-background font-semibold text-center text-sm">Restore</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleExportBackup(backup.id)}
                  className="flex-1 bg-border px-4 py-3 rounded-full active:opacity-80"
                >
                  <Text className="text-foreground font-semibold text-center text-sm">Export</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteBackup(backup.id, backup.deviceName)}
                  className="bg-error px-4 py-3 rounded-full active:opacity-80"
                >
                  <Text className="text-background font-semibold text-center text-sm">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
