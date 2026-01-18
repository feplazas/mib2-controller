import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/lib/language-context';

/**
 * Guía completa de instalación y configuración del MIB2 Toolbox
 * Incluye todos los pasos desde la preparación hasta la restauración
 */
export function InstallationGuide() {
  const colors = useColors();
  const t = useTranslation();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.foreground,
      marginBottom: 20,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 24,
      marginBottom: 12,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.foreground,
      marginTop: 16,
      marginBottom: 8,
    },
    paragraph: {
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 22,
      marginBottom: 12,
    },
    stepNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginTop: 16,
      marginBottom: 8,
    },
    command: {
      fontFamily: 'monospace',
      fontSize: 13,
      color: colors.success,
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    warning: {
      backgroundColor: '#FFF3CD',
      borderLeftWidth: 4,
      borderLeftColor: '#FFC107',
      padding: 12,
      borderRadius: 4,
      marginVertical: 12,
    },
    warningText: {
      fontSize: 14,
      color: '#856404',
      lineHeight: 20,
    },
    danger: {
      backgroundColor: '#F8D7DA',
      borderLeftWidth: 4,
      borderLeftColor: '#DC3545',
      padding: 12,
      borderRadius: 4,
      marginVertical: 12,
    },
    dangerText: {
      fontSize: 14,
      color: '#721C24',
      lineHeight: 20,
      fontWeight: '600',
    },
    success: {
      backgroundColor: '#D4EDDA',
      borderLeftWidth: 4,
      borderLeftColor: '#28A745',
      padding: 12,
      borderRadius: 4,
      marginVertical: 12,
    },
    successText: {
      fontSize: 14,
      color: '#155724',
      lineHeight: 20,
    },
    list: {
      marginLeft: 20,
      marginBottom: 12,
    },
    listItem: {
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 22,
      marginBottom: 6,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {t('installation_guide.title')}
        </Text>

        <View style={styles.danger}>
          <Text style={styles.dangerText}>
            ⚠️ {t('installation_guide.critical_warning')}
          </Text>
        </View>

        {/* FASE 1: PREPARACIÓN */}
        <Text style={styles.sectionTitle}>
          📋 {t('installation_guide.phase1_title')}
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('installation_guide.phase1_requirements_title')}
        </Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• {t('installation_guide.req_adapter')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.req_sd_card')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.req_android')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.req_toolbox')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.req_battery')}</Text>
        </View>

        <Text style={styles.subsectionTitle}>
          {t('installation_guide.phase1_verify_title')}
        </Text>
        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 1: {t('installation_guide.verify_connection')}
        </Text>
        <Text style={styles.command}>
          ping 192.168.1.4
        </Text>
        <Text style={styles.paragraph}>
          {t('installation_guide.verify_connection_desc')}
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 2: {t('installation_guide.verify_telnet')}
        </Text>
        <Text style={styles.command}>
          telnet 192.168.1.4{'\n'}
          # Usuario: root{'\n'}
          # Contraseña: (vacía, solo Enter)
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 3: {t('installation_guide.verify_root')}
        </Text>
        <Text style={styles.command}>
          whoami
        </Text>
        <Text style={styles.paragraph}>
          {t('installation_guide.verify_root_desc')}
        </Text>

        {/* FASE 2: BACKUP CRÍTICO */}
        <Text style={styles.sectionTitle}>
          💾 {t('installation_guide.phase2_title')}
        </Text>

        <View style={styles.danger}>
          <Text style={styles.dangerText}>
            🚨 {t('installation_guide.backup_critical')}
          </Text>
        </View>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 4: {t('installation_guide.mount_sd')}
        </Text>
        <Text style={styles.command}>
          mkdir -p /mnt/sd{'\n'}
          mount -t qnx6 /dev/mmcblk0p1 /mnt/sd{'\n'}
          ls /mnt/sd
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 5: {t('installation_guide.create_backup_dir')}
        </Text>
        <Text style={styles.command}>
          mkdir -p /mnt/sd/backups{'\n'}
          df -h /mnt/sd
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 6: {t('installation_guide.backup_critical_binary')}
        </Text>
        <Text style={styles.command}>
          cp /net/rcc/dev/shmem/tsd.mibstd2.system.swap \{'\n'}
             /mnt/sd/backups/tsd_original_$(date +%Y%m%d).bin{'\n'}
          ls -lh /mnt/sd/backups/
        </Text>
        <Text style={styles.paragraph}>
          {t('installation_guide.backup_critical_desc')}
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 7: {t('installation_guide.backup_config')}
        </Text>
        <Text style={styles.command}>
          tar -czf /mnt/sd/backups/etc_backup_$(date +%Y%m%d).tar.gz /etc{'\n'}
          tar -czf /mnt/sd/backups/eso_backup_$(date +%Y%m%d).tar.gz /eso 2{'>'}/ dev/null
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 8: {t('installation_guide.backup_full_optional')}
        </Text>
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⏱️ {t('installation_guide.backup_full_time')}
          </Text>
        </View>
        <Text style={styles.command}>
          dd if=/dev/mmcblk0 of=/mnt/sd/backups/mib2_full_backup.img bs=4M status=progress{'\n'}
          md5sum /mnt/sd/backups/mib2_full_backup.img {'>'} /mnt/sd/backups/mib2_full_backup.img.md5
        </Text>

        {/* FASE 3: INSTALACIÓN DEL TOOLBOX */}
        <Text style={styles.sectionTitle}>
          📦 {t('installation_guide.phase3_title')}
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 9: {t('installation_guide.copy_toolbox')}
        </Text>
        <Text style={styles.paragraph}>
          {t('installation_guide.copy_toolbox_desc')}
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 10: {t('installation_guide.run_installer')}
        </Text>
        <Text style={styles.command}>
          cd /mnt/sd{'\n'}
          chmod +x install.sh{'\n'}
          ./install.sh
        </Text>
        <Text style={styles.paragraph}>
          {t('installation_guide.run_installer_desc')}
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 11: {t('installation_guide.verify_installation')}
        </Text>
        <Text style={styles.command}>
          ls -la /eso{'\n'}
          ls -la /eso/bin
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 12: {t('installation_guide.apply_patch')}
        </Text>
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ {t('installation_guide.patch_warning')}
          </Text>
        </View>
        <Text style={styles.command}>
          /eso/bin/patch_swap.sh
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 13: {t('installation_guide.reboot_system')}
        </Text>
        <Text style={styles.command}>
          reboot
        </Text>
        <Text style={styles.paragraph}>
          {t('installation_guide.reboot_desc')}
        </Text>

        {/* FASE 4: VERIFICACIÓN POST-INSTALACIÓN */}
        <Text style={styles.sectionTitle}>
          ✅ {t('installation_guide.phase4_title')}
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 14: {t('installation_guide.reconnect_telnet')}
        </Text>
        <Text style={styles.paragraph}>
          {t('installation_guide.reconnect_desc')}
        </Text>

        <Text style={styles.stepNumber}>
          {t('installation_guide.step')} 15: {t('installation_guide.verify_toolbox')}
        </Text>
        <Text style={styles.command}>
          ls /eso/bin{'\n'}
          /eso/bin/gem.sh --help
        </Text>

        <View style={styles.success}>
          <Text style={styles.successText}>
            ✅ {t('installation_guide.installation_complete')}
          </Text>
        </View>

        {/* FASE 5: RESTAURACIÓN (SI ES NECESARIO) */}
        <Text style={styles.sectionTitle}>
          🔄 {t('installation_guide.phase5_title')}
        </Text>

        <Text style={styles.paragraph}>
          {t('installation_guide.restore_when')}
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('installation_guide.restore_binary_title')}
        </Text>
        <Text style={styles.command}>
          cp /mnt/sd/backups/tsd_original_YYYYMMDD.bin \{'\n'}
             /net/rcc/dev/shmem/tsd.mibstd2.system.swap{'\n'}
          reboot
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('installation_guide.restore_guided_title')}
        </Text>
        <Text style={styles.paragraph}>
          {t('installation_guide.restore_guided_desc')}
        </Text>
        <Text style={styles.command}>
          sh /mnt/sd/guided_restore.sh /mnt/sd/backups/mib2_full_backup.img
        </Text>

        <View style={styles.warning}>
          <Text style={styles.warningText}>
            💡 {t('installation_guide.restore_guided_features')}
          </Text>
        </View>

        {/* SOLUCIÓN DE PROBLEMAS */}
        <Text style={styles.sectionTitle}>
          🔧 {t('installation_guide.troubleshooting_title')}
        </Text>

        <Text style={styles.subsectionTitle}>
          {t('installation_guide.problem_no_connection')}
        </Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• {t('installation_guide.solution_check_cable')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.solution_check_ip')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.solution_restart_mib2')}</Text>
        </View>

        <Text style={styles.subsectionTitle}>
          {t('installation_guide.problem_mount_failed')}
        </Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• {t('installation_guide.solution_try_alt_device')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.solution_check_sd_format')}</Text>
        </View>

        <Text style={styles.subsectionTitle}>
          {t('installation_guide.problem_install_failed')}
        </Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• {t('installation_guide.solution_restore_binary')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.solution_check_space')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.solution_check_permissions')}</Text>
        </View>

        <Text style={styles.subsectionTitle}>
          {t('installation_guide.problem_system_broken')}
        </Text>
        <View style={styles.danger}>
          <Text style={styles.dangerText}>
            🆘 {t('installation_guide.solution_use_guided_restore')}
          </Text>
        </View>

        {/* RECURSOS ADICIONALES */}
        <Text style={styles.sectionTitle}>
          📚 {t('installation_guide.resources_title')}
        </Text>

        <View style={styles.list}>
          <Text style={styles.listItem}>• {t('installation_guide.resource_scripts')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.resource_commands')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.resource_backups')}</Text>
          <Text style={styles.listItem}>• {t('installation_guide.resource_diagnostics')}</Text>
        </View>

        <View style={styles.success}>
          <Text style={styles.successText}>
            💡 {t('installation_guide.final_tip')}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}
