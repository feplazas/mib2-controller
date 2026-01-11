# 🚀 Guía de Compilación en GitHub Codespaces (desde celular)

Esta guía te permite compilar el APK de **MIB2 Controller** completamente desde tu celular usando GitHub Codespaces.

---

## 📋 Requisitos

- ✅ Cuenta de GitHub (ya la tienes)
- ✅ Navegador web en tu celular
- ✅ Conexión a Internet estable
- ✅ 60 horas gratis de Codespaces al mes

---

## 📦 Paso 1: Subir el Proyecto a GitHub

### Opción A: Desde la interfaz web (MÁS FÁCIL)

1. **Descarga el proyecto**
   - Descarga el checkpoint `manus-webdev://7c5e0a66`
   - Extrae el archivo ZIP

2. **Crea un nuevo repositorio**
   - Ve a: https://github.com/new
   - Nombre: `mib2-controller`
   - Visibilidad: **Public** (para usar Codespaces gratis)
   - ✅ Marca "Add a README file"
   - Clic en **"Create repository"**

3. **Sube los archivos**
   - En tu repositorio, clic en **"Add file" → "Upload files"**
   - Arrastra todos los archivos del proyecto
   - Clic en **"Commit changes"**

### Opción B: Desde Termux (si prefieres)

```bash
cd /sdcard/Download/mib2_controller
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/mib2-controller.git
git push -u origin main
```

---

## 🌐 Paso 2: Abrir GitHub Codespaces

1. **Ve a tu repositorio**
   - https://github.com/TU-USUARIO/mib2-controller

2. **Abre Codespaces**
   - Clic en el botón verde **"Code"**
   - Selecciona la pestaña **"Codespaces"**
   - Clic en **"Create codespace on main"**

3. **Espera a que cargue** (1-2 minutos)
   - Se abrirá un VS Code en tu navegador
   - Verás una terminal en la parte inferior

---

## ⚙️ Paso 3: Compilar el APK

En la terminal de Codespaces, ejecuta estos comandos:

### Comando 1: Dar permisos al script

```bash
chmod +x build-apk.sh
```

### Comando 2: Ejecutar compilación

```bash
./build-apk.sh
```

**Esto hará:**
- ✅ Verificar Node.js y Java
- ✅ Instalar dependencias (pnpm install)
- ✅ Generar proyecto Android (expo prebuild)
- ✅ Compilar APK (gradle assembleRelease)

**Tiempo estimado:** 10-15 minutos

### Comando 3 (Opcional): Verificar el APK

```bash
ls -lh android/app/build/outputs/apk/release/
```

Deberías ver: `app-release.apk`

---

## 📥 Paso 4: Descargar el APK

### Método 1: Desde el explorador de archivos

1. En el panel izquierdo de Codespaces, navega a:
   ```
   android/app/build/outputs/apk/release/
   ```

2. Haz clic derecho en `app-release.apk`

3. Selecciona **"Download"**

4. El APK se descargará a tu celular

### Método 2: Desde la terminal

```bash
# Copiar APK a la raíz del proyecto
cp android/app/build/outputs/apk/release/app-release.apk ./MIB2-Controller.apk

# Ahora descárgalo desde la raíz
```

---

## 📱 Paso 5: Instalar el APK

1. **Abre el archivo descargado** en tu celular

2. **Permite instalación de fuentes desconocidas**
   - Android te pedirá permiso
   - Ve a Configuración → Seguridad
   - Activa "Fuentes desconocidas" o "Instalar apps desconocidas"

3. **Instala la app**

4. **Abre MIB2 Controller**

---

## 🧪 Paso 6: Probar la App

1. **Conecta tu adaptador USB-Ethernet** al celular (con cable OTG)

2. **Abre la app** y ve a la pestaña **"USB"**

3. **Presiona "Escanear Dispositivos USB"**

4. Deberías ver tu adaptador con VID/PID

5. **Presiona "Conectar"** y acepta los permisos

6. **Presiona "Test EEPROM"** para validar que funciona

---

## ❓ Troubleshooting

### Error: "Prebuild failed"

**Solución:**
```bash
# Limpiar y reintentar
rm -rf android node_modules
pnpm install
./build-apk.sh
```

### Error: "Gradle build failed"

**Solución:**
```bash
cd android
./gradlew clean
./gradlew assembleRelease
cd ..
```

### Error: "Out of memory"

**Solución:** Codespaces gratuito tiene RAM limitada. Intenta:
```bash
# Compilar con menos memoria
cd android
./gradlew assembleRelease --max-workers=1
cd ..
```

### No puedo descargar el APK

**Solución alternativa:**
```bash
# Subir APK a un servicio de archivos
# Instala transfer.sh
curl --upload-file android/app/build/outputs/apk/release/app-release.apk https://transfer.sh/MIB2-Controller.apk
```

Te dará un link para descargar el APK.

---

## 💰 Límites de Codespaces Gratuito

- **60 horas/mes** de uso
- **15 GB** de almacenamiento
- **2 cores** de CPU
- **4 GB** de RAM

Suficiente para compilar varias veces al mes.

---

## 🔄 Compilaciones Futuras

Una vez que tengas el repositorio en GitHub:

1. Abre Codespaces (1 clic)
2. Ejecuta `./build-apk.sh`
3. Descarga el APK

**Tiempo total:** 15 minutos

---

## 📞 Soporte

Si algo falla:

1. Revisa la sección de Troubleshooting
2. Copia el error completo de la terminal
3. Busca el error en Google o Stack Overflow
4. Verifica que tu cuenta de GitHub tenga Codespaces habilitado

---

## 🎉 ¡Listo!

Una vez instalada la app:

- ✅ Conecta tu adaptador USB
- ✅ Detecta dispositivos en pestaña USB
- ✅ Prueba spoofing en modo Dry Run
- ✅ Conecta a MIB2 por Telnet
- ✅ Ejecuta comandos y macros

**¡Disfruta tu MIB2 Controller!** 🚗💨
