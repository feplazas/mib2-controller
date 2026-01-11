package expo.modules.usbnative

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbDeviceConnection
import android.hardware.usb.UsbManager
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class UsbNativeModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exception("React context is null")

  private val usbManager: UsbManager
    get() = context.getSystemService(Context.USB_SERVICE) as UsbManager

  private var currentConnection: UsbDeviceConnection? = null
  private var currentDevice: UsbDevice? = null

  companion object {
    private const val TAG = "UsbNativeModule"
    private const val ACTION_USB_PERMISSION = "expo.modules.usbnative.USB_PERMISSION"
    
    // Control Transfer constants
    private const val USB_DIR_OUT = 0x00
    private const val USB_DIR_IN = 0x80
    private const val USB_TYPE_VENDOR = 0x40
    private const val USB_RECIP_DEVICE = 0x00
    
    // ASIX vendor commands
    private const val ASIX_CMD_READ_EEPROM = 0x04
    private const val ASIX_CMD_WRITE_EEPROM = 0x05
    
    // EEPROM offsets
    private const val EEPROM_VID_OFFSET = 0x88
    private const val EEPROM_PID_OFFSET = 0x8A
    private const val EEPROM_SIZE = 256
    
    // Magic value for write authorization
    private const val MAGIC_VALUE = 0xDEADBEEF.toInt()
  }

  override fun definition() = ModuleDefinition {
    Name("UsbNative")

    Function("getDeviceList") {
      try {
        val devices = usbManager.deviceList.values.map { device ->
          mapOf(
            "deviceId" to device.deviceId,
            "vendorId" to device.vendorId,
            "productId" to device.productId,
            "deviceName" to device.deviceName,
            "manufacturer" to (device.manufacturerName ?: "Unknown"),
            "product" to (device.productName ?: "Unknown"),
            "serialNumber" to (device.serialNumber ?: "Unknown"),
            "deviceClass" to device.deviceClass,
            "deviceSubclass" to device.deviceSubclass,
            "interfaceCount" to device.interfaceCount,
            "chipset" to identifyChipset(device.vendorId, device.productId)
          )
        }
        Log.d(TAG, "Found ${devices.size} USB devices")
        devices
      } catch (e: Exception) {
        Log.e(TAG, "Error getting device list: ${e.message}")
        emptyList<Map<String, Any>>()
      }
    }

    AsyncFunction("requestPermission") { deviceId: Int, promise: Promise ->
      try {
        val device = usbManager.deviceList.values.find { it.deviceId == deviceId }
        if (device == null) {
          promise.reject("DEVICE_NOT_FOUND", "Device with ID $deviceId not found", null)
          return@AsyncFunction
        }

        if (usbManager.hasPermission(device)) {
          Log.d(TAG, "Permission already granted for device $deviceId")
          promise.resolve(true)
          return@AsyncFunction
        }

        val permissionIntent = PendingIntent.getBroadcast(
          context,
          0,
          Intent(ACTION_USB_PERMISSION),
          PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val receiver = object : BroadcastReceiver() {
          override fun onReceive(context: Context, intent: Intent) {
            if (ACTION_USB_PERMISSION == intent.action) {
              synchronized(this) {
                val device = intent.getParcelableExtra<UsbDevice>(UsbManager.EXTRA_DEVICE)
                val granted = intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)
                
                Log.d(TAG, "Permission result: $granted for device ${device?.deviceId}")
                promise.resolve(granted)
                
                try {
                  context.unregisterReceiver(this)
                } catch (e: Exception) {
                  Log.e(TAG, "Error unregistering receiver: ${e.message}")
                }
              }
            }
          }
        }

        context.registerReceiver(receiver, IntentFilter(ACTION_USB_PERMISSION))
        usbManager.requestPermission(device, permissionIntent)
        Log.d(TAG, "Requesting permission for device $deviceId")
      } catch (e: Exception) {
        Log.e(TAG, "Error requesting permission: ${e.message}")
        promise.reject("PERMISSION_ERROR", e.message, e)
      }
    }

    AsyncFunction("openDevice") { deviceId: Int, promise: Promise ->
      try {
        val device = usbManager.deviceList.values.find { it.deviceId == deviceId }
        if (device == null) {
          promise.reject("DEVICE_NOT_FOUND", "Device with ID $deviceId not found", null)
          return@AsyncFunction
        }

        if (!usbManager.hasPermission(device)) {
          promise.reject("NO_PERMISSION", "No permission to access device", null)
          return@AsyncFunction
        }

        val connection = usbManager.openDevice(device)
        if (connection == null) {
          promise.reject("OPEN_FAILED", "Failed to open device connection", null)
          return@AsyncFunction
        }

        currentConnection = connection
        currentDevice = device
        Log.d(TAG, "Opened device $deviceId successfully")
        promise.resolve(true)
      } catch (e: Exception) {
        Log.e(TAG, "Error opening device: ${e.message}")
        promise.reject("OPEN_ERROR", e.message, e)
      }
    }

    Function("closeDevice") {
      try {
        currentConnection?.close()
        currentConnection = null
        currentDevice = null
        Log.d(TAG, "Closed device connection")
        true
      } catch (e: Exception) {
        Log.e(TAG, "Error closing device: ${e.message}")
        false
      }
    }

    AsyncFunction("readEEPROM") { offset: Int, length: Int, promise: Promise ->
      try {
        val connection = currentConnection
        if (connection == null) {
          promise.reject("NO_CONNECTION", "No active device connection", null)
          return@AsyncFunction
        }

        val data = ByteArray(length)
        var bytesRead = 0

        for (i in 0 until length) {
          val currentOffset = offset + i
          val buffer = ByteArray(2)
          
          val result = connection.controlTransfer(
            USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_READ_EEPROM,
            currentOffset,
            0,
            buffer,
            buffer.size,
            5000
          )

          if (result < 0) {
            promise.reject("READ_FAILED", "Failed to read EEPROM at offset $currentOffset", null)
            return@AsyncFunction
          }

          data[i] = buffer[0]
          bytesRead++
        }

        val hexString = data.joinToString("") { "%02X".format(it) }
        Log.d(TAG, "Read $bytesRead bytes from EEPROM at offset $offset: $hexString")
        
        promise.resolve(mapOf(
          "data" to hexString,
          "bytes" to data.map { it.toInt() and 0xFF }
        ))
      } catch (e: Exception) {
        Log.e(TAG, "Error reading EEPROM: ${e.message}")
        promise.reject("READ_ERROR", e.message, e)
      }
    }

    AsyncFunction("writeEEPROM") { offset: Int, dataHex: String, magicValue: Int, promise: Promise ->
      try {
        val connection = currentConnection
        if (connection == null) {
          promise.reject("NO_CONNECTION", "No active device connection", null)
          return@AsyncFunction
        }

        // Validate magic value
        if (magicValue != MAGIC_VALUE) {
          promise.reject("INVALID_MAGIC", "Invalid magic value for write authorization", null)
          return@AsyncFunction
        }

        // Convert hex string to bytes
        val data = dataHex.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
        var bytesWritten = 0

        for (i in data.indices) {
          val currentOffset = offset + i
          val value = data[i].toInt() and 0xFF
          
          val result = connection.controlTransfer(
            USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_WRITE_EEPROM,
            currentOffset,
            value,
            null,
            0,
            5000
          )

          if (result < 0) {
            promise.reject("WRITE_FAILED", "Failed to write EEPROM at offset $currentOffset", null)
            return@AsyncFunction
          }

          bytesWritten++
          
          // Small delay between writes
          Thread.sleep(10)
        }

        Log.d(TAG, "Wrote $bytesWritten bytes to EEPROM at offset $offset")
        promise.resolve(mapOf("bytesWritten" to bytesWritten))
      } catch (e: Exception) {
        Log.e(TAG, "Error writing EEPROM: ${e.message}")
        promise.reject("WRITE_ERROR", e.message, e)
      }
    }

    AsyncFunction("dumpEEPROM") { promise: Promise ->
      try {
        val connection = currentConnection
        if (connection == null) {
          promise.reject("NO_CONNECTION", "No active device connection", null)
          return@AsyncFunction
        }

        val data = ByteArray(EEPROM_SIZE)
        
        for (i in 0 until EEPROM_SIZE) {
          val buffer = ByteArray(2)
          
          val result = connection.controlTransfer(
            USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_READ_EEPROM,
            i,
            0,
            buffer,
            buffer.size,
            5000
          )

          if (result < 0) {
            promise.reject("DUMP_FAILED", "Failed to dump EEPROM at offset $i", null)
            return@AsyncFunction
          }

          data[i] = buffer[0]
        }

        val hexString = data.joinToString("") { "%02X".format(it) }
        Log.d(TAG, "Dumped complete EEPROM ($EEPROM_SIZE bytes)")
        
        promise.resolve(mapOf(
          "data" to hexString,
          "bytes" to data.map { it.toInt() and 0xFF },
          "size" to EEPROM_SIZE
        ))
      } catch (e: Exception) {
        Log.e(TAG, "Error dumping EEPROM: ${e.message}")
        promise.reject("DUMP_ERROR", e.message, e)
      }
    }

    AsyncFunction("spoofVIDPID") { targetVID: Int, targetPID: Int, promise: Promise ->
      try {
        val connection = currentConnection
        if (connection == null) {
          promise.reject("NO_CONNECTION", "No active device connection", null)
          return@AsyncFunction
        }

        // Read current VID/PID
        val currentVIDBytes = ByteArray(2)
        val currentPIDBytes = ByteArray(2)
        
        connection.controlTransfer(
          USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_READ_EEPROM,
          EEPROM_VID_OFFSET,
          0,
          currentVIDBytes,
          2,
          5000
        )
        
        connection.controlTransfer(
          USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_READ_EEPROM,
          EEPROM_PID_OFFSET,
          0,
          currentPIDBytes,
          2,
          5000
        )

        val currentVID = ((currentVIDBytes[1].toInt() and 0xFF) shl 8) or (currentVIDBytes[0].toInt() and 0xFF)
        val currentPID = ((currentPIDBytes[1].toInt() and 0xFF) shl 8) or (currentPIDBytes[0].toInt() and 0xFF)

        Log.d(TAG, "Current VID:PID = ${String.format("%04X:%04X", currentVID, currentPID)}")
        Log.d(TAG, "Target VID:PID = ${String.format("%04X:%04X", targetVID, targetPID)}")

        // Write new VID (little endian)
        val vidLow = targetVID and 0xFF
        val vidHigh = (targetVID shr 8) and 0xFF
        
        connection.controlTransfer(
          USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_WRITE_EEPROM,
          EEPROM_VID_OFFSET,
          vidLow,
          null,
          0,
          5000
        )
        
        Thread.sleep(10)
        
        connection.controlTransfer(
          USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_WRITE_EEPROM,
          EEPROM_VID_OFFSET + 1,
          vidHigh,
          null,
          0,
          5000
        )

        Thread.sleep(10)

        // Write new PID (little endian)
        val pidLow = targetPID and 0xFF
        val pidHigh = (targetPID shr 8) and 0xFF
        
        connection.controlTransfer(
          USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_WRITE_EEPROM,
          EEPROM_PID_OFFSET,
          pidLow,
          null,
          0,
          5000
        )
        
        Thread.sleep(10)
        
        connection.controlTransfer(
          USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_WRITE_EEPROM,
          EEPROM_PID_OFFSET + 1,
          pidHigh,
          null,
          0,
          5000
        )

        Log.d(TAG, "Spoofing complete, verifying...")

        // Verify write
        Thread.sleep(100)
        
        val verifyVIDBytes = ByteArray(2)
        val verifyPIDBytes = ByteArray(2)
        
        connection.controlTransfer(
          USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_READ_EEPROM,
          EEPROM_VID_OFFSET,
          0,
          verifyVIDBytes,
          2,
          5000
        )
        
        connection.controlTransfer(
          USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_READ_EEPROM,
          EEPROM_PID_OFFSET,
          0,
          verifyPIDBytes,
          2,
          5000
        )

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
  }

  private fun identifyChipset(vendorId: Int, productId: Int): String {
    return when (vendorId) {
      0x0B95 -> when (productId) {
        0x1780 -> "ASIX AX88178"
        0x178A -> "ASIX AX88179"
        0x7720 -> "ASIX AX88772"
        0x772A -> "ASIX AX88772A"
        0x772B -> "ASIX AX88772B"
        else -> "ASIX (Unknown model)"
      }
      0x0BDA -> "Realtek RTL8153"
      0x2001 -> "D-Link DUB-E100"
      0x0DF6 -> "Sitecom"
      0x0B95 -> "ASIX"
      else -> "Unknown"
    }
  }
}
