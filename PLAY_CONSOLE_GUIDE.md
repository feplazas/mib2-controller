# Guía Completa para Subir MIB2 Controller a Google Play Console

**Autor:** Felipe Plazas  
**Fecha:** 26 de enero de 2026  
**Versión de la app:** 1.1.0 (versionCode 48)

---

## 📋 Checklist de Requisitos Completados

### ✅ Archivos Técnicos
- [x] **AAB de producción** generado con EAS Build (profile: production)
- [x] **ProGuard/R8** configurado para minificación y ofuscación
- [x] **Firma digital** con keystore de Expo (Build Credentials evIXv6BtNF)
- [x] **expo-doctor** pasa todos los checks (17/17)
- [x] **.easignore** configurado para reducir tamaño de upload

### ✅ Documentación Legal
- [x] **Política de privacidad** (PRIVACY_POLICY_PLAYSTORE.md v3.0)
- [x] **URL pública** de política: https://github.com/feplazas/mib2-controller/blob/main/PRIVACY.md
- [x] **Análisis de legalidad** incluido en descripción

### ✅ Metadatos de la Tienda
- [x] **Nombre de la app:** MIB2 Controller
- [x] **Descripción corta** (80 caracteres)
- [x] **Descripción completa** (4000 caracteres) con análisis legal
- [x] **Categoría:** Tools
- [x] **Clasificación de contenido:** Everyone
- [x] **Keywords/Tags** definidos

### ✅ Assets Visuales
- [x] **Icono de la app** (512x512 PNG)
- [x] **Feature graphic** (1024x500 PNG)
- [x] **Screenshots** preparados (mínimo 2, recomendado 8)
- [x] **Promotional text** (170 caracteres)

---

## 🚀 Pasos para Subir a Play Console

### 1. Acceder a Play Console

1. Ve a https://play.google.com/console
2. Inicia sesión con tu cuenta de desarrollador de Google
3. Selecciona "MIB2 Controller" (o crea una nueva app si es la primera vez)

### 2. Subir el AAB

**Ubicación del AAB:**
El AAB se descargará automáticamente desde EAS Build cuando termine la compilación. Puedes acceder al build desde:
- URL del build: https://expo.dev/accounts/feplazas/projects/mib2_controller/builds

**Pasos en Play Console:**
1. Ve a **Producción** > **Versiones** > **Crear nueva versión**
2. Haz clic en **Subir** y selecciona el archivo `.aab`
3. Espera a que se procese el archivo
4. Revisa que no haya errores o advertencias

### 3. Completar el Store Listing

#### Detalles de la Aplicación

**Nombre de la app:**
```
MIB2 Controller
```

**Descripción corta:**
```
Control remoto para unidades MIB2 STD2 Technisat Preh sin navegación
```

**Descripción completa:**
Copia el contenido de `store-listing.md` (líneas 10-92) que incluye:
- Características principales
- Compatibilidad
- Advertencias importantes
- Análisis de legalidad
- Soporte

**Promotional text:**
```
Desbloquea CarPlay, Android Auto y más funciones ocultas en tu MIB2 STD2 Technisat Preh. Spoofing USB automático y terminal Telnet integrado.
```

#### Gráficos

1. **Icono de la aplicación** (512x512 PNG)
   - Ubicación: `assets/images/icon.png`
   - Formato: PNG de 32 bits
   - Tamaño: 512x512 píxeles

2. **Feature Graphic** (1024x500 PNG)
   - Ubicación: `play-store-assets/feature_graphic_1024x500.png`
   - Formato: PNG o JPEG
   - Tamaño: 1024x500 píxeles

3. **Screenshots** (mínimo 2, máximo 8)
   - Ubicación: `play-store-assets/screenshots/`
   - Formato: PNG o JPEG
   - Tamaño: Entre 320px y 3840px en el lado más largo
   - Relación de aspecto: 16:9 o 9:16

**Screenshots recomendados:**
1. Home screen con detección de adaptador
2. Auto-Spoof screen con proceso de spoofing
3. Telnet Terminal con comandos
4. FEC Codes screen
5. Toolbox installation guide
6. EEPROM Backups management
7. Settings screen
8. USB device detection

#### Categorización

- **Categoría:** Tools
- **Tags:** MIB2, Volkswagen, VW, Seat, Skoda, CarPlay, Android Auto, Toolbox, USB, Telnet, FEC

### 4. Clasificación de Contenido

1. Ve a **Clasificación de contenido**
2. Completa el cuestionario:
   - **Violencia:** No
   - **Contenido sexual:** No
   - **Lenguaje inapropiado:** No
   - **Drogas:** No
   - **Apuestas:** No
   - **Contenido generado por usuarios:** No
   - **Compras dentro de la app:** No
   - **Publicidad:** No

3. Resultado esperado: **Everyone** (Todos)

### 5. Política de Privacidad

1. Ve a **Política de privacidad**
2. Ingresa la URL: `https://github.com/feplazas/mib2-controller/blob/main/PRIVACY.md`
3. Verifica que la URL sea accesible públicamente

### 6. Seguridad de Datos

**Recopilación de datos:**
- ❌ La app NO recopila datos personales
- ❌ La app NO comparte datos con terceros
- ✅ Todos los datos se almacenan localmente en el dispositivo

**Prácticas de seguridad:**
- ✅ Los datos se cifran en tránsito (Telnet sobre red local)
- ✅ Los backups se cifran con AES-256
- ✅ Los usuarios pueden solicitar la eliminación de datos (desinstalando la app)

### 7. Permisos de la App

La app solicita los siguientes permisos:

| Permiso | Justificación |
|---------|---------------|
| `POST_NOTIFICATIONS` | Para notificar al usuario sobre el progreso de operaciones críticas |
| `USB_HOST` (implícito) | Para comunicarse con adaptadores USB-Ethernet |
| `INTERNET` (implícito) | Para conectarse a la unidad MIB2 vía Telnet en red local |

**Nota:** Todos los permisos están justificados en la funcionalidad principal de la app.

### 8. Países y Regiones

**Distribución recomendada:**
- ✅ Europa (Alemania, España, Reino Unido, Francia, Italia, Polonia)
- ✅ América (Estados Unidos, Canadá, México, Brasil, Argentina)
- ✅ Asia-Pacífico (Australia)

**Países a evitar:**
- ❌ China (requiere licencias especiales)
- ❌ Rusia (sanciones y restricciones)

### 9. Precios y Distribución

- **Precio:** Gratis
- **Compras dentro de la app:** No
- **Publicidad:** No
- **Distribución:** Google Play Store únicamente

### 10. Revisión y Envío

1. Revisa todos los campos completados
2. Verifica que no haya errores o advertencias
3. Haz clic en **Revisar versión**
4. Lee el resumen de la versión
5. Haz clic en **Iniciar lanzamiento en producción**

---

## ⏱️ Tiempos de Revisión

- **Primera versión:** 1-7 días (puede requerir revisión manual)
- **Actualizaciones:** 1-3 días
- **Cambios menores:** Algunas horas

---

## ⚠️ Posibles Problemas y Soluciones

### Problema: "La app requiere permisos peligrosos"

**Solución:**
- Justifica cada permiso en la sección de "Seguridad de datos"
- Explica claramente por qué el permiso es necesario para la funcionalidad principal

### Problema: "La app modifica el sistema"

**Solución:**
- Aclara que la app NO modifica el sistema Android
- Explica que solo modifica hardware externo (adaptadores USB) con consentimiento explícito del usuario
- Incluye advertencias claras en la descripción

### Problema: "Falta política de privacidad"

**Solución:**
- Verifica que la URL sea accesible públicamente
- Asegúrate de que el contenido sea claro y completo
- Usa HTTPS (GitHub lo proporciona automáticamente)

### Problema: "Screenshots insuficientes"

**Solución:**
- Sube al menos 2 screenshots (recomendado 8)
- Asegúrate de que muestren la funcionalidad principal
- Usa resolución alta y texto legible

---

## 📊 Análisis de Legalidad

**Incluido en la descripción de Play Store:**

La aplicación MIB2 Controller es completamente legal bajo las siguientes consideraciones:

1. **Modificación de hardware propio:** Los usuarios tienen derecho a modificar sus propios dispositivos (adaptadores USB) sin violar ninguna ley.

2. **Acceso a sistemas propios:** El acceso vía Telnet a la unidad MIB2 se realiza en la red local del usuario, sobre hardware de su propiedad.

3. **No incluye software pirateado:** La app NO incluye códigos FEC ilegales ni software con derechos de autor de terceros.

4. **Herramienta de diagnóstico:** La funcionalidad principal es diagnóstico y configuración de sistemas propios del usuario.

5. **Advertencias claras:** La app incluye advertencias explícitas sobre los riesgos y la pérdida de garantía.

6. **Código abierto:** El código fuente está disponible públicamente bajo licencia MIT.

---

## 📞 Contacto y Soporte

**Desarrollador:** Felipe Plazas  
**Email:** feplazas@gmail.com  
**GitHub:** https://github.com/feplazas/mib2-controller  
**Foros:** Comunidad MIB2 en mib2-std2.com y vw-vortex.com

---

## 📝 Notas Finales

- **Versión actual:** 1.1.0 (versionCode 48)
- **Build profile:** production (AAB firmado)
- **Keystore:** Expo Build Credentials evIXv6BtNF
- **Fecha de preparación:** 26 de enero de 2026

**Próximos pasos después de la aprobación:**
1. Monitorear reseñas y calificaciones
2. Responder a comentarios de usuarios
3. Recopilar feedback para futuras versiones
4. Actualizar regularmente con mejoras y correcciones

---

**¡Buena suerte con el lanzamiento!** 🚀
