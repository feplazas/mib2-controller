# Auditoría de Seguridad - MIB2 Controller

**Fecha:** 18 de enero de 2026  
**Versión auditada:** da466c06  
**Auditor:** Sistema de auditoría automatizada

---

## 1. AUDITORÍA DEL MÓDULO NATIVO KOTLIN (USB EEPROM)

### Archivo: `modules/usb-native/android/src/main/java/expo/modules/usbnative/UsbNativeModule.kt`

### 1.1 Hallazgos Críticos

#### ⚠️ CRÍTICO: Función `spoofVIDPID` NO habilita modo escritura EEPROM

**Ubicación:** Líneas 666-803

**Problema:** La función `spoofVIDPID` escribe directamente a la EEPROM sin:
1. Habilitar el modo de escritura (`ASIX_CMD_WRITE_EEPROM_EN`)
2. Esperar el tiempo requerido (1000ms) después de habilitar
3. Deshabilitar el modo de escritura al finalizar (`ASIX_CMD_WRITE_EEPROM_DIS`)

**Comparación con `writeEEPROM`:** La función `writeEEPROM` (líneas 231-405) SÍ implementa correctamente:
- Paso 1: Enable EEPROM write mode
- Paso 2: Espera 1000ms
- Paso 3: Escritura
- Paso 4: Disable EEPROM write mode
- Paso 5: Espera 500ms para estabilización

**Riesgo:** En algunos chipsets ASIX, escribir sin habilitar el modo de escritura puede:
- Causar escrituras parciales o corruptas
- Dejar la EEPROM en estado inconsistente
- Potencialmente brickear el adaptador

**Recomendación:** Modificar `spoofVIDPID` para seguir el mismo protocolo que `writeEEPROM`.

---

#### ⚠️ CRÍTICO: Offsets incorrectos en `spoofVIDPID` para lectura/escritura

**Ubicación:** Líneas 678-755

**Problema:** La función usa `EEPROM_VID_OFFSET` (0x88) y `EEPROM_PID_OFFSET` (0x8A) directamente como offsets de WORD, pero estos son offsets de BYTE.

En ASIX, el comando READ/WRITE_EEPROM usa **word offsets**, no byte offsets:
- Byte offset 0x88 = Word offset 0x44
- Byte offset 0x8A = Word offset 0x45

**Código actual (INCORRECTO):**
```kotlin
connection.controlTransfer(
  ...
  EEPROM_VID_OFFSET,  // 0x88 - INCORRECTO, debería ser 0x44
  ...
)
```

**Código correcto:**
```kotlin
val vidWordOffset = EEPROM_VID_OFFSET / 2  // 0x88 / 2 = 0x44
connection.controlTransfer(
  ...
  vidWordOffset,
  ...
)
```

**Riesgo:** Escribir en offsets incorrectos puede:
- Sobrescribir datos críticos de la EEPROM
- Corromper la configuración del chipset
- **BRICKEAR PERMANENTEMENTE** el adaptador

---

#### ⚠️ ALTO: Escritura byte a byte en lugar de word a word

**Ubicación:** Líneas 708-755

**Problema:** La función escribe VID y PID byte a byte:
```kotlin
// Escribe byte bajo de VID
EEPROM_VID_OFFSET, vidLow
// Escribe byte alto de VID  
EEPROM_VID_OFFSET + 1, vidHigh
```

Pero el comando ASIX `WRITE_EEPROM` escribe **words completos** (16 bits), no bytes individuales.

**Formato correcto según asix_eepromtool:**
```kotlin
// wValue = word offset
// wIndex = word data (16 bits)
connection.controlTransfer(
  USB_DIR_OUT | USB_TYPE_VENDOR | USB_RECIP_DEVICE,
  ASIX_CMD_WRITE_EEPROM,
  wordOffset,     // wValue: offset en words
  wordData,       // wIndex: dato de 16 bits
  null, 0, timeout
)
```

**Riesgo:** Escrituras parciales pueden dejar la EEPROM en estado inconsistente.

---

### 1.2 Hallazgos Moderados

#### ⚠️ MEDIO: Función `detectEEPROMType` modifica EEPROM real

**Ubicación:** Líneas 458-664

**Problema:** La detección de tipo EEPROM escribe un valor de prueba real en el offset 0x7F (últimos 2 bytes de la EEPROM) y luego intenta restaurarlo.

**Riesgo:** Si la restauración falla (por desconexión, error de comunicación, etc.), el adaptador quedará con datos corruptos en los últimos bytes.

**Recomendación:** 
1. Usar un método de detección que no requiera escritura real
2. O advertir claramente al usuario antes de ejecutar esta función

---

#### ⚠️ MEDIO: No hay validación de chipset antes de spoofing

**Ubicación:** Función `spoofVIDPID`

**Problema:** La función no verifica si el chipset es compatible antes de intentar el spoofing. Chipsets como AX88772C tienen eFuse y NO deben ser modificados.

**Recomendación:** Agregar verificación de chipset y bloquear operación en modelos incompatibles.

---

### 1.3 Hallazgos Menores

#### ℹ️ BAJO: Magic value no se valida correctamente

**Ubicación:** Líneas 239-247

**Observación:** El magic value solo verifica que no sea cero, pero no valida el valor específico `0xDEADBEEF`. Esto es intencional según el comentario, pero reduce la protección.

---

## 2. CORRECCIONES REQUERIDAS

### 2.1 Corrección Crítica para `spoofVIDPID`

La función debe ser reescrita completamente para:

1. **Convertir byte offsets a word offsets**
2. **Habilitar modo escritura antes de escribir**
3. **Escribir words completos, no bytes individuales**
4. **Deshabilitar modo escritura al finalizar**
5. **Agregar delays apropiados**

---

## 3. AUDITORÍA PENDIENTE

- [ ] Servicio de backup/restore de EEPROM (backup-service.ts)
- [ ] Scripts de Telnet para MIB2
- [ ] Guía de instalación y comandos dd
- [ ] Pantalla de auto-spoof

---

## 2. AUDITORÍA DEL SERVICIO DE BACKUP/RESTORE (backup-service.ts)

### 2.1 Hallazgos Positivos (Buenas Prácticas)

#### ✅ EXCELENTE: Restauración completa de EEPROM DESHABILITADA

**Ubicación:** Líneas 438-448

**Código:**
```typescript
async restoreBackup(_backupId: string): Promise<{ success: boolean; bytesWritten: number }> {
  const errorMsg = 'FUNCIÓN DESHABILITADA: La restauración completa de EEPROM está deshabilitada ' +
    'debido a bugs críticos que causaron bricking de adaptadores. ' +
    'Use "Restaurar VID/PID" en su lugar...';
  throw new Error(errorMsg);
}
```

**Evaluación:** Esta es una decisión de seguridad CORRECTA. La restauración completa de EEPROM
fue deshabilitada debido a bugs de offset que causaron bricking. Solo se permite restaurar
VID/PID usando `spoofVIDPID`.

---

#### ✅ BUENO: Verificación de integridad dual MD5+SHA256

**Ubicación:** Líneas 83-160

**Evaluación:** El sistema implementa verificación dual de checksums antes de cualquier
restauración, lo cual es una buena práctica de seguridad.

---

#### ✅ BUENO: Verificación obligatoria antes de restaurar VID/PID

**Ubicación:** Líneas 394-402

**Código:**
```typescript
// VERIFICACIÓN DE INTEGRIDAD OBLIGATORIA
const integrityResult = this.verifyBackupIntegrity(backup);
if (integrityResult.status !== 'valid') {
  throw new Error(`integrity_check_failed: ${integrityResult.details}`);
}
```

---

### 2.2 Hallazgos Preocupantes

#### ⚠️ MEDIO: `restoreVidPidFromBackup` usa `spoofVIDPID` que tiene bugs

**Ubicación:** Línea 412

**Problema:** La función `restoreVidPidFromBackup` llama a `usbService.spoofVIDPID()`,
que como se documentó en la Sección 1, tiene bugs críticos de offset.

**Riesgo:** Aunque la intención es correcta (solo restaurar VID/PID), la función
subyacente `spoofVIDPID` tiene problemas que podrían causar escrituras incorrectas.

---

## 3. AUDITORÍA DE SCRIPTS TELNET (telnet-scripts-service.ts)

### 3.1 Hallazgos Positivos

#### ✅ EXCELENTE: Sistema de niveles de riesgo

Los scripts están categorizados por nivel de riesgo:
- `info`: Solo lectura, sin riesgo
- `warning`: Modificaciones menores, requiere confirmación
- `danger`: Operaciones críticas, requiere confirmación múltiple

---

#### ✅ EXCELENTE: Restauración dd NO ejecuta automáticamente

**Ubicación:** Script `dd_restore_system` (líneas 340-351)

**Código:**
```typescript
commands: ['echo "⚠️ ADVERTENCIA: Esto sobrescribirá TODO el sistema." && 
  echo "Listando backups disponibles:" && 
  ls -lah /mnt/sd/backups/*.img 2>/dev/null && 
  echo "" && 
  echo "Para restaurar, ejecuta manualmente:" && 
  echo "dd if=/mnt/sd/backups/NOMBRE_ARCHIVO.img of=/dev/mmcblk0 bs=4M status=progress"']
```

**Evaluación:** El script de restauración dd **NO ejecuta el comando dd automáticamente**.
Solo muestra instrucciones para que el usuario lo ejecute manualmente. Esto es una
medida de seguridad CRÍTICA y correcta.

---

#### ✅ BUENO: Verificación de integridad antes de restauración

**Ubicación:** Script `verify_backup_integrity` (líneas 206-231)

El script verifica MD5 antes de permitir restauración.

---

#### ✅ BUENO: Backups obligatorios antes de modificaciones

**Ubicación:** Script `backup_tsd_swap` (líneas 140-153)

El script de backup del binario crítico `tsd.mibstd2.system.swap` está marcado como
obligatorio antes de parchear.

---

### 3.2 Hallazgos de Riesgo

#### ⚠️ MEDIO: Scripts de backup dd pueden fallar silenciosamente

**Ubicación:** Scripts `dd_backup_system`, `dd_backup_partition1`, `dd_backup_partition2`

**Problema:** Los scripts usan `status=progress` pero si dd falla parcialmente
(por ejemplo, por espacio insuficiente), el archivo de backup quedará incompleto
sin una verificación automática de integridad.

**Recomendación:** Agregar verificación de tamaño esperado vs tamaño real después
del backup.

---

#### ⚠️ BAJO: Comando `reboot` sin verificación previa

**Ubicación:** Script `reboot_mib` (líneas 553-565)

**Problema:** El comando `reboot` se ejecuta sin verificar si hay operaciones
pendientes o backups en progreso.

**Recomendación:** Agregar advertencia sobre operaciones en progreso.

---

## 4. AUDITORÍA DE GUÍA DE INSTALACIÓN (toolbox-installer.ts)

### 4.1 Evaluación General

**Estado:** ✅ SEGURO

La guía de instalación es principalmente informativa y no ejecuta comandos
automáticamente. Los comandos mostrados son para referencia del usuario.

### 4.2 Observaciones

- Los comandos son estándar y seguros para instalación de Toolbox
- No hay comandos dd de escritura automáticos
- Las advertencias están correctamente documentadas
- El script generado (`generateInstallationScript`) incluye verificaciones

---

## 5. RESUMEN DE HALLAZGOS CRÍTICOS

| Severidad | Componente | Problema | Riesgo de Bricking |
|-----------|------------|----------|--------------------|
| **CRÍTICO** | `spoofVIDPID` | No habilita modo escritura EEPROM | **ALTO** |
| **CRÍTICO** | `spoofVIDPID` | Offsets incorrectos (byte vs word) | **ALTO** |
| **CRÍTICO** | `spoofVIDPID` | Escritura byte a byte en lugar de word | **ALTO** |
| MEDIO | `detectEEPROMType` | Modifica EEPROM real para detección | MEDIO |
| MEDIO | `restoreVidPidFromBackup` | Usa `spoofVIDPID` con bugs | ALTO |
| BAJO | Scripts dd | Sin verificación de integridad post-backup | BAJO |

---

## 6. RECOMENDACIONES URGENTES

### 6.1 Corrección Inmediata Requerida: `spoofVIDPID`

La función `spoofVIDPID` debe ser **DESHABILITADA O CORREGIDA** antes de usar en producción.

**Opción A: Deshabilitar temporalmente**
```kotlin
AsyncFunction("spoofVIDPID") { targetVID: Int, targetPID: Int, magicValue: Int, promise: Promise ->
  promise.reject("DISABLED", "Función deshabilitada por auditoría de seguridad. Use writeEEPROM en su lugar.", null)
}
```

**Opción B: Corregir completamente**
Reescribir la función para:
1. Convertir byte offsets a word offsets
2. Habilitar modo escritura antes de escribir
3. Escribir words completos (16 bits)
4. Deshabilitar modo escritura al finalizar
5. Agregar delays apropiados

### 6.2 Agregar Validación de Chipset

Antes de cualquier operación de escritura, verificar que el chipset sea compatible:
- Permitir: AX88772, AX88772A, AX88772B
- Bloquear: AX88772C (tiene eFuse)
- Bloquear: Realtek (no compatible con spoofing)

### 6.3 Implementar Dry Run Obligatorio

Antes de la primera escritura real, forzar un dry run que muestre exactamente
qué bytes se modificarán y en qué offsets.

---

## 7. AUDITORÍA DE PANTALLA AUTO-SPOOF (auto-spoof.tsx)

### 7.1 Hallazgos Críticos

#### ⚠️ CRÍTICO: Pantalla usa `writeEEPROM` byte a byte con offsets de BYTE

**Ubicación:** Líneas 200-226

**Código problemático:**
```typescript
// Paso 3: Escribir VID byte bajo (0x88 = 0x01)
await usbService.writeEEPROM(0x88, '01', state.skipVerification);

// Paso 4: Escribir VID byte alto (0x89 = 0x20)
await usbService.writeEEPROM(0x89, '20', state.skipVerification);

// Paso 5: Escribir PID byte bajo (0x8A = 0x05)
await usbService.writeEEPROM(0x8A, '05', state.skipVerification);

// Paso 6: Escribir PID byte alto (0x8B = 0x3C)
await usbService.writeEEPROM(0x8B, '3C', state.skipVerification);
```

**Problema:** La pantalla pasa offsets de BYTE (0x88, 0x89, 0x8A, 0x8B) a `writeEEPROM`,
pero el módulo nativo Kotlin ya convierte internamente a word offsets diviendo por 2.

Esto significa que:
- 0x88 / 2 = 0x44 (word offset correcto para VID)
- 0x89 / 2 = 0x44 (MISMO word offset - sobrescribe!)
- 0x8A / 2 = 0x45 (word offset correcto para PID)
- 0x8B / 2 = 0x45 (MISMO word offset - sobrescribe!)

**Riesgo:** Las escrituras byte a byte NO funcionan correctamente porque ASIX
escribe words completos. Cada escritura sobrescribe el word completo.

---

### 7.2 Hallazgos Positivos

#### ✅ BUENO: Detección de eFuse antes de spoofing

**Ubicación:** Líneas 55-101

La pantalla llama a `detectEEPROMType()` antes de permitir el spoofing y
bloquea la operación si se detecta eFuse.

---

#### ✅ BUENO: Múltiples confirmaciones antes de ejecutar

**Ubicación:** Líneas 107-162

El flujo requiere 4 confirmaciones:
1. Detección de EEPROM
2. Requisitos (OTG, alimentación)
3. Advertencia crítica
4. Confirmación final

---

#### ✅ BUENO: Backup automático antes de spoofing

**Ubicación:** Línea 192

```typescript
await backupService.createBackup(device);
```

---

## 8. AUDITORÍA DE USB-SERVICE (usb-service.ts)

### 8.1 Evaluación General

**Estado:** ✅ CORRECTO

El servicio es un wrapper limpio que delega todas las operaciones al módulo
nativo. Los problemas están en el módulo Kotlin, no en este servicio.

### 8.2 Observaciones

- `writeEEPROM` pasa correctamente el `MAGIC_VALUE` al módulo nativo
- `spoofVIDPID` delega al módulo nativo (que tiene bugs)
- `detectEEPROMType` delega correctamente al módulo nativo

---

## 9. CONCLUSIONES Y PLAN DE ACCIÓN

### 9.1 Resumen de Riesgos de Bricking

| Componente | Riesgo | Acción Requerida |
|------------|--------|------------------|
| `spoofVIDPID` (Kotlin) | **ALTO** | Corregir o deshabilitar |
| `auto-spoof.tsx` | **ALTO** | Cambiar a usar `spoofVIDPID` corregido |
| `writeEEPROM` (Kotlin) | BAJO | Funciona correctamente |
| `detectEEPROMType` | MEDIO | Advertir al usuario |
| Scripts Telnet dd | BAJO | Ya son seguros (no ejecutan automáticamente) |
| Backup/Restore | BAJO | Restauración completa ya deshabilitada |

### 9.2 Acciones Inmediatas Recomendadas

1. **URGENTE:** Corregir función `spoofVIDPID` en Kotlin para:
   - Habilitar modo escritura EEPROM antes de escribir
   - Usar word offsets correctos (dividir byte offset por 2)
   - Escribir words completos (16 bits) en lugar de bytes
   - Deshabilitar modo escritura al finalizar
   - Agregar delays apropiados (1s después de enable, 50ms entre writes)

2. **URGENTE:** Modificar `auto-spoof.tsx` para usar `spoofVIDPID` corregido
   en lugar de múltiples llamadas a `writeEEPROM`.

3. **MEDIO:** Agregar validación de chipset en `spoofVIDPID` para bloquear
   automáticamente AX88772C y otros chipsets con eFuse.

4. **BAJO:** Mejorar `detectEEPROMType` para no modificar EEPROM real,
   o advertir claramente al usuario antes de ejecutar.

---

**Estado:** AUDITORÍA COMPLETADA - Se requieren correcciones críticas antes de usar en producción.
