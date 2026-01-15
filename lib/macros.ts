/**
 * Command Macros System
 * 
 * Predefined sequences of commands for common MIB2 operations
 */

export interface MacroStep {
  command: string;
  description: string;
  delay?: number; // Delay in milliseconds before next command
  optional?: boolean; // If true, failure won't stop the macro
}

export interface CommandMacro {
  id: string;
  name: string;
  description: string;
  category: 'backup' | 'adaptation' | 'diagnostic' | 'maintenance' | 'custom';
  steps: MacroStep[];
  estimatedDuration: number; // in seconds
  riskLevel: 'safe' | 'moderate' | 'high';
  requiresExpertMode: boolean;
}

export const PREDEFINED_MACROS: CommandMacro[] = [
  // ========== BACKUP MACROS ==========
  {
    id: 'full_backup',
    name: 'Backup Completo',
    description: 'Crea un backup completo de adaptaciones y configuración',
    category: 'backup',
    estimatedDuration: 30,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'date',
        description: 'Obtener fecha actual',
      },
      {
        command: 'mkdir -p /net/rcc/mnt/efs-persist/backups',
        description: 'Crear directorio de backups',
        optional: true,
      },
      {
        command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/backups/Adaptation_$(date +%Y%m%d_%H%M%S)',
        description: 'Backup de adaptaciones',
        delay: 2000,
      },
      {
        command: 'cp /net/rcc/mnt/efs-persist/skin.cfg /net/rcc/mnt/efs-persist/backups/skin_$(date +%Y%m%d_%H%M%S).cfg',
        description: 'Backup de configuración de skin',
        delay: 1000,
        optional: true,
      },
      {
        command: 'ls -lh /net/rcc/mnt/efs-persist/backups/',
        description: 'Verificar backups creados',
        delay: 1000,
      },
    ],
  },
  {
    id: 'backup_adaptations',
    name: 'Backup de Adaptaciones',
    description: 'Crea un backup solo de las adaptaciones',
    category: 'backup',
    estimatedDuration: 10,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'mkdir -p /net/rcc/mnt/efs-persist/backups',
        description: 'Crear directorio de backups',
        optional: true,
      },
      {
        command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/backups/Adaptation_backup_$(date +%Y%m%d)',
        description: 'Copiar adaptaciones',
        delay: 2000,
      },
      {
        command: 'ls -la /net/rcc/mnt/efs-persist/backups/',
        description: 'Listar backups',
        delay: 1000,
      },
    ],
  },

  // ========== ADAPTATION MACROS ==========
  {
    id: 'enable_all_features',
    name: 'Activar Todas las Características',
    description: 'Activa Green Menu, Video en Movimiento y líneas guía de cámara',
    category: 'adaptation',
    estimatedDuration: 15,
    riskLevel: 'high',
    requiresExpertMode: true,
    steps: [
      {
        command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/Adaptation_backup_pre_activation',
        description: 'Backup de seguridad',
        delay: 2000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
        description: 'Activar Green Menu',
        delay: 1000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/VideoInMotion',
        description: 'Activar Video en Movimiento',
        delay: 1000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/CameraGuidelines',
        description: 'Activar líneas guía de cámara',
        delay: 1000,
      },
      {
        command: 'ls -la /net/rcc/mnt/efs-persist/Adaptation/',
        description: 'Verificar adaptaciones',
        delay: 1000,
      },
    ],
  },
  {
    id: 'safe_adaptations',
    name: 'Adaptaciones Seguras',
    description: 'Activa solo adaptaciones seguras (Green Menu y líneas guía)',
    category: 'adaptation',
    estimatedDuration: 10,
    riskLevel: 'moderate',
    requiresExpertMode: false,
    steps: [
      {
        command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/Adaptation_backup_safe',
        description: 'Backup de seguridad',
        delay: 2000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
        description: 'Activar Green Menu',
        delay: 1000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/CameraGuidelines',
        description: 'Activar líneas guía de cámara',
        delay: 1000,
      },
      {
        command: 'cat /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
        description: 'Verificar Green Menu',
        delay: 500,
      },
    ],
  },

  // ========== DIAGNOSTIC MACROS ==========
  {
    id: 'system_health_check',
    name: 'Chequeo de Salud del Sistema',
    description: 'Verifica memoria, disco, temperatura y procesos',
    category: 'diagnostic',
    estimatedDuration: 20,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'free',
        description: 'Verificar uso de memoria',
        delay: 1000,
      },
      {
        command: 'df -h',
        description: 'Verificar espacio en disco',
        delay: 1000,
      },
      {
        command: 'cat /sys/class/thermal/thermal_zone0/temp',
        description: 'Verificar temperatura',
        delay: 1000,
        optional: true,
      },
      {
        command: 'ps aux | head -20',
        description: 'Listar procesos principales',
        delay: 1000,
      },
      {
        command: 'uptime',
        description: 'Verificar tiempo de actividad',
        delay: 500,
      },
    ],
  },
  {
    id: 'network_diagnostic',
    name: 'Diagnóstico de Red',
    description: 'Verifica configuración de red y conectividad',
    category: 'diagnostic',
    estimatedDuration: 15,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'ifconfig',
        description: 'Mostrar interfaces de red',
        delay: 1000,
      },
      {
        command: 'route -n',
        description: 'Mostrar tabla de rutas',
        delay: 1000,
      },
      {
        command: 'cat /etc/resolv.conf',
        description: 'Mostrar servidores DNS',
        delay: 500,
      },
      {
        command: 'ping -c 4 192.168.1.1',
        description: 'Probar conectividad con gateway',
        delay: 5000,
        optional: true,
      },
    ],
  },
  {
    id: 'firmware_info',
    name: 'Información de Firmware',
    description: 'Obtiene información detallada del firmware y hardware',
    category: 'diagnostic',
    estimatedDuration: 10,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'cat /net/rcc/mnt/efs-persist/FW/version.txt',
        description: 'Versión de firmware',
        delay: 500,
      },
      {
        command: 'cat /net/rcc/mnt/efs-persist/HWVersion',
        description: 'Versión de hardware',
        delay: 500,
      },
      {
        command: 'cat /net/rcc/mnt/efs-persist/serialnumber',
        description: 'Número de serie',
        delay: 500,
      },
      {
        command: 'uname -a',
        description: 'Información del sistema',
        delay: 500,
      },
    ],
  },

  // ========== MAINTENANCE MACROS ==========
  {
    id: 'cleanup_system',
    name: 'Limpieza del Sistema',
    description: 'Limpia archivos temporales y logs antiguos',
    category: 'maintenance',
    estimatedDuration: 15,
    riskLevel: 'moderate',
    requiresExpertMode: true,
    steps: [
      {
        command: 'df -h',
        description: 'Verificar espacio antes de limpiar',
        delay: 1000,
      },
      {
        command: 'rm -f /tmp/*',
        description: 'Limpiar archivos temporales',
        delay: 2000,
        optional: true,
      },
      {
        command: 'find /var/log -name "*.log" -type f -mtime +7 -delete',
        description: 'Eliminar logs antiguos (>7 días)',
        delay: 2000,
        optional: true,
      },
      {
        command: 'df -h',
        description: 'Verificar espacio después de limpiar',
        delay: 1000,
      },
    ],
  },
];

/**
 * Get macros by category
 */
export function getMacrosByCategory(category: CommandMacro['category']): CommandMacro[] {
  return PREDEFINED_MACROS.filter(macro => macro.category === category);
}

/**
 * Get macro by ID
 */
export function getMacroById(id: string): CommandMacro | undefined {
  return PREDEFINED_MACROS.find(macro => macro.id === id);
}

/**
 * Get safe macros (non-expert)
 */
export function getSafeMacros(): CommandMacro[] {
  return PREDEFINED_MACROS.filter(macro => !macro.requiresExpertMode);
}

/**
 * Get expert macros
 */
export function getExpertMacros(): CommandMacro[] {
  return PREDEFINED_MACROS.filter(macro => macro.requiresExpertMode);
}

/**
 * Calculate total steps in a macro
 */
export function getMacroStepCount(macro: CommandMacro): number {
  return macro.steps.length;
}

/**
 * Get category label
 */
export function getCategoryLabel(category: CommandMacro['category']): string {
  const labels: Record<CommandMacro['category'], string> = {
    backup: 'Backup',
    adaptation: 'Adaptaciones',
    diagnostic: 'Diagnóstico',
    maintenance: 'Mantenimiento',
    custom: 'Personalizado',
  };
  return labels[category];
}

/**
 * Get category color
 */
export function getCategoryColor(category: CommandMacro['category']): string {
  const colors: Record<CommandMacro['category'], string> = {
    backup: 'primary',
    adaptation: 'warning',
    diagnostic: 'success',
    maintenance: 'muted',
    custom: 'foreground',
  };
  return colors[category];
}
