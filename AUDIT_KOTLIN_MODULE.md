# Auditoría de Seguridad: UsbNativeModule.kt

## Resumen Ejecutivo

**Fecha de auditoría**: 18 Enero 2026
**Archivo auditado**: `modules/usb-native/android/src/main/java/expo/modules/usbnative/UsbNativeModule.kt`
**Líneas de código**: 885

---

## 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. Función `spoofVIDPID` - MÚLTIPLES ERRORES GRAVES

**Ubicación**: Líneas 666-803

#### Error 1.1: NO habilita modo de escritura EEPROM
```kotlin
// FALTA COMPLETAMENTE:
// connection.controlTransfer(ASIX_CMD_WRITE_EEPROM_EN, ...)
// runBlocking { delay(1000) }
```

**Según la guía oficial (Guíaspoofing.pdf)**: "El proceso de escritura requiere habilitar el modo de escritura con el comando `WRITE_EEPROM_EN` (0x0D) y esperar 1 segundo antes de escribir."

**Consecuencia**: Las escrituras pueden fallar silenciosamente o ser ignoradas por el hardware.

#### Error 1.2: Usa byte offsets en lugar de word offsets
```kotlin
// INCORRECTO (línea 711):
EEPROM_VID_OFFSET,  // 0x88 - esto es byte offset, no word offset

// CORRECTO debería ser:
EEPROM_VID_OFFSET / 2,  // 0x44 - word offset
```

**Según la guía oficial**: "La EEPROM ASIX opera en palabras de 16 bits. El offset debe dividirse por 2 para obtener el word offset."

**Consecuencia**: Escribe en ubicaciones incorrectas de memoria, potencialmente corrompiendo otros datos.

#### Error 1.3: Escribe bytes individuales en lugar de words completos
```kotlin
// INCORRECTO (líneas 708-728):
connection.controlTransfer(..., EEPROM_VID_OFFSET, vidLow, ...)  // Solo byte bajo
connection.controlTransfer(..., EEPROM_VID_OFFSET + 1, vidHigh, ...)  // Solo byte alto
```

**Según la guía oficial**: "ASIX escribe en palabras de 16 bits. El comando WRITE_EEPROM espera el word completo en wIndex."

**Consecuencia**: Comportamiento indefinido - puede escribir basura o no escribir nada.

#### Error 1.4: NO deshabilita modo de escritura después de escribir
```kotlin
// FALTA COMPLETAMENTE:
// connection.controlTransfer(ASIX_CMD_WRITE_EEPROM_DIS, ...)
```

**Consecuencia**: La EEPROM queda en modo de escritura, vulnerable a escrituras accidentales.

#### Error 1.5: Delays insuficientes entre escrituras
```kotlin
// INCORRECTO (línea 718):
runBlocking { delay(10) }  // Solo 10ms

// CORRECTO según asix_eepromtool:
runBlocking { delay(50) }  // Mínimo 50ms entre escrituras
```

**Consecuencia**: Escrituras pueden no completarse antes de la siguiente operación.

---

### 2. Función `writeEEPROM` - PARCIALMENTE CORRECTA

**Ubicación**: Líneas 231-405

**✅ Aspectos correctos:**
- Habilita modo de escritura (línea 255)
- Espera 1 segundo después de habilitar (línea 272)
- Escribe words completos de 16 bits (líneas 280-319)
- Deshabilita modo de escritura (línea 323)
- Delay de 50ms entre escrituras (línea 318)

**⚠️ Problema menor:**
- La verificación usa byte offsets en lugar de word offsets (líneas 347-368)
- Esto puede causar lecturas incorrectas durante verificación

---

### 3. Función `detectEEPROMType` - CORRECTA

**Ubicación**: Líneas 458-664

**✅ Implementación correcta:**
- Habilita modo de escritura antes de probar
- Usa word offsets correctos
- Restaura valor original después de la prueba
- Deshabilita modo de escritura al finalizar
- Delays apropiados (1000ms después de enable, 50ms entre operaciones)

---

## 🟡 INCONSISTENCIAS DETECTADAS

### Inconsistencia 1: `writeEEPROM` vs `spoofVIDPID`

| Aspecto | writeEEPROM | spoofVIDPID |
|---------|-------------|-------------|
| Enable write mode | ✅ Sí | ❌ No |
| Word offsets | ✅ Sí | ❌ No (usa byte offsets) |
| Write words | ✅ Sí | ❌ No (escribe bytes) |
| Disable write mode | ✅ Sí | ❌ No |
| Delays correctos | ✅ 50ms | ❌ 10ms |

**Conclusión**: `writeEEPROM` está bien implementada, pero `spoofVIDPID` tiene múltiples errores críticos.

### Inconsistencia 2: Offsets de VID/PID

```kotlin
// Definición (línea 45-46):
private const val EEPROM_VID_OFFSET = 0x88  // Byte offset
private const val EEPROM_PID_OFFSET = 0x8A  // Byte offset

// Uso en spoofVIDPID (línea 711):
EEPROM_VID_OFFSET  // Usado como byte offset (INCORRECTO para ASIX)

// Uso correcto sería:
EEPROM_VID_OFFSET / 2  // = 0x44 word offset
```

---

## 🟢 ASPECTOS CORRECTOS

1. **Comandos ASIX correctos** (líneas 39-42):
   - READ_EEPROM = 0x0B ✅
   - WRITE_EEPROM = 0x0C ✅
   - WRITE_EEPROM_EN = 0x0D ✅
   - WRITE_EEPROM_DIS = 0x0E ✅

2. **Detección de chipset** (líneas 806-883):
   - Identifica correctamente AX88772, AX88772A, AX88772B, AX88772C
   - Identifica D-Link DUB-E100 como objetivo

3. **Manejo de permisos USB** (líneas 81-129):
   - Solicita permisos correctamente
   - Maneja broadcast receiver para respuesta

4. **Función dumpEEPROM** (líneas 407-456):
   - Lee correctamente en words de 16 bits
   - Usa word offsets correctos

---

## 📋 CORRECCIONES REQUERIDAS

### Corrección 1: Reescribir `spoofVIDPID` completamente

```kotlin
AsyncFunction("spoofVIDPID") { targetVID: Int, targetPID: Int, magicValue: Int, promise: Promise ->
    try {
        val connection = currentConnection
        if (connection == null) {
            promise.reject("NO_CONNECTION", "No active device connection", null)
            return@AsyncFunction
        }

        // PASO 1: Leer VID/PID actuales (word offsets)
        val vidWordOffset = EEPROM_VID_OFFSET / 2  // 0x44
        val pidWordOffset = EEPROM_PID_OFFSET / 2  // 0x45
        
        val currentVIDBytes = ByteArray(2)
        val currentPIDBytes = ByteArray(2)
        
        connection.controlTransfer(
            USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_READ_EEPROM,
            vidWordOffset,  // Word offset, no byte offset
            0,
            currentVIDBytes,
            2,
            5000
        )
        
        connection.controlTransfer(
            USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_READ_EEPROM,
            pidWordOffset,  // Word offset, no byte offset
            0,
            currentPIDBytes,
            2,
            5000
        )

        val currentVID = ((currentVIDBytes[0].toInt() and 0xFF) shl 8) or (currentVIDBytes[1].toInt() and 0xFF)
        val currentPID = ((currentPIDBytes[0].toInt() and 0xFF) shl 8) or (currentPIDBytes[1].toInt() and 0xFF)

        Log.d(TAG, "Current VID:PID = ${String.format("%04X:%04X", currentVID, currentPID)}")
        Log.d(TAG, "Target VID:PID = ${String.format("%04X:%04X", targetVID, targetPID)}")

        // PASO 2: Habilitar modo de escritura EEPROM
        val enableResult = connection.controlTransfer(
            USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_WRITE_EEPROM_EN,
            0,
            0,
            null,
            0,
            5000
        )
        
        if (enableResult < 0) {
            promise.reject("ENABLE_FAILED", "Failed to enable EEPROM write mode", null)
            return@AsyncFunction
        }
        
        // Esperar 1 segundo después de habilitar (CRÍTICO)
        runBlocking { delay(1000) }

        // PASO 3: Escribir VID como word completo (little endian en EEPROM)
        // VID 0x2001 -> word = 0x0120 (swapped for EEPROM storage)
        val vidWord = ((targetVID and 0xFF) shl 8) or ((targetVID shr 8) and 0xFF)
        
        val vidWriteResult = connection.controlTransfer(
            USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_WRITE_EEPROM,
            vidWordOffset,  // Word offset
            vidWord,        // Word completo
            null,
            0,
            5000
        )
        
        if (vidWriteResult < 0) {
            // Deshabilitar modo escritura antes de fallar
            connection.controlTransfer(
                USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
                ASIX_CMD_WRITE_EEPROM_DIS, 0, 0, null, 0, 5000
            )
            promise.reject("WRITE_FAILED", "Failed to write VID", null)
            return@AsyncFunction
        }
        
        // Esperar 50ms entre escrituras
        runBlocking { delay(50) }

        // PASO 4: Escribir PID como word completo
        val pidWord = ((targetPID and 0xFF) shl 8) or ((targetPID shr 8) and 0xFF)
        
        val pidWriteResult = connection.controlTransfer(
            USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_WRITE_EEPROM,
            pidWordOffset,  // Word offset
            pidWord,        // Word completo
            null,
            0,
            5000
        )
        
        if (pidWriteResult < 0) {
            connection.controlTransfer(
                USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
                ASIX_CMD_WRITE_EEPROM_DIS, 0, 0, null, 0, 5000
            )
            promise.reject("WRITE_FAILED", "Failed to write PID", null)
            return@AsyncFunction
        }

        // PASO 5: Deshabilitar modo de escritura
        connection.controlTransfer(
            USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_WRITE_EEPROM_DIS,
            0,
            0,
            null,
            0,
            5000
        )
        
        // Esperar a que el dispositivo se estabilice
        runBlocking { delay(500) }

        // PASO 6: Verificar escritura
        val verifyVIDBytes = ByteArray(2)
        val verifyPIDBytes = ByteArray(2)
        
        connection.controlTransfer(
            USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_READ_EEPROM,
            vidWordOffset,
            0,
            verifyVIDBytes,
            2,
            5000
        )
        
        connection.controlTransfer(
            USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_READ_EEPROM,
            pidWordOffset,
            0,
            verifyPIDBytes,
            2,
            5000
        )

        // Interpretar como little endian (como está almacenado en EEPROM)
        val verifyVID = ((verifyVIDBytes[1].toInt() and 0xFF) shl 8) or (verifyVIDBytes[0].toInt() and 0xFF)
        val verifyPID = ((verifyPIDBytes[1].toInt() and 0xFF) shl 8) or (verifyPIDBytes[0].toInt() and 0xFF)

        val success = (verifyVID == targetVID) && (verifyPID == targetPID)
        
        Log.d(TAG, "Verification: VID:PID = ${String.format("%04X:%04X", verifyVID, verifyPID)}, Success: $success")

        promise.resolve(mapOf(
            "success" to success,
            "previousVID" to currentVID,
            "previousPID" to currentPID,
            "newVID" to verifyVID,
            "newPID" to verifyPID
        ))
    } catch (e: Exception) {
        Log.e(TAG, "Error spoofing VID/PID: ${e.message}")
        promise.reject("SPOOF_ERROR", e.message, e)
    }
}
```

---

## 📊 MATRIZ DE RIESGO

| Función | Riesgo de Bricking | Probabilidad de Fallo | Acción Requerida |
|---------|-------------------|----------------------|------------------|
| `spoofVIDPID` | **ALTO** | **MUY ALTA** | Reescribir completamente |
| `writeEEPROM` | BAJO | BAJA | Corregir verificación |
| `detectEEPROMType` | MUY BAJO | MUY BAJA | Ninguna |
| `readEEPROM` | NINGUNO | NINGUNA | Ninguna |
| `dumpEEPROM` | NINGUNO | NINGUNA | Ninguna |

---

## ✅ VERIFICACIÓN CONTRA GUÍA OFICIAL

| Requisito (Guíaspoofing.pdf) | Estado en Código |
|------------------------------|------------------|
| Habilitar modo escritura (0x0D) | ❌ Falta en spoofVIDPID |
| Esperar 1s después de enable | ❌ Falta en spoofVIDPID |
| Usar word offsets (dividir por 2) | ❌ Usa byte offsets |
| Escribir words de 16 bits | ❌ Escribe bytes individuales |
| Delay 50ms entre escrituras | ❌ Solo 10ms |
| Deshabilitar modo escritura (0x0E) | ❌ Falta en spoofVIDPID |
| Verificar después de escribir | ✅ Presente |
| Detectar eFuse antes de spoofing | ✅ Presente en detectEEPROMType |

---

## 🎯 CONCLUSIÓN

**La función `spoofVIDPID` tiene errores críticos que pueden causar:**
1. Escrituras fallidas silenciosas (sin enable mode)
2. Corrupción de datos en ubicaciones incorrectas (byte offsets vs word offsets)
3. Comportamiento indefinido (escritura de bytes vs words)
4. EEPROM vulnerable después de operación (sin disable mode)

**Recomendación**: NO usar la función `spoofVIDPID` actual. Usar `writeEEPROM` que está correctamente implementada, o corregir `spoofVIDPID` según el código proporcionado arriba.


---

# Auditoría de Seguridad: usb-service.ts

## Resumen

**Archivo auditado**: `lib/usb-service.ts`
**Líneas de código**: 582

---

## ✅ ASPECTOS CORRECTOS

### 1. Constantes bien definidas (líneas 8-17)
```typescript
export const MAGIC_VALUE = 0xDEADBEEF;  // ✅ Correcto según guía
export const EEPROM_VID_OFFSET = 0x88;   // ✅ Correcto
export const EEPROM_PID_OFFSET = 0x8A;   // ✅ Correcto
export const TARGET_VID = 0x2001;        // ✅ D-Link VID
export const TARGET_PID = 0x3C05;        // ✅ D-Link PID Rev B1
```

### 2. Función `dryRunSpoof` (líneas 373-502)
- ✅ NO escribe en EEPROM
- ✅ Solo lee valores actuales
- ✅ Detecta tipo de EEPROM antes de proceder
- ✅ Advierte si es eFuse
- ✅ Muestra cambios que se realizarían

### 3. Función `verifyEEPROMChecksum` (líneas 514-576)
- ✅ Implementa algoritmo correcto: `0xFF - SUM[0x07-0x0E]`
- ✅ Documenta que VID/PID NO afectan checksum
- ✅ Solo lectura, no modifica nada

### 4. Función `detectEEPROMType` (líneas 347-365)
- ✅ Delega correctamente al módulo nativo
- ✅ Logging apropiado

---

## 🟡 PROBLEMAS MENORES

### 1. Función `spoofVIDPID` (líneas 214-232)
```typescript
async spoofVIDPID(targetVID: number = TARGET_VID, targetPID: number = TARGET_PID): Promise<SpoofResult> {
    // ...
    const result = await UsbNativeModule.spoofVIDPID(targetVID, targetPID, MAGIC_VALUE);
    // ...
}
```

**Problema**: Esta función llama a `UsbNativeModule.spoofVIDPID` que tiene errores críticos en Kotlin.

**Recomendación**: No usar esta función hasta que se corrija el módulo Kotlin. Usar `writeEEPROM` directamente con los datos correctos.

### 2. Función `dryRunSpoof` - Offsets de bytes vs words
```typescript
// Líneas 433-474: Muestra cambios byte por byte
changes.push({
    offset: EEPROM_VID_OFFSET,  // 0x88 - byte offset
    // ...
});
```

**Nota**: Esto es correcto para mostrar al usuario, pero el módulo Kotlin debe usar word offsets (0x44) internamente.

---

## 📊 MATRIZ DE RIESGO

| Función | Riesgo | Estado |
|---------|--------|--------|
| `dryRunSpoof` | NINGUNO | ✅ Solo lectura |
| `verifyEEPROMChecksum` | NINGUNO | ✅ Solo lectura |
| `detectEEPROMType` | BAJO | ✅ Prueba en offset seguro |
| `spoofVIDPID` | **ALTO** | ⚠️ Llama a función Kotlin defectuosa |
| `writeEEPROM` | BAJO | ✅ Implementación correcta en Kotlin |
| `readEEPROM` | NINGUNO | ✅ Solo lectura |
| `dumpEEPROM` | NINGUNO | ✅ Solo lectura |

---

## ✅ CONCLUSIÓN

El servicio TypeScript está bien implementado. El único problema es que `spoofVIDPID` delega a una función Kotlin defectuosa. Las funciones de seguridad (`dryRunSpoof`, `verifyEEPROMChecksum`) están correctamente implementadas y son seguras.


---

# Auditoría de Seguridad: auto-spoof.tsx

## Resumen

**Archivo auditado**: `app/(tabs)/auto-spoof.tsx`
**Líneas de código**: 948

---

## ✅ ASPECTOS CORRECTOS

### 1. Detección de eFuse antes de spoofing (líneas 55-101)
```typescript
// DETECCIÓN REAL de EEPROM vs eFuse
const eepromType = await usbService.detectEEPROMType();

if (!eepromType.writable) {
    // eFuse detectado - BLOQUEAR spoofing
    Alert.alert(t('auto_spoof.spoofing_blocked'), ...);
    return;
}
```
✅ **CORRECTO**: Bloquea spoofing si detecta eFuse

### 2. Múltiples confirmaciones antes de ejecutar (líneas 107-162)
- `proceedWithSpoofing()` → Advertencia sobre cable OTG
- `showCriticalWarning()` → Advertencia crítica
- `showFinalConfirmation()` → Confirmación final

✅ **CORRECTO**: El usuario debe confirmar 3 veces antes de ejecutar

### 3. Backup automático antes de modificar (líneas 182-193)
```typescript
dispatch({ type: 'SET_STEP', payload: 'creating_backup' });
await backupService.createBackup(device);
```
✅ **CORRECTO**: Crea backup antes de cualquier escritura

### 4. Función handleDryRun (líneas 283-309)
```typescript
const result = await usbService.dryRunSpoof();
dispatch({ type: 'SET_DRY_RUN_RESULT', payload: result });
```
✅ **CORRECTO**: Solo lectura, no modifica nada

### 5. Función handleVerifyChecksum (líneas 312-338)
```typescript
const result = await usbService.verifyEEPROMChecksum();
dispatch({ type: 'SET_CHECKSUM_RESULT', payload: result });
```
✅ **CORRECTO**: Solo lectura, no modifica nada

---

## 🟢 IMPLEMENTACIÓN DE ESCRITURA CORRECTA

### Función performSpoof (líneas 164-278)

```typescript
// Paso 3: Escribir VID completo (word en offset 0x88)
// IMPORTANTE: Escribimos 2 bytes a la vez porque ASIX usa word offsets internamente
// Byte offset 0x88 -> Word offset 0x44
// Datos: 0x01 (byte bajo) + 0x20 (byte alto) = VID 0x2001
await usbService.writeEEPROM(0x88, '0120', state.skipVerification);

// Paso 4: Escribir PID completo (word en offset 0x8A)
// Byte offset 0x8A -> Word offset 0x45
// Datos: 0x05 (byte bajo) + 0x3C (byte alto) = PID 0x3C05
await usbService.writeEEPROM(0x8A, '053C', state.skipVerification);
```

✅ **CORRECTO**: 
- Escribe words completos (2 bytes) en lugar de bytes individuales
- Usa `writeEEPROM` que está correctamente implementada en Kotlin
- Datos en formato little-endian correcto
- NO usa la función `spoofVIDPID` defectuosa

### Verificación post-escritura (líneas 232-240)
```typescript
const vidLow = await usbService.readEEPROM(0x88, 1);
const vidHigh = await usbService.readEEPROM(0x89, 1);
const pidLow = await usbService.readEEPROM(0x8A, 1);
const pidHigh = await usbService.readEEPROM(0x8B, 1);

if (vidLow.data !== '01' || vidHigh.data !== '20' || pidLow.data !== '05' || pidHigh.data !== '3C') {
    throw new Error(t('auto_spoof.error_verification_failed'));
}
```

✅ **CORRECTO**: Verifica que los bytes escritos son correctos

---

## 📊 MATRIZ DE RIESGO

| Función | Riesgo | Estado |
|---------|--------|--------|
| `executeAutoSpoof` | BAJO | ✅ Detecta eFuse primero |
| `performSpoof` | BAJO | ✅ Usa writeEEPROM correcta |
| `handleDryRun` | NINGUNO | ✅ Solo lectura |
| `handleVerifyChecksum` | NINGUNO | ✅ Solo lectura |
| `handleTestSpoofing` | NINGUNO | ✅ Solo lectura |

---

## ✅ CONCLUSIÓN

La pantalla `auto-spoof.tsx` está **correctamente implementada**:

1. **Detecta eFuse** antes de permitir spoofing
2. **Requiere múltiples confirmaciones** del usuario
3. **Crea backup** antes de modificar
4. **Usa `writeEEPROM`** (correcta) en lugar de `spoofVIDPID` (defectuosa)
5. **Escribe words completos** (2 bytes) en formato little-endian
6. **Verifica** los datos escritos después de la operación

**NO hay riesgo de bricking** usando esta pantalla.


---

# Auditoría de Seguridad: telnet-scripts-service.ts

## Resumen

**Archivo auditado**: `lib/telnet-scripts-service.ts`
**Líneas de código**: 704
**Total de scripts**: 35+

---

## ✅ ANÁLISIS DE SCRIPTS POR CATEGORÍA

### 1. VERIFICACIÓN (Solo lectura) - ✅ SEGUROS
| Script ID | Comando | Riesgo |
|-----------|---------|--------|
| `verify_root` | `whoami` | ✅ NINGUNO |
| `list_storage` | `ls /dev/mmc*` | ✅ NINGUNO |
| `check_sd_mounted` | `ls /mnt/sd` | ✅ NINGUNO |
| `check_eso` | `ls /eso` | ✅ NINGUNO |
| `system_info` | `uname -a` | ✅ NINGUNO |

### 2. BACKUP (Lectura/Escritura a SD) - ✅ SEGUROS
| Script ID | Comando | Riesgo |
|-----------|---------|--------|
| `check_sd_space` | `df -h /mnt/sd` | ✅ NINGUNO |
| `create_backup_dir` | `mkdir -p /mnt/sd/backups` | ✅ NINGUNO |
| `backup_tsd_swap` | `cp ... /mnt/sd/backups/` | ✅ BAJO - Solo copia |
| `backup_etc` | `tar -czf /mnt/sd/backups/...` | ✅ BAJO - Solo copia |
| `dd_backup_system` | `dd if=/dev/mmcblk0 of=/mnt/sd/...` | ✅ BAJO - Solo lectura |
| `verify_backup_md5` | `md5sum ...` | ✅ NINGUNO |

### 3. RESTAURACIÓN - ⚠️ REQUIERE ATENCIÓN
| Script ID | Comando | Riesgo | Estado |
|-----------|---------|--------|--------|
| `restore_tsd_swap` | `cp $LATEST /net/rcc/dev/shmem/...` | ⚠️ MEDIO | Requiere confirmación |
| `dd_restore_system` | **NO EJECUTA** - Solo muestra instrucciones | ✅ SEGURO | Solo informativo |
| `guided_restore` | **NO EJECUTA** - Solo muestra instrucciones | ✅ SEGURO | Solo informativo |

**IMPORTANTE**: Los scripts de restauración dd **NO ejecutan el comando automáticamente**. Solo muestran instrucciones al usuario.

### 4. INSTALACIÓN - ⚠️ PELIGROSOS (Requieren confirmación)
| Script ID | Comando | Riesgo |
|-----------|---------|--------|
| `run_install` | `./install.sh` | ⚠️ ALTO |
| `run_bootstrap` | `./bootstrap.sh` | ⚠️ ALTO |
| `patch_swap` | `/eso/bin/patch_swap.sh` | ⚠️ ALTO |

**Nota**: Estos scripts ejecutan código del Toolbox MIB2, no código de la aplicación.

---

## 🔍 ANÁLISIS DETALLADO DE COMANDOS DD

### Script `dd_backup_system` (líneas 246-271)
```bash
dd if=/dev/mmcblk0 of=$OUTFILE bs=4M status=progress
```
✅ **SEGURO**: 
- `if=` (input file) lee del dispositivo
- `of=` (output file) escribe a la SD
- **NO puede dañar el MIB2** porque solo lee

### Script `dd_restore_system` (líneas 340-351)
```bash
echo "Para restaurar, ejecuta manualmente:"
echo "dd if=/mnt/sd/backups/NOMBRE_ARCHIVO.img of=/dev/mmcblk0 bs=4M status=progress"
```
✅ **SEGURO**: 
- **NO ejecuta el comando dd**
- Solo muestra instrucciones al usuario
- El usuario debe ejecutar manualmente

### Script `guided_restore` (líneas 353-381)
```bash
echo "Para ejecutar la restauración guiada:"
echo "sh /mnt/sd/guided_restore.sh /mnt/sd/backups/NOMBRE_ARCHIVO.img"
```
✅ **SEGURO**:
- **NO ejecuta la restauración**
- Solo muestra instrucciones
- Requiere script externo en la SD

---

## 📊 MATRIZ DE RIESGO COMPLETA

| Categoría | Scripts | Riesgo de Bricking MIB2 | Ejecuta automáticamente |
|-----------|---------|------------------------|------------------------|
| Verificación | 5 | ✅ NINGUNO | Sí (solo lectura) |
| Backup | 10 | ✅ NINGUNO | Sí (solo lectura/copia) |
| Restauración | 3 | ⚠️ BAJO | **NO** (solo instrucciones) |
| Preparación | 5 | ✅ BAJO | Sí (mkdir, mount) |
| Instalación | 5 | ⚠️ ALTO | Sí (scripts externos) |
| Activación | 2 | ⚠️ ALTO | Sí (scripts externos) |
| Sistema | 4 | ⚠️ MEDIO | Sí (reboot, etc.) |

---

## ✅ MEDIDAS DE SEGURIDAD IMPLEMENTADAS

1. **Confirmación requerida**: Todos los scripts peligrosos tienen `requiresConfirmation: true`
2. **Niveles de riesgo**: Cada script tiene un `riskLevel` (info/warning/danger)
3. **Advertencias traducidas**: Cada script peligroso tiene `warningKey` para mostrar advertencia
4. **Scripts dd NO auto-ejecutan**: Los comandos dd de restauración solo muestran instrucciones
5. **Verificación de integridad**: Script `verify_backup_integrity` verifica MD5 antes de restaurar

---

## ✅ CONCLUSIÓN

Los scripts Telnet están **correctamente implementados** con las siguientes garantías:

1. **Scripts de verificación**: Solo lectura, sin riesgo
2. **Scripts de backup**: Solo lectura del MIB2, escritura a SD
3. **Scripts de restauración dd**: **NO ejecutan automáticamente** - solo muestran instrucciones
4. **Scripts de instalación**: Ejecutan scripts del Toolbox, no código de la app
5. **Todos los scripts peligrosos**: Requieren confirmación del usuario

**NO hay riesgo de bricking automático del MIB2** usando estos scripts.


---

# Auditoría de Seguridad: toolbox-installer.ts

## Resumen

**Archivo auditado**: `lib/toolbox-installer.ts`
**Líneas de código**: 287

---

## ✅ ANÁLISIS DE CONTENIDO

### 1. Pasos de Instalación (líneas 19-139)

Los pasos de instalación son **INFORMATIVOS** - no ejecutan comandos automáticamente:

| Paso | Contenido | Ejecuta código |
|------|-----------|----------------|
| 1-3 | Configuración de red | ❌ No |
| 4-5 | Conexión Telnet | ❌ No |
| 6 | Verificar SD | ❌ No |
| 7 | Descargar Toolbox | ❌ No |
| 8 | Ejecutar install.sh | ❌ No (solo muestra comando) |
| 9 | Parchear swap | ❌ No (solo muestra instrucciones) |
| 10 | Verificar instalación | ❌ No |
| 11 | Reboot | ❌ No (solo muestra comando) |

**IMPORTANTE**: Todos los pasos son **SOLO INFORMATIVOS**. La aplicación muestra los comandos pero **NO los ejecuta automáticamente**.

### 2. Comandos de Diagnóstico (líneas 166-202)

Todos los comandos de diagnóstico son **SOLO LECTURA**:

| Comando | Función | Riesgo |
|---------|---------|--------|
| `uname -a` | Info del sistema | ✅ NINGUNO |
| `cat /net/mmx/fs/sda0/VERSION` | Versión firmware | ✅ NINGUNO |
| `ps aux` | Procesos | ✅ NINGUNO |
| `df -h` | Espacio disco | ✅ NINGUNO |
| `ifconfig -a` | Red | ✅ NINGUNO |
| `netstat -an` | Servicios | ✅ NINGUNO |
| `pidin info` | Hardware | ✅ NINGUNO |

### 3. Script Generado (líneas 207-261)

La función `generateInstallationScript()` genera un script que:
- Verifica acceso root
- Verifica SD montada
- Verifica que install.sh existe
- Ejecuta `./install.sh` (script del Toolbox, no de la app)

**NOTA**: Este script es **generado para referencia**, no se ejecuta automáticamente.

---

## ✅ CONCLUSIÓN

El archivo `toolbox-installer.ts` es **100% SEGURO**:

1. **Solo contiene información** - No ejecuta comandos
2. **Guía paso a paso** - El usuario debe ejecutar manualmente
3. **Comandos de diagnóstico** - Solo lectura
4. **Script generado** - Para referencia, no auto-ejecutado

**NO hay riesgo de bricking** desde este archivo.
