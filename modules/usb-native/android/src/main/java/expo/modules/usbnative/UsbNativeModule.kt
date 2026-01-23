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
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking

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
    
    // ASIX vendor commands (REAL values from asix_eepromtool)
    private const val ASIX_CMD_READ_EEPROM = 0x0b
    private const val ASIX_CMD_WRITE_EEPROM = 0x0c
    private const val ASIX_CMD_WRITE_EEPROM_EN = 0x0d
    private const val ASIX_CMD_WRITE_EEPROM_DIS = 0x0e
    
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

        // ASIX reads in 16-bit words (big-endian)
        Log.d(TAG, "[ASIX] Reading $length bytes (${(length + 1) / 2} words) from offset $offset...")
        
        for (i in 0 until length step 2) {
          val wordOffset = (offset + i) / 2  // Offset in words, not bytes
          val buffer = ByteArray(2)
          
          val result = connection.controlTransfer(
            USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_READ_EEPROM,
            wordOffset,  // wValue: word offset
            0,           // wIndex: 0
            buffer,
            buffer.size,
            5000
          )

          if (result < 0) {
            promise.reject("READ_FAILED", "Failed to read EEPROM at word offset $wordOffset (byte offset ${offset + i})", null)
            return@AsyncFunction
          }

          // ASIX returns data with:
          // buffer[0] = byte at even address (data[i])
          // buffer[1] = byte at odd address (data[i+1])
          data[i] = buffer[0]
          bytesRead++
          
          if (i + 1 < length) {
            data[i + 1] = buffer[1]
            bytesRead++
          }
          
          Log.d(TAG, "[ASIX] Read word $wordOffset: byte0=0x${String.format("%02X", buffer[0].toInt() and 0xFF)}, byte1=0x${String.format("%02X", buffer[1].toInt() and 0xFF)}")
        }

        val hexString = data.joinToString("") { "%02X".format(it) }
        Log.d(TAG, "[ASIX] Read completed: $bytesRead bytes from offset $offset: $hexString")
        
        promise.resolve(mapOf(
          "data" to hexString,
          "bytes" to data.map { it.toInt() and 0xFF }
        ))
      } catch (e: Exception) {
        Log.e(TAG, "Error reading EEPROM: ${e.message}")
        promise.reject("READ_ERROR", e.message, e)
      }
    }

    AsyncFunction("writeEEPROM") { offset: Int, dataHex: String, magicValue: Int, skipVerification: Boolean, promise: Promise ->
      try {
        val connection = currentConnection
        if (connection == null) {
          promise.reject("NO_CONNECTION", "No active device connection", null)
          return@AsyncFunction
        }

        // Log magic value for debugging (no validation - accept any non-zero value as authorization)
        // The magic value parameter serves as a safety confirmation from the app
        Log.d(TAG, "Write authorization received with magic value: $magicValue (hex: 0x${magicValue.toString(16)})")
        
        if (magicValue == 0) {
          Log.e(TAG, "Magic value is zero - write not authorized")
          promise.reject("INVALID_MAGIC", "Write operation requires non-zero authorization value", null)
          return@AsyncFunction
        }

        // Convert hex string to bytes (pairs of hex digits)
        val data = dataHex.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
        var bytesWritten = 0

        // STEP 1: Enable EEPROM writing (REAL ASIX sequence)
        Log.d(TAG, "[ASIX] Step 1: Enabling EEPROM write mode...")
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
        
        // Wait 1 second after enable (as per asix_eepromtool specification)
        Log.d(TAG, "[ASIX] Waiting 1000ms after enable...")
        runBlocking { delay(1000) }
        
        // STEP 2: Write data word by word (16-bit words)
        Log.d(TAG, "[ASIX] Step 2: Writing ${data.size} bytes (${data.size/2} words)...")
        
        // Process data in pairs (words)
        var wordIndex = 0
        for (i in data.indices step 2) {
          // ASIX EEPROM word format in wIndex:
          // The ASIX USB protocol expects the word in wIndex with:
          // - bits 0-7 (low byte of wIndex): first byte from memory (data[i])
          // - bits 8-15 (high byte of wIndex): second byte from memory (data[i+1])
          // This matches how the EEPROM stores data: byte at even address in low bits
          val byte0 = data[i].toInt() and 0xFF
          val byte1 = if (i + 1 < data.size) (data[i + 1].toInt() and 0xFF) else 0
          // wIndex format: byte1 in high bits, byte0 in low bits
          // This is how ASIX expects it - NOT swapped
          val word = (byte1 shl 8) or byte0
          
          val wordOffset = (offset + i) / 2  // Offset in words, not bytes
          
          Log.d(TAG, "[ASIX] Writing word $wordIndex at offset $wordOffset: wIndex=0x${String.format("%04X", word)} (byte0: 0x${String.format("%02X", byte0)}, byte1: 0x${String.format("%02X", byte1)})")
          
          val result = connection.controlTransfer(
            USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_WRITE_EEPROM,
            wordOffset,      // wValue: word offset (0-based)
            word,            // wIndex: data word (byte1<<8 | byte0)
            null,
            0,
            5000
          )

          if (result < 0) {
            // Try to disable write mode before failing
            connection.controlTransfer(
              USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
              ASIX_CMD_WRITE_EEPROM_DIS,
              0,
              0,
              null,
              0,
              5000
            )
            promise.reject("WRITE_FAILED", "Failed to write EEPROM at word offset $wordOffset", null)
            return@AsyncFunction
          }

          bytesWritten += if (i + 1 < data.size) 2 else 1
          wordIndex++
          
          // Delay 50ms between writes (as per asix_eepromtool specification)
          runBlocking { delay(50) }
        }
        
        // STEP 3: Disable EEPROM writing
        Log.d(TAG, "[ASIX] Step 3: Disabling EEPROM write mode...")
        val disableResult = connection.controlTransfer(
          USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_WRITE_EEPROM_DIS,
          0,
          0,
          null,
          0,
          5000
        )
        
        if (disableResult < 0) {
          Log.w(TAG, "[ASIX] Warning: Failed to disable EEPROM write mode (non-fatal)")
        }
        
        // Wait 500ms for device to stabilize
        Log.d(TAG, "[ASIX] Write sequence completed. Wrote $bytesWritten bytes. Waiting 500ms for device to stabilize...")
        runBlocking { delay(500) }
        Log.d(TAG, "[ASIX] Device ready for verification")
        
        // Verificación opcional (puede omitirse para adaptadores con protección de escritura)
        if (!skipVerification) {
          Log.d(TAG, "Starting verification of written data...")
          val verifyData = ByteArray(data.size)
          
          // Read back data word by word (same as write - using word offsets)
          for (i in data.indices step 2) {
            val wordOffset = (offset + i) / 2  // Word offset, same as in write
            val buffer = ByteArray(2)
            
            val result = connection.controlTransfer(
              USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
              ASIX_CMD_READ_EEPROM,
              wordOffset,  // Use word offset, not byte offset
              0,
              buffer,
              buffer.size,
              5000
            )

            if (result < 0) {
              Log.e(TAG, "Verification read failed at word offset $wordOffset (byte offset ${offset + i})")
              promise.reject("VERIFY_FAILED", "Failed to read EEPROM for verification at word offset $wordOffset", null)
              return@AsyncFunction
            }

            // ASIX returns data in the same format as write:
            // buffer[0] = byte at even address (data[i])
            // buffer[1] = byte at odd address (data[i+1])
            verifyData[i] = buffer[0]
            if (i + 1 < data.size) {
              verifyData[i + 1] = buffer[1]
            }
            
            Log.d(TAG, "[ASIX] Verify read word $wordOffset: byte0=0x${String.format("%02X", buffer[0].toInt() and 0xFF)}, byte1=0x${String.format("%02X", buffer[1].toInt() and 0xFF)}")
          }
          
          // Comparar bytes escritos vs leídos
          val mismatchPositions = mutableListOf<Int>()
          for (i in data.indices) {
            if (data[i] != verifyData[i]) {
              mismatchPositions.add(i)
              Log.w(TAG, "Mismatch at offset ${offset + i}: wrote 0x${String.format("%02X", data[i].toInt() and 0xFF)}, read 0x${String.format("%02X", verifyData[i].toInt() and 0xFF)}")
            }
          }
          
          if (mismatchPositions.isNotEmpty()) {
            val writtenHex = data.joinToString("") { "%02X".format(it) }
            val readHex = verifyData.joinToString("") { "%02X".format(it) }
            Log.e(TAG, "Verification failed: ${mismatchPositions.size} bytes don't match")
            Log.e(TAG, "Written: $writtenHex")
            Log.e(TAG, "Read back: $readHex")
            Log.e(TAG, "Mismatch positions: ${mismatchPositions.joinToString(", ")}")
            
            promise.reject(
              "VERIFY_FAILED",
              "Verification failed: ${mismatchPositions.size} bytes don't match at positions ${mismatchPositions.joinToString(", ")}",
              null
            )
            return@AsyncFunction
          }
          
          Log.d(TAG, "Verification successful: all $bytesWritten bytes match")
        } else {
          Log.w(TAG, "Verification skipped as requested (force mode)")
        }
        
        promise.resolve(mapOf("bytesWritten" to bytesWritten, "verified" to !skipVerification))
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
        
        Log.d(TAG, "[ASIX] Dumping complete EEPROM ($EEPROM_SIZE bytes = ${EEPROM_SIZE / 2} words)...")
        
        // Read EEPROM word by word (16-bit words)
        for (i in 0 until EEPROM_SIZE step 2) {
          val wordOffset = i / 2
          val buffer = ByteArray(2)
          
          val result = connection.controlTransfer(
            USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_READ_EEPROM,
            wordOffset,  // wValue: word offset
            0,           // wIndex: 0
            buffer,
            buffer.size,
            5000
          )

          if (result < 0) {
            promise.reject("DUMP_FAILED", "Failed to dump EEPROM at word offset $wordOffset (byte offset $i)", null)
            return@AsyncFunction
          }

          // ASIX returns data in big-endian format
          data[i] = buffer[0]      // High byte
          data[i + 1] = buffer[1]  // Low byte
        }

        val hexString = data.joinToString("") { "%02X".format(it) }
        Log.d(TAG, "[ASIX] Dump completed: $EEPROM_SIZE bytes")
        
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

    AsyncFunction("detectEEPROMType") { promise: Promise ->
      try {
        val connection = currentConnection
        val device = currentDevice
        
        if (connection == null || device == null) {
          promise.reject("NO_DEVICE", "No device is currently open", null)
          return@AsyncFunction
        }

        Log.d(TAG, "Starting REAL EEPROM vs eFuse detection for device ${device.deviceName}")

        // Paso 1: Intentar lectura REAL de EEPROM
        val testReadBytes = ByteArray(2)
        val readResult = connection.controlTransfer(
          USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_READ_EEPROM,
          0x00, // Offset 0 (seguro para lectura)
          0,
          testReadBytes,
          2,
          5000
        )

        if (readResult < 0) {
          Log.w(TAG, "EEPROM read failed - device may not support EEPROM access")
          promise.resolve(mapOf(
            "type" to "unknown",
            "writable" to false,
            "reason" to "Read operation failed"
          ))
          return@AsyncFunction
        }

        Log.d(TAG, "EEPROM read successful: ${testReadBytes.joinToString("") { "%02X".format(it) }}")

        // Paso 2: Intentar escritura de prueba REAL en offset seguro (word 0x7F = bytes 0xFE-0xFF)
        val testWordOffset = 0x7F  // Last word in 256-byte EEPROM
        val originalWord = ByteArray(2)
        
        // Leer word original
        val readOriginalResult = connection.controlTransfer(
          USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_READ_EEPROM,
          testWordOffset,
          0,
          originalWord,
          2,
          5000
        )

        if (readOriginalResult < 0) {
          Log.w(TAG, "Failed to read test word - assuming eFuse")
          promise.resolve(mapOf(
            "type" to "efuse",
            "writable" to false,
            "reason" to "Cannot read test word offset"
          ))
          return@AsyncFunction
        }

        val originalValue = ((originalWord[0].toInt() and 0xFF) shl 8) or (originalWord[1].toInt() and 0xFF)
        val testValue = (originalValue xor 0xFFFF) and 0xFFFF // Invertir bits para prueba

        Log.d(TAG, "Attempting REAL write test at word offset 0x${String.format("%02X", testWordOffset)}: 0x${String.format("%04X", originalValue)} -> 0x${String.format("%04X", testValue)}")

        // Enable EEPROM writing
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
          Log.w(TAG, "Failed to enable EEPROM write mode - eFuse detected")
          promise.resolve(mapOf(
            "type" to "efuse",
            "writable" to false,
            "reason" to "Cannot enable write mode (eFuse protection)"
          ))
          return@AsyncFunction
        }
        
        runBlocking { delay(1000) }  // Wait 1 second after enable
        
        // Intentar escritura REAL
        val writeResult = connection.controlTransfer(
          USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_WRITE_EEPROM,
          testWordOffset,
          testValue,
          null,
          0,
          5000
        )

        if (writeResult < 0) {
          Log.w(TAG, "Write operation failed - eFuse detected")
          promise.resolve(mapOf(
            "type" to "efuse",
            "writable" to false,
            "reason" to "Write operation rejected by hardware"
          ))
          return@AsyncFunction
        }

        // Esperar a que el hardware procese la escritura
        runBlocking { delay(50) }
        
        // Disable EEPROM writing
        connection.controlTransfer(
          USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_WRITE_EEPROM_DIS,
          0,
          0,
          null,
          0,
          5000
        )
        
        runBlocking { delay(500) }  // Wait for device to stabilize

        // Verificar si la escritura fue exitosa
        val verifyWord = ByteArray(2)
        val verifyResult = connection.controlTransfer(
          USB_DIR_IN or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
          ASIX_CMD_READ_EEPROM,
          testWordOffset,
          0,
          verifyWord,
          2,
          5000
        )

        if (verifyResult < 0) {
          Log.w(TAG, "Verification read failed")
          promise.resolve(mapOf(
            "type" to "unknown",
            "writable" to false,
            "reason" to "Cannot verify write"
          ))
          return@AsyncFunction
        }

        val verifiedValue = ((verifyWord[0].toInt() and 0xFF) shl 8) or (verifyWord[1].toInt() and 0xFF)
        val writeSuccessful = (verifiedValue == testValue)

        Log.d(TAG, "Write verification: expected 0x${String.format("%04X", testValue)}, got 0x${String.format("%04X", verifiedValue)}, success: $writeSuccessful")

        // Restaurar valor original si la escritura fue exitosa
        if (writeSuccessful) {
          Log.d(TAG, "Restoring original value 0x${String.format("%04X", originalValue)}")
          
          // Enable write mode again
          connection.controlTransfer(
            USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_WRITE_EEPROM_EN,
            0,
            0,
            null,
            0,
            5000
          )
          runBlocking { delay(1000) }
          
          // Restore original value
          connection.controlTransfer(
            USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_WRITE_EEPROM,
            testWordOffset,
            originalValue,
            null,
            0,
            5000
          )
          runBlocking { delay(50) }
          
          // Disable write mode
          connection.controlTransfer(
            USB_DIR_OUT or USB_TYPE_VENDOR or USB_RECIP_DEVICE,
            ASIX_CMD_WRITE_EEPROM_DIS,
            0,
            0,
            null,
            0,
            5000
          )
          runBlocking { delay(500) }
        }

        val eepromType = if (writeSuccessful) "external_eeprom" else "efuse"
        Log.d(TAG, "REAL detection complete: $eepromType (writable: $writeSuccessful)")

        promise.resolve(mapOf(
          "type" to eepromType,
          "writable" to writeSuccessful,
          "reason" to if (writeSuccessful) "External EEPROM detected - safe for spoofing" else "eFuse detected - spoofing blocked"
        ))
      } catch (e: Exception) {
        Log.e(TAG, "Error detecting EEPROM type: ${e.message}")
        promise.reject("DETECTION_ERROR", e.message, e)
      }
    }

    // NOTA: La función spoofVIDPID fue ELIMINADA por seguridad.
    // Esta función tenía múltiples errores:
    // 1. No habilitaba modo de escritura EEPROM (comando 0x0d)
    // 2. Usaba byte offsets en lugar de word offsets
    // 3. Escribía bytes individuales en lugar de words de 16 bits
    // 4. No deshabilitaba modo de escritura después (comando 0x0e)
    //
    // En su lugar, usar writeEEPROM() que SÍ implementa correctamente:
    // - Habilitación de modo escritura
    // - Escritura de words completos
    // - Deshabilitación de modo escritura
    // - Verificación post-escritura
  }

  private fun identifyChipset(vendorId: Int, productId: Int): String {
    return when (vendorId) {
      // ASIX Electronics (0x0B95) - Compatible con spoofing MIB2
      0x0B95 -> when (productId) {
        0x1720 -> "ASIX AX88172"
        0x1780 -> "ASIX AX88178"
        0x178A -> "ASIX AX88179"
        0x1790 -> "ASIX AX88179A"
        0x7720 -> "ASIX AX88772"
        0x772A -> "ASIX AX88772A"
        0x772B -> "ASIX AX88772B"
        0x7E2B -> "ASIX AX88772C"
        else -> "ASIX (Unknown model)"
      }
      
      // Realtek (0x0BDA) - NO compatible con spoofing en Android
      0x0BDA -> when (productId) {
        0x8150 -> "Realtek RTL8150"
        0x8152 -> "Realtek RTL8152"
        0x8153 -> "Realtek RTL8153"
        0x8156 -> "Realtek RTL8156"
        else -> "Realtek (Unknown model)"
      }
      
      // D-Link (0x2001) - Objetivo de spoofing
      0x2001 -> when (productId) {
        0x1A02 -> "D-Link DUB-E100 v2"
        0x3C05 -> "D-Link DUB-E100"
        else -> "D-Link (Unknown model)"
      }
      
      // TP-Link (0x2357)
      0x2357 -> when (productId) {
        0x0601 -> "TP-Link UE300"
        0x0602 -> "TP-Link UE200"
        else -> "TP-Link (Unknown model)"
      }
      
      // Apple (0x05AC)
      0x05AC -> when (productId) {
        0x1402 -> "Apple USB Ethernet"
        else -> "Apple (Unknown model)"
      }
      
      // Belkin (0x050D)
      0x050D -> when (productId) {
        0x0121 -> "Belkin USB-C to Ethernet"
        else -> "Belkin (Unknown model)"
      }
      
      // Microchip (0x0424)
      0x0424 -> when (productId) {
        0xEC00 -> "Microchip LAN9512/LAN9514"
        0x7500 -> "Microchip LAN7500"
        0x7800 -> "Microchip LAN7800"
        else -> "Microchip (Unknown model)"
      }
      
      // Broadcom (0x0A5C)
      0x0A5C -> when (productId) {
        0x6412 -> "Broadcom BCM5701"
        else -> "Broadcom (Unknown model)"
      }
      
      // Davicom (0x0FE6)
      0x0FE6 -> when (productId) {
        0x9700 -> "Davicom DM9601"
        else -> "Davicom (Unknown model)"
      }
      
      // Sitecom (0x0DF6)
      0x0DF6 -> when (productId) {
        else -> "Sitecom (Unknown model)"
      }
      
      else -> "Unknown"
    }
  }
}
