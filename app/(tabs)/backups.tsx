import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { backupService, type EEPROMBackup } from '@/lib/backup-service';
import { useUsbStatus } from '@/lib/usb-status-context';
import { useTranslation } from '@/lib/language-context';
import { usbLogger } from '@/lib/usb-logger';

export default function BackupsScreen() {
  const t = useTranslation();
  const { status, device } = useUsbStatus();
  const [backups, setBackups] = useState<EEPROMBackup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadBackups = useCallback(async () => {
    try {
      const loaded = await backupService.loadBackups();
      setBackups(loaded);
    } catch (error) {
      console.error('[BackupsScreen] Error loading backups:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBackups();
    setRefreshing(false);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatVidPid = (vid: number, pid: number): string => {
    return `${vid.toString(16).toUpperCase().padStart(4, '0')}:${pid.toString(16).toUpperCase().padStart(4, '0')}`;
  };

  const handleRestore = async (backup: EEPROMBackup) => {
    // Verificar que hay un dispositivo conectado
    if (status !== 'connected' || !device) {
      Alert.alert(
        t('backups.error'),
        t('backups.no_device_connected')
      );
      return;
    }

    // Confirmación de seguridad - Triple confirmación
    Alert.alert(
      t('backups.restore_confirm_title'),
      t('backups.restore_confirm_message', { 
        date: formatDate(backup.timestamp),
        vid: backup.vendorId.toString(16).toUpperCase(),
        pid: backup.productId.toString(16).toUpperCase()
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('backups.restore'),
          style: 'destructive',
          onPress: () => {
            // Segunda confirmación
            Alert.alert(
              t('backups.restore_warning_title'),
              t('backups.restore_warning_message'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('backups.confirm_restore'),
                  style: 'destructive',
                  onPress: () => executeRestore(backup)
                }
              ]
            );
          }
        }
      ]
    );
  };

  const executeRestore = async (backup: EEPROMBackup) => {
    setIsRestoring(backup.id);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      usbLogger.info('RESTORE', `Iniciando restauración desde backup ${backup.id}`);
      
      const result = await backupService.restoreBackup(backup.id);
      
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        usbLogger.success('RESTORE', `Restauración exitosa: ${result.bytesWritten} bytes escritos`);
        
        Alert.alert(
          t('backups.restore_success_title'),
          t('backups.restore_success_message', { bytes: result.bytesWritten })
        );
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      usbLogger.error('RESTORE', `Error en restauración: ${error.message}`, error);
      
      Alert.alert(
        t('backups.restore_error_title'),
        t('backups.restore_error_message', { error: error.message })
      );
    } finally {
      setIsRestoring(null);
    }
  };

  const handleDelete = async (backup: EEPROMBackup) => {
    Alert.alert(
      t('backups.delete_confirm_title'),
      t('backups.delete_confirm_message', { date: formatDate(backup.timestamp) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('backups.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(backup.id);
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const success = await backupService.deleteBackup(backup.id);
              
              if (success) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                usbLogger.success('BACKUP', `Backup eliminado: ${backup.id}`);
                await loadBackups();
              }
            } catch (error: any) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(t('backups.error'), error.message);
            } finally {
              setIsDeleting(null);
            }
          }
        }
      ]
    );
  };

  const handleExport = async (backup: EEPROMBackup) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const jsonData = await backupService.exportBackup(backup.id);
      
      // Mostrar información del backup exportado
      Alert.alert(
        t('backups.export_title'),
        t('backups.export_message', { 
          id: backup.id,
          size: backup.size,
          checksum: backup.checksum
        })
      );
      
      usbLogger.success('EXPORT', `Backup exportado: ${backup.id}`);
    } catch (error: any) {
      Alert.alert(t('backups.error'), error.message);
    }
  };

  const renderBackupItem = (backup: EEPROMBackup) => {
    const isCurrentlyRestoring = isRestoring === backup.id;
    const isCurrentlyDeleting = isDeleting === backup.id;
    const isDisabled = isCurrentlyRestoring || isCurrentlyDeleting || status !== 'connected';

    return (
      <View key={backup.id} style={styles.backupCard}>
        {/* Header con fecha y chipset */}
        <View style={styles.backupHeader}>
          <Text style={styles.backupDate}>{formatDate(backup.timestamp)}</Text>
          <View style={styles.chipsetBadge}>
            <Text style={styles.chipsetText}>{backup.chipset}</Text>
          </View>
        </View>

        {/* Información del backup */}
        <View style={styles.backupInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('backups.vid_pid')}:</Text>
            <Text style={styles.infoValue}>{formatVidPid(backup.vendorId, backup.productId)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('backups.size')}:</Text>
            <Text style={styles.infoValue}>{backup.size} bytes</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('backups.checksum')}:</Text>
            <Text style={styles.infoValueMono}>{backup.checksum.substring(0, 16)}...</Text>
          </View>
          {backup.notes && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('backups.notes')}:</Text>
              <Text style={styles.infoValue}>{backup.notes}</Text>
            </View>
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          {/* Botón Restaurar */}
          <TouchableOpacity
            style={[
              styles.restoreButton,
              isDisabled && styles.buttonDisabled
            ]}
            onPress={() => handleRestore(backup)}
            disabled={isDisabled}
          >
            <Text style={styles.restoreButtonText}>
              {isCurrentlyRestoring ? t('backups.restoring') : t('backups.restore')}
            </Text>
          </TouchableOpacity>

          {/* Botón Exportar */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExport(backup)}
          >
            <Text style={styles.exportButtonText}>{t('backups.export')}</Text>
          </TouchableOpacity>

          {/* Botón Eliminar */}
          <TouchableOpacity
            style={[
              styles.deleteButton,
              isCurrentlyDeleting && styles.buttonDisabled
            ]}
            onPress={() => handleDelete(backup)}
            disabled={isCurrentlyDeleting}
          >
            <Text style={styles.deleteButtonText}>
              {isCurrentlyDeleting ? '...' : t('backups.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('backups.title')}</Text>
          <Text style={styles.subtitle}>{t('backups.subtitle')}</Text>
        </View>

        {/* Estado de conexión */}
        {status !== 'connected' && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>{t('backups.connect_to_restore')}</Text>
          </View>
        )}

        {/* Lista de backups */}
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('backups.loading')}</Text>
          </View>
        ) : backups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>{t('backups.no_backups')}</Text>
            <Text style={styles.emptyText}>{t('backups.no_backups_message')}</Text>
          </View>
        ) : (
          <View style={styles.backupsList}>
            <Text style={styles.sectionTitle}>
              {t('backups.available_backups', { count: backups.length })}
            </Text>
            {backups.map(renderBackupItem)}
          </View>
        )}

        {/* Estadísticas */}
        {backups.length > 0 && (
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>{t('backups.stats')}</Text>
            <Text style={styles.statsText}>
              {t('backups.total_backups')}: {backups.length}
            </Text>
            <Text style={styles.statsText}>
              {t('backups.total_size')}: {backups.reduce((sum, b) => sum + b.size, 0)} bytes
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ECEDEE',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9BA1A6',
  },
  warningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningText: {
    color: '#FBBF24',
    fontSize: 14,
    textAlign: 'center',
  },
  backupsList: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9BA1A6',
    marginBottom: 8,
  },
  backupCard: {
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backupDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ECEDEE',
  },
  chipsetBadge: {
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipsetText: {
    fontSize: 12,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  backupInfo: {
    gap: 6,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 13,
    color: '#9BA1A6',
  },
  infoValue: {
    fontSize: 13,
    color: '#ECEDEE',
  },
  infoValueMono: {
    fontSize: 12,
    color: '#ECEDEE',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  restoreButton: {
    flex: 2,
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  exportButton: {
    flex: 1,
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  exportButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ECEDEE',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9BA1A6',
    textAlign: 'center',
  },
  statsBox: {
    backgroundColor: 'rgba(30, 32, 34, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9BA1A6',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 13,
    color: '#687076',
  },
});
