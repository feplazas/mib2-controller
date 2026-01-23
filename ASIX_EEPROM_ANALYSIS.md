# Análisis Definitivo del Formato ASIX EEPROM

## Código de Referencia Funcional (asix_eepromtool)

Este código es una herramienta probada que funciona correctamente con chips ASIX AX88772.

## Funciones Clave

### READ EEPROM (líneas 213-229)
```c
int read_eeprom(int rsize, uint16_t* buf)
{
    for (i = 0; i < rsize/2; i++) {
        retval = asix_read(ASIX_CMD_READ_EEPROM, i, 0, 2, &tmp16);
        *(buf + i) = be16toh(tmp16);  // ← CONVIERTE DE BIG-ENDIAN A HOST
    }
}
```

### WRITE EEPROM (líneas 231-257)
```c
int write_eeprom(int wsize, uint16_t* buf)
{
    asix_write(ASIX_CMD_WRITE_EEPROM_EN, 0, 0, 0, NULL);  // Habilitar escritura
    sleep(1);
    
    for (i = 0; i < wsize/2; i++) {
        retval = asix_write(ASIX_CMD_WRITE_EEPROM, i, htobe16(*(buf + i)), 0, NULL);
        //                                         ^      ^
        //                                     wValue   wIndex (dato en BIG-ENDIAN)
        usleep(50000);  // ← ESPERA 50ms ENTRE ESCRITURAS
    }
    
    asix_write(ASIX_CMD_WRITE_EEPROM_DIS, 0, 0, 0, NULL);  // Deshabilitar escritura
}
```

## Formato de Control Transfer

### Para LECTURA:
- cmd = 0x0b (ASIX_CMD_READ_EEPROM)
- wValue = word address (0, 1, 2, ... no byte address)
- wIndex = 0
- wLength = 2
- El dato devuelto está en **BIG-ENDIAN** → usar be16toh() para convertir

### Para ESCRITURA:
- cmd = 0x0c (ASIX_CMD_WRITE_EEPROM)
- wValue = word address (0, 1, 2, ... no byte address)
- wIndex = dato de 16 bits en **BIG-ENDIAN** → usar htobe16()
- wLength = 0

## HALLAZGOS CRÍTICOS

1. **El dato se pasa en wIndex, NO en wValue** para escritura
2. **El dato debe estar en BIG-ENDIAN** (htobe16)
3. **Hay que esperar 50ms entre cada escritura de palabra**
4. **Hay que habilitar escritura (0x0d) antes y deshabilitar (0x0e) después**
5. **Hay que esperar 1 segundo después de habilitar escritura**

## Comparación con Nuestro Código

Nuestro código actual en UsbNativeModule.kt:
- Usa wValue para el dato (INCORRECTO - debería ser wIndex)
- No espera 50ms entre escrituras
- No espera 1 segundo después de habilitar escritura

## CORRECCIÓN NECESARIA

Cambiar el control transfer de escritura de:
```kotlin
controlTransfer(USB_DIR_OUT, WRITE_EEPROM, wordOffset, dataWord, ...)
```

A:
```kotlin
controlTransfer(USB_DIR_OUT, WRITE_EEPROM, wordOffset, dataWord, ...)
// Donde dataWord va en wIndex (tercer parámetro), no wValue
```

Y agregar delays apropiados.
