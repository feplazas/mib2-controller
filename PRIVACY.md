# Política de Privacidad - MIB2 USB Controller

**Última actualización:** 14 de enero de 2026  
**Versión:** 3.0  
**Desarrollador:** Felipe Plazas  
**Contacto:** feplazas@gmail.com  
**Sitio Web:** https://github.com/feplazas/mib2-controller

---

## 1. Introducción

**MIB2 USB Controller** (en adelante, "la Aplicación") es una herramienta técnica especializada diseñada para permitir la comunicación, diagnóstico y modificación de unidades de infoentretenimiento MIB2 Standard 2 del Volkswagen Group a través de conexiones USB-Ethernet y Telnet. Esta política de privacidad describe de manera exhaustiva cómo la Aplicación maneja, procesa y protege la información del usuario.

Esta política se aplica a todas las versiones de MIB2 USB Controller distribuidas a través de Google Play Store. Al instalar y utilizar la Aplicación, el usuario acepta los términos establecidos en esta política de privacidad.

**Compromiso fundamental:** MIB2 USB Controller está diseñada bajo el principio de **privacidad por diseño** (privacy by design). La Aplicación **NO recopila, almacena ni transmite datos personales identificables del usuario a servidores externos**. Toda la funcionalidad opera exclusivamente en el dispositivo del usuario y en su red local.

---

## 2. Información que NO Recopilamos

Para garantizar la máxima transparencia, aclaramos qué tipos de información la Aplicación **NO recopila, procesa ni transmite**:

| Tipo de Información | Estado |
|---------------------|--------|
| Datos de identificación personal (nombre, DNI, etc.) | ❌ NO recopilados |
| Información de contacto (email, teléfono, dirección) | ❌ NO recopilados |
| Datos de ubicación (GPS, ubicación aproximada) | ❌ NO recopilados |
| Contactos y agenda telefónica | ❌ NO accedidos |
| Archivos multimedia personales (fotos, videos) | ❌ NO accedidos |
| Información financiera (tarjetas, cuentas bancarias) | ❌ NO recopilados |
| Credenciales de autenticación (contraseñas, tokens) | ❌ NO almacenados externamente |
| Identificadores de dispositivo (IMEI, Android ID) | ❌ NO recopilados |
| Información del vehículo (VIN, matrícula) | ❌ NO transmitidos externamente |
| Historial de navegación web | ❌ NO recopilados |
| Lista de aplicaciones instaladas | ❌ NO recopilados |
| Datos biométricos | ❌ NO recopilados |

**Servicios de terceros NO utilizados:** La Aplicación no integra ningún servicio de análisis (Google Analytics, Firebase Analytics), publicidad (AdMob), seguimiento de comportamiento, ni redes sociales. No existen SDKs de terceros que puedan recopilar datos en segundo plano.

---

## 3. Datos Procesados Localmente

La Aplicación almacena exclusivamente datos técnicos de configuración en el almacenamiento privado del dispositivo Android del usuario. Estos datos **nunca abandonan el dispositivo**.

### 3.1 Configuración de Conexión

Para permitir la reconexión rápida a unidades MIB2 previamente utilizadas, la Aplicación almacena localmente:

- Dirección IP de la unidad MIB2 (ejemplo: 192.168.1.100)
- Puerto Telnet (por defecto 23)
- Historial de conexiones recientes (últimas 10 direcciones IP)
- Timestamp de última conexión exitosa

**Propósito:** Facilitar la reconexión sin requerir que el usuario reingrese manualmente la dirección IP en cada sesión.

**Ubicación:** Almacenamiento privado de la app (`/data/data/[bundle_id]/shared_prefs/`)

### 3.2 Información de Hardware USB

Cuando se conecta un adaptador USB-Ethernet, la Aplicación detecta y almacena localmente:

- Vendor ID (VID) y Product ID (PID) del adaptador USB
- Tipo de EEPROM detectado (EEPROM modificable vs eFuse no modificable)
- Dirección IP y máscara de subred del adaptador
- Resultado de verificación de compatibilidad

**Propósito:** Prevenir operaciones de spoofing en adaptadores con eFuse que podrían resultar en daño permanente del hardware (bricking).

**Ubicación:** Almacenamiento privado de la app

### 3.3 Backups de Seguridad

Antes de realizar operaciones críticas de modificación de EEPROM, la Aplicación crea copias de seguridad locales:

- Contenido original del EEPROM del adaptador USB
- Checksum MD5 para verificación de integridad
- Metadata del backup (fecha, hora, información del dispositivo)
- Registro de operaciones realizadas

**Propósito:** Permitir la restauración del adaptador a su estado original en caso de problemas.

**Ubicación:** Almacenamiento privado de la app (`/data/data/[bundle_id]/files/backups/`)

**Cifrado:** Todos los backups se cifran automáticamente con AES-256 usando claves almacenadas en hardware-backed secure storage (Android Keystore) en dispositivos compatibles.

**Retención:** Los backups se conservan indefinidamente hasta que el usuario los elimine manualmente o desinstale la Aplicación.

### 3.4 Preferencias de Usuario

La Aplicación almacena preferencias de interfaz localmente:

- Tema visual (claro, oscuro, automático)
- Idioma seleccionado (español, inglés, alemán)
- Estado de confirmaciones de seguridad
- PIN de modo experto (almacenado cifrado en Secure Storage)

**Propósito:** Mejorar la experiencia de usuario manteniendo consistencia entre sesiones.

### 3.5 Logs de Diagnóstico

Para facilitar la resolución de problemas, la Aplicación mantiene logs técnicos temporales:

- Logs de conexión Telnet (últimas 100 líneas)
- Logs de operaciones USB
- Logs de errores para debugging

**Retención:** Los logs se rotan automáticamente, manteniendo solo los últimos 7 días de actividad. El usuario puede eliminarlos manualmente en cualquier momento desde la pantalla de Diagnóstico.

**Importante:** Los logs NO se transmiten automáticamente. Si el usuario desea compartirlos para soporte técnico, debe exportarlos manualmente.

---

## 4. Permisos de Android Requeridos

La Aplicación solicita los siguientes permisos del sistema Android con justificación técnica específica:

### 4.1 USB Host (`android.hardware.usb.host`)

**Tipo:** Feature requerido (dispositivo debe soportar USB OTG)

**Justificación:** Comunicación directa con adaptadores USB-Ethernet para:
- Detección automática de adaptadores ASIX (AX88772/A/B)
- Lectura y escritura de EEPROM mediante control transfers USB
- Verificación de tipo de memoria (EEPROM vs eFuse)
- Creación de backups cifrados antes de modificaciones

**Alcance:** Solo se accede a adaptadores USB-Ethernet específicos. NO se accede a otros dispositivos USB conectados (teclados, ratones, almacenamiento externo).

### 4.2 Internet (`android.permission.INTERNET`)

**Tipo:** Permiso normal (otorgado automáticamente)

**Justificación:** Comunicación Telnet con unidades MIB2 a través de red local:
- Establecer conexiones TCP en puerto 23 con unidades MIB2
- Enviar comandos shell para diagnóstico y configuración
- Transferencia de archivos entre dispositivo y unidad MIB2

**Alcance:** Las conexiones se limitan exclusivamente a dispositivos en la red local del usuario (rango 192.168.x.x, 10.x.x.x, 172.16-31.x.x). NO se realizan conexiones a servidores externos.

**Importante:** A pesar del nombre del permiso, la Aplicación NO accede a Internet. Solo se comunica con dispositivos en la red local del usuario a través del adaptador USB-Ethernet.

### 4.3 Network State (`android.permission.ACCESS_NETWORK_STATE`)

**Tipo:** Permiso normal (otorgado automáticamente)

**Justificación:** Detección automática de configuración de red:
- Detectar dirección IP y máscara de subred del adaptador USB-Ethernet
- Calcular rango de escaneo para detectar unidades MIB2
- Validar conectividad antes de operaciones críticas

**Alcance:** Solo se consulta información de red local. NO se accede a información de redes móviles, WiFi del usuario, ni ubicación basada en red.

---

## 5. Seguridad de los Datos

La Aplicación implementa las siguientes medidas de seguridad:

**Cifrado en reposo:** Todos los backups de EEPROM se cifran con AES-256 usando Android Keystore (hardware-backed en dispositivos compatibles).

**Cifrado en tránsito:** Las comunicaciones Telnet con unidades MIB2 se realizan en red local. El usuario debe ser consciente de que el protocolo Telnet **NO está cifrado** por diseño (limitación del firmware MIB2, no de la Aplicación).

**Almacenamiento privado:** Todos los datos se almacenan en el directorio privado de la Aplicación, inaccesible para otras aplicaciones sin permisos root.

**Validación de entrada:** Todos los comandos y datos ingresados por el usuario se validan antes de su ejecución para prevenir inyección de comandos.

**Confirmaciones de seguridad:** Las operaciones críticas (escritura de EEPROM, comandos peligrosos) requieren confirmación explícita del usuario y están protegidas con PIN en modo experto.

---

## 6. Derechos del Usuario

El usuario tiene los siguientes derechos sobre sus datos:

**Derecho de acceso:** El usuario puede acceder a todos los datos almacenados por la Aplicación navegando a la pantalla de Diagnóstico → Ver Datos Almacenados.

**Derecho de rectificación:** El usuario puede modificar cualquier configuración almacenada (direcciones IP, preferencias, etc.) en cualquier momento.

**Derecho de supresión:** El usuario puede eliminar todos los datos almacenados mediante:
1. Opción "Borrar Todos los Datos" en la pantalla de Configuración
2. Desinstalación de la Aplicación (elimina automáticamente todos los datos)

**Derecho de portabilidad:** El usuario puede exportar sus backups de EEPROM y logs de diagnóstico en cualquier momento mediante la función "Exportar Datos" en la pantalla de Diagnóstico.

**Derecho de oposición:** El usuario puede desactivar funcionalidades específicas (detección USB automática, logs de diagnóstico) en la pantalla de Configuración.

---

## 7. Transferencia Internacional de Datos

**NO APLICABLE:** La Aplicación NO transfiere datos a servidores externos ni a terceros en ninguna jurisdicción. Todos los datos permanecen en el dispositivo del usuario.

---

## 8. Retención de Datos

Los datos almacenados localmente se conservan indefinidamente hasta que el usuario los elimine manualmente o desinstale la Aplicación. No existe retención automática en servidores externos porque no se transmiten datos.

---

## 9. Uso por Menores de Edad

La Aplicación está diseñada para uso técnico avanzado y requiere conocimientos especializados de sistemas MIB2, Linux y redes. **NO está dirigida a menores de 18 años**.

Los padres o tutores legales son responsables de supervisar el uso de dispositivos por parte de menores. Si un menor utiliza la Aplicación, el padre o tutor asume toda la responsabilidad.

---

## 10. Cambios en esta Política de Privacidad

Esta política de privacidad puede actualizarse ocasionalmente para reflejar cambios en la funcionalidad de la Aplicación o en la normativa aplicable. Los cambios significativos se notificarán mediante:

1. Actualización del campo "Última actualización" al inicio de este documento
2. Incremento del número de versión
3. Notificación in-app al abrir la Aplicación después de una actualización

El uso continuado de la Aplicación después de la publicación de cambios constituye la aceptación de la política actualizada.

---

## 11. Cumplimiento Normativo

Esta Aplicación cumple con las siguientes normativas de protección de datos:

**GDPR (Reglamento General de Protección de Datos de la UE):** Aunque la Aplicación NO procesa datos personales según la definición del GDPR, se han implementado principios de privacidad por diseño y por defecto.

**CCPA (California Consumer Privacy Act):** La Aplicación NO vende datos personales ni comparte información con terceros con fines publicitarios.

**LOPDGDD (Ley Orgánica de Protección de Datos y Garantía de los Derechos Digitales de España):** La Aplicación cumple con los principios de transparencia, limitación de finalidad y minimización de datos.

---

## 12. Limitación de Responsabilidad

**IMPORTANTE:** Esta Aplicación permite realizar modificaciones de bajo nivel en hardware (adaptadores USB-Ethernet) y firmware (unidades MIB2). El uso incorrecto puede resultar en:

- Daño permanente ("bricking") de adaptadores USB-Ethernet
- Pérdida de funcionalidad de la unidad MIB2
- Anulación de la garantía del vehículo
- Violación de términos de servicio del fabricante

**El usuario asume toda la responsabilidad por el uso de esta herramienta.** El desarrollador NO se hace responsable de daños directos, indirectos, incidentales o consecuentes derivados del uso de la Aplicación.

La Aplicación incluye múltiples advertencias de seguridad, confirmaciones dobles para operaciones críticas, y sistema de backups automáticos, pero **ninguna medida de seguridad puede prevenir completamente el error humano o problemas de hardware**.

---

## 13. Contacto

Para preguntas, solicitudes de ejercicio de derechos, o reportar problemas relacionados con la privacidad:

**Desarrollador:** Felipe Plazas  
**Email:** feplazas@gmail.com  
**GitHub:** https://github.com/feplazas/mib2-controller  
**Tiempo de respuesta:** Máximo 30 días hábiles

---

## 14. Autoridad de Supervisión

Los usuarios de la Unión Europea tienen derecho a presentar una reclamación ante la autoridad de supervisión de protección de datos de su país si consideran que el procesamiento de sus datos personales infringe el GDPR.

**España - Agencia Española de Protección de Datos (AEPD):**
- Sitio web: https://www.aepd.es
- Teléfono: +34 901 100 099
- Dirección: C/ Jorge Juan, 6, 28001 Madrid, España

Para usuarios en otras jurisdicciones, consultar la autoridad de protección de datos local correspondiente.

---

## 15. Resumen Ejecutivo

Para facilitar la comprensión rápida de esta política, se proporciona el siguiente resumen:

| Aspecto | Resumen |
|---------|---------|
| **Recopilación de datos personales** | ❌ NO se recopilan |
| **Almacenamiento de datos** | ✅ Solo datos técnicos locales |
| **Transmisión a servidores externos** | ❌ NO se transmiten datos |
| **Servicios de terceros** | ❌ NO se utilizan |
| **Cifrado** | ✅ AES-256 para backups locales |
| **Derechos del usuario** | ✅ Acceso, rectificación, supresión garantizados |
| **Cumplimiento normativo** | ✅ GDPR, CCPA, LOPDGDD |
| **Edad mínima** | 🔞 Mayores de 18 años |
| **Cookies y seguimiento** | ❌ NO se utilizan |

**Mensaje principal:** MIB2 USB Controller respeta tu privacidad. NO recopilamos datos personales. Toda la información se almacena localmente en tu dispositivo. Las conexiones con la unidad MIB2 son directas y locales. Usas la Aplicación bajo tu propio riesgo y responsabilidad.

---

**Fecha de entrada en vigor:** 14 de enero de 2026  
**Versión del documento:** 3.0  
**Última revisión:** 14 de enero de 2026

---

**URL de esta política:** [Agregar URL pública donde alojes este documento]

*Este documento ha sido redactado con el objetivo de proporcionar máxima transparencia y cumplimiento con las normativas de protección de datos aplicables. Si tienes dudas sobre cualquier aspecto de esta política, no dudes en contactar al desarrollador.*
