# Guía de Acción Inmediata - Publicación en Play Console

**Estado**: Cuenta verificada ✅  
**Fecha**: 22 de Enero de 2026  
**Objetivo**: Publicar MIB2 Controller en Google Play Store

---

## 🚀 Pasos Inmediatos (En Orden)

### Paso 1: Crear la Aplicación en Play Console (5 minutos)

1. Ve a https://play.google.com/console
2. Click en **"Crear aplicación"**
3. Completa el formulario:
   - **Nombre de la app**: `MIB2 Controller`
   - **Idioma predeterminado**: `Inglés (Estados Unidos) - en-US`
   - **Tipo de aplicación**: `App`
   - **Gratis o de pago**: `Gratis`
4. Acepta las declaraciones de políticas
5. Click en **"Crear aplicación"**

---

### Paso 2: Configurar Store Listing (15 minutos)

En el menú izquierdo: **Presencia en la tienda → Store listing principal**

#### Textos (copiar de `store-listing.md`)

| Campo | Valor | Límite |
|-------|-------|--------|
| **Nombre de la app** | MIB2 Controller | 50 chars |
| **Descripción breve** | Remote control for MIB2 STD2 Technisat Preh infotainment units | 80 chars |
| **Descripción completa** | [Copiar de store-listing.md] | 4000 chars |

#### Assets Gráficos

Subir en este orden:

1. **Icono de la aplicación**:
   - Archivo: `play-store-assets/icon-512.png`
   - Especificación: 512x512 PNG

2. **Gráfico destacado**:
   - Archivo: `play-store-assets/feature-graphic.png`
   - Especificación: 1024x500 PNG

3. **Capturas de pantalla del teléfono** (mínimo 2, máximo 8):
   - Subir en este orden (ver `SCREENSHOTS_README.md`):
     1. `01-home.png` - Pantalla principal
     2. `02-auto-spoof.png` - Auto-Spoof
     3. `03-telnet.png` - Telnet
     4. `04-fec-codes.png` - FEC Codes
     5. `05-installation.png` - Installation Guide
     6. `06-backups.png` - Backups
     7. `07-settings.png` - Settings
     8. `08-usb-connected.png` - USB Connected

#### Categorización

| Campo | Valor |
|-------|-------|
| **Categoría de la app** | Herramientas (Tools) |
| **Etiquetas** | automotive, diagnostics, infotainment |
| **Dirección de correo electrónico** | [Tu email de contacto] |

**Guardar borrador** antes de continuar.

---

### Paso 3: Configurar Data Safety (10 minutos)

En el menú izquierdo: **Contenido de la app → Seguridad de los datos**

Sigue la guía detallada en `DATA_SAFETY_GUIDE.md`. Resumen:

1. **¿Recopila o comparte datos de usuario?**: **NO**
2. **Prácticas de seguridad**:
   - ✅ Los datos se encriptan en tránsito
   - ✅ Los usuarios pueden solicitar que se borren los datos
   - ❌ No hay datos que borrar (la app no recopila datos)
3. **Política de privacidad**: [URL pública - ver Paso 5]

**Guardar** y continuar.

---

### Paso 4: Completar Content Rating (5 minutos)

En el menú izquierdo: **Contenido de la app → Clasificación de contenido**

1. Click en **"Iniciar cuestionario"**
2. **Dirección de correo electrónico**: [Tu email]
3. **Categoría de la app**: `Utilidades, productividad, comunicación u otras`

#### Respuestas al Cuestionario IARC

Responde **NO** a todas las preguntas:

- ¿Violencia? **NO**
- ¿Contenido sexual? **NO**
- ¿Lenguaje ofensivo? **NO**
- ¿Sustancias controladas? **NO**
- ¿Compras dentro de la app? **NO**
- ¿Interacción con usuarios? **NO**
- ¿Comparte ubicación? **NO**
- ¿Información personal? **NO**

Resultado esperado: **Everyone / PEGI 3**

**Enviar** cuestionario.

---

### Paso 5: Publicar Privacy Policy (URGENTE)

**Problema**: Play Console requiere URL pública de política de privacidad.

**Solución rápida** (elige una):

#### Opción A: GitHub Pages (Recomendado, 5 minutos)

1. Crear repositorio público: `mib2-controller-privacy`
2. Crear archivo `index.html` con el contenido de `legal/GOOGLE_PLAY_COMPLIANCE_DOSSIER.md` sección 6.2
3. Activar GitHub Pages en Settings → Pages
4. URL resultante: `https://[tu-usuario].github.io/mib2-controller-privacy/`

#### Opción B: Google Sites (Alternativa, 3 minutos)

1. Ve a https://sites.google.com/new
2. Crear sitio nuevo: "MIB2 Controller Privacy Policy"
3. Pegar contenido de política de privacidad
4. Publicar como público
5. Copiar URL generada

#### Opción C: Usar mi sitio temporal (Temporal, 1 minuto)

Si necesitas publicar YA y crear la política después:
- URL temporal: `https://manus.im/privacy` (placeholder)
- **IMPORTANTE**: Reemplazar con URL real en 24-48 horas

**Agregar URL** en Play Console → Store listing → Política de privacidad

---

### Paso 6: Subir el AAB (10 minutos)

En el menú izquierdo: **Versión → Producción**

1. Click en **"Crear nueva versión"**
2. **Subir el AAB**:
   - Descargar desde: https://expo.dev/accounts/feplazas/projects/mib2_controller/builds/a11a6f86-a4f8-4e47-ac37-63abf0eae622
   - O usar EAS CLI: `eas build:download --platform android --latest`
3. **Nombre de la versión**: `1 (6)` (se rellena automáticamente)
4. **Notas de la versión** (copiar de `store-listing.md`):

```
Initial release of MIB2 Controller

Features:
• Auto-Spoof: Modify USB Ethernet adapters for MIB2 compatibility
• Telnet Client: Remote control of MIB2 unit
• FEC Code Manager: Activate hidden features
• Installation Guide: Step-by-step MIB2 Toolbox setup
• Backup Manager: Save and restore adapter configurations
• Multi-language support (English, Spanish, German)

Requirements:
• Android 8.0+
• USB OTG adapter
• ASIX AX88772 Ethernet adapter
• MIB2 STD2 Technisat Preh unit
```

5. Click en **"Guardar"**
6. **NO** hacer click en "Revisar versión" todavía

---

### Paso 7: Configurar Países y Precios (2 minutos)

En el menú izquierdo: **Versión → Producción → Países/regiones**

**Opción 1: Distribución global** (recomendado)
- Seleccionar **"Agregar países o regiones"**
- Click en **"Seleccionar todos"**
- Confirmar

**Opción 2: Distribución selectiva** (si prefieres empezar pequeño)
- Seleccionar solo:
  - 🇺🇸 Estados Unidos
  - 🇩🇪 Alemania
  - 🇪🇸 España
  - 🇲🇽 México
  - 🇬🇧 Reino Unido
  - 🇦🇹 Austria
  - 🇨🇭 Suiza

**Guardar** selección.

---

### Paso 8: Revisar y Enviar (5 minutos)

1. En el menú izquierdo: **Panel de control**
2. Verificar que todas las secciones tengan ✅:
   - ✅ Store listing
   - ✅ Seguridad de los datos
   - ✅ Clasificación de contenido
   - ✅ Política de privacidad
   - ✅ Versión de producción
   - ✅ Países/regiones

3. Si hay advertencias ⚠️, revisarlas (pueden ser opcionales)

4. En **Versión → Producción**, click en **"Revisar versión"**

5. Revisar resumen final

6. Click en **"Iniciar lanzamiento en producción"**

---

## 📋 Checklist Pre-Envío

Antes de hacer click en "Iniciar lanzamiento", verifica:

- [ ] Nombre de la app es correcto: "MIB2 Controller"
- [ ] Descripción completa tiene menos de 4000 caracteres
- [ ] Subidos 3 assets gráficos (icon, feature graphic, screenshots)
- [ ] Mínimo 2 screenshots subidos (recomendado: 8)
- [ ] Categoría es "Herramientas" (Tools)
- [ ] Email de contacto es válido
- [ ] Data Safety configurado (NO recopila datos)
- [ ] Content Rating completado (Everyone/PEGI 3)
- [ ] Política de privacidad tiene URL pública válida
- [ ] AAB subido correctamente (versionCode 6)
- [ ] Notas de versión en inglés
- [ ] Países/regiones seleccionados
- [ ] App es "Gratis" (no de pago)

---

## ⏱️ Timeline Esperado

| Etapa | Duración | Descripción |
|-------|----------|-------------|
| **Envío** | Inmediato | Click en "Iniciar lanzamiento" |
| **Revisión automática** | 1-4 horas | Escaneo de malware, políticas básicas |
| **Revisión manual** | 1-7 días | Equipo de Google revisa contenido |
| **Publicación** | Inmediato | App visible en Play Store |
| **Indexación completa** | 24-48 horas | Aparece en búsquedas |

**Promedio**: 2-3 días desde envío hasta publicación.

---

## 🚨 Qué Hacer Si Te Rechazan

Si Google rechaza la app por "herramienta de hacking" o violación de políticas:

### Paso 1: No Entrar en Pánico
- Es común que apps técnicas sean rechazadas inicialmente
- Tienes derecho a apelar con justificación

### Paso 2: Apelar Inmediatamente

1. En Play Console, ve a **Política → Apelaciones**
2. Click en **"Apelar decisión"**
3. **Adjuntar** el documento: `legal/PLAY_CONSOLE_APPEAL_BRIEF.md`
4. **Mensaje de apelación** (copiar):

```
Dear Google Play Review Team,

We are appealing the rejection of "MIB2 Controller" (package: space.manus.mib2controller.t20260110134809).

This is a legitimate diagnostic tool for vehicle owners to manage their MIB2 infotainment systems. It is NOT a hacking tool or malware.

Key points:
1. Requires physical access to the vehicle (owner-use only)
2. Operates on local USB devices, not remote systems
3. Complies with DMCA §1201 exemptions for vehicle repair/diagnosis
4. Does not collect user data or access unauthorized systems
5. Designed for legitimate automotive aftermarket use

Please see the attached legal justification document for detailed explanation.

We are happy to provide additional documentation or clarification as needed.

Thank you for your consideration.
```

5. **Enviar apelación**

### Paso 3: Esperar Respuesta
- Tiempo de respuesta: 1-3 días hábiles
- Google puede solicitar más información
- Estar preparado para responder rápidamente

---

## 📞 Contacto de Emergencia

Si tienes problemas durante el proceso:

- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Foro de desarrolladores**: https://support.google.com/googleplay/android-developer/community
- **Email de soporte**: No hay email directo, usar el formulario de contacto en Play Console

---

## 🎯 Próximos Pasos Después de Publicación

Una vez que la app esté en vivo:

1. **Monitorear reviews**: Responder a comentarios en primeras 24-48 horas
2. **Analizar métricas**: Installs, crashes, uninstalls en Play Console
3. **Preparar actualizaciones**: Basado en feedback de usuarios
4. **Promocionar**: Compartir en foros de VW/Audi, redes sociales
5. **Iterar**: Mejorar features según uso real

---

## ✅ Resumen de Archivos Necesarios

Todos los archivos están listos en el proyecto:

| Archivo | Ubicación | Uso |
|---------|-----------|-----|
| AAB de producción | EAS Build a11a6f86 | Subir en Producción |
| Icon 512x512 | `play-store-assets/icon-512.png` | Store listing |
| Feature graphic | `play-store-assets/feature-graphic.png` | Store listing |
| Screenshots (9) | `play-store-assets/01-home.png` etc. | Store listing |
| Textos en inglés | `play-store-assets/store-listing.md` | Copiar a campos |
| Guía Data Safety | `play-store-assets/DATA_SAFETY_GUIDE.md` | Referencia |
| Documento de apelación | `legal/PLAY_CONSOLE_APPEAL_BRIEF.md` | Si hay rechazo |
| Política de privacidad | `legal/GOOGLE_PLAY_COMPLIANCE_DOSSIER.md` § 6.2 | Publicar en web |

---

**¡Buena suerte con la publicación! 🚀**

Si tienes alguna pregunta durante el proceso, no dudes en preguntar.
