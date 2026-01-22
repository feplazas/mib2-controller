# Análisis Técnico del PDF MIB2 - Hallazgos Clave

## Resumen del Documento
El PDF es un "Informe Técnico Integral sobre la Reprogramación de Memoria No Volátil en Controladores Ethernet ASIX AX88772 mediante Entornos Linux y Herramientas de Diagnóstico de Red"

## Puntos Técnicos Críticos

### 1. Arquitectura del Hardware ASIX AX88772
- Controlador Fast Ethernet 10/100 Mbps
- Variantes: AX88772A, AX88772B, AX88772C
- **CRÍTICO**: La capacidad de "spoofing" depende de la presencia de una **EEPROM serial externa** (chips 93C56 o 93C66)
- Si no hay EEPROM externa o es eFuse (One-Time Programmable), NO se puede modificar

### 2. Mapa de Memoria EEPROM
- Interfaz serial síncrona Microwire
- Estructura de 16 bits (2 bytes por palabra)
- Datos almacenados:
  - **Dirección MAC** (6 bytes)
  - **Descriptores USB** (VID/PID)
  - Cadenas de fabricante/producto
  - Configuraciones de hardware (PHY, Wake-on-LAN, LEDs)

### 3. Tabla de Identificadores VID/PID
| Fabricante | Modelo | VID (Hex) | PID (Hex) | Estado en MIB2 |
|---|---|---|---|---|
| ASIX Electronics | AX88772 (Genérico) | 0x0B95 | 0x7720 | **NO Soportado / Bloqueado** |
| D-Link | DUB-E100 (Rev B1) | 0x2001 | 0x3C05 | **Soportado / Whitelisted** |
| D-Link | DUB-E100 (Rev C1) | 0x2001 | 0x1A02 | Soportado (Firmware reciente) |
| SMSC | LAN9500 | 0x0424 | 0x9500 | Soportado (Ciertos modelos) |

### 4. Contexto MIB2 VAG
- Unidades MIB2 fabricadas por Technisat, Preh, Delphi o Harman
- Sistema operativo: QNX Neutrino (tiempo real)
- **Whitelist de hardware**: El stack USB de QNX tiene una lista de dispositivos permitidos
- Ubicación de whitelist: `/etc/io-net/` o dentro de binarios de controladores como `devnp-asix.so`
- El adaptador D-Link DUB-E100 (VID 0x2001, PID 0x3C05) fue elegido por ingenieros de VAG para desarrollo

### 5. Vectores de Acceso Post-Spoof
Una vez conectado con adaptador spoofed:
- **Telnet** (puerto 23)
- **FTP** (puerto 21)
- IP típica: 172.16.x.x o 192.168.1.4

### 6. Uso del MIB2 Toolbox
Permite:
1. Habilitar características de software (CarPlay, Android Auto, Full Link) via FEC codes
2. Modificar personalizaciones (skins, logos, sonidos)
3. Realizar copias de seguridad de la memoria eMMC

### 7. Herramienta Principal: ethtool
- Utilidad estándar de Linux para configurar interfaces de red
- Permite leer/escribir EEPROM de adaptadores de red
- **CRÍTICO**: Requiere acceso directo al hardware USB (no funciona en Android sin root)

### 8. Entorno Recomendado
- **Live USB con Ubuntu 22.04 LTS o Linux Mint** (recomendado)
- Alternativas: WSL2 con usbipd-win, VirtualBox/VMware
- **NO funciona directamente en Windows** debido a capa NDIS

## Implicaciones para la App Android

### Lo que la app PUEDE hacer correctamente:
1. ✅ Detectar adaptadores USB conectados
2. ✅ Mostrar VID/PID del adaptador
3. ✅ Conectarse al MIB2 via Telnet (si ya está spoofed)
4. ✅ Ejecutar comandos de diagnóstico
5. ✅ Generar códigos FEC (enlace externo)
6. ✅ Guía de instalación de MIB2 Toolbox

### Lo que la app NO puede hacer en Android (sin root):
1. ❌ Leer EEPROM del adaptador USB directamente
2. ❌ Escribir EEPROM del adaptador USB directamente
3. ❌ Ejecutar ethtool (requiere Linux con acceso raw al hardware)

### Solución Implementada en la App:
La app usa **libusb** via USB Host API de Android para enviar comandos de control USB directamente al chip ASIX, emulando lo que hace ethtool pero a nivel de protocolo USB.

## Comandos ethtool Equivalentes

### Leer EEPROM:
```bash
sudo ethtool -e eth0
```

### Escribir VID/PID (D-Link DUB-E100):
```bash
# Offset 0x07: VID (little-endian) = 0x2001 → bytes: 01 20
# Offset 0x08: PID (little-endian) = 0x3C05 → bytes: 05 3C
sudo ethtool -E eth0 magic 0xDEADBEEF offset 0x07 value 0x01
sudo ethtool -E eth0 magic 0xDEADBEEF offset 0x08 value 0x20
sudo ethtool -E eth0 magic 0xDEADBEEF offset 0x09 value 0x05
sudo ethtool -E eth0 magic 0xDEADBEEF offset 0x0A value 0x3C
```

### Magic Value:
- 0xDEADBEEF es un valor de autorización para escritura
- Algunos adaptadores usan otros valores

## Verificación Necesaria en el Código de la App

1. **AsixUsbManager.ts** - ¿Implementa correctamente los comandos USB de control para ASIX?
2. **Offsets de EEPROM** - ¿Usa los offsets correctos para VID/PID?
3. **Endianness** - ¿Maneja correctamente little-endian?
4. **Magic value** - ¿Usa 0xDEADBEEF u otro valor?
5. **Backup antes de escribir** - ¿Crea backup de EEPROM completa?
6. **Verificación post-escritura** - ¿Lee y verifica después de escribir?


## Información Técnica Crítica (Páginas 6-10)

### 5.1 Comunicación Kernel-Espacio de Usuario (ethtool)
- ethtool usa ioctl() con SIOCETHTOOL para comunicarse con el driver asix.ko
- Estructura ethtool_eeprom contiene:
  - Comando (ETHTOOL_GEEPROM para leer, ETHTOOL_SEEPROM para escribir)
  - Offset de memoria
  - Longitud de datos
  - **Magic value** (CRÍTICO)

### 5.2 El Mecanismo de Seguridad "Magic Value"
- **AX_EEPROM_MAGIC = 0xDEADBEEF** (3735928559 en decimal)
- Definido en drivers/net/usb/asix.c del kernel Linux
- Sin este valor exacto, la operación de escritura es rechazada con "Invalid argument"
- Es una salvaguarda para prevenir escrituras accidentales

### 6. Metodología Operativa: Procedimiento de Spoofing

#### 6.1 Identificación y Mapeo del Dispositivo
1. `lsusb` - Listar dispositivos USB (buscar ID 0b95:7720 ASIX)
2. `ip link show` o `ifconfig -a` - Identificar interfaz de red (eth1, enx...)
3. `sudo ethtool -i eth1` - Verificar soporte EEPROM (supports-eeprom-access: yes)

#### 6.2 Lectura y Análisis del Mapa de Memoria
```bash
sudo ethtool -e eth1
```
- VID actual: 0x0B95 → almacenado como 95 0B (little-endian)
- PID actual: 0x7720 → almacenado como 20 77 (little-endian)
- Buscar secuencia "95 0B 20 77" en el volcado

#### Mapa de Memoria Objetivo (CRÍTICO - Offsets típicos para AX88772B/C):
| Offset | Contenido | Valor Original | Valor Objetivo |
|--------|-----------|----------------|----------------|
| **0x88** | Byte bajo VID | 0x95 | **0x01** |
| **0x89** | Byte alto VID | 0x0B | **0x20** |
| **0x8A** | Byte bajo PID | 0x20 | **0x05** |
| **0x8B** | Byte alto PID | 0x77 | **0x3C** |

**NOTA**: Si la secuencia no está en 0x88, buscar visualmente en el volcado. Escribir en offsets incorrectos puede **BRICKEAR** el dispositivo.

#### 6.3 Ejecución de Comandos de Escritura
```bash
# Cambiar VID a 0x2001 (D-Link)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x88 value 0x01
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x89 value 0x20

# Cambiar PID a 0x3C05 (DUB-E100 Rev B1)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x8A value 0x05
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x8B value 0x3C
```

#### 6.4 Verificación y Re-enumeración
1. **Desconectar físicamente** el adaptador USB
2. Esperar unos segundos
3. **Volver a conectar** el adaptador
4. Verificar con `lsusb` → Debe mostrar "ID 2001:3c05 D-Link Corp. DUB-E100"

### 7. Resolución de Problemas y Limitaciones

#### 7.1 El Bloqueo por eFuse
- **AX88772C** usa eFuse (One-Time Programmable) en lugar de EEPROM
- Los eFuses se "queman" una sola vez durante fabricación
- El chip **IGNORARÁ** cualquier dato en EEPROM externa si tiene eFuse programado
- ethtool puede reportar escritura exitosa, pero al reiniciar vuelve al VID/PID original
- **Solución**: Usar adaptadores con chips AX88772A o AX88772B (más antiguos)

#### 7.2 Checksum (Suma de Verificación)
- La EEPROM de ASIX incluye checksum en los últimos 2 bytes
- AX88772B es permisivo y recalcula automáticamente
- Si el dispositivo queda "brickeado" (no reconocido por USB):
  - Abrir el adaptador físicamente
  - Cortocircuitar pines SDA/SCL de la EEPROM durante encendido
  - Esto fuerza al chip a ignorar EEPROM corrupta

#### 7.3 Alternativa: asix_eepromtool
Si ethtool falla con "Operation not supported":
```bash
sudo apt install libusb-1.0-0-dev gcc
wget https://github.com/karosium/asix_eepromtool/raw/master/asix_eepromtool.c
gcc asix_eepromtool.c -o asix_eepromtool -lusb-1.0
sudo ./asix_eepromtool
```
- Usa libusb directamente (vendor-specific USB control commands)
- Funciona incluso cuando ethtool no puede

### 8. Implicaciones de Seguridad
- El MIB2 depende de verificación VID/PID simple (sin handshake criptográfico)
- Esto es un remanente de herramientas de desarrollo no securizadas
- El D-Link DUB-E100 original (Rev B1) está descatalogado
- El spoofing es una técnica de preservación digital

### 9. Conclusión del PDF
La reprogramación de EEPROM para emitir VID 0x2001 y PID 0x3C05 es un procedimiento técnico validado que permite sortear las restricciones de hardware en unidades VAG MIB2.

---

## Comparación con la Implementación de la App

### Lo que la app DEBE implementar para Android:

1. **Acceso USB Host API** - ✅ Implementado via USB Host API de Android
2. **Detección de chipset ASIX** - Verificar si detecta correctamente AX88772A/B/C
3. **Lectura de EEPROM** - Debe enviar USB Control Transfer con comandos ASIX
4. **Escritura de EEPROM** - Debe usar los offsets correctos (0x88-0x8B)
5. **Magic value 0xDEADBEEF** - CRÍTICO para autorizar escritura
6. **Backup completo** - Guardar EEPROM completa antes de modificar
7. **Verificación post-escritura** - Leer después de escribir para confirmar
8. **Advertencia de eFuse** - Detectar AX88772C y advertir que puede no funcionar

### Archivos a revisar en el código:
- `lib/usb/AsixUsbManager.ts` o similar
- `lib/usb/EepromManager.ts` o similar
- Constantes de offsets y magic value


## 10. Apéndice: Checklist Oficial del PDF (15 pasos)

1. [ ] **Preparar Medio**: Crear USB booteable con Ubuntu 22.04 LTS usando Rufus
2. [ ] **Arrancar Linux**: Iniciar el PC desde USB en modo "Try Ubuntu"
3. [ ] **Conexión a Internet**: Conectar PC a internet (Wi-Fi/Ethernet)
4. [ ] **Instalar Software**: `sudo apt update && sudo apt install ethtool`
5. [ ] **Conectar Hardware**: Insertar adaptador USB ASIX
6. [ ] **Identificar Interfaz**: `ip link` o `ifconfig`. Anotar nombre (ej. enx...)
7. [ ] **Verificar Chip**: `lsusb`. Confirmar ID 0b95:7720
8. [ ] **Verificar Soporte EEPROM**: `sudo ethtool -i [interfaz]`. Confirmar supports-eeprom-access: yes
9. [ ] **Volcar Memoria**: `sudo ethtool -e [interfaz]`. Localizar secuencia 95 0b 20 77
10. [ ] **Escribir VID (Byte 1)**: `sudo ethtool -E [interfaz] magic 0xdeadbeef offset 0x88 value 0x01`
11. [ ] **Escribir VID (Byte 2)**: `sudo ethtool -E [interfaz] magic 0xdeadbeef offset 0x89 value 0x20`
12. [ ] **Escribir PID (Byte 1)**: `sudo ethtool -E [interfaz] magic 0xdeadbeef offset 0x8A value 0x05`
13. [ ] **Escribir PID (Byte 2)**: `sudo ethtool -E [interfaz] magic 0xdeadbeef offset 0x8B value 0x3C`
14. [ ] **Reiniciar Dispositivo**: Desconectar y reconectar
15. [ ] **Validación Final**: `lsusb`. Confirmar ID 2001:3c05

## Fuentes Citadas en el PDF
1. Convert ASIX AX88772 to D-Link DUB-E100 for MIB2 hacking - YouTube
2. X520-DA2 EEPROM Dump - Reddit r/HomeNetworking
3. karosium/asix_eepromtool - GitHub
4. AX88772C USB 2.0 to Fast Ethernet - ASIX Official
5. AX88772C Schematic PDF
6. MIB2 Toolbox Issues #82 - GitHub
7. STD2 Toolbox installation on Technisat/Preh - YouTube
8. olli991/mib-std2-pq-zr-toolbox - GitHub
9. MAC Address Changing Revisited - StarkeBlog
10. D-Link DUB-E100 on Mac Mojave/Catalina
11. ethtool(8) man page
12. Netlink interface for ethtool - Linux Kernel Archives

---

## RESUMEN: Verificación Técnica Necesaria

Ahora debo revisar el código de la app para verificar:

1. **¿Usa los offsets correctos?** → 0x88, 0x89, 0x8A, 0x8B
2. **¿Usa el magic value correcto?** → 0xDEADBEEF
3. **¿Implementa comandos USB Control Transfer correctos para ASIX?**
4. **¿Hace backup de EEPROM antes de escribir?**
5. **¿Verifica después de escribir?**
6. **¿Advierte sobre limitaciones de eFuse (AX88772C)?**
7. **¿Maneja correctamente little-endian?**


---

## VERIFICACIÓN TÉCNICA COMPLETADA ✅

### Fecha: 22 de Enero de 2026

### Archivos Revisados:
1. `lib/usb-service.ts` - Servicio USB principal
2. `modules/usb-native/index.ts` - Interfaz TypeScript del módulo nativo
3. `modules/usb-native/android/src/main/java/expo/modules/usbnative/UsbNativeModule.kt` - Implementación nativa Kotlin
4. `app/(tabs)/auto-spoof.tsx` - Pantalla de Auto-Spoof
5. `__tests__/chipset-compatibility.test.ts` - Tests de compatibilidad

### Resultados de la Verificación:

#### ✅ 1. Offsets Correctos
- **VID Offset**: 0x88 ✅ (correcto según PDF)
- **PID Offset**: 0x8A ✅ (correcto según PDF)
- Implementado en `UsbNativeModule.kt` líneas 45-46

#### ✅ 2. Magic Value Correcto
- **MAGIC_VALUE**: 0xDEADBEEF ✅ (correcto según PDF)
- Implementado en `UsbNativeModule.kt` línea 50
- Implementado en `usb-service.ts` línea 13

#### ✅ 3. Comandos USB Control Transfer Correctos
- **ASIX_CMD_READ_EEPROM**: 0x0b ✅
- **ASIX_CMD_WRITE_EEPROM**: 0x0c ✅
- **ASIX_CMD_WRITE_EEPROM_EN**: 0x0d ✅ (habilitar modo escritura)
- **ASIX_CMD_WRITE_EEPROM_DIS**: 0x0e ✅ (deshabilitar modo escritura)
- Implementado en `UsbNativeModule.kt` líneas 38-42

#### ✅ 4. Secuencia de Escritura Correcta
La secuencia implementada sigue exactamente el procedimiento del PDF:
1. Habilitar modo escritura (comando 0x0d) ✅
2. Esperar 1000ms ✅
3. Escribir words de 16 bits ✅
4. Esperar 50ms entre escrituras ✅
5. Deshabilitar modo escritura (comando 0x0e) ✅
6. Esperar 500ms para estabilización ✅

#### ✅ 5. Backup Antes de Escribir
- `backupService.createBackup(device)` se ejecuta ANTES de cualquier escritura
- Implementado en `auto-spoof.tsx` línea 193

#### ✅ 6. Verificación Post-Escritura
- Lectura de VID/PID después de escribir para confirmar ✅
- Rollback automático si la verificación falla ✅
- Implementado en `auto-spoof.tsx` líneas 234-282

#### ✅ 7. Detección de eFuse
- Función `detectEEPROMType()` realiza prueba REAL de escritura ✅
- Bloquea spoofing si se detecta eFuse ✅
- Restaura valor original después de prueba ✅
- Implementado en `UsbNativeModule.kt` líneas 458-664

#### ✅ 8. Manejo de Little-Endian
- VID 0x2001 → bytes 0x01, 0x20 ✅
- PID 0x3C05 → bytes 0x05, 0x3C ✅
- Implementado correctamente en `auto-spoof.tsx` líneas 201-223

#### ✅ 9. Tests Pasando
```
 ✓ __tests__/chipset-compatibility.test.ts (20 tests)
 ✓ __tests__/spoof-reducer.test.ts (13 tests)
 ✓ __tests__/encryption-service.test.ts (1 test)
 Test Files  3 passed
      Tests  34 passed
```

### Valores Objetivo Verificados:
| Parámetro | Valor | Estado |
|-----------|-------|--------|
| Target VID | 0x2001 (D-Link) | ✅ |
| Target PID | 0x3C05 (DUB-E100) | ✅ |
| VID Offset | 0x88 | ✅ |
| PID Offset | 0x8A | ✅ |
| Magic Value | 0xDEADBEEF | ✅ |

### Conclusión:
**La app implementa CORRECTAMENTE el procedimiento técnico descrito en el PDF.**

La implementación:
- Usa los comandos USB correctos para ASIX
- Sigue la secuencia de habilitación/escritura/deshabilitación
- Maneja correctamente los offsets y el formato little-endian
- Incluye detección real de eFuse vs EEPROM externa
- Crea backups automáticos antes de modificar
- Verifica después de escribir y hace rollback si falla
- Tiene tests automatizados que pasan

### Advertencias Conocidas:
1. **AX88772C con eFuse**: La app detecta y bloquea correctamente estos dispositivos
2. **Adaptadores sin EEPROM externa**: La app detecta y advierte al usuario
3. **Verificación opcional**: El usuario puede omitir verificación (modo forzado) bajo su responsabilidad
