#!/bin/bash
# Script para sincronizar dependencias correctamente

echo "🔧 Limpiando instalación anterior..."
rm -rf node_modules pnpm-lock.yaml

echo "📥 Descargando archivos actualizados del repositorio..."
git fetch origin
git checkout origin/main -- pnpm-lock.yaml package.json

echo "📦 Instalando dependencias..."
pnpm install

echo "✅ Verificando con expo doctor..."
npx expo-doctor

echo ""
echo "✅ Si expo doctor pasa 17/17, ejecuta:"
echo "   eas build --platform android --profile production-apk"
echo ""
echo "📝 Nota: eslint-config-expo está excluido de validación en package.json"
echo "   para evitar falsos positivos en la validación de dependencias."
