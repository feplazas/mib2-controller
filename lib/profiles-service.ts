import AsyncStorage from '@react-native-async-storage/async-storage';
import { usbService } from './usb-service';
import { backupService } from './backup-service';
import type { UsbDevice } from './usb-service';

const CUSTOM_PROFILES_KEY = '@mib2_custom_profiles';
const PREDEFINED_PROFILES_CACHE_KEY = '@mib2_predefined_profiles_cache';
const CACHE_METADATA_KEY = '@mib2_cache_metadata';

export interface CacheMetadata {
  lastUpdated: number;
  version: string;
  profileCount: number;
}

export interface VIDPIDProfile {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  vendorId: number;
  productId: number;
  chipset: string;
  category: 'mib2_compatible' | 'common_adapters' | 'custom';
  compatible: boolean;
  notes?: string;
  notesKey?: string;
  icon: string;
}

/**
 * Perfiles predefinidos de VID/PID
 */
const PREDEFINED_PROFILES: VIDPIDProfile[] = [
  // MIB2 Compatible (objetivo principal)
  {
    id: 'dlink_dub_e100',
    name: 'D-Link DUB-E100',
    manufacturer: 'D-Link',
    model: 'DUB-E100',
    vendorId: 0x2001,
    productId: 0x3C05,
    chipset: 'ASIX AX88772',
    category: 'mib2_compatible',
    compatible: true,
    notes: 'Adaptador 100% compatible con MIB2. Este es el VID/PID objetivo para spoofing.',
    icon: '✅',
  },
  {
    id: 'dlink_dub_e100_v2',
    name: 'D-Link DUB-E100 (v2)',
    manufacturer: 'D-Link',
    model: 'DUB-E100 Rev. B1',
    vendorId: 0x2001,
    productId: 0x1A02,
    chipset: 'ASIX AX88772A',
    category: 'mib2_compatible',
    compatible: true,
    notesKey: 'profiles.dub_e100_b1_notes',
    icon: '✅',
  },
  
  // Adaptadores Comunes (fuentes de spoofing)
  {
    id: 'tplink_ue300',
    name: 'TP-Link UE300',
    manufacturer: 'TP-Link',
    model: 'UE300',
    vendorId: 0x2357,
    productId: 0x0601,
    chipset: 'Realtek RTL8153',
    category: 'common_adapters',
    compatible: false,
    notesKey: 'profiles.tplink_ue300_notes',
    icon: '🔧',
  },
  {
    id: 'tplink_ue200',
    name: 'TP-Link UE200',
    manufacturer: 'TP-Link',
    model: 'UE200',
    vendorId: 0x2357,
    productId: 0x0602,
    chipset: 'Realtek RTL8152',
    category: 'common_adapters',
    compatible: false,
    notesKey: 'profiles.tplink_ue200_notes',
    icon: '🔧',
  },
  {
    id: 'tplink_wl_nwu331gca',
    name: 'TP-Link WL-NWU331GCA',
    manufacturer: 'TP-Link',
    model: 'WL-NWU331GCA',
    vendorId: 0x0B95,
    productId: 0x772B,
    chipset: 'ASIX AX88772B',
    category: 'mib2_compatible',
    compatible: true,
    notes: 'Chipset ASIX AX88772B confirmado. Compatible nativamente con MIB2 sin necesidad de spoofing.',
    icon: '✅',
  },
  {
    id: 'asix_ax88772',
    name: 'ASIX AX88772 Generic',
    manufacturer: 'ASIX',
    model: 'AX88772',
    vendorId: 0x0B95,
    productId: 0x7720,
    chipset: 'ASIX AX88772',
    category: 'mib2_compatible',
    compatible: true,
    notes: 'Chipset ASIX confirmado. Compatible nativamente con MIB2 sin necesidad de spoofing.',
    icon: '✅',
  },
  {
    id: 'asix_ax88772a',
    name: 'ASIX AX88772A Generic',
    manufacturer: 'ASIX',
    model: 'AX88772A',
    vendorId: 0x0B95,
    productId: 0x772A,
    chipset: 'ASIX AX88772A',
    category: 'mib2_compatible',
    compatible: true,
    notes: 'Chipset ASIX confirmado. Compatible nativamente con MIB2 sin necesidad de spoofing.',
    icon: '✅',
  },
  {
    id: 'asix_ax88172',
    name: 'ASIX AX88172 Generic',
    manufacturer: 'ASIX',
    model: 'AX88172',
    vendorId: 0x0B95,
    productId: 0x1720,
    chipset: 'ASIX AX88172',
    category: 'mib2_compatible',
    compatible: true,
    notes: 'Chipset ASIX experimental. Requiere spoofing para hacerse compatible con MIB2. Comparte arquitectura EEPROM similar a AX88772.',
    icon: '⚠️',
  },
  {
    id: 'asix_ax88772c',
    name: 'ASIX AX88772C Generic',
    manufacturer: 'ASIX',
    model: 'AX88772C',
    vendorId: 0x0B95,
    productId: 0x172A,
    chipset: 'ASIX AX88772C',
    category: 'mib2_compatible',
    compatible: true,
    notes: 'Chipset ASIX experimental (versión mejorada del AX88772B). Requiere spoofing para hacerse compatible con MIB2.',
    icon: '⚠️',
  },
  {
    id: 'realtek_rtl8153',
    name: 'Realtek RTL8153 Generic',
    manufacturer: 'Realtek',
    model: 'RTL8153',
    vendorId: 0x0BDA,
    productId: 0x8153,
    chipset: 'Realtek RTL8153',
    category: 'common_adapters',
    compatible: false,
    notesKey: 'profiles.realtek_rtl8153_notes',
    icon: '🔧',
  },
  {
    id: 'realtek_rtl8152',
    name: 'Realtek RTL8152 Generic',
    manufacturer: 'Realtek',
    model: 'RTL8152',
    vendorId: 0x0BDA,
    productId: 0x8152,
    chipset: 'Realtek RTL8152',
    category: 'common_adapters',
    compatible: false,
    notes: 'Chipset Realtek Fast Ethernet. Requiere spoofing.',
    icon: '🔧',
  },
  
  // Otros adaptadores conocidos
  {
    id: 'apple_usb_ethernet',
    name: 'Apple USB Ethernet',
    manufacturer: 'Apple',
    model: 'USB Ethernet Adapter',
    vendorId: 0x05AC,
    productId: 0x1402,
    chipset: 'ASIX AX88772',
    category: 'common_adapters',
    compatible: false,
    notes: 'Adaptador oficial de Apple. Usa chipset ASIX.',
    icon: '🍎',
  },
  {
    id: 'belkin_usb_ethernet',
    name: 'Belkin USB-C to Ethernet',
    manufacturer: 'Belkin',
    model: 'USB-C to Gigabit Ethernet',
    vendorId: 0x050D,
    productId: 0x0121,
    chipset: 'Realtek RTL8153',
    category: 'common_adapters',
    compatible: false,
    notes: 'Adaptador Belkin USB-C. Chipset Realtek NO compatible con spoofing en Android.',
    icon: '🔧',
  },
  {
    id: 'realtek_rtl8156',
    name: 'Realtek RTL8156 Generic',
    manufacturer: 'Realtek',
    model: 'RTL8156',
    vendorId: 0x0BDA,
    productId: 0x8156,
    chipset: 'Realtek RTL8156',
    category: 'common_adapters',
    compatible: false,
    notes: 'Chipset Realtek 2.5G. NO compatible con spoofing en Android (requiere drivers kernel).',
    icon: '🔧',
  },
  {
    id: 'asix_ax88178',
    name: 'ASIX AX88178 Generic',
    manufacturer: 'ASIX',
    model: 'AX88178',
    vendorId: 0x0B95,
    productId: 0x1780,
    chipset: 'ASIX AX88178',
    category: 'mib2_compatible',
    compatible: true,
    notes: 'Chipset ASIX Gigabit experimental. Requiere spoofing para hacerse compatible con MIB2. Comparte arquitectura EEPROM similar.',
    icon: '⚠️',
  },
  {
    id: 'asix_ax88179',
    name: 'ASIX AX88179 Generic',
    manufacturer: 'ASIX',
    model: 'AX88179',
    vendorId: 0x0B95,
    productId: 0x178A,
    chipset: 'ASIX AX88179',
    category: 'mib2_compatible',
    compatible: true,
    notes: 'Chipset ASIX Gigabit USB 3.0 experimental. Requiere spoofing para hacerse compatible con MIB2. Comparte arquitectura EEPROM similar.',
    icon: '⚠️',
  },
  {
    id: 'microchip_lan9512',
    name: 'Microchip LAN9512/9514',
    manufacturer: 'Microchip',
    model: 'LAN9512/LAN9514',
    vendorId: 0x0424,
    productId: 0xEC00,
    chipset: 'Microchip LAN9512/9514',
    category: 'common_adapters',
    compatible: false,
    notesKey: 'profiles.microchip_lan9512_notes',
    icon: '🔧',
  },
  {
    id: 'microchip_lan7800',
    name: 'Microchip LAN7800',
    manufacturer: 'Microchip',
    model: 'LAN7800',
    vendorId: 0x0424,
    productId: 0x7800,
    chipset: 'Microchip LAN7800',
    category: 'common_adapters',
    compatible: false,
    notesKey: 'profiles.microchip_lan7800_notes',
    icon: '🔧',
  },
  {
    id: 'davicom_dm9601',
    name: 'Davicom DM9601',
    manufacturer: 'Davicom',
    model: 'DM9601',
    vendorId: 0x0FE6,
    productId: 0x9700,
    chipset: 'Davicom DM9601',
    category: 'common_adapters',
    compatible: false,
    notesKey: 'profiles.davicom_dm9601_notes',
    icon: '🔧',
  },
];

/**
 * Profiles Service - Gestión de perfiles VID/PID
 */
class ProfilesService {
  private cacheInitialized = false;

  /**
   * Inicializar cache de perfiles predefinidos
   */
  async initializeCache(): Promise<void> {
    if (this.cacheInitialized) return;
    
    try {
      // Guardar perfiles predefinidos en cache
      await AsyncStorage.setItem(PREDEFINED_PROFILES_CACHE_KEY, JSON.stringify(PREDEFINED_PROFILES));
      
      // Guardar metadata del cache
      const metadata: CacheMetadata = {
        lastUpdated: Date.now(),
        version: '1.0.0',
        profileCount: PREDEFINED_PROFILES.length,
      };
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      
      this.cacheInitialized = true;
      console.log(`[ProfilesService] Cache initialized with ${PREDEFINED_PROFILES.length} profiles`);
    } catch (error) {
      console.error('[ProfilesService] Error initializing cache:', error);
    }
  }

  /**
   * Obtener metadata del cache
   */
  async getCacheMetadata(): Promise<CacheMetadata | null> {
    try {
      const stored = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as CacheMetadata;
    } catch (error) {
      console.error('[ProfilesService] Error getting cache metadata:', error);
      return null;
    }
  }

  /**
   * Cargar perfiles predefinidos desde cache (modo offline)
   */
  async loadCachedPredefinedProfiles(): Promise<VIDPIDProfile[]> {
    try {
      const stored = await AsyncStorage.getItem(PREDEFINED_PROFILES_CACHE_KEY);
      if (!stored) {
        // Si no hay cache, inicializar y devolver predefinidos
        await this.initializeCache();
        return PREDEFINED_PROFILES;
      }
      return JSON.parse(stored) as VIDPIDProfile[];
    } catch (error) {
      console.error('[ProfilesService] Error loading cached profiles:', error);
      return PREDEFINED_PROFILES; // Fallback a predefinidos en memoria
    }
  }

  /**
   * Actualizar cache de perfiles predefinidos (refresh manual)
   */
  async refreshCache(): Promise<{ success: boolean; profileCount: number; timestamp: number }> {
    try {
      await AsyncStorage.setItem(PREDEFINED_PROFILES_CACHE_KEY, JSON.stringify(PREDEFINED_PROFILES));
      
      const metadata: CacheMetadata = {
        lastUpdated: Date.now(),
        version: '1.0.0',
        profileCount: PREDEFINED_PROFILES.length,
      };
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      
      console.log(`[ProfilesService] Cache refreshed with ${PREDEFINED_PROFILES.length} profiles`);
      return {
        success: true,
        profileCount: PREDEFINED_PROFILES.length,
        timestamp: metadata.lastUpdated,
      };
    } catch (error) {
      console.error('[ProfilesService] Error refreshing cache:', error);
      return { success: false, profileCount: 0, timestamp: 0 };
    }
  }

  /**
   * Verificar si el cache está disponible (modo offline)
   */
  async isCacheAvailable(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(PREDEFINED_PROFILES_CACHE_KEY);
      return stored !== null;
    } catch {
      return false;
    }
  }

  /**
   * Cargar perfiles personalizados desde AsyncStorage
   */
  async loadCustomProfiles(): Promise<VIDPIDProfile[]> {
    try {
      const stored = await AsyncStorage.getItem(CUSTOM_PROFILES_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as VIDPIDProfile[];
    } catch (error) {
      console.error('[ProfilesService] Error loading custom profiles:', error);
      return [];
    }
  }

  /**
   * Verificar si existe un perfil con el mismo VID/PID
   */
  async checkDuplicateProfile(vendorId: number, productId: number, excludeId?: string): Promise<{
    isDuplicate: boolean;
    existingProfile?: VIDPIDProfile;
    isPredefined: boolean;
  }> {
    const allProfiles = await this.getAllProfiles();
    
    const existing = allProfiles.find(p => 
      p.vendorId === vendorId && 
      p.productId === productId &&
      p.id !== excludeId
    );
    
    if (existing) {
      return {
        isDuplicate: true,
        existingProfile: existing,
        isPredefined: existing.category !== 'custom',
      };
    }
    
    return { isDuplicate: false, isPredefined: false };
  }

  /**
   * Guardar perfil personalizado
   */
  async saveCustomProfile(profile: Omit<VIDPIDProfile, 'id' | 'category'>): Promise<VIDPIDProfile> {
    try {
      const customProfiles = await this.loadCustomProfiles();
      
      const newProfile: VIDPIDProfile = {
        ...profile,
        id: `custom_${Date.now()}`,
        category: 'custom',
      };
      
      customProfiles.push(newProfile);
      await AsyncStorage.setItem(CUSTOM_PROFILES_KEY, JSON.stringify(customProfiles));
      
      console.log(`[ProfilesService] Custom profile saved: ${newProfile.name}`);
      return newProfile;
    } catch (error) {
      console.error('[ProfilesService] Error saving custom profile:', error);
      throw new Error('No se pudo guardar el perfil personalizado');
    }
  }

  /**
   * Actualizar perfil personalizado existente
   */
  async updateCustomProfile(id: string, updates: Partial<Omit<VIDPIDProfile, 'id' | 'category'>>): Promise<void> {
    try {
      const customProfiles = await this.loadCustomProfiles();
      const index = customProfiles.findIndex(p => p.id === id);
      
      if (index === -1) {
        throw new Error('Perfil no encontrado');
      }
      
      customProfiles[index] = {
        ...customProfiles[index],
        ...updates,
      };
      
      await AsyncStorage.setItem(CUSTOM_PROFILES_KEY, JSON.stringify(customProfiles));
      console.log(`[ProfilesService] Custom profile updated: ${id}`);
    } catch (error) {
      console.error('[ProfilesService] Error updating custom profile:', error);
      throw new Error('No se pudo actualizar el perfil');
    }
  }

  /**
   * Eliminar perfil personalizado
   */
  async deleteCustomProfile(id: string): Promise<void> {
    try {
      const customProfiles = await this.loadCustomProfiles();
      const filtered = customProfiles.filter(p => p.id !== id);
      
      await AsyncStorage.setItem(CUSTOM_PROFILES_KEY, JSON.stringify(filtered));
      console.log(`[ProfilesService] Custom profile deleted: ${id}`);
    } catch (error) {
      console.error('[ProfilesService] Error deleting custom profile:', error);
      throw new Error('No se pudo eliminar el perfil');
    }
  }

  /**
   * Obtener todos los perfiles (predefinidos + personalizados)
   */
  async getAllProfiles(): Promise<VIDPIDProfile[]> {
    const customProfiles = await this.loadCustomProfiles();
    return [...PREDEFINED_PROFILES, ...customProfiles];
  }

  /**
   * Obtener todos los perfiles predefinidos
   */
  getPredefinedProfiles(): VIDPIDProfile[] {
    return PREDEFINED_PROFILES;
  }

  /**
   * Filtrar perfiles por categoría
   */
  async getProfilesByCategory(category: VIDPIDProfile['category']): Promise<VIDPIDProfile[]> {
    const allProfiles = await this.getAllProfiles();
    return allProfiles.filter(p => p.category === category);
  }

    /**
   * Buscar perfil por ID
   */
  async getProfileById(id: string): Promise<VIDPIDProfile | null> {
    const allProfiles = await this.getAllProfiles();
    return allProfiles.find(p => p.id === id) || null;
  }

  /**
   * Buscar perfil por VID/PID
   */
  async findProfileByVIDPID(vendorId: number, productId: number): Promise<VIDPIDProfile | null> {
    const allProfiles = await this.getAllProfiles();
    return allProfiles.find(
      p => p.vendorId === vendorId && p.productId === productId
    ) || null;
  }

  /**
   * Exportar perfil como JSON
   */
  exportProfile(profile: VIDPIDProfile): string {
    return JSON.stringify(profile, null, 2);
  }

  /**
   * Importar perfil desde JSON
   */
  async importProfile(jsonString: string): Promise<VIDPIDProfile> {
    try {
      const profile = JSON.parse(jsonString) as VIDPIDProfile;
      
      // Validar estructura
      if (!profile.name || !profile.vendorId || !profile.productId) {
        throw new Error('profiles.error_invalid_json');
      }
      
      // Guardar como perfil personalizado
      const saved = await this.saveCustomProfile({
        name: profile.name,
        manufacturer: profile.manufacturer || '',
        model: profile.model || '',
        vendorId: profile.vendorId,
        productId: profile.productId,
        chipset: profile.chipset || '',
        compatible: profile.compatible || false,
        notes: profile.notes || '',
        icon: profile.icon || '🔧',
      });
      
      return saved;
    } catch (error) {
      console.error('[ProfilesService] Error importing profile:', error);
      throw new Error('profiles.error_import_failed');
    }
  }

  /**
   * Aplicar perfil a dispositivo conectado
   */
  async applyProfile(
    profile: VIDPIDProfile,
    device: UsbDevice,
    createBackup: boolean = true
  ): Promise<{ success: boolean; backupId?: string }> {
    try {
      console.log(`[ProfilesService] Applying profile: ${profile.name}`);
      
      // Crear backup automático si está habilitado
      let backupId: string | undefined;
      if (createBackup) {
        const backup = await backupService.createBackup(
          device,
          `Backup antes de aplicar perfil: ${profile.name}`
        );
        backupId = backup.id;
        console.log(`[ProfilesService] Backup created: ${backupId}`);
      }
      
      // Convertir VID/PID a bytes little endian
      const vidLow = (profile.vendorId & 0xFF).toString(16).padStart(2, '0');
      const vidHigh = ((profile.vendorId >> 8) & 0xFF).toString(16).padStart(2, '0');
      const pidLow = (profile.productId & 0xFF).toString(16).padStart(2, '0');
      const pidHigh = ((profile.productId >> 8) & 0xFF).toString(16).padStart(2, '0');
      
      console.log(`[ProfilesService] Writing VID: 0x${profile.vendorId.toString(16).padStart(4, '0')} (${vidHigh}${vidLow})`);
      console.log(`[ProfilesService] Writing PID: 0x${profile.productId.toString(16).padStart(4, '0')} (${pidHigh}${pidLow})`);
      
      // Escribir VID (offsets 0x88-0x89)
      await usbService.writeEEPROM(0x88, vidLow);
      await new Promise(resolve => setTimeout(resolve, 100));
      await usbService.writeEEPROM(0x89, vidHigh);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Escribir PID (offsets 0x8A-0x8B)
      await usbService.writeEEPROM(0x8A, pidLow);
      await new Promise(resolve => setTimeout(resolve, 100));
      await usbService.writeEEPROM(0x8B, pidHigh);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar escritura
      const readVidLow = await usbService.readEEPROM(0x88, 1);
      const readVidHigh = await usbService.readEEPROM(0x89, 1);
      const readPidLow = await usbService.readEEPROM(0x8A, 1);
      const readPidHigh = await usbService.readEEPROM(0x8B, 1);
      
      if (
        readVidLow.data.toLowerCase() !== vidLow.toLowerCase() ||
        readVidHigh.data.toLowerCase() !== vidHigh.toLowerCase() ||
        readPidLow.data.toLowerCase() !== pidLow.toLowerCase() ||
        readPidHigh.data.toLowerCase() !== pidHigh.toLowerCase()
      ) {
        throw new Error('profiles.error_verification_failed');
      }
      
      console.log(`[ProfilesService] Profile applied successfully: ${profile.name}`);
      return { success: true, backupId };
    } catch (error) {
      console.error('[ProfilesService] Error applying profile:', error);
      throw new Error('profiles.error_apply_failed');
    }
  }

  /**
   * Obtener perfiles compatibles con MIB2
   */
  getMIB2CompatibleProfiles(): VIDPIDProfile[] {
    return PREDEFINED_PROFILES.filter(p => p.compatible);
  }

  /**
   * Obtener perfiles recomendados para spoofing
   */
  getRecommendedProfiles(): VIDPIDProfile[] {
    // Perfiles MIB2 compatibles son los recomendados
    return this.getMIB2CompatibleProfiles();
  }

  /**
   * Validar si un dispositivo puede ser spoofed
   */
  async canDeviceBeSpoof(device: UsbDevice): Promise<{ canSpoof: boolean; reason?: string; reasonKey?: string }> {
    // Verificar si es chipset ASIX
    const isASIX = device.chipset?.toLowerCase().includes('asix') || 
                   device.vendorId === 0x0B95;
    
    if (!isASIX) {
      // Detectar chipset específico para mensaje personalizado
      const chipsetLower = device.chipset?.toLowerCase() || '';
      
      if (chipsetLower.includes('realtek')) {
        return {
          canSpoof: false,
          reasonKey: 'profiles.realtek_not_compatible',
        };
      }
      
      if (chipsetLower.includes('microchip') || chipsetLower.includes('lan')) {
        return {
          canSpoof: false,
          reasonKey: 'profiles.microchip_not_compatible',
        };
      }
      
      if (chipsetLower.includes('broadcom')) {
        return {
          canSpoof: false,
          reasonKey: 'profiles.broadcom_not_compatible',
        };
      }
      
      if (chipsetLower.includes('davicom')) {
        return {
          canSpoof: false,
          reasonKey: 'profiles.davicom_not_compatible',
        };
      }
      
      return {
        canSpoof: false,
        reasonKey: 'profiles.only_asix_compatible',
      };
    }
    
    // Validación expandida: todos los chipsets ASIX soportan spoofing
    // Los AX88772/A/B están confirmados, otros ASIX son experimentales pero compatibles
    const chipset = device.chipset?.toLowerCase() || '';
    const confirmedModels = ['ax88772', 'ax88772a', 'ax88772b'];
    const isConfirmed = confirmedModels.some(model => chipset.includes(model));
    
    // Todos los ASIX son compatibles (comparten arquitectura de EEPROM)
    // Solo advertimos si es experimental
    if (!isConfirmed) {
      console.log(`[ProfilesService] Chipset ASIX experimental detectado: ${device.chipset}`);
    }
    
    // Verificar si ya tiene VID/PID compatible
    const currentProfile = await this.findProfileByVIDPID(device.vendorId, device.productId);
    if (currentProfile?.compatible) {
      return {
        canSpoof: false,
        reason: 'Dispositivo ya tiene VID/PID compatible con MIB2',
      };
    }
    
    return { canSpoof: true };
  }

  /**
   * Obtener estadísticas de perfiles
   */
  async getStats(): Promise<{
    total: number;
    compatible: number;
    asix: number;
    realtek: number;
    categories: Record<string, number>;
  }> {
    const allProfiles = await this.getAllProfiles();
    const stats = {
      total: allProfiles.length,
      compatible: allProfiles.filter(p => p.compatible).length,
      asix: allProfiles.filter(p => p.chipset.toLowerCase().includes('asix')).length,
      realtek: allProfiles.filter(p => p.chipset.toLowerCase().includes('realtek')).length,
      categories: {} as Record<string, number>,
    };
    
    // Contar por categoría
    allProfiles.forEach(p => {
      stats.categories[p.category] = (stats.categories[p.category] || 0) + 1;
    });
    
    return stats;
  }
}

export const profilesService = new ProfilesService();
