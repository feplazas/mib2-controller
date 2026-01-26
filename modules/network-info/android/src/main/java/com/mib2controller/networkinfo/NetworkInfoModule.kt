package com.mib2controller.networkinfo

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import java.net.NetworkInterface
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.Socket
import kotlinx.coroutines.*
import java.io.BufferedReader
import java.io.FileReader
import java.io.InputStreamReader

class NetworkInfoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NetworkInfoModule"
    }

    /**
     * Ping ICMP nativo usando InetAddress.isReachable()
     * Este método usa ICMP cuando tiene permisos de root, o TCP echo (puerto 7) como fallback
     */
    @ReactMethod
    fun ping(host: String, timeoutMs: Int, promise: Promise) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                val startTime = System.currentTimeMillis()
                val inetAddress = InetAddress.getByName(host)
                val isReachable = inetAddress.isReachable(timeoutMs)
                val endTime = System.currentTimeMillis()
                val responseTime = endTime - startTime

                val result = Arguments.createMap()
                result.putString("host", host)
                result.putString("ip", inetAddress.hostAddress)
                result.putBoolean("success", isReachable)
                result.putDouble("responseTime", responseTime.toDouble())
                result.putString("method", "icmp")
                
                if (!isReachable) {
                    result.putString("error", "Host unreachable")
                }

                promise.resolve(result)
            } catch (e: Exception) {
                val result = Arguments.createMap()
                result.putString("host", host)
                result.putBoolean("success", false)
                result.putDouble("responseTime", -1.0)
                result.putString("method", "icmp")
                result.putString("error", e.message ?: "Unknown error")
                promise.resolve(result)
            }
        }
    }

    /**
     * Ping TCP - intenta conectar a un puerto específico
     * Más confiable que ICMP en Android ya que no requiere permisos especiales
     */
    @ReactMethod
    fun tcpPing(host: String, port: Int, timeoutMs: Int, promise: Promise) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                val startTime = System.currentTimeMillis()
                val socket = Socket()
                var success = false
                var errorMsg: String? = null

                try {
                    socket.connect(InetSocketAddress(host, port), timeoutMs)
                    success = true
                } catch (e: Exception) {
                    // Si la conexión es rechazada, el host está activo pero el puerto cerrado
                    if (e.message?.contains("Connection refused") == true) {
                        success = true // Host está activo
                        errorMsg = "Port closed"
                    } else {
                        errorMsg = e.message
                    }
                } finally {
                    try {
                        socket.close()
                    } catch (e: Exception) {
                        // Ignorar errores al cerrar
                    }
                }

                val endTime = System.currentTimeMillis()
                val responseTime = endTime - startTime

                val result = Arguments.createMap()
                result.putString("host", host)
                result.putInt("port", port)
                result.putBoolean("success", success)
                result.putDouble("responseTime", responseTime.toDouble())
                result.putString("method", "tcp")
                
                if (errorMsg != null) {
                    result.putString("error", errorMsg)
                }

                promise.resolve(result)
            } catch (e: Exception) {
                val result = Arguments.createMap()
                result.putString("host", host)
                result.putInt("port", port)
                result.putBoolean("success", false)
                result.putDouble("responseTime", -1.0)
                result.putString("method", "tcp")
                result.putString("error", e.message ?: "Unknown error")
                promise.resolve(result)
            }
        }
    }

    /**
     * Escanea múltiples puertos en un host
     */
    @ReactMethod
    fun scanPorts(host: String, ports: com.facebook.react.bridge.ReadableArray, timeoutMs: Int, promise: Promise) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                val results = Arguments.createArray()
                val portList = mutableListOf<Int>()
                
                for (i in 0 until ports.size()) {
                    portList.add(ports.getInt(i))
                }

                for (port in portList) {
                    val startTime = System.currentTimeMillis()
                    val socket = Socket()
                    var status = "timeout"

                    try {
                        socket.connect(InetSocketAddress(host, port), timeoutMs)
                        status = "open"
                    } catch (e: Exception) {
                        if (e.message?.contains("Connection refused") == true) {
                            status = "closed"
                        }
                    } finally {
                        try {
                            socket.close()
                        } catch (e: Exception) {
                            // Ignorar
                        }
                    }

                    val endTime = System.currentTimeMillis()
                    val responseTime = endTime - startTime

                    val portResult = Arguments.createMap()
                    portResult.putString("host", host)
                    portResult.putInt("port", port)
                    portResult.putString("status", status)
                    portResult.putDouble("responseTime", responseTime.toDouble())
                    results.pushMap(portResult)
                }

                promise.resolve(results)
            } catch (e: Exception) {
                promise.reject("SCAN_ERROR", "Error scanning ports: ${e.message}", e)
            }
        }
    }

    /**
     * Escaneo ARP - Lee la tabla ARP del sistema para descubrir dispositivos
     * Funciona incluso cuando los puertos están cerrados
     */
    @ReactMethod
    fun getArpTable(promise: Promise) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                val results = Arguments.createArray()
                
                // Leer /proc/net/arp que contiene la tabla ARP del kernel
                val arpFile = FileReader("/proc/net/arp")
                val reader = BufferedReader(arpFile)
                
                var line: String?
                var isFirstLine = true
                
                while (reader.readLine().also { line = it } != null) {
                    // Saltar la primera línea (header)
                    if (isFirstLine) {
                        isFirstLine = false
                        continue
                    }
                    
                    // Formato: IP address  HW type  Flags  HW address  Mask  Device
                    val parts = line!!.trim().split("\\s+".toRegex())
                    if (parts.size >= 6) {
                        val ip = parts[0]
                        val hwType = parts[1]
                        val flags = parts[2]
                        val mac = parts[3]
                        val device = parts[5]
                        
                        // Solo incluir entradas válidas (flags != 0x0)
                        if (flags != "0x0" && mac != "00:00:00:00:00:00") {
                            val entry = Arguments.createMap()
                            entry.putString("ip", ip)
                            entry.putString("mac", mac)
                            entry.putString("device", device)
                            entry.putString("hwType", hwType)
                            entry.putString("flags", flags)
                            entry.putBoolean("isComplete", flags == "0x2")
                            results.pushMap(entry)
                        }
                    }
                }
                
                reader.close()
                promise.resolve(results)
            } catch (e: Exception) {
                promise.reject("ARP_ERROR", "Error reading ARP table: ${e.message}", e)
            }
        }
    }

    /**
     * Escaneo ARP activo - Hace ping a un rango de IPs para poblar la tabla ARP
     * y luego lee la tabla ARP para descubrir dispositivos
     */
    @ReactMethod
    fun arpScan(baseIp: String, startHost: Int, endHost: Int, timeoutMs: Int, promise: Promise) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                val results = Arguments.createArray()
                
                // Extraer los primeros 3 octetos de la IP base
                val ipParts = baseIp.split(".")
                if (ipParts.size < 3) {
                    promise.reject("INVALID_IP", "Invalid base IP format")
                    return@launch
                }
                val subnet = "${ipParts[0]}.${ipParts[1]}.${ipParts[2]}"
                
                // Hacer ping a cada IP en el rango para poblar la tabla ARP
                val jobs = mutableListOf<Deferred<Pair<String, Boolean>>>()
                
                for (host in startHost..endHost) {
                    val ip = "$subnet.$host"
                    jobs.add(async {
                        try {
                            val inetAddress = InetAddress.getByName(ip)
                            val isReachable = inetAddress.isReachable(timeoutMs)
                            Pair(ip, isReachable)
                        } catch (e: Exception) {
                            Pair(ip, false)
                        }
                    })
                }
                
                // Esperar a que todos los pings terminen
                val pingResults = jobs.awaitAll()
                
                // Ahora leer la tabla ARP actualizada
                delay(100) // Pequeño delay para que el kernel actualice la tabla
                
                val arpEntries = mutableMapOf<String, String>()
                try {
                    val arpFile = FileReader("/proc/net/arp")
                    val reader = BufferedReader(arpFile)
                    
                    var line: String?
                    var isFirstLine = true
                    
                    while (reader.readLine().also { line = it } != null) {
                        if (isFirstLine) {
                            isFirstLine = false
                            continue
                        }
                        
                        val parts = line!!.trim().split("\\s+".toRegex())
                        if (parts.size >= 6) {
                            val ip = parts[0]
                            val mac = parts[3]
                            val flags = parts[2]
                            
                            if (flags != "0x0" && mac != "00:00:00:00:00:00") {
                                arpEntries[ip] = mac
                            }
                        }
                    }
                    reader.close()
                } catch (e: Exception) {
                    // Continuar sin tabla ARP si falla
                }
                
                // Combinar resultados de ping con entradas ARP
                for ((ip, reachable) in pingResults) {
                    val mac = arpEntries[ip]
                    if (reachable || mac != null) {
                        val entry = Arguments.createMap()
                        entry.putString("ip", ip)
                        entry.putString("mac", mac ?: "unknown")
                        entry.putBoolean("reachable", reachable)
                        entry.putBoolean("inArpTable", mac != null)
                        
                        // Detectar si podría ser MIB2 basado en el vendor MAC
                        val isMIB2Candidate = mac?.let { isMIB2MacVendor(it) } ?: false
                        entry.putBoolean("isMIB2Candidate", isMIB2Candidate)
                        
                        results.pushMap(entry)
                    }
                }
                
                promise.resolve(results)
            } catch (e: Exception) {
                promise.reject("ARP_SCAN_ERROR", "Error during ARP scan: ${e.message}", e)
            }
        }
    }

    /**
     * Verifica si una dirección MAC pertenece a un vendor conocido de MIB2
     * (Technisat, Preh, etc.)
     */
    private fun isMIB2MacVendor(mac: String): Boolean {
        // Prefijos MAC conocidos de fabricantes de MIB2
        val mib2Vendors = listOf(
            "00:1e:42",  // Technisat
            "00:17:ca",  // Preh
            "00:0e:8e",  // Preh (alternativo)
            "00:1a:37",  // Harman
            "00:26:7e",  // Harman (alternativo)
            "00:0d:f0",  // Continental
            "00:1c:26",  // Continental (alternativo)
            "00:25:ca",  // Bosch
            "00:0e:6a",  // Bosch (alternativo)
            "b8:27:eb",  // Raspberry Pi (para testing)
            "dc:a6:32"   // Raspberry Pi (alternativo)
        )
        
        val macLower = mac.lowercase()
        return mib2Vendors.any { macLower.startsWith(it) }
    }

    /**
     * Escaneo rápido de red usando ARP - Escanea IPs comunes de MIB2
     */
    @ReactMethod
    fun quickArpScan(timeoutMs: Int, promise: Promise) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                val results = Arguments.createArray()
                
                // IPs comunes donde se encuentra MIB2
                val targetIPs = listOf(
                    "192.168.1.1",
                    "192.168.1.4",
                    "192.168.1.10",
                    "192.168.1.100",
                    "192.168.0.1",
                    "192.168.0.4",
                    "10.200.1.1",
                    "10.0.0.1"
                )
                
                // Hacer ping a todas las IPs en paralelo
                val jobs = targetIPs.map { ip ->
                    async {
                        try {
                            val startTime = System.currentTimeMillis()
                            val inetAddress = InetAddress.getByName(ip)
                            val isReachable = inetAddress.isReachable(timeoutMs)
                            val responseTime = System.currentTimeMillis() - startTime
                            Triple(ip, isReachable, responseTime)
                        } catch (e: Exception) {
                            Triple(ip, false, -1L)
                        }
                    }
                }
                
                val pingResults = jobs.awaitAll()
                
                // Leer tabla ARP
                delay(50)
                val arpEntries = mutableMapOf<String, String>()
                try {
                    val reader = BufferedReader(FileReader("/proc/net/arp"))
                    var line: String?
                    var isFirstLine = true
                    
                    while (reader.readLine().also { line = it } != null) {
                        if (isFirstLine) {
                            isFirstLine = false
                            continue
                        }
                        val parts = line!!.trim().split("\\s+".toRegex())
                        if (parts.size >= 6 && parts[2] != "0x0" && parts[3] != "00:00:00:00:00:00") {
                            arpEntries[parts[0]] = parts[3]
                        }
                    }
                    reader.close()
                } catch (e: Exception) { }
                
                // Construir resultados
                for ((ip, reachable, responseTime) in pingResults) {
                    val mac = arpEntries[ip]
                    if (reachable || mac != null) {
                        val entry = Arguments.createMap()
                        entry.putString("ip", ip)
                        entry.putString("mac", mac ?: "unknown")
                        entry.putBoolean("reachable", reachable)
                        entry.putDouble("responseTime", responseTime.toDouble())
                        entry.putBoolean("isMIB2Candidate", mac?.let { isMIB2MacVendor(it) } ?: false)
                        
                        // Verificar si tiene puertos MIB2 abiertos
                        if (reachable) {
                            val hasTelnet = checkPort(ip, 23, 1000)
                            val hasAltTelnet = checkPort(ip, 123, 1000)
                            entry.putBoolean("hasTelnet", hasTelnet)
                            entry.putBoolean("hasAltTelnet", hasAltTelnet)
                            entry.putBoolean("isMIB2Likely", hasTelnet || hasAltTelnet)
                        } else {
                            entry.putBoolean("hasTelnet", false)
                            entry.putBoolean("hasAltTelnet", false)
                            entry.putBoolean("isMIB2Likely", false)
                        }
                        
                        results.pushMap(entry)
                    }
                }
                
                promise.resolve(results)
            } catch (e: Exception) {
                promise.reject("QUICK_ARP_ERROR", "Error during quick ARP scan: ${e.message}", e)
            }
        }
    }

    /**
     * Verifica si un puerto está abierto
     */
    private fun checkPort(host: String, port: Int, timeoutMs: Int): Boolean {
        return try {
            val socket = Socket()
            socket.connect(InetSocketAddress(host, port), timeoutMs)
            socket.close()
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Busca dispositivos MIB2 en IPs comunes
     */
    @ReactMethod
    fun findMIB2(timeoutMs: Int, promise: Promise) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                val commonIPs = listOf(
                    "192.168.1.1",
                    "192.168.1.4",
                    "192.168.1.10",
                    "192.168.0.1",
                    "192.168.0.4",
                    "10.200.1.1"
                )
                val telnetPorts = listOf(23, 123)
                val results = Arguments.createArray()

                for (ip in commonIPs) {
                    for (port in telnetPorts) {
                        val socket = Socket()
                        try {
                            val startTime = System.currentTimeMillis()
                            socket.connect(InetSocketAddress(ip, port), timeoutMs)
                            val endTime = System.currentTimeMillis()
                            
                            val result = Arguments.createMap()
                            result.putString("ip", ip)
                            result.putInt("port", port)
                            result.putBoolean("found", true)
                            result.putDouble("responseTime", (endTime - startTime).toDouble())
                            results.pushMap(result)
                            
                            socket.close()
                            break // Si encontramos en un puerto, no probar el otro
                        } catch (e: Exception) {
                            // No encontrado en este IP:puerto
                        } finally {
                            try {
                                socket.close()
                            } catch (e: Exception) {
                                // Ignorar
                            }
                        }
                    }
                }

                promise.resolve(results)
            } catch (e: Exception) {
                promise.reject("FIND_MIB2_ERROR", "Error finding MIB2: ${e.message}", e)
            }
        }
    }

    @ReactMethod
    fun getNetworkInterfaces(promise: Promise) {
        try {
            val interfaces = Arguments.createArray()
            val networkInterfaces = NetworkInterface.getNetworkInterfaces()

            while (networkInterfaces.hasMoreElements()) {
                val networkInterface = networkInterfaces.nextElement()
                
                // Saltar interfaces inactivas o loopback
                if (!networkInterface.isUp || networkInterface.isLoopback) {
                    continue
                }

                val inetAddresses = networkInterface.inetAddresses
                while (inetAddresses.hasMoreElements()) {
                    val inetAddress = inetAddresses.nextElement()
                    
                    // Solo IPv4
                    if (inetAddress is java.net.Inet4Address) {
                        val interfaceInfo = Arguments.createMap()
                        
                        interfaceInfo.putString("name", networkInterface.name)
                        interfaceInfo.putString("ipAddress", inetAddress.hostAddress)
                        interfaceInfo.putString("subnet", calculateSubnet(inetAddress, networkInterface))
                        interfaceInfo.putString("gateway", "")  // No disponible fácilmente en Android
                        interfaceInfo.putBoolean("isUSB", isUSBInterface(networkInterface.name))
                        interfaceInfo.putBoolean("isEthernet", isEthernetInterface(networkInterface.name))
                        
                        interfaces.pushMap(interfaceInfo)
                    }
                }
            }

            promise.resolve(interfaces)
        } catch (e: Exception) {
            promise.reject("NETWORK_INFO_ERROR", "Error al obtener interfaces de red: ${e.message}", e)
        }
    }

    private fun calculateSubnet(inetAddress: InetAddress, networkInterface: NetworkInterface): String {
        return try {
            val prefixLength = networkInterface.interfaceAddresses
                .find { it.address == inetAddress }
                ?.networkPrefixLength ?: 24
            
            // Convertir prefixLength (ej. 24) a máscara (ej. 255.255.255.0)
            // usando operaciones de bits para precisión en cualquier CIDR
            val shift = 32 - prefixLength
            val mask = (0xffffffffL shl shift).toInt()
            
            String.format("%d.%d.%d.%d",
                (mask shr 24) and 0xff,
                (mask shr 16) and 0xff,
                (mask shr 8) and 0xff,
                mask and 0xff
            )
        } catch (e: Exception) {
            "255.255.255.0"
        }
    }

    private fun isUSBInterface(name: String): Boolean {
        // Nombres comunes de interfaces USB en Android
        val usbPatterns = listOf("usb", "rndis", "ncm")
        return usbPatterns.any { name.lowercase().contains(it) }
    }

    private fun isEthernetInterface(name: String): Boolean {
        // Nombres comunes de interfaces Ethernet en Android
        val ethernetPatterns = listOf("eth", "usb", "rndis", "ncm")
        return ethernetPatterns.any { name.lowercase().contains(it) }
    }
}
