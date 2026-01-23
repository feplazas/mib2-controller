# Análisis del Driver Linux ASIX - Escritura EEPROM

## Código clave encontrado (asix_common.c líneas 659-738)

```c
int asix_set_eeprom(struct net_device *net, struct ethtool_eeprom *eeprom, u8 *data)
{
    // ...
    
    /* write data to EEPROM */
    ret = asix_write_cmd(dev, AX_CMD_WRITE_ENABLE, 0x0000, 0, 0, NULL, 0);
    if (ret < 0) {
        netdev_err(net, "Failed to enable EEPROM write\n");
        goto free;
    }
    msleep(20);  // <-- IMPORTANTE: 20ms después de WRITE_ENABLE

    for (i = first_word; i <= last_word; i++) {
        netdev_dbg(net, "write to EEPROM at offset 0x%02x, data 0x%04x\n",
               i, eeprom_buff[i - first_word]);
        ret = asix_write_cmd(dev, AX_CMD_WRITE_EEPROM, i,
                     eeprom_buff[i - first_word], 0, NULL, 0);
        if (ret < 0) {
            netdev_err(net, "Failed to write EEPROM at offset 0x%02x.\n", i);
            goto free;
        }
        msleep(20);  // <-- IMPORTANTE: 20ms entre cada escritura
    }

    ret = asix_write_cmd(dev, AX_CMD_WRITE_DISABLE, 0x0000, 0, 0, NULL, 0);
    // ...
}
```

## Hallazgos CRÍTICOS

### 1. Formato del comando WRITE_EEPROM
```c
asix_write_cmd(dev, AX_CMD_WRITE_EEPROM, i, eeprom_buff[i - first_word], 0, NULL, 0);
```

Los parámetros son:
- `cmd`: AX_CMD_WRITE_EEPROM
- `value`: `i` (word index, NO byte offset)
- `index`: `eeprom_buff[i - first_word]` (el dato de 16 bits)
- `size`: 0
- `data`: NULL

**IMPORTANTE:** El driver Linux pasa el DATO en el parámetro `index` del control transfer, NO en `value`.

### 2. Tiempos de espera
- 20ms después de WRITE_ENABLE
- 20ms después de CADA escritura de word

### 3. NO hay verificación post-escritura
El driver Linux **NO verifica** que los datos se escribieron correctamente. Simplemente escribe y confía en que funcionó.

## Comparación con nuestra implementación

### Nuestra implementación actual:
```kotlin
connection.controlTransfer(
    USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
    ASIX_CMD_WRITE_EEPROM,
    wordOffset,  // wValue = word index
    word,        // wIndex = data word
    null,
    0,
    5000
)
```

Esto parece correcto según el driver Linux.

### Problema potencial: La verificación

Nuestra app hace verificación post-escritura que el driver Linux NO hace. El problema podría estar en:
1. La verificación se hace demasiado rápido (antes de que la EEPROM termine de escribir)
2. La lectura devuelve datos cached en lugar de los datos reales de la EEPROM

## Solución propuesta

1. **Aumentar el delay después de escribir** de 50ms a 100ms o más
2. **Desactivar la verificación automática** o hacerla opcional
3. **Hacer un "reload" de la EEPROM** antes de verificar (si existe tal comando)
