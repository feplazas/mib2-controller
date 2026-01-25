import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { AnimatedFadeIn } from '@/components/ui/animated-fade-in';
import { SkeletonList, SkeletonCard } from '@/components/ui/skeleton-loader';
import { AnimatedSpinner } from '@/components/ui/animated-spinner';
import { backupService, type EEPROMBackup, type IntegrityStatus, type IntegrityCheckResult } from '@/lib/backup-service';
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
  const [isSharing, setIsSharing] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, IntegrityCheckResult>>({});

  const loadBackups = useCallback(async () => {
    try {
      // Cargar backups con verificación de integridad
      const loaded = await backupService.loadBackupsWithIntegrity();
      setBackups(loaded);
      
      // Migrar backups antiguos a SHA256 si es necesario
      await backupService.migrateBackupsToSha256();
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

  /**
   * Obtener color e icono según estado de integridad
   */
  const getIntegrityStyle = (status: IntegrityStatus | undefined): { color: string; icon: string; text: string } => {
    switch (status) {
      case 'valid':
        return { color: '#22C55E', icon: '✓', text: t('backups.integrity_valid') };
      case 'invalid':
        return { color: '#F59E0B', icon: '⚠', text: t('backups.integrity_invalid') };
      case 'corrupted':
        return { color: '#EF4444', icon: '✗', text: t('backups.integrity_corrupted') };
      default:
        return { color: '#9BA1A6', icon: '?', text: t('backups.integrity_unknown') };
    }
  };

  /**
   * Verificar integridad de un backup específico
   */
  const handleVerifyIntegrity = async (backup: EEPROMBackup) => {
    setIsVerifying(backup.id);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const result = await backupService.verifyBackupIntegrityById(backup.id);
      
      // Guardar resultado
      setVerificationResults(prev => ({
        ...prev,
        [backup.id]: result,
      }));
      
      // Actualizar estado en la lista
      setBackups(prev => prev.map(b => 
        b.id === backup.id ? { ...b, integrityStatus: result.status } : b
      ));
      
      // Feedback háptico según resultado
      if (result.status === 'valid') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      
      // Mostrar resultado detallado
      Alert.alert(
        t('backups.integrity_check_title'),
        `${t('backups.integrity_status')}: ${getIntegrityStyle(result.status).text}\n\n` +
        `MD5: ${result.md5Valid ? '✓' : '✗'} ${result.calculatedMd5.substring(0, 16)}...\n` +
        `SHA256: ${result.sha256Valid ? '✓' : '✗'} ${result.calculatedSha256.substring(0, 16)}...\n\n` +
        `${result.details}`,
        [{ text: 'OK' }]
      );
      
      usbLogger.info('INTEGRITY', `Verificación completada: ${backup.id} - ${result.status}`);
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('backups.error'), error.message);
    } finally {
      setIsVerifying(null);
    }
  };

  /**
   * Restaurar SOLO VID/PID desde backup
   */
  const handleRestoreVidPid = async (backup: EEPROMBackup) => {
    // Verificar que hay un dispositivo conectado
    if (status !== 'connected' || !device) {
      Alert.alert(
        t('backups.error'),
        t('backups.no_device_connected')
      );
      return;
    }

    // Verificar integridad antes de permitir restauración
    const integrityResult = backupService.verifyBackupIntegrity(backup);
    if (integrityResult.status !== 'valid') {
      Alert.alert(
        t('backups.integrity_error_title'),
        t('backups.integrity_error_message', { details: integrityResult.details }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: t('backups.verify_integrity'), 
            onPress: () => handleVerifyIntegrity(backup) 
          }
        ]
      );
      return;
    }

    // Extraer VID/PID del backup para mostrar en confirmación
    const { vid, pid } = backupService.extractVidPidFromBackup(backup);
    const vidHex = vid.toString(16).toUpperCase().padStart(4, '0');
    const pidHex = pid.toString(16).toUpperCase().padStart(4, '0');

    // Confirmación de seguridad
    Alert.alert(
      t('backups.restore_vidpid_title'),
      t('backups.restore_vidpid_message', { 
        vid: vidHex,
        pid: pidHex,
        date: formatDate(backup.timestamp)
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('backups.restore_vidpid'),
          style: 'destructive',
          onPress: () => {
            // Segunda confirmación
            Alert.alert(
              t('backups.restore_warning_title'),
              t('backups.restore_vidpid_warning'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('backups.confirm_restore'),
                  style: 'destructive',
                  onPress: () => executeRestoreVidPid(backup)
                }
              ]
            );
          }
        }
      ]
    );
  };

  const executeRestoreVidPid = async (backup: EEPROMBackup) => {
    setIsRestoring(backup.id);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      usbLogger.info('RESTORE', `Restaurando VID/PID desde backup ${backup.id}`);
      
      const result = await backupService.restoreVidPidFromBackup(backup.id);
      
      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        usbLogger.success('RESTORE', `VID/PID restaurado: ${result.vid.toString(16)}:${result.pid.toString(16)}`);
        
        Alert.alert(
          t('backups.restore_success_title'),
          t('backups.restore_vidpid_success', { 
            vid: result.vid.toString(16).toUpperCase(),
            pid: result.pid.toString(16).toUpperCase()
          })
        );
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      usbLogger.error('RESTORE', `Error en restauración: ${error.message}`, error);
      
      // Detectar si el error es de integridad
      if (error.message.includes('integrity_check_failed')) {
        Alert.alert(
          t('backups.integrity_error_title'),
          t('backups.restore_blocked_integrity')
        );
      } else {
        Alert.alert(
          t('backups.restore_error_title'),
          t('backups.restore_error_message', { error: error.message })
        );
      }
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

  const handleShare = async (backup: EEPROMBackup) => {
    setIsSharing(backup.id);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const success = await backupService.shareBackup(backup.id);
      
      if (success) {
        usbLogger.success('EXPORT', `Backup compartido: ${backup.id}`);
      } else {
        Alert.alert(t('backups.error'), t('backups.share_not_available'));
      }
    } catch (error: any) {
      Alert.alert(t('backups.error'), error.message);
    } finally {
      setIsSharing(null);
    }
  };

  const renderBackupItem = (backup: EEPROMBackup) => {
    const isCurrentlyRestoring = isRestoring === backup.id;
    const isCurrentlyDeleting = isDeleting === backup.id;
    const isCurrentlySharing = isSharing === backup.id;
    const isCurrentlyVerifying = isVerifying === backup.id;
    const isDisabled = isCurrentlyRestoring || isCurrentlyDeleting || status !== 'connected';
    
    const integrityStyle = getIntegrityStyle(backup.integrityStatus);
    const canRestore = backup.integrityStatus === 'valid' && status === 'connected';

    // Extraer VID/PID del backup para mostrar
    let backupVidPid = formatVidPid(backup.vendorId, backup.productId);
    try {
      const { vid, pid } = backupService.extractVidPidFromBackup(backup);
      backupVidPid = formatVidPid(vid, pid);
    } catch (e) {
      // Usar valores del metadata si falla la extracción
    }

    return (
      <View key={backup.id} style={styles.backupCard}>
        {/* Header con fecha y chipset */}
        <View style={styles.backupHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.backupDate}>{formatDate(backup.timestamp)}</Text>
            {/* Indicador de integridad */}
            <View style={[styles.integrityBadge, { backgroundColor: `${integrityStyle.color}20` }]}>
              <Text style={[styles.integrityIcon, { color: integrityStyle.color }]}>
                {integrityStyle.icon}
              </Text>
              <Text style={[styles.integrityText, { color: integrityStyle.color }]}>
                {integrityStyle.text}
              </Text>
            </View>
          </View>
          <View style={styles.chipsetBadge}>
            <Text style={styles.chipsetText}>{backup.chipset}</Text>
          </View>
        </View>

        {/* Información del backup */}
        <View style={styles.backupInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('backups.vid_pid')}:</Text>
            <Text style={styles.infoValue}>{backupVidPid}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('backups.size')}:</Text>
            <Text style={styles.infoValue}>{backup.size} bytes</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>MD5:</Text>
            <Text style={styles.infoValueMono}>{backup.checksum.substring(0, 16)}...</Text>
          </View>
          {backup.checksumSha256 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SHA256:</Text>
              <Text style={styles.infoValueMono}>{backup.checksumSha256.substring(0, 16)}...</Text>
            </View>
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          {/* Botón Verificar Integridad */}
          <TouchableOpacity
            style={[styles.verifyButton, isCurrentlyVerifying && styles.buttonDisabled]}
            onPress={() => handleVerifyIntegrity(backup)}
            disabled={isCurrentlyVerifying}
            activeOpacity={0.8}
          >
            {isCurrentlyVerifying ? (
              <AnimatedSpinner size={16} color="#0a7ea4" strokeWidth={2} />
            ) : (
              <Text style={styles.verifyButtonText}>{t('backups.verify_integrity')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          {/* Botón Restaurar VID/PID */}
          <TouchableOpacity
            style={[
              styles.restoreButton,
              !canRestore && styles.buttonDisabled
            ]}
            onPress={() => handleRestoreVidPid(backup)}
            disabled={!canRestore || isCurrentlyRestoring}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isCurrentlyRestoring && (
                <AnimatedSpinner size={14} color="#FFFFFF" strokeWidth={2} />
              )}
              <Text style={styles.restoreButtonText}>
                {isCurrentlyRestoring ? t('backups.restoring') : t('backups.restore_vidpid')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Botón Compartir */}
          <TouchableOpacity
            style={[styles.shareButton, isCurrentlySharing && styles.buttonDisabled]}
            onPress={() => handleShare(backup)}
            disabled={isCurrentlySharing}
            activeOpacity={0.8}
          >
            <Text style={styles.shareButtonText}>
              {isCurrentlySharing ? '...' : t('backups.share')}
            </Text>
          </TouchableOpacity>

          {/* Botón Eliminar */}
          <TouchableOpacity
            style={[
              styles.deleteButton,
              isCurrentlyDeleting && styles.buttonDisabled
            ]}
            onPress={() => handleDelete(backup)}
            disabled={isCurrentlyDeleting}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>
              {isCurrentlyDeleting ? '...' : t('backups.delete')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mensaje si no se puede restaurar */}
        {backup.integrityStatus !== 'valid' && (
          <View style={styles.warningMessage}>
            <Text style={styles.warningMessageText}>
              {t('backups.restore_requires_valid_integrity')}
            </Text>
          </View>
        )}
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
        <AnimatedFadeIn direction="fade" delay={0}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('backups.title')}</Text>
            <Text style={styles.subtitle}>{t('backups.subtitle')}</Text>
          </View>
        </AnimatedFadeIn>

        {/* Advertencia de seguridad */}
        <AnimatedFadeIn direction="up" index={0} staggerDelay={80}>
        <View style={styles.securityWarning}>
          <Text style={styles.securityWarningTitle}>{t('backups.security_notice')}</Text>
          <Text style={styles.securityWarningText}>{t('backups.security_notice_text')}</Text>
        </View>
        </AnimatedFadeIn>

        {/* Información de integridad */}
        <AnimatedFadeIn direction="up" index={1} staggerDelay={80}>
        <View style={styles.integrityInfoBox}>
          <Text style={styles.integrityInfoTitle}>{t('backups.integrity_system')}</Text>
          <Text style={styles.integrityInfoText}>{t('backups.integrity_system_desc')}</Text>
        </View>
        </AnimatedFadeIn>

        {/* Estado de conexión */}
        {status !== 'connected' && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>{t('backups.connect_to_restore')}</Text>
          </View>
        )}

        {/* Lista de backups */}
        {isLoading ? (
          <View style={styles.loadingState}>
            <SkeletonCard showIcon={true} showTitle={true} showSubtitle={true} showContent={true} contentLines={2} style={{ marginBottom: 16 }} />
            <SkeletonCard showIcon={true} showTitle={true} showSubtitle={true} showContent={true} contentLines={2} style={{ marginBottom: 16 }} />
            <SkeletonCard showIcon={true} showTitle={true} showSubtitle={false} showContent={false} />
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
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>{t('backups.total_backups')}:</Text>
              <Text style={styles.statsValue}>{backups.length}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>{t('backups.valid_backups')}:</Text>
              <Text style={[styles.statsValue, { color: '#22C55E' }]}>
                {backups.filter(b => b.integrityStatus === 'valid').length}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>{t('backups.invalid_backups')}:</Text>
              <Text style={[styles.statsValue, { color: '#F59E0B' }]}>
                {backups.filter(b => b.integrityStatus === 'invalid' || b.integrityStatus === 'corrupted').length}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
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
  securityWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  securityWarningTitle: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityWarningText: {
    color: '#FCA5A5',
    fontSize: 12,
    lineHeight: 18,
  },
  integrityInfoBox: {
    backgroundColor: 'rgba(10, 126, 164, 0.15)',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  integrityInfoTitle: {
    color: '#0a7ea4',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  integrityInfoText: {
    color: '#67B8D6',
    fontSize: 12,
    lineHeight: 18,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  backupDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ECEDEE',
    marginBottom: 6,
  },
  integrityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  integrityIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  integrityText: {
    fontSize: 11,
    fontWeight: '500',
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
    fontSize: 11,
    color: '#ECEDEE',
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  verifyButton: {
    flex: 1,
    backgroundColor: 'rgba(10, 126, 164, 0.15)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  verifyButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
    fontSize: 13,
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
    fontSize: 13,
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0a7ea4',
  },
  shareButtonText: {
    color: '#0a7ea4',
    fontWeight: '600',
    fontSize: 13,
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
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  warningMessage: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  warningMessageText: {
    color: '#FBBF24',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingState: {
    paddingVertical: 20,
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
    marginTop: 12,
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
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statsLabel: {
    fontSize: 13,
    color: '#687076',
  },
  statsValue: {
    fontSize: 13,
    color: '#ECEDEE',
    fontWeight: '500',
  },
});
