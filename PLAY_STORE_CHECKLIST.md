# ✅ Checklist Final de Publicación en Play Store

Usa este checklist para asegurarte de que todo esté listo antes de publicar MIB2 Controller en Google Play Store.

---

## 📋 Pre-Publicación

### 1. Documentación Legal ✅

- [x] **Privacy Policy creada** (`PRIVACY_POLICY.md`)
- [ ] **Privacy Policy alojada en URL pública** (GitHub Pages, Google Sites, etc.)
  - Ver: `HOSTING_PRIVACY_POLICY.md`
- [x] **Terms of Service creados** (`TERMS_OF_SERVICE.md`)
- [x] **Justificación de permisos documentada** (`PLAY_STORE_PERMISSIONS.md`)

**URL de Privacy Policy:** `_______________________________`

---

### 2. Assets Visuales ✅

- [x] **Ícono de alta resolución (512x512)** → `play-store-assets/icon-512.png`
- [x] **Feature Graphic (1024x500)** → `play-store-assets/feature-graphic.png`
- [ ] **Screenshots de teléfono (mínimo 2, máximo 8)**
  - Ver: `SCREENSHOTS_GUIDE.md`
  - Screenshot 1: Home con conexión ⭐
  - Screenshot 2: Scanner de red ⭐
  - Screenshot 3: Toolbox installer
  - Screenshot 4: Generador FEC
  - Screenshot 5: USB Status
  - Screenshot 6: Diagnósticos

**Carpeta de screenshots:** `_______________________________`

---

### 3. Configuración de Build ✅

- [x] **ProGuard/R8 habilitado** (ofuscación de código)
- [x] **shrinkResources habilitado** (optimización de recursos)
- [x] **versionCode configurado** (1)
- [x] **versionName configurado** (1.0.0)
- [x] **Splits por ABI** (arm64-v8a, armeabi-v7a)
- [x] **AAB configurado** en perfil de producción

---

### 4. Testing ✅

- [ ] **APK probado en dispositivo real**
  - Adaptador USB detectado correctamente
  - Scanner de red funciona
  - Conexión Telnet exitosa
  - Toolbox installer funciona
  - Generador FEC funciona
  - Backups se crean correctamente
  - ProGuard no rompió ninguna funcionalidad

**Dispositivo de prueba:** `_______________________________`

---

## 🏪 Configuración de Play Console

### 5. Información Básica

- [ ] **Título de la app configurado**
  - "MIB2 Controller - VW Diagnostic Tool" (37 caracteres)
- [ ] **Descripción corta configurada**
  - "Professional diagnostic and configuration tool for Volkswagen Group MIB2 systems" (79 caracteres)
- [ ] **Descripción completa configurada**
  - Ver: `PLAY_STORE_LISTING.md`
- [ ] **Categoría seleccionada**
  - Primaria: Tools (Herramientas)
  - Secundaria: Auto & Vehicles
- [ ] **Tags/Keywords agregados**
  - MIB2, Volkswagen, VW, Audi, SEAT, Skoda, Diagnostic, Telnet, FEC, Coding

---

### 6. Assets en Play Console

- [ ] **Ícono de alta resolución subido** (512x512)
- [ ] **Feature Graphic subido** (1024x500)
- [ ] **Screenshots subidos** (mínimo 2)
  - Orden correcto (Home primero)
  - Resolución adecuada (1080x1920 mínimo)
  - Sin información personal

---

### 7. Políticas y Cumplimiento

- [ ] **Privacy Policy URL configurada**
  - Policy → App content → Privacy policy
  - URL: `https://___________________________`
- [ ] **Data Safety completado**
  - Policy → App content → Data safety
  - Declarar: NO recopilación de datos personales
  - Declarar: Transmisión opcional de datos (API FEC)
  - Declarar: Datos se pueden eliminar (desinstalar app)
- [ ] **Clasificación de contenido completada**
  - Policy → App content → Content rating
  - Cuestionario IARC completado
  - Clasificación esperada: PEGI 3 / Everyone
- [ ] **Público objetivo declarado**
  - Policy → App content → Target audience
  - Mayores de 18 años (requiere conocimientos técnicos)
- [ ] **Permisos sensibles justificados**
  - Policy → App content → App permissions
  - Subir `PLAY_STORE_PERMISSIONS.md` si es solicitado

---

### 8. Distribución

- [ ] **Países de distribución seleccionados**
  - Release → Production → Countries/regions
  - Recomendado: Todos los países (excepto restricciones legales)
- [ ] **Precio configurado**
  - Release → Production → Pricing
  - Gratis (Free)
- [ ] **Compras in-app declaradas**
  - Monetize → In-app products
  - Ninguna (NO)

---

## 🚀 Publicación

### 9. Generar AAB de Producción

- [ ] **AAB generado con EAS Build**
  ```bash
  cd /home/ubuntu/mib2_controller
  export EXPO_TOKEN="DQ7Snv-Q1CMOjHkNHDZ8cd-7xAuE13dNuq7vfnZj"
  eas build --platform android --profile production --non-interactive
  ```
  - Ver: `GENERATE_AAB.md`
- [ ] **AAB descargado**
  - Tamaño esperado: 30-40 MB
- [ ] **AAB verificado**
  - Firma válida (`jarsigner -verify`)
  - ProGuard/R8 aplicado

**URL del build:** `https://expo.dev/accounts/feplazas/projects/mib2_controller/builds/_______`

---

### 10. Internal Testing (Recomendado)

- [ ] **Release de Internal Testing creado**
  - Testing → Internal testing → Create new release
- [ ] **AAB subido a Internal Testing**
- [ ] **Release notes escritos**
  - Ver ejemplo en `GENERATE_AAB.md`
- [ ] **Lista de testers creada**
  - Agregar emails de colaboradores
- [ ] **App probada desde Play Store**
  - Instalar desde link de Internal Testing
  - Probar todas las funcionalidades
  - Verificar que no hay crashes

**Link de Internal Testing:** `https://play.google.com/apps/internaltest/_______`

---

### 11. Publicación en Producción

- [ ] **Release de Production creado**
  - Release → Production → Create new release
- [ ] **AAB subido a Production**
  - Mismo AAB validado en Internal Testing
- [ ] **Release notes escritos**
  - Versión 1.0.0 - Initial Release
  - Listar features principales
- [ ] **Revisión final completada**
  - Todos los campos obligatorios llenos
  - Sin advertencias en Play Console
  - Privacy Policy accesible
  - Screenshots visibles
- [ ] **Rollout iniciado**
  - Click en "Start rollout to Production"
  - Confirmar publicación

---

## ⏱️ Después de Publicar

### 12. Monitoreo Post-Publicación

- [ ] **Revisión de Google completada** (3-7 días)
- [ ] **App aprobada y publicada**
- [ ] **Monitorear crashes**
  - Quality → Android vitals → Crashes & ANRs
- [ ] **Revisar reviews de usuarios**
  - Responder a comentarios negativos
  - Agradecer comentarios positivos
- [ ] **Monitorear métricas**
  - Instalaciones
  - Desinstalaciones
  - Calificación promedio

---

## 📊 Resumen de Estado

| Categoría | Estado | Pendiente |
|-----------|--------|-----------|
| Documentación Legal | ✅ Completa | Alojar Privacy Policy |
| Assets Visuales | ⚠️ Parcial | Capturar screenshots |
| Configuración Build | ✅ Completa | - |
| Testing | ⏳ En progreso | Validar APK |
| Play Console Setup | ❌ Pendiente | Configurar todo |
| AAB Producción | ❌ Pendiente | Generar y subir |

---

## 🎯 Próximos Pasos Inmediatos

1. **Alojar Privacy Policy** (5-10 min)
   - Usar GitHub Pages o Google Sites
   - Ver: `HOSTING_PRIVACY_POLICY.md`

2. **Capturar Screenshots** (20-30 min)
   - Usar APK descargado
   - Mínimo 2, recomendado 6
   - Ver: `SCREENSHOTS_GUIDE.md`

3. **Configurar Play Console** (30-45 min)
   - Completar todos los campos
   - Subir assets
   - Configurar políticas

4. **Generar AAB** (10-20 min)
   - Ejecutar comando de EAS Build
   - Ver: `GENERATE_AAB.md`

5. **Internal Testing** (1-2 días)
   - Subir AAB
   - Probar en dispositivos reales
   - Iterar si es necesario

6. **Publicar en Producción** (5 min + 3-7 días de revisión)
   - Subir AAB final
   - Iniciar rollout
   - Esperar aprobación de Google

---

## 📞 Soporte

Si encuentras problemas:

- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Play Console:** https://support.google.com/googleplay/android-developer
- **Políticas de Play Store:** https://play.google.com/about/developer-content-policy/

---

## ✅ Checklist Rápido (Copy-Paste)

```
[ ] Privacy Policy alojada en URL pública
[ ] Screenshots capturados (mínimo 2)
[ ] APK probado en dispositivo real
[ ] Play Console configurado completamente
[ ] AAB de producción generado
[ ] Internal Testing completado
[ ] Publicación en producción iniciada
```

---

**¡Buena suerte con la publicación!** 🚀

**Tiempo total estimado:** 2-3 horas de trabajo + 3-7 días de revisión de Google
