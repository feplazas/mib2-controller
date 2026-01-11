import AsyncStorage from '@react-native-async-storage/async-storage';
import { usbService } from './usb-service';
import { backupService } from './backup-service';
import type { UsbDevice } from './usb-service';

const CUSTOM_PROFILES_KEY = '@mib2_custom_profiles';

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
  notes: string;
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
    notes: 'Versión alternativa del DUB-E100, también compatible con MIB2.',
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
    notes: 'Adaptador Gigabit común. Requiere spoofing para MIB2.',
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
    notes: 'Adaptador Fast Ethernet de TP-Link. Requiere spoofing.',
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
    category: 'common_adapters',
    compatible: false,
    notes: 'Adaptador ASIX común. Ideal para spoofing a D-Link DUB-E100.',
    icon: '🔧',
  },
  {
    id: 'asix_ax88772',
    name: 'ASIX AX88772 Generic',
    manufacturer: 'ASIX',
    model: 'AX88772',
    vendorId: 0x0B95,
    productId: 0x7720,
    chipset: 'ASIX AX88772',
    category: 'common_adapters',
    compatible: false,
    notes: 'Chipset ASIX genérico. Compatible con spoofing.',
    icon: '🔧',
  },
  {
    id: 'asix_ax88772a',
    name: 'ASIX AX88772A Generic',
    manufacturer: 'ASIX',
    model: 'AX88772A',
    vendorId: 0x0B95,
    productId: 0x772A,
    chipset: 'ASIX AX88772A',
    category: 'common_adapters',
    compatible: false,
    notes: 'Chipset ASIX genérico (versión A). Compatible con spoofing.',
    icon: '🔧',
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
    notes: 'Chipset Realtek Gigabit común. Requiere spoofing.',
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
    notes: 'Adaptador Belkin USB-C. Requiere spoofing.',
    icon: '🔧',
  },
];

/**
 * Profiles Service - Gestión de perfiles VID/PID
 */
class ProfilesService {
  /**
   * Obtener todos los perfiles predefinidos
   */
  getPredefinedProfiles(): VIDPIDProfile[] {
    return PREDEFINED_PROFILES;
  }

  /**
   * Obtener perfiles por categoría
   */
  getProfilesByCategory(category: VIDPIDProfile['category']): VIDPIDProfile[] {
    return PREDEFINED_PROFILES.filter(p => p.category === category);
  }

  /**
   * Obtener perfil por ID
   */
  getProfileById(id: string): VIDPIDProfile | null {
    const predefined = PREDEFINED_PROFILES.find(p => p.id === id);
    if (predefined) return predefined;
    
    // Buscar en perfiles personalizados
    // TODO: Implementar cuando se agregue soporte para perfiles custom
    return null;
  }

  /**
   * Buscar perfil que coincida con VID/PID
   */
  findProfileByVIDPID(vendorId: number, productId: number): VIDPIDProfile | null {
    return PREDEFINED_PROFILES.find(
      p => p.vendorId === vendorId && p.productId === productId
    ) || null;
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
        throw new Error('Verificación falló: valores escritos no coinciden');
      }
      
      console.log(`[ProfilesService] Profile applied successfully: ${profile.name}`);
      return { success: true, backupId };
    } catch (error) {
      console.error('[ProfilesService] Error applying profile:', error);
      throw new Error(`No se pudo aplicar el perfil: ${error}`);
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
  canDeviceBeSpoof(device: UsbDevice): { canSpoof: boolean; reason?: string } {
    // Verificar si es chipset ASIX
    const isASIX = device.chipset?.toLowerCase().includes('asix') || 
                   device.vendorId === 0x0B95;
    
    if (!isASIX) {
      return {
        canSpoof: false,
        reason: 'Solo chipsets ASIX soportan spoofing de EEPROM',
      };
    }
    
    // Verificar si ya tiene VID/PID compatible
    const currentProfile = this.findProfileByVIDPID(device.vendorId, device.productId);
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
  getStats(): {
    total: number;
    compatible: number;
    asix: number;
    realtek: number;
    categories: Record<string, number>;
  } {
    const stats = {
      total: PREDEFINED_PROFILES.length,
      compatible: PREDEFINED_PROFILES.filter(p => p.compatible).length,
      asix: PREDEFINED_PROFILES.filter(p => p.chipset.toLowerCase().includes('asix')).length,
      realtek: PREDEFINED_PROFILES.filter(p => p.chipset.toLowerCase().includes('realtek')).length,
      categories: {} as Record<string, number>,
    };
    
    // Contar por categoría
    PREDEFINED_PROFILES.forEach(p => {
      stats.categories[p.category] = (stats.categories[p.category] || 0) + 1;
    });
    
    return stats;
  }
}

export const profilesService = new ProfilesService();
