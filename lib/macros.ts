/**
 * Command Macros System
 * 
 * Predefined sequences of commands for common MIB2 operations
 */

export interface MacroStep {
  command: string;
  descriptionKey: string;
  delay?: number; // Delay in milliseconds before next command
  optional?: boolean; // If true, failure won't stop the macro
}

export interface CommandMacro {
  id: string;
  nameKey: string;
  descriptionKey: string;
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
    nameKey: 'macros.full_backup',
    descriptionKey: 'macros.full_backup_desc',
    category: 'backup',
    estimatedDuration: 30,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'date',
        descriptionKey: 'macros.step_get_date',
      },
      {
        command: 'mkdir -p /net/rcc/mnt/efs-persist/backups',
        descriptionKey: 'macros.step_create_backup_dir',
        optional: true,
      },
      {
        command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/backups/Adaptation_$(date +%Y%m%d_%H%M%S)',
        descriptionKey: 'macros.step_backup_adaptations',
        delay: 2000,
      },
      {
        command: 'cp /net/rcc/mnt/efs-persist/skin.cfg /net/rcc/mnt/efs-persist/backups/skin_$(date +%Y%m%d_%H%M%S).cfg',
        descriptionKey: 'macros.step_backup_skin',
        delay: 1000,
        optional: true,
      },
      {
        command: 'ls -lh /net/rcc/mnt/efs-persist/backups/',
        descriptionKey: 'macros.step_verify_backups',
        delay: 1000,
      },
    ],
  },
  {
    id: 'backup_adaptations',
    nameKey: 'macros.backup_adaptations',
    descriptionKey: 'macros.backup_adaptations_desc',
    category: 'backup',
    estimatedDuration: 10,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'mkdir -p /net/rcc/mnt/efs-persist/backups',
        descriptionKey: 'macros.step_create_backup_dir',
        optional: true,
      },
      {
        command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/backups/Adaptation_backup_$(date +%Y%m%d)',
        descriptionKey: 'macros.step_copy_adaptations',
        delay: 2000,
      },
      {
        command: 'ls -la /net/rcc/mnt/efs-persist/backups/',
        descriptionKey: 'macros.step_list_backups',
        delay: 1000,
      },
    ],
  },

  // ========== ADAPTATION MACROS ==========
  {
    id: 'enable_all_features',
    nameKey: 'macros.enable_all_features',
    descriptionKey: 'macros.enable_all_features_desc',
    category: 'adaptation',
    estimatedDuration: 15,
    riskLevel: 'high',
    requiresExpertMode: true,
    steps: [
      {
        command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/Adaptation_backup_pre_activation',
        descriptionKey: 'macros.step_safety_backup',
        delay: 2000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
        descriptionKey: 'macros.step_enable_green_menu',
        delay: 1000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/VideoInMotion',
        descriptionKey: 'macros.step_enable_vim',
        delay: 1000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/CameraGuidelines',
        descriptionKey: 'macros.step_enable_camera_guidelines',
        delay: 1000,
      },
      {
        command: 'ls -la /net/rcc/mnt/efs-persist/Adaptation/',
        descriptionKey: 'macros.step_verify_adaptations',
        delay: 1000,
      },
    ],
  },
  {
    id: 'safe_adaptations',
    nameKey: 'macros.safe_adaptations',
    descriptionKey: 'macros.safe_adaptations_desc',
    category: 'adaptation',
    estimatedDuration: 10,
    riskLevel: 'moderate',
    requiresExpertMode: false,
    steps: [
      {
        command: 'cp -r /net/rcc/mnt/efs-persist/Adaptation /net/rcc/mnt/efs-persist/Adaptation_backup_safe',
        descriptionKey: 'macros.step_safety_backup',
        delay: 2000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
        descriptionKey: 'macros.step_enable_green_menu',
        delay: 1000,
      },
      {
        command: 'echo "1" > /net/rcc/mnt/efs-persist/Adaptation/CameraGuidelines',
        descriptionKey: 'macros.step_enable_camera_guidelines',
        delay: 1000,
      },
      {
        command: 'cat /net/rcc/mnt/efs-persist/Adaptation/GreenMenu',
        descriptionKey: 'macros.step_verify_green_menu',
        delay: 500,
      },
    ],
  },

  // ========== DIAGNOSTIC MACROS ==========
  {
    id: 'system_health_check',
    nameKey: 'macros.system_health_check',
    descriptionKey: 'macros.system_health_check_desc',
    category: 'diagnostic',
    estimatedDuration: 20,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'free',
        descriptionKey: 'macros.step_check_memory',
        delay: 1000,
      },
      {
        command: 'df -h',
        descriptionKey: 'macros.step_check_disk',
        delay: 1000,
      },
      {
        command: 'cat /sys/class/thermal/thermal_zone0/temp',
        descriptionKey: 'macros.step_check_temp',
        delay: 1000,
        optional: true,
      },
      {
        command: 'ps aux | head -20',
        descriptionKey: 'macros.step_list_processes',
        delay: 1000,
      },
      {
        command: 'uptime',
        descriptionKey: 'macros.step_check_uptime',
        delay: 500,
      },
    ],
  },
  {
    id: 'network_diagnostic',
    nameKey: 'macros.network_diagnostic',
    descriptionKey: 'macros.network_diagnostic_desc',
    category: 'diagnostic',
    estimatedDuration: 15,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'ifconfig',
        descriptionKey: 'macros.step_show_interfaces',
        delay: 1000,
      },
      {
        command: 'route -n',
        descriptionKey: 'macros.step_show_routes',
        delay: 1000,
      },
      {
        command: 'cat /etc/resolv.conf',
        descriptionKey: 'macros.step_show_dns',
        delay: 500,
      },
      {
        command: 'ping -c 4 192.168.1.1',
        descriptionKey: 'macros.step_test_gateway',
        delay: 5000,
        optional: true,
      },
    ],
  },
  {
    id: 'firmware_info',
    nameKey: 'macros.firmware_info',
    descriptionKey: 'macros.firmware_info_desc',
    category: 'diagnostic',
    estimatedDuration: 10,
    riskLevel: 'safe',
    requiresExpertMode: false,
    steps: [
      {
        command: 'cat /net/rcc/mnt/efs-persist/FW/version.txt',
        descriptionKey: 'macros.step_fw_version',
        delay: 500,
      },
      {
        command: 'cat /net/rcc/mnt/efs-persist/HWVersion',
        descriptionKey: 'macros.step_hw_version',
        delay: 500,
      },
      {
        command: 'cat /net/rcc/mnt/efs-persist/serialnumber',
        descriptionKey: 'macros.step_serial_number',
        delay: 500,
      },
      {
        command: 'uname -a',
        descriptionKey: 'macros.step_system_info',
        delay: 500,
      },
    ],
  },

  // ========== MAINTENANCE MACROS ==========
  {
    id: 'cleanup_system',
    nameKey: 'macros.cleanup_system',
    descriptionKey: 'macros.cleanup_system_desc',
    category: 'maintenance',
    estimatedDuration: 15,
    riskLevel: 'moderate',
    requiresExpertMode: true,
    steps: [
      {
        command: 'df -h',
        descriptionKey: 'macros.step_check_space_before',
        delay: 1000,
      },
      {
        command: 'rm -f /tmp/*',
        descriptionKey: 'macros.step_clean_temp',
        delay: 2000,
        optional: true,
      },
      {
        command: 'find /var/log -name "*.log" -type f -mtime +7 -delete',
        descriptionKey: 'macros.step_delete_old_logs',
        delay: 2000,
        optional: true,
      },
      {
        command: 'df -h',
        descriptionKey: 'macros.step_check_space_after',
        delay: 1000,
      },
    ],
  },
];

// Category keys for translation
export const MACRO_CATEGORY_KEYS = {
  backup: 'macros.category_backup',
  adaptation: 'macros.category_adaptation',
  diagnostic: 'macros.category_diagnostic',
  maintenance: 'macros.category_maintenance',
  custom: 'macros.category_custom',
} as const;

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
 * Get category key for translation
 */
export function getCategoryKey(category: CommandMacro['category']): string {
  return MACRO_CATEGORY_KEYS[category];
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
