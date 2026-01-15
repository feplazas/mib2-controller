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
  nameKey: string;
  category: CommandCategory;
  riskLevel: RiskLevel;
  descriptionKey: string;
  command: string;
  requiresConfirmation: boolean;
  expertOnly: boolean;
  firmwareVersion?: string;
  notesKey?: string;
}

export const MIB2_COMMANDS: MIB2Command[] = [
  // ========== INFORMATION COMMANDS ==========
  {
    id: 'firmware_version',
    nameKey: 'commands.firmware_version',
    category: 'information',
    riskLevel: 'safe',
    descriptionKey: 'commands.firmware_version_desc',
    command: 'cat /net/rcc/mnt/efs-persist/FW/version.txt',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'system_info',
    nameKey: 'commands.system_info',
    category: 'information',
    riskLevel: 'safe',
    descriptionKey: 'commands.system_info_desc',
    command: 'uname -a',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'cpu_info',
    nameKey: 'commands.cpu_info',
    category: 'information',
    riskLevel: 'safe',
    descriptionKey: 'commands.cpu_info_desc',
    command: 'cat /proc/cpuinfo',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'serial_number',
    nameKey: 'commands.serial_number',
    category: 'information',
    riskLevel: 'safe',
    descriptionKey: 'commands.serial_number_desc',
    command: 'cat /net/rcc/mnt/efs-persist/serialnumber',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'hardware_version',
    nameKey: 'commands.hardware_version',
    category: 'information',
    riskLevel: 'safe',
    descriptionKey: 'commands.hardware_version_desc',
    command: 'cat /net/rcc/mnt/efs-persist/HWVersion',
    requiresConfirmation: false,
    expertOnly: false,
  },

  // ========== DIAGNOSTIC COMMANDS ==========
  {
    id: 'memory_info',
    nameKey: 'commands.memory_info',
    category: 'diagnostic',
    riskLevel: 'safe',
    descriptionKey: 'commands.memory_info_desc',
    command: 'free',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'mounted_devices',
    nameKey: 'commands.mounted_devices',
    category: 'diagnostic',
    riskLevel: 'safe',
    descriptionKey: 'commands.mounted_devices_desc',
    command: 'mount',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'network_interfaces',
    nameKey: 'commands.network_interfaces',
    category: 'diagnostic',
    riskLevel: 'safe',
    descriptionKey: 'commands.network_interfaces_desc',
    command: 'ifconfig',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'running_processes',
    nameKey: 'commands.running_processes',
    category: 'diagnostic',
    riskLevel: 'safe',
    descriptionKey: 'commands.running_processes_desc',
    command: 'ps aux',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'disk_usage',
    nameKey: 'commands.disk_usage',
    category: 'diagnostic',
    riskLevel: 'safe',
    descriptionKey: 'commands.disk_usage_desc',
    command: 'df -h',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'temperature',
    nameKey: 'commands.temperature',
    category: 'diagnostic',
    riskLevel: 'safe',
    descriptionKey: 'commands.temperature_desc',
    command: 'cat /sys/class/thermal/thermal_zone0/temp',
    requiresConfirmation: false,
    expertOnly: false,
  },

  // ========== ADAPTATION COMMANDS ==========
  {
    id: 'list_adaptations',
    nameKey: 'commands.list_adaptations',
    category: 'adaptation',
    riskLevel: 'safe',
    descriptionKey: 'commands.list_adaptations_desc',
    command: 'ls -la /net/rcc/mnt/efs-persist/Adaptation/',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'backup_adaptations',
    nameKey: 'commands.backup_adaptations',
    category: 'adaptation',
    riskLevel: 'moderate',
    descriptionKey: 'commands.backup_adaptations_desc',
    command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/Adaptation_backup_$(date +%Y%m%d)',
    requiresConfirmation: true,
    expertOnly: false,
    notesKey: 'commands.backup_adaptations_notes',
  },
  {
    id: 'enable_green_menu',
    nameKey: 'commands.enable_green_menu',
    category: 'adaptation',
    riskLevel: 'moderate',
    descriptionKey: 'commands.enable_green_menu_desc',
    command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
    requiresConfirmation: true,
    expertOnly: true,
    notesKey: 'commands.enable_green_menu_notes',
  },
  {
    id: 'disable_green_menu',
    nameKey: 'commands.disable_green_menu',
    category: 'adaptation',
    riskLevel: 'moderate',
    descriptionKey: 'commands.disable_green_menu_desc',
    command: 'echo "0" > /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
    requiresConfirmation: true,
    expertOnly: true,
  },
  {
    id: 'enable_video_in_motion',
    nameKey: 'commands.enable_vim',
    category: 'adaptation',
    riskLevel: 'high',
    descriptionKey: 'commands.enable_vim_desc',
    command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/VideoInMotion',
    requiresConfirmation: true,
    expertOnly: true,
    notesKey: 'commands.enable_vim_notes',
  },
  {
    id: 'enable_camera_guidelines',
    nameKey: 'commands.enable_camera_guidelines',
    category: 'adaptation',
    riskLevel: 'moderate',
    descriptionKey: 'commands.enable_camera_guidelines_desc',
    command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/CameraGuidelines',
    requiresConfirmation: true,
    expertOnly: false,
  },

  // ========== SKIN COMMANDS ==========
  {
    id: 'list_skins',
    nameKey: 'commands.list_skins',
    category: 'skin',
    riskLevel: 'safe',
    descriptionKey: 'commands.list_skins_desc',
    command: 'ls -la /net/rcc/mnt/efs-system/etc/skins/',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'current_skin',
    nameKey: 'commands.current_skin',
    category: 'skin',
    riskLevel: 'safe',
    descriptionKey: 'commands.current_skin_desc',
    command: 'cat /net/rcc/mnt/efs-persist/skin.cfg',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'backup_skin',
    nameKey: 'commands.backup_skin',
    category: 'skin',
    riskLevel: 'moderate',
    descriptionKey: 'commands.backup_skin_desc',
    command: 'cp /net/rcc/mnt/efs-persist/skin.cfg /net/rcc/mnt/efs-persist/skin.cfg.backup',
    requiresConfirmation: true,
    expertOnly: false,
  },
  {
    id: 'set_skin_default',
    nameKey: 'commands.restore_default_skin',
    category: 'skin',
    riskLevel: 'moderate',
    descriptionKey: 'commands.restore_default_skin_desc',
    command: 'echo "default" > /net/rcc/mnt/efs-persist/skin.cfg',
    requiresConfirmation: true,
    expertOnly: false,
  },

  // ========== NETWORK COMMANDS ==========
  {
    id: 'wifi_status',
    nameKey: 'commands.wifi_status',
    category: 'network',
    riskLevel: 'safe',
    descriptionKey: 'commands.wifi_status_desc',
    command: 'wpa_cli status',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'network_routes',
    nameKey: 'commands.network_routes',
    category: 'network',
    riskLevel: 'safe',
    descriptionKey: 'commands.network_routes_desc',
    command: 'route -n',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'ping_gateway',
    nameKey: 'commands.ping_gateway',
    category: 'network',
    riskLevel: 'safe',
    descriptionKey: 'commands.ping_gateway_desc',
    command: 'ping -c 4 192.168.1.1',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'dns_servers',
    nameKey: 'commands.dns_servers',
    category: 'network',
    riskLevel: 'safe',
    descriptionKey: 'commands.dns_servers_desc',
    command: 'cat /etc/resolv.conf',
    requiresConfirmation: false,
    expertOnly: false,
  },

  // ========== FILESYSTEM COMMANDS ==========
  {
    id: 'list_root',
    nameKey: 'commands.list_root',
    category: 'filesystem',
    riskLevel: 'safe',
    descriptionKey: 'commands.list_root_desc',
    command: 'ls -la /',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'list_persist',
    nameKey: 'commands.list_persist',
    category: 'filesystem',
    riskLevel: 'safe',
    descriptionKey: 'commands.list_persist_desc',
    command: 'ls -la /net/rcc/mnt/efs-persist/',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'list_system',
    nameKey: 'commands.list_system',
    category: 'filesystem',
    riskLevel: 'safe',
    descriptionKey: 'commands.list_system_desc',
    command: 'ls -la /net/rcc/mnt/efs-system/',
    requiresConfirmation: false,
    expertOnly: false,
  },
  {
    id: 'disk_partitions',
    nameKey: 'commands.disk_partitions',
    category: 'filesystem',
    riskLevel: 'safe',
    descriptionKey: 'commands.disk_partitions_desc',
    command: 'fdisk -l',
    requiresConfirmation: false,
    expertOnly: true,
  },

  // ========== ADVANCED COMMANDS ==========
  {
    id: 'reboot_system',
    nameKey: 'commands.reboot_system',
    category: 'advanced',
    riskLevel: 'high',
    descriptionKey: 'commands.reboot_system_desc',
    command: 'reboot',
    requiresConfirmation: true,
    expertOnly: true,
    notesKey: 'commands.reboot_system_notes',
  },
  {
    id: 'kill_process',
    nameKey: 'commands.kill_process',
    category: 'advanced',
    riskLevel: 'high',
    descriptionKey: 'commands.kill_process_desc',
    command: 'kill -9 <PID>',
    requiresConfirmation: true,
    expertOnly: true,
    notesKey: 'commands.kill_process_notes',
  },
  {
    id: 'clear_logs',
    nameKey: 'commands.clear_logs',
    category: 'advanced',
    riskLevel: 'moderate',
    descriptionKey: 'commands.clear_logs_desc',
    command: 'rm -f /var/log/*.log',
    requiresConfirmation: true,
    expertOnly: true,
  },
  {
    id: 'factory_reset_adaptations',
    nameKey: 'commands.factory_reset',
    category: 'advanced',
    riskLevel: 'critical',
    descriptionKey: 'commands.factory_reset_desc',
    command: 'rm -rf /net/rcc/mnt/efs-persist/Adaptation/* && reboot',
    requiresConfirmation: true,
    expertOnly: true,
    notesKey: 'commands.factory_reset_notes',
  },
];

// Category keys for translation
export const COMMAND_CATEGORY_KEYS = {
  information: 'commands.category_information',
  diagnostic: 'commands.category_diagnostic',
  configuration: 'commands.category_configuration',
  adaptation: 'commands.category_adaptation',
  skin: 'commands.category_skin',
  network: 'commands.category_network',
  filesystem: 'commands.category_filesystem',
  advanced: 'commands.category_advanced',
} as const;

// Risk level keys for translation
export const RISK_LEVEL_KEYS = {
  safe: 'commands.risk_safe',
  moderate: 'commands.risk_moderate',
  high: 'commands.risk_high',
  critical: 'commands.risk_critical',
} as const;

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
 * Get risk level key for translation
 */
export function getRiskLevelKey(riskLevel: RiskLevel): string {
  return RISK_LEVEL_KEYS[riskLevel] || 'commands.risk_unknown';
}

/**
 * Get category key for translation
 */
export function getCategoryKey(category: CommandCategory): string {
  return COMMAND_CATEGORY_KEYS[category] || 'commands.category_unknown';
}
