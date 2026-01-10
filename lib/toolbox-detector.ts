/**
 * MIB2 Toolbox Detector
 * 
 * Detects if MIB2 Toolbox is installed and retrieves version/status information
 */

export interface ToolboxInfo {
  installed: boolean;
  version?: string;
  services?: {
    telnet: boolean;
    ftp: boolean;
    ssh: boolean;
    webserver: boolean;
  };
  installPath?: string;
  configFiles?: string[];
}

/**
 * Detect if MIB2 Toolbox is installed
 */
export async function detectToolbox(executeCommand: (cmd: string) => Promise<any>): Promise<ToolboxInfo> {
  const result: ToolboxInfo = {
    installed: false,
  };

  try {
    // Check for common Toolbox installation paths
    const pathCheckResponse = await executeCommand('ls -la /net/rcc/mnt/efs-system/toolbox 2>/dev/null || echo "NOT_FOUND"');
    
    if (pathCheckResponse.success && !pathCheckResponse.output.includes('NOT_FOUND')) {
      result.installed = true;
      result.installPath = '/net/rcc/mnt/efs-system/toolbox';

      // Try to get version
      const versionResponse = await executeCommand('cat /net/rcc/mnt/efs-system/toolbox/version.txt 2>/dev/null || cat /net/rcc/mnt/efs-system/toolbox/VERSION 2>/dev/null || echo "UNKNOWN"');
      if (versionResponse.success && !versionResponse.output.includes('UNKNOWN')) {
        result.version = versionResponse.output.trim();
      }

      // Check for services
      result.services = await detectServices(executeCommand);

      // List config files
      const configResponse = await executeCommand('ls /net/rcc/mnt/efs-system/toolbox/*.cfg 2>/dev/null || echo "NONE"');
      if (configResponse.success && !configResponse.output.includes('NONE')) {
        result.configFiles = configResponse.output.trim().split('\n').filter(Boolean);
      }
    } else {
      // Try alternative path
      const altPathResponse = await executeCommand('ls -la /net/rcc/mnt/efs-persist/toolbox 2>/dev/null || echo "NOT_FOUND"');
      
      if (altPathResponse.success && !altPathResponse.output.includes('NOT_FOUND')) {
        result.installed = true;
        result.installPath = '/net/rcc/mnt/efs-persist/toolbox';

        // Try to get version from alternative path
        const versionResponse = await executeCommand('cat /net/rcc/mnt/efs-persist/toolbox/version.txt 2>/dev/null || echo "UNKNOWN"');
        if (versionResponse.success && !versionResponse.output.includes('UNKNOWN')) {
          result.version = versionResponse.output.trim();
        }

        result.services = await detectServices(executeCommand);
      }
    }
  } catch (error) {
    console.error('Error detecting toolbox:', error);
  }

  return result;
}

/**
 * Detect which services are enabled
 */
async function detectServices(executeCommand: (cmd: string) => Promise<any>): Promise<ToolboxInfo['services']> {
  const services = {
    telnet: false,
    ftp: false,
    ssh: false,
    webserver: false,
  };

  try {
    // Check if telnet is running (port 23)
    const telnetCheck = await executeCommand('netstat -an | grep ":23 " | grep LISTEN || echo "NOT_RUNNING"');
    services.telnet = telnetCheck.success && !telnetCheck.output.includes('NOT_RUNNING');

    // Check if FTP is running (port 21)
    const ftpCheck = await executeCommand('netstat -an | grep ":21 " | grep LISTEN || echo "NOT_RUNNING"');
    services.ftp = ftpCheck.success && !ftpCheck.output.includes('NOT_RUNNING');

    // Check if SSH is running (port 22)
    const sshCheck = await executeCommand('netstat -an | grep ":22 " | grep LISTEN || echo "NOT_RUNNING"');
    services.ssh = sshCheck.success && !sshCheck.output.includes('NOT_RUNNING');

    // Check if web server is running (port 80 or 8080)
    const webCheck = await executeCommand('netstat -an | grep -E ":(80|8080) " | grep LISTEN || echo "NOT_RUNNING"');
    services.webserver = webCheck.success && !webCheck.output.includes('NOT_RUNNING');
  } catch (error) {
    console.error('Error detecting services:', error);
  }

  return services;
}

/**
 * Get Toolbox installation recommendations
 */
export function getToolboxRecommendations(info: ToolboxInfo): string[] {
  const recommendations: string[] = [];

  if (!info.installed) {
    recommendations.push('MIB2 Toolbox no está instalado. Se recomienda instalarlo para acceso completo.');
    recommendations.push('Visita foros especializados para obtener la última versión del Toolbox.');
  } else {
    if (!info.services?.telnet) {
      recommendations.push('Telnet no está activo. Habilítalo desde el Toolbox para usar esta app.');
    }
    if (!info.services?.ftp) {
      recommendations.push('FTP no está activo. Considéralo para transferencia de archivos.');
    }
    if (info.version && info.version.includes('old')) {
      recommendations.push('Versión antigua del Toolbox detectada. Considera actualizar.');
    }
  }

  return recommendations;
}

/**
 * Format Toolbox info for display
 */
export function formatToolboxInfo(info: ToolboxInfo): string {
  if (!info.installed) {
    return 'MIB2 Toolbox: No instalado';
  }

  let output = `MIB2 Toolbox: Instalado\n`;
  
  if (info.version) {
    output += `Versión: ${info.version}\n`;
  }
  
  if (info.installPath) {
    output += `Ruta: ${info.installPath}\n`;
  }

  if (info.services) {
    output += `\nServicios:\n`;
    output += `  Telnet: ${info.services.telnet ? '✓ Activo' : '✗ Inactivo'}\n`;
    output += `  FTP: ${info.services.ftp ? '✓ Activo' : '✗ Inactivo'}\n`;
    output += `  SSH: ${info.services.ssh ? '✓ Activo' : '✗ Inactivo'}\n`;
    output += `  Web Server: ${info.services.webserver ? '✓ Activo' : '✗ Inactivo'}\n`;
  }

  return output;
}
