# Análisis del Video de YouTube - ASIX EEPROM Spoofing

## Video: "Convert ASIX AX88772 to D-Link DUB-E100 for MIB2 hacking"
URL: https://www.youtube.com/watch?v=NGaXMYTP_YA

## Proceso mostrado en el video (usando ethtool en Linux)

1. **Comando de escritura usado:**
   ```bash
   sudo ethtool -E eth1 magic 0xdeadbeef offset [offset] value [valor]
   ```

2. **Puntos clave:**
   - El magic value es `0xdeadbeef`
   - Se escribe **byte por byte** (value es un solo byte)
   - Los offsets son direcciones de byte directas
   - NO hay verificación de checksum mencionada
   - El proceso es simple: escribir los 4 bytes (VID low, VID high, PID low, PID high)

## Diferencia con nuestra implementación

El video usa `ethtool` que escribe **byte por byte** con el comando:
- `ethtool -E eth1 magic 0xdeadbeef offset 0x88 value 0x01` (VID low byte)
- `ethtool -E eth1 magic 0xdeadbeef offset 0x89 value 0x20` (VID high byte)
- `ethtool -E eth1 magic 0xdeadbeef offset 0x8a value 0x05` (PID low byte)
- `ethtool -E eth1 magic 0xdeadbeef offset 0x8b value 0x3c` (PID high byte)

## Conclusión

El problema puede ser que estamos usando el comando ASIX_CMD_WRITE_EEPROM que escribe **words** (2 bytes) en lugar de bytes individuales. El driver de Linux usa un enfoque diferente.

Necesitamos investigar cómo ethtool escribe en la EEPROM - probablemente usa un comando diferente o escribe byte por byte.
