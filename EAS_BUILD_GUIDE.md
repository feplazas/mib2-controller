# Guía de Compilación con EAS Build

Esta guía te permitirá compilar el APK de **MIB2 Controller** usando EAS Build (Expo Application Services) sin necesidad de Android Studio ni computador.

## 📋 Requisitos

1. **Cuenta de Expo** (gratis)
   - Regístrate en: https://expo.dev/signup
   - Anota tu usuario y contraseña

2. **Terminal con Node.js** (una de estas opciones):
   - **Termux** en Android (recomendado para celular)
   - Terminal en computador
   - Terminal web en navegador

3. **Conexión a Internet** estable (la compilación tarda 5-15 minutos)

---

## 🚀 Opción 1: Desde Termux (Android)

### Paso 1: Instalar Termux

1. Descarga **Termux** desde F-Droid (no usar Google Play, versión desactualizada):
   - https://f-droid.org/en/packages/com.termux/
2. Abre Termux

### Paso 2: Instalar Node.js y pnpm

```bash
# Actualizar paquetes
pkg update && pkg upgrade -y

# Instalar Node.js
pkg install nodejs-lts -y

# Instalar pnpm
npm install -g pnpm

# Verificar instalación
node --version
pnpm --version
```

### Paso 3: Descargar el Proyecto

Tienes dos opciones:

**Opción A: Descargar desde Manus**
1. Descarga el proyecto desde el checkpoint: `manus-webdev://4c7ad9b6`
2. Extrae el ZIP en tu almacenamiento
3. En Termux:
```bash
cd /sdcard/Download/mib2_controller
# o la ruta donde lo extraíste
```

**Opción B: Clonar desde repositorio (si tienes uno)**
```bash
git clone <tu-repositorio>
cd mib2_controller
```

### Paso 4: Instalar Dependencias

```bash
pnpm install
```

### Paso 5: Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Paso 6: Login en Expo

```bash
eas login
```

Te pedirá:
- **Username or email**: Tu usuario de Expo
- **Password**: Tu contraseña

### Paso 7: Configurar el Proyecto

```bash
eas build:configure
```

Responde:
- **Platform**: Selecciona `Android`
- **Create eas.json**: `Yes` (si no existe)

### Paso 8: Compilar el APK

```bash
eas build --platform android --profile preview
```

**Qué hace este comando:**
- Sube tu código a los servidores de Expo
- Ejecuta `npx expo prebuild` en la nube
- Compila el módulo nativo USB Host con Gradle
- Genera el APK firmado
- Te da un link de descarga

**Tiempo estimado:** 5-15 minutos

### Paso 9: Descargar e Instalar

1. Una vez terminado, verás un mensaje como:
   ```
   ✔ Build finished
   📦 https://expo.dev/artifacts/eas/abc123xyz.apk
   ```

2. Abre ese link en tu navegador
3. Descarga el APK
4. Instala el APK en tu teléfono
   - Puede pedir "Permitir instalación de fuentes desconocidas"
   - Actívalo en Configuración → Seguridad

---

## 🚀 Opción 2: Desde Computador

### Paso 1: Instalar Node.js

Descarga e instala Node.js desde: https://nodejs.org/

### Paso 2: Descargar el Proyecto

Descarga el proyecto desde el checkpoint y extráelo.

### Paso 3: Abrir Terminal

- **Windows**: PowerShell o CMD
- **Mac/Linux**: Terminal

```bash
cd /ruta/al/proyecto/mib2_controller
```

### Paso 4: Instalar Dependencias

```bash
npm install -g pnpm
pnpm install
```

### Paso 5: Instalar EAS CLI y Login

```bash
npm install -g eas-cli
eas login
```

### Paso 6: Compilar

```bash
eas build --platform android --profile preview
```

### Paso 7: Descargar APK

Cuando termine, descarga el APK del link que te da y transfiérelo a tu teléfono Android.

---

## 🔧 Perfiles de Build Disponibles

El archivo `eas.json` tiene 3 perfiles:

### 1. `preview` (Recomendado)
```bash
eas build --platform android --profile preview
```
- Genera APK instalable
- Sin firma de Google Play
- Ideal para pruebas

### 2. `development`
```bash
eas build --platform android --profile development
```
- APK de desarrollo con hot reload
- Requiere Expo Go o dev client

### 3. `production`
```bash
eas build --platform android --profile production
```
- APK optimizado para producción
- Listo para Google Play Store

---

## 📱 Después de Instalar

1. Abre **MIB2 Controller**
2. Ve a la pestaña **"USB"**
3. Conecta tu adaptador USB-Ethernet con cable OTG
4. Presiona **"🔍 Escanear Dispositivos USB"**
5. Deberías ver tu adaptador con VID/PID
6. Presiona **"Conectar a este dispositivo"**
7. Acepta los permisos USB
8. Presiona **"Test EEPROM"** para validar

---

## ❓ Troubleshooting

### Error: "Expo account required"
**Solución:** Ejecuta `eas login` y verifica tus credenciales.

### Error: "Build failed"
**Solución:** Revisa los logs en el dashboard de Expo:
- https://expo.dev/accounts/[tu-usuario]/projects/mib2_controller/builds

### Error: "No Android SDK"
**Solución:** EAS Build usa sus propios servidores, no necesitas Android SDK local.

### El APK no se instala
**Solución:** 
1. Ve a Configuración → Seguridad
2. Activa "Fuentes desconocidas" o "Instalar apps desconocidas"
3. Permite instalación desde el navegador/gestor de archivos

### Build tarda mucho
**Solución:** La primera compilación tarda más (10-15 min). Las siguientes son más rápidas (5-8 min).

---

## 💰 Límites del Plan Gratuito

Expo ofrece builds gratuitos con límites:
- **30 builds/mes** para proyectos personales
- **Ilimitados** para proyectos open source

Si necesitas más, considera:
- Plan Priority: $29/mes (builds ilimitados)
- O compila localmente con Android Studio

---

## 🎯 Comandos Útiles

```bash
# Ver estado de builds
eas build:list

# Cancelar build en progreso
eas build:cancel

# Ver detalles de un build
eas build:view [build-id]

# Configurar credenciales Android
eas credentials

# Limpiar caché
eas build:configure --clear-cache
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en https://expo.dev
2. Consulta la documentación oficial: https://docs.expo.dev/build/introduction/
3. Foro de Expo: https://forums.expo.dev/

---

**¡Listo! Una vez que tengas el APK instalado, podrás probar la detección USB con tu adaptador físico. 🚀**
