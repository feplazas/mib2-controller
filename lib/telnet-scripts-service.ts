/**
 * Telnet Scripts Service
 * 
 * Scripts predefinidos para la instalación y configuración del Toolbox MIB2.
 * Cada script incluye:
 * - Comando(s) a ejecutar
 * - Descripción clara de lo que hace
 * - Nivel de riesgo (info, warning, danger)
 * - Respuesta esperada para validación
 * - Requiere confirmación del usuario para scripts peligrosos
 * 
 * ADVERTENCIA: Estos scripts modifican el sistema MIB2.
 * El usuario es responsable de su uso.
 */

export type ScriptRiskLevel = 'info' | 'warning' | 'danger';

export type ScriptCategory = 
  | 'verification'    // Comandos de verificación (solo lectura)
  | 'backup'          // Backup del sistema antes de modificaciones
  | 'preparation'     // Preparación del sistema
  | 'installation'    // Instalación del Toolbox
  | 'activation'      // Activación de funciones
  | 'system';         // Comandos del sistema

export interface TelnetScript {
  id: string;
  name: string;
  nameKey: string; // Clave de traducción para el nombre
  description: string;
  descriptionKey: string; // Clave de traducción para la descripción
  category: ScriptCategory;
  commands: string[]; // Comandos a ejecutar en secuencia
  expectedOutput?: string; // Salida esperada (para validación)
  riskLevel: ScriptRiskLevel;
  requiresConfirmation: boolean;
  warningKey?: string; // Clave de traducción para advertencia adicional
  successKey?: string; // Clave de traducción para mensaje de éxito
  order: number; // Orden de ejecución recomendado
}

/**
 * Scripts predefinidos organizados por categoría y orden de ejecución
 */
export const TELNET_SCRIPTS: TelnetScript[] = [
  // ============================================
  // CATEGORÍA: VERIFICACIÓN (Solo lectura)
  // ============================================
  {
    id: 'verify_root',
    name: 'Verificar acceso root',
    nameKey: 'telnet_scripts.verify_root_name',
    description: 'Verifica que tienes acceso root al sistema MIB2',
    descriptionKey: 'telnet_scripts.verify_root_desc',
    category: 'verification',
    commands: ['whoami'],
    expectedOutput: 'root',
    riskLevel: 'info',
    requiresConfirmation: false,
    successKey: 'telnet_scripts.verify_root_success',
    order: 1,
  },
  {
    id: 'list_storage',
    name: 'Listar dispositivos de almacenamiento',
    nameKey: 'telnet_scripts.list_storage_name',
    description: 'Muestra los dispositivos de almacenamiento disponibles (eMMC, SD)',
    descriptionKey: 'telnet_scripts.list_storage_desc',
    category: 'verification',
    commands: ['ls /dev/mmc*'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 2,
  },
  {
    id: 'check_sd_mounted',
    name: 'Verificar si SD está montada',
    nameKey: 'telnet_scripts.check_sd_mounted_name',
    description: 'Verifica si la tarjeta SD ya está montada en /mnt/sd',
    descriptionKey: 'telnet_scripts.check_sd_mounted_desc',
    category: 'verification',
    commands: ['ls /mnt/sd 2>/dev/null || echo "SD no montada"'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 3,
  },
  {
    id: 'check_eso',
    name: 'Verificar instalación existente',
    nameKey: 'telnet_scripts.check_eso_name',
    description: 'Verifica si el Toolbox ya está instalado en /eso',
    descriptionKey: 'telnet_scripts.check_eso_desc',
    category: 'verification',
    commands: ['ls /eso 2>/dev/null || echo "Toolbox no instalado"'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 4,
  },
  {
    id: 'system_info',
    name: 'Información del sistema',
    nameKey: 'telnet_scripts.system_info_name',
    description: 'Muestra información del sistema QNX (versión, memoria, etc.)',
    descriptionKey: 'telnet_scripts.system_info_desc',
    category: 'verification',
    commands: ['uname -a', 'cat /etc/version 2>/dev/null || echo "Version no disponible"'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 5,
  },

  // ============================================
  // CATEGORÍA: BACKUP (Crítico antes de modificaciones)
  // ============================================
  {
    id: 'check_sd_space',
    name: 'Verificar espacio en SD',
    nameKey: 'telnet_scripts.check_sd_space_name',
    description: 'Verifica el espacio disponible en la tarjeta SD para backups',
    descriptionKey: 'telnet_scripts.check_sd_space_desc',
    category: 'backup',
    commands: ['df -h /mnt/sd 2>/dev/null || echo "SD no montada"'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 6,
  },
  {
    id: 'create_backup_dir',
    name: 'Crear directorio de backups',
    nameKey: 'telnet_scripts.create_backup_dir_name',
    description: 'Crea el directorio /mnt/sd/backups para almacenar los respaldos',
    descriptionKey: 'telnet_scripts.create_backup_dir_desc',
    category: 'backup',
    commands: ['mkdir -p /mnt/sd/backups'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 7,
  },
  {
    id: 'backup_tsd_swap',
    name: '⚠️ Backup binario crítico (tsd.swap)',
    nameKey: 'telnet_scripts.backup_tsd_swap_name',
    description: 'OBLIGATORIO: Respalda el binario tsd.mibstd2.system.swap antes de parchear. Sin este backup, no podrás restaurar si algo sale mal.',
    descriptionKey: 'telnet_scripts.backup_tsd_swap_desc',
    category: 'backup',
    commands: ['cp /net/rcc/dev/shmem/tsd.mibstd2.system.swap /mnt/sd/backups/tsd.mibstd2.system.swap.backup.$(date +%Y%m%d_%H%M%S)'],
    riskLevel: 'warning',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.backup_tsd_swap_warning',
    successKey: 'telnet_scripts.backup_tsd_swap_success',
    order: 8,
  },
  {
    id: 'backup_etc',
    name: 'Backup configuración /etc/',
    nameKey: 'telnet_scripts.backup_etc_name',
    description: 'Respalda la configuración del sistema en /etc/',
    descriptionKey: 'telnet_scripts.backup_etc_desc',
    category: 'backup',
    commands: ['tar -czf /mnt/sd/backups/etc_backup_$(date +%Y%m%d_%H%M%S).tar.gz /etc/ 2>/dev/null'],
    riskLevel: 'warning',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.backup_etc_warning',
    successKey: 'telnet_scripts.backup_etc_success',
    order: 9,
  },
  {
    id: 'backup_eso',
    name: 'Backup instalación /eso/',
    nameKey: 'telnet_scripts.backup_eso_name',
    description: 'Respalda la instalación existente del Toolbox (si existe)',
    descriptionKey: 'telnet_scripts.backup_eso_desc',
    category: 'backup',
    commands: ['tar -czf /mnt/sd/backups/eso_backup_$(date +%Y%m%d_%H%M%S).tar.gz /eso/ 2>/dev/null || echo "No existe /eso/ - omitiendo"'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 9,
  },
  {
    id: 'list_backups',
    name: 'Listar backups existentes',
    nameKey: 'telnet_scripts.list_backups_name',
    description: 'Muestra todos los backups guardados en la SD',
    descriptionKey: 'telnet_scripts.list_backups_desc',
    category: 'backup',
    commands: ['ls -lah /mnt/sd/backups/ 2>/dev/null || echo "No hay backups o directorio no existe"'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 9,
  },
  {
    id: 'restore_tsd_swap',
    name: '🔄 Restaurar binario crítico',
    nameKey: 'telnet_scripts.restore_tsd_swap_name',
    description: 'Restaura el binario tsd.mibstd2.system.swap desde el último backup. USAR SOLO SI EL SISTEMA FALLA.',
    descriptionKey: 'telnet_scripts.restore_tsd_swap_desc',
    category: 'backup',
    commands: ['LATEST=$(ls -t /mnt/sd/backups/tsd.mibstd2.system.swap.backup.* 2>/dev/null | head -1) && cp "$LATEST" /net/rcc/dev/shmem/tsd.mibstd2.system.swap && echo "Restaurado desde: $LATEST"'],
    riskLevel: 'danger',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.restore_tsd_swap_warning',
    successKey: 'telnet_scripts.restore_tsd_swap_success',
    order: 9,
  },

  // ============================================
  // CATEGORÍA: PREPARACIÓN
  // ============================================
  {
    id: 'create_mount_point',
    name: 'Crear punto de montaje',
    nameKey: 'telnet_scripts.create_mount_point_name',
    description: 'Crea el directorio /mnt/sd si no existe',
    descriptionKey: 'telnet_scripts.create_mount_point_desc',
    category: 'preparation',
    commands: ['mkdir -p /mnt/sd'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 10,
  },
  {
    id: 'mount_sd_qnx6',
    name: 'Montar SD (QNX6)',
    nameKey: 'telnet_scripts.mount_sd_qnx6_name',
    description: 'Monta la tarjeta SD con sistema de archivos QNX6',
    descriptionKey: 'telnet_scripts.mount_sd_qnx6_desc',
    category: 'preparation',
    commands: ['mount -t qnx6 /dev/mmcblk0p1 /mnt/sd'],
    riskLevel: 'warning',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.mount_sd_warning',
    successKey: 'telnet_scripts.mount_sd_success',
    order: 11,
  },
  {
    id: 'mount_sd_alt1',
    name: 'Montar SD (alternativa 1)',
    nameKey: 'telnet_scripts.mount_sd_alt1_name',
    description: 'Intenta montar SD con ruta alternativa /dev/mmc0t01',
    descriptionKey: 'telnet_scripts.mount_sd_alt1_desc',
    category: 'preparation',
    commands: ['mount -t qnx6 /dev/mmc0t01 /mnt/sd'],
    riskLevel: 'warning',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.mount_sd_warning',
    order: 12,
  },
  {
    id: 'mount_sd_alt2',
    name: 'Montar SD (alternativa 2)',
    nameKey: 'telnet_scripts.mount_sd_alt2_name',
    description: 'Intenta montar SD con ruta alternativa /dev/sd0',
    descriptionKey: 'telnet_scripts.mount_sd_alt2_desc',
    category: 'preparation',
    commands: ['mount -t qnx6 /dev/sd0 /mnt/sd'],
    riskLevel: 'warning',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.mount_sd_warning',
    order: 13,
  },
  {
    id: 'list_sd_contents',
    name: 'Listar contenido de SD',
    nameKey: 'telnet_scripts.list_sd_contents_name',
    description: 'Muestra el contenido de la tarjeta SD montada',
    descriptionKey: 'telnet_scripts.list_sd_contents_desc',
    category: 'preparation',
    commands: ['ls -la /mnt/sd'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 14,
  },

  // ============================================
  // CATEGORÍA: INSTALACIÓN
  // ============================================
  {
    id: 'set_permissions',
    name: 'Establecer permisos de instalación',
    nameKey: 'telnet_scripts.set_permissions_name',
    description: 'Da permisos de ejecución a los scripts de instalación',
    descriptionKey: 'telnet_scripts.set_permissions_desc',
    category: 'installation',
    commands: ['chmod +x /mnt/sd/*.sh 2>/dev/null', 'chmod +x /mnt/sd/bootstrap/*.sh 2>/dev/null'],
    riskLevel: 'warning',
    requiresConfirmation: true,
    order: 20,
  },
  {
    id: 'run_install',
    name: 'Ejecutar instalación principal',
    nameKey: 'telnet_scripts.run_install_name',
    description: 'Ejecuta el script install.sh del Toolbox. IMPORTANTE: Sigue las instrucciones en pantalla.',
    descriptionKey: 'telnet_scripts.run_install_desc',
    category: 'installation',
    commands: ['cd /mnt/sd && ./install.sh'],
    riskLevel: 'danger',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.run_install_warning',
    successKey: 'telnet_scripts.run_install_success',
    order: 21,
  },
  {
    id: 'run_install_sh',
    name: 'Ejecutar instalación (sh)',
    nameKey: 'telnet_scripts.run_install_sh_name',
    description: 'Alternativa: Ejecuta install.sh usando el intérprete sh',
    descriptionKey: 'telnet_scripts.run_install_sh_desc',
    category: 'installation',
    commands: ['cd /mnt/sd && sh install.sh'],
    riskLevel: 'danger',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.run_install_warning',
    order: 22,
  },
  {
    id: 'run_bootstrap',
    name: 'Ejecutar bootstrap',
    nameKey: 'telnet_scripts.run_bootstrap_name',
    description: 'Alternativa: Ejecuta el script bootstrap.sh si install.sh falla',
    descriptionKey: 'telnet_scripts.run_bootstrap_desc',
    category: 'installation',
    commands: ['cd /mnt/sd/bootstrap && ./bootstrap.sh'],
    riskLevel: 'danger',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.run_install_warning',
    order: 23,
  },
  {
    id: 'verify_installation',
    name: 'Verificar instalación completada',
    nameKey: 'telnet_scripts.verify_installation_name',
    description: 'Verifica que el Toolbox se instaló correctamente en /eso',
    descriptionKey: 'telnet_scripts.verify_installation_desc',
    category: 'installation',
    commands: ['ls -la /eso'],
    riskLevel: 'info',
    requiresConfirmation: false,
    successKey: 'telnet_scripts.verify_installation_success',
    order: 24,
  },

  // ============================================
  // CATEGORÍA: ACTIVACIÓN
  // ============================================
  {
    id: 'run_gem',
    name: 'Ejecutar Green Engineering Menu',
    nameKey: 'telnet_scripts.run_gem_name',
    description: 'Inicia el menú GEM para parchear y activar funciones',
    descriptionKey: 'telnet_scripts.run_gem_desc',
    category: 'activation',
    commands: ['/eso/bin/gem.sh 2>/dev/null || /mnt/sd/green_engineering_menu/gem.sh'],
    riskLevel: 'warning',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.run_gem_warning',
    order: 30,
  },
  {
    id: 'patch_swap',
    name: 'Parchear sistema (swap)',
    nameKey: 'telnet_scripts.patch_swap_name',
    description: 'Aplica el parche tsd.mibstd2.system.swap para habilitar funciones',
    descriptionKey: 'telnet_scripts.patch_swap_desc',
    category: 'activation',
    commands: ['/eso/bin/patch_swap.sh 2>/dev/null || echo "Usar GEM para parchear"'],
    riskLevel: 'danger',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.patch_swap_warning',
    order: 31,
  },

  // ============================================
  // CATEGORÍA: SISTEMA
  // ============================================
  {
    id: 'reboot_mib',
    name: 'Reiniciar MIB2',
    nameKey: 'telnet_scripts.reboot_mib_name',
    description: 'Reinicia el sistema MIB2. La conexión Telnet se perderá.',
    descriptionKey: 'telnet_scripts.reboot_mib_desc',
    category: 'system',
    commands: ['reboot'],
    riskLevel: 'danger',
    requiresConfirmation: true,
    warningKey: 'telnet_scripts.reboot_warning',
    order: 40,
  },
  {
    id: 'unmount_sd',
    name: 'Desmontar SD',
    nameKey: 'telnet_scripts.unmount_sd_name',
    description: 'Desmonta la tarjeta SD de forma segura',
    descriptionKey: 'telnet_scripts.unmount_sd_desc',
    category: 'system',
    commands: ['umount /mnt/sd'],
    riskLevel: 'warning',
    requiresConfirmation: true,
    order: 41,
  },
  {
    id: 'list_processes',
    name: 'Listar procesos',
    nameKey: 'telnet_scripts.list_processes_name',
    description: 'Muestra los procesos en ejecución del sistema',
    descriptionKey: 'telnet_scripts.list_processes_desc',
    category: 'system',
    commands: ['pidin'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 42,
  },
  {
    id: 'network_info',
    name: 'Información de red',
    nameKey: 'telnet_scripts.network_info_name',
    description: 'Muestra la configuración de red del sistema',
    descriptionKey: 'telnet_scripts.network_info_desc',
    category: 'system',
    commands: ['ifconfig'],
    riskLevel: 'info',
    requiresConfirmation: false,
    order: 43,
  },
];

/**
 * Obtener scripts por categoría
 */
export function getScriptsByCategory(category: ScriptCategory): TelnetScript[] {
  return TELNET_SCRIPTS
    .filter(s => s.category === category)
    .sort((a, b) => a.order - b.order);
}

/**
 * Obtener script por ID
 */
export function getScriptById(id: string): TelnetScript | undefined {
  return TELNET_SCRIPTS.find(s => s.id === id);
}

/**
 * Obtener todos los scripts ordenados
 */
export function getAllScripts(): TelnetScript[] {
  return [...TELNET_SCRIPTS].sort((a, b) => a.order - b.order);
}

/**
 * Obtener scripts seguros (solo lectura)
 */
export function getSafeScripts(): TelnetScript[] {
  return TELNET_SCRIPTS
    .filter(s => s.riskLevel === 'info')
    .sort((a, b) => a.order - b.order);
}

/**
 * Obtener scripts que requieren confirmación
 */
export function getDangerousScripts(): TelnetScript[] {
  return TELNET_SCRIPTS
    .filter(s => s.requiresConfirmation)
    .sort((a, b) => a.order - b.order);
}

/**
 * Categorías disponibles con metadatos
 */
export const SCRIPT_CATEGORIES: { id: ScriptCategory; nameKey: string; descriptionKey: string; icon: string }[] = [
  {
    id: 'verification',
    nameKey: 'telnet_scripts.category_verification',
    descriptionKey: 'telnet_scripts.category_verification_desc',
    icon: '🔍',
  },
  {
    id: 'preparation',
    nameKey: 'telnet_scripts.category_preparation',
    descriptionKey: 'telnet_scripts.category_preparation_desc',
    icon: '📂',
  },
  {
    id: 'installation',
    nameKey: 'telnet_scripts.category_installation',
    descriptionKey: 'telnet_scripts.category_installation_desc',
    icon: '📦',
  },
  {
    id: 'activation',
    nameKey: 'telnet_scripts.category_activation',
    descriptionKey: 'telnet_scripts.category_activation_desc',
    icon: '⚡',
  },
  {
    id: 'system',
    nameKey: 'telnet_scripts.category_system',
    descriptionKey: 'telnet_scripts.category_system_desc',
    icon: '⚙️',
  },
];

/**
 * Flujo de instalación recomendado (IDs de scripts en orden)
 */
export const RECOMMENDED_INSTALLATION_FLOW: string[] = [
  'verify_root',
  'list_storage',
  'create_mount_point',
  'mount_sd_qnx6',
  'list_sd_contents',
  'set_permissions',
  'run_install',
  'verify_installation',
  'reboot_mib',
];

/**
 * Obtener el flujo de instalación recomendado como scripts
 */
export function getRecommendedFlow(): TelnetScript[] {
  return RECOMMENDED_INSTALLATION_FLOW
    .map(id => getScriptById(id))
    .filter((s): s is TelnetScript => s !== undefined);
}
