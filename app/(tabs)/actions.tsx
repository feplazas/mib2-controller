import React from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AnimatedTouchable } from '@/components/ui/animated-touchable';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/lib/language-context';

/**
 * Acciones - Diagnóstico y Gestión
 * 
 * Esta pantalla agrupa todas las herramientas de DIAGNÓSTICO y GESTIÓN:
 * - USB Status: Ver estado del adaptador conectado
 * - System Diagnostics: Logs y diagnóstico del sistema
 * - Recovery: Herramientas de recuperación
 * - Backups: Gestión de backups de EEPROM
 * - Guías Offline: Documentación y guías
 * 
 * NO incluye herramientas de modificación (esas están en Herramientas)
 */

interface ActionItem {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  route: string;
  color: string;
  category: 'diagnostic' | 'management' | 'help';
}

export default function ActionsScreen() {
  const t = useTranslation();
  const colors = useColors();
  const router = useRouter();

  const actionItems: ActionItem[] = [
    // Diagnóstico
    {
      id: 'usb-status',
      icon: 'cable.connector',
      titleKey: 'actions.usb_status',
      descriptionKey: 'actions.usb_status_desc',
      route: '/(tabs)/usb-status',
      color: '#007AFF', // iOS Blue
      category: 'diagnostic',
    },
    {
      id: 'diag',
      icon: 'stethoscope',
      titleKey: 'actions.system_diag',
      descriptionKey: 'actions.system_diag_desc',
      route: '/(tabs)/diag',
      color: '#34C759', // iOS Green
      category: 'diagnostic',
    },
    // Gestión
    {
      id: 'backups',
      icon: 'externaldrive.fill',
      titleKey: 'actions.backups',
      descriptionKey: 'actions.backups_desc',
      route: '/(tabs)/backups',
      color: '#5856D6', // iOS Indigo
      category: 'management',
    },
    {
      id: 'fec-codes',
      icon: 'key.fill',
      titleKey: 'actions.fec_codes',
      descriptionKey: 'actions.fec_codes_desc',
      route: '/(tabs)/fec',
      color: '#FF9500', // iOS Orange
      category: 'management',
    },
    // Ayuda
    {
      id: 'guides',
      icon: 'book.fill',
      titleKey: 'actions.guides',
      descriptionKey: 'actions.guides_desc',
      route: '/guides',
      color: '#00C7BE', // iOS Teal
      category: 'help',
    },
  ];

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'diagnostic':
        return t('actions.category_diagnostic');
      case 'management':
        return t('actions.category_management');
      case 'help':
        return t('actions.category_help');
      default:
        return '';
    }
  };

  // Agrupar items por categoría
  const diagnosticItems = actionItems.filter(item => item.category === 'diagnostic');
  const managementItems = actionItems.filter(item => item.category === 'management');
  const helpItems = actionItems.filter(item => item.category === 'help');

  const renderSection = (items: ActionItem[], categoryKey: string) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        {getCategoryLabel(categoryKey)}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <AnimatedTouchable
              onPress={() => handlePress(item.route)}
              style={styles.row}
              hapticFeedback="light"
            >
              {/* Icon Container - F-Droid Style */}
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <IconSymbol name={item.icon as any} size={22} color="#FFFFFF" />
              </View>
              
              {/* Text Content */}
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                  {t(item.titleKey)}
                </Text>
                <Text style={[styles.rowDescription, { color: colors.muted }]} numberOfLines={1}>
                  {t(item.descriptionKey)}
                </Text>
              </View>
              
              {/* Chevron */}
              <IconSymbol name="chevron.right" size={14} color={colors.muted} />
            </AnimatedTouchable>
            {index < items.length - 1 && (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {t('actions.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t('actions.subtitle')}
          </Text>
        </View>

        {/* Sections */}
        {renderSection(diagnosticItems, 'diagnostic')}
        {renderSection(managementItems, 'management')}
        {renderSection(helpItems, 'help')}

        {/* Footer Info */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="info.circle" size={18} color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.muted }]}>
            {t('actions.footer_info')}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 16,
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  rowDescription: {
    fontSize: 13,
    fontWeight: '400',
  },
  separator: {
    height: 0.5,
    marginLeft: 62,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    gap: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  },
});
