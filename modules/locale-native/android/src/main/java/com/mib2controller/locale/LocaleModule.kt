package com.mib2controller.locale

import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.Locale

/**
 * Native module to get system locale directly from Android API
 * This is more reliable than expo-localization in production builds
 */
class LocaleModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "LocaleModule"
    }

    @ReactMethod
    fun getSystemLanguage(promise: Promise) {
        try {
            val locale: Locale = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // Android 7.0+ (API 24+)
                reactApplicationContext.resources.configuration.locales.get(0)
            } else {
                // Android 6.0 and below
                @Suppress("DEPRECATION")
                reactApplicationContext.resources.configuration.locale
            }
            
            val languageCode = locale.language
            
            // Log for debugging
            android.util.Log.d("LocaleModule", "System locale: $locale")
            android.util.Log.d("LocaleModule", "Language code: $languageCode")
            
            promise.resolve(languageCode)
        } catch (e: Exception) {
            android.util.Log.e("LocaleModule", "Error getting system language", e)
            promise.reject("ERROR", "Failed to get system language: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getSystemLocale(promise: Promise) {
        try {
            val locale: Locale = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                reactApplicationContext.resources.configuration.locales.get(0)
            } else {
                @Suppress("DEPRECATION")
                reactApplicationContext.resources.configuration.locale
            }
            
            val localeString = locale.toString()
            
            android.util.Log.d("LocaleModule", "Full locale: $localeString")
            
            promise.resolve(localeString)
        } catch (e: Exception) {
            android.util.Log.e("LocaleModule", "Error getting system locale", e)
            promise.reject("ERROR", "Failed to get system locale: ${e.message}", e)
        }
    }
}
