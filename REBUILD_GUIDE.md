# Guía de Rebuild - MIB2 Controller con USB Nativo

Esta guía te ayudará a compilar la aplicación con el módulo nativo USB Host para Android.

## ⚠️ Requisitos Previos

1. **Android Studio** instalado con Android SDK
2. **Node.js** 18+ y **pnpm** instalados
3. **Dispositivo Android físico** con:
   - Android 6.0+ (API 23+)
   - USB OTG habilitado
   - Modo de Desarrollador activado
   - Depuración USB habilitada
4. **Adaptador USB-Ethernet** conectado al teléfono (preferiblemente ASIX AX88772/A/B)

## 📋 Pasos de Compilación

### 1. Instalar Dependencias

```bash
cd mib2_controller
pnpm install
```

### 2. Limpiar Build Anterior (si existe)

```bash
rm -rf android/ ios/
```

### 3. Generar Proyecto Nativo (Prebuild)

Este paso genera el proyecto Android nativo con el módulo USB Host integrado:

```bash
npx expo prebuild --clean --platform android
```

**Qué hace este comando:**
- Genera el directorio `android/` con el proyecto Android nativo
- Aplica el plugin `withUsbHost` que configura permisos USB
- Integra el módulo nativo `expo-usb-host` con código Kotlin
- Configura AndroidManifest.xml con permisos y features USB

### 4. Conectar Dispositivo Android

Conecta tu teléfono Android por USB al computador y verifica que esté detectado:

```bash
adb devices
```

Deberías ver algo como:
```
List of devices attached
ABC123XYZ    device
```

### 5. Compilar e Instalar en el Dispositivo

```bash
npx expo run:android
```

**Este comando:**
- Compila el proyecto Android con Gradle
- Compila el módulo nativo Kotlin `ExpoUsbHostModule`
- Instala el APK en el dispositivo conectado
- Inicia la app automáticamente
- Abre Metro bundler para hot reload

**Tiempo estimado:** 3-5 minutos en la primera compilación, 30-60 segundos en compilaciones subsecuentes.

### 6. Verificar Instalación

Una vez que la app se abra en tu teléfono:

1. Ve a la pestaña **"USB"** (nueva pestaña de diagnóstico)
2. Presiona **"🔍 Escanear Dispositivos USB"**
3. Si el adaptador está conectado, deberías ver:
   - Nombre del dispositivo
   - VID/PID (ejemplo: `VID: 0x0B95, PID: 0x7720`)
   - Información del fabricante
   - Estado de compatibilidad

## 🔧 Troubleshooting

### No se detectan dispositivos USB

**Problema:** La app muestra "No se encontraron dispositivos USB"

**Soluciones:**
1. Verifica que el adaptador esté conectado con cable OTG
2. Algunos adaptadores requieren hub USB con alimentación externa
3. Revisa que el adaptador no esté defectuoso (prueba en PC)
4. Verifica en Configuración Android → Aplicaciones → MIB2 Controller → Permisos que tenga acceso a USB

### Error de compilación Gradle

**Problema:** `FAILURE: Build failed with an exception`

**Soluciones:**
1. Limpia el build:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```
2. Vuelve a ejecutar `npx expo run:android`

### Error "SDK location not found"

**Problema:** Android SDK no está configurado

**Solución:**
1. Crea el archivo `android/local.properties`:
   ```properties
   sdk.dir=/ruta/a/tu/Android/Sdk
   ```
2. En Linux/Mac típicamente: `/home/usuario/Android/Sdk`
3. En Windows típicamente: `C:\\Users\\Usuario\\AppData\\Local\\Android\\Sdk`

### Error de permisos USB

**Problema:** La app no puede acceder al dispositivo USB

**Solución:**
1. La app debe solicitar permiso automáticamente al presionar "Conectar"
2. Si no aparece el diálogo, ve a Configuración → Aplicaciones → MIB2 Controller → Permisos
3. Asegúrate de que "Acceso a dispositivos USB" esté habilitado

### Metro bundler no se conecta

**Problema:** La app muestra pantalla roja "Could not connect to Metro"

**Solución:**
1. Verifica que el teléfono y la PC estén en la misma red WiFi
2. O configura port forwarding:
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

## 🧪 Probar el Módulo USB

### Test Básico: Detección de Dispositivos

1. Abre la app
2. Ve a la pestaña **"USB"**
3. Presiona **"Escanear Dispositivos USB"**
4. Verifica que aparezca tu adaptador con VID/PID correctos

### Test Avanzado: Control Transfer (Lectura EEPROM)

1. En la pestaña USB, presiona **"Conectar a este dispositivo"** en tu adaptador
2. Acepta el permiso USB cuando Android lo solicite
3. Una vez conectado, presiona **"Test EEPROM"**
4. Si funciona, verás un Alert con los primeros 16 bytes de EEPROM en hexadecimal

**Ejemplo de salida exitosa:**
```
Primeros 16 bytes:

95 0b 20 77 00 00 00 00 00 00 00 00 00 00 00 00

Esto confirma que el control transfer funciona correctamente.
```

### Test Completo: Spoofing

1. Ve a la pestaña **"Spoofing"**
2. Presiona **"Detectar Adaptador"**
3. Sigue el asistente paso a paso
4. Usa **"Dry Run Mode"** primero para simular sin escribir
5. Si todo se ve bien, ejecuta el spoofing real

## 📱 Desarrollo Continuo

### Hot Reload

Una vez compilada la app, puedes editar código TypeScript/JavaScript y los cambios se aplicarán automáticamente sin recompilar:

```bash
# En otra terminal
npx expo start --dev-client
```

### Recompilar Solo Cuando Sea Necesario

**NO necesitas recompilar si cambias:**
- Código TypeScript/JavaScript
- Estilos CSS/Tailwind
- Componentes React

**SÍ necesitas recompilar si cambias:**
- Código Kotlin en `modules/expo-usb-host/android/`
- Configuración de `app.config.ts` (permisos, plugins)
- Configuración de `plugins/withUsbHost.ts`
- Dependencias nativas en `package.json`

Para recompilar:
```bash
npx expo run:android
```

## 🚀 Build de Producción (APK)

Para generar un APK instalable:

```bash
cd android
./gradlew assembleRelease
```

El APK estará en:
```
android/app/build/outputs/apk/release/app-release.apk
```

**Nota:** Para distribución en Google Play, necesitas firmar el APK con tu keystore.

## 📊 Logs de Depuración

Para ver logs del módulo nativo en tiempo real:

```bash
adb logcat | grep -i "usb\|ExpoUsbHost"
```

Logs útiles:
- `[UsbService]` - Logs del servicio USB TypeScript
- `[ExpoUsbHost]` - Logs del módulo nativo Kotlin
- `[UsbDiag]` - Logs de la pantalla de diagnóstico

## 🎯 Próximos Pasos

Una vez que la detección USB funcione:

1. ✅ **Verificar VID/PID** de tu adaptador en la pestaña USB
2. ✅ **Probar lectura EEPROM** con el botón "Test EEPROM"
3. ✅ **Ejecutar Dry Run** del spoofing para simular cambios
4. ✅ **Hacer backup** de EEPROM antes de cualquier modificación
5. ✅ **Ejecutar spoofing real** solo si todos los tests pasan
6. ✅ **Reconectar adaptador** para que MIB2 lo reconozca

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs con `adb logcat`
2. Verifica que el adaptador funcione en PC
3. Prueba con otro cable OTG
4. Consulta la documentación de Android USB Host API
5. Revisa el código Kotlin en `modules/expo-usb-host/android/src/main/java/expo/modules/usbhost/`

---

**¡Buena suerte con el rebuild! 🚀**
