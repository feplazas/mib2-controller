# Análisis del Documento: Guía de Spoofing ASIX AX88772

## Resumen Ejecutivo

El documento describe el procedimiento técnico para **reprogramar la memoria EEPROM** de adaptadores USB-Ethernet basados en el chipset ASIX AX88772 para modificar los identificadores de hardware (Vendor ID y Product ID). Esta técnica, conocida como "spoofing", permite emular el comportamiento de un adaptador D-Link DUB-E100 (VID: 0x2001, PID: 0x3c05) que está en la lista blanca de las unidades MIB2.

## Objetivo del Spoofing

**Problema**: Las unidades MIB2 implementan una lista blanca de dispositivos USB permitidos. Solo los adaptadores con VID/PID específicos son reconocidos por el sistema QNX.

**Solución**: Modificar la EEPROM de un adaptador genérico ASIX (VID: 0x0B95, PID: 0x7720) para que se identifique como D-Link DUB-E100 (VID: 0x2001, PID: 0x3C05).

## Procedimiento Técnico Detallado

### 1. Identificación del Dispositivo
```bash
# Listar dispositivos USB
lsusb
# Salida esperada: ID 0b95:7720 ASIX Electronics Corp. AX88772B

# Identificar interfaz de red
ip link show
# o
ifconfig -a
# Buscar interfaz eth1 (típica para adaptador USB)

# Verificar soporte EEPROM
sudo ethtool -i eth1
# Debe mostrar: supports-eeprom-access: yes
```

### 2. Lectura y Análisis del Mapa de Memoria
```bash
# Volcar contenido de EEPROM en formato hexadecimal
sudo ethtool -e eth1
```

**Mapa de memoria objetivo (típico para AX88772B/C)**:
- **Offset 0x88**: Byte bajo del VID (95 para 0x0B95)
- **Offset 0x89**: Byte alto del VID (0B para 0x0B95)
- **Offset 0x8A**: Byte bajo del PID (20 para 0x7720)
- **Offset 0x8B**: Byte alto del PID (77 para 0x7720)

**Datos almacenados en Little Endian** (byte menos significativo primero).

### 3. Ejecución de Comandos de Escritura

**Magic Value**: `0xdeadbeef` (3735928559 decimal) - Valor de seguridad requerido por el kernel de Linux para autorizar escrituras en EEPROM.

**Secuencia de comandos**:

```bash
# 1. Cambiar Byte Bajo del VID (offset 0x88 a 0x01)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x88 value 0x01

# 2. Cambiar Byte Alto del VID (offset 0x89 a 0x20)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x89 value 0x20

# 3. Cambiar Byte Bajo del PID (offset 0x8A a 0x05)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x8A value 0x05

# 4. Cambiar Byte Alto del PID (offset 0x8B a 0x3C)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x8B value 0x3C
```

**Resultado esperado**:
- VID: 0x2001 (D-Link)
- PID: 0x3C05 (DUB-E100 Rev B1)

### 4. Verificación y Re-enumeración

```bash
# 1. Desconectar físicamente el adaptador USB
# 2. Esperar unos segundos
# 3. Volver a conectar el adaptador

# Verificar cambio exitoso
lsusb
# Salida esperada: ID 2001:3c05 D-Link Corp. DUB-E100 Fast Ethernet Adapter
```

## Entorno Operativo Recomendado

### Opción 1: Live USB Linux (RECOMENDADA)
- **Distribución**: Ubuntu 22.04 LTS o Linux Mint
- **Herramienta de creación**: Rufus o BalenaEtcher
- **Ventajas**:
  - Acceso directo al hardware ("bare metal")
  - Sin conflictos con controladores de Windows
  - No requiere instalación permanente

### Opción 2: WSL2 (Windows Subsystem for Linux 2)
- **Limitación**: No tiene acceso directo a USB por defecto
- **Solución**: Usar `usbipd-win` para "adjuntar" dispositivos USB
- **Inconveniente**: Requiere kernel con soporte CONFIG_USB_NET_AX8817X

### Opción 3: Máquina Virtual (VirtualBox/VMware)
- **Requisito crítico**: Instalar Extension Pack o VMware Tools
- **Riesgo**: Latencia en emulación del bus USB puede corromper datos

## Herramienta Ethtool

**Ethtool** es la utilidad estándar en Linux para configurar interfaces de red cableadas.

### Instalación en Live USB
```bash
sudo apt-get update
sudo apt-get install ethtool
```

### Comunicación Kernel-Espacio de Usuario
```
Usuario ejecuta: ethtool -E eth1 magic 0xdeadbeef offset 0x88 value 0x01
         ↓
ethtool analiza argumentos
         ↓
Abre socket de red para obtener descriptor de archivo
         ↓
Invoca ioctl() con estructura ethtool_eeprom
         ↓
Kernel recibe solicitud y la pasa al controlador asix
         ↓
Controlador asix verifica permisos y magic value
         ↓
Si correcto, traduce solicitud en transacciones USB (USB Control Messages)
         ↓
Chip AX88772 lee/escribe en memoria física EEPROM
```

## Problemas Avanzados y Limitaciones

### 1. Bloqueo por eFuse (AX88772C)
- **Problema**: Las versiones modernas del chipset (AX88772C) usan eFuses (fusibles electrónicos) que se queman una sola vez durante fabricación
- **Síntoma**: ethtool reporta escritura exitosa, pero al reiniciar el chip sigue reportando VID/PID original (0b95:7720)
- **Causa**: La lógica interna prioriza el eFuse sobre la EEPROM externa
- **Solución**: No existe solución de software. Requiere chip diferente (AX88772A o B)

### 2. Checksum (Suma de Verificación)
- **Problema**: La EEPROM incluye un checksum en los últimos 2 bytes para validar integridad
- **Comportamiento**:
  - **AX88772B**: Controlador es permisivo y recalcula o ignora checksum
  - **Chips modernos**: Si el checksum es inválido, el chip se niega a iniciar ("bricked")
- **Recuperación**: Abrir adaptador y cortocircuitar pines de datos de EEPROM (SDA/SCL) durante encendido para forzar al chip a ignorar EEPROM corrupta y arrancar con descriptores internos

### 3. Herramienta Alternativa: asix_eepromtool
- **Uso**: Cuando ethtool falla persistentemente
- **Ventaja**: Envía comandos "vendor-specific" directamente al dispositivo USB usando libusb
- **Instalación**:
```bash
sudo apt install libusb-1.0-0-dev gcc
wget https://github.com/karosium/asix_eepromtool/raw/master/asix_eepromtool.c
gcc asix_eepromtool.c -o asix_eepromtool -lusb-1.0
sudo ./asix_eepromtool
```
- **Riesgo**: Mayor riesgo de uso, puede leer y escribir incluso cuando ethtool no puede

## Implicaciones de Seguridad

### 1. Seguridad por Oscuridad en Automoción
- **Problema**: El MIB2 depende de una simple verificación de VID/PID para otorgar acceso privilegiado (root/telnet)
- **Implicación**: No hay autenticación criptográfica del adaptador ("handshake" seguro)
- **Conclusión**: Arquitectura de seguridad perimetral débil

### 2. Derecho a Reparar y Obsolescencia
- **Contexto**: El adaptador D-Link DUB-E100 original (Rev B1) está descatalogado
- **Beneficio del spoofing**: Permite usar hardware moderno y genérico para mantener capacidad de diagnóstico de vehículos que estarán en circulación durante décadas
- **Consideración ética**: Preservación digital vs. políticas de control de hardware

### 3. Riesgos de la Cadena de Suministro
- **Problema**: Un atacante podría usar un dispositivo con IDs falsificados para eludir políticas de control de dispositivos (DLP)
- **Mitigación**: Los administradores de sistemas no pueden confiar únicamente en VID/PID reportado por USB

## Compatibilidad con MIB2

### Hardware Compatible
| Fabricante | Modelo | VID (Hex) | PID (Hex) | Estado en MIB2 |
|------------|--------|-----------|-----------|----------------|
| ASIX Electronics | AX88772 (Genérico) | 0x0B95 | 0x7720 | No Soportado / Bloqueado |
| D-Link | DUB-E100 (Rev B1) | 0x2001 | 0x3C05 | **Soportado / Whitelisted** |
| D-Link | DUB-E100 (Rev C1) | 0x2001 | 0x1A02 | Soportado (Firmware reciente) |
| SMSC | LAN9500 | 0x0424 | 0x9500 | Soportado (Ciertos modelos) |

### Versiones de Firmware MIB2
- **T480**: Compatible con DUB-E100 Rev B1 (0x2001:0x3C05)
- **T490/T500**: Compatible con ambas revisiones (B1 y C1)

## Conclusión

La reprogramación de la EEPROM de un adaptador ASIX AX88772 para emitir VID 0x2001 y PID 0x3C05 es un procedimiento técnico validado que permite sortear las restricciones de hardware en las unidades VAG MIB2. Utilizando un entorno Linux temporal en un PC con Windows 11, la herramienta ethtool, y comprendiendo la estructura de memoria EEPROM, el proceso es relativamente directo.

**Advertencias**:
- Requiere comprensión profunda de endianness y offsets de memoria
- Riesgo de "brickear" el dispositivo si se escriben valores incorrectos
- Dependencia de la revisión específica del hardware (eFuse vs EEPROM externa)
- Solo funciona en chips AX88772A/B (93C56 o 93C66 EEPROM externa)

## Aplicación en MIB2 Controller

La app debe automatizar este procedimiento complejo mediante:
1. **Detección automática** del adaptador ASIX conectado
2. **Lectura y análisis** del mapa de memoria EEPROM
3. **Generación de comandos** ethtool personalizados según offsets detectados
4. **Ejecución secuencial** de comandos de escritura con validación
5. **Verificación post-spoofing** con re-enumeración USB
6. **Advertencias de seguridad** sobre riesgos de eFuse y checksum
7. **Soporte para asix_eepromtool** como método alternativo
