import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { profilesService, type VIDPIDProfile } from '@/lib/profiles-service';
import { useUsbStatus } from '@/lib/usb-status-context';
import * as Haptics from 'expo-haptics';

export default function CustomProfileEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditing = !!params.profileId;
  const { status, device } = useUsbStatus();

  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [chipset, setChipset] = useState('');
  const [compatible, setCompatible] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const detectFromUSB = async () => {
    if (status !== 'connected' || !device) {
      Alert.alert(
        '⚠️ Sin Dispositivo',
        'Conecta un dispositivo USB para detectar automáticamente sus valores VID/PID.',
        [{ text: 'OK' }]
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Auto-completar campos desde el dispositivo conectado
    setVendorId(device.vendorId.toString(16).padStart(4, '0').toUpperCase());
    setProductId(device.productId.toString(16).padStart(4, '0').toUpperCase());
    
    if (device.chipset) {
      setChipset(device.chipset);
    }
    
    if (device.manufacturer) {
      setManufacturer(device.manufacturer);
    }
    
    if (device.product) {
      setModel(device.product);
      if (!name) {
        setName(device.product);
      }
    }

    // Verificar si es compatible con MIB2
    const isASIX = device.chipset?.toLowerCase().includes('asix') || device.vendorId === 0x0B95;
    if (isASIX) {
      setNotes('Chipset ASIX detectado - compatible con spoofing de EEPROM');
    }

    Alert.alert(
      '✅ Datos Detectados',
      `VID: ${device.vendorId.toString(16).toUpperCase()}\nPID: ${device.productId.toString(16).toUpperCase()}\nChipset: ${device.chipset || 'Desconocido'}`,
      [{ text: 'OK' }]
    );
  };

  const validateHex = (value: string): boolean => {
    // Validar formato hexadecimal de 4 dígitos (0000-FFFF)
    const hexRegex = /^[0-9A-Fa-f]{4}$/;
    return hexRegex.test(value);
  };

  const handleSave = async () => {
    // Validaciones
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!vendorId.trim() || !validateHex(vendorId)) {
      Alert.alert('Error', 'VID inválido. Debe ser un valor hexadecimal de 4 dígitos (ej: 2001)');
      return;
    }

    if (!productId.trim() || !validateHex(productId)) {
      Alert.alert('Error', 'PID inválido. Debe ser un valor hexadecimal de 4 dígitos (ej: 3C05)');
      return;
    }

    // Verificar duplicados
    const vid = parseInt(vendorId, 16);
    const pid = parseInt(productId, 16);
    const duplicateCheck = await profilesService.checkDuplicateProfile(
      vid, 
      pid, 
      isEditing ? params.profileId as string : undefined
    );

    if (duplicateCheck.isDuplicate && duplicateCheck.existingProfile) {
      const existing = duplicateCheck.existingProfile;
      const message = duplicateCheck.isPredefined
        ? `Ya existe un perfil predefinido con este VID/PID:\n\n"${existing.name}"\n(${existing.manufacturer})\n\nNo puedes crear un perfil duplicado.`
        : `Ya existe un perfil personalizado con este VID/PID:\n\n"${existing.name}"\n\n¿Deseas editar el perfil existente en lugar de crear uno nuevo?`;

      if (duplicateCheck.isPredefined) {
        Alert.alert('⚠️ Perfil Duplicado', message, [{ text: 'OK' }]);
        return;
      } else {
        return new Promise<void>((resolve) => {
          Alert.alert(
            '⚠️ Perfil Duplicado',
            message,
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve() },
              {
                text: 'Editar Existente',
                onPress: () => {
                  router.push({ pathname: '/(tabs)/custom-profile-editor', params: { profileId: existing.id } });
                  resolve();
                },
              },
            ]
          );
        });
      }
    }

    setIsSaving(true);

    try {
      const profile = {
        name: name.trim(),
        manufacturer: manufacturer.trim() || 'Personalizado',
        model: model.trim() || 'Custom',
        vendorId: vid,
        productId: pid,
        chipset: chipset.trim() || 'Desconocido',
        compatible,
        notes: notes.trim(),
        icon: '🔧',
      };

      if (isEditing) {
        await profilesService.updateCustomProfile(params.profileId as string, profile);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅ Perfil Actualizado', 'El perfil personalizado se actualizó correctamente', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await profilesService.saveCustomProfile(profile);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅ Perfil Creado', 'El perfil personalizado se guardó correctamente', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'No se pudo guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-foreground mb-2">
              {isEditing ? '✏️ Editar Perfil' : '➕ Nuevo Perfil'}
            </Text>
            <Text className="text-sm text-muted text-center">
              {isEditing 
                ? 'Modifica los valores del perfil personalizado'
                : 'Crea un perfil VID/PID personalizado para tus adaptadores'
              }
            </Text>
          </View>

          {/* Botón Detectar desde USB */}
          <TouchableOpacity
            onPress={detectFromUSB}
            className={`rounded-xl p-4 items-center flex-row justify-center gap-2 ${
              status === 'connected' ? 'bg-green-500' : 'bg-border'
            }`}
          >
            <Text className="text-2xl">🔍</Text>
            <View>
              <Text className={`text-sm font-bold ${
                status === 'connected' ? 'text-white' : 'text-muted'
              }`}>
                Detectar desde USB
              </Text>
              <Text className={`text-xs ${
                status === 'connected' ? 'text-white/80' : 'text-muted'
              }`}>
                {status === 'connected' 
                  ? `Dispositivo conectado: ${device?.product || 'USB'}` 
                  : 'Conecta un dispositivo USB'
                }
              </Text>
            </View>
          </TouchableOpacity>

          {/* Formulario */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            {/* Nombre */}
            <View>
              <Text className="text-sm font-bold text-foreground mb-2">
                Nombre *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="ej: Mi Adaptador USB"
                placeholderTextColor="#9BA1A6"
                className="bg-background rounded-lg p-3 text-foreground border border-border"
              />
            </View>

            {/* Fabricante */}
            <View>
              <Text className="text-sm font-bold text-foreground mb-2">
                Fabricante
              </Text>
              <TextInput
                value={manufacturer}
                onChangeText={setManufacturer}
                placeholder="ej: D-Link, TP-Link, ASIX"
                placeholderTextColor="#9BA1A6"
                className="bg-background rounded-lg p-3 text-foreground border border-border"
              />
            </View>

            {/* Modelo */}
            <View>
              <Text className="text-sm font-bold text-foreground mb-2">
                Modelo
              </Text>
              <TextInput
                value={model}
                onChangeText={setModel}
                placeholder="ej: DUB-E100, AX88772"
                placeholderTextColor="#9BA1A6"
                className="bg-background rounded-lg p-3 text-foreground border border-border"
              />
            </View>

            {/* VID */}
            <View>
              <Text className="text-sm font-bold text-foreground mb-2">
                Vendor ID (VID) *
              </Text>
              <TextInput
                value={vendorId}
                onChangeText={(text) => setVendorId(text.toUpperCase())}
                placeholder="2001"
                placeholderTextColor="#9BA1A6"
                maxLength={4}
                autoCapitalize="characters"
                className="bg-background rounded-lg p-3 text-foreground border border-border font-mono"
              />
              <Text className="text-xs text-muted mt-1">
                4 dígitos hexadecimales (0000-FFFF)
              </Text>
            </View>

            {/* PID */}
            <View>
              <Text className="text-sm font-bold text-foreground mb-2">
                Product ID (PID) *
              </Text>
              <TextInput
                value={productId}
                onChangeText={(text) => setProductId(text.toUpperCase())}
                placeholder="3C05"
                placeholderTextColor="#9BA1A6"
                maxLength={4}
                autoCapitalize="characters"
                className="bg-background rounded-lg p-3 text-foreground border border-border font-mono"
              />
              <Text className="text-xs text-muted mt-1">
                4 dígitos hexadecimales (0000-FFFF)
              </Text>
            </View>

            {/* Chipset */}
            <View>
              <Text className="text-sm font-bold text-foreground mb-2">
                Chipset
              </Text>
              <TextInput
                value={chipset}
                onChangeText={setChipset}
                placeholder="ej: ASIX AX88772, Realtek RTL8153"
                placeholderTextColor="#9BA1A6"
                className="bg-background rounded-lg p-3 text-foreground border border-border"
              />
            </View>

            {/* Compatible MIB2 */}
            <View>
              <Text className="text-sm font-bold text-foreground mb-2">
                Compatible con MIB2
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setCompatible(true)}
                  className={`flex-1 rounded-lg p-3 items-center ${
                    compatible ? 'bg-green-500' : 'bg-background border border-border'
                  }`}
                >
                  <Text className={`text-sm font-bold ${
                    compatible ? 'text-white' : 'text-foreground'
                  }`}>
                    ✅ Sí
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCompatible(false)}
                  className={`flex-1 rounded-lg p-3 items-center ${
                    !compatible ? 'bg-red-500' : 'bg-background border border-border'
                  }`}
                >
                  <Text className={`text-sm font-bold ${
                    !compatible ? 'text-white' : 'text-foreground'
                  }`}>
                    ❌ No
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-muted mt-1">
                Marca como compatible si este VID/PID funciona con MIB2
              </Text>
            </View>

            {/* Notas */}
            <View>
              <Text className="text-sm font-bold text-foreground mb-2">
                Notas
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Información adicional sobre el adaptador..."
                placeholderTextColor="#9BA1A6"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-background rounded-lg p-3 text-foreground border border-border"
              />
            </View>
          </View>

          {/* Vista Previa */}
          {vendorId && productId && validateHex(vendorId) && validateHex(productId) && (
            <View className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500">
              <Text className="text-lg font-bold text-foreground mb-3">
                📋 Vista Previa
              </Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">VID:PID:</Text>
                  <Text className="text-sm text-foreground font-mono font-bold">
                    {vendorId.padStart(4, '0')}:{productId.padStart(4, '0')}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Decimal:</Text>
                  <Text className="text-sm text-foreground">
                    {parseInt(vendorId, 16)} : {parseInt(productId, 16)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Información */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              ℹ️ Información
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">
                • Los campos marcados con * son obligatorios
              </Text>
              <Text className="text-sm text-muted">
                • VID y PID deben ser valores hexadecimales de 4 dígitos
              </Text>
              <Text className="text-sm text-muted">
                • Puedes encontrar VID/PID en "Estado USB" al conectar el dispositivo
              </Text>
              <Text className="text-sm text-muted">
                • Los perfiles personalizados se guardan localmente en tu dispositivo
              </Text>
            </View>
          </View>

          {/* Botones */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={isSaving}
              className="flex-1 bg-border rounded-xl p-4 items-center"
            >
              <Text className="text-sm font-bold text-foreground">
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className={`flex-1 rounded-xl p-4 items-center ${
                isSaving ? 'bg-border' : 'bg-primary'
              }`}
            >
              <Text className={`text-sm font-bold ${
                isSaving ? 'text-muted' : 'text-background'
              }`}>
                {isSaving ? '⏳ Guardando...' : (isEditing ? '💾 Actualizar' : '💾 Guardar')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
