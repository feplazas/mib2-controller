/**
 * MIB2 Toolbox Backup System
 * 
 * Sistema de backup automático para archivos críticos del MIB2
 * antes de realizar modificaciones peligrosas.
 */

export interface BackupInfo {
  filename: string;
  originalPath: string;
  backupPath: string;
  timestamp: string;
  size: number;
  checksum?: string;
}

export interface BackupResult {
  success: boolean;
  backup?: BackupInfo;
  error?: string;
}

/**
 * Crear backup de un archivo crítico del MIB2
 */
export async function createBackup(
  executeCommand: (cmd: string) => Promise<any>,
  filePath: string
): Promise<BackupResult> {
  try {
    // Verificar que el archivo existe
    const checkResponse = await executeCommand(`ls -la ${filePath} 2>/dev/null || echo "NOT_FOUND"`);
    if (!checkResponse.success || checkResponse.output.includes('NOT_FOUND')) {
      return {
        success: false,
        error: `Archivo no encontrado: ${filePath}`,
      };
    }

    // Obtener tamaño del archivo
    const sizeResponse = await executeCommand(`stat -c %s ${filePath} 2>/dev/null || echo "0"`);
    const size = parseInt(sizeResponse.output.trim()) || 0;

    // Generar nombre de backup con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = filePath.split('/').pop() || 'unknown';
    const backupPath = `/net/rcc/mnt/efs-persist/backups/${filename}.${timestamp}.bak`;

    // Crear directorio de backups si no existe
    await executeCommand('mkdir -p /net/rcc/mnt/efs-persist/backups');

    // Copiar archivo a backup
    const copyResponse = await executeCommand(`cp -p ${filePath} ${backupPath} 2>&1`);
    if (!copyResponse.success) {
      return {
        success: false,
        error: `Error al copiar archivo: ${copyResponse.output}`,
      };
    }

    // Verificar que el backup se creó correctamente
    const verifyResponse = await executeCommand(`ls -la ${backupPath} 2>/dev/null || echo "NOT_FOUND"`);
    if (!verifyResponse.success || verifyResponse.output.includes('NOT_FOUND')) {
      return {
        success: false,
        error: 'Backup creado pero no se pudo verificar',
      };
    }

    // Calcular checksum (MD5) para verificación de integridad
    const checksumResponse = await executeCommand(`md5sum ${backupPath} 2>/dev/null | awk '{print $1}' || echo "NO_CHECKSUM"`);
    const checksum = checksumResponse.success && !checksumResponse.output.includes('NO_CHECKSUM')
      ? checksumResponse.output.trim()
      : undefined;

    return {
      success: true,
      backup: {
        filename,
        originalPath: filePath,
        backupPath,
        timestamp,
        size,
        checksum,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error inesperado: ${error}`,
    };
  }
}

/**
 * Restaurar un archivo desde backup
 */
export async function restoreBackup(
  executeCommand: (cmd: string) => Promise<any>,
  backup: BackupInfo
): Promise<BackupResult> {
  try {
    // Verificar que el backup existe
    const checkResponse = await executeCommand(`ls -la ${backup.backupPath} 2>/dev/null || echo "NOT_FOUND"`);
    if (!checkResponse.success || checkResponse.output.includes('NOT_FOUND')) {
      return {
        success: false,
        error: `Backup no encontrado: ${backup.backupPath}`,
      };
    }

    // Verificar checksum antes de restaurar (si está disponible)
    if (backup.checksum) {
      const checksumResponse = await executeCommand(`md5sum ${backup.backupPath} 2>/dev/null | awk '{print $1}' || echo "NO_CHECKSUM"`);
      const currentChecksum = checksumResponse.output.trim();
      
      if (currentChecksum !== backup.checksum && currentChecksum !== 'NO_CHECKSUM') {
        return {
          success: false,
          error: 'Checksum del backup no coincide. El archivo puede estar corrupto.',
        };
      }
    }

    // Restaurar archivo
    const restoreResponse = await executeCommand(`cp -p ${backup.backupPath} ${backup.originalPath} 2>&1`);
    if (!restoreResponse.success) {
      return {
        success: false,
        error: `Error al restaurar archivo: ${restoreResponse.output}`,
      };
    }

    // Verificar que la restauración fue exitosa
    const verifyResponse = await executeCommand(`ls -la ${backup.originalPath} 2>/dev/null || echo "NOT_FOUND"`);
    if (!verifyResponse.success || verifyResponse.output.includes('NOT_FOUND')) {
      return {
        success: false,
        error: 'Archivo restaurado pero no se pudo verificar',
      };
    }

    return {
      success: true,
      backup,
    };
  } catch (error) {
    return {
      success: false,
      error: `Error inesperado: ${error}`,
    };
  }
}

/**
 * Listar todos los backups disponibles
 */
export async function listBackups(
  executeCommand: (cmd: string) => Promise<any>
): Promise<BackupInfo[]> {
  try {
    const listResponse = await executeCommand('ls -la /net/rcc/mnt/efs-persist/backups/*.bak 2>/dev/null || echo "NO_BACKUPS"');
    
    if (!listResponse.success || listResponse.output.includes('NO_BACKUPS')) {
      return [];
    }

    const lines = listResponse.output.trim().split('\n');
    const backups: BackupInfo[] = [];

    for (const line of lines) {
      // Parsear línea de ls -la
      const match = line.match(/(\S+)\s+(\d+)\s+\S+\s+\S+\s+(\d+)\s+.*\s+(\S+\.bak)$/);
      if (match) {
        const [, , , sizeStr, backupPath] = match;
        const filename = backupPath.split('/').pop() || '';
        
        // Extraer timestamp del nombre del archivo
        const timestampMatch = filename.match(/\.(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.bak$/);
        const timestamp = timestampMatch ? timestampMatch[1].replace(/-/g, ':').replace('T', ' ') : 'Unknown';

        // Intentar determinar ruta original
        const originalFilename = filename.replace(/\.\d{4}-\d{2}-\d{2}T.*\.bak$/, '');
        const originalPath = `/net/rcc/dev/sbin/${originalFilename}`; // Ruta común para binarios

        backups.push({
          filename: originalFilename,
          originalPath,
          backupPath,
          timestamp,
          size: parseInt(sizeStr) || 0,
        });
      }
    }

    return backups;
  } catch (error) {
    console.error('Error al listar backups:', error);
    return [];
  }
}

/**
 * Eliminar un backup
 */
export async function deleteBackup(
  executeCommand: (cmd: string) => Promise<any>,
  backupPath: string
): Promise<boolean> {
  try {
    const deleteResponse = await executeCommand(`rm -f ${backupPath} 2>&1`);
    return deleteResponse.success;
  } catch (error) {
    console.error('Error al eliminar backup:', error);
    return false;
  }
}

/**
 * Crear backup del binario crítico tsd.mibstd2.system.swap antes de parchear
 */
export async function backupCriticalBinary(
  executeCommand: (cmd: string) => Promise<any>
): Promise<BackupResult> {
  const criticalBinaryPath = '/net/rcc/dev/sbin/tsd.mibstd2.system.swap';
  return createBackup(executeCommand, criticalBinaryPath);
}

/**
 * Verificar integridad de un archivo comparando con su backup
 */
export async function verifyFileIntegrity(
  executeCommand: (cmd: string) => Promise<any>,
  filePath: string,
  backup: BackupInfo
): Promise<boolean> {
  try {
    if (!backup.checksum) {
      return false;
    }

    const checksumResponse = await executeCommand(`md5sum ${filePath} 2>/dev/null | awk '{print $1}' || echo "NO_CHECKSUM"`);
    const currentChecksum = checksumResponse.output.trim();

    return currentChecksum === backup.checksum;
  } catch (error) {
    console.error('Error al verificar integridad:', error);
    return false;
  }
}
