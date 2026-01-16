# Comandos USB Vendor-Specific Reales para Chipsets ASIX

## Fuente
Basado en el código fuente de [asix_eepromtool](https://github.com/karosium/asix_eepromtool) por karosium.

Probado y funcional en:
- AX88772
- AX88772A
- AX88772B
- AX88178
- AX88172
- AX8817X

---

## Comandos USB Control Transfer

### Definiciones de Comandos

```c
#define ASIX_CMD_READ_EEPROM        0x0b
#define ASIX_CMD_WRITE_EEPROM       0x0c
#define ASIX_CMD_WRITE_EEPROM_EN    0x0d
#define ASIX_CMD_WRITE_EEPROM_DIS   0x0e
```

---

## 1. Lectura de EEPROM

### Función Real (C)

```c
int read_eeprom(int rsize, uint16_t* buf)
{
    int i, retval = 0;
    uint16_t tmp16;
    
    for (i = 0; i < rsize/2; i++) {
        retval = asix_read(ASIX_CMD_READ_EEPROM, i, 0, 2, &tmp16);
        if (retval < 0) {
            return retval;
        }
        *(buf + i) = be16toh(tmp16);
    }
    
    return retval;
}
```

### Parámetros de Control Transfer (Lectura)

```c
libusb_control_transfer(
    device,
    LIBUSB_ENDPOINT_IN | LIBUSB_REQUEST_TYPE_VENDOR | LIBUSB_RECIPIENT_DEVICE,
    0x0b,              // bRequest: ASIX_CMD_READ_EEPROM
    offset,            // wValue: offset en words (0, 1, 2, ...)
    0,                 // wIndex: 0
    buffer,            // data: buffer de 2 bytes
    2,                 // wLength: 2 bytes (1 word)
    100                // timeout: 100ms
);
```

### Características
- **Tamaño de lectura:** 2 bytes (1 word) por transfer
- **Offset:** En unidades de words (16 bits), no bytes
- **Endianness:** Big-endian (se debe convertir con `be16toh()`)
- **Timeout:** 100ms por operación

---

## 2. Escritura de EEPROM

### Función Real (C)

```c
int write_eeprom(int wsize, uint16_t* buf)
{
    int i, retval;
    
    // 1. Habilitar escritura
    retval = asix_write(ASIX_CMD_WRITE_EEPROM_EN, 0, 0, 0, NULL);
    if (retval < 0) {
        return retval;
    }
    sleep(1);  // Esperar 1 segundo
    
    // 2. Escribir cada word
    for (i = 0; i < wsize/2; i++) {
        retval = asix_write(ASIX_CMD_WRITE_EEPROM, i, htobe16(*(buf + i)), 0, NULL);
        if (retval < 0) {
            return retval;
        }
        usleep(50000);  // Esperar 50ms entre writes
    }
    
    // 3. Deshabilitar escritura
    retval = asix_write(ASIX_CMD_WRITE_EEPROM_DIS, 0, 0, 0, NULL);
    if (retval < 0) {
        return retval;
    }
    
    return retval;
}
```

### Parámetros de Control Transfer (Escritura)

#### Paso 1: Habilitar Escritura
```c
libusb_control_transfer(
    device,
    LIBUSB_ENDPOINT_OUT | LIBUSB_REQUEST_TYPE_VENDOR | LIBUSB_RECIPIENT_DEVICE,
    0x0d,              // bRequest: ASIX_CMD_WRITE_EEPROM_EN
    0,                 // wValue: 0
    0,                 // wIndex: 0
    NULL,              // data: NULL
    0,                 // wLength: 0
    100                // timeout: 100ms
);
```

#### Paso 2: Escribir Cada Word
```c
libusb_control_transfer(
    device,
    LIBUSB_ENDPOINT_OUT | LIBUSB_REQUEST_TYPE_VENDOR | LIBUSB_RECIPIENT_DEVICE,
    0x0c,              // bRequest: ASIX_CMD_WRITE_EEPROM
    offset,            // wValue: offset en words (0, 1, 2, ...)
    data_word,         // wIndex: valor a escribir (big-endian)
    NULL,              // data: NULL
    0,                 // wLength: 0
    100                // timeout: 100ms
);
```

#### Paso 3: Deshabilitar Escritura
```c
libusb_control_transfer(
    device,
    LIBUSB_ENDPOINT_OUT | LIBUSB_REQUEST_TYPE_VENDOR | LIBUSB_RECIPIENT_DEVICE,
    0x0e,              // bRequest: ASIX_CMD_WRITE_EEPROM_DIS
    0,                 // wValue: 0
    0,                 // wIndex: 0
    NULL,              // data: NULL
    0,                 // wLength: 0
    100                // timeout: 100ms
);
```

### Características
- **Secuencia obligatoria:** Enable → Write → Disable
- **Delay después de Enable:** 1 segundo
- **Delay entre writes:** 50ms (50,000 microsegundos)
- **Endianness:** Big-endian (se debe convertir con `htobe16()`)
- **Tamaño de escritura:** 2 bytes (1 word) por transfer

---

## Implementación en React Native / Expo

### Equivalencia de Parámetros

| libusb (C) | React Native USB |
|------------|------------------|
| `LIBUSB_ENDPOINT_IN` | `UsbConstants.USB_DIR_IN` |
| `LIBUSB_ENDPOINT_OUT` | `UsbConstants.USB_DIR_OUT` |
| `LIBUSB_REQUEST_TYPE_VENDOR` | `UsbConstants.USB_TYPE_VENDOR` |
| `LIBUSB_RECIPIENT_DEVICE` | `UsbConstants.USB_RECIPIENT_DEVICE` |

### Ejemplo en TypeScript

```typescript
// Lectura de EEPROM (1 word)
const readEEPROMWord = async (offset: number): Promise<number> => {
  const buffer = new Uint8Array(2);
  
  const result = await connection.controlTransfer(
    UsbConstants.USB_DIR_IN | UsbConstants.USB_TYPE_VENDOR | UsbConstants.USB_RECIPIENT_DEVICE,
    0x0b,              // ASIX_CMD_READ_EEPROM
    offset,            // wValue: offset en words
    0,                 // wIndex
    buffer,            // buffer de 2 bytes
    100                // timeout
  );
  
  if (result < 0) {
    throw new Error(`Failed to read EEPROM at offset ${offset}`);
  }
  
  // Convertir de big-endian
  return (buffer[0] << 8) | buffer[1];
};

// Escritura de EEPROM (1 word)
const writeEEPROMWord = async (offset: number, value: number): Promise<void> => {
  // Convertir a big-endian
  const valueBE = ((value & 0xFF) << 8) | ((value >> 8) & 0xFF);
  
  const result = await connection.controlTransfer(
    UsbConstants.USB_DIR_OUT | UsbConstants.USB_TYPE_VENDOR | UsbConstants.USB_RECIPIENT_DEVICE,
    0x0c,              // ASIX_CMD_WRITE_EEPROM
    offset,            // wValue: offset en words
    valueBE,           // wIndex: valor en big-endian
    null,              // sin buffer
    100                // timeout
  );
  
  if (result < 0) {
    throw new Error(`Failed to write EEPROM at offset ${offset}`);
  }
  
  // Esperar 50ms
  await new Promise(resolve => setTimeout(resolve, 50));
};
```

---

## Tamaños de EEPROM Comunes

| Chipset | Tamaño EEPROM |
|---------|---------------|
| AX88772 | 256 bytes (128 words) |
| AX88772A | 256 bytes (128 words) |
| AX88772B | 512 bytes (256 words) |
| AX88178 | 512 bytes (256 words) |

---

## Notas Importantes

### eFuse vs EEPROM

Algunos chipsets ASIX tienen **eFuse** (fusibles electrónicos) que pueden sobrescribir los valores de la EEPROM:

> "It's been confirmed that some chips ignore VID/PID bytes in the eeprom completely. This is likely because ASIX chips have an eFuse block to set VID/PID/MAC permanently and some manufacturers use it to make their products more tamper-resistant."

**Síntomas de eFuse activo:**
- La lectura de EEPROM funciona
- La escritura de EEPROM funciona
- Pero el chipset ignora los valores escritos y usa los del eFuse

**Solución:**
- No hay forma de modificar eFuse (es permanente)
- Si el chipset tiene eFuse programado, el spoofing NO funcionará
- La app debe detectar esta situación y avisar al usuario

### Permisos en Android

Para acceder a comandos vendor-specific en Android:
1. Solicitar permiso USB estándar (`android.permission.USB_PERMISSION`)
2. Abrir conexión USB (`UsbManager.openDevice()`)
3. Reclamar interfaz 0 (`connection.claimInterface(interface, true)`)
4. Ejecutar control transfers

**No se requieren permisos root** si el dispositivo está correctamente conectado via USB-OTG.

---

## Referencias

- [asix_eepromtool GitHub](https://github.com/karosium/asix_eepromtool)
- [718 Forum - PCM4 USB Ethernet Coding Adapter](https://www.718forum.com/threads/diy-718-cayman-pcm4-usb-ethernet-coding-adapter-eeprom-vid-pid-flash-guide.21613/)
- [libusb Documentation](https://libusb.info/)
