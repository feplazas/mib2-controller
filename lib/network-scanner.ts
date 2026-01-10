/**
 * Network Scanner for MIB2 Discovery
 * 
 * Scans the local network to find MIB2 units with Telnet enabled
 */

export interface ScanResult {
  host: string;
  port: number;
  responding: boolean;
  responseTime?: number;
  deviceInfo?: string;
}

export interface ScanProgress {
  current: number;
  total: number;
  percentage: number;
  currentHost: string;
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

  for (let i = startRange; i <= endRange; i++) {
    const host = `${baseIP}.${i}`;
    const current = i - startRange + 1;
    
    if (onProgress) {
      onProgress({
        current,
        total,
        percentage: Math.round((current / total) * 100),
        currentHost: host,
      });
    }

    try {
      const result = await checkHost(host, port);
      if (result.responding) {
        results.push(result);
      }
    } catch (error) {
      // Host not responding, continue
    }
  }

  return results;
}

/**
 * Check if a specific host has Telnet port open
 */
async function checkHost(host: string, port: number): Promise<ScanResult> {
  const startTime = Date.now();

  try {
    // Use backend API to check host
    const response = await fetch(`${getBackendUrl()}/api/network/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ host, port }),
      signal: AbortSignal.timeout(2000), // 2 second timeout per host
    });

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    return {
      host,
      port,
      responding: data.responding || false,
      responseTime,
      deviceInfo: data.deviceInfo,
    };
  } catch (error) {
    return {
      host,
      port,
      responding: false,
    };
  }
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

    try {
      const result = await checkHost(host, 23);
      if (result.responding) {
        results.push(result);
      }
    } catch (error) {
      // Continue to next IP
    }
  }

  return results;
}

/**
 * Get the backend API URL
 */
function getBackendUrl(): string {
  return __DEV__ ? 'http://localhost:3000' : 'https://your-backend-url.com';
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
