# Instrucciones para Subir MIB2 Controller a Google Play Console

## Resumen de Archivos Preparados

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| AAB Bundle | [Descargar desde EAS](https://expo.dev/accounts/feplazas/projects/mib2_controller/builds/4cb7a7ae-b106-4741-9d62-2151c8d35b97) | Archivo para subir a Play Console |
| Icono 512x512 | `play-store-assets/icons/icon-512.png` | Icono de la tienda |
| Feature Graphic | `play-store-assets/graphics/feature-graphic-1024x500.png` | Banner promocional |
| Política de Privacidad | `play-store-assets/PRIVACY_POLICY.md` | Requerido por Google |
| Store Listing | `play-store-assets/STORE_LISTING.md` | Descripciones y metadatos |

---

## Paso 1: Acceder a Google Play Console

1. Ve a [Google Play Console](https://play.google.com/console)
2. Inicia sesión con tu cuenta de desarrollador
3. Si es tu primera app, necesitarás pagar la tarifa de registro ($25 USD una sola vez)

---

## Paso 2: Crear Nueva Aplicación

1. Click en **"Crear aplicación"**
2. Completa los campos:
   - **Nombre de la app:** MIB2 Controller
   - **Idioma predeterminado:** Español (o el que prefieras)
   - **Tipo de aplicación:** Aplicación
   - **Gratuita o de pago:** Gratuita
3. Acepta las declaraciones y click en **"Crear aplicación"**

---

## Paso 3: Configurar Store Listing (Ficha de Play Store)

### 3.1 Detalles de la App

1. Ve a **Presencia en Play Store > Ficha de Play Store principal**
2. Completa:
   - **Nombre de la app:** MIB2 Controller
   - **Descripción breve:** (copiar de STORE_LISTING.md - sección Short Description)
   - **Descripción completa:** (copiar de STORE_LISTING.md - sección Full Description)

### 3.2 Gráficos

1. **Icono de la app:** Sube `icon-512.png`
2. **Gráfico de funciones:** Sube `feature-graphic-1024x500.png`
3. **Capturas de pantalla:** Sube al menos 2 capturas de pantalla del teléfono
   - Tamaño recomendado: 1080x1920 o 1080x2340
   - Puedes usar las capturas que ya tienes de la app

---

## Paso 4: Clasificación de Contenido

1. Ve a **Política > Clasificación del contenido**
2. Click en **"Iniciar cuestionario"**
3. Responde las preguntas según la tabla en STORE_LISTING.md (sección Content Rating)
4. La clasificación resultante debería ser **"Para todos"**

---

## Paso 5: Configurar Política de Privacidad

1. Ve a **Política > Contenido de la app > Política de privacidad**
2. Tienes dos opciones:
   
   **Opción A: Hospedar en GitHub Pages**
   - Crea un repositorio público en GitHub
   - Sube el archivo PRIVACY_POLICY.md
   - Activa GitHub Pages
   - Usa la URL generada (ej: `https://tuusuario.github.io/mib2-privacy/`)
   
   **Opción B: Usar un servicio gratuito**
   - [Termly](https://termly.io/) - Genera y hospeda políticas gratis
   - [PrivacyPolicies.com](https://www.privacypolicies.com/) - Similar

3. Ingresa la URL de tu política de privacidad

---

## Paso 6: Seguridad de los Datos

1. Ve a **Política > Contenido de la app > Seguridad de los datos**
2. Responde el cuestionario:
   - **¿Tu app recopila o comparte datos de usuario?** No
   - **¿Tu app recopila alguno de estos tipos de datos?** No (para todas las categorías)
3. Marca: **"Los datos se cifran en tránsito"** (aunque no hay tránsito, es buena práctica)
4. Marca: **"Los usuarios pueden solicitar que se eliminen los datos"** (mediante desinstalación)

---

## Paso 7: Configuración de la App

1. Ve a **Política > Contenido de la app**
2. Completa todas las secciones requeridas:
   - **Anuncios:** No contiene anuncios
   - **Acceso a la app:** Acceso abierto (no requiere login)
   - **Clasificación del contenido:** Ya completado
   - **Público objetivo:** 18+ (herramienta técnica)
   - **App de noticias:** No

---

## Paso 8: Subir el AAB

1. Ve a **Versión > Producción**
2. Click en **"Crear nueva versión"**
3. **App Bundle:** 
   - Descarga el AAB desde: https://expo.dev/accounts/feplazas/projects/mib2_controller/builds/4cb7a7ae-b106-4741-9d62-2151c8d35b97
   - Sube el archivo `.aab` descargado
4. **Nombre de la versión:** 1.1.0 (42)
5. **Notas de la versión:** (copiar de STORE_LISTING.md - sección Changelog)

---

## Paso 9: Revisión Final

1. Ve a **Panel de control**
2. Verifica que todas las tareas estén completadas (✓ verde)
3. Si hay tareas pendientes, completa cada una

---

## Paso 10: Enviar para Revisión

1. Ve a **Versión > Producción**
2. Click en **"Revisar versión"**
3. Verifica los cambios
4. Click en **"Iniciar lanzamiento en Producción"**

---

## Tiempos de Revisión

- **Primera revisión:** 3-7 días hábiles
- **Actualizaciones posteriores:** 1-3 días hábiles

---

## Checklist Final

- [ ] Cuenta de desarrollador de Google Play activa
- [ ] AAB descargado de EAS
- [ ] Icono 512x512 subido
- [ ] Feature graphic subido
- [ ] Al menos 2 screenshots subidos
- [ ] Descripción corta completada
- [ ] Descripción larga completada
- [ ] Política de privacidad hospedada y URL ingresada
- [ ] Cuestionario de clasificación completado
- [ ] Seguridad de datos completada
- [ ] Todas las declaraciones de política aceptadas

---

## Contacto de Soporte

Si tienes problemas durante el proceso:
- [Centro de ayuda de Google Play Console](https://support.google.com/googleplay/android-developer)
- [Comunidad de desarrolladores](https://support.google.com/googleplay/android-developer/community)

---

**Desarrollador:** Felipe Plazas  
**Versión:** 1.1.0  
**Build:** 42  
**Fecha:** 25 de Enero de 2026
