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
      Log.d(TAG, "========================================")
      Log.d(TAG, "ExpoUsbHostModule initialized")
      Log.d(TAG, "UsbManager: ${if (usbManager != null) "OK" else "NULL"}")
      Log.d(TAG, "========================================")
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

    AsyncFunction("readEEPROM") { offset: Int, length: Int ->
      readEEPROM(offset, length)
    }

    AsyncFunction("writeEEPROM") { offset: Int, data: List<Int>, magicValue: Long ->
      writeEEPROM(offset, data, magicValue)
    }

    AsyncFunction("dumpEEPROM") {
      dumpEEPROM()
    }

    AsyncFunction("spoofVIDPID") { targetVID: Int, targetPID: Int, magicValue: Long ->
      spoofVIDPID(targetVID, targetPID, magicValue)
    }
  }

  private fun getDeviceList(): List<Map<String, Any>> {
    val manager = usbManager ?: run {
      Log.e(TAG, "❌ UsbManager not initialized")
      return emptyList()
    }

    val deviceList = manager.deviceList
    Log.d(TAG, "========================================")
    Log.d(TAG, "📱 USB DEVICE SCAN")
    Log.d(TAG, "Found ${deviceList.size} USB devices")
    Log.d(TAG, "========================================")

    if (deviceList.isEmpty()) {
      Log.w(TAG, "⚠️  No USB devices found!")
      Log.w(TAG, "Possible reasons:")
      Log.w(TAG, "  1. No USB device connected")
      Log.w(TAG, "  2. USB OTG cable not working")
      Log.w(TAG, "  3. Device taken by another app")
      Log.w(TAG, "  4. Android system has exclusive access")
    }

    val result = deviceList.values.mapIndexed { index, device ->
      Log.d(TAG, "----------------------------------------")
      Log.d(TAG, "Device #${index + 1}:")
      Log.d(TAG, "  Device ID: ${device.deviceId}")
      Log.d(TAG, "  Device Name: ${device.deviceName}")
      Log.d(TAG, "  Vendor ID: 0x${device.vendorId.toString(16).uppercase().padStart(4, '0')} (${device.vendorId})")
      Log.d(TAG, "  Product ID: 0x${device.productId.toString(16).uppercase().padStart(4, '0')} (${device.productId})")
      Log.d(TAG, "  Manufacturer: ${device.manufacturerName ?: "N/A"}")
      Log.d(TAG, "  Product: ${device.productName ?: "N/A"}")
      Log.d(TAG, "  Serial: ${device.serialNumber ?: "N/A"}")
      Log.d(TAG, "  Class: ${device.deviceClass}")
      Log.d(TAG, "  Subclass: ${device.deviceSubclass}")
      Log.d(TAG, "  Interface Count: ${device.interfaceCount}")
      Log.d(TAG, "  Has Permission: ${manager.hasPermission(device)}")
      
      // Identify common USB-Ethernet chipsets
      val chipsetInfo = identifyChipset(device.vendorId, device.productId)
      Log.d(TAG, "  Chipset: $chipsetInfo")
      
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
        "interfaceCount" to device.interfaceCount,
        "chipset" to chipsetInfo
      )
    }

    Log.d(TAG, "========================================")
    return result
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
      0x0BDA -> when (productId) {
        0x8152 -> "Realtek RTL8152"
        0x8153 -> "Realtek RTL8153"
        else -> "Realtek (Unknown model)"
      }
      0x2001 -> when (productId) {
        0x1A00 -> "D-Link DUB-E100 (Rev A)"
        0x1A02 -> "D-Link DUB-E100 (Rev B1)"
        0x3C05 -> "D-Link DUB-E100 (Rev C1)"
        else -> "D-Link (Unknown model)"
      }
      0x0424 -> "Microchip/SMSC"
      0x0B6F -> "Corega"
      0x050D -> "Belkin"
      0x13B1 -> "Linksys"
      else -> "Unknown (VID: 0x${vendorId.toString(16).uppercase()}, PID: 0x${productId.toString(16).uppercase()})"
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
      Log.d(TAG, "✅ Permission already granted for device ${device.deviceName}")
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
              Log.d(TAG, "✅ Permission granted for device ${device?.deviceName}")
              promise.resolve(true)
            } else {
              Log.w(TAG, "❌ Permission denied for device ${device?.deviceName}")
              promise.resolve(false)
            }
            
            context.unregisterReceiver(this)
          }
        }
      }
    }

    context.registerReceiver(receiver, filter)
    manager.requestPermission(device, permissionIntent)
    Log.d(TAG, "🔐 Requesting permission for device ${device.deviceName}")
  }

  private fun hasPermission(deviceId: Int): Boolean {
    val manager = usbManager ?: return false
    val device = findDeviceById(deviceId) ?: return false
    return manager.hasPermission(device)
  }

  private fun openDevice(deviceId: Int): Boolean {
    val manager = usbManager ?: run {
      Log.e(TAG, "❌ UsbManager not initialized")
      return false
    }

    val device = findDeviceById(deviceId) ?: run {
      Log.e(TAG, "❌ Device with ID $deviceId not found")
      return false
    }

    if (!manager.hasPermission(device)) {
      Log.e(TAG, "❌ No permission to access device ${device.deviceName}")
      return false
    }

    // Close previous connection if exists
    currentConnection?.close()

    currentConnection = manager.openDevice(device)
    if (currentConnection == null) {
      Log.e(TAG, "❌ Failed to open device ${device.deviceName}")
      return false
    }

    currentDevice = device
    Log.d(TAG, "✅ Opened device ${device.deviceName}")
    return true
  }

  private fun closeDevice() {
    currentConnection?.close()
    currentConnection = null
    currentDevice = null
    Log.d(TAG, "🔒 Device connection closed")
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
      Log.e(TAG, "❌ No device connection established")
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
      Log.e(TAG, "❌ Control transfer failed with result $result")
      throw Exception("Control transfer failed with result $result")
    }

    Log.d(TAG, "✅ Control transfer: type=0x${requestType.toString(16)}, req=0x${request.toString(16)}, " +
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

  // ========== EEPROM FUNCTIONS ==========

  /**
   * Read EEPROM data from ASIX adapter
   * Uses vendor-specific USB control transfer
   */
  private fun readEEPROM(offset: Int, length: Int): Map<String, Any> {
    val connection = currentConnection ?: run {
      Log.e(TAG, "❌ No device connection")
      return mapOf("success" to false, "error" to "No device connection")
    }

    val device = currentDevice ?: run {
      Log.e(TAG, "❌ No current device")
      return mapOf("success" to false, "error" to "No current device")
    }

    Log.d(TAG, "========================================")
    Log.d(TAG, "📖 READING EEPROM")
    Log.d(TAG, "Offset: 0x${offset.toString(16).uppercase()}")
    Log.d(TAG, "Length: $length bytes")
    Log.d(TAG, "========================================")

    try {
      // ASIX EEPROM Read Command
      // Request Type: 0xC0 (Device to Host, Vendor, Device)
      // Request: 0x0B (EEPROM Read)
      val buffer = ByteArray(length)
      val result = connection.controlTransfer(
        0xC0, // requestType: Device to Host, Vendor, Device
        0x0B, // request: EEPROM Read
        offset, // value: offset in EEPROM
        0, // index
        buffer,
        length,
        5000 // timeout: 5 seconds
      )

      if (result < 0) {
        Log.e(TAG, "❌ EEPROM read failed: result=$result")
        return mapOf("success" to false, "error" to "Control transfer failed")
      }

      val data = buffer.take(result).map { it.toInt() and 0xFF }
      Log.d(TAG, "✅ Read $result bytes from EEPROM")
      Log.d(TAG, "Data: ${data.joinToString(" ") { "0x${it.toString(16).uppercase().padStart(2, '0')}" }}")

      return mapOf(
        "success" to true,
        "offset" to offset,
        "length" to result,
        "data" to data
      )
    } catch (e: Exception) {
      Log.e(TAG, "❌ Exception reading EEPROM: ${e.message}")
      return mapOf("success" to false, "error" to e.message)
    }
  }

  /**
   * Write EEPROM data to ASIX adapter
   * Requires magic value 0xDEADBEEF for authorization
   */
  private fun writeEEPROM(offset: Int, data: List<Int>, magicValue: Long): Map<String, Any> {
    val connection = currentConnection ?: run {
      Log.e(TAG, "❌ No device connection")
      return mapOf("success" to false, "error" to "No device connection")
    }

    // Validate magic value
    if (magicValue != 0xDEADBEEFL) {
      Log.e(TAG, "❌ Invalid magic value: 0x${magicValue.toString(16).uppercase()}")
      Log.e(TAG, "   Expected: 0xDEADBEEF")
      return mapOf("success" to false, "error" to "Invalid magic value. Expected 0xDEADBEEF")
    }

    Log.d(TAG, "========================================")
    Log.d(TAG, "✍️  WRITING EEPROM")
    Log.d(TAG, "Offset: 0x${offset.toString(16).uppercase()}")
    Log.d(TAG, "Data: ${data.joinToString(" ") { "0x${it.toString(16).uppercase().padStart(2, '0')}" }}")
    Log.d(TAG, "Magic: 0x${magicValue.toString(16).uppercase()}")
    Log.d(TAG, "========================================")

    try {
      // Write each byte individually for maximum precision
      data.forEachIndexed { index, value ->
        val currentOffset = offset + index
        val buffer = byteArrayOf(value.toByte())
        
        // ASIX EEPROM Write Command
        // Request Type: 0x40 (Host to Device, Vendor, Device)
        // Request: 0x0C (EEPROM Write)
        val result = connection.controlTransfer(
          0x40, // requestType: Host to Device, Vendor, Device
          0x0C, // request: EEPROM Write
          currentOffset, // value: offset in EEPROM
          0, // index
          buffer,
          1,
          5000 // timeout: 5 seconds
        )

        if (result < 0) {
          Log.e(TAG, "❌ Write failed at offset 0x${currentOffset.toString(16).uppercase()}")
          return mapOf("success" to false, "error" to "Write failed at offset 0x${currentOffset.toString(16).uppercase()}")
        }

        Log.d(TAG, "✅ Wrote 0x${value.toString(16).uppercase().padStart(2, '0')} to offset 0x${currentOffset.toString(16).uppercase()}")
        
        // Small delay between writes for stability
        Thread.sleep(10)
      }

      Log.d(TAG, "========================================")
      Log.d(TAG, "✅ EEPROM WRITE COMPLETE")
      Log.d(TAG, "========================================")

      return mapOf("success" to true, "bytesWritten" to data.size)
    } catch (e: Exception) {
      Log.e(TAG, "❌ Exception writing EEPROM: ${e.message}")
      return mapOf("success" to false, "error" to e.message)
    }
  }

  /**
   * Dump entire EEPROM content (typical size: 256 bytes)
   */
  private fun dumpEEPROM(): Map<String, Any> {
    Log.d(TAG, "========================================")
    Log.d(TAG, "💾 DUMPING FULL EEPROM (256 bytes)")
    Log.d(TAG, "========================================")

    val fullData = mutableListOf<Int>()
    val chunkSize = 16 // Read 16 bytes at a time

    for (offset in 0 until 256 step chunkSize) {
      val result = readEEPROM(offset, chunkSize)
      if (result["success"] == true) {
        @Suppress("UNCHECKED_CAST")
        val data = result["data"] as? List<Int> ?: emptyList()
        fullData.addAll(data)
      } else {
        Log.e(TAG, "❌ Failed to read at offset 0x${offset.toString(16).uppercase()}")
        return mapOf("success" to false, "error" to "Failed to dump EEPROM at offset 0x${offset.toString(16).uppercase()}")
      }
    }

    // Print hex dump
    Log.d(TAG, "\n========== EEPROM HEX DUMP ==========")
    for (i in fullData.indices step 16) {
      val line = fullData.subList(i, minOf(i + 16, fullData.size))
      val hex = line.joinToString(" ") { "0x${it.toString(16).uppercase().padStart(2, '0')}" }
      Log.d(TAG, "0x${i.toString(16).uppercase().padStart(4, '0')}: $hex")
    }
    Log.d(TAG, "======================================\n")

    return mapOf(
      "success" to true,
      "data" to fullData,
      "size" to fullData.size
    )
  }

  /**
   * Spoof VID/PID to make adapter appear as D-Link DUB-E100
   * Default target: VID 0x2001, PID 0x3C05
   */
  private fun spoofVIDPID(targetVID: Int, targetPID: Int, magicValue: Long): Map<String, Any> {
    val device = currentDevice ?: run {
      Log.e(TAG, "❌ No current device")
      return mapOf("success" to false, "error" to "No current device")
    }

    Log.d(TAG, "========================================")
    Log.d(TAG, "🎭 SPOOFING VID/PID")
    Log.d(TAG, "Current VID: 0x${device.vendorId.toString(16).uppercase().padStart(4, '0')}")
    Log.d(TAG, "Current PID: 0x${device.productId.toString(16).uppercase().padStart(4, '0')}")
    Log.d(TAG, "Target VID:  0x${targetVID.toString(16).uppercase().padStart(4, '0')}")
    Log.d(TAG, "Target PID:  0x${targetPID.toString(16).uppercase().padStart(4, '0')}")
    Log.d(TAG, "========================================")

    // Step 1: Backup current EEPROM
    Log.d(TAG, "📦 Step 1: Backing up EEPROM...")
    val backup = dumpEEPROM()
    if (backup["success"] != true) {
      return mapOf("success" to false, "error" to "Failed to backup EEPROM")
    }

    // Step 2: Read current VID/PID from EEPROM
    Log.d(TAG, "📖 Step 2: Reading current VID/PID from EEPROM...")
    val vidPidData = readEEPROM(0x88, 4)
    if (vidPidData["success"] != true) {
      return mapOf("success" to false, "error" to "Failed to read VID/PID from EEPROM")
    }

    @Suppress("UNCHECKED_CAST")
    val currentData = vidPidData["data"] as? List<Int> ?: emptyList()
    Log.d(TAG, "Current EEPROM VID/PID: ${currentData.joinToString(" ") { "0x${it.toString(16).uppercase().padStart(2, '0')}" }}")

    // Step 3: Write new VID (Little Endian)
    Log.d(TAG, "✍️  Step 3: Writing new VID...")
    val vidLow = targetVID and 0xFF
    val vidHigh = (targetVID shr 8) and 0xFF
    val vidResult = writeEEPROM(0x88, listOf(vidLow, vidHigh), magicValue)
    if (vidResult["success"] != true) {
      return mapOf("success" to false, "error" to "Failed to write VID")
    }

    // Step 4: Write new PID (Little Endian)
    Log.d(TAG, "✍️  Step 4: Writing new PID...")
    val pidLow = targetPID and 0xFF
    val pidHigh = (targetPID shr 8) and 0xFF
    val pidResult = writeEEPROM(0x8A, listOf(pidLow, pidHigh), magicValue)
    if (pidResult["success"] != true) {
      return mapOf("success" to false, "error" to "Failed to write PID")
    }

    // Step 5: Verify
    Log.d(TAG, "🔍 Step 5: Verifying changes...")
    val verifyData = readEEPROM(0x88, 4)
    if (verifyData["success"] != true) {
      return mapOf("success" to false, "error" to "Failed to verify changes")
    }

    @Suppress("UNCHECKED_CAST")
    val newData = verifyData["data"] as? List<Int> ?: emptyList()
    Log.d(TAG, "New EEPROM VID/PID: ${newData.joinToString(" ") { "0x${it.toString(16).uppercase().padStart(2, '0')}" }}")

    val expectedData = listOf(vidLow, vidHigh, pidLow, pidHigh)
    val success = newData == expectedData

    Log.d(TAG, "========================================")
    if (success) {
      Log.d(TAG, "✅ SPOOFING SUCCESSFUL!")
      Log.d(TAG, "⚠️  DISCONNECT AND RECONNECT THE ADAPTER")
    } else {
      Log.e(TAG, "❌ VERIFICATION FAILED")
      Log.e(TAG, "Expected: ${expectedData.joinToString(" ") { "0x${it.toString(16).uppercase().padStart(2, '0')}" }}")
      Log.e(TAG, "Got:      ${newData.joinToString(" ") { "0x${it.toString(16).uppercase().padStart(2, '0')}" }}")
    }
    Log.d(TAG, "========================================")

    return mapOf(
      "success" to success,
      "backup" to backup["data"],
      "oldVID" to device.vendorId,
      "oldPID" to device.productId,
      "newVID" to targetVID,
      "newPID" to targetPID,
      "verified" to success
    )
  }
}
