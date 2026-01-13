# Política de Privacidad - MIB2 Controller

**Última actualización:** 13 de enero de 2026

## 1. Introducción

MIB2 Controller ("la Aplicación") es una herramienta técnica diseñada para interactuar con unidades de infoentretenimiento MIB2 (Modular Infotainment Platform 2) de Volkswagen Group a través de conexiones de red locales. Esta política de privacidad describe cómo la Aplicación maneja la información del usuario.

## 2. Información que NO Recopilamos

**La Aplicación NO recopila, almacena ni transmite ningún dato personal del usuario a servidores externos.** Específicamente:

- ❌ NO recopilamos información de identificación personal
- ❌ NO accedemos a contactos, mensajes, fotos o archivos personales
- ❌ NO rastreamos la ubicación del dispositivo
- ❌ NO utilizamos servicios de análisis o publicidad
- ❌ NO compartimos datos con terceros
- ❌ NO almacenamos credenciales o contraseñas

## 3. Datos Almacenados Localmente

La Aplicación almacena únicamente datos técnicos de configuración en el dispositivo del usuario de forma local:

### 3.1 Configuración de Conexión
- Dirección IP de la unidad MIB2
- Puerto Telnet (por defecto 23)
- Historial de IPs conectadas

### 3.2 Preferencias de la Aplicación
- Tema visual (claro/oscuro)
- Configuración de interfaz

### 3.3 Backups de Seguridad
- Copias de seguridad de archivos del sistema MIB2 (almacenadas localmente)
- Checksums MD5 de archivos respaldados

**Todos estos datos permanecen exclusivamente en el dispositivo del usuario y NO se transmiten a ningún servidor externo.**

## 4. Permisos de Android

La Aplicación requiere los siguientes permisos de Android para su funcionamiento:

### 4.1 INTERNET
**Justificación:** Necesario para establecer conexiones TCP con la unidad MIB2 a través de la red local (WiFi o Ethernet).

### 4.2 ACCESS_NETWORK_STATE
**Justificación:** Permite detectar el estado de la conexión de red y verificar la disponibilidad del adaptador USB-Ethernet.

### 4.3 POST_NOTIFICATIONS
**Justificación:** Permite mostrar notificaciones sobre el estado de operaciones críticas (backups, instalaciones).

### 4.4 USB Host (OTG)
**Justificación:** Permite detectar y comunicarse con adaptadores USB-Ethernet conectados al dispositivo Android.

## 5. Comunicación de Red

### 5.1 Conexiones Locales
La Aplicación establece conexiones TCP directas con la unidad MIB2 a través de la red local del usuario. **Estas conexiones son punto a punto y NO pasan por servidores intermedios.**

### 5.2 API Externa (vwcoding.ru)
La Aplicación puede realizar consultas opcionales a la API pública de vwcoding.ru para generar códigos FEC (Feature Enabling Codes). Esta funcionalidad es:
- **Opcional:** El usuario debe activarla manualmente
- **Anónima:** NO se envía información personal
- **Transparente:** El usuario ve exactamente qué datos se envían (modelo de vehículo, región)

## 6. Seguridad

### 6.1 Almacenamiento Local
Todos los datos se almacenan en el almacenamiento privado de la Aplicación, protegido por el sandbox de Android.

### 6.2 Comunicaciones
Las conexiones Telnet con la unidad MIB2 NO están cifradas (limitación del protocolo Telnet). **El usuario debe usar la Aplicación únicamente en redes locales confiables.**

## 7. Responsabilidad del Usuario

### 7.1 Uso Bajo Riesgo Propio
La Aplicación permite modificar el sistema operativo de la unidad MIB2. **El usuario asume toda la responsabilidad por:**
- Daños a la unidad MIB2 (bricking)
- Pérdida de garantía del vehículo
- Violación de términos de servicio del fabricante

### 7.2 Cumplimiento Legal
El usuario es responsable de cumplir con las leyes locales sobre modificación de sistemas electrónicos de vehículos.

## 8. Derechos del Usuario

### 8.1 Acceso y Eliminación de Datos
El usuario puede eliminar todos los datos locales de la Aplicación en cualquier momento a través de:
- Configuración de Android → Aplicaciones → MIB2 Controller → Borrar datos
- Desinstalación de la Aplicación

### 8.2 Portabilidad
Los backups y configuraciones se almacenan en formatos estándar (archivos de texto, JSON) y pueden ser exportados manualmente.

## 9. Cambios en esta Política

Cualquier cambio en esta política de privacidad se publicará en esta página y se notificará a través de actualizaciones de la Aplicación.

## 10. Contacto

Para preguntas sobre esta política de privacidad, contacta a:

**Email:** [TU_EMAIL]  
**Proyecto:** https://github.com/[TU_USUARIO]/mib2-controller

## 11. Jurisdicción

Esta política de privacidad se rige por las leyes de [TU_PAÍS/REGIÓN].

---

**Resumen:** MIB2 Controller NO recopila datos personales. Toda la información se almacena localmente en tu dispositivo. Las conexiones con la unidad MIB2 son directas y locales. Usas la Aplicación bajo tu propio riesgo.
