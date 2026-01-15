# Instrucciones para sincronizar package.json y resolver expo doctor

## Paso 1: Descargar cambios del repositorio

```bash
cd ~/mib2_controller
git pull origin main
```

## Paso 2: Verificar que la exclusión esté presente

```bash
grep -A 6 '"install":' package.json
```

**Deberías ver:**
```json
    "install": {
      "exclude": [
        "react-native-tcp-socket",
        "@react-navigation/bottom-tabs",
        "@react-navigation/native",
        "eslint-config-expo"
      ]
    }
```

## Paso 3: Verificar con expo doctor

```bash
npx expo-doctor
```

**Resultado esperado:**
```
Running 17 checks on your project...
17/17 checks passed. No issues detected!
```

## Paso 4: Generar APK de producción

Una vez que expo doctor pase 17/17 checks:

```bash
eas build --platform android --profile production-apk
```

---

## Alternativa: Usar el script automático

También puedes usar el script `fix-dependencies.sh` que hace todo automáticamente:

```bash
cd ~/mib2_controller
bash fix-dependencies.sh
```

Este script:
1. Limpia node_modules y pnpm-lock.yaml
2. Descarga package.json y pnpm-lock.yaml actualizados
3. Reinstala dependencias
4. Ejecuta expo doctor automáticamente
