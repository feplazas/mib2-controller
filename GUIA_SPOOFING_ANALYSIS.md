# Análisis Detallado de Guíaspoofing.pdf - Corrección de Auditoría

## Resumen Ejecutivo

Tras revisar cuidadosamente la guía técnica, **debo corregir mis conclusiones anteriores**.

## Hallazgos Clave de la Guía

### 1. Estructura de la EEPROM (Sección 2.2, Página 2)

> "La estructura de la EEPROM se organiza en **palabras de 16 bits (2 bytes)**. Por tanto, cuando se utiliza una herramienta como ethtool que opera con offsets de bytes, es fundamental tener en cuenta que la lectura y escritura física en el bus interno del chip puede estar alineada a palabras."

### 2. Método de Escritura Recomendado (Sección 6.3, Página 8)

La guía especifica claramente:

> "Es recomendable realizar las escrituras **byte por byte** para máxima precisión y control, especialmente si se usa el parámetro length 1 para asegurar que solo se modifica un byte a la vez, evitando problemas de alineación de palabras que tienen algunas versiones de ethtool."

**Comandos exactos de la guía:**
```bash
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x88 value 0x01
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x89 value 0x20
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x8A value 0x05
sudo ethtool -E eth1 magic 0xdeadbeef offset 0x8B value 0x3C
```

### 3. Mapa de Memoria (Sección 6.2, Página 8)

| Offset | Contenido Original | Nuevo Valor | Descripción |
|--------|-------------------|-------------|-------------|
| 0x88 | 95 | 01 | Byte bajo del VID |
| 0x89 | 0B | 20 | Byte alto del VID |
| 0x8A | 20 | 05 | Byte bajo del PID |
| 0x8B | 77 | 3C | Byte alto del PID |

**Formato Little Endian:**
- VID 0x0B95 → almacenado como `95 0B`
- PID 0x7720 → almacenado como `20 77`
- Nuevo VID 0x2001 → almacenar como `01 20`
- Nuevo PID 0x3C05 → almacenar como `05 3C`

### 4. Magic Value (Sección 5.2, Página 6)

> "AX_EEPROM_MAGIC está definido como **0xdeadbeef**"

El kernel de Linux verifica este valor antes de permitir escrituras:
```c
if (eeprom->magic != AX_EEPROM_MAGIC)
    return -EINVAL;
```

### 5. Bloqueo por eFuse (Sección 7.1, Página 9)

> "Las versiones más modernas del chipset, particularmente el **AX88772C**, introducen una tecnología llamada eFuse... el chip **ignorará** cualquier dato presente en la EEPROM externa para esos campos específicos."

> "ethtool puede reportar que la escritura fue exitosa (porque efectivamente escribió en la EEPROM), pero al reiniciar, el chip seguirá reportando 0b95:7720 porque la lógica interna prioriza el eFuse sobre la EEPROM."

### 6. Checksum (Sección 7.2, Página 9)

> "En muchos casos (especialmente AX88772B), el controlador es permisivo y recalcula o ignora el checksum tras una modificación menor."

> "Si el dispositivo queda 'brickeado' (no es reconocido por USB) tras el cambio, significa que el checksum es inválido y el chip se niega a iniciar."

---

## Corrección de Mi Auditoría Anterior

### ❌ Error en mi análisis anterior:

Afirmé que el código Kotlin tenía errores porque:
1. "No habilita modo escritura" - **INCORRECTO**, sí lo hace
2. "Offsets incorrectos (debe dividir por 2)" - **INCORRECTO**
3. "Debe escribir words de 16 bits" - **PARCIALMENTE INCORRECTO**

### ✅ Realidad según la guía:

1. **ethtool usa offsets de BYTE** (0x88, 0x89, 0x8A, 0x8B), no de word
2. **La escritura byte por byte es el método RECOMENDADO** por la guía
3. **ethtool maneja internamente** la conversión a comandos USB del chip

### El problema real del código Kotlin:

El código Kotlin actual en `writeEEPROM` hace lo siguiente:
```kotlin
val wordOffset = (offset + i) / 2  // Offset in words, not bytes
```

Esto **convierte byte offsets a word offsets**, lo cual es correcto para la comunicación USB con el chip ASIX, pero hay un problema:

**Cuando se llama desde `auto-spoof.tsx`:**
```typescript
await usbService.writeEEPROM(0x88, '01', ...);  // Escribe en word offset 0x44
await usbService.writeEEPROM(0x89, '20', ...);  // Escribe en word offset 0x44 (¡mismo!)
await usbService.writeEEPROM(0x8A, '05', ...);  // Escribe en word offset 0x45
await usbService.writeEEPROM(0x8B, '3C', ...);  // Escribe en word offset 0x45 (¡mismo!)
```

El problema es que al escribir byte a byte con offsets consecutivos, el código Kotlin:
1. Convierte 0x88 a word offset 0x44
2. Convierte 0x89 a word offset 0x44 (¡el mismo!)
3. Cada escritura sobrescribe la anterior

### Solución correcta:

**Opción A:** Escribir 2 bytes a la vez (un word completo):
```typescript
await usbService.writeEEPROM(0x88, '0120', ...);  // VID completo
await usbService.writeEEPROM(0x8A, '053C', ...);  // PID completo
```

**Opción B:** Modificar el código Kotlin para manejar escrituras de byte individual correctamente, leyendo el word actual, modificando solo el byte correspondiente, y escribiendo el word completo.

---

## Verificación del Código Actual

### Módulo Kotlin `writeEEPROM` (líneas 274-319):

```kotlin
// STEP 2: Write data word by word (16-bit words)
for (i in data.indices step 2) {
  val byte0 = data[i].toInt() and 0xFF
  val byte1 = if (i + 1 < data.size) (data[i + 1].toInt() and 0xFF) else 0
  val word = (byte0 shl 8) or byte1  // Big-endian: high byte first
  
  val wordOffset = (offset + i) / 2  // Offset in words, not bytes
```

**Análisis:**
- El código agrupa bytes en words de 16 bits ✅
- Calcula word offset dividiendo por 2 ✅
- Usa big-endian para el word (byte0 en bits altos) ⚠️

### Problema de Endianness:

La guía indica que la EEPROM usa **Little Endian**:
- VID 0x2001 → `01 20` (byte bajo primero)
- PID 0x3C05 → `05 3C` (byte bajo primero)

El código Kotlin usa:
```kotlin
val word = (byte0 shl 8) or byte1  // Big-endian: high byte first
```

Si se pasa `'0120'` (como string hex), se parsea como:
- byte0 = 0x01
- byte1 = 0x20
- word = (0x01 << 8) | 0x20 = 0x0120

Pero el chip ASIX espera el word en formato específico según su interfaz USB.

---

## Conclusión Corregida

### Estado del código:

| Componente | Estado | Notas |
|------------|--------|-------|
| `writeEEPROM` habilita escritura | ✅ Correcto | Usa ASIX_CMD_WRITE_EEPROM_EN |
| `writeEEPROM` deshabilita escritura | ✅ Correcto | Usa ASIX_CMD_WRITE_EEPROM_DIS |
| Delays entre operaciones | ✅ Correcto | 1000ms enable, 50ms entre writes |
| Conversión byte→word offset | ✅ Correcto | Divide por 2 |
| Uso desde auto-spoof.tsx | ⚠️ Revisar | Debe pasar 2 bytes por llamada |

### Riesgos reales de bricking:

1. **eFuse en AX88772C**: No hay solución de software, pero la app ya detecta esto
2. **Checksum inválido**: Bajo riesgo en AX88772B, el chip recalcula
3. **Offsets incorrectos**: Si el usuario tiene un adaptador con mapa de memoria diferente

### Recomendaciones:

1. **Verificar que auto-spoof.tsx pase words completos** (2 bytes) en lugar de bytes individuales
2. **Agregar lectura previa del word** antes de modificar un byte individual
3. **Mantener la detección de eFuse** como medida de seguridad
4. **El backup de EEPROM completo** antes de cualquier modificación es crítico

---

## Apéndice: Comparación ethtool vs Código Kotlin

| Aspecto | ethtool (Linux) | Código Kotlin |
|---------|-----------------|---------------|
| Offset | Byte offset (0x88) | Convierte a word offset |
| Escritura | Byte a byte | Word a word |
| Magic value | 0xdeadbeef | Cualquier valor no-cero |
| Verificación | Manual con -e | Automática post-escritura |

La diferencia clave es que **ethtool abstrae la complejidad** del chip ASIX, mientras que el código Kotlin debe manejar directamente los comandos USB vendor-specific.
