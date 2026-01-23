# ASIX AX88772 EEPROM Notes - Análisis Definitivo

## Comandos ASIX (de asix_eepromtool.c)

Los comandos definidos son:
- ASIX_CMD_READ_EEPROM = 0x0b
- ASIX_CMD_WRITE_EEPROM = 0x0c
- ASIX_CMD_WRITE_EEPROM_EN = 0x0d
- ASIX_CMD_WRITE_EEPROM_DIS = 0x0e

## Formato de Control Transfer

Según la documentación y código de referencia, el formato es:
- bmRequestType: 0xC0 (READ) o 0x40 (WRITE) | USB_TYPE_VENDOR | USB_RECIP_DEVICE
- bRequest: 0x0b (READ) o 0x0c (WRITE)
- wValue: WORD ADDRESS (no byte address) - dirección de palabra de 16 bits
- wIndex: Para WRITE, contiene el dato de 16 bits a escribir
- wLength: 2 bytes para READ

## Problema Identificado

El EEPROM se direcciona por PALABRAS de 16 bits, no por bytes. Cada palabra contiene 2 bytes en formato little-endian:
- Byte en dirección par = LOW byte de la palabra
- Byte en dirección impar = HIGH byte de la palabra

Para escribir en byte offset 0x88 y 0x89:
- Word address = 0x88 / 2 = 0x44
- El dato se envía como: (byte_0x89 << 8) | byte_0x88

Para leer desde byte offset 0x88:
- Word address = 0x44
- El resultado devuelve 2 bytes: buffer[0] = byte_0x88, buffer[1] = byte_0x89
