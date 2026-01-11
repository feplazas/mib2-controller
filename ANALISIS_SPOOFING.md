# Análisis de Requisitos - Spoofing USB para MIB2

## Objetivo Principal
Reprogramar la EEPROM de adaptadores USB-Ethernet genéricos para cambiar su VID/PID y hacerlos aparecer como adaptadores D-Link DUB-E100 (VID 0x2001, PID 0x3c05) compatibles con el MIB2.

## Procedimiento Técnico (según Guía de Spoofing)

### 1. Identificación y Mapeo del Dispositivo
- ✅ **Listar dispositivos USB** (`lsusb`) - IMPLEMENTADO
- ✅ **Identificar interfaz de red** (`ip link show` / `ifconfig -a`) - NO IMPLEMENTADO
- ❌ **Verificar capacidad de acceso a EEPROM** (`sudo ethtool -i eth1`) - NO IMPLEMENTADO

### 2. Lectura y Análisis del Mapa de Memoria
- ❌ **Volcar EEPROM** (`sudo ethtool -e eth1`) - NO IMPLEMENTADO
- ❌ **Localizar offsets de VID/PID** - NO IMPLEMENTADO
  - Offset 0x88: Byte bajo del VID (95 0B para ASIX)
  - Offset 0x89: Byte alto del VID (0B para ASIX)
  - Offset 0x8A: Byte bajo del PID (20 77 para AX88772B)
  - Offset 0x8B: Byte alto del PID (77 para AX88772B)

### 3. Ejecución de Comandos de Escritura
- ❌ **Cambiar VID a 0x2001** (D-Link) - NO IMPLEMENTADO
  ```
  sudo ethtool -E eth1 magic 0xdeadbeef offset 0x88 value 0x01
  sudo ethtool -E eth1 magic 0xdeadbeef offset 0x89 value 0x20
  ```
- ❌ **Cambiar PID a 0x3C05** (DUB-E100) - NO IMPLEMENTADO
  ```
  sudo ethtool -E eth1 magic 0xdeadbeef offset 0x8A value 0x05
  sudo ethtool -E eth1 magic 0x8B value 0x3C
  ```

### 4. Verificación y Re-enumeración
- ❌ **Desconectar físicamente el adaptador** - NO IMPLEMENTADO
- ❌ **Reconectar y verificar con lsusb** - NO IMPLEMENTADO
- ❌ **Confirmar nuevo ID 2001:3c05** - NO IMPLEMENTADO

## Valor Mágico (Magic Value)
**0xdeadbeef** (3735928559 decimal) - Requerido por el controlador ASIX para autorizar escritura en EEPROM.

## Limitaciones de Hardware

### 7.1 Bloqueo por eFuse (AX88772C)
- Los chips AX88772C modernos tienen eFuses que bloquean la EEPROM
- **Solución**: Usar chips más antiguos (AX88772A/B)

### 7.2 Checksum
- La EEPROM tiene checksum de validación
- Muchos controladores AX88772B recalculan automáticamente
- Si falla, el dispositivo queda "brickeado"

### 7.3 Alternativa: asix_eepromtool
- Herramienta que usa libusb directamente
- Evita restricciones del controlador de red del kernel
- Más riesgoso pero funciona cuando ethtool falla

## Funciones Críticas que DEBEN Implementarse

### PRIORIDAD ALTA (Core Functionality)
1. ❌ **Lectura de EEPROM** - Volcar contenido completo
2. ❌ **Escritura de EEPROM** - Modificar offsets específicos
3. ❌ **Validación de Magic Value** - Verificar 0xdeadbeef
4. ❌ **Re-enumeración USB** - Forzar desconexión/reconexión
5. ❌ **Verificación post-spoofing** - Confirmar nuevo VID/PID

### PRIORIDAD MEDIA (Safety & UX)
6. ❌ **Backup automático de EEPROM** - Antes de modificar
7. ❌ **Cálculo de checksum** - Validar integridad
8. ❌ **Detección de eFuse** - Advertir si el chip está bloqueado
9. ❌ **Restauración de EEPROM** - Desde backup

### PRIORIDAD BAJA (Nice to Have)
10. ✅ **Detección de chipset** - Ya implementado
11. ✅ **Logs de diagnóstico** - Ya implementado
12. ❌ **Interfaz gráfica para offsets** - Visualizar mapa de memoria

## Estado Actual de la App

### ✅ Implementado
- Detección de dispositivos USB
- Lectura de VID/PID
- Identificación de chipsets (ASIX, Realtek, D-Link)
- Logs de diagnóstico
- Indicador visual de estado USB
- Permisos USB

### ❌ NO Implementado (CRÍTICO)
- **Lectura de EEPROM** (ethtool -e)
- **Escritura de EEPROM** (ethtool -E con magic value)
- **Control Transfers USB** para acceso directo
- **Re-enumeración de dispositivo**
- **Verificación de cambios**
- **Backup/Restore de EEPROM**

## Próximos Pasos Críticos

1. **Implementar módulo nativo para ethtool** o **libusb directo**
2. **Agregar funciones de lectura/escritura de EEPROM** en Kotlin
3. **Crear interfaz de usuario para spoofing** con advertencias de seguridad
4. **Implementar backup automático** antes de cualquier modificación
5. **Agregar validación de checksum** post-escritura
