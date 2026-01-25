import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { termsOfUse } from "@/lib/terms-of-use";

export default function TermsOfUseScreen() {
  const { selectedLanguage } = useLanguage();
  
  // Get the appropriate language version (fallback to English if auto)
  const lang = selectedLanguage === 'auto' ? 'en' : selectedLanguage;
  const terms = termsOfUse[lang as 'es' | 'en' | 'de'] || termsOfUse.en;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">{terms.title}</Text>
              <Text className="text-xs text-muted mt-1">
                {lang === 'es' ? 'Última actualización' : lang === 'de' ? 'Letzte Aktualisierung' : 'Last updated'}: {terms.lastUpdated}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              activeOpacity={0.8}
              className="bg-surface border border-border rounded-xl px-4 py-2"
            >
              <Text className="text-foreground font-semibold">
                {lang === 'es' ? 'Volver' : lang === 'de' ? 'Zurück' : 'Back'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms Sections */}
          {terms.sections.map((section, index) => (
            <View key={index} className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-base font-bold text-foreground mb-3">
                {section.title}
              </Text>
              <Text className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {section.content}
              </Text>
            </View>
          ))}

          {/* Acceptance Note */}
          <View className="bg-primary/10 border border-primary rounded-2xl p-4">
            <Text className="text-sm text-foreground font-medium text-center">
              {lang === 'es' 
                ? 'Al usar MIB2 Controller, usted acepta estos Términos de Uso.'
                : lang === 'de'
                ? 'Durch die Nutzung von MIB2 Controller akzeptieren Sie diese Nutzungsbedingungen.'
                : 'By using MIB2 Controller, you accept these Terms of Use.'}
            </Text>
          </View>

          {/* Spacer */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
