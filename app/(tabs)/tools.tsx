import React from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from "@/lib/language-context";

/**
 * Herramientas - Operaciones de Modificación
 * 
 * Esta pantalla agrupa todas las herramientas que MODIFICAN el adaptador o el MIB2:
 * - Auto-Spoof: Modificar VID/PID del adaptador USB
 * - FEC Generator: Generar e inyectar códigos FEC
 * - Toolbox: Instalar y gestionar MIB2 Toolbox
 * - Comandos Telnet: Ejecutar comandos en el MIB2
 */

interface ToolItem {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  route: string;
  color: string;
  riskLevel: 'safe' | 'moderate' | 'high';
}

export default function ToolsScreen() {
  const t = useTranslation();
  const colors = useColors();
  
  const tools: ToolItem[] = [
    {
      id: 'auto-spoof',
      icon: 'bolt.fill',
      titleKey: 'tools.auto_spoof',
      descriptionKey: 'tools.auto_spoof_desc',
      route: '/(tabs)/auto-spoof',
      color: '#FF9500', // iOS Orange - operación de riesgo moderado
      riskLevel: 'moderate',
    },
    {
      id: 'fec',
      icon: 'key.fill',
      titleKey: 'tools.fec_generator',
      descriptionKey: 'tools.fec_generator_desc',
      route: '/(tabs)/fec',
      color: '#AF52DE', // iOS Purple
      riskLevel: 'moderate',
    },
    {
      id: 'toolbox',
      icon: 'wrench.and.screwdriver.fill',
      titleKey: 'tools.toolbox',
      descriptionKey: 'tools.toolbox_desc',
      route: '/(tabs)/toolbox',
      color: '#007AFF', // iOS Blue
      riskLevel: 'moderate',
    },
    {
      id: 'commands',
      icon: 'terminal.fill',
      titleKey: 'tools.commands',
      descriptionKey: 'tools.commands_desc',
      route: '/(tabs)/commands',
      color: '#34C759', // iOS Green
      riskLevel: 'high',
    },
  ];

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'safe':
        return { text: t('tools.risk_safe'), color: '#34C759' };
      case 'moderate':
        return { text: t('tools.risk_moderate'), color: '#FF9500' };
      case 'high':
        return { text: t('tools.risk_high'), color: '#FF3B30' };
      default:
        return { text: '', color: colors.muted };
    }
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
            {t('tools.title')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t('tools.subtitle')}
          </Text>
        </View>

        {/* Warning Banner */}
        <View style={[styles.warningBanner, { backgroundColor: '#FF950015', borderColor: '#FF9500' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#FF9500" />
          <Text style={[styles.warningText, { color: colors.foreground }]}>
            {t('tools.warning_banner')}
          </Text>
        </View>

        {/* Tools Grid */}
        <View style={styles.grid}>
          {tools.map((tool) => {
            const risk = getRiskBadge(tool.riskLevel);
            return (
              <Pressable
                key={tool.id}
                onPress={() => handlePress(tool.route)}
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
                <View style={[styles.iconContainer, { backgroundColor: tool.color + '15' }]}>
                  <IconSymbol name={tool.icon as any} size={28} color={tool.color} />
                </View>
                
                {/* Text Content */}
                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                      {t(tool.titleKey)}
                    </Text>
                    <View style={[styles.riskBadge, { backgroundColor: risk.color + '20' }]}>
                      <Text style={[styles.riskText, { color: risk.color }]}>
                        {risk.text}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.cardDescription, { color: colors.muted }]} numberOfLines={2}>
                    {t(tool.descriptionKey)}
                  </Text>
                </View>
                
                {/* Chevron */}
                <IconSymbol name="chevron.right" size={16} color={colors.muted} />
              </Pressable>
            );
          })}
        </View>

        {/* Info Footer */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="info.circle" size={18} color={colors.muted} />
          <Text style={[styles.footerText, { color: colors.muted }]}>
            {t('tools.footer_info')}
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
    marginBottom: 16,
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
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
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '600',
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
