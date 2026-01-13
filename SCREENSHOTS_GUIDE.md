# Guía de Captura de Screenshots para Play Store

Google Play Store requiere **mínimo 2 screenshots** (máximo 8) para publicar la app.

---

## 📱 Requisitos Técnicos

### Formato
- **Tipo:** PNG o JPEG
- **Orientación:** Portrait (vertical) o Landscape (horizontal)
- **Tamaño mínimo:** 320px en el lado más corto
- **Tamaño máximo:** 3840px en el lado más largo
- **Relación de aspecto:** 16:9 o 9:16 (recomendado)

### Cantidad
- **Mínimo:** 2 screenshots
- **Máximo:** 8 screenshots
- **Recomendado:** 4-6 screenshots

---

## 📸 Cómo Capturar Screenshots

### Método 1: Desde el Dispositivo Android

1. **Instala el APK** en tu dispositivo
2. **Abre la app** y navega a la pantalla deseada
3. **Captura screenshot:**
   - **Mayoría de dispositivos:** Botón Power + Volumen Abajo
   - **Samsung:** Botón Power + Home
   - **Xiaomi:** Botón Power + Volumen Abajo (3 dedos deslizar)

4. **Encuentra las capturas:**
   - Galería → Screenshots
   - O en `/sdcard/Pictures/Screenshots/`

5. **Transfiere a PC:**
   - USB cable + File Transfer
   - Google Photos (auto-sync)
   - Email/WhatsApp (calidad reducida, no recomendado)

### Método 2: Usando ADB (Mejor Calidad)

```bash
# Conecta el dispositivo por USB
adb devices

# Captura screenshot directamente a PC
adb exec-out screencap -p > screenshot1.png

# O captura y descarga
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshot1.png
adb shell rm /sdcard/screenshot.png
```

### Método 3: Usando Android Studio Emulator

1. Abre Android Studio
2. Inicia un emulador (Pixel 6, API 34)
3. Instala el APK: `adb install app-release.apk`
4. Usa la app y captura con el botón de cámara del emulador
5. Las capturas se guardan automáticamente en tu PC

---

## 🎨 Screenshots Recomendados

### Screenshot 1: Pantalla Home con Conexión Establecida ⭐
**Objetivo:** Mostrar la interfaz principal y estado de conexión

**Elementos visibles:**
- USB Status: Connected (verde)
- Network Info: IP detectada automáticamente
- Host configurado (192.168.1.1)
- Botones de Quick Scan y Full Scan
- Connection Status: Connected

**Por qué es importante:** Primera impresión, muestra funcionalidad core

---

### Screenshot 2: Scanner de Red Mostrando Dispositivos ⭐
**Objetivo:** Demostrar capacidad de escaneo automático

**Elementos visibles:**
- Lista de dispositivos encontrados
- IPs detectadas
- Puertos abiertos (23 - Telnet)
- Botón "Connect" en cada dispositivo

**Por qué es importante:** Muestra automatización y facilidad de uso

---

### Screenshot 3: Pantalla Toolbox con Instalación Paso a Paso
**Objetivo:** Mostrar proceso guiado de instalación

**Elementos visibles:**
- Lista de 11 pasos numerados
- Paso actual resaltado
- Advertencia crítica de bricking (banner rojo)
- Botones de acción

**Por qué es importante:** Demuestra profesionalismo y seguridad

---

### Screenshot 4: Generador de Códigos FEC
**Objetivo:** Mostrar funcionalidad de generación de códigos

**Elementos visibles:**
- Selector de marca (VW, Audi, SEAT, Škoda)
- Selector de región
- Código FEC generado
- Botón de copiar

**Por qué es importante:** Funcionalidad única y valiosa

---

### Screenshot 5: Pantalla USB Status con Adaptador Conectado
**Objetivo:** Mostrar detección de hardware USB

**Elementos visibles:**
- Chipset detectado (ASIX AX88772)
- Vendor ID y Product ID
- Estado de conexión
- Información de la interfaz

**Por qué es importante:** Demuestra integración con hardware real

---

### Screenshot 6: Diagnósticos en Tiempo Real
**Objetivo:** Mostrar capacidades de diagnóstico

**Elementos visibles:**
- Estado de servicios (Telnet, FTP, SSH)
- Versión de firmware MIB2
- Información de hardware
- Indicadores de compatibilidad

**Por qué es importante:** Muestra profundidad técnica

---

### Screenshot 7: Gestión de Backups (Opcional)
**Objetivo:** Mostrar sistema de seguridad

**Elementos visibles:**
- Lista de backups con fechas
- Checksums MD5
- Botones de restauración
- Tamaño de archivos

**Por qué es importante:** Demuestra responsabilidad y seguridad

---

### Screenshot 8: Pantalla de Advertencias de Seguridad (Opcional)
**Objetivo:** Mostrar transparencia sobre riesgos

**Elementos visibles:**
- Advertencia de bricking
- Confirmación triple
- Checklist de seguridad
- Botones de cancelar/continuar

**Por qué es importante:** Demuestra ética y transparencia

---

## ✅ Checklist de Calidad

Antes de subir a Play Console, verifica:

- [ ] **Resolución adecuada:** Mínimo 1080x1920 (Full HD)
- [ ] **Sin información personal:** No números de teléfono, emails, etc.
- [ ] **Sin marcas de agua:** No logos de terceros
- [ ] **Interfaz limpia:** Sin notificaciones, hora, batería baja
- [ ] **Contenido real:** No datos falsos o mockups
- [ ] **Idioma consistente:** Todos en español o todos en inglés
- [ ] **Orden lógico:** Flujo de uso natural (Home → Scan → Connect → Toolbox)
- [ ] **Buena iluminación:** Pantalla con brillo adecuado

---

## 🎯 Consejos Pro

### 1. Usa Modo Avión
Desactiva notificaciones para capturas limpias

### 2. Configura Hora Genérica
Cambia la hora a 10:00 o 14:00 (estética)

### 3. Batería al 100%
O desactiva indicador de batería

### 4. Usa Dispositivo Real
Los emuladores se ven menos profesionales

### 5. Captura en Modo Claro
El modo oscuro puede verse mal en miniaturas

### 6. Evita Texto Pequeño
Asegúrate de que el texto sea legible en miniaturas

---

## 📤 Subir a Play Console

1. Ve a Google Play Console
2. Abre tu app
3. Ve a **Store presence → Main store listing**
4. Scroll hasta **Phone screenshots**
5. Arrastra y suelta las imágenes (orden importa)
6. Guarda los cambios

---

## 🚀 Orden Recomendado para Play Store

1. **Screenshot 1:** Home con conexión ⭐
2. **Screenshot 2:** Scanner de red ⭐
3. **Screenshot 3:** Toolbox installer
4. **Screenshot 4:** Generador FEC
5. **Screenshot 5:** USB Status
6. **Screenshot 6:** Diagnósticos

**Nota:** Los primeros 2-3 screenshots son los más importantes, aparecen en los resultados de búsqueda.

---

## ⏱️ Tiempo Estimado

- **Captura:** 10-15 minutos
- **Edición (opcional):** 5-10 minutos
- **Subida:** 2-3 minutos

**Total:** ~20-30 minutos

---

**¡Importante!** Usa el APK que acabas de descargar para capturas reales con ProGuard/R8 habilitado.
