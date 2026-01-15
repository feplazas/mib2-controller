// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

// Bundle ID for Play Store - use your own domain
const bundleId = "com.feplazas.mib2controller";

const env = {
  // App branding
  appName: "MIB2 Controller",
  appSlug: "mib2_controller",
  // S3 URL of the app logo
  logoUrl: "https://s3.us-west-2.amazonaws.com/manus.artifacts/01JHDYXVDM3QPVD5BXBR0QBZFH.png",
  scheme: "mib2controller",
  iosBundleId: bundleId,
  androidPackage: bundleId,
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  
  ios: {
    supportsTablet: true,
    bundleIdentifier: env.iosBundleId,
  },
  
  android: {
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: "#0a1929",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: [
      "POST_NOTIFICATIONS",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: env.scheme,
            host: "*",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  
  plugins: [
    "./plugins/withUsbHost.js",
    "./plugins/gradle-fix-plugin.js",
    "expo-router",
    [
      "expo-audio",
      {
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
      },
    ],
    [
      "expo-video",
      {
        supportsBackgroundPlayback: true,
        supportsPictureInPicture: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#0a1929",
        dark: {
          backgroundColor: "#0a1929",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["armeabi-v7a", "arm64-v8a"],
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          minSdkVersion: 24,
          targetSdkVersion: 34,
        },
      },
    ],
  ],
  
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  
  extra: {
    eas: {
      projectId: "ef9170d6-ae36-473d-9b1d-d7023528c0fd",
    },
  },
};

export default config;
