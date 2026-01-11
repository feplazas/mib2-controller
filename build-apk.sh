#!/bin/bash

echo "========================================="
echo "  MIB2 Controller - Build Script"
echo "========================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar Node.js
echo -e "${BLUE}[1/5]${NC} Verificando Node.js..."
node --version || { echo -e "${RED}Error: Node.js no encontrado${NC}"; exit 1; }
echo -e "${GREEN}✓ Node.js instalado${NC}"
echo ""

# Verificar Java
echo -e "${BLUE}[2/5]${NC} Verificando Java..."
java -version || { echo -e "${RED}Error: Java no encontrado${NC}"; exit 1; }
echo -e "${GREEN}✓ Java instalado${NC}"
echo ""

# Instalar dependencias
echo -e "${BLUE}[3/5]${NC} Instalando dependencias..."
pnpm install || { echo -e "${RED}Error instalando dependencias${NC}"; exit 1; }
echo -e "${GREEN}✓ Dependencias instaladas${NC}"
echo ""

# Ejecutar prebuild
echo -e "${BLUE}[4/5]${NC} Generando proyecto Android nativo..."
npx expo prebuild --platform android --clean || { echo -e "${RED}Error en prebuild${NC}"; exit 1; }
echo -e "${GREEN}✓ Proyecto Android generado${NC}"
echo ""

# Compilar APK
echo -e "${BLUE}[5/5]${NC} Compilando APK (esto puede tardar 10-15 minutos)..."
cd android
./gradlew assembleRelease || { echo -e "${RED}Error compilando APK${NC}"; exit 1; }
cd ..

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  ✓ COMPILACIÓN EXITOSA${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "APK generado en:"
echo "  android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "Para descargar el APK:"
echo "  1. Haz clic derecho en el archivo"
echo "  2. Selecciona 'Download'"
echo ""
