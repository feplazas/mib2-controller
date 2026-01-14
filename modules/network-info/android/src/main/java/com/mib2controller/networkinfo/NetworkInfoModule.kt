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

class NetworkInfoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "NetworkInfoModule"
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
