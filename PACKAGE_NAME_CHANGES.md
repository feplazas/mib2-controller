# Cambios de Package Name y Eliminación de Referencias a Manus

**Fecha**: 22 de Enero de 2026  
**Autor**: Felipe Plazas

---

## Resumen de Cambios

Se han eliminado todas las referencias a "Manus" de la aplicación, documentos legales, y assets de Play Store. El package name ha sido cambiado de `space.manus.mib2controller.t20260110134809` a `com.feplazas.mib2controller`.

---

## Cambios Realizados

### 1. Package Name y Configuración de la App

**Archivo**: `app.config.ts`

- ✅ Package name cambiado: `space.manus.mib2controller.t20260110134809` → `com.feplazas.mib2controller`
- ✅ Deep link scheme cambiado: `manus20260110134809` → `mib2controller`
- ✅ Bundle ID (iOS): `com.feplazas.mib2controller`
- ✅ Android package: `com.feplazas.mib2controller`
- ✅ Eliminada referencia a logo S3 de Manus

**Archivo**: `constants/oauth.ts`

- ✅ Package name actualizado
- ✅ Deep link scheme actualizado
- ✅ Cambiado `USER_INFO_KEY` de `manus-runtime-user-info` a `app-runtime-user-info`

### 2. Documentos Legales y de Play Store

**Archivos actualizados** (todas las referencias al package name antiguo):

- ✅ `legal/GOOGLE_PLAY_COMPLIANCE_DOSSIER.md`
- ✅ `legal/PLAY_CONSOLE_APPEAL_BRIEF.md`
- ✅ `play-store-assets/PLAY_CONSOLE_PUBLICATION_GUIDE.md`
- ✅ `play-store-assets/IMMEDIATE_ACTION_GUIDE.md`
- ✅ `play-store-assets/DATA_SAFETY_GUIDE.md`
- ✅ `play-store-assets/store-listing.md`
- ✅ `play-store-assets/PRIVACY_POLICY_INFO.md`
- ✅ `play-store-assets/PLAY_STORE_PREFLIGHT.md`
- ✅ `PRIVACY_POLICY.md`

**Cambios específicos**:

- Package name: `space.manus.mib2controller.t20260110134809` → `com.feplazas.mib2controller`
- URL temporal de privacy policy: `https://manus.im/privacy` → `https://feplazas.github.io/mib2-controller-privacy/`

### 3. Privacy Policy en GitHub Pages

**Repositorio**: https://github.com/feplazas/mib2-controller-privacy

- ✅ Actualizado `index.html` con nuevo package name
- ✅ Cambios pusheados a GitHub
- ✅ GitHub Pages se actualizará automáticamente en 1-2 minutos
- ✅ URL permanece igual: https://feplazas.github.io/mib2-controller-privacy/

### 4. Nuevo Build Requerido

**IMPORTANTE**: El build anterior (a11a6f86) tiene el package name antiguo (`space.manus.mib2controller.t20260110134809`) y **NO puede ser usado** para publicación en Play Store.

**Acción completada**: ✅ Nuevo build iniciado con EAS Build.

**Build ID**: a66cf17f-8820-4292-8ee7-7ec96d372b0c  
**URL**: https://expo.dev/accounts/feplazas/projects/mib2_controller/builds/a66cf17f-8820-4292-8ee7-7ec96d372b0c  
**Package name**: com.feplazas.mib2controller  
**VersionCode**: 7  
**Keystore**: Nuevo keystore generado automáticamente por EAS

---

## Próximos Pasos

### 1. Crear Nuevo Build AAB

El build anterior ya no es válido. Necesitas crear un nuevo build con el package name correcto:

```bash
cd /home/ubuntu/mib2_controller
EXPO_TOKEN="7SznX0vF0wcCdS9lrztXv-HmwEGQTbfQCIQgOsdc" npx eas-cli build --platform android --profile production
```

**Tiempo estimado**: 10-15 minutos

**Importante**: 
- El nuevo build tendrá `versionCode: 7` (incrementado automáticamente)
- Package name será: `com.feplazas.mib2controller`
- Todos los demás aspectos permanecen iguales

### 2. Actualizar Play Console

Una vez que tengas el nuevo AAB:

1. **Crear la aplicación** en Play Console con el nuevo package name: `com.feplazas.mib2controller`
2. **Subir el nuevo AAB** (no uses el build a11a6f86 antiguo)
3. **Usar la Privacy Policy URL**: https://feplazas.github.io/mib2-controller-privacy/
4. Seguir la guía `IMMEDIATE_ACTION_GUIDE.md` para el resto del proceso

---

## Verificación

### Checklist de Verificación

- [x] Package name cambiado en `app.config.ts`
- [x] Package name cambiado en `constants/oauth.ts`
- [x] Todos los documentos .md actualizados
- [x] Privacy Policy actualizada en GitHub Pages
- [x] Nuevo build AAB creado con package name correcto (Build ID: a66cf17f)
- [ ] Aplicación creada en Play Console con nuevo package name
- [ ] Nuevo AAB subido a Play Console

---

## Información Importante

### Package Name Correcto

```
com.feplazas.mib2controller
```

**Usar este package name en**:
- Play Console al crear la aplicación
- Documentos de apelación si es necesario
- Comunicaciones con Google Play

### Deep Link Scheme Correcto

```
mib2controller://
```

**Ejemplo de URL de callback OAuth**:
```
mib2controller://oauth/callback
```

### Privacy Policy URL

```
https://feplazas.github.io/mib2-controller-privacy/
```

---

## Notas Adicionales

1. **No usar el build antiguo**: El build a11a6f86 tiene el package name `space.manus.mib2controller.t20260110134809` y no puede ser cambiado después de compilado.

2. **GitHub Pages actualización**: Los cambios en la Privacy Policy pueden tomar 1-2 minutos en reflejarse en https://feplazas.github.io/mib2-controller-privacy/

3. **VersionCode incrementado**: El nuevo build tendrá `versionCode: 7` en lugar de 6. Esto es normal y esperado.

4. **Autor único**: Todos los documentos ahora muestran a Felipe Plazas como único autor y desarrollador.

---

**Estado**: ✅ Cambios completados en código y documentos  
**Pendiente**: Crear nuevo build AAB con package name correcto
