# ADR-011: Uso de runBlocking en Expo Modules AsyncFunction

**Estado:** Aceptado  
**Fecha:** 2026-01-14  
**Autor:** Manus AI  
**Contexto de decisión:** Auditoría externa de código y error de compilación en EAS Build

---

## Contexto

Durante una auditoría externa de código, se recomendó eliminar el uso de `runBlocking` en el módulo nativo `UsbNativeModule.kt` y reemplazarlo por coroutines idiomáticas de Kotlin. La recomendación se basaba en el principio de que `runBlocking` bloquea el hilo actual y va contra las best practices de programación asíncrona moderna en Kotlin.

Sin embargo, al implementar la recomendación (reemplazar `runBlocking { delay() }` por `delay()` directo), el build de EAS falló con el siguiente error:

```
Execution failed for task ':usb-native:compileReleaseKotlin'.
> A failure occurred while executing org.jetbrains.kotlin.compilerRunner.GradleCompilerRunnerWithWorkers$GradleKotlinCompilerWorkAction
   > Compilation error. See log for more details
```

La investigación reveló que `AsyncFunction` de Expo Modules SDK **no es una función suspendible** (`suspend fun`), por lo que no puede llamar directamente a funciones suspendibles como `delay()` sin un contexto de coroutine.

---

## Decisión

**Mantener el uso de `runBlocking { delay() }` dentro de `AsyncFunction` de Expo Modules.**

Esta decisión se basa en los siguientes fundamentos técnicos:

### 1. Naturaleza de AsyncFunction en Expo Modules

`AsyncFunction` de Expo Modules SDK es un wrapper que ejecuta código en un hilo de background, pero **no es una función suspendible de Kotlin**. Su firma es:

```kotlin
AsyncFunction("functionName") { param1: Type1, param2: Type2, promise: Promise ->
    // Este bloque NO es suspendible
}
```

A diferencia de una `suspend fun` de Kotlin puro, `AsyncFunction` no puede usar `delay()`, `withContext()`, u otras funciones suspendibles directamente.

### 2. Opciones Técnicas Disponibles

Para introducir delays dentro de `AsyncFunction`, existen tres opciones:

| Opción | Ventajas | Desventajas | Veredicto |
|--------|----------|-------------|-----------|
| **`Thread.sleep()`** | Simple, funciona siempre | Bloqueante, no idiomático Kotlin | ❌ No recomendado |
| **`runBlocking { delay() }`** | Idiomático, usa coroutines, funciona | Bloquea hilo (pero ya está en background) | ✅ **Recomendado** |
| **Wrapper suspendible custom** | Más "puro" | Over-engineering, complejidad innecesaria | ❌ Excesivo para este caso |

### 3. Por Qué runBlocking es Apropiado Aquí

Aunque `runBlocking` generalmente se desaconseja en aplicaciones Android porque bloquea el hilo, **es apropiado en este contexto específico** por las siguientes razones:

**a) AsyncFunction ya ejecuta en hilo de background**

Expo Modules garantiza que `AsyncFunction` se ejecuta en un hilo worker, no en el hilo principal de UI. Por lo tanto, bloquear este hilo no afecta la responsiveness de la aplicación.

**b) Los delays son necesarios para hardware**

Los delays implementados (10ms, 100ms, 500ms) son **requisitos del hardware ASIX** para permitir que el adaptador USB-Ethernet procese comandos I2C y actualice su EEPROM. No son arbitrarios ni evitables.

**c) runBlocking es el approach oficial para este escenario**

La documentación oficial de Kotlin establece que `runBlocking` es apropiado para "bridging blocking and non-blocking worlds", que es exactamente lo que estamos haciendo: llamar código suspendible desde código no-suspendible.

### 4. Alternativa Considerada y Rechazada

Se consideró crear un wrapper suspendible:

```kotlin
private suspend fun writeEEPROMSuspend(...) {
    // Lógica con delay() directo
}

AsyncFunction("writeEEPROM") { ... ->
    runBlocking {
        writeEEPROMSuspend(...)
    }
}
```

Sin embargo, esto **no elimina `runBlocking`**, solo lo mueve a otro lugar, agregando complejidad sin beneficio real.

---

## Consecuencias

### Positivas

1. ✅ **Código compila correctamente** en EAS Build y localmente
2. ✅ **Usa coroutines de Kotlin** en lugar de `Thread.sleep()`
3. ✅ **Idiomático para el contexto** de Expo Modules
4. ✅ **No afecta performance** porque ya está en hilo de background
5. ✅ **Mantenible y claro** para futuros desarrolladores

### Negativas

1. ⚠️ **Puede confundir a auditores** que no conozcan las limitaciones de Expo Modules
2. ⚠️ **Requiere documentación** (este ADR) para justificar la decisión

### Mitigaciones

- Este ADR documenta claramente la justificación técnica
- Comentarios en el código explican por qué se usa `runBlocking`
- Tests unitarios validan que los delays funcionan correctamente

---

## Implementación

### Código Actual (Correcto)

```kotlin
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking

AsyncFunction("writeEEPROM") { offset: Int, dataHex: String, magicValue: Int, skipVerification: Boolean, promise: Promise ->
    // ... código de validación ...
    
    for (i in data.indices) {
        val currentOffset = offset + i
        val result = connection.controlTransfer(
            UsbConstants.USB_DIR_OUT or UsbConstants.USB_TYPE_VENDOR,
            0x05, // WRITE_EEPROM
            currentOffset,
            0,
            byteArrayOf(data[i]),
            1,
            5000
        )
        
        if (result < 0) {
            promise.reject("WRITE_FAILED", "Failed to write EEPROM at offset $currentOffset", null)
            return@AsyncFunction
        }
        
        // Small delay between writes (hardware requirement)
        runBlocking { delay(10) }
    }
    
    // Post-write delay for device to update (hardware requirement)
    runBlocking { delay(500) }
    
    // ... resto del código ...
}
```

### Comentarios Agregados

Se agregaron comentarios en el código para clarificar:

```kotlin
// runBlocking es apropiado aquí porque:
// 1. AsyncFunction ya ejecuta en hilo de background
// 2. El delay es requisito del hardware ASIX
// 3. AsyncFunction no es suspend fun, no puede usar delay() directo
runBlocking { delay(10) }
```

---

## Lecciones Aprendidas

1. **Las auditorías externas deben considerar el contexto del framework.** La recomendación original era válida para Kotlin puro, pero no para Expo Modules SDK.

2. **`runBlocking` no siempre es malo.** Tiene casos de uso legítimos, especialmente para bridging entre código bloqueante y no-bloqueante.

3. **La documentación es clave.** Sin este ADR, futuros desarrolladores podrían intentar "corregir" el código y causar el mismo error de compilación.

4. **Los tests de compilación son insuficientes.** El código pasaba tests locales pero fallaba en EAS Build, revelando la importancia de CI/CD completo.

---

## Referencias

- [Kotlin Coroutines Documentation - runBlocking](https://kotlinlang.org/docs/coroutines-basics.html#bridging-blocking-and-non-blocking-worlds)
- [Expo Modules API - AsyncFunction](https://docs.expo.dev/modules/module-api/#asyncfunction)
- [ASIX AX88772 Programming Guide](https://www.asix.com.tw/en/product/USBEthernet/Super-Speed_USB_Ethernet/AX88772)

---

## Historial de Cambios

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2026-01-14 | 1.0 | Decisión inicial documentada |
