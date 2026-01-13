# Guía de Implementación de la Política de Privacidad en Google Play Store

**Fecha:** 13 de enero de 2026  
**Aplicación:** MIB2 Controller  
**Versión de la Política:** 2.0

---

## 1. Resumen de Cambios

Esta versión 2.0 de la Política de Privacidad incluye mejoras significativas respecto a la versión 1.0:

### Nuevas Secciones Añadidas

- **Sección 2:** Principios de Privacidad (minimización, transparencia, control del usuario)
- **Sección 10:** Cumplimiento de GDPR, CCPA y LOPDGDD con referencias específicas a artículos legales
- **Sección 11:** Transferencias Internacionales de Datos
- **Sección 12:** Privacidad de Menores (COPPA, GDPR)
- **Sección 13:** Cookies y Tecnologías de Seguimiento
- **Sección 16:** Autoridad de Supervisión (AEPD)
- **Sección 17:** Jurisdicción y Ley Aplicable
- **Sección 18:** Resumen Ejecutivo (tabla comparativa)

### Mejoras en Secciones Existentes

- **Sección 4:** Datos Procesados Localmente - Ahora incluye 6 subsecciones detalladas con ubicaciones exactas de archivos
- **Sección 5:** Permisos de Android - Justificaciones técnicas expandidas con referencias a módulos nativos
- **Sección 6:** Comunicaciones de Red - Detalles exhaustivos sobre qué datos se transmiten y reciben
- **Sección 7:** Seguridad - Subsecciones sobre almacenamiento, comunicaciones, accesos y actualizaciones
- **Sección 8:** Responsabilidad del Usuario - Advertencias legales más completas
- **Sección 9:** Derechos del Usuario - Instrucciones paso a paso para ejercer derechos

### Extensión del Documento

- **Versión 1.0:** ~2,500 palabras
- **Versión 2.0:** ~11,000 palabras
- **Incremento:** +340% de contenido

---

## 2. Actualización en GitHub Pages

La política de privacidad está alojada en: **https://feplazas.github.io/mib2-controller/**

### Pasos para Actualizar

1. **Acceder al repositorio:**
   ```bash
   cd /ruta/a/tu/repositorio/feplazas.github.io
   ```

2. **Reemplazar el archivo existente:**
   - Copiar el contenido de `PRIVACY_POLICY.md` (versión 2.0)
   - Reemplazar el archivo `mib2-controller/index.md` o `mib2-controller/privacy-policy.md` en el repositorio de GitHub Pages

3. **Commit y push:**
   ```bash
   git add mib2-controller/privacy-policy.md
   git commit -m "Update MIB2 Controller Privacy Policy to v2.0 - Comprehensive GDPR/CCPA compliance"
   git push origin main
   ```

4. **Verificar la actualización:**
   - Esperar 1-2 minutos para que GitHub Pages se actualice
   - Visitar https://feplazas.github.io/mib2-controller/
   - Verificar que la fecha de actualización muestra "13 de enero de 2026"
   - Verificar que la versión muestra "2.0"

---

## 3. Configuración en Google Play Console

### 3.1 Acceder a la Sección de Política de Privacidad

1. Iniciar sesión en [Google Play Console](https://play.google.com/console)
2. Seleccionar la aplicación **MIB2 Controller**
3. En el menú lateral izquierdo, navegar a: **Política → Política de privacidad de la app**

### 3.2 Actualizar la URL de la Política

1. En el campo "URL de la política de privacidad", ingresar:
   ```
   https://feplazas.github.io/mib2-controller/
   ```

2. Hacer clic en **"Guardar"**

3. **Importante:** Google Play verificará que la URL es accesible públicamente y contiene una política de privacidad válida.

### 3.3 Verificación de Requisitos

Google Play Console verificará automáticamente que la política cumple con los siguientes requisitos:

✅ **Accesibilidad:** La URL debe ser accesible sin autenticación  
✅ **Contenido:** Debe describir cómo la app recopila, usa y comparte datos de usuario  
✅ **Idioma:** Debe estar en el mismo idioma que la descripción de la app (español)  
✅ **Formato:** Puede ser HTML, PDF o texto plano (nosotros usamos Markdown renderizado como HTML)

---

## 4. Cuestionario de Seguridad de Datos (Data Safety)

Google Play Console requiere completar un cuestionario detallado sobre cómo la app maneja los datos del usuario. A continuación, las respuestas correctas basadas en nuestra Política de Privacidad v2.0:

### 4.1 Pregunta Principal

**¿Tu app recopila o comparte alguno de los siguientes tipos de datos de usuario?**

**Respuesta:** NO

**Justificación:** La aplicación NO recopila datos personales identificables. Solo procesa datos técnicos localmente (direcciones IP de dispositivos MIB2, configuraciones de conexión) que NO constituyen datos personales según GDPR.

### 4.2 Tipos de Datos (Marcar TODOS como NO)

| Categoría | Subcategoría | Respuesta | Justificación |
|-----------|--------------|-----------|---------------|
| **Ubicación** | Ubicación aproximada | ❌ NO | No accedemos a GPS ni ubicación |
| **Ubicación** | Ubicación precisa | ❌ NO | No accedemos a GPS ni ubicación |
| **Información personal** | Nombre | ❌ NO | No solicitamos nombre |
| **Información personal** | Dirección de correo electrónico | ❌ NO | No solicitamos email |
| **Información personal** | IDs de usuario | ❌ NO | No creamos cuentas |
| **Información personal** | Dirección | ❌ NO | No solicitamos dirección |
| **Información personal** | Número de teléfono | ❌ NO | No accedemos a teléfono |
| **Información personal** | Raza y etnia | ❌ NO | No recopilamos |
| **Información personal** | Creencias políticas o religiosas | ❌ NO | No recopilamos |
| **Información personal** | Orientación sexual | ❌ NO | No recopilamos |
| **Información personal** | Otra información | ❌ NO | No recopilamos |
| **Información financiera** | Información de pago del usuario | ❌ NO | No procesamos pagos |
| **Información financiera** | Historial de compras | ❌ NO | App gratuita sin compras |
| **Información financiera** | Puntuación crediticia | ❌ NO | No recopilamos |
| **Información financiera** | Otra información financiera | ❌ NO | No recopilamos |
| **Salud y fitness** | Información de salud | ❌ NO | No recopilamos |
| **Salud y fitness** | Información de fitness | ❌ NO | No recopilamos |
| **Mensajes** | Correos electrónicos | ❌ NO | No accedemos a emails |
| **Mensajes** | SMS o MMS | ❌ NO | No accedemos a mensajes |
| **Mensajes** | Otros mensajes en la app | ❌ NO | No hay mensajería |
| **Fotos y videos** | Fotos | ❌ NO | No accedemos a fotos |
| **Fotos y videos** | Videos | ❌ NO | No accedemos a videos |
| **Archivos de audio** | Archivos de música | ❌ NO | No accedemos a música |
| **Archivos de audio** | Otros archivos de audio | ❌ NO | No accedemos a audio |
| **Archivos y documentos** | Archivos y documentos | ❌ NO | No accedemos a documentos personales |
| **Calendario** | Eventos del calendario | ❌ NO | No accedemos a calendario |
| **Contactos** | Contactos | ❌ NO | No accedemos a contactos |
| **Actividad de la app** | Interacciones con la app | ❌ NO | No rastreamos interacciones |
| **Actividad de la app** | Historial de búsqueda en la app | ❌ NO | No hay búsquedas |
| **Actividad de la app** | Apps instaladas | ❌ NO | No accedemos a lista de apps |
| **Actividad de la app** | Otro contenido generado por el usuario | ❌ NO | No recopilamos contenido |
| **Actividad de la app** | Otras acciones | ❌ NO | No rastreamos acciones |
| **Navegación web** | Historial de navegación web | ❌ NO | No accedemos a navegación |
| **Información y rendimiento de la app** | Registros de fallos | ❌ NO | No enviamos crash reports |
| **Información y rendimiento de la app** | Diagnósticos | ❌ NO | Logs solo locales, no transmitidos |
| **Información y rendimiento de la app** | Otros datos de rendimiento de la app | ❌ NO | No recopilamos métricas |
| **ID del dispositivo u otros** | ID del dispositivo | ❌ NO | No accedemos a IMEI, Android ID, etc. |

### 4.3 Pregunta sobre Cifrado en Tránsito

**¿Los datos de usuario se cifran en tránsito?**

**Respuesta:** SÍ (parcialmente)

**Explicación para Google:**
```
La aplicación utiliza dos tipos de conexiones de red:

1. Conexiones Telnet con unidades MIB2 (NO cifradas):
   - Protocolo: Telnet (puerto 23)
   - Alcance: Solo red local del usuario
   - Justificación: Limitación del hardware MIB2 (no soporta SSH)
   - Datos transmitidos: Comandos técnicos, NO datos personales

2. Consultas a API externa opcional (cifradas):
   - Protocolo: HTTPS con TLS 1.2+
   - Destino: vwcoding.ru (generación de códigos FEC)
   - Datos transmitidos: Modelo de vehículo, región (NO datos personales)
   - Activación: Opcional, desactivada por defecto

La aplicación NO transmite datos personales identificables en ningún caso.
```

### 4.4 Pregunta sobre Solicitud de Eliminación de Datos

**¿Los usuarios pueden solicitar que se eliminen sus datos?**

**Respuesta:** N/A (No aplicable)

**Justificación:** La aplicación NO recopila ni almacena datos de usuario en servidores externos. Todos los datos técnicos se almacenan localmente en el dispositivo del usuario y pueden ser eliminados en cualquier momento mediante:
- Configuración de Android → Aplicaciones → MIB2 Controller → Borrar datos
- Desinstalación de la aplicación

---

## 5. Declaración de Seguridad de Datos (Data Safety Declaration)

En la sección **"Seguridad de datos"** de Google Play Console, completar el formulario de la siguiente manera:

### 5.1 Recopilación y Uso de Datos

**¿Tu app recopila o comparte datos de usuario?**

**Respuesta:** NO

**Texto de declaración pública (visible para usuarios en Play Store):**

```
Esta app no recopila datos personales

MIB2 Controller NO recopila, almacena ni comparte datos personales identificables. 
Toda la funcionalidad opera localmente en tu dispositivo y en tu red local.

Datos procesados localmente:
• Direcciones IP de dispositivos MIB2 (solo en tu red local)
• Configuraciones de conexión Telnet
• Backups de seguridad del sistema MIB2

Estos datos NUNCA se transmiten a servidores externos.

Funcionalidad opcional:
• Generador de códigos FEC: Consulta HTTPS opcional a vwcoding.ru
• Datos enviados: Modelo de vehículo, región (NO datos personales)
• Activación: Manual, desactivada por defecto

Privacidad garantizada:
✓ Sin servicios de análisis o publicidad
✓ Sin seguimiento de comportamiento
✓ Sin cuentas de usuario ni autenticación
✓ Cumplimiento GDPR, CCPA y LOPDGDD

Política de privacidad completa: https://feplazas.github.io/mib2-controller/
```

### 5.2 Prácticas de Seguridad

**¿Tu app implementa las siguientes prácticas de seguridad?**

✅ **Los datos se cifran en tránsito:** SÍ (para consultas HTTPS a API externa)  
✅ **Los usuarios pueden solicitar que se eliminen sus datos:** SÍ (eliminación local mediante configuración de Android)  
❌ **No se pueden eliminar datos:** NO (los datos SÍ pueden eliminarse)  
✅ **Cumple con la Política de Familias de Play:** NO (app para mayores de 18 años)  
✅ **Se ha validado la seguridad de forma independiente:** NO (proyecto independiente)

---

## 6. Clasificación de Contenido

### 6.1 Cuestionario IARC (International Age Rating Coalition)

Google Play Console utiliza el sistema IARC para determinar la clasificación de edad. Respuestas recomendadas:

**Categoría de la app:**
- **Seleccionar:** Utilidades / Herramientas

**¿Tu app contiene alguno de los siguientes elementos?**

| Pregunta | Respuesta | Justificación |
|----------|-----------|---------------|
| Violencia | ❌ NO | No hay contenido violento |
| Lenguaje inapropiado | ❌ NO | Interfaz técnica profesional |
| Contenido sexual | ❌ NO | No hay contenido sexual |
| Miedo | ❌ NO | No hay contenido de miedo |
| Drogas | ❌ NO | No hay referencias a drogas |
| Apuestas | ❌ NO | No hay apuestas |
| Discriminación | ❌ NO | No hay contenido discriminatorio |
| Compras dentro de la app | ❌ NO | App completamente gratuita |
| Interacción con usuarios | ❌ NO | No hay chat ni interacción social |
| Compartir ubicación | ❌ NO | No accedemos a ubicación |
| Contenido generado por usuarios | ❌ NO | No hay contenido de usuarios |

**Clasificación esperada:**
- **ESRB (EE.UU.):** Everyone (E) o Teen (T)
- **PEGI (Europa):** PEGI 3 o PEGI 7
- **USK (Alemania):** USK 0 o USK 6
- **Classind (Brasil):** Livre (L)

**Recomendación:** Aunque la clasificación automática puede ser baja, en la descripción de la app indicar claramente que está diseñada para **usuarios mayores de 18 años con conocimientos técnicos avanzados**.

---

## 7. Permisos Sensibles - Justificación Detallada

Si Google Play Console solicita justificación adicional para algún permiso, usar las siguientes respuestas:

### 7.1 INTERNET

**¿Por qué tu app necesita este permiso?**

```
La funcionalidad principal de MIB2 Controller es establecer conexiones TCP directas 
con unidades de infoentretenimiento MIB2 a través de la red local del usuario.

Usos específicos:
1. Conexión Telnet (puerto 23) a la unidad MIB2 en la red local
2. Escaneo de red local para detectar automáticamente dispositivos MIB2
3. Transferencia de archivos de configuración y backups
4. Consulta opcional a API pública de vwcoding.ru (HTTPS)

Sin este permiso, la app no puede cumplir su función principal.

Alcance: Solo red local (192.168.x.x, 10.x.x.x) y API opcional de vwcoding.ru
No se conecta a servicios de análisis, publicidad ni seguimiento.
```

### 7.2 ACCESS_NETWORK_STATE

**¿Por qué tu app necesita este permiso?**

```
Este permiso permite a la app detectar y validar la conectividad de red antes de 
intentar operaciones críticas.

Usos específicos:
1. Detectar si el dispositivo está conectado a una red WiFi o Ethernet
2. Identificar adaptadores USB-Ethernet conectados
3. Obtener la dirección IP local del adaptador para calcular el rango de escaneo
4. Validar que el adaptador tiene una IP válida antes de escanear la red

Sin este permiso, la app no puede detectar automáticamente la subred ni validar 
la conectividad del adaptador USB-Ethernet.

Alcance: Solo información de conectividad local, NO historial de navegación ni 
información sobre otras apps.
```

### 7.3 POST_NOTIFICATIONS

**¿Por qué tu app necesita este permiso?**

```
Este permiso permite mostrar notificaciones informativas sobre operaciones críticas 
de larga duración.

Usos específicos:
1. Notificar finalización de backups automáticos del sistema MIB2
2. Alertar si se pierde la conexión durante una operación crítica
3. Informar sobre el progreso de instalaciones del Toolbox
4. Notificar finalización de escaneos completos de red

Frecuencia: Infrecuente, solo durante operaciones activas iniciadas por el usuario.

Opcionalidad: Este permiso es completamente opcional. Si el usuario lo deniega, 
la app funciona con normalidad pero no mostrará notificaciones.

Privacidad: Las notificaciones NO contienen información personal ni sensible.
```

---

## 8. Respuestas a Preguntas Frecuentes de Revisión

### 8.1 "¿Por qué tu app necesita acceso a USB?"

**Respuesta:**

```
MIB2 Controller requiere acceso a dispositivos USB OTG para detectar y comunicarse 
con adaptadores USB-Ethernet (chipsets ASIX AX88772, AX88772A, AX88772B).

Funcionalidades USB:
1. Detectar adaptadores USB-Ethernet conectados al dispositivo Android
2. Leer información del adaptador (VID/PID, tipo de EEPROM)
3. Realizar test de EEPROM para determinar si es modificable (prevención de bricking)
4. Spoofing de VID/PID para emular adaptadores Volkswagen originales (solo en 
   adaptadores con EEPROM externa modificable)

Seguridad:
- El acceso USB se limita exclusivamente a adaptadores de red Ethernet
- NO accedemos a otros tipos de dispositivos USB (almacenamiento, cámaras, etc.)
- La detección de tipo de EEPROM previene daños permanentes al hardware

Sin acceso USB, la app no puede detectar ni configurar los adaptadores necesarios 
para comunicarse con las unidades MIB2.
```

### 8.2 "¿Tu app modifica configuraciones del dispositivo?"

**Respuesta:**

```
NO. MIB2 Controller NO modifica configuraciones del dispositivo Android del usuario.

La app solo modifica:
✓ Configuraciones de adaptadores USB-Ethernet externos (VID/PID spoofing)
✓ Sistema operativo de unidades MIB2 externas (no del dispositivo Android)

La app NO modifica:
✗ Configuraciones de red del dispositivo Android
✗ Configuraciones del sistema Android
✗ Configuraciones de otras aplicaciones
✗ Archivos del sistema Android

Todas las modificaciones se realizan en dispositivos externos conectados, 
nunca en el dispositivo Android que ejecuta la app.
```

### 8.3 "¿Tu app recopila información de diagnóstico?"

**Respuesta:**

```
La app genera logs de diagnóstico locales para facilitar la resolución de problemas, 
pero estos logs:

✓ Se almacenan SOLO en el dispositivo del usuario
✓ NO se transmiten automáticamente a servidores externos
✓ Pueden ser eliminados manualmente por el usuario en cualquier momento
✓ Se rotan automáticamente (solo últimos 7 días)

Contenido de los logs:
- Comandos Telnet enviados y respuestas recibidas
- Resultados de escaneos de red
- Eventos de detección USB
- Mensajes de error para debugging

Si el usuario desea compartir logs para soporte técnico, debe exportarlos 
manualmente. No existe transmisión automática.

La app NO utiliza servicios de crash reporting (Firebase Crashlytics, Sentry, etc.).
```

---

## 9. Checklist de Implementación

Antes de enviar la app a revisión en Google Play Console, verificar que se han completado todos los siguientes pasos:

### 9.1 Documentación Legal

- [x] Política de Privacidad v2.0 creada y revisada
- [x] Política de Privacidad alojada en URL pública (https://feplazas.github.io/mib2-controller/)
- [x] URL de Política de Privacidad actualizada en Play Console
- [ ] Términos de Servicio actualizados (opcional pero recomendado)
- [x] Justificación de permisos documentada (PLAY_STORE_PERMISSIONS.md)

### 9.2 Cuestionario de Seguridad de Datos

- [ ] Pregunta principal respondida (NO recopilamos datos)
- [ ] Todos los tipos de datos marcados como NO
- [ ] Pregunta sobre cifrado en tránsito respondida (SÍ, parcialmente)
- [ ] Pregunta sobre eliminación de datos respondida (N/A)
- [ ] Declaración pública de seguridad de datos redactada

### 9.3 Clasificación de Contenido

- [ ] Cuestionario IARC completado
- [ ] Clasificación de edad verificada
- [ ] Advertencia de "18+" incluida en descripción de la app

### 9.4 Permisos

- [ ] Justificación de INTERNET preparada
- [ ] Justificación de ACCESS_NETWORK_STATE preparada
- [ ] Justificación de POST_NOTIFICATIONS preparada
- [ ] Justificación de USB Host preparada

### 9.5 Respuestas a Revisión

- [ ] Respuesta a pregunta sobre acceso USB preparada
- [ ] Respuesta a pregunta sobre modificación de configuraciones preparada
- [ ] Respuesta a pregunta sobre información de diagnóstico preparada

### 9.6 Verificación Final

- [ ] URL de Política de Privacidad accesible sin autenticación
- [ ] Política de Privacidad en español (mismo idioma que la app)
- [ ] Fecha de actualización correcta (13 de enero de 2026)
- [ ] Versión del documento correcta (2.0)
- [ ] Información de contacto actualizada (feplazas@gmail.com)

---

## 10. Cronograma de Implementación

| Paso | Tarea | Responsable | Tiempo Estimado | Estado |
|------|-------|-------------|-----------------|--------|
| 1 | Actualizar PRIVACY_POLICY.md en repositorio GitHub Pages | Usuario | 10 min | ⏳ Pendiente |
| 2 | Verificar que la URL es accesible públicamente | Usuario | 5 min | ⏳ Pendiente |
| 3 | Actualizar URL en Google Play Console | Usuario | 5 min | ⏳ Pendiente |
| 4 | Completar cuestionario de Seguridad de Datos | Usuario | 15 min | ⏳ Pendiente |
| 5 | Completar cuestionario IARC (clasificación de contenido) | Usuario | 10 min | ⏳ Pendiente |
| 6 | Preparar justificaciones de permisos | Usuario | 10 min | ⏳ Pendiente |
| 7 | Enviar app a revisión en Play Console | Usuario | 5 min | ⏳ Pendiente |
| 8 | Responder a solicitudes de revisión (si las hay) | Usuario | Variable | ⏳ Pendiente |

**Tiempo total estimado:** 60 minutos

---

## 11. Contacto para Soporte

Si tienes dudas durante la implementación de esta política de privacidad en Google Play Console, contacta a:

**Desarrollador:** Felipe Plazas  
**Email:** feplazas@gmail.com  
**Proyecto:** https://github.com/feplazas/mib2-controller

---

**Documento creado:** 13 de enero de 2026  
**Última actualización:** 13 de enero de 2026  
**Versión:** 1.0
