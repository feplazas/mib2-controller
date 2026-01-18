# Requisitos Técnicos de Spoofing USB - Extraídos de Guíaspoofing.pdf

## Datos Críticos de la Guía Oficial

### 1. Identificadores Objetivo
| Parámetro | Valor Original (ASIX) | Valor Objetivo (D-Link) |
|-----------|----------------------|------------------------|
| VID | 0x0B95 | 0x2001 |
| PID | 0x7720 | 0x3C05 (Rev B1) o 0x1A02 (Rev C1) |

### 2. Formato de Almacenamiento
- **Endianness**: Little Endian (byte menos significativo primero)
- **VID 0x2001** → almacenado como: `01 20`
- **PID 0x3C05** → almacenado como: `05 3C`

### 3. Offsets de Memoria (Típicos para AX88772B/C)
| Offset | Contenido |
|--------|-----------|
| 0x88 | Byte bajo del VID |
| 0x89 | Byte alto del VID |
| 0x8A | Byte bajo del PID |
| 0x8B | Byte alto del PID |

**NOTA CRÍTICA**: Los offsets pueden variar según el fabricante del PCB. Se debe verificar con `ethtool -e` antes de escribir.

### 4. Magic Value para Escritura
- **Valor**: `0xdeadbeef` (3735928559 decimal)
- **Propósito**: Autorización de escritura en EEPROM
- **Definido en**: `drivers/net/usb/asix.c` del kernel Linux

### 5. Comandos de Escritura (ethtool)
```bash
# VID byte bajo (0x88 → 0x01)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x88 value 0x01

# VID byte alto (0x89 → 0x20)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x89 value 0x20

# PID byte bajo (0x8A → 0x05)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x8A value 0x05

# PID byte alto (0x8B → 0x3C)
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x8B value 0x3C
```

### 6. Riesgos Identificados

#### 6.1 Bloqueo por eFuse (AX88772C)
- Los eFuses son fusibles electrónicos de un solo uso
- Si el fabricante programó eFuses con VID/PID, el chip IGNORA la EEPROM externa
- `ethtool` reportará escritura exitosa, pero el chip seguirá reportando 0b95:7720
- **NO HAY SOLUCIÓN DE SOFTWARE** - se requiere chip diferente (AX88772A o B)

#### 6.2 Checksum
- La EEPROM incluye checksum para validar integridad
- Modificar VID/PID altera el checksum
- En AX88772B, el controlador suele ser permisivo y recalcula/ignora el checksum
- Si el dispositivo queda "brickeado", significa checksum inválido
- **Recuperación**: Cortocircuitar pines SDA/SCL de EEPROM durante encendido

#### 6.3 Offsets Incorrectos
- Escribir en offsets incorrectos puede corromper:
  - Dirección MAC
  - Configuración de energía
  - Descriptores USB
- **RESULTADO**: Dispositivo inutilizado (bricking)

### 7. Verificación Post-Escritura
1. Desconectar físicamente el adaptador
2. Esperar unos segundos
3. Reconectar el adaptador
4. Ejecutar `lsusb`
5. **Éxito**: `ID 2001:3c05 D-Link Corp. DUB-E100 Fast Ethernet Adapter`

### 8. Herramienta Alternativa: asix_eepromtool
- Usa libusb directamente (no pasa por el controlador de red)
- Puede funcionar cuando ethtool falla
- **Mayor riesgo de uso**
- Repositorio: https://github.com/karosium/asix_eepromtool

---

## Implicaciones para la Aplicación Android

### Requisitos de Implementación
1. **Detección de eFuse**: OBLIGATORIO antes de permitir spoofing
2. **Verificación de offsets**: Leer EEPROM y buscar secuencia `95 0B 20 77`
3. **Backup completo**: Antes de cualquier escritura
4. **Escritura byte a byte**: Máxima precisión y control
5. **Verificación post-escritura**: Confirmar cambios
6. **Re-enumeración**: Desconectar/reconectar para aplicar cambios

### Valores a Escribir (Android via USB Control Transfers)
| Offset | Valor Hex | Descripción |
|--------|-----------|-------------|
| 0x88 | 0x01 | VID byte bajo |
| 0x89 | 0x20 | VID byte alto |
| 0x8A | 0x05 | PID byte bajo |
| 0x8B | 0x3C | PID byte alto |

### Comandos USB ASIX (de asix_eepromtool)
- **READ_EEPROM**: `0x0B` (request type: vendor, device-to-host)
- **WRITE_EEPROM**: `0x0C` (request type: vendor, host-to-device)
- **WRITE_ENABLE**: `0x0D` (habilitar modo escritura)
- **WRITE_DISABLE**: `0x0E` (deshabilitar modo escritura)

**IMPORTANTE**: La escritura en EEPROM ASIX opera en WORDS (16 bits), no bytes individuales.


---

# Requisitos Técnicos de Acceso MIB2 - Extraídos de MIB2Acceso.pdf

## Datos Críticos de la Guía Oficial

### 1. Arquitectura MIB2 Technisat
- **Sistema Operativo**: QNX Neutrino (Unix-like, tiempo real)
- **Unidad de Control**: 5QA 035 842 (MIB2 Standard)
- **Fabricante**: Technisat / Preh

### 2. Vector de Ataque Ethernet (D-Link)
- El MIB2 incluye controladores precompilados para chipset ASIX AX88772
- Adaptador específico: **D-Link DUB-E100**
- Al conectar, el sistema monta la interfaz de red `en0`

### 3. Configuración de Red MIB2
| Parámetro | Valor |
|-----------|-------|
| IP del MIB2 | 192.168.1.4 (típico) |
| IP del PC/Android | 192.168.1.10 (configurar manualmente) |
| Puerto Telnet | 23 |
| Puerto FTP | 21 |

### 4. Proceso de Instalación del Toolbox
1. Conectar adaptador D-Link (spoofeado) al puerto USB del vehículo
2. Configurar IP estática en el dispositivo (192.168.1.10)
3. Conectar via Telnet al MIB2 (192.168.1.4:23)
4. Obtener acceso shell (ksh) con privilegios root
5. Montar tarjeta SD (/media/mp000)
6. Ejecutar script de instalación manualmente

### 5. Comandos Críticos en MIB2

#### Backup de Particiones (OBLIGATORIO antes de modificar)
```bash
# Backup de partición IFS-root
dd if=/dev/disk/mlc_nand0t178.2 of=/media/mp000/ifs-root-backup.bin bs=1M

# Backup de partición persist
dd if=/dev/disk/mlc_nand0t178.3 of=/media/mp000/persist-backup.bin bs=1M
```

#### Restauración (EN CASO DE EMERGENCIA)
```bash
# Restaurar partición IFS-root
dd if=/media/mp000/ifs-root-backup.bin of=/dev/disk/mlc_nand0t178.2 bs=1M

# Restaurar partición persist
dd if=/media/mp000/persist-backup.bin of=/dev/disk/mlc_nand0t178.3 bs=1M
```

### 6. Riesgos Identificados para MIB2

#### 6.1 Bricking por Comandos dd Incorrectos
- **CRÍTICO**: Escribir en la partición incorrecta puede destruir el sistema
- Los nombres de dispositivo (`mlc_nand0t178.X`) varían según firmware
- **SIEMPRE** verificar con `ls /dev/disk/` antes de ejecutar dd

#### 6.2 Corrupción de Backup
- Verificar integridad del backup ANTES de restaurar
- Usar checksums (MD5/SHA256) para validar archivos
- Un backup corrupto restaurado = MIB2 brickeado

#### 6.3 Interrupción de Escritura
- **NUNCA** desconectar durante operación dd
- Asegurar que el vehículo no entre en modo sleep
- Mantener motor encendido o batería cargada

---

## Implicaciones para la Aplicación Android

### Scripts Telnet - Requisitos de Seguridad
1. **NO ejecutar comandos dd automáticamente**
2. **Mostrar comandos al usuario** para que los copie y ejecute manualmente
3. **Verificar checksums** antes de mostrar comandos de restauración
4. **Advertir sobre riesgos** de forma clara y prominente

### Flujo Seguro de Restauración
1. Usuario selecciona archivo de backup
2. App verifica integridad (MD5 + SHA256)
3. App muestra comando dd con parámetros correctos
4. Usuario copia comando y lo ejecuta en terminal Telnet
5. App NO tiene acceso directo al MIB2 - solo genera instrucciones
