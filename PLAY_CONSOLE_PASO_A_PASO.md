# Guía Paso a Paso: Crear y Publicar App en Google Play Console

**Aplicación:** MIB2 Controller  
**Package Name:** com.feplazas.mib2controller  
**Versión:** 1.0.0 (versionCode 7)

---

## 📋 PREPARACIÓN PREVIA

### Archivos que necesitarás tener listos:

1. **AAB de producción**: https://expo.dev/artifacts/eas/jWvFL8LyfTqJGAoxEKXpoj.aab
2. **Icon (512x512)**: `play-store-assets/icon-512.png`
3. **Feature Graphic (1024x500)**: `play-store-assets/feature-graphic.png`
4. **8 Screenshots**: `play-store-assets/screenshot-01.png` a `screenshot-08.png`
5. **Textos**: `play-store-assets/store-listing.md`
6. **Privacy Policy URL**: https://feplazas.github.io/mib2-controller-privacy/

---

## PASO 1: ACCEDER A PLAY CONSOLE

1. Ve a https://play.google.com/console
2. Inicia sesión con tu cuenta de Google (feplazas@gmail.com)
3. Verifica que tu cuenta esté aprobada (debe mostrar "Cuenta verificada")
4. Si aún no está aprobada, espera el email de Google (puede tardar hasta 48 horas)

---

## PASO 2: CREAR NUEVA APLICACIÓN

1. En el dashboard principal, haz clic en **"Crear aplicación"** (botón azul en la esquina superior derecha)

2. **Completa el formulario de creación:**

   - **Nombre de la aplicación**: `MIB2 Controller`
   - **Idioma predeterminado**: `Inglés (Estados Unidos) - en-US`
   - **Tipo de aplicación**: Selecciona `Aplicación`
   - **Gratis o de pago**: Selecciona `Gratis`

3. **Declaraciones obligatorias** (marca todas las casillas):
   - ✅ Declaro que esta aplicación cumple con las Políticas del Programa para Desarrolladores de Google Play y las leyes de exportación de EE. UU.
   - ✅ Declaro que esta aplicación cumple con las leyes de exportación de EE. UU.

4. Haz clic en **"Crear aplicación"**

---

## PASO 3: CONFIGURAR STORE LISTING (FICHA DE PLAY STORE)

Después de crear la app, serás redirigido al dashboard. Ve a **"Store presence" → "Main store listing"** en el menú lateral.

### 3.1 Detalles de la aplicación

**Nombre de la aplicación:**
```
MIB2 Controller
```

**Descripción breve** (máximo 80 caracteres):
```
Remote control for MIB2 STD2 Technisat Preh units via USB connection
```

**Descripción completa** (máximo 4000 caracteres):
```
MIB2 Controller is a specialized Android application designed for automotive technicians, enthusiasts, and owners who need to diagnose, configure, and repair MIB2 STD2 Technisat Preh (firmware T480) infotainment units via USB connection.

KEY FEATURES

• Auto-Spoof (CarPlay/Android Auto)
Enable CarPlay and Android Auto functionality on compatible MIB2 units through authorized diagnostic procedures.

• Telnet Access
Establish secure Telnet connections to the MIB2 unit for advanced diagnostics and troubleshooting.

• FEC Code Management
Read, modify, and restore Feature Enable Codes (FEC) to configure unit capabilities according to vehicle specifications.

• Backup & Restore
Create complete backups of unit configurations and restore them when needed, essential for repair and maintenance workflows.

• USB Communication
Direct USB connection using OTG adapters with external power (5V) for reliable data transfer.

• Real-time Diagnostics
Monitor connection status, device information, and system logs in real-time.

TECHNICAL REQUIREMENTS

• Android device with USB OTG support
• USB-Ethernet adapter (compatible models listed in app)
• OTG cable with external power supply (5V)
• MIB2 STD2 Technisat Preh unit (firmware T480)

LEGAL COMPLIANCE

This application is developed exclusively for legitimate diagnostic, repair, and interoperability purposes under applicable exemptions to 17 U.S.C. § 1201 (DMCA Section 1201). It is intended for use by:

• Authorized automotive technicians performing warranty or post-warranty repairs
• Vehicle owners exercising their right to repair their own property
• Researchers conducting good-faith security research

The application does not facilitate copyright infringement, piracy, or unauthorized access to copyrighted content. All modifications are limited to configuration parameters necessary for lawful repair and diagnostic activities.

SUPPORT

For technical support, feature requests, or bug reports, contact: feplazas@gmail.com

DISCLAIMER

Users are responsible for ensuring their use of this application complies with local laws and regulations. The developer assumes no liability for misuse or unauthorized modifications.
```

### 3.2 Recursos gráficos

**Icono de la aplicación** (512x512 PNG):
- Sube: `play-store-assets/icon-512.png`

**Gráfico destacado** (1024x500 PNG):
- Sube: `play-store-assets/feature-graphic.png`

**Capturas de pantalla del teléfono** (mínimo 2, máximo 8):
Sube las 8 capturas en orden:
1. `screenshot-01.png` - Tutorial de bienvenida
2. `screenshot-02.png` - Instrucciones de conexión USB
3. `screenshot-03.png` - Estado conectado
4. `screenshot-04.png` - Información del dispositivo
5. `screenshot-05.png` - Gestión de FEC Codes
6. `screenshot-06.png` - Configuración de Auto-Spoof
7. `screenshot-07.png` - Acceso Telnet
8. `screenshot-08.png` - Gestión de backups

**Leyendas para cada captura** (opcional, máximo 80 caracteres cada una):
1. `Welcome tutorial with step-by-step setup instructions`
2. `USB connection guide with OTG adapter requirements`
3. `Connected status showing device information and diagnostics`
4. `Detailed MIB2 unit information and firmware version`
5. `FEC Code management for feature configuration`
6. `Auto-Spoof settings for CarPlay/Android Auto activation`
7. `Telnet access for advanced diagnostics and troubleshooting`
8. `Backup management for configuration save and restore`

### 3.3 Categorización

**Categoría de la aplicación:**
- Selecciona: `Herramientas` (Tools)

**Etiquetas** (opcional, máximo 5):
- `automotive`
- `diagnostic`
- `mib2`
- `repair`
- `usb`

### 3.4 Información de contacto

**Sitio web** (opcional):
- Deja en blanco o usa: `https://github.com/feplazas`

**Correo electrónico:**
```
feplazas@gmail.com
```

**Teléfono** (opcional):
- Deja en blanco

**Dirección** (opcional):
- Deja en blanco

### 3.5 Política de privacidad

**URL de la política de privacidad:**
```
https://feplazas.github.io/mib2-controller-privacy/
```

### 3.6 Guardar cambios

Haz clic en **"Guardar"** en la parte inferior de la página.

---

## PASO 4: CONFIGURAR DATA SAFETY (SEGURIDAD DE DATOS)

Ve a **"Policy" → "App content" → "Data safety"** en el menú lateral.

### 4.1 Recopilación y uso de datos

**¿Tu app recopila o comparte algún dato de usuario?**
- Selecciona: `No, esta app no recopila datos de usuario`

### 4.2 Prácticas de seguridad

**¿Los datos están cifrados en tránsito?**
- Selecciona: `No aplicable` (porque no se recopilan datos)

**¿Los usuarios pueden solicitar la eliminación de sus datos?**
- Selecciona: `No aplicable` (porque no se recopilan datos)

### 4.3 Guardar y enviar

Haz clic en **"Guardar"** y luego **"Enviar"**.

---

## PASO 5: CONFIGURAR CONTENT RATING (CLASIFICACIÓN DE CONTENIDO)

Ve a **"Policy" → "App content" → "Content rating"** en el menú lateral.

### 5.1 Iniciar cuestionario

Haz clic en **"Iniciar cuestionario"**

### 5.2 Información de contacto

**Dirección de correo electrónico:**
```
feplazas@gmail.com
```

**Categoría de la aplicación:**
- Selecciona: `Utilidades, productividad, comunicación o desarrollo`

### 5.3 Cuestionario de contenido

Responde **NO** a todas las preguntas:

- ¿La aplicación contiene violencia? → `No`
- ¿La aplicación contiene contenido sexual o desnudez? → `No`
- ¿La aplicación contiene lenguaje ofensivo? → `No`
- ¿La aplicación contiene contenido relacionado con drogas? → `No`
- ¿La aplicación permite la interacción entre usuarios? → `No`
- ¿La aplicación permite compartir la ubicación del usuario? → `No`
- ¿La aplicación permite compras? → `No`

### 5.4 Guardar y obtener clasificación

Haz clic en **"Guardar"** y luego **"Obtener clasificación"**.

**Clasificación esperada:**
- ESRB: Everyone
- PEGI: 3
- USK: 0
- IARC: 3+

---

## PASO 6: CONFIGURAR TARGET AUDIENCE (PÚBLICO OBJETIVO)

Ve a **"Policy" → "App content" → "Target audience"** en el menú lateral.

### 6.1 Grupo de edad objetivo

**¿A qué grupos de edad está dirigida tu aplicación?**
- Selecciona: `18 y más` (porque es una herramienta técnica profesional)

### 6.2 Guardar

Haz clic en **"Guardar"**.

---

## PASO 7: CONFIGURAR NEWS APPS (APLICACIONES DE NOTICIAS)

Ve a **"Policy" → "App content" → "News apps"** en el menú lateral.

**¿tu aplicación es una aplicación de noticias?**
- Selecciona: `No`

Haz clic en **"Guardar"**.

---

## PASO 8: CONFIGURAR COVID-19 CONTACT TRACING AND STATUS APPS

Ve a **"Policy" → "App content" → "COVID-19 contact tracing and status apps"** en el menú lateral.

**¿Tu aplicación es una aplicación de rastreo de contactos o estado de COVID-19?**
- Selecciona: `No`

Haz clic en **"Guardar"**.

---

## PASO 9: CONFIGURAR DATA DELETION (ELIMINACIÓN DE DATOS)

Ve a **"Policy" → "App content" → "Data deletion"** en el menú lateral.

**¿Tu aplicación permite a los usuarios crear una cuenta?**
- Selecciona: `No`

Haz clic en **"Guardar"**.

---

## PASO 10: CONFIGURAR GOVERNMENT APPS

Ve a **"Policy" → "App content" → "Government apps"** en el menú lateral.

**¿Tu aplicación es una aplicación gubernamental oficial?**
- Selecciona: `No`

Haz clic en **"Guardar"**.

---

## PASO 11: CONFIGURAR ADS (ANUNCIOS)

Ve a **"Policy" → "App content" → "Ads"** en el menú lateral.

**¿Tu aplicación contiene anuncios?**
- Selecciona: `No, mi aplicación no contiene anuncios`

Haz clic en **"Guardar"**.

---

## PASO 12: SUBIR AAB (ANDROID APP BUNDLE)

### 12.1 Descargar AAB

1. Descarga el AAB desde: https://expo.dev/artifacts/eas/jWvFL8LyfTqJGAoxEKXpoj.aab
2. Guárdalo en tu computadora con un nombre descriptivo: `mib2-controller-v1.0.0.aab`

### 12.2 Crear release de producción

1. Ve a **"Release" → "Production"** en el menú lateral
2. Haz clic en **"Crear nueva versión"**

### 12.3 Subir AAB

1. En la sección **"App bundles"**, haz clic en **"Subir"**
2. Selecciona el archivo `mib2-controller-v1.0.0.aab` que descargaste
3. Espera a que se complete la carga y el procesamiento (puede tardar 1-2 minutos)

### 12.4 Notas de la versión

En **"Notas de la versión"**, agrega para `en-US`:

```
Initial release of MIB2 Controller

Features:
• Auto-Spoof (CarPlay/Android Auto activation)
• Telnet access for diagnostics
• FEC Code management
• Backup and restore functionality
• Real-time device monitoring
• USB communication via OTG adapter

Requirements:
• Android device with USB OTG support
• USB-Ethernet adapter with external power (5V)
• MIB2 STD2 Technisat Preh unit (firmware T480)

For support: feplazas@gmail.com
```

### 12.5 Guardar

Haz clic en **"Guardar"** (NO hagas clic en "Revisar versión" todavía).

---

## PASO 13: CONFIGURAR COUNTRIES/REGIONS (PAÍSES Y REGIONES)

1. Ve a **"Release" → "Production" → "Countries/Regions"**
2. Haz clic en **"Agregar países o regiones"**
3. Selecciona los países donde quieres distribuir la app:
   - **Recomendado**: Selecciona todos los países (opción "Seleccionar todo")
   - **Alternativa**: Selecciona solo países específicos (EE.UU., Canadá, Europa, etc.)
4. Haz clic en **"Agregar países"**
5. Haz clic en **"Guardar"**

---

## PASO 14: REVISAR Y ENVIAR PARA REVISIÓN

### 14.1 Verificar que todas las secciones estén completas

Antes de enviar, verifica que todas estas secciones tengan una marca verde ✅:

**Policy (Política):**
- ✅ App content → Data safety
- ✅ App content → Content rating
- ✅ App content → Target audience
- ✅ App content → News apps
- ✅ App content → COVID-19 apps
- ✅ App content → Data deletion
- ✅ App content → Government apps
- ✅ App content → Ads

**Store presence (Presencia en la tienda):**
- ✅ Main store listing (con todos los recursos gráficos y textos)

**Release (Lanzamiento):**
- ✅ Production → AAB subido
- ✅ Production → Notas de la versión
- ✅ Production → Countries/Regions

### 14.2 Revisar versión

1. Ve a **"Release" → "Production"**
2. Haz clic en **"Revisar versión"**
3. Revisa todos los detalles de la versión
4. Si todo está correcto, haz clic en **"Iniciar lanzamiento en producción"**

### 14.3 Confirmación

1. Aparecerá un diálogo de confirmación
2. Lee las advertencias y términos
3. Haz clic en **"Lanzar"** o **"Enviar para revisión"**

---

## PASO 15: ESPERAR REVISIÓN DE GOOGLE

### 15.1 Timeline esperado

- **Revisión inicial**: 2-3 días hábiles (puede ser más rápido)
- **Revisión adicional** (si es necesario): 1-2 días adicionales
- **Total estimado**: 3-7 días

### 15.2 Notificaciones

Recibirás emails en `feplazas@gmail.com` sobre:
- Confirmación de envío
- Estado de la revisión
- Aprobación o rechazo

### 15.3 Seguimiento

Puedes ver el estado en tiempo real en:
- **Play Console** → **Release** → **Production** → **Releases**

---

## 🚨 QUÉ HACER SI LA APP ES RECHAZADA

### Motivos comunes de rechazo:

1. **Violación de políticas de contenido**
   - **Solución**: Usa el documento `legal/PLAY_CONSOLE_APPEAL_BRIEF.md` para apelar, explicando que la app cumple con exenciones DMCA para reparación y diagnóstico.

2. **Problemas con la descripción**
   - **Solución**: Revisa que la descripción no haga afirmaciones exageradas o engañosas.

3. **Problemas con recursos gráficos**
   - **Solución**: Verifica que todas las imágenes cumplan con las especificaciones (ya están correctas en este caso).

4. **Problemas de funcionalidad**
   - **Solución**: Google puede solicitar credenciales de prueba o instrucciones adicionales. Proporciona el APK de prueba y explica que se requiere hardware específico (MIB2 unit).

### Proceso de apelación:

1. Lee cuidadosamente el email de rechazo
2. Identifica la política específica que Google cita
3. Prepara una respuesta usando `legal/PLAY_CONSOLE_APPEAL_BRIEF.md` como base
4. Ve a **Play Console** → **Policy status** → **Appeal**
5. Adjunta el documento de apelación y explica claramente el uso legítimo
6. Envía la apelación y espera respuesta (1-3 días)

---

## ✅ CHECKLIST FINAL ANTES DE ENVIAR

Marca cada ítem antes de hacer clic en "Lanzar":

- [ ] AAB descargado y subido correctamente
- [ ] Store listing completo (nombre, descripciones, imágenes)
- [ ] Privacy Policy URL configurada y accesible
- [ ] Data Safety completado (no recopilación de datos)
- [ ] Content Rating obtenido (Everyone/PEGI 3)
- [ ] Target Audience configurado (18+)
- [ ] Ads configurado (sin anuncios)
- [ ] Countries/Regions seleccionados
- [ ] Notas de la versión agregadas
- [ ] Todas las secciones con marca verde ✅
- [ ] Email feplazas@gmail.com verificado y accesible
- [ ] Documentos de apelación preparados (por si acaso)

---

## 📞 SOPORTE

Si tienes problemas durante el proceso:

1. **Documentación de Google**: https://support.google.com/googleplay/android-developer
2. **Foro de desarrolladores**: https://support.google.com/googleplay/android-developer/community
3. **Email de contacto**: feplazas@gmail.com

---

## 🎉 DESPUÉS DE LA APROBACIÓN

Una vez que Google apruebe la app:

1. Recibirás un email de confirmación
2. La app estará disponible en Play Store en 1-2 horas
3. Podrás compartir el enlace: `https://play.google.com/store/apps/details?id=com.feplazas.mib2controller`
4. Monitorea reviews y responde a usuarios
5. Prepara actualizaciones futuras siguiendo el mismo proceso

---

**¡Buena suerte con la publicación! 🚀**
