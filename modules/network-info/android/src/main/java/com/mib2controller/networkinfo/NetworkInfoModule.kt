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
        try {
            val prefixLength = networkInterface.interfaceAddresses
                .find { it.address == inetAddress }
                ?.networkPrefixLength ?: 24

            val ip = inetAddress.hostAddress ?: return "255.255.255.0"
            val parts = ip.split(".")
            
            // Calcular máscara de subred basada en prefixLength
            // Para /24 (común): 255.255.255.0
            // Para /16: 255.255.0.0
            return when {
                prefixLength >= 24 -> "255.255.255.0"
                prefixLength >= 16 -> "255.255.0.0"
                else -> "255.0.0.0"
            }
        } catch (e: Exception) {
            return "255.255.255.0"
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
