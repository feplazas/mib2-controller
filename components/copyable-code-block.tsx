import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";

interface CopyableCodeBlockProps {
  code: string;
  showCopyButton?: boolean;
  multiLine?: boolean;
}

/**
 * A code block component that allows users to copy the text to clipboard.
 * Tap anywhere on the block to copy, or use the copy button.
 */
export function CopyableCodeBlock({
  code,
  showCopyButton = true,
  multiLine = false,
}: CopyableCodeBlockProps) {
  const colors = useColors();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Pressable
      onPress={handleCopy}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 12,
          marginVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: pressed ? 0.7 : 1,
          borderWidth: 1,
          borderColor: copied ? colors.success : colors.border,
        },
      ]}
    >
      <View style={{ flex: 1, marginRight: showCopyButton ? 8 : 0 }}>
        <Text
          style={{
            fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
            fontSize: 13,
            color: "#4ADE80", // Green color for code
            lineHeight: multiLine ? 20 : 18,
          }}
          selectable={true}
        >
          {code}
        </Text>
      </View>
      {showCopyButton && (
        <View
          style={{
            backgroundColor: copied ? colors.success : colors.primary,
            borderRadius: 6,
            padding: 6,
            minWidth: 32,
            alignItems: "center",
          }}
        >
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={16}
            color="#FFFFFF"
          />
        </View>
      )}
    </Pressable>
  );
}

/**
 * A simpler inline code that can be copied with a tap.
 */
export function CopyableInlineCode({ code }: { code: string }) {
  const colors = useColors();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Pressable onPress={handleCopy}>
      <Text
        style={{
          fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
          fontSize: 13,
          color: copied ? colors.success : "#4ADE80",
          backgroundColor: colors.surface,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        }}
      >
        {code}
        {copied ? " ✓" : ""}
      </Text>
    </Pressable>
  );
}
