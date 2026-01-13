# Generar AAB para Google Play Store

Este documento explica cómo generar el **Android App Bundle (AAB)** final para publicación en Google Play Store.

---

## 📦 ¿Qué es un AAB?

**Android App Bundle (AAB)** es el formato de publicación recomendado por Google Play Store.

**Ventajas sobre APK:**
- ✅ **Tamaño más pequeño:** Google genera APKs optimizados por dispositivo
- ✅ **Mejor rendimiento:** Solo descarga recursos necesarios
- ✅ **Obligatorio:** Google Play requiere AAB para nuevas apps desde agosto 2021
- ✅ **Dynamic Delivery:** Módulos bajo demanda

---

## 🚀 Comando para Generar AAB

### Opción 1: Con EAS Build (RECOMENDADO)

```bash
cd /home/ubuntu/mib2_controller

# Configurar token de Expo
export EXPO_TOKEN="TU_TOKEN_AQUI"

# Generar AAB para producción
eas build --platform android --profile production --non-interactive
```

**Características del build de producción:**
- ✅ ProGuard/R8 habilitado (ofuscación)
- ✅ Recursos optimizados (shrinkResources)
- ✅ Firmado automático con keystore de EAS
- ✅ Formato AAB (no APK)
- ✅ Listo para Play Store

**Tiempo estimado:** 10-20 minutos

---

### Opción 2: Build Local (Avanzado)

```bash
cd /home/ubuntu/mib2_controller

# Generar proyecto Android nativo
npx expo prebuild --platform android

# Compilar AAB
cd android
./gradlew bundleRelease

# AAB generado en:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Nota:** Requiere configurar keystore manualmente para signing.

---

## 📋 Configuración de Build de Producción

El archivo `eas.json` ya está configurado:

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle",
        "withoutCredentials": false
      },
      "env": {
        "GRADLE_OPTS": "-Dorg.gradle.daemon=false -Dorg.gradle.jvmargs=-Xmx4096m"
      }
    }
  }
}
```

**Detalles:**
- `distribution: "store"` → Para Google Play Store
- `buildType: "app-bundle"` → Genera AAB (no APK)
- `withoutCredentials: false` → Usa keystore de EAS
- `GRADLE_OPTS` → Optimización de memoria y timeouts

---

## 🔐 Signing (Firma)

### EAS Maneja el Signing Automáticamente

EAS Build genera y almacena tu keystore de forma segura:

- **Keystore:** Build Credentials u0sZn_81IL (default)
- **Algoritmo:** RSA 2048-bit
- **Validez:** 25 años
- **Almacenamiento:** Servidores seguros de Expo

**No necesitas:**
- ❌ Generar keystore manualmente
- ❌ Configurar `android/app/build.gradle`
- ❌ Guardar contraseñas
- ❌ Preocuparte por perder el keystore

---

## 📥 Descargar el AAB

Una vez completado el build:

1. **Desde la terminal:**
   ```
   ✅ Build finished
   
   Android app bundle:
   https://expo.dev/artifacts/eas/[ID].aab
   ```

2. **Desde el navegador:**
   - Ve a https://expo.dev/accounts/feplazas/projects/mib2_controller/builds
   - Busca el build de producción
   - Click en "Download"

3. **Tamaño esperado:**
   - APK: ~40-50 MB
   - AAB: ~30-40 MB (más pequeño)

---

## ✅ Verificar el AAB

Antes de subir a Play Console:

### 1. Verificar Firma

```bash
# Instalar bundletool (si no lo tienes)
wget https://github.com/google/bundletool/releases/download/1.15.6/bundletool-all-1.15.6.jar -O bundletool.jar

# Verificar firma del AAB
jarsigner -verify -verbose -certs app-release.aab

# Debe mostrar: "jar verified"
```

### 2. Inspeccionar Contenido

```bash
# Generar APKs desde el AAB para testing
java -jar bundletool.jar build-apks \
  --bundle=app-release.aab \
  --output=app-release.apks \
  --mode=universal

# Extraer APK universal
unzip app-release.apks -d apks/
```

### 3. Verificar Tamaño

```bash
ls -lh app-release.aab

# Debe ser menor que el APK (30-40 MB)
```

### 4. Verificar ProGuard

```bash
# Descomprimir AAB
unzip app-release.aab -d aab_contents/

# Verificar que las clases estén ofuscadas
cat aab_contents/base/dex/classes.dex | strings | grep "mib2controller"

# Si ProGuard funciona, verás nombres ofuscados (a, b, c, etc.)
```

---

## 📤 Subir a Play Console

### Paso 1: Crear Release

1. Ve a https://play.google.com/console
2. Selecciona tu app
3. Ve a **Release → Testing → Internal testing**
4. Click en **Create new release**

### Paso 2: Subir AAB

1. Click en **Upload**
2. Selecciona `app-release.aab`
3. Espera a que se procese (1-2 minutos)

### Paso 3: Completar Release Notes

```
Version 1.0.0 - Initial Release

Features:
• Automatic USB-Ethernet adapter detection
• Network scanner for MIB2 units
• Direct Telnet connection
• MIB2 Toolbox installer with guided steps
• FEC code generator
• Real-time diagnostics
• Automatic backup system
• ProGuard/R8 code obfuscation

Requirements:
• Android device with USB OTG support
• USB-Ethernet adapter (ASIX AX88772 recommended)
• MIB2 infotainment unit with Telnet access
```

### Paso 4: Guardar y Revisar

1. Click en **Save**
2. Click en **Review release**
3. Verifica que todo esté correcto
4. Click en **Start rollout to Internal testing**

---

## 🧪 Internal Testing

Antes de publicar en producción:

### 1. Crear Lista de Testers

1. Ve a **Testing → Internal testing → Testers**
2. Crea una lista de emails
3. Agrega tu email y el de colaboradores

### 2. Compartir Link de Testing

```
https://play.google.com/apps/internaltest/[ID]
```

### 3. Probar en Dispositivos Reales

- Instala desde Play Store (no sideload)
- Prueba todas las funcionalidades
- Verifica que ProGuard no rompió nada
- Revisa logs de crash (si hay)

### 4. Iterar si es Necesario

Si encuentras bugs:
1. Incrementa `versionCode` en `app.config.ts`
2. Genera nuevo AAB
3. Sube nueva versión a Internal Testing

---

## 🚀 Publicar en Producción

Una vez validado en Internal Testing:

1. Ve a **Release → Production**
2. Click en **Create new release**
3. Selecciona el AAB de Internal Testing (o sube uno nuevo)
4. Completa release notes
5. **Importante:** Asegúrate de que:
   - [ ] Privacy Policy URL configurada
   - [ ] Screenshots subidos (mínimo 2)
   - [ ] Data Safety completado
   - [ ] Clasificación de contenido completada
   - [ ] Países de distribución seleccionados
6. Click en **Review release**
7. Click en **Start rollout to Production**

**Tiempo de revisión:** 3-7 días hábiles

---

## 📊 Diferencias entre Perfiles

| Característica | Preview (APK) | Production (AAB) |
|----------------|---------------|------------------|
| Formato | APK | AAB |
| Destino | Testing interno | Play Store |
| ProGuard/R8 | ✅ Habilitado | ✅ Habilitado |
| Signing | EAS Keystore | EAS Keystore |
| Tamaño | ~40-50 MB | ~30-40 MB |
| Optimización | Completa | Completa |
| Distribución | Sideload | Play Store |

---

## ⚠️ Notas Importantes

### 1. Incrementar Versión

Cada vez que subas un nuevo AAB, incrementa:

```typescript
// app.config.ts
android: {
  versionCode: 2,  // Incrementa esto
}
version: "1.0.1",  // Y esto
```

### 2. Keystore Permanente

**NUNCA pierdas acceso a tu cuenta de Expo.** El keystore está vinculado a tu cuenta.

Si pierdes el keystore:
- ❌ No podrás actualizar la app
- ❌ Tendrás que publicar una nueva app con nuevo package name

### 3. Backup del AAB

Guarda una copia del AAB en lugar seguro:
- Google Drive
- GitHub Releases (privado)
- Backup local

---

## 🔗 Enlaces Útiles

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **AAB Format:** https://developer.android.com/guide/app-bundle
- **Play Console:** https://play.google.com/console
- **Bundletool:** https://github.com/google/bundletool

---

## 🎯 Comando Rápido (Copy-Paste)

```bash
cd /home/ubuntu/mib2_controller && \
export EXPO_TOKEN="TU_TOKEN_AQUI" && \
eas build --platform android --profile production --non-interactive
```

**¡Listo para producción!** 🚀
