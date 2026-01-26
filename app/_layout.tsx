import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { TelnetProvider } from "@/lib/telnet-provider";

import { ProfilesProvider } from "@/lib/profiles-provider";
import { UsbStatusProvider } from "@/lib/usb-status-context";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
// NotificationService se importa solo donde se necesita (operaciones de spoofing/recovery)
import { OnboardingModal } from "@/components/onboarding-modal";
import { useOnboarding } from "@/hooks/use-onboarding";
import { hasTOSBeenAccepted } from "@/app/terms-of-service";
import { router } from "expo-router";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

// Componente interno con providers
function RootLayoutContent() {
  return (
    <ThemeProvider>
      <ProfilesProvider>
        <TelnetProvider>
          <UsbStatusProvider>
            <RootLayoutInner />
          </UsbStatusProvider>
        </TelnetProvider>
      </ProfilesProvider>
    </ThemeProvider>
  );
}

// Componente que contiene el Stack
function RootLayoutInner() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  
  // Onboarding state
  const { isFirstLaunch, isLoading, completeOnboarding } = useOnboarding();
  
  // TOS state
  const [tosAccepted, setTosAccepted] = useState<boolean | null>(null);
  const [tosChecked, setTosChecked] = useState(false);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
    // Nota: Permisos de notificaciones se solicitan manualmente desde Settings
    // para evitar solicitudes intrusivas al inicio
  }, []);
  
  // Check TOS acceptance on mount
  useEffect(() => {
    const checkTOS = async () => {
      const accepted = await hasTOSBeenAccepted();
      setTosAccepted(accepted);
      setTosChecked(true);
      if (!accepted) {
        // Navigate to TOS screen if not accepted
        router.replace("/terms-of-service");
      }
    };
    checkTOS();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
          {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
          <Stack 
            screenOptions={{ 
              headerShown: false,
              // Animaciones de transición ultra premium
              animation: 'fade_from_bottom',
              animationDuration: 250,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="oauth/callback" />
          </Stack>
          <StatusBar style="auto" />
          
          {/* Onboarding Modal */}
          {!isLoading && isFirstLaunch && (
            <OnboardingModal
              visible={true}
              onComplete={completeOnboarding}
            />
          )}
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>
        <SafeAreaFrameContext.Provider value={frame}>
          <SafeAreaInsetsContext.Provider value={insets}>
            {content}
          </SafeAreaInsetsContext.Provider>
        </SafeAreaFrameContext.Provider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
  );
}

// Layout root que envuelve todo con LanguageProvider
export default function RootLayout() {
  return (
    <LanguageProvider>
      <RootLayoutContent />
    </LanguageProvider>
  );
}
