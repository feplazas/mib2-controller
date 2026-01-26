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
