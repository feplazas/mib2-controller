import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Keys para AsyncStorage
const OFFLINE_GUIDES_KEY = '@mib2_offline_guides';
const OFFLINE_GUIDES_VERSION_KEY = '@mib2_offline_guides_version';
const OFFLINE_GUIDES_TIMESTAMP_KEY = '@mib2_offline_guides_timestamp';

// Versión actual de las guías (incrementar cuando se actualicen)
export const GUIDES_VERSION = '2.0.0';

/**
 * Estructura de una guía offline
 */
export interface OfflineGuide {
  id: string;
  titleKey: string;
  content: GuideContent;
  version: string;
  savedAt: number;
  language: string;
}

/**
 * Contenido de una guía
 */
export interface GuideContent {
  phases?: GuidePhase[];
  troubleshooting?: TroubleshootingItem[];
  resources?: ResourceItem[];
  sections?: GuideSection[];
}

export interface GuideSection {
  title: string;
  steps?: string[];
  items?: GuideSectionItem[];
  note?: string;
  warning?: string;
}

export interface GuideSectionItem {
  name?: string;
  title?: string;
  description?: string;
  command?: string;
  code?: string;
  solution?: string;
}

export interface GuidePhase {
  id: string;
  titleKey: string;
  steps: GuideStep[];
  warnings?: string[];
}

export interface GuideStep {
  number: number;
  titleKey: string;
  descriptionKey?: string;
  commands?: string[];
  warningKey?: string;
  successKey?: string;
}

export interface TroubleshootingItem {
  problemKey: string;
  solutions: string[];
}

export interface ResourceItem {
  titleKey: string;
  descriptionKey: string;
}

/**
 * Estado del modo offline
 */
export interface OfflineStatus {
  isOnline: boolean;
  guidesAvailableOffline: boolean;
  guidesVersion: string | null;
  guidesSavedAt: number | null;
  languages: string[];
}

/**
 * Contenido predefinido de la guía de instalación
 * Este contenido está embebido en la app para acceso offline inmediato
 */
const EMBEDDED_INSTALLATION_GUIDE: GuideContent = {
  phases: [
    {
      id: 'phase1',
      titleKey: 'installation_guide.phase1_title',
      steps: [
        {
          number: 1,
          titleKey: 'installation_guide.verify_connection',
          descriptionKey: 'installation_guide.verify_connection_desc',
          commands: ['ping 192.168.1.4'],
        },
        {
          number: 2,
          titleKey: 'installation_guide.verify_telnet',
          descriptionKey: 'installation_guide.telnet_credentials',
          commands: ['telnet 192.168.1.4'],
        },
        {
          number: 3,
          titleKey: 'installation_guide.verify_root',
          descriptionKey: 'installation_guide.verify_root_desc',
          commands: ['whoami'],
        },
      ],
    },
    {
      id: 'phase2',
      titleKey: 'installation_guide.phase2_title',
      warnings: ['installation_guide.backup_critical'],
      steps: [
        {
          number: 4,
          titleKey: 'installation_guide.mount_sd',
          commands: [
            'mkdir -p /mnt/sd',
            'mount -t qnx6 /dev/mmcblk0p1 /mnt/sd',
            'ls /mnt/sd',
          ],
        },
        {
          number: 5,
          titleKey: 'installation_guide.create_backup_dir',
          commands: ['mkdir -p /mnt/sd/backups', 'df -h /mnt/sd'],
        },
        {
          number: 6,
          titleKey: 'installation_guide.backup_critical_binary',
          descriptionKey: 'installation_guide.backup_critical_desc',
          commands: [
            'cp /net/rcc/dev/shmem/tsd.mibstd2.system.swap /mnt/sd/backups/tsd_original_$(date +%Y%m%d).bin',
            'ls -lh /mnt/sd/backups/',
          ],
        },
        {
          number: 7,
          titleKey: 'installation_guide.backup_config',
          commands: [
            'tar -czf /mnt/sd/backups/etc_backup_$(date +%Y%m%d).tar.gz /etc',
            'tar -czf /mnt/sd/backups/eso_backup_$(date +%Y%m%d).tar.gz /eso 2>/dev/null',
          ],
        },
        {
          number: 8,
          titleKey: 'installation_guide.backup_full_optional',
          warningKey: 'installation_guide.backup_full_time',
          commands: [
            'dd if=/dev/mmcblk0 of=/mnt/sd/backups/mib2_full_backup.img bs=4M status=progress',
            'md5sum /mnt/sd/backups/mib2_full_backup.img > /mnt/sd/backups/mib2_full_backup.img.md5',
          ],
        },
      ],
    },
    {
      id: 'phase3',
      titleKey: 'installation_guide.phase3_title',
      steps: [
        {
          number: 9,
          titleKey: 'installation_guide.copy_toolbox',
          descriptionKey: 'installation_guide.copy_toolbox_desc',
        },
        {
          number: 10,
          titleKey: 'installation_guide.run_installer',
          descriptionKey: 'installation_guide.run_installer_desc',
          commands: ['cd /mnt/sd', 'chmod +x install.sh', './install.sh'],
        },
        {
          number: 11,
          titleKey: 'installation_guide.verify_installation',
          commands: ['ls -la /eso', 'ls -la /eso/bin'],
        },
        {
          number: 12,
          titleKey: 'installation_guide.apply_patch',
          warningKey: 'installation_guide.patch_warning',
          commands: ['/eso/bin/patch_swap.sh'],
        },
        {
          number: 13,
          titleKey: 'installation_guide.reboot_system',
          descriptionKey: 'installation_guide.reboot_desc',
          commands: ['reboot'],
        },
      ],
    },
    {
      id: 'phase4',
      titleKey: 'installation_guide.phase4_title',
      steps: [
        {
          number: 14,
          titleKey: 'installation_guide.reconnect_telnet',
          descriptionKey: 'installation_guide.reconnect_desc',
        },
        {
          number: 15,
          titleKey: 'installation_guide.verify_toolbox',
          successKey: 'installation_guide.installation_complete',
          commands: ['ls /eso/bin', '/eso/bin/gem.sh --help'],
        },
      ],
    },
    {
      id: 'phase5',
      titleKey: 'installation_guide.phase5_title',
      steps: [
        {
          number: 16,
          titleKey: 'installation_guide.restore_binary_title',
          commands: [
            'cp /mnt/sd/backups/tsd_original_YYYYMMDD.bin /net/rcc/dev/shmem/tsd.mibstd2.system.swap',
            'reboot',
          ],
        },
        {
          number: 17,
          titleKey: 'installation_guide.restore_guided_title',
          descriptionKey: 'installation_guide.restore_guided_desc',
          commands: ['chmod +x /mnt/sd/scripts/guided_restore.sh', '/mnt/sd/scripts/guided_restore.sh'],
        },
      ],
    },
  ],
  troubleshooting: [
    {
      problemKey: 'installation_guide.problem_no_connection',
      solutions: [
        'installation_guide.solution_check_cable',
        'installation_guide.solution_check_ip',
        'installation_guide.solution_restart_mib2',
      ],
    },
    {
      problemKey: 'installation_guide.problem_mount_failed',
      solutions: [
        'installation_guide.solution_try_alt_device',
        'installation_guide.solution_check_sd_format',
      ],
    },
    {
      problemKey: 'installation_guide.problem_install_failed',
      solutions: [
        'installation_guide.solution_restore_binary',
        'installation_guide.solution_check_space',
        'installation_guide.solution_check_permissions',
      ],
    },
    {
      problemKey: 'installation_guide.problem_system_broken',
      solutions: ['installation_guide.solution_use_guided_restore'],
    },
  ],
  resources: [
    {
      titleKey: 'installation_guide.resource_scripts',
      descriptionKey: 'installation_guide.resource_scripts',
    },
    {
      titleKey: 'installation_guide.resource_commands',
      descriptionKey: 'installation_guide.resource_commands',
    },
    {
      titleKey: 'installation_guide.resource_backups',
      descriptionKey: 'installation_guide.resource_backups',
    },
    {
      titleKey: 'installation_guide.resource_diagnostics',
      descriptionKey: 'installation_guide.resource_diagnostics',
    },
  ],
};

/**
 * Guía de Troubleshooting embebida
 */
const EMBEDDED_TROUBLESHOOTING_GUIDE: GuideContent = {
  phases: [
    {
      id: 'connection_issues',
      titleKey: 'offline_guides.troubleshooting.connection_title',
      steps: [
        {
          number: 1,
          titleKey: 'offline_guides.troubleshooting.check_adapter',
          descriptionKey: 'offline_guides.troubleshooting.check_adapter_desc',
          commands: ['ping 192.168.1.4'],
        },
        {
          number: 2,
          titleKey: 'offline_guides.troubleshooting.check_cable',
          descriptionKey: 'offline_guides.troubleshooting.check_cable_desc',
        },
        {
          number: 3,
          titleKey: 'offline_guides.troubleshooting.restart_mib2',
          descriptionKey: 'offline_guides.troubleshooting.restart_mib2_desc',
        },
      ],
    },
    {
      id: 'sd_issues',
      titleKey: 'offline_guides.troubleshooting.sd_title',
      steps: [
        {
          number: 4,
          titleKey: 'offline_guides.troubleshooting.mount_sd',
          commands: [
            'mount -t qnx6 /dev/mmcblk0p1 /mnt/sd',
            'mount -t qnx6 /dev/mmc0t01 /mnt/sd',
            'mount -t qnx6 /dev/sd0 /mnt/sd',
          ],
        },
        {
          number: 5,
          titleKey: 'offline_guides.troubleshooting.check_sd_space',
          commands: ['df -h /mnt/sd'],
        },
      ],
    },
    {
      id: 'toolbox_issues',
      titleKey: 'offline_guides.troubleshooting.toolbox_title',
      steps: [
        {
          number: 6,
          titleKey: 'offline_guides.troubleshooting.verify_toolbox',
          commands: ['ls -la /eso/bin', '/eso/bin/gem.sh --help'],
        },
        {
          number: 7,
          titleKey: 'offline_guides.troubleshooting.reinstall_toolbox',
          descriptionKey: 'offline_guides.troubleshooting.reinstall_toolbox_desc',
        },
      ],
    },
  ],
  troubleshooting: [],
  resources: [],
};

/**
 * Guía de Comandos Frecuentes embebida
 */
const EMBEDDED_COMMANDS_GUIDE: GuideContent = {
  phases: [
    {
      id: 'info_commands',
      titleKey: 'offline_guides.commands.info_title',
      steps: [
        {
          number: 1,
          titleKey: 'offline_guides.commands.firmware_version',
          commands: ['cat /net/rcc/mnt/efs-persist/FW/version.txt'],
        },
        {
          number: 2,
          titleKey: 'offline_guides.commands.system_info',
          commands: ['uname -a'],
        },
        {
          number: 3,
          titleKey: 'offline_guides.commands.serial_number',
          commands: ['cat /net/rcc/mnt/efs-persist/serialnumber'],
        },
        {
          number: 4,
          titleKey: 'offline_guides.commands.hardware_version',
          commands: ['cat /net/rcc/mnt/efs-persist/HWVersion'],
        },
      ],
    },
    {
      id: 'diagnostic_commands',
      titleKey: 'offline_guides.commands.diagnostic_title',
      steps: [
        {
          number: 5,
          titleKey: 'offline_guides.commands.memory_info',
          commands: ['free'],
        },
        {
          number: 6,
          titleKey: 'offline_guides.commands.disk_usage',
          commands: ['df -h'],
        },
        {
          number: 7,
          titleKey: 'offline_guides.commands.network_interfaces',
          commands: ['ifconfig'],
        },
        {
          number: 8,
          titleKey: 'offline_guides.commands.running_processes',
          commands: ['ps aux'],
        },
      ],
    },
    {
      id: 'filesystem_commands',
      titleKey: 'offline_guides.commands.filesystem_title',
      steps: [
        {
          number: 9,
          titleKey: 'offline_guides.commands.mount_sd',
          commands: ['mount -t qnx6 /dev/mmcblk0p1 /mnt/sd'],
        },
        {
          number: 10,
          titleKey: 'offline_guides.commands.list_root',
          commands: ['ls -la /'],
        },
        {
          number: 11,
          titleKey: 'offline_guides.commands.list_eso',
          commands: ['ls -la /eso/bin'],
        },
      ],
    },
    {
      id: 'advanced_commands',
      titleKey: 'offline_guides.commands.advanced_title',
      warnings: ['offline_guides.commands.advanced_warning'],
      steps: [
        {
          number: 12,
          titleKey: 'offline_guides.commands.reboot',
          commands: ['reboot'],
          warningKey: 'offline_guides.commands.reboot_warning',
        },
        {
          number: 13,
          titleKey: 'offline_guides.commands.remount_rw',
          commands: ['mount -uw /net/rcc/dev/shmem'],
          warningKey: 'offline_guides.commands.remount_warning',
        },
      ],
    },
  ],
  troubleshooting: [],
  resources: [],
};

/**
 * Guía de Códigos FEC embebida
 */
const EMBEDDED_FEC_GUIDE: GuideContent = {
  phases: [
    {
      id: 'fec_intro',
      titleKey: 'offline_guides.fec.intro_title',
      steps: [
        {
          number: 1,
          titleKey: 'offline_guides.fec.what_is_fec',
          descriptionKey: 'offline_guides.fec.what_is_fec_desc',
        },
      ],
    },
    {
      id: 'fec_connectivity',
      titleKey: 'offline_guides.fec.connectivity_title',
      steps: [
        {
          number: 2,
          titleKey: 'offline_guides.fec.carplay',
          descriptionKey: 'offline_guides.fec.carplay_desc',
          commands: ['# Código: 00010001'],
        },
        {
          number: 3,
          titleKey: 'offline_guides.fec.android_auto',
          descriptionKey: 'offline_guides.fec.android_auto_desc',
          commands: ['# Código: 00010002'],
        },
        {
          number: 4,
          titleKey: 'offline_guides.fec.mirrorlink',
          descriptionKey: 'offline_guides.fec.mirrorlink_desc',
          commands: ['# Código: 00010004'],
        },
        {
          number: 5,
          titleKey: 'offline_guides.fec.appconnect',
          descriptionKey: 'offline_guides.fec.appconnect_desc',
          commands: ['# Código: 00010008'],
        },
      ],
    },
    {
      id: 'fec_performance',
      titleKey: 'offline_guides.fec.performance_title',
      steps: [
        {
          number: 6,
          titleKey: 'offline_guides.fec.perf_monitor',
          descriptionKey: 'offline_guides.fec.perf_monitor_desc',
          commands: ['# Código: 00060001'],
        },
      ],
    },
    {
      id: 'fec_injection',
      titleKey: 'offline_guides.fec.injection_title',
      warnings: ['offline_guides.fec.injection_warning'],
      steps: [
        {
          number: 7,
          titleKey: 'offline_guides.fec.injection_step1',
          commands: ['mount -uw /net/rcc/dev/shmem'],
        },
        {
          number: 8,
          titleKey: 'offline_guides.fec.injection_step2',
          commands: ['echo "00010001" >> /net/rcc/dev/shmem/addfec.txt'],
        },
        {
          number: 9,
          titleKey: 'offline_guides.fec.injection_step3',
          commands: ['reboot'],
        },
      ],
    },
  ],
  troubleshooting: [
    {
      problemKey: 'offline_guides.fec.problem_not_working',
      solutions: [
        'offline_guides.fec.solution_check_toolbox',
        'offline_guides.fec.solution_check_firmware',
        'offline_guides.fec.solution_reboot',
      ],
    },
  ],
  resources: [
    {
      titleKey: 'offline_guides.fec.resource_generator',
      descriptionKey: 'offline_guides.fec.resource_generator_desc',
    },
  ],
};

/**
 * Servicio de guías offline
 */
class OfflineGuidesService {
  private isOnline: boolean = true;
  private unsubscribeNetInfo: (() => void) | null = null;
  private listeners: Set<(status: OfflineStatus) => void> = new Set();

  /**
   * Inicializar el servicio y comenzar a monitorear la conexión
   */
  async initialize(): Promise<void> {
    console.log('[OfflineGuides] Initializing service...');
    
    // Verificar estado inicial de conexión
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? true;
    console.log('[OfflineGuides] Initial connection state:', this.isOnline ? 'online' : 'offline');
    
    // Suscribirse a cambios de conexión
    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? true;
      
      if (wasOnline !== this.isOnline) {
        console.log('[OfflineGuides] Connection changed:', this.isOnline ? 'online' : 'offline');
        this.notifyListeners();
      }
    });
    
    // Guardar guías embebidas si no existen
    await this.ensureEmbeddedGuidesAreSaved();
  }

  /**
   * Limpiar recursos al destruir el servicio
   */
  destroy(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    this.listeners.clear();
  }

  /**
   * Agregar listener para cambios de estado offline
   */
  addListener(listener: (status: OfflineStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notificar a todos los listeners
   */
  private async notifyListeners(): Promise<void> {
    const status = await this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Verificar si hay conexión a internet
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Obtener estado actual del modo offline
   */
  async getStatus(): Promise<OfflineStatus> {
    const [version, timestamp, guides] = await Promise.all([
      AsyncStorage.getItem(OFFLINE_GUIDES_VERSION_KEY),
      AsyncStorage.getItem(OFFLINE_GUIDES_TIMESTAMP_KEY),
      AsyncStorage.getItem(OFFLINE_GUIDES_KEY),
    ]);

    let languages: string[] = [];
    if (guides) {
      try {
        const parsed = JSON.parse(guides) as Record<string, OfflineGuide[]>;
        languages = Object.keys(parsed);
      } catch (e) {
        console.error('[OfflineGuides] Error parsing saved guides:', e);
      }
    }

    return {
      isOnline: this.isOnline,
      guidesAvailableOffline: !!guides && languages.length > 0,
      guidesVersion: version,
      guidesSavedAt: timestamp ? parseInt(timestamp, 10) : null,
      languages,
    };
  }

  /**
   * Asegurar que las guías embebidas estén guardadas
   */
  private async ensureEmbeddedGuidesAreSaved(): Promise<void> {
    const existingGuides = await AsyncStorage.getItem(OFFLINE_GUIDES_KEY);
    
    if (!existingGuides) {
      console.log('[OfflineGuides] No saved guides found, saving embedded guides...');
      await this.saveEmbeddedGuides();
    } else {
      // Verificar versión
      const savedVersion = await AsyncStorage.getItem(OFFLINE_GUIDES_VERSION_KEY);
      if (savedVersion !== GUIDES_VERSION) {
        console.log('[OfflineGuides] Guides version mismatch, updating...');
        await this.saveEmbeddedGuides();
      }
    }
  }

  /**
   * Guardar guías embebidas para todos los idiomas
   */
  private async saveEmbeddedGuides(): Promise<void> {
    const languages = ['en', 'es', 'de'];
    const guides: Record<string, OfflineGuide[]> = {};
    const now = Date.now();

    for (const lang of languages) {
      guides[lang] = [
        {
          id: 'installation_guide',
          titleKey: 'installation_guide.title',
          content: EMBEDDED_INSTALLATION_GUIDE,
          version: GUIDES_VERSION,
          savedAt: now,
          language: lang,
        },
        {
          id: 'troubleshooting_guide',
          titleKey: 'offline_guides.troubleshooting.title',
          content: EMBEDDED_TROUBLESHOOTING_GUIDE,
          version: GUIDES_VERSION,
          savedAt: now,
          language: lang,
        },
        {
          id: 'commands_guide',
          titleKey: 'offline_guides.commands.title',
          content: EMBEDDED_COMMANDS_GUIDE,
          version: GUIDES_VERSION,
          savedAt: now,
          language: lang,
        },
        {
          id: 'fec_guide',
          titleKey: 'offline_guides.fec.title',
          content: EMBEDDED_FEC_GUIDE,
          version: GUIDES_VERSION,
          savedAt: now,
          language: lang,
        },
      ];
    }

    await AsyncStorage.setItem(OFFLINE_GUIDES_KEY, JSON.stringify(guides));
    await AsyncStorage.setItem(OFFLINE_GUIDES_VERSION_KEY, GUIDES_VERSION);
    await AsyncStorage.setItem(OFFLINE_GUIDES_TIMESTAMP_KEY, now.toString());

    console.log('[OfflineGuides] Embedded guides saved for languages:', languages.join(', '));
  }

  /**
   * Obtener guía por ID y idioma
   */
  async getGuide(guideId: string, language: string): Promise<OfflineGuide | null> {
    try {
      const guidesJson = await AsyncStorage.getItem(OFFLINE_GUIDES_KEY);
      if (!guidesJson) return null;

      const guides = JSON.parse(guidesJson) as Record<string, OfflineGuide[]>;
      const langGuides = guides[language] || guides['en'] || [];
      
      return langGuides.find(g => g.id === guideId) || null;
    } catch (error) {
      console.error('[OfflineGuides] Error getting guide:', error);
      return null;
    }
  }

  /**
   * Obtener todas las guías para un idioma
   */
  async getGuidesForLanguage(language: string): Promise<OfflineGuide[]> {
    try {
      const guidesJson = await AsyncStorage.getItem(OFFLINE_GUIDES_KEY);
      if (!guidesJson) return [];

      const guides = JSON.parse(guidesJson) as Record<string, OfflineGuide[]>;
      return guides[language] || guides['en'] || [];
    } catch (error) {
      console.error('[OfflineGuides] Error getting guides:', error);
      return [];
    }
  }

  /**
   * Forzar actualización de guías (re-guardar embebidas)
   */
  async refreshGuides(): Promise<void> {
    console.log('[OfflineGuides] Refreshing guides...');
    await this.saveEmbeddedGuides();
    await this.notifyListeners();
  }

  /**
   * Limpiar todas las guías guardadas
   */
  async clearGuides(): Promise<void> {
    console.log('[OfflineGuides] Clearing all saved guides...');
    await AsyncStorage.multiRemove([
      OFFLINE_GUIDES_KEY,
      OFFLINE_GUIDES_VERSION_KEY,
      OFFLINE_GUIDES_TIMESTAMP_KEY,
    ]);
    await this.notifyListeners();
  }

  /**
   * Obtener tamaño aproximado del almacenamiento usado
   */
  async getStorageSize(): Promise<number> {
    try {
      const guidesJson = await AsyncStorage.getItem(OFFLINE_GUIDES_KEY);
      return guidesJson ? new Blob([guidesJson]).size : 0;
    } catch (error) {
      console.error('[OfflineGuides] Error getting storage size:', error);
      return 0;
    }
  }

  /**
   * Verificar si una guía específica está disponible offline
   */
  async isGuideAvailableOffline(guideId: string, language: string): Promise<boolean> {
    const guide = await this.getGuide(guideId, language);
    return guide !== null;
  }
}

// Singleton instance
export const offlineGuidesService = new OfflineGuidesService();
