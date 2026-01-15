const {
  withAndroidManifest,
  withMainActivity,
  AndroidConfig,
} = require('expo/config-plugins');

/**
 * Expo Config Plugin: Locale Change Detection for Android
 * 
 * This plugin modifies the native Android code to detect system language changes
 * and automatically reload the React Native context when the language changes.
 * 
 * Based on: https://www.callstack.com/blog/react-native-handling-language-changes-on-android-the-right-way
 * 
 * What it does:
 * 1. Adds 'layoutDirection' and 'locale' to android:configChanges in AndroidManifest.xml
 * 2. Adds code to MainActivity.java to detect locale changes
 * 3. Calls recreateReactContextInBackground() when locale changes
 * 
 * This ensures that when the user changes the system language:
 * - Android detects the configuration change
 * - React Native context is recreated
 * - LanguageProvider re-mounts and detects the new language
 * - All components re-render with the new translations
 */
const withLocaleChangeDetection = (config) => {
  // Step 1: Modify AndroidManifest.xml to handle locale changes
  config = withAndroidManifest(config, async (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);
    
    // Get current configChanges or initialize empty string
    let configChanges = mainActivity.$['android:configChanges'] || '';
    
    // Add layoutDirection if not present (required due to Android bug)
    if (!configChanges.includes('layoutDirection')) {
      configChanges = configChanges ? `${configChanges}|layoutDirection` : 'layoutDirection';
    }
    
    // Add locale if not present
    if (!configChanges.includes('locale')) {
      configChanges = configChanges ? `${configChanges}|locale` : 'locale';
    }
    
    mainActivity.$['android:configChanges'] = configChanges;
    
    return config;
  });

  // Step 2: Modify MainActivity.java to detect and handle locale changes
  config = withMainActivity(config, async (config) => {
    let mainActivity = config.modResults.contents;
    
    // Add Configuration import
    if (!mainActivity.includes('import android.content.res.Configuration;')) {
      mainActivity = mainActivity.replace(
        'import android.os.Bundle;',
        'import android.os.Bundle;\nimport android.content.res.Configuration;'
      );
    }
    
    // Add ReactInstanceManager import
    if (!mainActivity.includes('import com.facebook.react.ReactInstanceManager;')) {
      mainActivity = mainActivity.replace(
        'import android.content.res.Configuration;',
        'import android.content.res.Configuration;\nimport com.facebook.react.ReactInstanceManager;'
      );
    }
    
    // Add static currentLocale variable
    if (!mainActivity.includes('private static String currentLocale;')) {
      mainActivity = mainActivity.replace(
        'public class MainActivity extends ReactActivity {',
        'public class MainActivity extends ReactActivity {\n  private static String currentLocale;'
      );
    }
    
    // Add locale initialization in onCreate
    if (!mainActivity.includes('MainActivity.currentLocale = getResources().getConfiguration().locale.toString();')) {
      // Find onCreate method and add after super.onCreate
      const onCreateRegex = /(@Override\s+protected void onCreate\(Bundle savedInstanceState\)\s*\{[^}]*super\.onCreate\(savedInstanceState\);)/;
      mainActivity = mainActivity.replace(
        onCreateRegex,
        '$1\n    MainActivity.currentLocale = getResources().getConfiguration().locale.toString();'
      );
    }
    
    // Add onConfigurationChanged method if not present
    if (!mainActivity.includes('onConfigurationChanged')) {
      const onConfigMethod = `
  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    
    String locale = newConfig.locale.toString();
    if (!MainActivity.currentLocale.equals(locale)) {
      MainActivity.currentLocale = locale;
      final ReactInstanceManager instanceManager = getReactInstanceManager();
      instanceManager.recreateReactContextInBackground();
    }
  }
`;
      
      // Insert before the last closing brace
      const lastBraceIndex = mainActivity.lastIndexOf('}');
      mainActivity = mainActivity.slice(0, lastBraceIndex) + onConfigMethod + mainActivity.slice(lastBraceIndex);
    }
    
    config.modResults.contents = mainActivity;
    return config;
  });

  return config;
};

module.exports = withLocaleChangeDetection;
