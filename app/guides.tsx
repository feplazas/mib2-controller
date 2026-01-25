import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { haptics } from "@/lib/haptics-service";

import { ScreenContainer } from "@/components/screen-container";
import { IOSSectionHeader } from "@/components/ui/ios-section";
import { SkeletonCard } from "@/components/ui/skeleton-loader";
import { useTranslation, useLanguage } from "@/lib/language-context";
import { useColors } from "@/hooks/use-colors";
import { offlineGuidesService, type OfflineGuide, type OfflineStatus, type GuidePhase, type GuideStep } from "@/lib/offline-guides-service";

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
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  useEffect(() => {
    loadGuides();
  }, [currentLanguage]);

  const loadGuides = async () => {
    setLoading(true);
    try {
      await offlineGuidesService.initialize();
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

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedCommand(text);
    haptics.success();
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  // Mapeo de IDs de guías guardadas a IDs amigables
  const getGuideDisplayId = (guideId: string): string => {
    const idMap: Record<string, string> = {
      'installation_guide': 'installation',
      'troubleshooting_guide': 'troubleshooting',
      'commands_guide': 'commands',
      'fec_guide': 'fec',
    };
    return idMap[guideId] || guideId;
  };

  const getGuideIcon = (guideId: string): string => {
    const displayId = getGuideDisplayId(guideId);
    switch (displayId) {
      case 'installation': return '📦';
      case 'troubleshooting': return '🔧';
      case 'commands': return '⌨️';
      case 'fec': return '🔑';
      default: return '📄';
    }
  };

  const getGuideTitle = (guideId: string): string => {
    const displayId = getGuideDisplayId(guideId);
    switch (displayId) {
      case 'installation': return t('offline_guides.installation_title') || 'Guía de Instalación';
      case 'troubleshooting': return t('offline_guides.troubleshooting_title') || 'Solución de Problemas';
      case 'commands': return t('offline_guides.commands_title') || 'Comandos Frecuentes';
      case 'fec': return t('offline_guides.fec_title') || 'Códigos FEC';
      default: return guideId;
    }
  };

  const getGuideDescription = (guideId: string): string => {
    const displayId = getGuideDisplayId(guideId);
    switch (displayId) {
      case 'installation': return t('offline_guides.installation_desc') || 'Proceso completo de instalación de MIB2 Toolbox';
      case 'troubleshooting': return t('offline_guides.troubleshooting_desc') || 'Soluciones a problemas comunes';
      case 'commands': return t('offline_guides.commands_desc') || 'Comandos más utilizados en MIB2';
      case 'fec': return t('offline_guides.fec_desc') || 'Códigos para activar funciones premium';
      default: return '';
    }
  };

  // Traducir claves de título de fase
  const translatePhaseTitle = (titleKey: string): string => {
    const translated = t(titleKey);
    if (translated && translated !== titleKey) return translated;
    
    // Fallbacks para títulos comunes
    const fallbacks: Record<string, string> = {
      'installation_guide.phase1_title': 'Fase 1: Verificar Conexión',
      'installation_guide.phase2_title': 'Fase 2: Crear Backups',
      'installation_guide.phase3_title': 'Fase 3: Instalar Toolbox',
      'installation_guide.phase4_title': 'Fase 4: Verificar Instalación',
      'installation_guide.phase5_title': 'Fase 5: Restauración (si es necesario)',
      'offline_guides.troubleshooting.connection_title': 'Problemas de Conexión',
      'offline_guides.troubleshooting.sd_title': 'Problemas con Tarjeta SD',
      'offline_guides.troubleshooting.toolbox_title': 'Problemas con Toolbox',
      'offline_guides.commands.info_title': 'Comandos de Información',
      'offline_guides.commands.diagnostic_title': 'Comandos de Diagnóstico',
      'offline_guides.commands.filesystem_title': 'Comandos de Sistema de Archivos',
      'offline_guides.commands.advanced_title': 'Comandos Avanzados',
      'offline_guides.fec.intro_title': 'Introducción a FEC',
      'offline_guides.fec.connectivity_title': 'Códigos de Conectividad',
      'offline_guides.fec.performance_title': 'Códigos de Rendimiento',
      'offline_guides.fec.injection_title': 'Proceso de Inyección',
    };
    return fallbacks[titleKey] || titleKey.split('.').pop()?.replace(/_/g, ' ') || titleKey;
  };

  // Traducir claves de título de paso
  const translateStepTitle = (titleKey: string): string => {
    const translated = t(titleKey);
    if (translated && translated !== titleKey) return translated;
    
    // Extraer nombre legible del key
    const lastPart = titleKey.split('.').pop() || titleKey;
    return lastPart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderCommand = (command: string, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => copyToClipboard(command)}
      className="bg-background rounded-lg p-3 mt-2 border border-border active:bg-primary/10 flex-row items-center justify-between"
    >
      <Text className="text-sm text-primary font-mono flex-1 mr-2" numberOfLines={2}>
        {command}
      </Text>
      <View className={`px-2 py-1 rounded ${copiedCommand === command ? 'bg-success' : 'bg-primary/20'}`}>
        <Text className={`text-xs font-medium ${copiedCommand === command ? 'text-white' : 'text-primary'}`}>
          {copiedCommand === command ? '✓' : t('guides.copy_command') || 'Copiar'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderStep = (step: GuideStep, phaseId: string) => (
    <View key={`${phaseId}-step-${step.number}`} className="mb-4 bg-background rounded-xl p-4 border border-border">
      <View className="flex-row items-start">
        <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-3">
          <Text className="text-white font-bold text-sm">{step.number}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {translateStepTitle(step.titleKey)}
          </Text>
          {step.descriptionKey && (
            <Text className="text-sm text-muted mt-1">
              {t(step.descriptionKey) || step.descriptionKey.split('.').pop()?.replace(/_/g, ' ')}
            </Text>
          )}
          {step.warningKey && (
            <View className="bg-warning/10 rounded-lg p-2 mt-2">
              <Text className="text-xs text-warning">
                ⚠️ {t(step.warningKey) || step.warningKey.split('.').pop()?.replace(/_/g, ' ')}
              </Text>
            </View>
          )}
          {step.successKey && (
            <View className="bg-success/10 rounded-lg p-2 mt-2">
              <Text className="text-xs text-success">
                ✓ {t(step.successKey) || step.successKey.split('.').pop()?.replace(/_/g, ' ')}
              </Text>
            </View>
          )}
          {step.commands && step.commands.length > 0 && (
            <View className="mt-2">
              <Text className="text-xs text-muted mb-1">{t('guides.commands_to_execute') || 'Comandos a ejecutar:'}</Text>
              {step.commands.map((cmd, idx) => renderCommand(cmd, idx))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderPhase = (phase: GuidePhase, guideId: string) => {
    const phaseKey = `${guideId}-${phase.id}`;
    const isExpanded = expandedPhase === phaseKey;

    return (
      <View key={phaseKey} className="mb-3">
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setExpandedPhase(isExpanded ? null : phaseKey);
          }}
          className={`bg-surface rounded-xl p-4 border ${isExpanded ? 'border-primary' : 'border-border'} active:opacity-80`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-base font-semibold text-foreground">
                {translatePhaseTitle(phase.titleKey)}
              </Text>
              <Text className="text-xs text-muted mt-1">
                {phase.steps?.length || 0} {t('guides.steps') || 'pasos'}
              </Text>
            </View>
            <Text className="text-xl text-muted">
              {isExpanded ? '▼' : '›'}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View className="mt-3 pl-2">
            {phase.warnings && phase.warnings.length > 0 && (
              <View className="bg-error/10 rounded-xl p-3 mb-3 border border-error/30">
                {phase.warnings.map((warning, idx) => (
                  <Text key={idx} className="text-sm text-error">
                    🚨 {t(warning) || warning.split('.').pop()?.replace(/_/g, ' ')}
                  </Text>
                ))}
              </View>
            )}
            {phase.steps?.map((step) => renderStep(step, phase.id))}
          </View>
        )}
      </View>
    );
  };

  const renderGuideContent = (guide: OfflineGuide) => {
    if (!guide.content) {
      return (
        <View className="px-4 pb-4">
          <Text className="text-muted text-center py-4">
            {t('guides.no_content') || 'No hay contenido disponible'}
          </Text>
        </View>
      );
    }

    const { phases, sections, troubleshooting, resources } = guide.content;

    return (
      <View className="px-4 pb-4 pt-2">
        {/* Renderizar Phases (estructura principal de las guías) */}
        {phases && phases.length > 0 && (
          <View>
            {phases.map((phase) => renderPhase(phase, guide.id))}
          </View>
        )}

        {/* Renderizar Sections (estructura alternativa) */}
        {sections && sections.length > 0 && (
          <View>
            {sections.map((section, idx) => (
              <View key={idx} className="mb-3 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-base font-semibold text-foreground mb-2">{section.title}</Text>
                {section.steps?.map((step, stepIdx) => (
                  <View key={stepIdx} className="flex-row mb-2">
                    <Text className="text-primary font-bold mr-2 w-6">{stepIdx + 1}.</Text>
                    <Text className="text-sm text-muted flex-1">{step}</Text>
                  </View>
                ))}
                {section.items?.map((item, itemIdx) => (
                  <View key={itemIdx} className="mb-2 bg-background rounded-lg p-3">
                    <Text className="text-sm font-semibold text-foreground">{item.name || item.title}</Text>
                    {item.description && <Text className="text-xs text-muted mt-1">{item.description}</Text>}
                    {item.command && renderCommand(item.command, itemIdx)}
                    {item.code && (
                      <TouchableOpacity
                        onPress={() => copyToClipboard(item.code!)}
                        className="bg-success/10 rounded-lg p-2 mt-2 border border-success flex-row items-center justify-between"
                      >
                        <Text className="text-xs text-success font-mono">{item.code}</Text>
                        <Text className="text-xs text-success ml-2">
                          {copiedCommand === item.code ? '✓' : 'Copiar'}
                        </Text>
                      </TouchableOpacity>
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
            ))}
          </View>
        )}

        {/* Renderizar Troubleshooting */}
        {troubleshooting && troubleshooting.length > 0 && (
          <View className="mt-4">
            <Text className="text-lg font-semibold text-foreground mb-3">
              {t('guides.troubleshooting') || 'Solución de Problemas'}
            </Text>
            {troubleshooting.map((item, idx) => (
              <View key={idx} className="mb-3 bg-warning/5 rounded-xl p-4 border border-warning/30">
                <Text className="text-sm font-semibold text-warning mb-2">
                  ❓ {t(item.problemKey) || item.problemKey.split('.').pop()?.replace(/_/g, ' ')}
                </Text>
                {item.solutions.map((solution, solIdx) => (
                  <View key={solIdx} className="flex-row mb-1">
                    <Text className="text-success mr-2">•</Text>
                    <Text className="text-xs text-muted flex-1">
                      {t(solution) || solution.split('.').pop()?.replace(/_/g, ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Renderizar Resources */}
        {resources && resources.length > 0 && (
          <View className="mt-4">
            <Text className="text-lg font-semibold text-foreground mb-3">
              {t('guides.resources') || 'Recursos'}
            </Text>
            {resources.map((resource, idx) => (
              <View key={idx} className="mb-2 bg-primary/5 rounded-xl p-3">
                <Text className="text-sm font-medium text-primary">
                  {t(resource.titleKey) || resource.titleKey.split('.').pop()?.replace(/_/g, ' ')}
                </Text>
                <Text className="text-xs text-muted mt-1">
                  {t(resource.descriptionKey) || resource.descriptionKey.split('.').pop()?.replace(/_/g, ' ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const getPhaseCount = (guide: OfflineGuide): number => {
    if (!guide.content) return 0;
    return (guide.content.phases?.length || 0) + (guide.content.sections?.length || 0);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 px-4 pt-4">
          <View className="mb-4">
            <View className="h-8 w-48 bg-surface rounded-lg mb-2" />
            <View className="h-4 w-64 bg-surface rounded-lg" />
          </View>
          <SkeletonCard showIcon={true} showTitle={true} showSubtitle={true} showContent={false} style={{ marginBottom: 12 }} />
          <SkeletonCard showIcon={true} showTitle={true} showSubtitle={true} showContent={false} style={{ marginBottom: 12 }} />
          <SkeletonCard showIcon={true} showTitle={true} showSubtitle={true} showContent={false} style={{ marginBottom: 12 }} />
          <SkeletonCard showIcon={true} showTitle={true} showSubtitle={true} showContent={false} />
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
              <Text className="text-primary text-lg">← {t('common.back') || 'Atrás'}</Text>
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
                setExpandedPhase(null);
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
                  <Text className="text-xs text-primary mt-1">
                    {getPhaseCount(guide)} {t('guides.sections') || 'secciones'}
                  </Text>
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
