import { ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useUsbStatus } from '@/lib/usb-status-context';
import { profilesService, type VIDPIDProfile } from '@/lib/profiles-service';
import * as Haptics from 'expo-haptics';

export default function VIDPIDProfilesScreen() {
  const { status, device } = useUsbStatus();
  const [isApplying, setIsApplying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mib2_compatible' | 'common_adapters' | 'custom'>('all');
  const [allProfiles, setAllProfiles] = useState<VIDPIDProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<VIDPIDProfile[]>([]);
  const [stats, setStats] = useState({ total: 0, compatible: 0, asix: 0, realtek: 0, categories: {} as Record<string, number> });
  const [cacheInfo, setCacheInfo] = useState<{ lastUpdated: number | null; isOffline: boolean }>({ lastUpdated: null, isOffline: false });

  // Cargar perfiles y cache al montar
  useEffect(() => {
    loadProfiles();
    loadCacheInfo();
  }, []);

  // Filtrar perfiles cuando cambia la categoría
  useEffect(() => {
    filterProfiles();
  }, [selectedCategory, allProfiles]);

  const loadCacheInfo = async () => {
    const metadata = await profilesService.getCacheMetadata();
    const isOffline = await profilesService.isCacheAvailable();
    setCacheInfo({
      lastUpdated: metadata?.lastUpdated || null,
      isOffline: isOffline,
    });
  };

  const loadProfiles = async () => {
    // Inicializar cache si es primera vez
    await profilesService.initializeCache();
    const profiles = await profilesService.getAllProfiles();
    const profileStats = await profilesService.getStats();
    setAllProfiles(profiles);
    setStats(profileStats);
  };

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    try {
      const result = await profilesService.refreshCache();
      if (result.success) {
        await loadProfiles();
        await loadCacheInfo();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅ Cache Actualizado', `${result.profileCount} perfiles sincronizados`);
      } else {
        Alert.alert('Error', 'No se pudo actualizar el cache');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al actualizar cache');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdated = (timestamp: number | null): string => {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const filterProfiles = async () => {
    if (selectedCategory === 'all') {
      setFilteredProfiles(allProfiles);
    } else {
      const filtered = await profilesService.getProfilesByCategory(selectedCategory);
      setFilteredProfiles(filtered);
    }
  };

  const formatVIDPID = (vid: number, pid: number): string => {
    return `${vid.toString(16).padStart(4, '0').toUpperCase()}:${pid.toString(16).padStart(4, '0').toUpperCase()}`;
  };

  const handleApplyProfile = async (profile: VIDPIDProfile) => {
    if (!device) {
      Alert.alert('Error', 'No hay dispositivo USB conectado');
      return;
    }

    // Validar si el dispositivo puede ser spoofed
    const validation = await profilesService.canDeviceBeSpoof(device);
    if (!validation.canSpoof) {
      Alert.alert('⚠️ No Compatible', validation.reason || 'Dispositivo no compatible con spoofing');
      return;
    }

    // Confirmar aplicación
    Alert.alert(
      '⚠️ Confirmar Aplicación de Perfil',
      `¿Deseas aplicar el perfil "${profile.name}"?\n\n` +
      `VID:PID Actual: ${formatVIDPID(device.vendorId, device.productId)}\n` +
      `VID:PID Nuevo: ${formatVIDPID(profile.vendorId, profile.productId)}\n\n` +
      `Se creará un backup automático antes de modificar la EEPROM.\n\n` +
      `Esta operación es PERMANENTE hasta que restaures el backup o apliques otro perfil.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aplicar',
          style: 'destructive',
          onPress: () => performApplyProfile(profile),
        },
      ]
    );
  };

  const performApplyProfile = async (profile: VIDPIDProfile) => {
    if (!device) return;

    setIsApplying(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await profilesService.applyProfile(profile, device, true);
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '✅ Perfil Aplicado Exitosamente',
        `Se ha aplicado el perfil "${profile.name}".\n\n` +
        `VID:PID Nuevo: ${formatVIDPID(profile.vendorId, profile.productId)}\n` +
        `Backup ID: ${result.backupId?.substring(0, 16)}...\n\n` +
        `🔌 SIGUIENTE PASO:\n` +
        `1. Desconecta el adaptador USB\n` +
        `2. Espera 5 segundos\n` +
        `3. Vuelve a conectarlo\n` +
        `4. Verifica el nuevo VID/PID en "Estado USB"\n\n` +
        `💾 Puedes restaurar el backup original desde "Herramientas → Backups EEPROM"`
      );
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'No se pudo aplicar el perfil');
    } finally {
      setIsApplying(false);
    }
  };

  const getCategoryColor = (category: VIDPIDProfile['category']): string => {
    switch (category) {
      case 'mib2_compatible':
        return 'bg-green-500/10 border-green-500';
      case 'common_adapters':
        return 'bg-blue-500/10 border-blue-500';
      case 'custom':
        return 'bg-purple-500/10 border-purple-500';
      default:
        return 'bg-border';
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-foreground mb-2">
              📚 Biblioteca de Perfiles
            </Text>
            <Text className="text-sm text-muted text-center">
              Perfiles VID/PID predefinidos y personalizados
            </Text>
          </View>

          {/* Indicador de Cache Offline */}
          <View className="bg-surface rounded-xl p-4 border border-border">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">{cacheInfo.isOffline ? '🟢' : '🔴'}</Text>
                <View>
                  <Text className="text-sm font-bold text-foreground">
                    {cacheInfo.isOffline ? 'Modo Offline Activo' : 'Cache No Disponible'}
                  </Text>
                  <Text className="text-xs text-muted">
                    Última sync: {formatLastUpdated(cacheInfo.lastUpdated)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleRefreshCache}
                disabled={isRefreshing}
                className={`rounded-lg px-3 py-2 ${isRefreshing ? 'bg-border' : 'bg-primary'}`}
              >
                <Text className={`text-xs font-bold ${isRefreshing ? 'text-muted' : 'text-background'}`}>
                  {isRefreshing ? '⏳' : '🔄'} Sync
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón Crear Perfil */}
          <TouchableOpacity
            onPress={() => {
              const router = require('expo-router').router;
              router.push('/(tabs)/custom-profile-editor');
            }}
            className="bg-purple-500 rounded-xl p-4 items-center"
          >
            <Text className="text-sm font-bold text-white">
              ➕ Crear Perfil Personalizado
            </Text>
          </TouchableOpacity>

          {/* Estadísticas */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              📊 Estadísticas
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Total de Perfiles:</Text>
                <Text className="text-sm text-foreground font-bold">
                  {stats.total}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">MIB2 Compatible:</Text>
                <Text className="text-sm text-green-500 font-bold">
                  {stats.compatible}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Chipsets ASIX:</Text>
                <Text className="text-sm text-foreground">
                  {stats.asix}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Chipsets Realtek:</Text>
                <Text className="text-sm text-foreground">
                  {stats.realtek}
                </Text>
              </View>
            </View>
          </View>

          {/* Filtros de Categoría */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setSelectedCategory('all')}
              className={`flex-1 rounded-xl p-3 items-center ${
                selectedCategory === 'all' ? 'bg-primary' : 'bg-surface border border-border'
              }`}
            >
              <Text className={`text-xs font-bold ${
                selectedCategory === 'all' ? 'text-background' : 'text-foreground'
              }`}>
                Todos ({allProfiles.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedCategory('mib2_compatible')}
              className={`flex-1 rounded-xl p-3 items-center ${
                selectedCategory === 'mib2_compatible' ? 'bg-green-500' : 'bg-surface border border-border'
              }`}
            >
              <Text className={`text-xs font-bold ${
                selectedCategory === 'mib2_compatible' ? 'text-white' : 'text-foreground'
              }`}>
                MIB2 ({stats.categories.mib2_compatible || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedCategory('common_adapters')}
              className={`flex-1 rounded-xl p-3 items-center ${
                selectedCategory === 'common_adapters' ? 'bg-blue-500' : 'bg-surface border border-border'
              }`}
            >
              <Text className={`text-xs font-bold ${
                selectedCategory === 'common_adapters' ? 'text-white' : 'text-foreground'
              }`}>
                Comunes ({stats.categories.common_adapters || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedCategory('custom')}
              className={`flex-1 rounded-xl p-3 items-center ${
                selectedCategory === 'custom' ? 'bg-purple-500' : 'bg-surface border border-border'
              }`}
            >
              <Text className={`text-xs font-bold ${
                selectedCategory === 'custom' ? 'text-white' : 'text-foreground'
              }`}>
                Custom ({stats.categories.custom || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Perfiles */}
          {filteredProfiles.map((profile) => (
            <View
              key={profile.id}
              className={`rounded-2xl p-6 border ${getCategoryColor(profile.category)}`}
            >
              {/* Header del Perfil */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className="text-2xl">{profile.icon}</Text>
                    <Text className="text-base font-bold text-foreground">
                      {profile.name}
                    </Text>
                  </View>
                  <Text className="text-xs text-muted">
                    {profile.manufacturer} • {profile.model}
                  </Text>
                </View>
              </View>

              {/* Información del Perfil */}
              <View className="gap-2 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">VID:PID:</Text>
                  <Text className="text-sm text-foreground font-mono font-bold">
                    {formatVIDPID(profile.vendorId, profile.productId)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Chipset:</Text>
                  <Text className="text-sm text-foreground">
                    {profile.chipset}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Compatible MIB2:</Text>
                  <Text className={`text-sm font-bold ${
                    profile.compatible ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {profile.compatible ? '✅ Sí' : '❌ No'}
                  </Text>
                </View>
              </View>

              {/* Notas */}
              <View className="bg-background rounded-lg p-3 mb-4">
                <Text className="text-xs text-muted">
                  {profile.notes}
                </Text>
              </View>

              {/* Botones de Acción */}
              {profile.category === 'custom' ? (
                <View className="gap-2">
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        const router = require('expo-router').router;
                        router.push({ pathname: '/(tabs)/custom-profile-editor', params: { profileId: profile.id } });
                      }}
                      className="flex-1 bg-blue-500 rounded-xl p-3 items-center"
                    >
                      <Text className="text-sm font-bold text-white">
                        ✏️ Editar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        Alert.alert(
                          '⚠️ Eliminar Perfil',
                          `¿Estás seguro de eliminar "${profile.name}"?`,
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Eliminar',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  await profilesService.deleteCustomProfile(profile.id);
                                  await loadProfiles();
                                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                  Alert.alert('✅ Perfil Eliminado', 'El perfil se eliminó correctamente');
                                } catch (error: any) {
                                  Alert.alert('Error', error.message || 'No se pudo eliminar el perfil');
                                }
                              },
                            },
                          ]
                        );
                      }}
                      className="flex-1 bg-red-500 rounded-xl p-3 items-center"
                    >
                      <Text className="text-sm font-bold text-white">
                        🗑️ Eliminar
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleApplyProfile(profile)}
                    disabled={status !== 'connected' || isApplying}
                    className={`rounded-xl p-3 items-center ${
                      status === 'connected' && !isApplying
                        ? 'bg-primary'
                        : 'bg-border'
                    }`}
                  >
                    <Text className={`text-sm font-bold ${
                      status === 'connected' && !isApplying
                        ? 'text-background'
                        : 'text-muted'
                    }`}>
                      {isApplying ? '⏳ Aplicando...' : '🚀 Aplicar Perfil'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleApplyProfile(profile)}
                  disabled={status !== 'connected' || isApplying}
                  className={`rounded-xl p-3 items-center ${
                    status === 'connected' && !isApplying
                      ? 'bg-primary'
                      : 'bg-border'
                  }`}
                >
                  <Text className={`text-sm font-bold ${
                    status === 'connected' && !isApplying
                      ? 'text-background'
                      : 'text-muted'
                  }`}>
                    {isApplying ? '⏳ Aplicando...' : '🚀 Aplicar Perfil'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Información */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              ℹ️ Información
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">
                • Los perfiles MIB2 Compatible son los objetivos de spoofing
              </Text>
              <Text className="text-sm text-muted">
                • Los perfiles Comunes son adaptadores que requieren spoofing
              </Text>
              <Text className="text-sm text-muted">
                • Se crea backup automático antes de aplicar cualquier perfil
              </Text>
              <Text className="text-sm text-muted">
                • Solo chipsets ASIX soportan modificación de EEPROM
              </Text>
              <Text className="text-sm text-muted">
                • Requiere reconexión del adaptador después de aplicar
              </Text>
            </View>
          </View>

          {/* Advertencias */}
          <View className="bg-red-500/10 rounded-2xl p-6 border border-red-500">
            <Text className="text-lg font-bold text-red-500 mb-4">
              ⚠️ ADVERTENCIA
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">
                • La aplicación de perfiles modifica permanentemente la EEPROM
              </Text>
              <Text className="text-sm text-muted">
                • Valores incorrectos pueden inutilizar el adaptador
              </Text>
              <Text className="text-sm text-muted">
                • Siempre verifica el backup antes de aplicar
              </Text>
              <Text className="text-sm text-muted">
                • Puedes restaurar desde "Herramientas → Backups EEPROM"
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
