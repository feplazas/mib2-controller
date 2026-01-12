/**
 * Network Scanner for MIB2 Discovery
 * Escanea red local usando TCP directo (sin backend)
 */

import TcpSocket from 'react-native-tcp-socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScanResult {
  host: string;
  port: number;
  responding: boolean;
  responseTime?: number;
  deviceInfo?: string;
  isMIB2?: boolean;
}

export interface ScanProgress {
  current: number;
  total: number;
  percentage: number;
  currentHost: string;
}

/**
 * Escanear una IP específica en busca de puerto Telnet abierto
 */
async function scanIP(ip: string, port: number = 23, timeout: number = 500): Promise<ScanResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let resolved = false;

    const socket = TcpSocket.createConnection(
      {
        host: ip,
        port,
      },
      () => {
        // Conexión exitosa
        if (!resolved) {
          resolved = true;
          const responseTime = Date.now() - startTime;
          socket.destroy();
          resolve({
            host: ip,
            port,
            responding: true,
            responseTime,
          });
        }
      }
    );

    socket.on('error', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({
          host: ip,
          port,
          responding: false,
          responseTime: Date.now() - startTime,
        });
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({
          host: ip,
          port,
          responding: false,
          responseTime: timeout,
        });
      }
    });

    // Timeout de seguridad
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({
          host: ip,
          port,
          responding: false,
          responseTime: timeout,
        });
      }
    }, timeout + 100);
  });
}

/**
 * Scan a range of IP addresses for MIB2 units
 */
export async function scanNetwork(
  baseIP: string = '192.168.1',
  startRange: number = 1,
  endRange: number = 255,
  port: number = 23,
  onProgress?: (progress: ScanProgress) => void
): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const total = endRange - startRange + 1;

  // Escanear en lotes de 10 para no saturar la red
  const batchSize = 10;
  for (let i = startRange; i <= endRange; i += batchSize) {
    const batchEnd = Math.min(i + batchSize - 1, endRange);
    const batchPromises: Promise<ScanResult>[] = [];

    for (let j = i; j <= batchEnd; j++) {
      const host = `${baseIP}.${j}`;
      batchPromises.push(scanIP(host, port, 500));
    }

    const batchResults = await Promise.all(batchPromises);
    
    // Agregar solo IPs que responden
    for (const result of batchResults) {
      if (result.responding) {
        results.push(result);
      }
    }

    if (onProgress) {
      const current = Math.min(batchEnd, endRange) - startRange + 1;
      onProgress({
        current,
        total,
        percentage: Math.round((current / total) * 100),
        currentHost: `${baseIP}.${batchEnd}`,
      });
    }
  }

  return results;
}

/**
 * Quick scan for common MIB2 IP addresses
 */
export async function quickScan(
  onProgress?: (progress: ScanProgress) => void
): Promise<ScanResult[]> {
  // Common IP addresses for MIB2 units
  const commonIPs = [
    '192.168.1.4',
    '192.168.0.4',
    '192.168.1.1',
    '192.168.0.1',
    '10.0.0.4',
    '172.16.0.4',
  ];

  const results: ScanResult[] = [];
  const total = commonIPs.length;

  for (let i = 0; i < commonIPs.length; i++) {
    const host = commonIPs[i];
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
        currentHost: host,
      });
    }

    const result = await scanIP(host, 23, 1000);
    if (result.responding) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Verificar si una IP es una unidad MIB2
 * Intenta conectar y buscar banner característico
 */
export async function verifyMIB2(ip: string, timeout: number = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    let buffer = '';

    const socket = TcpSocket.createConnection(
      {
        host: ip,
        port: 23,
      },
      () => {
        // Conexión exitosa, esperar banner
      }
    );

    socket.on('data', (data) => {
      buffer += data.toString();
      
      // Buscar indicadores de QNX/MIB2
      if (
        buffer.includes('QNX') ||
        buffer.includes('login:') ||
        buffer.includes('MIB') ||
        buffer.includes('rcc') ||
        buffer.includes('mmx')
      ) {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve(true);
        }
      }
    });

    socket.on('error', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    // Timeout de seguridad
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    }, timeout + 100);
  });
}

/**
 * Parse subnet from IP address
 */
export function parseSubnet(ip: string): string {
  const parts = ip.split('.');
  if (parts.length !== 4) {
    return '192.168.1';
  }
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return false;
  }

  const parts = ip.split('.').map(Number);
  return parts.every(part => part >= 0 && part <= 255);
}

/**
 * Obtener IP guardada de AsyncStorage
 */
export async function getSavedMIB2IP(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('mib2_ip');
  } catch {
    return null;
  }
}

/**
 * Guardar IP de MIB2 en AsyncStorage
 */
export async function saveMIB2IP(ip: string): Promise<void> {
  try {
    await AsyncStorage.setItem('mib2_ip', ip);
  } catch (error) {
    console.error('Error saving MIB2 IP:', error);
  }
}
