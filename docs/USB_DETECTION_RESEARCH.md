# Investigación: Detección USB Dinámica en Android

## Problema Identificado

El problema actual es que la app solo detecta dispositivos USB cuando:
1. Se conecta el adaptador DESPUÉS de abrir la app
2. O cuando Android muestra el diálogo de selección de app

**El refresh manual no funciona** porque:
- `getDeviceList()` devuelve la lista correcta
- PERO los permisos se pierden si no hay un intent filter activo
- Android interpreta múltiples solicitudes de permiso como "crashes"

## Solución según Documentación Android

### Método 1: Intent Filter (actual - parcialmente implementado)
```xml
<intent-filter>
    <action android:name="android.hardware.usb.action.USB_DEVICE_ATTACHED" />
</intent-filter>
```
- Solo funciona cuando el dispositivo se conecta DESPUÉS de que la app está instalada
- Requiere reconexión física

### Método 2: Enumeración Manual (lo que necesitamos mejorar)
```kotlin
val manager = getSystemService(Context.USB_SERVICE) as UsbManager
val deviceList = manager.getDeviceList()
```
- Funciona para dispositivos YA conectados
- PERO requiere solicitar permisos explícitamente con `requestPermission()`

## Problema Real Identificado

Según StackOverflow y la documentación:

> "If the device is already attached, the event of USB_DEVICE_ATTACHED is not happening"

> "The way I would approach this is by having your app looking for the **presence** of the targeted USB device. The presence is different than the USB_DEVICE_ATTACHED which means it just got connected in the last few milliseconds."

## Solución Propuesta

1. **Al iniciar la app:** Enumerar dispositivos con `getDeviceList()` 
2. **Solicitar permisos:** Usar `requestPermission()` para cada dispositivo encontrado
3. **Persistir permisos:** Usar `android:launchMode="singleTask"` en manifest
4. **BroadcastReceiver:** Ya implementado, pero necesita mejoras

## Cambios Necesarios en el Código

### 1. UsbNativeModule.kt - Agregar función de refresh forzado
```kotlin
Function("forceRefreshDevices") {
    // Forzar re-enumeración del bus USB
    val devices = usbManager.deviceList.values.map { ... }
    devices
}
```

### 2. usb-status-context.tsx - Mejorar scanDevices
```typescript
const scanDevices = useCallback(async () => {
    // Forzar refresh del UsbManager
    const foundDevices = await usbService.scanDevices();
    
    // Para cada dispositivo, verificar si tenemos permiso
    for (const device of foundDevices) {
        if (!hasPermission(device)) {
            await requestPermission(device);
        }
    }
}, []);
```

### 3. Agregar listener de BOOT_COMPLETED (opcional)
Para detectar dispositivos conectados antes del boot.

## Conclusión

El problema NO es de código, es de **flujo de permisos**. Android requiere:
1. Enumerar dispositivos manualmente si ya están conectados
2. Solicitar permisos explícitamente para cada uno
3. El usuario debe aceptar el diálogo de permisos

La solución es mejorar el flujo de `scanDevices()` para que solicite permisos automáticamente.
