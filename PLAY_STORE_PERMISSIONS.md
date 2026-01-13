# Justificación de Permisos - Google Play Console

Este documento proporciona las justificaciones requeridas por Google Play Console para cada permiso solicitado por MIB2 Controller.

## Permisos Declarados en AndroidManifest.xml

### 1. INTERNET
**Permiso:** `android.permission.INTERNET`  
**Tipo:** Normal (no requiere solicitud explícita al usuario)

**Justificación:**
La aplicación establece conexiones TCP directas con unidades de infoentretenimiento MIB2 a través de la red local del usuario. Este permiso es esencial para:
- Conectarse al puerto Telnet (23) de la unidad MIB2
- Enviar comandos de configuración y diagnóstico
- Recibir respuestas del sistema MIB2
- Consultar la API opcional de vwcoding.ru para generación de códigos FEC

**Uso en el código:**
- `lib/telnet-client.ts`: Cliente Telnet usando `react-native-tcp-socket`
- `lib/fec-generator.ts`: Consultas HTTP a API externa (opcional)

---

### 2. ACCESS_NETWORK_STATE
**Permiso:** `android.permission.ACCESS_NETWORK_STATE`  
**Tipo:** Normal (no requiere solicitud explícita al usuario)

**Justificación:**
La aplicación necesita detectar el estado de la conexión de red para:
- Verificar que el dispositivo está conectado a una red local (WiFi o Ethernet)
- Detectar adaptadores USB-Ethernet conectados
- Obtener la dirección IP del adaptador de red
- Validar conectividad antes de intentar escanear la red MIB2

**Uso en el código:**
- `modules/network-info/android/src/main/java/com/mib2controller/networkinfo/NetworkInfoModule.kt`: Detección de interfaces de red
- `app/(tabs)/index.tsx`: Validación de conectividad antes de escaneo

---

### 3. POST_NOTIFICATIONS
**Permiso:** `android.permission.POST_NOTIFICATIONS`  
**Tipo:** Dangerous (requiere solicitud explícita en Android 13+)

**Justificación:**
La aplicación muestra notificaciones para informar al usuario sobre:
- Estado de operaciones críticas (backup, parcheo de sistema)
- Finalización de procesos largos (escaneo de red, instalación de Toolbox)
- Advertencias de seguridad (conexión perdida durante operación crítica)

**Uso en el código:**
- `expo-notifications`: Notificaciones de estado de operaciones
- Las notificaciones son informativas y NO invasivas

**Nota:** El usuario puede denegar este permiso sin afectar la funcionalidad principal de la app.

---

### 4. USB Host (Feature)
**Feature:** `android.hardware.usb.host`  
**Tipo:** Feature declaration (no es un permiso runtime)

**Justificación:**
La aplicación detecta adaptadores USB-Ethernet conectados al dispositivo Android para:
- Identificar el adaptador ASIX AX88772 o similar
- Obtener información de la interfaz de red USB
- Validar que el adaptador tiene una IP asignada antes de escanear

**Uso en el código:**
- `modules/usb-native/android/src/main/java/com/mib2controller/usb/UsbNativeModule.kt`: Detección de dispositivos USB OTG

**Nota:** Este feature NO requiere permiso runtime, solo declara compatibilidad con USB OTG.

---

## Permisos NO Solicitados

Para cumplir con las políticas de Google Play, confirmamos que la aplicación **NO solicita** los siguientes permisos sensibles:

❌ **ACCESS_FINE_LOCATION** - NO rastreamos ubicación  
❌ **READ_CONTACTS** - NO accedemos a contactos  
❌ **CAMERA** - NO usamos la cámara  
❌ **RECORD_AUDIO** - NO grabamos audio  
❌ **READ_EXTERNAL_STORAGE** - NO accedemos a archivos personales  
❌ **WRITE_EXTERNAL_STORAGE** - NO escribimos en almacenamiento compartido  
❌ **READ_PHONE_STATE** - NO leemos estado del teléfono  
❌ **GET_ACCOUNTS** - NO accedemos a cuentas del usuario

---

## Data Safety Declaration (Cuestionario de Play Console)

### ¿La app recopila o comparte datos de usuario?
**Respuesta:** NO

### ¿La app transmite datos fuera del dispositivo?
**Respuesta:** SÍ (solo para funcionalidad opcional de generación de códigos FEC)

**Detalles:**
- **Tipo de datos:** Modelo de vehículo, región (NO datos personales)
- **Destino:** API pública de vwcoding.ru
- **Propósito:** Generar códigos de habilitación de funciones
- **Opcional:** El usuario debe activar esta función manualmente
- **Cifrado:** HTTPS

### ¿La app maneja datos sensibles?
**Respuesta:** NO

### ¿La app cumple con el Programa de Familias?
**Respuesta:** NO (app para mayores de 18 años)

---

## Clasificación de Contenido

### Categoría Principal
**Herramientas / Tools**

### Público Objetivo
**Mayores de 18 años** (requiere conocimientos técnicos avanzados)

### Contenido
- Herramienta técnica de diagnóstico y modificación
- Advertencias de seguridad sobre riesgos de bricking
- NO contiene violencia, lenguaje inapropiado ni contenido para adultos

---

## Cumplimiento de Políticas

### Política de Dispositivos y Redes
✅ La app NO interfiere con otras aplicaciones  
✅ La app NO modifica configuraciones del dispositivo Android  
✅ La app solo se comunica con dispositivos MIB2 en la red local

### Política de Permisos
✅ Todos los permisos tienen justificación clara  
✅ Los permisos se solicitan en contexto (cuando el usuario intenta usar la función)  
✅ La app funciona con permisos denegados (con funcionalidad reducida)

### Política de Datos de Usuario
✅ NO recopilamos datos personales  
✅ NO compartimos datos con terceros  
✅ NO usamos servicios de análisis o publicidad

---

## Contacto para Revisión

Si el equipo de Google Play requiere información adicional sobre el uso de permisos, pueden contactar a:

**Email:** [TU_EMAIL]  
**Proyecto:** https://github.com/[TU_USUARIO]/mib2-controller
