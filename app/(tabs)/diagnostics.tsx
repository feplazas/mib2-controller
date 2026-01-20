import React from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from '@/lib/language-context';

/**
 * Diagnostics Screen - Apple HIG Inspired
 * 
 * Hub for all diagnostic and advanced tools:
 * - USB Status & Device Info
 * - Recovery Tools
 * - System Diagnostics
 * - FEC Code Generator
 * - Advanced Tools
 * - Backup Management
 */

interface DiagnosticItem {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  route: string;
  color: string;
}

export default function DiagnosticsScreen() {
  const t = useTranslation();
  const colors = useColors();
  const router = useRouter();

  const diagnosticItems: DiagnosticItem[] = [
    {
      id: 'usb-status',
      icon: 'cable.connector',
      titleKey: 'diagnostics.usb_status',
      descriptionKey: 'diagnostics.usb_status_desc',
      route: '/(tabs)/usb-status',
      color: '#007AFF', // iOS Blue
    },
    {
      id: 'recovery',
      icon: 'arrow.counterclockwise',
      titleKey: 'diagnostics.recovery',
      descriptionKey: 'diagnostics.recovery_desc',
      route: '/(tabs)/recovery',
      color: '#FF9500', // iOS Orange
    },
    {
      id: 'diag',
      icon: 'stethoscope',
      titleKey: 'diagnostics.system_diag',
      descriptionKey: 'diagnostics.system_diag_desc',
      route: '/(tabs)/diag',
      color: '#34C759', // iOS Green
    },
    {
      id: 'fec',
      icon: 'qrcode',
      titleKey: 'diagnostics.fec_generator',
      descriptionKey: 'diagnostics.fec_generator_desc',
      route: '/(tabs)/fec',
      color: '#AF52DE', // iOS Purple
    },
    {
      id: 'tools',
      icon: 'hammer.fill',
      titleKey: 'diagnostics.advanced_tools',
      descriptionKey: 'diagnostics.advanced_tools_desc',
      route: '/(tabs)/tools',
      color: '#FF3B30', // iOS Red
    },
    {
      id: 'backups',
      icon: 'externaldrive.fill',
      titleKey: 'diagnostics.backups',
      descriptionKey: 'diagnostics.backups_desc',
      route: '/(tabs)/backups',
      color: '#5856D6', // iOS Indigo
    },
  ];

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

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
            {t('diagnostics.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t('diagnostics.subtitle')}
          </Text>
        </View>

        {/* Diagnostic Cards Grid */}
        <View style={styles.grid}>
          {diagnosticItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handlePress(item.route)}
              style={({ pressed }) => [
                styles.card,
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              {/* Icon Container */}
              <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <IconSymbol name={item.icon as any} size={28} color={item.color} />
              </View>
              
              {/* Text Content */}
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {t(item.titleKey)}
                </Text>
                <Text style={[styles.cardDescription, { color: colors.muted }]} numberOfLines={2}>
                  {t(item.descriptionKey)}
                </Text>
              </View>
              
              {/* Chevron */}
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {/* Footer Info */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="info.circle" size={18} color={colors.muted} />
          <Text style={[styles.footerText, { color: colors.muted }]}>
            {t('diagnostics.footer_info')}
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
  grid: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    gap: 14,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    marginTop: 24,
    gap: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  },
});
