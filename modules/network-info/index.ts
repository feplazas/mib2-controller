import { NativeModules, Platform } from 'react-native';

const { NetworkInfoModule } = NativeModules;

export interface NetworkInterface {
  name: string;
  ipAddress: string;
  subnet: string;
  gateway: string;
  isUSB: boolean;
  isEthernet: boolean;
}

/**
 * Obtiene información de todas las interfaces de red del dispositivo
 */
export async function getNetworkInterfaces(): Promise<NetworkInterface[]> {
  if (Platform.OS !== 'android') {
    console.warn('NetworkInfo solo está disponible en Android');
    return [];
  }

  try {
    const interfaces = await NetworkInfoModule.getNetworkInterfaces();
    return interfaces || [];
  } catch (error) {
    console.error('Error al obtener interfaces de red:', error);
    return [];
  }
}

/**
 * Detecta automáticamente el adaptador USB-Ethernet conectado
 * Prioriza interfaces USB y Ethernet sobre WiFi
 */
export async function detectUSBEthernetAdapter(): Promise<NetworkInterface | null> {
  const interfaces = await getNetworkInterfaces();

  // Buscar adaptador USB-Ethernet
  const usbEthernet = interfaces.find(iface => iface.isUSB && iface.isEthernet);
  if (usbEthernet) {
    return usbEthernet;
  }

  // Buscar cualquier adaptador Ethernet
  const ethernet = interfaces.find(iface => iface.isEthernet);
  if (ethernet) {
    return ethernet;
  }

  return null;
}

/**
 * Extrae la subred base de una IP (ej: "192.168.1.10" -> "192.168.1")
 */
export function extractSubnet(ipAddress: string): string {
  const parts = ipAddress.split('.');
  if (parts.length !== 4) {
    return '192.168.1'; // Fallback
  }
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

/**
 * Detecta automáticamente la subred del adaptador USB-Ethernet
 * Retorna la subred base para escaneo (ej: "192.168.1")
 */
export async function detectSubnet(): Promise<string> {
  const adapter = await detectUSBEthernetAdapter();
  
  if (adapter && adapter.ipAddress) {
    return extractSubnet(adapter.ipAddress);
  }

  // Fallback a subred común de MIB2
  return '192.168.1';
}

/**
 * Valida que el adaptador USB-Ethernet tenga una IP asignada
 */
export async function validateAdapterConnectivity(): Promise<boolean> {
  const adapter = await detectUSBEthernetAdapter();
  
  if (!adapter) {
    return false;
  }

  // Verificar que la IP no sea 0.0.0.0 o vacía
  if (!adapter.ipAddress || adapter.ipAddress === '0.0.0.0') {
    return false;
  }

  return true;
}
