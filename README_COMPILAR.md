# 🚀 Compilar MIB2 Controller desde tu Celular

## Opción Más Rápida: GitHub Codespaces

### 3 Pasos Simples:

1. **Sube este proyecto a GitHub**
   - Ve a https://github.com/new
   - Crea repositorio público llamado `mib2-controller`
   - Sube todos los archivos

2. **Abre Codespaces**
   - En tu repositorio, clic en botón verde "Code"
   - Pestaña "Codespaces" → "Create codespace on main"
   - Espera 1-2 minutos

3. **Compila el APK**
   ```bash
   ./build-apk.sh
   ```
   - Espera 10-15 minutos
   - Descarga `android/app/build/outputs/apk/release/app-release.apk`

### Instrucciones Detalladas

Lee `CODESPACES_GUIDE.md` para guía paso a paso con screenshots y troubleshooting.

---

## ¿Qué hace build-apk.sh?

1. Verifica Node.js y Java
2. Instala dependencias (pnpm install)
3. Genera proyecto Android (expo prebuild)
4. Compila APK (gradle assembleRelease)

---

## Alternativa: Compilar en PC

Si tienes acceso a una PC (tuya o de un amigo):

```bash
# 1. Instalar Node.js desde nodejs.org
# 2. Abrir terminal en la carpeta del proyecto
# 3. Ejecutar:
npm install -g pnpm
pnpm install
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
```

APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

---

## Tiempo Estimado

- Subir a GitHub: 5 minutos
- Configurar Codespaces: 2 minutos
- Compilación: 10-15 minutos
- **Total: ~20 minutos**

---

## Requisitos

- Cuenta GitHub (gratis)
- Navegador web
- Conexión a Internet estable

---

**¡Buena suerte! 🎉**
