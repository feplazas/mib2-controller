const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to enable ProGuard/R8 minification and resource shrinking
 * for production builds.
 */
module.exports = function withProguard(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("minifyEnabled")) {
      // Already configured
      return config;
    }

    // Add ProGuard configuration to release buildType
    config.modResults.contents = config.modResults.contents.replace(
      /buildTypes\s*\{/,
      `buildTypes {
        release {
            // Enable ProGuard/R8 minification and obfuscation
            minifyEnabled true
            // Enable resource shrinking to remove unused resources
            shrinkResources true
            // Use ProGuard rules from proguard-rules.pro
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        `
    );

    return config;
  });
};
