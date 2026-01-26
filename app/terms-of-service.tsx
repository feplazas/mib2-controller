import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Linking,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "@/lib/language-context";

const TOS_ACCEPTED_KEY = "tos_accepted_v1.1";

// Terms of Service content sections
const getTOSContent = (t: (key: string) => string) => [
  {
    title: "1. " + t("tos.acceptance_title"),
    content: t("tos.acceptance_content"),
  },
  {
    title: "2. " + t("tos.description_title"),
    content: t("tos.description_content"),
  },
  {
    title: "3. " + t("tos.right_to_repair_title"),
    content: t("tos.right_to_repair_content"),
  },
  {
    title: "4. " + t("tos.risks_title"),
    content: t("tos.risks_content"),
  },
  {
    title: "5. " + t("tos.prohibited_title"),
    content: t("tos.prohibited_content"),
  },
  {
    title: "6. " + t("tos.disclaimer_title"),
    content: t("tos.disclaimer_content"),
  },
  {
    title: "7. " + t("tos.liability_title"),
    content: t("tos.liability_content"),
  },
  {
    title: "8. " + t("tos.indemnification_title"),
    content: t("tos.indemnification_content"),
  },
];

export default function TermsOfServiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = 50;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

      if (isCloseToBottom && !hasScrolledToEnd) {
        setHasScrolledToEnd(true);
      }
    },
    [hasScrolledToEnd]
  );

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await AsyncStorage.setItem(TOS_ACCEPTED_KEY, new Date().toISOString());
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving TOS acceptance:", error);
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    // Show alert that app cannot be used without accepting TOS
    // For now, just exit or show message
    Linking.openURL("https://github.com/feplazas/mib2-controller");
  };

  const tosContent = getTOSContent(t);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {t("tos.title")}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
          {t("tos.subtitle")}
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        {/* Warning Banner */}
        <View style={[styles.warningBanner, { backgroundColor: colors.warning + "20" }]}>
          <Text style={[styles.warningIcon]}>⚠️</Text>
          <Text style={[styles.warningText, { color: colors.warning }]}>
            {t("tos.warning")}
          </Text>
        </View>

        {/* TOS Sections */}
        {tosContent.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionContent, { color: colors.muted }]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* Final Agreement */}
        <View style={[styles.agreementBox, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
          <Text style={[styles.agreementText, { color: colors.foreground }]}>
            {t("tos.agreement")}
          </Text>
        </View>

        {/* Scroll indicator */}
        {!hasScrolledToEnd && (
          <View style={styles.scrollIndicator}>
            <Text style={[styles.scrollIndicatorText, { color: colors.muted }]}>
              {t("tos.scroll_to_continue")}
            </Text>
            <Text style={styles.scrollArrow}>↓</Text>
          </View>
        )}

        {/* Extra padding at bottom */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer with buttons */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          style={[
            styles.button,
            styles.declineButton,
            { borderColor: colors.error },
          ]}
          onPress={handleDecline}
        >
          <Text style={[styles.buttonText, { color: colors.error }]}>
            {t("tos.decline")}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.acceptButton,
            {
              backgroundColor: hasScrolledToEnd ? colors.primary : colors.muted,
              opacity: hasScrolledToEnd && !isAccepting ? 1 : 0.5,
            },
          ]}
          onPress={handleAccept}
          disabled={!hasScrolledToEnd || isAccepting}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {isAccepting ? t("tos.accepting") : t("tos.accept")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// Helper function to check if TOS has been accepted
export async function hasTOSBeenAccepted(): Promise<boolean> {
  try {
    const accepted = await AsyncStorage.getItem(TOS_ACCEPTED_KEY);
    return accepted !== null;
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  agreementBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 8,
    marginBottom: 16,
  },
  agreementText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    textAlign: "center",
  },
  scrollIndicator: {
    alignItems: "center",
    marginTop: 16,
  },
  scrollIndicatorText: {
    fontSize: 12,
  },
  scrollArrow: {
    fontSize: 20,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButton: {
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  acceptButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
