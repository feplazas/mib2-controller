package expo.modules.usbevents

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
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
  private var isListening = false

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
     * Eventos que se envían a JavaScript
     */
    Events("onUsbDeviceAttached", "onUsbDeviceDetached")

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
