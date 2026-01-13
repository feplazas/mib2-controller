# Política de Privacidad - MIB2 Controller

**Última actualización:** 13 de enero de 2026  
**Versión:** 2.0  
**Desarrollador:** Felipe Plazas  
**Contacto:** feplazas@gmail.com

---

## 1. Introducción y Alcance

MIB2 Controller (en adelante, "la Aplicación") es una herramienta técnica especializada diseñada para permitir la comunicación, diagnóstico y modificación de unidades de infoentretenimiento MIB2 (Modular Infotainment Platform 2) del Volkswagen Group a través de conexiones de red locales mediante adaptadores USB-Ethernet. Esta política de privacidad describe de manera exhaustiva cómo la Aplicación maneja, procesa y protege la información del usuario, así como los derechos que asisten al usuario en relación con sus datos.

Esta política se aplica a todas las versiones de MIB2 Controller distribuidas a través de Google Play Store y otras plataformas de distribución autorizadas. Al instalar y utilizar la Aplicación, el usuario acepta los términos establecidos en esta política de privacidad.

**Compromiso fundamental:** MIB2 Controller está diseñada bajo el principio de **privacidad por diseño** (privacy by design). La Aplicación NO recopila, almacena ni transmite datos personales identificables del usuario a servidores externos. Toda la funcionalidad principal opera exclusivamente en el dispositivo del usuario y en su red local.

---

## 2. Principios de Privacidad

La Aplicación se rige por los siguientes principios fundamentales:

**Minimización de datos:** Solo se procesan los datos estrictamente necesarios para el funcionamiento de la Aplicación. No se recopilan datos adicionales con fines de análisis, marketing o monetización.

**Transparencia:** El usuario tiene visibilidad completa sobre qué datos se procesan, dónde se almacenan y con qué propósito. No existen procesos ocultos de recopilación de información.

**Control del usuario:** El usuario mantiene control total sobre sus datos en todo momento. Puede acceder, modificar o eliminar cualquier información almacenada por la Aplicación sin restricciones.

**Seguridad:** Se implementan medidas técnicas apropiadas para proteger los datos almacenados localmente contra accesos no autorizados, aunque el usuario debe ser consciente de las limitaciones inherentes al protocolo Telnet utilizado para comunicarse con las unidades MIB2.

**Limitación de propósito:** Los datos procesados por la Aplicación se utilizan exclusivamente para los fines técnicos declarados y no se reutilizan para otros propósitos sin consentimiento explícito del usuario.

---

## 3. Información que NO Recopilamos

Para garantizar la máxima transparencia, es fundamental aclarar qué tipos de información la Aplicación **NO recopila, procesa ni transmite**:

| Tipo de Información | Estado | Detalles |
|---------------------|--------|----------|
| **Datos de identificación personal** | ❌ NO recopilados | Nombre, apellidos, DNI, pasaporte, número de seguridad social |
| **Información de contacto** | ❌ NO recopilados | Dirección de correo electrónico, número de teléfono, dirección postal |
| **Datos de ubicación** | ❌ NO recopilados | GPS, ubicación aproximada, historial de ubicaciones |
| **Contactos y agenda** | ❌ NO accedidos | Lista de contactos, llamadas, mensajes SMS |
| **Archivos multimedia personales** | ❌ NO accedidos | Fotos, videos, grabaciones de audio del usuario |
| **Información financiera** | ❌ NO recopilados | Tarjetas de crédito, cuentas bancarias, historial de compras |
| **Credenciales de autenticación** | ❌ NO almacenados | Contraseñas, tokens de sesión, certificados personales |
| **Identificadores de dispositivo** | ❌ NO recopilados | IMEI, número de serie, Android ID, Advertising ID |
| **Información del vehículo** | ❌ NO transmitidos | VIN, matrícula, datos del propietario |
| **Datos de navegación web** | ❌ NO recopilados | Historial de navegación, cookies, búsquedas |
| **Información de aplicaciones** | ❌ NO recopilados | Lista de apps instaladas, uso de aplicaciones |
| **Datos biométricos** | ❌ NO recopilados | Huellas dactilares, reconocimiento facial |

**Servicios de terceros NO utilizados:** La Aplicación no integra ningún servicio de análisis (Google Analytics, Firebase Analytics), publicidad (AdMob, Facebook Ads), seguimiento de comportamiento, ni redes sociales. No existen SDKs de terceros que puedan recopilar datos en segundo plano.

---

## 4. Datos Procesados Localmente

La Aplicación almacena exclusivamente datos técnicos de configuración en el almacenamiento privado del dispositivo Android del usuario. Estos datos **nunca abandonan el dispositivo** excepto en los casos específicos descritos en la Sección 6.

### 4.1 Configuración de Conexión Telnet

Para permitir la reconexión rápida a unidades MIB2 previamente utilizadas, la Aplicación almacena:

- **Dirección IP de la unidad MIB2:** Dirección IPv4 de la unidad de infoentretenimiento (ejemplo: 192.168.1.100)
- **Puerto Telnet:** Puerto TCP utilizado para la conexión (por defecto 23)
- **Historial de conexiones:** Lista de hasta 10 direcciones IP previamente conectadas con éxito
- **Última conexión exitosa:** Timestamp de la última conexión establecida

**Propósito:** Facilitar la reconexión sin requerir que el usuario reingrese manualmente la dirección IP en cada sesión.

**Ubicación:** `/data/data/space.manus.mib2.controller.t[timestamp]/shared_prefs/telnet_config.xml`

**Formato:** Archivo XML de preferencias de Android (SharedPreferences)

### 4.2 Información de Firmware MIB2 Detectada

Cuando la Aplicación se conecta exitosamente a una unidad MIB2, almacena información técnica obtenida del sistema:

- **Versión de firmware:** Cadena de texto identificando la versión del sistema operativo MIB2 (ejemplo: "T480")
- **Versión de hardware:** Identificador del modelo de hardware (ejemplo: "STD2 Technisat Preh")
- **Estado de compatibilidad:** Indicador booleano de si la versión detectada es compatible con las funciones de la Aplicación

**Propósito:** Prevenir operaciones peligrosas en sistemas incompatibles y mostrar advertencias apropiadas al usuario.

**Ubicación:** `/data/data/space.manus.mib2.controller.t[timestamp]/shared_prefs/firmware_info.xml`

### 4.3 Configuración de Adaptadores USB-Ethernet

La Aplicación detecta y almacena información sobre adaptadores USB-Ethernet conectados:

- **Vendor ID (VID):** Identificador del fabricante del adaptador (ejemplo: 0x0b95 para ASIX)
- **Product ID (PID):** Identificador del modelo del adaptador (ejemplo: 0x772a para AX88772A)
- **Tipo de EEPROM:** Resultado de la detección de tipo de memoria (EEPROM externa modificable vs eFuse no modificable)
- **Dirección IP del adaptador:** Dirección IP asignada a la interfaz de red USB (ejemplo: 192.168.1.50)
- **Máscara de subred:** Máscara de red detectada automáticamente (ejemplo: 255.255.255.0)

**Propósito:** Prevenir operaciones de spoofing en adaptadores con eFuse que podrían resultar en bricking del hardware. Facilitar la detección automática de la subred para el escaneo de dispositivos MIB2.

**Ubicación:** `/data/data/space.manus.mib2.controller.t[timestamp]/shared_prefs/usb_config.xml`

### 4.4 Backups de Seguridad del Sistema MIB2

Antes de realizar operaciones críticas de modificación del sistema MIB2 (como el parcheo del binario `tsd.mibstd2.system.swap`), la Aplicación crea copias de seguridad automáticas:

- **Archivos binarios originales:** Copia exacta del archivo del sistema MIB2 antes de la modificación
- **Checksum MD5:** Hash criptográfico para verificar la integridad del backup
- **Metadata del backup:** Fecha, hora, tamaño del archivo, ruta original en el sistema MIB2
- **Registro de operaciones:** Log de las modificaciones realizadas

**Propósito:** Permitir la restauración del sistema MIB2 a su estado original en caso de problemas o bricking parcial.

**Ubicación:** `/data/data/space.manus.mib2.controller.t[timestamp]/files/backups/`

**Formato:** Archivos binarios con extensión `.backup` y archivos JSON con metadata

**Retención:** Los backups se conservan indefinidamente hasta que el usuario los elimine manualmente o desinstale la Aplicación.

### 4.5 Preferencias de Interfaz de Usuario

La Aplicación almacena preferencias visuales y de usabilidad:

- **Tema visual:** Preferencia de tema claro, oscuro o automático según el sistema
- **Idioma de la interfaz:** Idioma seleccionado para la UI (español por defecto)
- **Confirmaciones de seguridad:** Estado de las casillas de confirmación para operaciones peligrosas
- **Última pantalla visitada:** Tab activo al cerrar la aplicación para restaurar el estado

**Propósito:** Mejorar la experiencia de usuario manteniendo consistencia entre sesiones.

**Ubicación:** `/data/data/space.manus.mib2.controller.t[timestamp]/shared_prefs/ui_preferences.xml`

### 4.6 Logs de Diagnóstico Locales

Para facilitar la resolución de problemas, la Aplicación mantiene logs técnicos temporales:

- **Logs de conexión Telnet:** Comandos enviados y respuestas recibidas (últimas 100 líneas)
- **Logs de escaneo de red:** Resultados de escaneos de red con timestamps
- **Logs de operaciones USB:** Eventos de detección y comunicación con adaptadores USB
- **Logs de errores:** Stack traces y mensajes de error para debugging

**Propósito:** Permitir al usuario diagnosticar problemas de conectividad y compartir información técnica con soporte si es necesario.

**Ubicación:** `/data/data/space.manus.mib2.controller.t[timestamp]/files/logs/`

**Retención:** Los logs se rotan automáticamente, manteniendo solo los últimos 7 días de actividad. El usuario puede eliminarlos manualmente en cualquier momento desde la pantalla de Diagnóstico.

**Importante:** Los logs NO se transmiten automáticamente. Si el usuario desea compartirlos para soporte técnico, debe exportarlos manualmente.

---

## 5. Permisos de Android Requeridos

La Aplicación solicita los siguientes permisos del sistema Android. Cada permiso tiene una justificación técnica específica y se solicita en el momento en que el usuario intenta utilizar la funcionalidad relacionada (solicitud contextual).

### 5.1 INTERNET (android.permission.INTERNET)

**Tipo:** Permiso normal (otorgado automáticamente en la instalación)

**Justificación técnica:** Este permiso es absolutamente esencial para la funcionalidad principal de la Aplicación. Se utiliza para:

1. **Conexiones Telnet locales:** Establecer conexiones TCP en el puerto 23 con unidades MIB2 en la red local del usuario
2. **Escaneo de red:** Enviar paquetes de prueba a direcciones IP en el rango de la subred local para detectar dispositivos MIB2
3. **Transferencia de archivos:** Descargar y subir archivos del sistema MIB2 a través de la conexión Telnet
4. **API opcional de FEC:** Realizar consultas HTTPS a la API pública de vwcoding.ru para generar códigos de habilitación de funciones (solo si el usuario activa esta función)

**Alcance:** Las conexiones de red se limitan exclusivamente a:
- Dispositivos en la red local del usuario (rango 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- API pública de vwcoding.ru (solo para generación de códigos FEC, opcional)

**Seguridad:** La Aplicación NO establece conexiones con servidores de análisis, publicidad, seguimiento o cualquier otro servicio de terceros no declarado explícitamente.

### 5.2 ACCESS_NETWORK_STATE (android.permission.ACCESS_NETWORK_STATE)

**Tipo:** Permiso normal (otorgado automáticamente en la instalación)

**Justificación técnica:** Este permiso permite a la Aplicación:

1. **Detectar conectividad:** Verificar que el dispositivo Android está conectado a una red (WiFi o Ethernet USB)
2. **Identificar interfaces de red:** Enumerar las interfaces de red disponibles para detectar adaptadores USB-Ethernet
3. **Obtener dirección IP local:** Leer la dirección IP asignada al adaptador de red para calcular automáticamente el rango de escaneo
4. **Validar conectividad del adaptador:** Verificar que el adaptador USB-Ethernet tiene una IP válida asignada antes de permitir operaciones de red

**Implementación:** El módulo nativo `NetworkInfoModule` (Kotlin) utiliza la API `ConnectivityManager` de Android para acceder a esta información.

**Datos NO accedidos:** Este permiso NO permite acceder a historial de navegación, sitios web visitados, ni información sobre otras aplicaciones que usan la red.

### 5.3 POST_NOTIFICATIONS (android.permission.POST_NOTIFICATIONS)

**Tipo:** Permiso peligroso (requiere solicitud explícita al usuario en Android 13+)

**Justificación técnica:** Este permiso permite mostrar notificaciones del sistema para:

1. **Operaciones de larga duración:** Informar sobre el progreso de instalaciones del Toolbox, backups o escaneos completos de red
2. **Advertencias críticas:** Alertar al usuario si se pierde la conexión con la unidad MIB2 durante una operación peligrosa
3. **Finalización de procesos:** Notificar cuando operaciones en segundo plano han terminado exitosamente o con errores

**Frecuencia:** Las notificaciones son infrecuentes y solo se muestran durante operaciones activas iniciadas por el usuario.

**Opcionalidad:** Este permiso es completamente opcional. Si el usuario lo deniega, la Aplicación funciona con normalidad pero no mostrará notificaciones. El estado de las operaciones seguirá visible dentro de la interfaz de la Aplicación.

**Privacidad:** Las notificaciones NO contienen información personal ni sensible. Solo muestran mensajes técnicos sobre el estado de operaciones.

### 5.4 USB Host (android.hardware.usb.host)

**Tipo:** Declaración de feature (NO es un permiso runtime)

**Justificación técnica:** Esta declaración indica que la Aplicación requiere soporte USB OTG (On-The-Go) en el dispositivo Android para:

1. **Detectar adaptadores USB-Ethernet:** Enumerar dispositivos USB conectados y filtrar por clase de dispositivo de red
2. **Leer información del adaptador:** Obtener VID/PID, descriptores USB, y tipo de EEPROM
3. **Realizar test de EEPROM:** Ejecutar pruebas de lectura/escritura para determinar si el adaptador tiene EEPROM externa modificable o eFuse no modificable
4. **Spoofing de VID/PID:** Modificar los identificadores del adaptador USB para emular un adaptador Volkswagen original (solo en adaptadores con EEPROM externa)

**Implementación:** El módulo nativo `UsbNativeModule` (Kotlin) utiliza la API `UsbManager` de Android para acceder a dispositivos USB.

**Limitaciones:** Esta funcionalidad solo está disponible en dispositivos Android con soporte USB OTG. La Aplicación detecta automáticamente si el dispositivo es compatible.

**Seguridad:** El acceso USB se limita exclusivamente a adaptadores de red Ethernet. La Aplicación NO accede a otros tipos de dispositivos USB (almacenamiento, cámaras, teclados, etc.).

---

## 6. Comunicaciones de Red y Transmisión de Datos

Esta sección describe exhaustivamente todos los escenarios en los que la Aplicación transmite datos fuera del dispositivo del usuario.

### 6.1 Conexiones Telnet con Unidades MIB2 (Red Local)

**Naturaleza de la conexión:** La Aplicación establece conexiones TCP directas en el puerto 23 (Telnet) con la dirección IP de la unidad MIB2 especificada por el usuario.

**Alcance:** Estas conexiones son **punto a punto** dentro de la red local del usuario. Los datos NO pasan por servidores intermedios, proxies ni servicios en la nube.

**Datos transmitidos:**
- Comandos de terminal Linux (bash) para interactuar con el sistema operativo de la unidad MIB2
- Solicitudes de lectura de archivos del sistema MIB2
- Archivos binarios modificados para instalación del Toolbox
- Comandos de diagnóstico y consulta de estado del sistema

**Datos recibidos:**
- Respuestas de comandos ejecutados en la unidad MIB2
- Contenido de archivos del sistema MIB2
- Información de versión de firmware y hardware
- Logs del sistema MIB2

**Seguridad:** El protocolo Telnet **NO está cifrado**. Toda la comunicación viaja en texto plano a través de la red local. Por esta razón, **es fundamental que el usuario utilice la Aplicación únicamente en redes locales confiables** (red doméstica privada o red del taller). NO se recomienda usar la Aplicación en redes WiFi públicas o no confiables.

**Mitigación de riesgos:** Dado que la comunicación es local y no atraviesa Internet, el riesgo de interceptación es bajo en entornos domésticos típicos. Sin embargo, usuarios avanzados pueden considerar el uso de VLANs aisladas para mayor seguridad.

### 6.2 API Externa de vwcoding.ru (Opcional)

**Propósito:** La Aplicación ofrece una funcionalidad opcional para generar códigos FEC (Feature Enabling Codes) que permiten activar funciones ocultas en las unidades MIB2.

**Activación:** Esta funcionalidad está **desactivada por defecto**. El usuario debe activarla manualmente desde la pantalla "FEC Generator" y confirmar que desea enviar datos a un servicio externo.

**Datos transmitidos:**
- Modelo de vehículo (ejemplo: "Golf 7", "Passat B8")
- Región/mercado (ejemplo: "Europa", "América del Norte")
- Versión de firmware MIB2 (ejemplo: "T480")
- Función a activar (ejemplo: "CarPlay", "Android Auto")

**Datos NO transmitidos:**
- VIN (número de identificación del vehículo)
- Matrícula
- Información personal del propietario
- Dirección IP del usuario (la API no registra IPs)
- Identificadores del dispositivo Android

**Protocolo:** Las consultas se realizan mediante HTTPS (conexión cifrada) a la URL `https://vwcoding.ru/api/fec`

**Respuesta recibida:**
- Código FEC generado (cadena alfanumérica)
- Instrucciones de aplicación del código

**Transparencia:** Antes de cada consulta, la Aplicación muestra al usuario exactamente qué datos se van a enviar y solicita confirmación explícita.

**Alternativa:** El usuario puede optar por generar códigos FEC manualmente utilizando herramientas externas y no usar esta funcionalidad.

### 6.3 Escaneo de Red Local

**Propósito:** La Aplicación puede escanear la red local del usuario para detectar automáticamente unidades MIB2 conectadas.

**Alcance:** El escaneo se limita al rango de subred detectado automáticamente (ejemplo: 192.168.1.1 a 192.168.1.254).

**Método:**
- **Quick Scan:** Escanea solo las direcciones IP más comunes para unidades MIB2 (192.168.1.100, .101, .102)
- **Full Scan:** Escanea todas las direcciones IP en el rango de la subred (puede tardar varios minutos)

**Datos transmitidos:** Paquetes TCP SYN al puerto 23 (Telnet) para verificar si el puerto está abierto.

**Datos recibidos:** Respuestas TCP SYN-ACK indicando que un dispositivo tiene el puerto Telnet abierto.

**Privacidad:** El escaneo NO identifica otros dispositivos en la red (computadoras, smartphones, smart TVs). Solo detecta dispositivos con el puerto Telnet abierto, que típicamente son unidades MIB2.

**Impacto en la red:** El escaneo genera tráfico de red mínimo (pocos kilobytes). No afecta el rendimiento de otros dispositivos conectados.

---

## 7. Seguridad y Protección de Datos

### 7.1 Almacenamiento Local Seguro

**Sandbox de Android:** Todos los datos de la Aplicación se almacenan en el directorio privado de la aplicación (`/data/data/space.manus.mib2.controller.t[timestamp]/`), que está protegido por el sistema de permisos de Android. Otras aplicaciones NO pueden acceder a estos datos sin permisos root.

**Cifrado del dispositivo:** Si el usuario tiene habilitado el cifrado de almacenamiento en su dispositivo Android (habilitado por defecto en Android 6.0+), todos los datos de la Aplicación se cifran automáticamente en reposo.

**Backups de Android:** La Aplicación está configurada con `android:allowBackup="false"` para prevenir que los backups automáticos de Android incluyan datos sensibles de configuración. El usuario mantiene control total sobre sus backups.

### 7.2 Seguridad de las Comunicaciones

**Telnet no cifrado:** Como se mencionó anteriormente, el protocolo Telnet NO proporciona cifrado. Esta es una limitación inherente de las unidades MIB2, que no soportan SSH u otros protocolos cifrados.

**HTTPS para API externa:** Las consultas a la API de vwcoding.ru utilizan HTTPS con certificados TLS 1.2 o superior, garantizando que los datos transmitidos están cifrados en tránsito.

**Validación de certificados:** La Aplicación valida los certificados SSL/TLS para prevenir ataques de tipo man-in-the-middle.

### 7.3 Protección contra Accesos No Autorizados

**Sin autenticación de usuario:** La Aplicación NO requiere creación de cuentas, inicio de sesión ni autenticación. Cualquier persona con acceso físico al dispositivo Android puede usar la Aplicación.

**Recomendación:** Si el dispositivo Android contiene backups críticos del sistema MIB2, se recomienda proteger el dispositivo con PIN, patrón, contraseña o biometría.

### 7.4 Actualizaciones de Seguridad

**Política de actualizaciones:** El desarrollador se compromete a publicar actualizaciones de seguridad en caso de descubrirse vulnerabilidades críticas. Las actualizaciones se distribuyen a través de Google Play Store.

**Notificación de vulnerabilidades:** Si se descubre una vulnerabilidad de seguridad, se publicará un aviso en el repositorio oficial de GitHub y se notificará a los usuarios a través de la descripción de la actualización en Play Store.

---

## 8. Responsabilidad del Usuario y Limitaciones de Responsabilidad

### 8.1 Uso Bajo Riesgo Propio

La Aplicación permite realizar modificaciones profundas al sistema operativo de las unidades MIB2. Estas modificaciones conllevan riesgos inherentes que el usuario debe comprender y aceptar:

**Riesgo de bricking:** Las operaciones de parcheo de binarios del sistema pueden resultar en el bloqueo permanente (bricking) de la unidad MIB2 si se realizan incorrectamente o si se interrumpen durante el proceso. Una unidad "brickeada" puede requerir acceso directo al chip eMMC mediante soldadura para su recuperación, lo cual es un procedimiento técnico avanzado y costoso.

**Pérdida de garantía:** Modificar el software de la unidad MIB2 probablemente invalidará la garantía del fabricante del vehículo. El usuario es responsable de verificar los términos de su garantía antes de utilizar la Aplicación.

**Violación de términos de servicio:** El fabricante del vehículo puede considerar estas modificaciones como una violación de sus términos de servicio, lo cual podría tener consecuencias legales o comerciales.

**Responsabilidad exclusiva del usuario:** El desarrollador de la Aplicación NO asume responsabilidad alguna por:
- Daños a la unidad MIB2 o al vehículo
- Costos de reparación o reemplazo de componentes
- Pérdida de garantía
- Consecuencias legales derivadas del uso de la Aplicación
- Pérdida de datos o funcionalidad del vehículo

**Advertencias implementadas:** La Aplicación implementa múltiples capas de advertencias y confirmaciones antes de operaciones peligrosas. Sin embargo, estas advertencias no eliminan el riesgo inherente. El usuario debe leer y comprender todas las advertencias antes de proceder.

### 8.2 Cumplimiento Legal

**Legislación local:** El usuario es responsable de verificar y cumplir con las leyes locales, regionales y nacionales aplicables a la modificación de sistemas electrónicos de vehículos. En algunas jurisdicciones, modificar el software del vehículo puede ser ilegal o puede afectar la homologación del vehículo para circular en vías públicas.

**Inspecciones técnicas:** Las modificaciones realizadas con esta Aplicación pueden afectar la capacidad del vehículo para pasar inspecciones técnicas obligatorias (ITV, MOT, TÜV, etc.). El usuario debe considerar este aspecto antes de realizar modificaciones permanentes.

**Responsabilidad de conducción:** Si las modificaciones afectan sistemas relacionados con la seguridad del vehículo (aunque la Aplicación no modifica directamente sistemas de seguridad), el usuario es responsable de garantizar que el vehículo sigue siendo seguro para conducir.

### 8.3 Limitaciones Técnicas

**Compatibilidad:** La Aplicación está diseñada específicamente para unidades MIB2 STD2 Technisat Preh con firmware T480. El uso en otras versiones de hardware o firmware puede no funcionar correctamente o puede causar daños.

**Requisitos de hardware:** La Aplicación requiere adaptadores USB-Ethernet específicos con chipsets compatibles (ASIX AX88772, AX88772A, AX88772B). Otros adaptadores pueden no funcionar o pueden no ser detectados correctamente.

**Sin soporte oficial:** Esta Aplicación es un proyecto independiente y NO cuenta con soporte oficial de Volkswagen Group ni de ningún fabricante de componentes. El usuario no debe esperar asistencia técnica de estas entidades.

---

## 9. Derechos del Usuario

### 9.1 Derecho de Acceso

El usuario tiene derecho a acceder a todos los datos almacenados por la Aplicación en cualquier momento. Los datos se almacenan en formatos estándar y legibles:

**Acceso directo:** Con permisos root en el dispositivo Android, el usuario puede acceder directamente a `/data/data/space.manus.mib2.controller.t[timestamp]/`

**Exportación de datos:** La Aplicación proporciona funcionalidades de exportación para:
- Backups del sistema MIB2 (pueden copiarse a almacenamiento externo)
- Logs de diagnóstico (pueden exportarse como archivos de texto)
- Configuración de conexiones (puede visualizarse en la pantalla de Configuración)

### 9.2 Derecho de Rectificación

El usuario puede modificar cualquier dato almacenado por la Aplicación:

**Configuración de conexiones:** Puede editarse desde la pantalla principal (Telnet)
**Preferencias de interfaz:** Pueden modificarse desde la pantalla de Configuración
**Historial de conexiones:** Puede limpiarse manualmente desde la pantalla de Configuración

### 9.3 Derecho de Supresión (Derecho al Olvido)

El usuario puede eliminar todos los datos almacenados por la Aplicación mediante dos métodos:

**Método 1 - Borrar datos de la aplicación:**
1. Abrir Configuración de Android
2. Navegar a Aplicaciones → MIB2 Controller
3. Seleccionar "Almacenamiento"
4. Pulsar "Borrar datos" o "Borrar caché"

**Método 2 - Desinstalar la aplicación:**
1. Mantener pulsado el icono de MIB2 Controller
2. Seleccionar "Desinstalar"
3. Todos los datos se eliminarán automáticamente

**Efecto:** Ambos métodos eliminan permanentemente todos los datos locales de la Aplicación. Esta acción es irreversible.

**Importante:** Si el usuario ha exportado backups del sistema MIB2 a almacenamiento externo o tarjeta SD, estos archivos NO se eliminarán automáticamente y deben borrarse manualmente si se desea.

### 9.4 Derecho de Portabilidad

Los datos almacenados por la Aplicación utilizan formatos estándar y portables:

**Backups:** Archivos binarios con metadata en formato JSON
**Configuración:** Archivos XML (SharedPreferences de Android)
**Logs:** Archivos de texto plano

El usuario puede copiar estos archivos a otros dispositivos o sistemas de almacenamiento sin restricciones técnicas.

### 9.5 Derecho de Oposición

Dado que la Aplicación NO realiza procesamiento de datos personales con fines de marketing, perfilado o toma de decisiones automatizadas, no existe un "derecho de oposición" aplicable en el sentido tradicional.

Sin embargo, el usuario puede optar por:
- **Desactivar la funcionalidad de API externa:** No utilizar el generador de códigos FEC que requiere consultas a vwcoding.ru
- **Desactivar notificaciones:** Denegar el permiso POST_NOTIFICATIONS
- **No crear backups:** Optar por no crear backups automáticos (no recomendado por seguridad)

### 9.6 Derecho a No Ser Objeto de Decisiones Automatizadas

La Aplicación NO realiza ningún tipo de toma de decisiones automatizada que afecte al usuario. Todas las operaciones requieren confirmación explícita del usuario.

---

## 10. Cumplimiento de Normativas de Protección de Datos

### 10.1 Reglamento General de Protección de Datos (GDPR) - Unión Europea

Aunque la Aplicación NO procesa datos personales en el sentido del GDPR (no recopila información identificable de personas físicas), se han implementado las siguientes medidas para garantizar el cumplimiento:

**Artículo 5 - Principios relativos al tratamiento:**
- ✅ Licitud, lealtad y transparencia: Esta política de privacidad proporciona información completa y transparente
- ✅ Limitación de la finalidad: Los datos técnicos se procesan solo para los fines declarados
- ✅ Minimización de datos: Solo se procesan datos estrictamente necesarios
- ✅ Exactitud: Los datos técnicos son exactos por naturaleza
- ✅ Limitación del plazo de conservación: Los logs se eliminan automáticamente después de 7 días
- ✅ Integridad y confidencialidad: Se implementan medidas técnicas de seguridad

**Artículo 25 - Protección de datos desde el diseño y por defecto:**
- ✅ La Aplicación está diseñada para NO recopilar datos personales
- ✅ Configuración por defecto: Funcionalidades que requieren transmisión de datos (API FEC) están desactivadas por defecto

**Artículo 32 - Seguridad del tratamiento:**
- ✅ Cifrado de datos en reposo (mediante cifrado del dispositivo Android)
- ✅ Cifrado de datos en tránsito (HTTPS para API externa)
- ✅ Almacenamiento en sandbox protegido de Android

### 10.2 California Consumer Privacy Act (CCPA) - Estados Unidos

Para usuarios residentes en California, se proporcionan las siguientes aclaraciones:

**Categorías de información personal recopilada:** Ninguna. La Aplicación NO recopila información personal según la definición de CCPA.

**Propósitos comerciales:** La Aplicación es gratuita y NO tiene fines comerciales de monetización de datos.

**Venta de información personal:** La Aplicación NO vende información personal a terceros.

**Derecho a saber:** Los usuarios pueden acceder a todos los datos técnicos almacenados localmente.

**Derecho a eliminar:** Los usuarios pueden eliminar todos los datos en cualquier momento.

**Derecho a optar por no participar:** No aplicable, ya que no se venden datos.

**No discriminación:** No aplicable, ya que la Aplicación no condiciona servicios al consentimiento de procesamiento de datos.

### 10.3 Ley Orgánica de Protección de Datos (LOPDGDD) - España

La Aplicación cumple con los requisitos de la LOPDGDD en tanto que:

- NO procesa datos de carácter personal según la definición del artículo 4.1 del RGPD
- NO realiza transferencias internacionales de datos personales
- NO utiliza sistemas de videovigilancia, geolocalización ni otras tecnologías de seguimiento
- Proporciona información transparente sobre el procesamiento de datos técnicos

### 10.4 Otras Jurisdicciones

Para usuarios en otras jurisdicciones con leyes de protección de datos (Brasil - LGPD, Canadá - PIPEDA, Australia - Privacy Act, etc.), la Aplicación mantiene el mismo estándar de privacidad: **NO recopilación de datos personales, procesamiento local exclusivamente, y control total del usuario sobre sus datos técnicos.**

---

## 11. Transferencias Internacionales de Datos

**Transferencias NO realizadas:** La Aplicación NO transfiere datos personales a países fuera de la Unión Europea ni a organizaciones internacionales.

**Excepción - API de vwcoding.ru:** Si el usuario activa voluntariamente la funcionalidad de generación de códigos FEC, se realizan consultas HTTPS a un servidor ubicado en Rusia. Sin embargo, los datos transmitidos (modelo de vehículo, región, versión de firmware) NO constituyen datos personales según GDPR, ya que no permiten identificar a una persona física.

**Salvaguardas:** Las consultas a vwcoding.ru utilizan HTTPS (cifrado TLS) y NO incluyen identificadores del usuario, dirección IP registrada, ni información del dispositivo.

---

## 12. Privacidad de Menores

**Edad mínima:** La Aplicación está diseñada para usuarios mayores de 18 años con conocimientos técnicos avanzados en sistemas automotrices y electrónica.

**No dirigida a menores:** La Aplicación NO está dirigida a menores de edad y NO recopila intencionalmente información de menores de 13 años (COPPA - EE.UU.) ni de 16 años (GDPR - UE).

**Responsabilidad parental:** Si un padre o tutor descubre que un menor ha utilizado la Aplicación, puede eliminar todos los datos desinstalando la aplicación del dispositivo.

**Contenido apropiado:** La Aplicación NO contiene contenido inapropiado para menores (violencia, lenguaje explícito, contenido sexual). Sin embargo, las operaciones técnicas que permite realizar requieren madurez y responsabilidad.

---

## 13. Cookies y Tecnologías de Seguimiento

**NO se utilizan cookies:** La Aplicación es una aplicación nativa de Android y NO utiliza cookies web.

**NO se utilizan tecnologías de seguimiento:** La Aplicación NO integra:
- Píxeles de seguimiento
- Beacons web
- Fingerprinting de dispositivo
- SDKs de análisis (Google Analytics, Firebase Analytics, Mixpanel, etc.)
- SDKs de publicidad (AdMob, Facebook Audience Network, etc.)
- Herramientas de mapas de calor o grabación de sesiones

**Identificadores de dispositivo:** La Aplicación NO accede ni almacena:
- Android Advertising ID (AAID)
- Android ID
- IMEI
- Número de serie del dispositivo
- Dirección MAC

---

## 14. Cambios en esta Política de Privacidad

**Notificación de cambios:** El desarrollador se reserva el derecho de modificar esta política de privacidad en cualquier momento. Los cambios significativos se notificarán a los usuarios mediante:

1. Actualización de la fecha de "Última actualización" en la parte superior de este documento
2. Publicación de un aviso en la descripción de la actualización de la aplicación en Google Play Store
3. Notificación dentro de la aplicación (si se añaden nuevas funcionalidades que afecten la privacidad)

**Aceptación de cambios:** El uso continuado de la Aplicación después de la publicación de cambios en esta política constituye la aceptación de dichos cambios.

**Historial de versiones:** Las versiones anteriores de esta política de privacidad se mantienen disponibles en el repositorio de GitHub del proyecto para referencia histórica.

**Cambios materiales:** Si se realizan cambios que afecten significativamente la privacidad del usuario (por ejemplo, introducción de nuevas funcionalidades que requieran transmisión de datos), se solicitará consentimiento explícito del usuario antes de implementar dichos cambios.

---

## 15. Contacto y Ejercicio de Derechos

Para cualquier consulta relacionada con esta política de privacidad, ejercicio de derechos de protección de datos, o reporte de problemas de seguridad, el usuario puede contactar al desarrollador:

**Desarrollador:** Felipe Plazas  
**Email:** feplazas@gmail.com  
**Proyecto GitHub:** https://github.com/feplazas/mib2-controller  
**Sitio web:** https://feplazas.github.io/mib2-controller/

**Tiempo de respuesta:** El desarrollador se compromete a responder consultas relacionadas con privacidad en un plazo máximo de 30 días naturales.

**Idiomas de soporte:** Español, Inglés

**Reporte de vulnerabilidades de seguridad:** Si descubres una vulnerabilidad de seguridad en la Aplicación, por favor repórtala de manera responsable enviando un email a feplazas@gmail.com con el asunto "Security Vulnerability - MIB2 Controller". Se solicita no divulgar públicamente la vulnerabilidad hasta que se haya publicado una corrección.

---

## 16. Autoridad de Supervisión

Los usuarios de la Unión Europea tienen derecho a presentar una reclamación ante la autoridad de supervisión de protección de datos de su país si consideran que el procesamiento de sus datos personales infringe el GDPR.

**España - Agencia Española de Protección de Datos (AEPD):**
- Sitio web: https://www.aepd.es
- Teléfono: +34 901 100 099
- Dirección: C/ Jorge Juan, 6, 28001 Madrid, España

Para usuarios en otras jurisdicciones, consultar la autoridad de protección de datos local correspondiente.

---

## 17. Jurisdicción y Ley Aplicable

Esta política de privacidad se rige por las leyes de España y la normativa de la Unión Europea (GDPR).

Cualquier disputa relacionada con esta política de privacidad se someterá a la jurisdicción de los tribunales de Bogotá, Colombia, sin perjuicio de los derechos que asistan al usuario como consumidor según su legislación local.

---

## 18. Resumen Ejecutivo

Para facilitar la comprensión rápida de esta política, se proporciona el siguiente resumen (el texto completo prevalece en caso de discrepancia):

| Aspecto | Resumen |
|---------|---------|
| **Recopilación de datos personales** | ❌ NO se recopilan datos personales identificables |
| **Almacenamiento de datos** | ✅ Solo datos técnicos, almacenados localmente en el dispositivo |
| **Transmisión a servidores externos** | ❌ NO se transmiten datos (excepto API opcional de FEC con datos no personales) |
| **Uso de servicios de terceros** | ❌ NO se utilizan servicios de análisis, publicidad ni seguimiento |
| **Cifrado** | ✅ HTTPS para API externa, cifrado de dispositivo para almacenamiento local |
| **Derechos del usuario** | ✅ Acceso, rectificación, supresión y portabilidad garantizados |
| **Cumplimiento normativo** | ✅ GDPR, CCPA, LOPDGDD |
| **Edad mínima** | 🔞 Mayores de 18 años (uso técnico avanzado) |
| **Cookies y seguimiento** | ❌ NO se utilizan |
| **Cambios en la política** | ✅ Notificación mediante actualizaciones de la app |

**Mensaje principal:** MIB2 Controller respeta tu privacidad. NO recopilamos datos personales. Toda la información se almacena localmente en tu dispositivo. Las conexiones con la unidad MIB2 son directas y locales. Usas la Aplicación bajo tu propio riesgo y responsabilidad.

---

**Fecha de entrada en vigor:** 13 de enero de 2026  
**Versión del documento:** 2.0  
**Última revisión:** 13 de enero de 2026

---

*Este documento ha sido redactado con el objetivo de proporcionar máxima transparencia y cumplimiento con las normativas de protección de datos aplicables. Si tienes dudas sobre cualquier aspecto de esta política, no dudes en contactar al desarrollador.*
