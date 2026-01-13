# 🔨 Guía de Compilación Local del APK

Esta guía te permitirá compilar el APK de **MIB2 USB Controller** en tu máquina local con todos los módulos nativos funcionando correctamente.

---

## 📋 Requisitos Previos

### 1. **Node.js y pnpm**
```bash
# Verificar instalación
node --version  # Debe ser v18 o superior
pnpm --version  # Debe ser v9 o superior

# Si no tienes pnpm:
npm install -g pnpm
```

### 2. **Android Studio**
- Descargar desde: https://developer.android.com/studio
- Durante la instalación, asegúrate de instalar:
  - Android SDK
  - Android SDK Platform-Tools
  - Android SDK Build-Tools
  - Android Emulator (opcional)

### 3. **Java Development Kit (JDK)**
```bash
# Verificar instalación
java -version  # Debe ser JDK 17 o superior

# Si no tienes JDK, Android Studio lo instala automáticamente
```

### 4. **Variables de Entorno**

#### **Windows (PowerShell):**
```powershell
# Agregar al PATH (ajustar rutas según tu instalación)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
$env:PATH += ";$env:ANDROID_HOME\tools"
```

#### **macOS/Linux (Bash/Zsh):**
```bash
# Agregar a ~/.bashrc o ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

---

## 🚀 Proceso de Compilación

### **Paso 1: Descargar el Proyecto**

```bash
# Descargar el proyecto desde Manus
# (El proyecto ya está en tu sandbox, descárgalo usando el botón "Download" en la UI)

cd mib2_controller
```

### **Paso 2: Instalar Dependencias**

```bash
pnpm install
```

### **Paso 3: Generar Archivos Nativos de Android**

```bash
npx expo prebuild --platform android --clean
```

Este comando:
- Genera la carpeta `android/` con el proyecto nativo
- Configura el módulo USB nativo (Kotlin)
- Aplica todas las configuraciones de `app.config.ts`

### **Paso 4: Compilar APK de Release**

#### **Opción A: APK de Debug (más rápido, para testing)**
```bash
cd android
./gradlew assembleDebug

# APK generado en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

#### **Opción B: APK de Release (optimizado, para distribución)**
```bash
cd android
./gradlew assembleRelease

# APK generado en:
# android/app/build/outputs/apk/release/app-release.apk
```

### **Paso 5: Instalar en Dispositivo**

#### **Vía ADB (Android Debug Bridge):**
```bash
# Conectar dispositivo Android por USB
# Habilitar "Depuración USB" en Opciones de Desarrollador

# Verificar conexión
adb devices

# Instalar APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

#### **Vía Transferencia Manual:**
1. Copiar el APK a tu dispositivo Android
2. Abrir el archivo APK desde el explorador de archivos
3. Permitir instalación de fuentes desconocidas si es necesario

---

## 🛠️ Solución de Problemas

### **Error: "SDK location not found"**
```bash
# Crear archivo local.properties en android/
echo "sdk.dir=/ruta/a/tu/Android/Sdk" > android/local.properties

# Windows:
echo "sdk.dir=C:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk" > android/local.properties

# macOS:
echo "sdk.dir=/Users/TuUsuario/Library/Android/sdk" > android/local.properties

# Linux:
echo "sdk.dir=/home/TuUsuario/Android/Sdk" > android/local.properties
```

### **Error: "Gradle build failed"**
```bash
# Limpiar caché de Gradle
cd android
./gradlew clean

# Volver a compilar
./gradlew assembleDebug
```

### **Error: "Java version incompatible"**
```bash
# Verificar versión de Java
java -version

# Si es menor a JDK 17, actualizar desde:
# https://www.oracle.com/java/technologies/downloads/
```

### **Error: "Module UsbNative not found"**
Este error es normal en el preview web. El módulo USB solo funciona en APK compilado para Android.

---

## 📱 Testing del APK

### **Funcionalidades a Probar:**

1. **Módulo USB:**
   - Conectar adaptador USB-Ethernet ASIX
   - Verificar detección en pestaña "USB"
   - Ejecutar "Auto Spoof"
   - Verificar cambio de VID/PID

2. **Cliente Telnet:**
   - Conectar adaptador spoofed a MIB2
   - Escanear red en pestaña "Home"
   - Conectar a IP detectada
   - Enviar comandos en pestaña "Commands"

3. **Generador FEC:**
   - Ingresar VIN y VCRN
   - Generar códigos FEC
   - Verificar integración con vwcoding.ru

4. **Instalación Toolbox:**
   - Verificar advertencias críticas
   - Confirmar prerequisitos (USB + Telnet)
   - Probar ejecución de pasos (sin ejecutar parcheo real en testing)

---

## 🔐 Firma del APK (Opcional)

Para distribuir el APK públicamente, debes firmarlo con tu propia keystore:

```bash
# Generar keystore
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Configurar en android/gradle.properties
echo "MYAPP_RELEASE_STORE_FILE=my-release-key.keystore" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_ALIAS=my-key-alias" >> android/gradle.properties
echo "MYAPP_RELEASE_STORE_PASSWORD=tu-password" >> android/gradle.properties
echo "MYAPP_RELEASE_KEY_PASSWORD=tu-password" >> android/gradle.properties

# Compilar APK firmado
cd android
./gradlew assembleRelease
```

---

## 📊 Tamaños Esperados

- **APK Debug:** ~50-70 MB
- **APK Release:** ~30-50 MB (optimizado con ProGuard)

---

## 🆘 Soporte

Si encuentras problemas durante la compilación:

1. **Revisar logs de Gradle:**
   ```bash
   cd android
   ./gradlew assembleDebug --stacktrace
   ```

2. **Verificar configuración de Android Studio:**
   - Tools → SDK Manager → SDK Platforms (Android 13+)
   - Tools → SDK Manager → SDK Tools (Build-Tools, Platform-Tools)

3. **Limpiar proyecto completamente:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   rm -rf android
   npx expo prebuild --platform android --clean
   ```

---

## ✅ Checklist de Compilación

- [ ] Node.js v18+ instalado
- [ ] pnpm instalado
- [ ] Android Studio instalado
- [ ] JDK 17+ instalado
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Proyecto nativo generado (`npx expo prebuild`)
- [ ] APK compilado (`./gradlew assembleDebug`)
- [ ] APK instalado en dispositivo (`adb install`)
- [ ] Funcionalidades USB testeadas
- [ ] Cliente Telnet testeado
- [ ] Generador FEC testeado

---

**Fecha:** 2026-01-13  
**Versión del Proyecto:** 3e895596  
**Plataforma:** Android (React Native + Expo)
