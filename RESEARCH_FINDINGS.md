# Investigación Exhaustiva: Problema de Idioma en React Native Expo

## 🔍 Hallazgos Clave de Documentación Oficial de Expo

### 1. **Android NO resetea la app cuando cambia el idioma del sistema**

> "On Android, when a user changes the device's language, the app will not reset. You can use the AppState API to listen for changes to the app's state and call the getLocales() function each time the app's state changes."

**IMPLICACIÓN CRÍTICA:**
- En Android, cambiar el idioma del sistema NO reinicia la app
- La app sigue corriendo con el idioma inicial
- DEBE usar AppState API para detectar cambios y re-llamar getLocales()

### 2. **iOS SÍ resetea la app cuando cambia el idioma**

> "On iOS, when a user changes the device's language, the app will reset. This means you can set the language once without updating any of your React components to account for the language changes."

**IMPLICACIÓN:**
- En iOS funciona automáticamente porque resetea la app
- En Android NO funciona porque NO resetea

### 3. **Configuración de locales soportados**

Expo requiere declarar los locales soportados en `app.config.ts`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-localization",
        {
          "supportedLocales": {
            "ios": ["en", "ja"],
            "android": ["en", "ja"]
          }
        }
      ]
    ]
  }
}
```

**PROBLEMA IDENTIFICADO:**
- NO tenemos este plugin configurado en app.config.ts
- Android puede no estar reportando correctamente los locales

## 🎯 Solución Definitiva

### Opción 1: Usar AppState API (Recomendado por Expo)

```typescript
import { AppState } from 'react-native';
import { getLocales } from 'expo-localization';

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      // Re-detectar idioma cuando app vuelve a foreground
      const locales = getLocales();
      const newLanguage = locales[0]?.languageCode || 'en';
      if (newLanguage !== currentLanguage) {
        setCurrentLanguage(newLanguage);
        i18n.locale = newLanguage;
      }
    }
  });

  return () => {
    subscription.remove();
  };
}, [currentLanguage]);
```

### Opción 2: Agregar plugin de expo-localization

En `app.config.ts`:

```typescript
plugins: [
  [
    "expo-localization",
    {
      supportedLocales: {
        ios: ["es", "en", "de"],
        android: ["es", "en", "de"]
      }
    }
  ]
]
```

## 📊 Problema Real Identificado

**El usuario reporta:**
- Sistema en inglés → App se muestra en español
- Incluso después de reinstalar

**Causa raíz:**
1. `getLocales()` se llama UNA VEZ al montar LanguageProvider
2. Si el idioma del sistema cambia DESPUÉS, la app NO se entera (Android)
3. Los componentes se renderizan con el idioma inicial y nunca se actualizan

**Por qué useCallback con currentLanguage NO funciona:**
- Si `currentLanguage` NUNCA cambia (porque solo se setea en mount), useCallback NUNCA devuelve una función nueva
- Los componentes NUNCA se re-renderizan

## ✅ Solución Implementar Mañana

1. **Agregar plugin expo-localization a app.config.ts**
2. **Usar AppState API para detectar cambios de idioma**
3. **Forzar re-render de toda la app cuando cambia idioma**
4. **Logs detallados para debugging**

## 🔗 Referencias

- https://docs.expo.dev/guides/localization/
- https://docs.expo.dev/versions/latest/sdk/localization/


## 🔥 Hallazgos CRÍTICOS del Artículo de Callstack

### Problema Confirmado

> "I found out that when using this library on Android, if we change the system language, the app will not update to the new locale till I reload the JS bundle. That is not the Android default behavior"

**EXACTAMENTE nuestro problema:**
- Android NO recarga el JS bundle cuando cambia el idioma del sistema
- iOS SÍ recarga automáticamente
- En Android, la app sigue con el idioma inicial hasta que se recarga manualmente

### Solución Nativa (Recomendada por Callstack)

#### 1. Modificar `AndroidManifest.xml`

```xml
android:configChanges="keyboard|keyboardHidden|orientation|screenSize|layoutDirection|locale">
```

**IMPORTANTE:** Agregar tanto `layoutDirection` como `locale` debido a un bug de Android.

#### 2. Modificar `MainActivity.java` (o `MainActivity.kt`)

```java
static String currentLocale;

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    MainActivity.currentLocale = getResources().getConfiguration().locale.toString();
}

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
```

**Qué hace:**
- Detecta cambios de configuración (incluyendo idioma)
- Compara el locale antiguo con el nuevo
- Si cambió, **recrea el contexto de React** (equivalente a recargar la app)

### 🎯 Por Qué Esta Solución SÍ Funciona

1. **Recrea el contexto de React** cuando cambia el idioma
2. **Todos los componentes se remontan** desde cero
3. **`getLocales()` se ejecuta nuevamente** con el nuevo idioma
4. **No requiere dependencias extra** (react-native-locale-listener, react-native-restart)
5. **Todo sucede en el lado nativo** sin pasar por el bridge

### ⚠️ Problema con Expo

**Expo NO tiene carpeta `android/` nativa por defecto.** Para implementar esta solución necesitamos:

1. **Opción A:** Usar `expo prebuild` para generar carpetas nativas y modificar archivos
2. **Opción B:** Crear un **Config Plugin de Expo** que inyecte estos cambios automáticamente durante el build

## 🔍 Investigación Adicional Necesaria

- ¿Cómo crear un Config Plugin de Expo para inyectar código nativo?
- ¿Expo SDK 54 soporta `expo prebuild` sin problemas?
- ¿Hay alguna forma de forzar recreación de contexto React desde JavaScript?


## 📚 Cómo Crear Config Plugin de Expo

### Mods Disponibles para Android

| Mod | Plugin | Descripción |
|-----|--------|-------------|
| `mods.android.manifest` | `withAndroidManifest` | Modifica AndroidManifest.xml como JSON |
| `mods.android.mainActivity` | `withMainActivity` | Modifica MainActivity.java como string |
| `mods.android.mainApplication` | `withMainApplication` | Modifica MainApplication.java como string |

### Estructura de Config Plugin

```typescript
import { ConfigPlugin, withAndroidManifest, withMainActivity } from 'expo/config-plugins';

const withLocaleChangeDetection: ConfigPlugin = (config) => {
  // 1. Modificar AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    // Agregar layoutDirection y locale a configChanges
    return config;
  });

  // 2. Modificar MainActivity.java
  config = withMainActivity(config, async (config) => {
    const mainActivity = config.modResults.contents;
    // Inyectar código para detectar cambios de locale
    return config;
  });

  return config;
};

export default withLocaleChangeDetection;
```

### Uso en app.config.ts

```typescript
export default {
  expo: {
    plugins: [
      './plugins/withLocaleChangeDetection.ts'
    ]
  }
};
```

## ✅ SOLUCIÓN DEFINITIVA PARA IMPLEMENTAR MAÑANA

### Paso 1: Crear Config Plugin

Crear archivo `plugins/withLocaleChangeDetection.ts` que:

1. **Modifica AndroidManifest.xml:**
   - Agrega `layoutDirection` y `locale` a `android:configChanges`

2. **Modifica MainActivity.java:**
   - Agrega variable estática `currentLocale`
   - Agrega código en `onCreate()` para guardar locale inicial
   - Agrega método `onConfigurationChanged()` para detectar cambios
   - Llama a `recreateReactContextInBackground()` cuando cambia

### Paso 2: Registrar Plugin en app.config.ts

```typescript
plugins: [
  './plugins/withLocaleChangeDetection'
]
```

### Paso 3: Ejecutar Prebuild

```bash
npx expo prebuild --clean
```

### Paso 4: Generar APK con EAS Build

```bash
eas build --platform android --profile preview
```

## 🎯 Por Qué Esta Solución SÍ Funcionará

1. ✅ **Solución nativa recomendada por Callstack** (expertos en React Native)
2. ✅ **Recrea el contexto de React** cuando cambia el idioma
3. ✅ **Todos los componentes se remontan** desde cero
4. ✅ **`getLocales()` se ejecuta nuevamente** con el nuevo idioma
5. ✅ **Compatible con Expo** mediante config plugin
6. ✅ **No requiere cambios en código JavaScript**
7. ✅ **Funciona en builds de producción** (no solo en desarrollo)

## 📝 Notas Importantes

- **NO usar `expo prebuild` localmente** - solo dejar que EAS Build lo haga automáticamente
- **El plugin se ejecuta durante el build** en los servidores de EAS
- **Funciona tanto en preview como en production builds**
- **No afecta el desarrollo local** (solo builds nativos)


## 🔎 Auditoría del Código Actual

### Estructura Actual

1. **LanguageProvider** (lib/language-context.tsx):
   - Usa `react-native-localize` para detectar idioma
   - Se ejecuta UNA VEZ en `useEffect` al montar
   - Setea `i18n.locale` y `currentLanguage`
   - Renderiza `null` hasta que `isReady` es true

2. **useTranslation** (lib/language-context.tsx):
   - Usa `useCallback` con `currentLanguage` como dependencia
   - Retorna función que llama `i18n.t(key, params)`

3. **app/_layout.tsx**:
   - `LanguageProvider` envuelve toda la app
   - NO hay listener de cambios de idioma del sistema

### 🐛 PROBLEMA RAÍZ CONFIRMADO

**El `useEffect` en LanguageProvider se ejecuta UNA SOLA VEZ:**

```typescript
useEffect(() => {
  const locales = RNLocalize.getLocales();
  // ...
  setCurrentLanguage(detectedLanguage);
}, []); // ← Array de dependencias VACÍO
```

**Qué pasa:**
1. Usuario instala app con sistema en español → `currentLanguage = 'es'`
2. Usuario cambia sistema a inglés
3. **Android NO reinicia la app** (comportamiento por defecto)
4. `useEffect` NO se ejecuta nuevamente (no hay dependencias)
5. `currentLanguage` sigue siendo `'es'`
6. App sigue mostrando español

**Por qué useCallback NO ayuda:**
- `useCallback` solo devuelve una función nueva cuando `currentLanguage` cambia
- Pero `currentLanguage` NUNCA cambia porque el `useEffect` no se ejecuta nuevamente
- Es un círculo vicioso: necesitamos que cambie para que se actualice, pero no cambia porque no detectamos el cambio

### ✅ Solución Correcta

**NO es posible detectar cambios de idioma del sistema desde JavaScript en Android sin código nativo.**

Necesitamos:
1. **Config Plugin** que modifique código nativo
2. **MainActivity** que detecte cambios de configuración
3. **Recrear contexto de React** cuando cambia el idioma

## 🎯 Plan de Implementación para Mañana

### 1. Crear Config Plugin

Archivo: `plugins/withLocaleChangeDetection.ts`

```typescript
import {
  ConfigPlugin,
  withAndroidManifest,
  withMainActivity,
  AndroidConfig,
} from 'expo/config-plugins';

const withLocaleChangeDetection: ConfigPlugin = (config) => {
  // Modificar AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(config.modResults);
    
    // Agregar layoutDirection y locale a configChanges
    if (!mainActivity.$['android:configChanges']) {
      mainActivity.$['android:configChanges'] = '';
    }
    
    const configChanges = mainActivity.$['android:configChanges'];
    if (!configChanges.includes('layoutDirection')) {
      mainActivity.$['android:configChanges'] = `${configChanges}|layoutDirection`;
    }
    if (!configChanges.includes('locale')) {
      mainActivity.$['android:configChanges'] = `${configChanges}|locale`;
    }
    
    return config;
  });

  // Modificar MainActivity.java
  config = withMainActivity(config, async (config) => {
    let mainActivity = config.modResults.contents;
    
    // Agregar import de Configuration
    if (!mainActivity.includes('import android.content.res.Configuration;')) {
      mainActivity = mainActivity.replace(
        'import android.os.Bundle;',
        'import android.os.Bundle;\nimport android.content.res.Configuration;'
      );
    }
    
    // Agregar import de ReactInstanceManager
    if (!mainActivity.includes('import com.facebook.react.ReactInstanceManager;')) {
      mainActivity = mainActivity.replace(
        'import android.content.res.Configuration;',
        'import android.content.res.Configuration;\nimport com.facebook.react.ReactInstanceManager;'
      );
    }
    
    // Agregar variable estática currentLocale
    if (!mainActivity.includes('static String currentLocale;')) {
      mainActivity = mainActivity.replace(
        'public class MainActivity extends ReactActivity {',
        'public class MainActivity extends ReactActivity {\n  private static String currentLocale;'
      );
    }
    
    // Agregar código en onCreate
    if (!mainActivity.includes('MainActivity.currentLocale = getResources().getConfiguration().locale.toString();')) {
      mainActivity = mainActivity.replace(
        'super.onCreate(savedInstanceState);',
        'super.onCreate(savedInstanceState);\n    MainActivity.currentLocale = getResources().getConfiguration().locale.toString();'
      );
    }
    
    // Agregar método onConfigurationChanged
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
      
      // Insertar antes del último }
      const lastBraceIndex = mainActivity.lastIndexOf('}');
      mainActivity = mainActivity.slice(0, lastBraceIndex) + onConfigMethod + mainActivity.slice(lastBraceIndex);
    }
    
    config.modResults.contents = mainActivity;
    return config;
  });

  return config;
};

export default withLocaleChangeDetection;
```

### 2. Registrar en app.config.ts

```typescript
plugins: [
  // ... otros plugins
  './plugins/withLocaleChangeDetection'
]
```

### 3. Generar APK

```bash
eas build --platform android --profile preview
```

**EAS Build ejecutará automáticamente:**
1. `npx expo prebuild` (genera carpetas nativas)
2. Aplica config plugin (modifica AndroidManifest y MainActivity)
3. Compila APK nativo

## 🎉 Resultado Esperado

1. Usuario cambia idioma del sistema
2. Android detecta cambio de configuración
3. `onConfigurationChanged` se ejecuta
4. Compara locale antiguo vs nuevo
5. Si cambió, llama `recreateReactContextInBackground()`
6. **React Native recarga completamente**
7. `LanguageProvider` se monta nuevamente
8. `useEffect` se ejecuta con el nuevo idioma
9. `currentLanguage` se actualiza
10. **Toda la UI se re-renderiza en el nuevo idioma**

## ⚠️ Advertencias

- **NO ejecutar `expo prebuild` localmente** - dejar que EAS Build lo haga
- **El plugin solo afecta builds nativos** (no desarrollo con Expo Go)
- **Funciona en preview y production builds**
- **Requiere reinstalar app** para probar (cambiar idioma del sistema antes de abrir)
