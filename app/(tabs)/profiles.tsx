import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useProfiles, type ConnectionProfile } from "@/lib/profiles-provider";
import { useTelnet } from "@/lib/telnet-provider";

export default function ProfilesScreen() {
  const { profiles, activeProfile, createProfile, updateProfile, deleteProfile, setActiveProfile, duplicateProfile } = useProfiles();
  const { connectionStatus, disconnect } = useTelnet();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formHost, setFormHost] = useState('192.168.1.4');
  const [formPort, setFormPort] = useState('23');
  const [formUsername, setFormUsername] = useState('root');
  const [formPassword, setFormPassword] = useState('root');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#0066CC');

  const resetForm = () => {
    setFormName('');
    setFormHost('192.168.1.4');
    setFormPort('23');
    setFormUsername('root');
    setFormPassword('root');
    setFormDescription('');
    setFormColor('#0066CC');
  };

  const loadProfileToForm = (profile: ConnectionProfile) => {
    setFormName(profile.name);
    setFormHost(profile.host);
    setFormPort(profile.port.toString());
    setFormUsername(profile.username);
    setFormPassword(profile.password);
    setFormDescription(profile.description || '');
    setFormColor(profile.color || '#0066CC');
  };

  const handleCreateProfile = async () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'El nombre del perfil es requerido');
      return;
    }

    if (!formHost.trim()) {
      Alert.alert('Error', 'La dirección IP es requerida');
      return;
    }

    try {
      await createProfile({
        name: formName,
        host: formHost,
        port: parseInt(formPort, 10),
        username: formUsername,
        password: formPassword,
        description: formDescription,
        color: formColor,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Éxito', 'Perfil creado correctamente');
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo crear el perfil');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editingProfile) return;

    if (!formName.trim()) {
      Alert.alert('Error', 'El nombre del perfil es requerido');
      return;
    }

    try {
      await updateProfile(editingProfile, {
        name: formName,
        host: formHost,
        port: parseInt(formPort, 10),
        username: formUsername,
        password: formPassword,
        description: formDescription,
        color: formColor,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setEditingProfile(null);
      resetForm();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const handleDeleteProfile = (id: string) => {
    Alert.alert(
      'Eliminar Perfil',
      '¿Estás seguro de que deseas eliminar este perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProfile(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar el perfil');
            }
          },
        },
      ]
    );
  };

  const handleSwitchProfile = async (id: string) => {
    if (connectionStatus.connected) {
      Alert.alert(
        'Cambiar Perfil',
        'Debes desconectarte antes de cambiar de perfil. ¿Desconectar ahora?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desconectar',
            onPress: async () => {
              await disconnect();
              await setActiveProfile(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    } else {
      await setActiveProfile(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDuplicateProfile = async (id: string) => {
    try {
      await duplicateProfile(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Éxito', 'Perfil duplicado correctamente');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo duplicar el perfil');
    }
  };

  const handleEditProfile = (profile: ConnectionProfile) => {
    loadProfileToForm(profile);
    setEditingProfile(profile.id);
  };

  const predefinedColors = [
    '#0066CC', // Blue
    '#22C55E', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ];

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Perfiles</Text>
              <Text className="text-sm text-muted mt-1">
                {profiles.length} {profiles.length === 1 ? 'perfil configurado' : 'perfiles configurados'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setShowCreateForm(true);
              }}
              className="bg-primary px-4 py-2 rounded-lg active:opacity-80"
            >
              <Text className="text-white font-semibold">+ Nuevo</Text>
            </TouchableOpacity>
          </View>

          {/* Create/Edit Form */}
          {(showCreateForm || editingProfile) && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                {editingProfile ? 'Editar Perfil' : 'Nuevo Perfil'}
              </Text>
              
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Nombre del Perfil *
                  </Text>
                  <TextInput
                    value={formName}
                    onChangeText={setFormName}
                    placeholder="Ej: MIB2 Audi A3"
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Dirección IP *
                  </Text>
                  <TextInput
                    value={formHost}
                    onChangeText={setFormHost}
                    placeholder="192.168.1.4"
                    keyboardType="numeric"
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Puerto
                  </Text>
                  <TextInput
                    value={formPort}
                    onChangeText={setFormPort}
                    placeholder="23"
                    keyboardType="numeric"
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Usuario
                  </Text>
                  <TextInput
                    value={formUsername}
                    onChangeText={setFormUsername}
                    placeholder="root"
                    autoCapitalize="none"
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Contraseña
                  </Text>
                  <TextInput
                    value={formPassword}
                    onChangeText={setFormPassword}
                    placeholder="root"
                    secureTextEntry
                    autoCapitalize="none"
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Descripción (opcional)
                  </Text>
                  <TextInput
                    value={formDescription}
                    onChangeText={setFormDescription}
                    placeholder="Ej: Unidad del coche principal"
                    multiline
                    numberOfLines={2}
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Color de Identificación
                  </Text>
                  <View className="flex-row gap-2">
                    {predefinedColors.map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setFormColor(color)}
                        className="w-12 h-12 rounded-full border-2"
                        style={{
                          backgroundColor: color,
                          borderColor: formColor === color ? '#fff' : 'transparent',
                        }}
                      />
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-3 mt-2">
                  <TouchableOpacity
                    onPress={() => {
                      setShowCreateForm(false);
                      setEditingProfile(null);
                      resetForm();
                    }}
                    className="flex-1 bg-muted/20 border border-border px-4 py-3 rounded-xl active:opacity-80"
                  >
                    <Text className="text-foreground font-semibold text-center">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={editingProfile ? handleUpdateProfile : handleCreateProfile}
                    className="flex-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
                  >
                    <Text className="text-white font-semibold text-center">
                      {editingProfile ? 'Actualizar' : 'Crear'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Profiles List */}
          <View className="gap-3">
            {profiles.map((profile) => {
              const isActive = activeProfile?.id === profile.id;
              
              return (
                <View
                  key={profile.id}
                  className={`bg-surface rounded-2xl p-4 border-2 ${
                    isActive ? 'border-primary' : 'border-border'
                  }`}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: profile.color || '#0066CC' }}
                      />
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">
                          {profile.name}
                        </Text>
                        {profile.description && (
                          <Text className="text-xs text-muted mt-1">
                            {profile.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    {isActive && (
                      <View className="bg-primary px-2 py-1 rounded">
                        <Text className="text-white text-xs font-semibold">ACTIVO</Text>
                      </View>
                    )}
                  </View>

                  <View className="bg-background rounded-lg p-3 mb-3">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs text-muted">Host:</Text>
                      <Text className="text-xs text-foreground font-mono">{profile.host}:{profile.port}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Usuario:</Text>
                      <Text className="text-xs text-foreground font-mono">{profile.username}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    {!isActive && (
                      <TouchableOpacity
                        onPress={() => handleSwitchProfile(profile.id)}
                        className="flex-1 bg-primary px-3 py-2 rounded-lg active:opacity-80"
                      >
                        <Text className="text-white font-semibold text-center text-sm">
                          Activar
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleEditProfile(profile)}
                      className="flex-1 bg-muted/20 border border-border px-3 py-2 rounded-lg active:opacity-80"
                    >
                      <Text className="text-foreground font-semibold text-center text-sm">
                        Editar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDuplicateProfile(profile.id)}
                      className="flex-1 bg-muted/20 border border-border px-3 py-2 rounded-lg active:opacity-80"
                    >
                      <Text className="text-foreground font-semibold text-center text-sm">
                        Duplicar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteProfile(profile.id)}
                      className="bg-error/20 border border-error px-3 py-2 rounded-lg active:opacity-80"
                    >
                      <Text className="text-error font-semibold text-center text-sm">
                        🗑️
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Info */}
          <View className="bg-primary/10 border border-primary rounded-xl p-4">
            <Text className="text-sm text-muted leading-relaxed">
              💡 Los perfiles te permiten guardar múltiples configuraciones para diferentes unidades MIB2. 
              Cambia rápidamente entre ellos sin tener que ingresar los datos cada vez.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
