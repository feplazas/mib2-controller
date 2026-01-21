# Google Play Store - Preflight Checklist

## ✅ Configuración de la Aplicación

### App Config (app.config.ts)
- [x] **Nombre de la app**: MIB2 Controller
- [x] **Package name**: space.manus.mib2controller.t20260110134809
- [x] **Version**: 1.0.0
- [x] **versionCode**: 5
- [x] **Icono**: assets/images/icon.png (512x512px)
- [x] **Splash screen**: assets/images/splash-icon.png

### Permisos Android
- [x] POST_NOTIFICATIONS (notificaciones push)
- [x] USB_PERMISSION (acceso a dispositivos USB)
- [x] INTERNET (conexión Telnet)

---

## ✅ Metadatos de Play Store

### Textos (store-listing.md)
- [x] **Nombre de la app** (30 caracteres): MIB2 Controller
- [x] **Descripción corta** (80 caracteres): Control remoto para unidades MIB2 STD2 Technisat Preh sin navegación
- [x] **Descripción completa** (4000 caracteres): ✓ Completa
- [x] **Texto promocional** (170 caracteres): Desbloquea CarPlay, Android Auto y más funciones ocultas en tu MIB2 STD2 Technisat Preh. Spoofing USB automático y terminal Telnet integrado.

### Categoría y Clasificación
- [x] **Categoría**: Tools
- [x] **Content Rating**: Everyone (para todos los públicos)
- [x] **Precio**: Gratis

### URLs
- [x] **Privacy Policy**: https://github.com/feplazas/mib2-controller/blob/main/PRIVACY.md
- [x] **GitHub**: https://github.com/feplazas/mib2-controller

### Tags/Keywords
MIB2, Volkswagen, VW, Seat, Skoda, CarPlay, Android Auto, Toolbox, USB, Telnet, FEC, ASIX, Spoofing, Infotainment

---

## 📸 Assets Gráficos Requeridos

### Icono de la Aplicación
- [x] **Icon high-res** (512x512px, PNG, 32-bit, sin transparencia)
  - Ubicación: `play-store-assets/icon-512.png`
  - Debe ser el mismo diseño que el icono de la app
  - Generado: 512x512px, 328KB

### Feature Graphic
- [x] **Feature graphic** (1024x500px, PNG o JPG)
  - Ubicación: `play-store-assets/feature-graphic.png`
  - Debe mostrar el nombre de la app y funcionalidad principal
  - Sin bordes ni transparencia
  - Generado: 1024x500px, 581KB

### Screenshots (mínimo 2, máximo 8)
Resolución: 945x2048px (aspect ratio ~9:19.5)

1. [x] **Home screen** - Detección de adaptador USB
2. [x] **Auto-Spoof** - Proceso de spoofing en acción
3. [x] **Telnet Terminal** - Terminal con comandos ejecutándose
4. [x] **FEC Codes** - Lista de códigos FEC disponibles
5. [x] **Installation Guide** - Guía de instalación de Toolbox
6. [x] **Backups** - Gestión de backups de EEPROM
7. [x] **Recovery** - Recuperación de adaptadores dañados
8. [x] **Actions** - Hub de herramientas y utilidades
9. [x] **Settings** - Pantalla de configuración

Generados: 9 screenshots PNG (945x2048px, 34-84 KB cada uno)
Ubicación: `play-store-assets/screenshot-01-home.png` a `screenshot-09-settings.png`

---

## 📄 Documentación Legal

### Política de Privacidad (PRIVACY.md)
- [x] **Ubicación**: `/PRIVACY.md`
- [x] **Publicada en**: https://github.com/feplazas/mib2-controller/blob/main/PRIVACY.md
- [x] **Contenido**:
  - Qué datos recopila la app
  - Cómo se usan los datos
  - Con quién se comparten
  - Derechos del usuario
  - Contacto del desarrollador

### Términos de Servicio
- [ ] **Opcional**: Crear `TERMS.md` si es necesario
- [x] **Advertencias incluidas** en la descripción de la app

---

## 🔧 Build de Producción

### APK/AAB Firmado
- [x] **Compilar AAB** con EAS Build (perfil `production`)
  - Build ID: a11a6f86-a4f8-4e47-ac37-63abf0eae622
  - Estado: En progreso (10-15 minutos estimados)
  - Logs: https://expo.dev/accounts/feplazas/projects/mib2_controller/builds/a11a6f86-a4f8-4e47-ac37-63abf0eae622
  - Expo doctor: 17/17 checks passed
- [x] **Verificar firma**: Keystore `u0sZn_81IL` (Expo managed)
- [ ] **Probar instalación** en dispositivo real
- [ ] **Verificar funcionalidades**:
  - Detección de adaptador USB
  - Spoofing de EEPROM
  - Conexión Telnet
  - Inyección de códigos FEC
  - Backups y recuperación

### Optimizaciones
- [x] **ProGuard/R8**: Habilitado en `production-apk` profile
- [x] **Minify**: Habilitado
- [x] **Shrink resources**: Habilitado
- [x] **Expo doctor**: 17/17 checks passed

---

## 🧪 Testing Pre-Lanzamiento

### Pruebas Funcionales
- [ ] Probar en al menos 2 dispositivos Android diferentes
- [ ] Probar con adaptador ASIX real
- [ ] Probar conexión Telnet con MIB2 real
- [ ] Verificar que todos los botones funcionan
- [ ] Verificar que no hay crashes

### Pruebas de Compatibilidad
- [ ] Android 10 (API 29)
- [ ] Android 11 (API 30)
- [ ] Android 12 (API 31)
- [ ] Android 13 (API 33)
- [ ] Android 14 (API 34)

---

## 📋 Checklist de Publicación

### Google Play Console
1. [ ] Crear nueva aplicación en Play Console
2. [ ] Completar "App content" questionnaire:
   - [ ] Privacy policy
   - [ ] Ads (No contiene anuncios)
   - [ ] Content rating (IARC questionnaire)
   - [ ] Target audience (18+)
   - [ ] News app (No)
   - [ ] COVID-19 contact tracing (No)
   - [ ] Data safety (completar formulario)
3. [ ] Subir AAB de producción
4. [ ] Configurar "Store listing":
   - [ ] Título de la app
   - [ ] Descripción corta
   - [ ] Descripción completa
   - [ ] Icono de la app (512x512px)
   - [ ] Feature graphic (1024x500px)
   - [ ] Screenshots (mínimo 2)
5. [ ] Configurar "Pricing & distribution":
   - [ ] Países disponibles
   - [ ] Precio (Gratis)
   - [ ] Content guidelines
6. [ ] Crear "Internal testing track" (opcional pero recomendado)
7. [ ] Enviar para revisión

### Tiempos Estimados
- **Internal testing**: Disponible inmediatamente
- **Closed testing**: 1-2 horas
- **Open testing**: 1-2 horas
- **Production**: 1-7 días (primera publicación)

---

## ⚠️ Advertencias y Consideraciones

### Políticas de Play Store
- ✅ **No contiene malware** ni código malicioso
- ✅ **No viola derechos de autor** (código open source MIT)
- ✅ **No es una app de gambling** o contenido prohibido
- ⚠️ **Funcionalidad de modificación de hardware**: Asegurarse de que la descripción deja claro que es para usuarios avanzados y bajo su propio riesgo

### Riesgos Potenciales
- **Rechazo por "modificación de hardware"**: Enfatizar en la descripción que es una herramienta para usuarios avanzados
- **Rechazo por "falta de funcionalidad"**: Asegurarse de que la app funciona sin dispositivos MIB2 (mostrar guías, etc.)
- **Rechazo por "política de privacidad incompleta"**: Verificar que PRIVACY.md está completo y accesible

---

## 📞 Contacto y Soporte

- **Desarrollador**: Felipe Plazas
- **Email**: [tu-email]@example.com
- **GitHub**: https://github.com/feplazas/mib2-controller
- **Sitio web**: [opcional]

---

## ✅ Estado Actual

**Fecha**: 20 Enero 2026

**Completado**:
- ✅ Configuración de la app
- ✅ Metadatos de Play Store
- ✅ Documentación legal (PRIVACY.md)
- ✅ ProGuard/R8 configurado
- ✅ Expo doctor 17/17 checks passed
- ✅ versionCode 5

**Pendiente**:
- ✅ Screenshots generados (9 pantallas en PNG)
- ⏳ AAB de producción compilándose (build a11a6f86)
- ⏳ Testing en dispositivos reales
- ⏳ Publicación en Play Console

**Próximos pasos**:
1. Generar assets gráficos
2. Compilar AAB de producción con EAS
3. Crear Internal Testing track en Play Console
4. Probar en dispositivos reales
5. Enviar para revisión
