# Guía de Troubleshooting - MIB2 Controller

**Versión:** 1.0  
**Fecha:** 2026-01-14  
**Autor:** Manus AI

Esta guía documenta problemas comunes que los usuarios pueden encontrar al usar MIB2 Controller y proporciona soluciones paso a paso para resolverlos.

---

## Tabla de Contenidos

1. [Problemas de Detección USB](#1-problemas-de-detección-usb)
2. [Problemas de Compatibilidad de Chipset](#2-problemas-de-compatibilidad-de-chipset)
3. [Errores de Spoofing](#3-errores-de-spoofing)
4. [Problemas de Conexión Telnet](#4-problemas-de-conexión-telnet)
5. [Errores de Firmware MIB2](#5-errores-de-firmware-mib2)
6. [Problemas de Backup/Restore](#6-problemas-de-backuprestore)
7. [Errores de Permisos](#7-errores-de-permisos)
8. [Problemas de Performance](#8-problemas-de-performance)
9. [Preguntas Frecuentes (FAQ)](#9-preguntas-frecuentes-faq)

---

## 1. Problemas de Detección USB

### Problema 1.1: "No se detecta adaptador USB conectado"

**Síntomas:**
- La app muestra "Desconectado" en la pantalla Home
- El botón "Test EEPROM" está deshabilitado
- No aparece información del adaptador

**Causas comunes:**

| Causa | Probabilidad | Solución |
|-------|--------------|----------|
| Adaptador no conectado físicamente | Alta | Conectar adaptador USB-Ethernet al puerto USB del teléfono |
| Cable OTG defectuoso | Media | Probar con otro cable OTG simple (no requiere alimentación externa) |
| Permisos USB no otorgados | Alta | Ver sección 7.1 |
| Adaptador no soportado | Baja | Verificar que sea chipset ASIX (ver sección 2) |

**Solución paso a paso:**

1. **Verificar conexión física**
   - Desconectar el adaptador USB-Ethernet
   - Esperar 5 segundos
   - Reconectar el adaptador
   - Observar si aparece notificación de Android "Dispositivo USB conectado"

2. **Otorgar permisos USB**
   - Cuando aparezca el diálogo "¿Permitir que MIB2 Controller acceda al dispositivo USB?", presionar **"Permitir"**
   - Si no aparece el diálogo, ir a Configuración → Aplicaciones → MIB2 Controller → Permisos → Habilitar todos los permisos

3. **Verificar cable OTG**
   - Usar un cable OTG simple (no requiere alimentación externa)
   - El Android alimenta el adaptador directamente por USB
   - Probar el cable OTG con otro dispositivo USB (pendrive, teclado)
   - Si no funciona, reemplazar el cable

4. **Reiniciar la app**
   - Cerrar completamente MIB2 Controller (no solo minimizar)
   - Volver a abrir la app
   - Reconectar el adaptador

**Resultado esperado:**
- La pantalla Home debe mostrar "Conectado" en verde
- Debe aparecer información del adaptador (Vendor ID, Product ID, chipset)

---

### Problema 1.2: "Adaptador detectado pero no responde"

**Síntomas:**
- La app muestra "Conectado" pero las operaciones fallan
- Error "Failed to open USB device" al intentar leer EEPROM

**Causas comunes:**
- Adaptador en uso por otra aplicación
- Driver del kernel bloqueando acceso
- Adaptador defectuoso

**Solución:**

1. **Cerrar otras apps de red**
   - Ir a Configuración → Aplicaciones → Aplicaciones en ejecución
   - Cerrar cualquier app que pueda estar usando el adaptador (navegadores, apps de VPN)

2. **Reiniciar el adaptador**
   - Desconectar físicamente el adaptador
   - Esperar 10 segundos
   - Reconectar

3. **Verificar con otro adaptador**
   - Si tienes otro adaptador USB-Ethernet, prueba con ese
   - Si el segundo adaptador funciona, el primero puede estar defectuoso

---

## 2. Problemas de Compatibilidad de Chipset

### Problema 2.1: "Chipset incompatible detectado"

**Síntomas:**
- La app muestra "Incompatible" en rojo en la pantalla Home
- Mensaje: "Este chipset no soporta spoofing de VID/PID"
- Botón "Auto Spoof" deshabilitado

**Chipsets incompatibles conocidos:**

| Chipset | Razón de Incompatibilidad | Alternativa |
|---------|---------------------------|-------------|
| AX88179 | Usa eFuse (no modificable) | Comprar adaptador con AX88772 |
| AX88179A | Usa eFuse (no modificable) | Comprar adaptador con AX88772A |
| RTL8153 | No es ASIX, arquitectura diferente | Comprar adaptador ASIX |
| RTL8152 | No es ASIX, arquitectura diferente | Comprar adaptador ASIX |

**Solución:**

No hay solución de software para chipsets incompatibles. La única opción es **adquirir un adaptador compatible**.

**Adaptadores recomendados:**

1. **D-Link DUB-E100** (original, ya viene con VID/PID correcto)
   - Chipset: ASIX AX88772
   - VID/PID: 2001:3C05
   - Precio: ~$15-20 USD
   - Disponibilidad: Alta

2. **Adaptadores genéricos con AX88772**
   - Buscar en Amazon/AliExpress: "USB Ethernet AX88772"
   - Verificar en descripción que mencione "ASIX AX88772"
   - Precio: ~$5-10 USD
   - **Importante:** Verificar chipset con la app antes de hacer spoofing

3. **Adaptadores con AX88772A/B** (experimental)
   - Funcionan pero pueden requerir múltiples intentos
   - Crear backup antes de intentar spoofing

---

### Problema 2.2: "Test EEPROM muestra 'eFuse detectado'"

**Síntomas:**
- Al presionar "Test EEPROM", aparece diálogo: "eFuse detectado - No modificable"
- Chipset reportado como AX88179 o AX88179A

**Explicación:**

Los chipsets AX88179/A usan **eFuse** (fusibles electrónicos) en lugar de EEPROM externa. Los eFuse son **permanentes y no modificables** por diseño. Intentar escribir en eFuse puede **brickear el adaptador permanentemente**.

**Solución:**

**NO intentar spoofing con estos adaptadores.** La app bloquea correctamente las operaciones de escritura para proteger el hardware.

**Opciones:**

1. Usar el adaptador para otros propósitos (no MIB2)
2. Comprar un adaptador compatible (ver Problema 2.1)

---

## 3. Errores de Spoofing

### Problema 3.1: "Spoofing falla con error 'WRITE_FAILED'"

**Síntomas:**
- Auto Spoof inicia pero falla en Paso 2 o Paso 3
- Error: "Failed to write EEPROM at offset 0x88"

**Causas comunes:**

| Causa | Solución |
|-------|----------|
| EEPROM protegida contra escritura | Ver solución 3.1.1 |
| Adaptador desconectado durante operación | Reconectar y reintentar |
| Voltaje insuficiente del puerto USB | Usar hub USB con alimentación externa |
| Checksum incorrecto | La app lo calcula automáticamente, reportar bug |

**Solución 3.1.1: EEPROM protegida contra escritura**

Algunos adaptadores tienen un bit de protección contra escritura en offset 0x00.

1. **Verificar protección:**
   - Ir a pantalla "Commands"
   - Ejecutar: `READ_EEPROM 0x00 1`
   - Si el primer byte es `0x01`, la EEPROM está protegida

2. **Desactivar protección (avanzado):**
   ```
   WRITE_EEPROM 0x00 00
   ```
   **⚠️ ADVERTENCIA:** Esto puede brickear algunos adaptadores. Crear backup primero.

3. **Alternativa segura:**
   - Comprar otro adaptador sin protección
   - Usar adaptador D-Link DUB-E100 original (no requiere spoofing)

---

### Problema 3.2: "Spoofing exitoso pero MIB2 no reconoce el adaptador"

**Síntomas:**
- Auto Spoof completa exitosamente
- VID/PID verificados como 2001:3C05
- MIB2 sigue sin detectar el adaptador

**Causas comunes:**

1. **Firmware MIB2 incompatible**
   - Verificar versión de firmware (ver sección 5)
   - Versiones soportadas: T480, T490, T500

2. **Adaptador no reconectado después de spoofing**
   - **Solución:** Desconectar el adaptador del teléfono, esperar 5 segundos, reconectar
   - Conectar al MIB2 solo después de verificar VID/PID

3. **Cable USB del MIB2 defectuoso**
   - Probar con otro cable USB-A a USB-C/Micro-USB

4. **Puerto USB del MIB2 dañado**
   - Probar con otro dispositivo USB conocido (pendrive)
   - Si no funciona, puede requerir reparación del MIB2

---

### Problema 3.3: "Spoofing revierte después de desconectar"

**Síntomas:**
- Spoofing exitoso inicialmente
- Después de desconectar y reconectar, VID/PID vuelven a valores originales

**Causa:**

Esto **NO debería ocurrir** si el spoofing fue exitoso. La EEPROM es memoria no volátil.

**Diagnóstico:**

1. **Verificar que la escritura fue real:**
   - Después de spoofing, ir a "Commands"
   - Ejecutar: `READ_EEPROM 0x88 4`
   - Debe mostrar: `01 20 05 3C` (little-endian de 2001:3C05)

2. **Si muestra valores diferentes:**
   - La escritura no se completó correctamente
   - Intentar spoofing nuevamente
   - Verificar que no hay protección contra escritura (ver 3.1.1)

3. **Si muestra valores correctos pero el sistema reporta otros:**
   - Puede ser un bug del sistema operativo Android
   - Reiniciar el teléfono
   - Reconectar el adaptador

---

## 4. Problemas de Conexión Telnet

### Problema 4.1: "No se puede conectar a MIB2 vía Telnet"

**Síntomas:**
- Pantalla "Telnet" muestra "Desconectado"
- Error: "Connection refused" o "Connection timeout"

**Solución paso a paso:**

1. **Verificar que el adaptador está conectado al MIB2**
   - El adaptador debe estar físicamente conectado al puerto USB del MIB2
   - El MIB2 debe estar encendido (contacto en posición II)

2. **Verificar detección de red**
   - En la pantalla Home de la app, debe aparecer "Red detectada: 192.168.x.0/24"
   - Si no aparece, el MIB2 no está asignando IP al adaptador

3. **Escanear red manualmente**
   - Ir a pantalla "Scanner"
   - Presionar "Quick Scan" (escanea .1 y .2)
   - Si no encuentra nada, presionar "Full Scan" (escanea toda la subred)

4. **Conectar manualmente si se encontró la IP**
   - Si el scanner encontró el MIB2 (ej: 192.168.1.1), anotar la IP
   - Ir a pantalla "Telnet"
   - Ingresar la IP manualmente
   - Presionar "Connect"

5. **Si sigue sin conectar:**
   - Verificar que el firmware MIB2 tiene Telnet habilitado (ver sección 5.2)
   - Algunos firmwares tienen Telnet deshabilitado por seguridad

---

### Problema 4.2: "Telnet conecta pero no responde a comandos"

**Síntomas:**
- Conexión Telnet exitosa
- Comandos enviados pero no hay respuesta
- Pantalla en blanco o timeout

**Solución:**

1. **Verificar que el MIB2 terminó de bootear**
   - Esperar al menos 2 minutos después de encender el MIB2
   - El sistema puede estar cargando servicios

2. **Probar comando simple:**
   ```
   ls
   ```
   - Si responde con listado de archivos, Telnet funciona correctamente

3. **Verificar sintaxis de comandos:**
   - Comandos son case-sensitive
   - Ejemplo correcto: `cat /etc/version`
   - Ejemplo incorrecto: `CAT /ETC/VERSION`

---

## 5. Errores de Firmware MIB2

### Problema 5.1: "Firmware no detectado o incompatible"

**Síntomas:**
- Pantalla Home muestra "Firmware: Desconocido"
- Advertencia: "Firmware no verificado, proceder con precaución"

**Solución:**

1. **Conectar vía Telnet** (ver sección 4)

2. **Leer versión de firmware manualmente:**
   ```
   cat /etc/version
   ```

3. **Interpretar resultado:**

| Versión Reportada | Compatibilidad | Acción |
|-------------------|----------------|--------|
| T480, T490, T500 | ✅ Compatible | Proceder con confianza |
| T470 o anterior | ⚠️ No probado | Proceder con precaución, crear backup |
| T510 o posterior | ⚠️ No probado | Proceder con precaución, crear backup |
| Otro formato | ❌ Desconocido | NO proceder, reportar versión al desarrollador |

---

### Problema 5.2: "Telnet no disponible en firmware"

**Síntomas:**
- Scanner encuentra el MIB2
- Conexión Telnet falla con "Connection refused"
- Puerto 23 cerrado

**Explicación:**

Algunos firmwares MIB2 más recientes tienen Telnet deshabilitado por seguridad. Esto es una decisión de Volkswagen/Audi.

**Solución:**

**Opción A: Habilitar Telnet (requiere acceso físico al MIB2)**

1. Extraer la unidad MIB2 del vehículo
2. Conectar vía UART/Serial (requiere hardware especializado)
3. Habilitar Telnet desde consola serial
4. Reinstalar MIB2

**⚠️ Esto requiere conocimientos avanzados y puede anular la garantía.**

**Opción B: Usar funciones que no requieren Telnet**

- Spoofing de adaptador USB (no requiere Telnet)
- Detección de red (no requiere Telnet)
- Backup/Restore de EEPROM (no requiere Telnet)

**Funciones que SÍ requieren Telnet:**

- Generación e inyección de códigos FEC
- Detección de firmware
- Comandos personalizados

---

## 6. Problemas de Backup/Restore

### Problema 6.1: "Backup falla con error de lectura"

**Síntomas:**
- Al crear backup, aparece error: "Failed to read EEPROM"
- Backup no se guarda

**Solución:**

1. **Verificar que el adaptador está conectado**
   - Pantalla Home debe mostrar "Conectado"

2. **Reintentar la operación**
   - Algunos adaptadores requieren múltiples intentos
   - Presionar "Create Backup" nuevamente

3. **Verificar permisos de almacenamiento**
   - Ir a Configuración → Aplicaciones → MIB2 Controller → Permisos
   - Habilitar "Almacenamiento"

4. **Liberar espacio en el dispositivo**
   - Backups ocupan ~1 KB cada uno
   - Verificar que hay al menos 10 MB libres

---

### Problema 6.2: "Restore falla con error de verificación"

**Síntomas:**
- Restore inicia pero falla en verificación
- Error: "Checksum mismatch after restore"

**Causa:**

El contenido escrito en la EEPROM no coincide con el backup original. Esto puede indicar:
- EEPROM defectuosa
- Interferencia eléctrica durante escritura
- Adaptador desconectado durante operación

**Solución:**

1. **Reintentar restore**
   - Asegurar que el adaptador está firmemente conectado
   - No tocar el adaptador durante la operación
   - Presionar "Restore" nuevamente

2. **Verificar integridad del backup**
   - Ir a lista de backups
   - Verificar que el backup tiene checksum MD5 válido
   - Si el checksum es "N/A", el backup está corrupto

3. **Usar backup alternativo**
   - Si tienes múltiples backups, intentar con otro
   - El backup más reciente no siempre es el mejor

4. **Último recurso: Restore parcial manual**
   - Ir a pantalla "Commands"
   - Leer el backup manualmente:
     ```
     READ_EEPROM 0x00 256
     ```
   - Comparar con el backup guardado
   - Escribir solo los offsets que difieren

---

### Problema 6.3: "Backups desaparecen después de reinstalar la app"

**Síntomas:**
- Backups creados anteriormente no aparecen en la lista
- Lista de backups vacía después de reinstalación

**Causa:**

Los backups se almacenan en `AsyncStorage` de la app, que se borra al desinstalar.

**Prevención:**

1. **Exportar backups antes de desinstalar:**
   - Ir a pantalla "Toolbox" → "Backup Management"
   - Seleccionar backup
   - Presionar "Export to File"
   - Guardar archivo .json en almacenamiento externo o nube

2. **Importar backups después de reinstalar:**
   - Reinstalar MIB2 Controller
   - Ir a "Toolbox" → "Backup Management"
   - Presionar "Import from File"
   - Seleccionar archivo .json guardado

**Nota:** Esta funcionalidad de export/import está planificada para v1.1.

---

## 7. Errores de Permisos

### Problema 7.1: "Permiso USB denegado"

**Síntomas:**
- Al conectar adaptador, aparece diálogo de permisos
- Usuario presiona "Denegar" accidentalmente
- App no puede acceder al adaptador

**Solución:**

1. **Otorgar permisos manualmente:**
   - Ir a Configuración de Android
   - Aplicaciones → MIB2 Controller
   - Permisos
   - Buscar "Acceso a dispositivos USB" o similar
   - Habilitar

2. **Si no aparece la opción:**
   - Desinstalar MIB2 Controller
   - Reinstalar desde Play Store
   - Al conectar adaptador, presionar "Permitir" en el diálogo

3. **Marcar "Usar siempre para este dispositivo USB":**
   - Cuando aparezca el diálogo de permisos
   - Marcar la casilla "Usar siempre para este dispositivo USB"
   - Presionar "Permitir"
   - Esto evita que el diálogo aparezca en el futuro

---

### Problema 7.2: "Permiso de almacenamiento denegado"

**Síntomas:**
- Backups no se guardan
- Export de backups falla

**Solución:**

1. **Otorgar permisos de almacenamiento:**
   - Ir a Configuración → Aplicaciones → MIB2 Controller
   - Permisos → Almacenamiento
   - Seleccionar "Permitir"

2. **En Android 11+:**
   - Puede requerir "Acceso a todos los archivos"
   - Ir a Configuración → Aplicaciones → MIB2 Controller
   - Permisos especiales → Acceso a todos los archivos
   - Habilitar

---

## 8. Problemas de Performance

### Problema 8.1: "App lenta o no responde"

**Síntomas:**
- Operaciones tardan mucho tiempo
- UI se congela
- ANR (Application Not Responding)

**Causas comunes:**

| Causa | Solución |
|-------|----------|
| Operación EEPROM en progreso | Esperar a que complete (puede tardar 2-5 min) |
| Telnet bloqueado | Desconectar Telnet y reconectar |
| Memoria insuficiente | Cerrar otras apps, reiniciar teléfono |
| Bug en la app | Reportar al desarrollador con logs |

**Solución:**

1. **Verificar que no hay operación en progreso:**
   - Observar indicadores de progreso
   - No interrumpir operaciones de escritura EEPROM

2. **Reiniciar la app:**
   - Cerrar completamente (no solo minimizar)
   - Volver a abrir

3. **Reiniciar el teléfono:**
   - Si el problema persiste
   - Libera memoria y reinicia servicios del sistema

---

### Problema 8.2: "Batería se agota rápidamente"

**Síntomas:**
- Batería del teléfono baja rápidamente mientras usa la app
- Teléfono se calienta

**Causa:**

El adaptador USB-Ethernet consume energía del puerto USB del teléfono. Además, la app realiza polling cada 10 segundos para detectar cambios.

**Solución:**

1. **Usar hub USB con alimentación externa:**
   - Conectar adaptador a hub USB alimentado
   - Conectar hub al teléfono
   - Esto reduce consumo de batería del teléfono

2. **Conectar teléfono a cargador:**
   - Mientras usa la app, mantener teléfono conectado a cargador

3. **Reducir uso continuo:**
   - Realizar operaciones necesarias y desconectar
   - No dejar la app abierta indefinidamente

---

## 9. Preguntas Frecuentes (FAQ)

### 9.1: ¿La app funciona sin conexión a internet?

**Sí.** MIB2 Controller es 100% offline. No requiere conexión a internet para ninguna funcionalidad.

---

### 9.2: ¿Puedo usar la app en iOS (iPhone/iPad)?

**No.** La app está diseñada exclusivamente para Android debido a las limitaciones de iOS:
- iOS no permite acceso directo a dispositivos USB
- iOS no soporta USB Host Mode para adaptadores Ethernet

---

### 9.3: ¿Es seguro hacer spoofing del adaptador?

**Sí, si se siguen las precauciones:**

✅ **Seguro:**
- Crear backup antes de spoofing
- Usar adaptadores con EEPROM externa (AX88772/A/B)
- Seguir las advertencias de la app

❌ **NO seguro:**
- Intentar spoofing en chipsets incompatibles (AX88179/A)
- Desconectar adaptador durante escritura
- Ignorar advertencias de la app

---

### 9.4: ¿Qué hago si brickeo mi adaptador?

**Pasos de recovery:**

1. **Intentar restore desde backup:**
   - Ir a "Toolbox" → "Backup Management"
   - Seleccionar backup anterior al spoofing
   - Presionar "Restore"

2. **Si restore falla:**
   - Intentar múltiples veces (algunos adaptadores son temperamentales)
   - Probar en otro teléfono Android

3. **Si sigue sin funcionar:**
   - El adaptador puede estar permanentemente brickeado
   - Comprar un nuevo adaptador
   - **Lección:** Siempre crear backup antes de modificar EEPROM

---

### 9.5: ¿Puedo usar múltiples adaptadores con la app?

**Sí.** La app soporta múltiples adaptadores, pero solo uno a la vez. Para cambiar de adaptador:

1. Desconectar adaptador actual
2. Conectar nuevo adaptador
3. Otorgar permisos USB si es la primera vez
4. La app detectará automáticamente el nuevo adaptador

Cada adaptador tiene su propio backup independiente.

---

### 9.6: ¿La app modifica mi vehículo o unidad MIB2?

**No.** La app **solo modifica el adaptador USB-Ethernet**, no el vehículo ni la unidad MIB2.

**Lo que la app SÍ hace:**
- Modifica EEPROM del adaptador USB-Ethernet
- Lee información de la unidad MIB2 vía Telnet
- Inyecta códigos FEC en archivos temporales del MIB2

**Lo que la app NO hace:**
- No modifica firmware del MIB2
- No modifica configuración permanente del vehículo
- No desbloquea funciones del vehículo directamente

---

### 9.7: ¿Necesito root en mi teléfono Android?

**No.** La app funciona en teléfonos Android sin root. Solo requiere:
- Android 7.0 (API 24) o superior
- Soporte de USB Host Mode (la mayoría de teléfonos modernos)
- Permisos USB otorgados

---

### 9.8: ¿Puedo usar la app en tablet Android?

**Sí.** La app funciona en tablets Android que soporten USB Host Mode. Asegúrate de que tu tablet tiene:
- Puerto USB-C o Micro-USB con soporte OTG
- Android 7.0 o superior

---

### 9.9: ¿La app envía datos a internet o servidores externos?

**No.** La app es 100% local y no envía ningún dato a internet. No hay:
- Telemetría
- Analytics
- Reportes de uso
- Conexiones a servidores externos

Todo el procesamiento ocurre localmente en tu dispositivo.

---

### 9.10: ¿Cómo reporto un bug o solicito una funcionalidad?

**Opciones:**

1. **GitHub Issues:**
   - https://github.com/feplazas/mib2-controller/issues
   - Crear un nuevo issue con detalles del problema

2. **Play Store:**
   - Dejar reseña en Google Play Store
   - El desarrollador responde a reseñas

3. **Email:**
   - Contactar al desarrollador directamente
   - Incluir logs y capturas de pantalla si es posible

---

## Apéndice A: Códigos de Error

| Código | Significado | Solución |
|--------|-------------|----------|
| `USB_NOT_FOUND` | No se detectó dispositivo USB | Ver sección 1.1 |
| `USB_PERMISSION_DENIED` | Permisos USB no otorgados | Ver sección 7.1 |
| `DEVICE_NOT_OPENED` | No se pudo abrir dispositivo USB | Reiniciar app, reconectar adaptador |
| `READ_FAILED` | Error al leer EEPROM | Verificar conexión, reintentar |
| `WRITE_FAILED` | Error al escribir EEPROM | Ver sección 3.1 |
| `INVALID_MAGIC` | magicValue incorrecto | Bug de la app, reportar |
| `CHECKSUM_MISMATCH` | Verificación falló después de escritura | Ver sección 6.2 |
| `EEPROM_PROTECTED` | EEPROM protegida contra escritura | Ver solución 3.1.1 |
| `EFUSE_DETECTED` | Chipset usa eFuse (no modificable) | Ver sección 2.2 |
| `INCOMPATIBLE_CHIPSET` | Chipset no soportado | Ver sección 2.1 |
| `CONNECTION_REFUSED` | Telnet rechazado por MIB2 | Ver sección 4.1 |
| `CONNECTION_TIMEOUT` | Timeout de conexión Telnet | Verificar red, ver sección 4.1 |
| `INVALID_RESPONSE` | Respuesta inválida de MIB2 | Verificar firmware, ver sección 5 |

---

## Apéndice B: Comandos Útiles de Telnet

### Información del Sistema

```bash
# Ver versión de firmware
cat /etc/version

# Ver información del sistema
uname -a

# Ver procesos en ejecución
ps

# Ver uso de memoria
free

# Ver uso de disco
df -h
```

### Diagnóstico de Red

```bash
# Ver configuración de red
ifconfig

# Ver tabla de rutas
route -n

# Ping a gateway
ping -c 4 192.168.1.1
```

### Archivos de Configuración

```bash
# Ver lista de excepciones FEC
cat /tmp/ExceptionList.txt

# Ver configuración de CarPlay
cat /fs/sda0/CarPlay.cfg

# Ver logs del sistema
tail -f /var/log/messages
```

**⚠️ ADVERTENCIA:** No modificar archivos del sistema sin conocimiento avanzado. Puede brickear la unidad MIB2.

---

## Apéndice C: Especificaciones Técnicas de Chipsets

### ASIX AX88772

| Especificación | Valor |
|----------------|-------|
| Tipo de memoria | EEPROM externa (93C46 o 93C56) |
| Tamaño EEPROM | 256 bytes |
| Modificable | ✅ Sí |
| VID/PID offset | 0x88-0x8B |
| Checksum offset | 0xFE-0xFF |
| Compatibilidad MIB2 | ✅ Alta (después de spoofing) |

### ASIX AX88772A

| Especificación | Valor |
|----------------|-------|
| Tipo de memoria | EEPROM externa (93C46 o 93C56) |
| Tamaño EEPROM | 256 bytes |
| Modificable | ✅ Sí (experimental) |
| VID/PID offset | 0x88-0x8B |
| Checksum offset | 0xFE-0xFF |
| Compatibilidad MIB2 | ⚠️ Media (requiere múltiples intentos) |

### ASIX AX88179

| Especificación | Valor |
|----------------|-------|
| Tipo de memoria | eFuse integrado |
| Tamaño EEPROM | N/A |
| Modificable | ❌ No |
| VID/PID offset | N/A |
| Checksum offset | N/A |
| Compatibilidad MIB2 | ❌ Ninguna |

---

## Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-01-14 | Versión inicial |

---

**¿Necesitas más ayuda?**

Si tu problema no está listado en esta guía, por favor:
1. Revisa la documentación completa en el repositorio de GitHub
2. Busca en Issues existentes: https://github.com/feplazas/mib2-controller/issues
3. Crea un nuevo Issue con detalles completos del problema
