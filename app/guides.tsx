import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IOSSectionHeader } from "@/components/ui/ios-section";
import { useTranslation, useLanguage } from "@/lib/language-context";
import { useColors } from "@/hooks/use-colors";
import { offlineGuidesService, type OfflineGuide, type OfflineStatus } from "@/lib/offline-guides-service";

/**
 * Offline Guides Viewer - Ultra Premium iOS Style
 * 
 * Displays all 4 embedded guides with expandable sections:
 * 1. Installation Guide
 * 2. Troubleshooting Guide
 * 3. Common Commands Guide
 * 4. FEC Codes Guide
 */
export default function GuidesScreen() {
  const t = useTranslation();
  const colors = useColors();
  const { currentLanguage } = useLanguage();
  
  const [guides, setGuides] = useState<OfflineGuide[]>([]);
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    try {
      await offlineGuidesService.initialize();
      // Obtener idioma actual del sistema
      const lang = currentLanguage || 'es';
      const allGuides = await offlineGuidesService.getGuidesForLanguage(lang);
      const status = await offlineGuidesService.getStatus();
      setGuides(allGuides);
      setOfflineStatus(status);
    } catch (error) {
      console.error('[Guides] Error loading guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await offlineGuidesService.refreshGuides();
    await loadGuides();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getGuideIcon = (guideId: string): string => {
    switch (guideId) {
      case 'installation': return '📦';
      case 'troubleshooting': return '🔧';
      case 'commands': return '⌨️';
      case 'fec': return '🔑';
      default: return '📄';
    }
  };

  const getGuideTitle = (guideId: string): string => {
    switch (guideId) {
      case 'installation': return t('offline_guides.installation_title') || 'Guía de Instalación';
      case 'troubleshooting': return t('offline_guides.troubleshooting_title') || 'Solución de Problemas';
      case 'commands': return t('offline_guides.commands_title') || 'Comandos Frecuentes';
      case 'fec': return t('offline_guides.fec_title') || 'Códigos FEC';
      default: return guideId;
    }
  };

  const getGuideDescription = (guideId: string): string => {
    switch (guideId) {
      case 'installation': return t('offline_guides.installation_desc') || 'Proceso completo de instalación de MIB2 Toolbox';
      case 'troubleshooting': return t('offline_guides.troubleshooting_desc') || 'Soluciones a problemas comunes';
      case 'commands': return t('offline_guides.commands_desc') || 'Comandos más utilizados en MIB2';
      case 'fec': return t('offline_guides.fec_desc') || 'Códigos para activar funciones';
      default: return '';
    }
  };

  const renderGuideContent = (guide: OfflineGuide) => {
    if (!guide.content) return null;

    return (
      <View className="px-4 pb-4">
        {guide.content.sections?.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-3">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const sectionKey = `${guide.id}-${sectionIndex}`;
                setExpandedSection(expandedSection === sectionKey ? null : sectionKey);
              }}
              className="bg-background rounded-xl p-4 border border-border active:opacity-80"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-foreground flex-1 mr-2">
                  {section.title}
                </Text>
                <Text className="text-muted">
                  {expandedSection === `${guide.id}-${sectionIndex}` ? '▼' : '›'}
                </Text>
              </View>
              
              {expandedSection === `${guide.id}-${sectionIndex}` && (
                <View className="mt-3 pt-3 border-t border-separator">
                  {section.steps?.map((step, stepIndex) => (
                    <View key={stepIndex} className="flex-row mb-2">
                      <Text className="text-primary font-bold mr-2 w-6">{stepIndex + 1}.</Text>
                      <Text className="text-sm text-muted flex-1 leading-5">{step}</Text>
                    </View>
                  ))}
                  
                  {section.items?.map((item, itemIndex) => (
                    <View key={itemIndex} className="mb-3 bg-primary/5 rounded-lg p-3">
                      <Text className="text-sm font-semibold text-foreground">{item.name || item.title}</Text>
                      {item.description && (
                        <Text className="text-xs text-muted mt-1">{item.description}</Text>
                      )}
                      {item.command && (
                        <View className="bg-background rounded-lg p-2 mt-2 border border-border">
                          <Text className="text-xs text-primary font-mono">{item.command}</Text>
                        </View>
                      )}
                      {item.code && (
                        <View className="bg-success/10 rounded-lg p-2 mt-2 border border-success">
                          <Text className="text-xs text-success font-mono">{item.code}</Text>
                        </View>
                      )}
                      {item.solution && (
                        <View className="bg-warning/10 rounded-lg p-2 mt-2">
                          <Text className="text-xs text-warning">{item.solution}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                  
                  {section.note && (
                    <View className="bg-warning/10 rounded-lg p-3 mt-2">
                      <Text className="text-xs text-warning">⚠️ {section.note}</Text>
                    </View>
                  )}
                  
                  {section.warning && (
                    <View className="bg-error/10 rounded-lg p-3 mt-2">
                      <Text className="text-xs text-error">🚨 {section.warning}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted mt-4">{t('common.loading') || 'Cargando...'}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 -ml-2 active:opacity-70"
            >
              <Text className="text-primary text-lg">← {t('common.back') || 'Volver'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRefresh}
              className="p-2 active:opacity-70"
            >
              <Text className="text-primary text-lg">🔄</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-3xl font-bold text-foreground mt-2">
            {t('settings.offline_guides') || 'Guías Offline'}
          </Text>
          <Text className="text-base text-muted mt-1">
            {t('guides.subtitle') || 'Documentación disponible sin conexión'}
          </Text>
        </View>

        {/* Status Card */}
        <View className="mx-4 mt-4 bg-surface rounded-2xl p-4 border border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-3 ${offlineStatus?.isOnline ? 'bg-success' : 'bg-warning'}`} />
              <Text className="text-base text-foreground font-medium">
                {offlineStatus?.isOnline 
                  ? (t('settings.connection_online') || 'Conectado')
                  : (t('settings.connection_offline') || 'Sin conexión')}
              </Text>
            </View>
            <Text className="text-sm text-muted">
              v{offlineStatus?.guidesVersion || '2.0.0'}
            </Text>
          </View>
          <Text className="text-xs text-muted mt-2">
            {guides.length} {t('guides.guides_available') || 'guías disponibles'} • {offlineStatus?.languages.join(', ').toUpperCase() || 'ES, EN, DE'}
          </Text>
        </View>

        {/* Guides List */}
        <IOSSectionHeader title={t('guides.all_guides') || 'Todas las Guías'} />
        
        {guides.map((guide) => (
          <View key={guide.id} className="mx-4 mb-3">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setExpandedGuide(expandedGuide === guide.id ? null : guide.id);
                setExpandedSection(null);
              }}
              className={`bg-surface rounded-2xl border overflow-hidden ${
                expandedGuide === guide.id ? 'border-primary' : 'border-border'
              }`}
            >
              <View className="flex-row items-center p-4">
                <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center mr-4">
                  <Text className="text-2xl">{getGuideIcon(guide.id)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    {getGuideTitle(guide.id)}
                  </Text>
                  <Text className="text-sm text-muted mt-0.5">
                    {getGuideDescription(guide.id)}
                  </Text>
                  {guide.content?.sections && (
                    <Text className="text-xs text-primary mt-1">
                      {guide.content.sections.length} {t('guides.sections') || 'secciones'}
                    </Text>
                  )}
                </View>
                <Text className="text-2xl text-muted">
                  {expandedGuide === guide.id ? '▼' : '›'}
                </Text>
              </View>
              
              {expandedGuide === guide.id && (
                <View className="border-t border-separator">
                  {renderGuideContent(guide)}
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {guides.length === 0 && (
          <View className="mx-4 mt-8 items-center">
            <Text className="text-6xl mb-4">📚</Text>
            <Text className="text-lg font-semibold text-foreground text-center">
              {t('guides.no_guides') || 'No hay guías disponibles'}
            </Text>
            <Text className="text-sm text-muted text-center mt-2">
              {t('guides.refresh_to_load') || 'Presiona el botón de actualizar para cargar las guías'}
            </Text>
            <TouchableOpacity
              onPress={handleRefresh}
              className="bg-primary px-6 py-3 rounded-xl mt-4 active:opacity-80"
            >
              <Text className="text-white font-semibold">{t('settings.refresh_guides') || 'Actualizar Guías'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Footer */}
        <View className="mx-4 mt-6 bg-primary/5 rounded-2xl p-4">
          <Text className="text-sm text-primary font-medium mb-1">
            💡 {t('guides.tip_title') || 'Consejo'}
          </Text>
          <Text className="text-xs text-muted leading-5">
            {t('guides.tip_text') || 'Las guías se guardan automáticamente para acceso sin conexión. Puedes consultarlas en cualquier momento, incluso sin internet.'}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
