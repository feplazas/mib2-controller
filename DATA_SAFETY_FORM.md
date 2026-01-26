# Data Safety Form - MIB2 Controller

## Respuestas para el formulario de seguridad de datos de Google Play Console

---

### Sección 1: Recopilación de datos

**¿Tu app recopila o comparte alguno de los tipos de datos de usuario requeridos?**
- **Respuesta:** NO

**Justificación:** MIB2 Controller es una aplicación completamente offline que no recopila, almacena ni transmite datos personales a servidores externos. Toda la información se procesa y almacena localmente en el dispositivo del usuario.

---

### Sección 2: Tipos de datos

**Ubicación**
- Ubicación aproximada: NO
- Ubicación precisa: NO

**Información personal**
- Nombre: NO
- Dirección de correo electrónico: NO
- IDs de usuario: NO
- Dirección: NO
- Número de teléfono: NO
- Raza y etnia: NO
- Creencias políticas o religiosas: NO
- Orientación sexual: NO
- Otra información: NO

**Información financiera**
- Información de pago del usuario: NO
- Historial de compras: NO
- Puntuación crediticia: NO
- Otra información financiera: NO

**Salud y fitness**
- Información de salud: NO
- Información de fitness: NO

**Mensajes**
- Correos electrónicos: NO
- SMS o MMS: NO
- Otros mensajes en la app: NO

**Fotos y videos**
- Fotos: NO
- Videos: NO

**Archivos de audio**
- Grabaciones de voz o sonido: NO
- Archivos de música: NO
- Otros archivos de audio: NO

**Archivos y documentos**
- Archivos y documentos: NO

**Calendario**
- Eventos del calendario: NO

**Contactos**
- Contactos: NO

**Actividad en apps**
- Interacciones en la app: NO
- Historial de búsqueda en la app: NO
- Apps instaladas: NO
- Otro contenido generado por usuarios: NO
- Otras acciones: NO

**Navegación web**
- Historial de navegación web: NO

**Información y rendimiento de la app**
- Registros de fallos: NO (no se envían a servidores)
- Diagnósticos: NO (solo locales)
- Otros datos de rendimiento de la app: NO

**Identificadores del dispositivo u otros**
- Identificadores del dispositivo: NO

---

### Sección 3: Prácticas de seguridad

**¿Los datos están cifrados en tránsito?**
- **Respuesta:** N/A - No se transmiten datos a servidores externos
- **Nota:** Las comunicaciones Telnet con unidades MIB2 son en red local y el protocolo Telnet no soporta cifrado (limitación del firmware MIB2)

**¿Ofreces a los usuarios una forma de solicitar que se eliminen sus datos?**
- **Respuesta:** SÍ
- **Método:** El usuario puede eliminar todos los datos desde Configuración → Borrar Todos los Datos, o desinstalando la aplicación

**¿Tu app está diseñada para niños?**
- **Respuesta:** NO
- **Justificación:** La aplicación requiere conocimientos técnicos avanzados y está dirigida a usuarios mayores de 18 años

---

### Sección 4: Datos almacenados localmente (no recopilados)

La aplicación almacena los siguientes datos **exclusivamente en el dispositivo del usuario** (nunca se transmiten):

| Tipo de dato | Propósito | Cifrado |
|--------------|-----------|---------|
| Configuración de conexión (IP, puerto) | Reconexión rápida a unidades MIB2 | No (datos no sensibles) |
| Backups de EEPROM | Restauración de adaptadores USB | Sí (AES-256) |
| Preferencias de usuario | Personalización de la app | No (datos no sensibles) |
| Logs de diagnóstico | Resolución de problemas | No (temporales, 7 días) |

---

### Sección 5: Permisos de Android

| Permiso | Uso | Datos accedidos |
|---------|-----|-----------------|
| USB_HOST | Comunicación con adaptadores USB-Ethernet | Solo adaptadores ASIX específicos |
| INTERNET | Conexión Telnet a unidades MIB2 en red local | Solo red local (192.168.x.x) |
| ACCESS_NETWORK_STATE | Detectar configuración de red del adaptador USB | Solo información de red local |

**Nota importante sobre INTERNET:** A pesar del nombre del permiso, la aplicación NO accede a Internet. Solo se comunica con dispositivos en la red local del usuario a través del adaptador USB-Ethernet conectado físicamente.

---

### Sección 6: Declaración de cumplimiento

**Declaramos que:**

1. MIB2 Controller NO recopila datos personales identificables
2. MIB2 Controller NO transmite datos a servidores externos
3. MIB2 Controller NO comparte datos con terceros
4. MIB2 Controller NO utiliza SDKs de analytics, publicidad o tracking
5. Todos los datos se procesan y almacenan exclusivamente en el dispositivo del usuario
6. El usuario tiene control total sobre sus datos y puede eliminarlos en cualquier momento

---

### Sección 7: Contacto

**Desarrollador:** Felipe Plazas
**Email:** feplazas@gmail.com
**Política de privacidad:** https://github.com/feplazas/mib2-controller/blob/main/PRIVACY.md

---

*Documento preparado para Google Play Console - Data Safety Form*
*Última actualización: 26 de enero de 2026*
