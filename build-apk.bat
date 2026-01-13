@echo off
REM Script de Compilacion Automatizada - MIB2 USB Controller
REM Windows Batch Script

echo ========================================
echo MIB2 USB Controller - Build Script
echo ========================================
echo.

REM Verificar Node.js
echo [1/7] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Descargalo desde: https://nodejs.org/
    pause
    exit /b 1
)
echo OK - Node.js instalado
echo.

REM Verificar pnpm
echo [2/7] Verificando pnpm...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ADVERTENCIA: pnpm no esta instalado
    echo Instalando pnpm...
    npm install -g pnpm
)
echo OK - pnpm instalado
echo.

REM Instalar dependencias
echo [3/7] Instalando dependencias...
pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)
echo OK - Dependencias instaladas
echo.

REM Generar proyecto nativo
echo [4/7] Generando proyecto nativo de Android...
npx expo prebuild --platform android --clean
if %errorlevel% neq 0 (
    echo ERROR: Fallo la generacion del proyecto nativo
    pause
    exit /b 1
)
echo OK - Proyecto nativo generado
echo.

REM Verificar ANDROID_HOME
echo [5/7] Verificando Android SDK...
if not defined ANDROID_HOME (
    echo ADVERTENCIA: ANDROID_HOME no esta configurado
    echo Intentando detectar automaticamente...
    set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
)
if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo ERROR: Android SDK no encontrado
    echo Instala Android Studio desde: https://developer.android.com/studio
    pause
    exit /b 1
)
echo OK - Android SDK encontrado en: %ANDROID_HOME%
echo.

REM Crear local.properties
echo [6/7] Configurando Android SDK path...
echo sdk.dir=%ANDROID_HOME:\=/% > android\local.properties
echo OK - Configuracion creada
echo.

REM Compilar APK
echo [7/7] Compilando APK...
echo Esto puede tardar varios minutos...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Fallo la compilacion del APK
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo BUILD EXITOSO
echo ========================================
echo.
echo APK generado en:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Para instalar en dispositivo:
echo 1. Conecta tu dispositivo Android por USB
echo 2. Habilita "Depuracion USB" en Opciones de Desarrollador
echo 3. Ejecuta: adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
