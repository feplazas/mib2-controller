import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Linking } from "react-native";
import * as Haptics from "expo-haptics";
import * as MailComposer from "expo-mail-composer";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { AnimatedCheckmark, AnimatedError } from "@/components/ui/animated-checkmark";
import { useTranslation } from "@/lib/language-context";
import { useColors } from "@/hooks/use-colors";

type FeedbackMode = 'menu' | 'bug' | 'feature';

interface FeedbackOption {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
  action: () => void;
  color?: string;
}

/**
 * Feedback Screen - F-Droid Style Premium
 * 
 * Tarjetas con bordes redondeados, iconos destacados,
 * diseño limpio y moderno inspirado en F-Droid.
 */
export default function FeedbackScreen() {
  const t = useTranslation();
  const colors = useColors();
  const [mode, setMode] = useState<FeedbackMode>('menu');
  
  // Bug report state
  const [bugDescription, setBugDescription] = useState("");
  const [bugSteps, setBugSteps] = useState("");
  const [bugExpected, setBugExpected] = useState("");
  const [includeDeviceInfo, setIncludeDeviceInfo] = useState(true);
  
  // Feature suggestion state
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureUseCase, setFeatureUseCase] = useState("");
  
  // Animation states
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const DEVELOPER_EMAIL = "mib2controller@proton.me";
  const GITHUB_ISSUES_URL = "https://github.com/mib2-controller/issues";
  const MIB2_FORUM_URL = "https://mib2-std2.com";
  const VW_VORTEX_URL = "https://www.vwvortex.com";

  const handleSendBugReport = async () => {
    if (!bugDescription.trim()) {
      Alert.alert(t('common.error'), t('feedback.bug_description_placeholder'));
      return;
    }

    const deviceInfo = includeDeviceInfo ? `
---
${t('feedback.device_info')}:
${t('feedback.platform')}: ${Platform.OS}
${t('feedback.version')}: 1.0.0 (Build 28)
---` : '';

    const body = `${t('feedback.bug_description')}:
${bugDescription}

${t('feedback.bug_steps')}:
${bugSteps || 'N/A'}

${t('feedback.bug_expected')}:
${bugExpected || 'N/A'}
${deviceInfo}`;

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [DEVELOPER_EMAIL],
          subject: t('feedback.email_subject_bug'),
          body: body,
        });
        
        // Mostrar animación de éxito
        setSuccessMessage(t('feedback.report_sent'));
        setShowSuccess(true);
      } else {
        // Fallback: open mailto link
        const mailtoUrl = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(t('feedback.email_subject_bug'))}&body=${encodeURIComponent(body)}`;
        await Linking.openURL(mailtoUrl);
      }
    } catch (error) {
      Alert.alert(t('common.error'), String(error));
    }
  };

  const handleSendFeatureSuggestion = async () => {
    if (!featureDescription.trim()) {
      Alert.alert(t('common.error'), t('feedback.feature_description_placeholder'));
      return;
    }

    const body = `${t('feedback.feature_description')}:
${featureDescription}

${t('feedback.feature_use_case')}:
${featureUseCase || 'N/A'}

---
${t('feedback.version')}: 1.0.0 (Build 28)
---`;

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [DEVELOPER_EMAIL],
          subject: t('feedback.email_subject_feature'),
          body: body,
        });
        
        // Mostrar animación de éxito
        setSuccessMessage(t('feedback.suggestion_sent'));
        setShowSuccess(true);
      } else {
        const mailtoUrl = `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(t('feedback.email_subject_feature'))}&body=${encodeURIComponent(body)}`;
        await Linking.openURL(mailtoUrl);
      }
    } catch (error) {
      Alert.alert(t('common.error'), String(error));
    }
  };

  const handleOpenURL = async (url: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(t('common.error'), String(error));
    }
  };

  const feedbackOptions: FeedbackOption[] = [
    {
      id: 'bug',
      icon: '🐛',
      titleKey: 'feedback.report_bug',
      descKey: 'feedback.report_bug_desc',
      action: () => setMode('bug'),
      color: '#EF4444',
    },
    {
      id: 'feature',
      icon: '💡',
      titleKey: 'feedback.suggest_feature',
      descKey: 'feedback.suggest_feature_desc',
      action: () => setMode('feature'),
      color: '#F59E0B',
    },
    {
      id: 'email',
      icon: '✉️',
      titleKey: 'feedback.contact_dev',
      descKey: 'feedback.contact_dev_desc',
      action: () => handleOpenURL(`mailto:${DEVELOPER_EMAIL}`),
      color: colors.primary,
    },
  ];

  const communityOptions: FeedbackOption[] = [
    {
      id: 'github',
      icon: '🔧',
      titleKey: 'feedback.forum_github',
      descKey: 'feedback.report_bug_desc',
      action: () => handleOpenURL(GITHUB_ISSUES_URL),
    },
    {
      id: 'mib2',
      icon: '🚗',
      titleKey: 'feedback.forum_mib2',
      descKey: 'feedback.join_community_desc',
      action: () => handleOpenURL(MIB2_FORUM_URL),
    },
    {
      id: 'vwvortex',
      icon: '🌐',
      titleKey: 'feedback.forum_vw',
      descKey: 'feedback.join_community_desc',
      action: () => handleOpenURL(VW_VORTEX_URL),
    },
  ];

  // F-Droid style card component
  const FeedbackCard = ({ option, fullWidth = false }: { option: FeedbackOption; fullWidth?: boolean }) => (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        option.action();
      }}
      className={`bg-surface rounded-2xl p-4 border border-border active:opacity-80 ${fullWidth ? 'flex-1' : ''}`}
      style={{ minHeight: 100 }}
    >
      <View 
        className="w-12 h-12 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: (option.color || colors.primary) + '20' }}
      >
        <Text className="text-2xl">{option.icon}</Text>
      </View>
      <Text className="text-base font-semibold text-foreground mb-1" numberOfLines={1}>
        {t(option.titleKey)}
      </Text>
      <Text className="text-xs text-muted" numberOfLines={2}>
        {t(option.descKey)}
      </Text>
    </TouchableOpacity>
  );

  // Bug Report Form
  if (mode === 'bug') {
    return (
      <ScreenContainer className="p-4">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header with back button */}
          <TouchableOpacity
            onPress={() => setMode('menu')}
            className="flex-row items-center mb-4"
          >
            <Text className="text-lg" style={{ color: colors.primary }}>←</Text>
            <Text className="text-sm font-semibold ml-2" style={{ color: colors.primary }}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>

          <View className="gap-2 mb-6">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              🐛 {t('feedback.bug_report_title')}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('feedback.report_bug_desc')}
            </Text>
          </View>

          {/* Bug Description */}
          <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
              {t('feedback.bug_description')} *
            </Text>
            <TextInput
              value={bugDescription}
              onChangeText={setBugDescription}
              placeholder={t('feedback.bug_description_placeholder')}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              className="bg-background rounded-xl px-4 py-3"
              style={{ 
                color: colors.foreground, 
                borderWidth: 1, 
                borderColor: colors.border,
                minHeight: 100,
                textAlignVertical: 'top'
              }}
            />
          </View>

          {/* Steps to Reproduce */}
          <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
              {t('feedback.bug_steps')}
            </Text>
            <TextInput
              value={bugSteps}
              onChangeText={setBugSteps}
              placeholder={t('feedback.bug_steps_placeholder')}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              className="bg-background rounded-xl px-4 py-3"
              style={{ 
                color: colors.foreground, 
                borderWidth: 1, 
                borderColor: colors.border,
                minHeight: 100,
                textAlignVertical: 'top'
              }}
            />
          </View>

          {/* Expected Behavior */}
          <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
              {t('feedback.bug_expected')}
            </Text>
            <TextInput
              value={bugExpected}
              onChangeText={setBugExpected}
              placeholder={t('feedback.bug_expected_placeholder')}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={2}
              className="bg-background rounded-xl px-4 py-3"
              style={{ 
                color: colors.foreground, 
                borderWidth: 1, 
                borderColor: colors.border,
                minHeight: 60,
                textAlignVertical: 'top'
              }}
            />
          </View>

          {/* Include Device Info Toggle */}
          <TouchableOpacity
            onPress={() => setIncludeDeviceInfo(!includeDeviceInfo)}
            className="bg-surface rounded-2xl p-4 border border-border mb-6 flex-row items-center"
          >
            <View 
              className="w-6 h-6 rounded-md items-center justify-center mr-3"
              style={{ 
                backgroundColor: includeDeviceInfo ? colors.primary : colors.border 
              }}
            >
              {includeDeviceInfo && <Text className="text-xs text-white">✓</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>
                {t('feedback.include_device_info')}
              </Text>
              <Text className="text-xs" style={{ color: colors.muted }}>
                {t('feedback.platform')}, {t('feedback.version')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendBugReport}
            className="bg-primary px-6 py-4 rounded-2xl active:opacity-80"
          >
            <Text className="text-center font-semibold text-base" style={{ color: colors.background }}>
              📤 {t('feedback.send_report')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Feature Suggestion Form
  if (mode === 'feature') {
    return (
      <ScreenContainer className="p-4">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header with back button */}
          <TouchableOpacity
            onPress={() => setMode('menu')}
            className="flex-row items-center mb-4"
          >
            <Text className="text-lg" style={{ color: colors.primary }}>←</Text>
            <Text className="text-sm font-semibold ml-2" style={{ color: colors.primary }}>
              {t('common.back')}
            </Text>
          </TouchableOpacity>

          <View className="gap-2 mb-6">
            <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
              💡 {t('feedback.feature_title')}
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {t('feedback.suggest_feature_desc')}
            </Text>
          </View>

          {/* Feature Description */}
          <View className="bg-surface rounded-2xl p-4 border border-border mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
              {t('feedback.feature_description')} *
            </Text>
            <TextInput
              value={featureDescription}
              onChangeText={setFeatureDescription}
              placeholder={t('feedback.feature_description_placeholder')}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              className="bg-background rounded-xl px-4 py-3"
              style={{ 
                color: colors.foreground, 
                borderWidth: 1, 
                borderColor: colors.border,
                minHeight: 100,
                textAlignVertical: 'top'
              }}
            />
          </View>

          {/* Use Case */}
          <View className="bg-surface rounded-2xl p-4 border border-border mb-6">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.foreground }}>
              {t('feedback.feature_use_case')}
            </Text>
            <TextInput
              value={featureUseCase}
              onChangeText={setFeatureUseCase}
              placeholder={t('feedback.feature_use_case_placeholder')}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              className="bg-background rounded-xl px-4 py-3"
              style={{ 
                color: colors.foreground, 
                borderWidth: 1, 
                borderColor: colors.border,
                minHeight: 80,
                textAlignVertical: 'top'
              }}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendFeatureSuggestion}
            className="bg-primary px-6 py-4 rounded-2xl active:opacity-80"
          >
            <Text className="text-center font-semibold text-base" style={{ color: colors.background }}>
              📤 {t('feedback.send_suggestion')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Main Menu - F-Droid Style
  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header with back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Text className="text-lg" style={{ color: colors.primary }}>←</Text>
          <Text className="text-sm font-semibold ml-2" style={{ color: colors.primary }}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>

        <View className="gap-2 mb-6">
          <Text className="text-3xl font-bold" style={{ color: colors.foreground }}>
            {t('feedback.title')}
          </Text>
          <Text className="text-sm" style={{ color: colors.muted }}>
            {t('feedback.subtitle')}
          </Text>
        </View>

        {/* Main Feedback Options - F-Droid Grid Style */}
        <View className="flex-row gap-3 mb-3">
          <FeedbackCard option={feedbackOptions[0]} fullWidth />
          <FeedbackCard option={feedbackOptions[1]} fullWidth />
        </View>
        
        {/* Full Width Card */}
        <View className="mb-6">
          <FeedbackCard option={feedbackOptions[2]} />
        </View>

        {/* Community Section Header */}
        <Text className="text-lg font-semibold mb-3" style={{ color: colors.foreground }}>
          {t('feedback.forums_title')}
        </Text>

        {/* Community Options - List Style */}
        <View className="bg-surface rounded-2xl overflow-hidden border border-border">
          {communityOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                option.action();
              }}
              className={`flex-row items-center px-4 py-4 active:bg-primary/5 ${
                index < communityOptions.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <View 
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary + '15' }}
              >
                <Text className="text-xl">{option.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium" style={{ color: colors.foreground }}>
                  {t(option.titleKey)}
                </Text>
                <Text className="text-xs" style={{ color: colors.muted }}>
                  {t(option.descKey)}
                </Text>
              </View>
              <Text style={{ color: colors.muted }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info Footer */}
        <View className="items-center mt-8">
          <Text className="text-xs" style={{ color: colors.muted }}>
            MIB2 Controller v1.0.0 (Build 28)
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.muted }}>
            {t('feedback.contact_dev_desc')}
          </Text>
        </View>
      </ScrollView>
      
      {/* Animación de éxito */}
      <AnimatedCheckmark
        visible={showSuccess}
        message={successMessage}
        onComplete={() => {
          setShowSuccess(false);
          setMode('menu');
          setBugDescription("");
          setBugSteps("");
          setBugExpected("");
          setFeatureDescription("");
          setFeatureUseCase("");
        }}
        autoHide={true}
        autoHideDelay={2500}
      />
      
      {/* Animación de error */}
      <AnimatedError
        visible={showError}
        message={t('common.error')}
        onComplete={() => setShowError(false)}
        autoHide={true}
        autoHideDelay={2000}
      />
    </ScreenContainer>
  );
}
