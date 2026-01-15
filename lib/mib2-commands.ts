/**
 * MIB2 Command Library
 * 
 * Comprehensive library of commands for MIB2 STD2 Technisat/Preh
 * Firmware T480 and variants
 */

export type CommandCategory = 
  | 'information' 
  | 'diagnostic' 
  | 'configuration'
  | 'adaptation'
  | 'skin'
  | 'network'
  | 'filesystem'
  | 'advanced';

export type RiskLevel = 'safe' | 'moderate' | 'high' | 'critical';

export interface MIB2Command {
  id: string;
  name: string;
  category: CommandCategory;
  riskLevel: RiskLevel;
  description: string;
  command: string;
  requiresConfirmation: boolean;
  expertOnly: boolean;
  firmwareVersion?: string;
  notes?: string;
}

export const MIB2_COMMANDS: MIB2Command[] = [
  // ========== INFORMATION COMMANDS ==========
  {
    id: 'firmware_version',
    name: 'Versión de Firmware',
    category: 'information',
    riskLevel: 'safe',
    description: 'Obtiene la versión actual del firmware instalado',
    command: 'cat /net/rcc/mnt/efs-persist/FW/version.txt',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'system_info',
    name: 'Información del Sistema',
    category: 'information',
    riskLevel: 'safe',
    description: 'Muestra información del sistema operativo QNX',
    command: 'uname -a',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'cpu_info',
    name: 'Información de CPU',
    category: 'information',
    riskLevel: 'safe',
    description: 'Muestra información del procesador',
    command: 'cat /proc/cpuinfo',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'serial_number',
    name: 'Número de Serie',
    category: 'information',
    riskLevel: 'safe',
    description: 'Obtiene el número de serie de la unidad',
    command: 'cat /net/rcc/mnt/efs-persist/serialnumber',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'hardware_version',
    name: 'Versión de Hardware',
    category: 'information',
    riskLevel: 'safe',
    description: 'Muestra la versión de hardware de la unidad',
    command: 'cat /net/rcc/mnt/efs-persist/HWVersion',
    requiresConfirmation: false,
    expertOnly: false,
  },

  // ========== DIAGNOSTIC COMMANDS ==========
  {
    id: 'memory_info',
    name: 'Uso de Memoria',
    category: 'diagnostic',
    riskLevel: 'safe',
    description: 'Muestra el uso actual de memoria',
    command: 'free',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'mounted_devices',
    name: 'Dispositivos Montados',
    category: 'diagnostic',
    riskLevel: 'safe',
    description: 'Lista todos los dispositivos y puntos de montaje',
    command: 'mount',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'network_interfaces',
    name: 'Interfaces de Red',
    category: 'diagnostic',
    riskLevel: 'safe',
    description: 'Muestra configuración de interfaces de red',
    command: 'ifconfig',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'running_processes',
    name: 'Procesos en Ejecución',
    category: 'diagnostic',
    riskLevel: 'safe',
    description: 'Lista todos los procesos activos',
    command: 'ps aux',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'disk_usage',
    name: 'Uso de Disco',
    category: 'diagnostic',
    riskLevel: 'safe',
    description: 'Muestra el uso de espacio en disco',
    command: 'df -h',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'temperature',
    name: 'Temperatura del Sistema',
    category: 'diagnostic',
    riskLevel: 'safe',
    description: 'Muestra la temperatura actual del sistema',
    command: 'cat /sys/class/thermal/thermal_zone0/temp',
    requiresConfirmation: false,
    expertOnly: false,
  },

  // ========== ADAPTATION COMMANDS ==========
  {
    id: 'list_adaptations',
    name: 'Listar Adaptaciones',
    category: 'adaptation',
    riskLevel: 'safe',
    description: 'Lista todas las adaptaciones disponibles',
    command: 'ls -la /net/rcc/mnt/efs-persist/Adaptation/',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'backup_adaptations',
    name: 'Backup de Adaptaciones',
    category: 'adaptation',
    riskLevel: 'moderate',
    description: 'Crea un backup de las adaptaciones actuales',
    command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/Adaptation_backup_$(date +%Y%m%d)',
    requiresConfirmation: true,
    expertOnly: false,
    notes: 'Recomendado antes de modificar adaptaciones',
  },
  {
    id: 'enable_green_menu',
    name: 'Habilitar Menú Verde',
    category: 'adaptation',
    riskLevel: 'moderate',
    description: 'Activa el menú de ingeniería (Green Menu)',
    command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
    requiresConfirmation: true,
    expertOnly: true,
    notes: 'Permite acceso a funciones de diagnóstico avanzadas',
  },
  {
    id: 'disable_green_menu',
    name: 'Deshabilitar Menú Verde',
    category: 'adaptation',
    riskLevel: 'moderate',
    description: 'Desactiva el menú de ingeniería (Green Menu)',
    command: 'echo "0" > /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
    requiresConfirmation: true,
    expertOnly: true,
  },
  {
    id: 'enable_video_in_motion',
    name: 'Video en Movimiento',
    category: 'adaptation',
    riskLevel: 'high',
    description: 'Permite reproducir video mientras el vehículo está en movimiento',
    command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/VideoInMotion',
    requiresConfirmation: true,
    expertOnly: true,
    notes: '⚠️ ADVERTENCIA: Puede ser ilegal en tu jurisdicción',
  },
  {
    id: 'enable_camera_guidelines',
    name: 'Líneas Guía de Cámara',
    category: 'adaptation',
    riskLevel: 'moderate',
    description: 'Activa las líneas guía en la cámara de reversa',
    command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/CameraGuidelines',
    requiresConfirmation: true,
    expertOnly: false,
  },

  // ========== SKIN COMMANDS ==========
  {
    id: 'list_skins',
    name: 'Listar Skins Disponibles',
    category: 'skin',
    riskLevel: 'safe',
    description: 'Lista todos los skins instalados',
    command: 'ls -la /net/rcc/mnt/efs-system/etc/skins/',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'current_skin',
    name: 'Skin Actual',
    category: 'skin',
    riskLevel: 'safe',
    description: 'Muestra el skin actualmente activo',
    command: 'cat /net/rcc/mnt/efs-persist/skin.cfg',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'backup_skin',
    name: 'Backup de Skin',
    category: 'skin',
    riskLevel: 'moderate',
    description: 'Crea un backup del skin actual',
    command: 'cp /net/rcc/mnt/efs-persist/skin.cfg /net/rcc/mnt/efs-persist/skin.cfg.backup',
    requiresConfirmation: true,
    expertOnly: false,
  },
  {
    id: 'set_skin_default',
    name: 'Restaurar Skin por Defecto',
    category: 'skin',
    riskLevel: 'moderate',
    description: 'Restaura el skin de fábrica',
    command: 'echo "default" > /net/rcc/mnt/efs-persist/skin.cfg',
    requiresConfirmation: true,
    expertOnly: false,
  },

  // ========== NETWORK COMMANDS ==========
  {
    id: 'wifi_status',
    name: 'Estado de WiFi',
    category: 'network',
    riskLevel: 'safe',
    description: 'Muestra el estado de la conexión WiFi',
    command: 'wpa_cli status',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'network_routes',
    name: 'Rutas de Red',
    category: 'network',
    riskLevel: 'safe',
    description: 'Muestra la tabla de rutas de red',
    command: 'route -n',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'ping_gateway',
    name: 'Ping a Gateway',
    category: 'network',
    riskLevel: 'safe',
    description: 'Prueba conectividad con el gateway',
    command: 'ping -c 4 192.168.1.1',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'dns_servers',
    name: 'Servidores DNS',
    category: 'network',
    riskLevel: 'safe',
    description: 'Muestra los servidores DNS configurados',
    command: 'cat /etc/resolv.conf',
    requiresConfirmation: false,
    expertOnly: false,
  },

  // ========== FILESYSTEM COMMANDS ==========
  {
    id: 'list_root',
    name: 'Listar Directorio Raíz',
    category: 'filesystem',
    riskLevel: 'safe',
    description: 'Lista el contenido del directorio raíz',
    command: 'ls -la /',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'list_persist',
    name: 'Listar Partición Persist',
    category: 'filesystem',
    riskLevel: 'safe',
    description: 'Lista archivos en la partición de persistencia',
    command: 'ls -la /net/rcc/mnt/efs-persist/',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'list_system',
    name: 'Listar Partición System',
    category: 'filesystem',
    riskLevel: 'safe',
    description: 'Lista archivos en la partición del sistema',
    command: 'ls -la /net/rcc/mnt/efs-system/',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'disk_partitions',
    name: 'Particiones de Disco',
    category: 'filesystem',
    riskLevel: 'safe',
    description: 'Muestra información de particiones',
    command: 'fdisk -l',
    requiresConfirmation: false,
    expertOnly: true,
  },

  // ========== ADVANCED COMMANDS ==========
  {
    id: 'reboot_system',
    name: 'Reiniciar Sistema',
    category: 'advanced',
    riskLevel: 'high',
    description: 'Reinicia la unidad MIB2',
    command: 'reboot',
    requiresConfirmation: true,
    expertOnly: true,
    notes: 'El sistema se reiniciará inmediatamente',
  },
  {
    id: 'kill_process',
    name: 'Terminar Proceso',
    category: 'advanced',
    riskLevel: 'high',
    description: 'Termina un proceso específico (requiere PID)',
    command: 'kill -9 <PID>',
    requiresConfirmation: true,
    expertOnly: true,
    notes: 'Reemplaza <PID> con el ID del proceso',
  },
  {
    id: 'clear_logs',
    name: 'Limpiar Logs del Sistema',
    category: 'advanced',
    riskLevel: 'moderate',
    description: 'Elimina los archivos de log del sistema',
    command: 'rm -f /var/log/*.log',
    requiresConfirmation: true,
    expertOnly: true,
  },
  {
    id: 'factory_reset_adaptations',
    name: 'Reset de Fábrica (Adaptaciones)',
    category: 'advanced',
    riskLevel: 'critical',
    description: 'Restaura todas las adaptaciones a valores de fábrica',
    command: 'rm -rf /net/rcc/mnt/efs-persist/Adaptation/* && reboot',
    requiresConfirmation: true,
    expertOnly: true,
    notes: '⚠️ CRÍTICO: Esto eliminará todas las adaptaciones personalizadas',
  },
];

/**
 * Get commands by category
 */
export function getCommandsByCategory(category: CommandCategory): MIB2Command[] {
  return MIB2_COMMANDS.filter(cmd => cmd.category === category);
}

/**
 * Get commands by risk level
 */
export function getCommandsByRisk(riskLevel: RiskLevel): MIB2Command[] {
  return MIB2_COMMANDS.filter(cmd => cmd.riskLevel === riskLevel);
}

/**
 * Get expert-only commands
 */
export function getExpertCommands(): MIB2Command[] {
  return MIB2_COMMANDS.filter(cmd => cmd.expertOnly);
}

/**
 * Get safe commands (non-expert)
 */
export function getSafeCommands(): MIB2Command[] {
  return MIB2_COMMANDS.filter(cmd => !cmd.expertOnly);
}

/**
 * Get command by ID
 */
export function getCommandById(id: string): MIB2Command | undefined {
  return MIB2_COMMANDS.find(cmd => cmd.id === id);
}

/**
 * Get risk level color
 */
export function getRiskLevelColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'safe':
      return 'success';
    case 'moderate':
      return 'warning';
    case 'high':
      return 'error';
    case 'critical':
      return 'error';
    default:
      return 'muted';
  }
}

/**
 * Get risk level label
 */
export function getRiskLevelLabel(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'safe':
      return 'Seguro';
    case 'moderate':
      return 'Moderado';
    case 'high':
      return 'Alto';
    case 'critical':
      return 'Crítico';
    default:
      return 'Desconocido';
  }
}
