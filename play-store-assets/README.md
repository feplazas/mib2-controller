# Play Store Assets - MIB2 USB Controller

Esta carpeta contiene todos los assets necesarios para publicar la app en Google Play Store.

---

## 📁 Estructura de Carpetas

```
play-store-assets/
├── feature-graphic/          # Banner principal (1024x500)
│   └── feature_graphic_final_updated.jpg
├── screenshots/              # Capturas de pantalla (1080x1920)
│   └── [Pendiente: capturar 2-8 screenshots]
├── app-icon/                 # Icono de la app (512x512)
│   └── icon-512x512.png
└── README.md                 # Este archivo
```

---

## ✅ Assets Completados

### 1. Feature Graphic ✅
**Archivo:** `feature-graphic/feature_graphic_final_updated.jpg`
- **Dimensiones:** 1024 x 500 píxeles
- **Tamaño:** 120 KB (< 512 KB límite)
- **Formato:** JPG optimizado
- **Contenido:** 
  - Unidad MIB2 STD2 Volkswagen (izquierda)
  - Título "MIB2 CONTROLLER" (centro)
  - Screenshot real del Home de la app (derecha)
  - Iconos de características (inferior)
  - Gradiente tech azul-púrpura con efectos de luz

**Uso:** Subir en Play Console → Store presence → Graphic assets → Feature graphic

---

### 2. App Icon ✅
**Archivo:** `app-icon/icon-512x512.png`
- **Dimensiones:** 512 x 512 píxeles (recomendado para Play Store)
- **Formato:** PNG con transparencia
- **Contenido:** Logo LOGOMIB2 profesional

**Uso:** Subir en Play Console → Store presence → Graphic assets → App icon

---

## 🔴 Assets Pendientes

### 3. Screenshots ❌
**Ubicación:** `screenshots/`
**Requisitos:**
- **Cantidad:** Mínimo 2, máximo 8 capturas
- **Dimensiones:** 1080 x 1920 píxeles (portrait)
- **Formato:** PNG o JPG
- **Tamaño máximo:** 8 MB por imagen

**Pantallas sugeridas para capturar:**
1. **Home (Disconnected)** - Pantalla principal sin conexión
2. **Home (Connected)** - Pantalla principal conectada con estado verde
3. **USB Module** - Información del módulo USB conectado
4. **Spoofing** - Pantalla de spoofing de chipsets
5. **FEC Generator** - Generador de códigos FEC
6. **Diagnostic** - Herramientas de diagnóstico con logs
7. **Telnet** - Terminal Telnet con comandos
8. **Settings** - Configuración con selector de idioma

**Cómo capturar:**
1. Instala el APK en un dispositivo Android
2. Usa las funciones de la app
3. Captura pantallas con el botón de screenshot del dispositivo
4. Transfiere las imágenes a esta carpeta
5. Renombra como: `01_home.png`, `02_usb_module.png`, etc.

---

## 📋 Checklist de Publicación

### Assets Visuales
- [x] Feature Graphic (1024x500)
- [x] App Icon (512x512)
- [ ] Screenshots (mínimo 2, máximo 8)
- [ ] Promo Graphic (opcional, 180x120)
- [ ] Promo Video (opcional, YouTube URL)

### Textos
- [x] Descripción corta (80 caracteres) - Ver `PLAY_STORE_LISTING.md`
- [x] Descripción larga (4000 caracteres) - Ver `PLAY_STORE_LISTING.md`
- [x] Título de la app (30 caracteres) - "MIB2 USB Controller"
- [ ] Categoría - Herramientas (Tools)
- [ ] Tags/Keywords - "MIB2, Volkswagen, USB, Telnet, Diagnostic"

### Información Legal
- [x] Política de privacidad - https://feplazas.github.io/mib2-controller/privacy-policy.html
- [ ] Términos de servicio (opcional)
- [ ] Clasificación de contenido - PEGI 3 / Everyone
- [ ] Data Safety Form - Ver `PLAY_STORE_REQUIREMENTS.md`

### Archivos de Build
- [x] APK de producción - Disponible (para distribución directa)
- [ ] AAB de producción - Pendiente (requerido para Play Store)

### Cuenta y Configuración
- [ ] Cuenta Play Developer ($25 USD único pago)
- [ ] Aplicación creada en Play Console
- [ ] Firma de la app configurada
- [ ] Países de distribución seleccionados

---

## 🚀 Pasos para Subir Assets

### Paso 1: Acceder a Play Console
1. Ve a https://play.google.com/console
2. Inicia sesión con tu cuenta Google
3. Selecciona tu aplicación "MIB2 USB Controller"

### Paso 2: Navegar a Graphic Assets
1. En el menú izquierdo, haz clic en **Store presence**
2. Luego haz clic en **Graphic assets**

### Paso 3: Subir Feature Graphic
1. Busca la sección **Feature graphic**
2. Haz clic en **Upload image**
3. Selecciona: `play-store-assets/feature-graphic/feature_graphic_final_updated.jpg`
4. Verifica la vista previa
5. Guarda cambios

### Paso 4: Subir App Icon
1. Busca la sección **App icon**
2. Haz clic en **Upload image**
3. Selecciona: `play-store-assets/app-icon/icon-512x512.png`
4. Verifica la vista previa
5. Guarda cambios

### Paso 5: Subir Screenshots
1. Busca la sección **Phone screenshots**
2. Haz clic en **Upload images**
3. Selecciona todas las capturas de `play-store-assets/screenshots/`
4. Arrastra para reordenar (la primera será la principal)
5. Guarda cambios

---

## 📊 Especificaciones Técnicas

### Feature Graphic
| Parámetro | Valor |
|-----------|-------|
| Dimensiones | 1024 x 500 px |
| Proporción | 2.048:1 |
| Formato | JPG o PNG |
| Tamaño máximo | 512 KB |
| Ubicación | Banner superior de la ficha |

### Screenshots
| Parámetro | Valor |
|-----------|-------|
| Dimensiones | 1080 x 1920 px (portrait) |
| Proporción | 9:16 |
| Formato | PNG o JPG |
| Tamaño máximo | 8 MB por imagen |
| Cantidad | Mínimo 2, máximo 8 |

### App Icon
| Parámetro | Valor |
|-----------|-------|
| Dimensiones | 512 x 512 px |
| Formato | PNG con transparencia |
| Tamaño máximo | 1 MB |
| Ubicación | Icono en Play Store |

---

## 💡 Consejos para Screenshots

### Buenas Prácticas
✅ Muestra las características principales de la app
✅ Usa la app en estado funcional (conectada, con datos)
✅ Captura en alta resolución (1080x1920)
✅ Ordena de más importante a menos importante
✅ La primera imagen es la más visible

### Evitar
❌ Screenshots con errores o estados vacíos
❌ Imágenes borrosas o de baja calidad
❌ Demasiado texto superpuesto
❌ Información personal visible

### Orden Sugerido
1. Home conectado (muestra funcionalidad principal)
2. USB Module (característica clave)
3. Diagnostic con logs (funcionalidad avanzada)
4. FEC Generator (herramienta útil)
5. Spoofing (característica técnica)
6. Telnet (terminal avanzado)
7. Settings con idiomas (personalización)
8. Toolbox (herramientas adicionales)

---

## 🔄 Actualizar Assets

Si necesitas actualizar algún asset después de publicar:

1. Ve a Play Console → Store presence → Graphic assets
2. Haz clic en el icono de editar (lápiz) del asset
3. Sube la nueva versión
4. Guarda cambios
5. Los cambios se reflejarán en 2-3 horas

---

## 📝 Notas Finales

- Todos los assets en esta carpeta están optimizados para Play Store
- Los archivos cumplen con las especificaciones técnicas requeridas
- Guarda copias de backup de todos los assets
- Actualiza este README cuando agregues nuevos assets
- Para más información, consulta `PLAY_STORE_REQUIREMENTS.md`

---

**Estado actual:** 2/3 tipos de assets completados (Feature Graphic ✅, App Icon ✅, Screenshots ❌)

**Próximo paso:** Capturar 2-8 screenshots de la app en funcionamiento.
