package expo.modules.usbhost

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbDeviceConnection
import android.hardware.usb.UsbManager
import android.os.Build
import android.util.Log
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val TAG = "ExpoUsbHost"
private const val ACTION_USB_PERMISSION = "expo.modules.usbhost.USB_PERMISSION"

class ExpoUsbHostModule : Module() {
  private var usbManager: UsbManager? = null
  private var currentConnection: UsbDeviceConnection? = null
  private var currentDevice: UsbDevice? = null

  override fun definition() = ModuleDefinition {
    Name("ExpoUsbHost")

    OnCreate {
      usbManager = appContext.reactContext?.getSystemService(Context.USB_SERVICE) as? UsbManager
      Log.d(TAG, "ExpoUsbHostModule initialized")
    }

    OnDestroy {
      currentConnection?.close()
      currentConnection = null
      currentDevice = null
    }

    AsyncFunction("getDeviceList") {
      getDeviceList()
    }

    AsyncFunction("requestPermission") { deviceId: Int, promise: Promise ->
      requestPermission(deviceId, promise)
    }

    AsyncFunction("hasPermission") { deviceId: Int ->
      hasPermission(deviceId)
    }

    AsyncFunction("openDevice") { deviceId: Int ->
      openDevice(deviceId)
    }

    AsyncFunction("closeDevice") {
      closeDevice()
    }

    AsyncFunction("controlTransfer") { requestType: Int, request: Int, value: Int, index: Int, data: List<Int>, length: Int, timeout: Int ->
      controlTransfer(requestType, request, value, index, data, length, timeout)
    }
  }

  private fun getDeviceList(): List<Map<String, Any>> {
    val manager = usbManager ?: run {
      Log.e(TAG, "UsbManager not initialized")
      return emptyList()
    }

    val deviceList = manager.deviceList
    Log.d(TAG, "Found ${deviceList.size} USB devices")

    return deviceList.values.map { device ->
      mapOf(
        "deviceId" to device.deviceId,
        "vendorId" to device.vendorId,
        "productId" to device.productId,
        "deviceName" to device.deviceName,
        "manufacturerName" to (device.manufacturerName ?: ""),
        "productName" to (device.productName ?: ""),
        "serialNumber" to (device.serialNumber ?: ""),
        "deviceClass" to device.deviceClass,
        "deviceSubclass" to device.deviceSubclass,
        "interfaceCount" to device.interfaceCount
      ).also {
        Log.d(TAG, "Device: VID=0x${device.vendorId.toString(16)}, PID=0x${device.productId.toString(16)}, Name=${device.deviceName}")
      }
    }
  }

  private fun requestPermission(deviceId: Int, promise: Promise) {
    val manager = usbManager ?: run {
      promise.reject("USB_ERROR", "UsbManager not initialized", null)
      return
    }

    val device = findDeviceById(deviceId)
    if (device == null) {
      promise.reject("DEVICE_NOT_FOUND", "Device with ID $deviceId not found", null)
      return
    }

    if (manager.hasPermission(device)) {
      Log.d(TAG, "Permission already granted for device ${device.deviceName}")
      promise.resolve(true)
      return
    }

    val context = appContext.reactContext ?: run {
      promise.reject("CONTEXT_ERROR", "React context not available", null)
      return
    }

    val permissionIntent = PendingIntent.getBroadcast(
      context,
      0,
      Intent(ACTION_USB_PERMISSION),
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        PendingIntent.FLAG_MUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
      } else {
        PendingIntent.FLAG_UPDATE_CURRENT
      }
    )

    val filter = IntentFilter(ACTION_USB_PERMISSION)
    val receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        if (ACTION_USB_PERMISSION == intent.action) {
          synchronized(this) {
            val device: UsbDevice? = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
            
            if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
              Log.d(TAG, "Permission granted for device ${device?.deviceName}")
              promise.resolve(true)
            } else {
              Log.w(TAG, "Permission denied for device ${device?.deviceName}")
              promise.resolve(false)
            }
            
            context.unregisterReceiver(this)
          }
        }
      }
    }

    context.registerReceiver(receiver, filter)
    manager.requestPermission(device, permissionIntent)
    Log.d(TAG, "Requesting permission for device ${device.deviceName}")
  }

  private fun hasPermission(deviceId: Int): Boolean {
    val manager = usbManager ?: return false
    val device = findDeviceById(deviceId) ?: return false
    return manager.hasPermission(device)
  }

  private fun openDevice(deviceId: Int): Boolean {
    val manager = usbManager ?: run {
      Log.e(TAG, "UsbManager not initialized")
      return false
    }

    val device = findDeviceById(deviceId) ?: run {
      Log.e(TAG, "Device with ID $deviceId not found")
      return false
    }

    if (!manager.hasPermission(device)) {
      Log.e(TAG, "No permission to access device ${device.deviceName}")
      return false
    }

    // Close previous connection if exists
    currentConnection?.close()

    currentConnection = manager.openDevice(device)
    if (currentConnection == null) {
      Log.e(TAG, "Failed to open device ${device.deviceName}")
      return false
    }

    currentDevice = device
    Log.d(TAG, "Opened device ${device.deviceName}")
    return true
  }

  private fun closeDevice() {
    currentConnection?.close()
    currentConnection = null
    currentDevice = null
    Log.d(TAG, "Device connection closed")
  }

  private fun controlTransfer(
    requestType: Int,
    request: Int,
    value: Int,
    index: Int,
    data: List<Int>,
    length: Int,
    timeout: Int
  ): List<Int> {
    val connection = currentConnection ?: run {
      Log.e(TAG, "No device connection established")
      throw Exception("No device connection established")
    }

    val isRead = (requestType and 0x80) != 0
    val buffer = ByteArray(if (isRead) length else data.size)

    if (!isRead && data.isNotEmpty()) {
      data.forEachIndexed { i, value -> buffer[i] = value.toByte() }
    }

    val result = connection.controlTransfer(
      requestType,
      request,
      value,
      index,
      buffer,
      buffer.size,
      timeout
    )

    if (result < 0) {
      Log.e(TAG, "Control transfer failed with result $result")
      throw Exception("Control transfer failed with result $result")
    }

    Log.d(TAG, "Control transfer: type=0x${requestType.toString(16)}, req=0x${request.toString(16)}, " +
               "val=0x${value.toString(16)}, idx=0x${index.toString(16)}, len=$result")

    return if (isRead) {
      buffer.take(result).map { it.toInt() and 0xFF }
    } else {
      listOf(result)
    }
  }

  private fun findDeviceById(deviceId: Int): UsbDevice? {
    val manager = usbManager ?: return null
    return manager.deviceList.values.find { it.deviceId == deviceId }
  }
}
