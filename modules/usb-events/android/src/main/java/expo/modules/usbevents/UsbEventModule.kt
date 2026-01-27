package expo.modules.usbevents

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.os.Build
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Módulo Expo para eventos USB en tiempo real
 * Usa BroadcastReceiver para detectar conexión/desconexión de dispositivos USB
 * sin necesidad de polling constante
 */
class UsbEventModule : Module() {
  private val TAG = "UsbEventModule"
  private var usbReceiver: BroadcastReceiver? = null
  private var permissionReceiver: BroadcastReceiver? = null
  private var isListening = false
  
  companion object {
    private const val ACTION_USB_PERMISSION = "expo.modules.usbevents.USB_PERMISSION"
  }

  override fun definition() = ModuleDefinition {
    Name("UsbEventModule")

    /**
     * Iniciar escucha de eventos USB
     * Registra BroadcastReceiver para UsbManager.ACTION_USB_DEVICE_ATTACHED y DETACHED
     */
    Function("startListening") {
      if (isListening) {
        Log.w(TAG, "Already listening to USB events")
        return@Function mapOf("success" to false, "message" to "Already listening")
      }

      try {
        val context = appContext.reactContext ?: throw Exception("React context is null")
        
        // Crear BroadcastReceiver
        usbReceiver = object : BroadcastReceiver() {
          override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
              UsbManager.ACTION_USB_DEVICE_ATTACHED -> {
                val device: UsbDevice? = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
                device?.let {
                  Log.i(TAG, "USB device attached: ${it.deviceName} (VID: 0x${it.vendorId.toString(16)}, PID: 0x${it.productId.toString(16)})")
                  
                  // Enviar evento a JavaScript
                  sendEvent("onUsbDeviceAttached", mapOf(
                    "deviceName" to it.deviceName,
                    "vendorId" to it.vendorId,
                    "productId" to it.productId,
                    "deviceClass" to it.deviceClass,
                    "deviceSubclass" to it.deviceSubclass,
                    "deviceProtocol" to it.deviceProtocol,
                    "manufacturerName" to (it.manufacturerName ?: "Unknown"),
                    "productName" to (it.productName ?: "Unknown"),
                    "serialNumber" to (it.serialNumber ?: "N/A")
                  ))
                }
              }
              
              UsbManager.ACTION_USB_DEVICE_DETACHED -> {
                val device: UsbDevice? = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
                device?.let {
                  Log.i(TAG, "USB device detached: ${it.deviceName}")
                  
                  // Enviar evento a JavaScript
                  sendEvent("onUsbDeviceDetached", mapOf(
                    "deviceName" to it.deviceName,
                    "vendorId" to it.vendorId,
                    "productId" to it.productId
                  ))
                }
              }
            }
          }
        }

        // Registrar BroadcastReceiver
        val filter = IntentFilter().apply {
          addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED)
          addAction(UsbManager.ACTION_USB_DEVICE_DETACHED)
        }
        
        context.registerReceiver(usbReceiver, filter)
        isListening = true
        
        Log.i(TAG, "Started listening to USB events")
        mapOf("success" to true, "message" to "Listening to USB events")
        
      } catch (e: Exception) {
        Log.e(TAG, "Error starting USB listener: ${e.message}", e)
        mapOf("success" to false, "message" to "Error: ${e.message}")
      }
    }

    /**
     * Detener escucha de eventos USB
     * Desregistra BroadcastReceiver
     */
    Function("stopListening") {
      if (!isListening) {
        Log.w(TAG, "Not listening to USB events")
        return@Function mapOf("success" to false, "message" to "Not listening")
      }

      try {
        val context = appContext.reactContext ?: throw Exception("React context is null")
        
        usbReceiver?.let {
          context.unregisterReceiver(it)
          usbReceiver = null
          isListening = false
          Log.i(TAG, "Stopped listening to USB events")
        }
        
        mapOf("success" to true, "message" to "Stopped listening")
        
      } catch (e: Exception) {
        Log.e(TAG, "Error stopping USB listener: ${e.message}", e)
        mapOf("success" to false, "message" to "Error: ${e.message}")
      }
    }

    /**
     * Verificar si está escuchando eventos USB
     */
    Function("isListening") {
      isListening
    }

    /**
     * Forzar refresco de dispositivos USB
     * Enumera todos los dispositivos conectados actualmente sin necesidad de reconectar
     */
    Function("forceRefreshDevices") {
      try {
        val context = appContext.reactContext ?: throw Exception("React context is null")
        val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
        
        val devices = usbManager.deviceList.values.map { device ->
          mapOf(
            "deviceName" to device.deviceName,
            "vendorId" to device.vendorId,
            "productId" to device.productId,
            "deviceClass" to device.deviceClass,
            "deviceSubclass" to device.deviceSubclass,
            "manufacturerName" to (device.manufacturerName ?: "Unknown"),
            "productName" to (device.productName ?: "Unknown"),
            "serialNumber" to (device.serialNumber ?: "N/A"),
            "hasPermission" to usbManager.hasPermission(device)
          )
        }
        
        Log.i(TAG, "Force refresh found ${devices.size} USB devices")
        mapOf("success" to true, "devices" to devices, "count" to devices.size)
        
      } catch (e: Exception) {
        Log.e(TAG, "Error force refreshing devices: ${e.message}", e)
        mapOf("success" to false, "message" to "Error: ${e.message}", "devices" to emptyList<Map<String, Any>>())
      }
    }

    /**
     * Solicitar permisos para todos los dispositivos USB conectados
     * Esto permite que el refresh funcione sin necesidad de reconectar
     */
    AsyncFunction("requestPermissionForAll") { promise: expo.modules.kotlin.Promise ->
      try {
        val context = appContext.reactContext ?: throw Exception("React context is null")
        val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
        
        val devices = usbManager.deviceList.values.toList()
        if (devices.isEmpty()) {
          promise.resolve(mapOf("success" to true, "message" to "No devices found", "granted" to 0, "total" to 0))
          return@AsyncFunction
        }
        
        var grantedCount = 0
        var pendingCount = 0
        
        for (device in devices) {
          if (usbManager.hasPermission(device)) {
            grantedCount++
            Log.d(TAG, "Permission already granted for ${device.deviceName}")
          } else {
            // Solicitar permiso para este dispositivo
            val permissionIntent = PendingIntent.getBroadcast(
              context,
              device.deviceId,
              Intent(ACTION_USB_PERMISSION).apply {
                putExtra(UsbManager.EXTRA_DEVICE, device)
              },
              PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )
            
            usbManager.requestPermission(device, permissionIntent)
            pendingCount++
            Log.d(TAG, "Requested permission for ${device.deviceName}")
          }
        }
        
        promise.resolve(mapOf(
          "success" to true,
          "message" to "Permission requests sent",
          "granted" to grantedCount,
          "pending" to pendingCount,
          "total" to devices.size
        ))
        
      } catch (e: Exception) {
        Log.e(TAG, "Error requesting permissions: ${e.message}", e)
        promise.reject("PERMISSION_ERROR", e.message, e)
      }
    }

    /**
     * Eventos que se envían a JavaScript
     */
    Events("onUsbDeviceAttached", "onUsbDeviceDetached", "onUsbPermissionResult")

    /**
     * Limpiar al destruir el módulo
     */
    OnDestroy {
      try {
        if (isListening) {
          val context = appContext.reactContext
          usbReceiver?.let {
            context?.unregisterReceiver(it)
          }
          usbReceiver = null
          isListening = false
          Log.i(TAG, "Cleaned up USB listener on destroy")
        }
      } catch (e: Exception) {
        Log.e(TAG, "Error cleaning up USB listener: ${e.message}", e)
      }
    }
  }
}
