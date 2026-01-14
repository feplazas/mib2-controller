import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Switch } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";
import { useExpertMode } from "@/lib/expert-mode-provider";
import { useUsbStatus } from "@/lib/usb-status-context";
import { usbService } from "@/lib/usb-service";
import * as Clipboard from 'expo-clipboard';
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/i18n";

export default function SettingsScreen() {
  const { config, updateConfig, clearMessages } = useTelnet();
  const { isExpertMode, isPinSet, enableExpertMode, disableExpertMode, setPin, changePin, resetPin } = useExpertMode();
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  
  const [host, setHost] = useState(config.host);
  const [port, setPort] = useState(config.port.toString());
  const [username, setUsername] = useState(config.username);
  const [password, setPassword] = useState(config.password);

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [oldPinInput, setOldPinInput] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const { status, device, devices } = useUsbStatus();

  const handleSaveSettings = async () => {
    try {
      await updateConfig({
        host,
        port: parseInt(port, 10),
        username,
        password,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Éxito', 'Configuración guardada correctamente');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const handleResetDefaults = () => {
    Alert.alert(
      'Restablecer Valores',
      '¿Restaurar la configuración a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            setHost('192.168.1.4');
            setPort('23');
            setUsername('root');
            setPassword('root');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSetupPin = async () => {
    if (pinInput.length < 4) {
      Alert.alert('PIN Inválido', 'El PIN debe tener al menos 4 dígitos');
      return;
    }

    if (pinInput !== pinConfirm) {
      Alert.alert('Error', 'Los PINs no coinciden');
      return;
    }

    try {
      await setPin(pinInput);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Éxito', 'PIN configurado correctamente');
      setShowPinSetup(false);
      setPinInput('');
      setPinConfirm('');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al configurar PIN');
    }
  };

  const handleToggleExpertMode = async () => {
    if (isExpertMode) {
      // Disable expert mode
      await disableExpertMode();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Modo Experto Desactivado', 'Los comandos avanzados están ahora ocultos');
    } else {
      // Enable expert mode - requires PIN
      if (!isPinSet) {
        Alert.alert(
          'Configurar PIN',
          'Primero debes configurar un PIN de seguridad para usar el Modo Experto',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurar PIN', onPress: () => setShowPinSetup(true) },
          ]
        );
      } else {
        setShowPinEntry(true);
      }
    }
  };

  const handleEnableExpertMode = async () => {
    if (pinInput.length < 4) {
      Alert.alert('PIN Inválido', 'Ingresa tu PIN de seguridad');
      return;
    }

    const success = await enableExpertMode(pinInput);
    
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Modo Experto Activado', 'Ahora tienes acceso a comandos avanzados');
      setShowPinEntry(false);
      setPinInput('');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('PIN Incorrecto', 'El PIN ingresado no es válido');
      setPinInput('');
    }
  };

  const handleChangePin = async () => {
    if (oldPinInput.length < 4 || pinInput.length < 4) {
      Alert.alert('PIN Inválido', 'Los PINs deben tener al menos 4 dígitos');
      return;
    }

    if (pinInput !== pinConfirm) {
      Alert.alert('Error', 'Los nuevos PINs no coinciden');
      return;
    }

    const success = await changePin(oldPinInput, pinInput);
    
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Éxito', 'PIN cambiado correctamente');
      setShowPinChange(false);
      setOldPinInput('');
      setPinInput('');
      setPinConfirm('');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'El PIN actual es incorrecto');
      setOldPinInput('');
    }
  };

  const handleResetPin = () => {
    Alert.alert(
      'Restablecer PIN',
      '¿Estás seguro? Esto desactivará el Modo Experto y eliminará el PIN configurado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: async () => {
            await resetPin();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('PIN Restablecido', 'El PIN ha sido eliminado');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-2xl font-bold text-foreground">Configuración</Text>
            <Text className="text-sm text-muted mt-1">
              Ajusta los parámetros de la aplicación
            </Text>
          </View>


          {/* Language Selector */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="mb-4">
              <Text className="text-lg font-semibold text-foreground">
                {t('settings.language')}
              </Text>
              <Text className="text-xs text-muted mt-1">
                Select your preferred language
              </Text>
            </View>
            
            <View className="gap-2">
              {availableLanguages.map((lang) => {
                const languageNames = {
                  es: 'Español',
                  en: 'English',
                  de: 'Deutsch'
                };
                const isSelected = currentLanguage === lang;
                
                return (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => {
                      changeLanguage(lang);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${
                      isSelected 
                        ? 'bg-primary/20 border-primary' 
                        : 'bg-background border-border'
                    } active:opacity-80`}
                  >
                    <Text className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {languageNames[lang as keyof typeof languageNames]}
                    </Text>
                    {isSelected && (
                      <Text className="text-primary text-xl">✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Expert Mode Section */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-semibold text-foreground">
                  Modo Experto
                </Text>
                <Text className="text-xs text-muted mt-1">
                  Desbloquea comandos avanzados y peligrosos
                </Text>
              </View>
              <Switch
                value={isExpertMode}
                onValueChange={handleToggleExpertMode}
                trackColor={{ false: '#767577', true: '#0066CC' }}
                thumbColor={isExpertMode ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {isExpertMode && (
              <View className="bg-error/10 border border-error rounded-lg p-3 mb-4">
                <Text className="text-error text-xs font-semibold">
                  ⚠️ MODO EXPERTO ACTIVO
                </Text>
                <Text className="text-error text-xs mt-1">
                  Tienes acceso a comandos que pueden dañar la unidad MIB2. Procede con extrema precaución.
                </Text>
              </View>
            )}

            {isPinSet ? (
              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => setShowPinChange(true)}
                  className="bg-primary/20 border border-primary px-4 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-primary font-semibold text-center">
                    Cambiar PIN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleResetPin}
                  className="bg-error/20 border border-error px-4 py-3 rounded-xl active:opacity-80"
                >
                  <Text className="text-error font-semibold text-center">
                    Restablecer PIN
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowPinSetup(true)}
                className="bg-primary px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold text-center">
                  Configurar PIN de Seguridad
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* PIN Setup Modal */}
          {showPinSetup && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Configurar PIN de Seguridad
              </Text>
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Nuevo PIN (mínimo 4 dígitos)
                  </Text>
                  <TextInput
                    value={pinInput}
                    onChangeText={setPinInput}
                    placeholder="****"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={8}
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Confirmar PIN
                  </Text>
                  <TextInput
                    value={pinConfirm}
                    onChangeText={setPinConfirm}
                    placeholder="****"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={8}
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setShowPinSetup(false);
                      setPinInput('');
                      setPinConfirm('');
                    }}
                    className="flex-1 bg-muted/20 border border-border px-4 py-3 rounded-xl active:opacity-80"
                  >
                    <Text className="text-foreground font-semibold text-center">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSetupPin}
                    className="flex-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
                  >
                    <Text className="text-white font-semibold text-center">
                      Guardar PIN
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* PIN Entry Modal */}
          {showPinEntry && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Ingresar PIN
              </Text>
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    PIN de Seguridad
                  </Text>
                  <TextInput
                    value={pinInput}
                    onChangeText={setPinInput}
                    placeholder="****"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={8}
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setShowPinEntry(false);
                      setPinInput('');
                    }}
                    className="flex-1 bg-muted/20 border border-border px-4 py-3 rounded-xl active:opacity-80"
                  >
                    <Text className="text-foreground font-semibold text-center">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleEnableExpertMode}
                    className="flex-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
                  >
                    <Text className="text-white font-semibold text-center">
                      Activar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* PIN Change Modal */}
          {showPinChange && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-6">
              <Text className="text-lg font-semibold text-foreground mb-4">
                Cambiar PIN
              </Text>
              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    PIN Actual
                  </Text>
                  <TextInput
                    value={oldPinInput}
                    onChangeText={setOldPinInput}
                    placeholder="****"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={8}
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Nuevo PIN
                  </Text>
                  <TextInput
                    value={pinInput}
                    onChangeText={setPinInput}
                    placeholder="****"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={8}
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Confirmar Nuevo PIN
                  </Text>
                  <TextInput
                    value={pinConfirm}
                    onChangeText={setPinConfirm}
                    placeholder="****"
                    secureTextEntry
                    keyboardType="numeric"
                    maxLength={8}
                    className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  />
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setShowPinChange(false);
                      setOldPinInput('');
                      setPinInput('');
                      setPinConfirm('');
                    }}
                    className="flex-1 bg-muted/20 border border-border px-4 py-3 rounded-xl active:opacity-80"
                  >
                    <Text className="text-foreground font-semibold text-center">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleChangePin}
                    className="flex-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
                  >
                    <Text className="text-white font-semibold text-center">
                      Cambiar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Connection Settings */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Configuración de Conexión
            </Text>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Dirección IP
                </Text>
                <TextInput
                  value={host}
                  onChangeText={setHost}
                  placeholder="192.168.1.4"
                  keyboardType="numeric"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  Dirección IP de la unidad MIB2 en la red local
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Puerto
                </Text>
                <TextInput
                  value={port}
                  onChangeText={setPort}
                  placeholder="23"
                  keyboardType="numeric"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  Puerto Telnet (por defecto: 23)
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Usuario
                </Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="root"
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  Usuario para autenticación Telnet
                </Text>
              </View>

              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Contraseña
                </Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="root"
                  secureTextEntry
                  autoCapitalize="none"
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                />
                <Text className="text-xs text-muted mt-1">
                  Contraseña para autenticación Telnet
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={handleResetDefaults}
                className="flex-1 bg-muted/20 border border-border px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-foreground font-semibold text-center">
                  Restablecer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveSettings}
                className="flex-1 bg-primary px-4 py-3 rounded-xl active:opacity-80"
              >
                <Text className="text-white font-semibold text-center">
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Data Management */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Gestión de Datos
            </Text>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Limpiar Historial',
                  '¿Eliminar todo el historial de comandos?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Limpiar',
                      style: 'destructive',
                      onPress: () => {
                        clearMessages();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert('Éxito', 'Historial eliminado');
                      },
                    },
                  ]
                );
              }}
              className="bg-error/10 border border-error px-4 py-3 rounded-xl active:opacity-80"
            >
              <Text className="text-error font-semibold text-center">
                Limpiar Historial de Comandos
              </Text>
            </TouchableOpacity>
          </View>

          {/* USB Debug Mode */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <TouchableOpacity
              onPress={() => {
                setShowDebugInfo(!showDebugInfo);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="flex-row justify-between items-center mb-4"
            >
              <Text className="text-lg font-semibold text-foreground">
                🔧 Modo Debug USB
              </Text>
              <Text className="text-2xl text-muted">
                {showDebugInfo ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {showDebugInfo && (
              <View className="gap-4">
                {/* Estado de Conexión */}
                <View className="bg-background rounded-xl p-4">
                  <Text className="text-sm font-semibold text-foreground mb-3">
                    🔌 Estado de Conexión
                  </Text>
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Estado:</Text>
                      <Text className={`text-xs font-medium ${
                        status === 'connected' ? 'text-success' :
                        status === 'detected' ? 'text-warning' :
                        'text-muted'
                      }`}>
                        {status === 'connected' ? 'CONECTADO' :
                         status === 'detected' ? 'DETECTADO' :
                         'DESCONECTADO'}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Dispositivos detectados:</Text>
                      <Text className="text-xs text-foreground font-medium">{devices.length}</Text>
                    </View>
                  </View>
                </View>

                {/* Información del Dispositivo */}
                {device && (
                  <View className="bg-background rounded-xl p-4">
                    <Text className="text-sm font-semibold text-foreground mb-3">
                      📱 Dispositivo Actual
                    </Text>
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Device ID:</Text>
                        <Text className="text-xs text-foreground font-mono">{device.deviceId}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">VID:PID:</Text>
                        <Text className="text-xs text-foreground font-mono">
                          0x{device.vendorId.toString(16).toUpperCase().padStart(4, '0')}:0x{device.productId.toString(16).toUpperCase().padStart(4, '0')}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Chipset:</Text>
                        <Text className="text-xs text-foreground font-medium">{device.chipset}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Fabricante:</Text>
                        <Text className="text-xs text-foreground">{device.manufacturer}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Producto:</Text>
                        <Text className="text-xs text-foreground">{device.product}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Serial:</Text>
                        <Text className="text-xs text-foreground font-mono">{device.serialNumber}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Información Técnica */}
                <View className="bg-background rounded-xl p-4">
                  <Text className="text-sm font-semibold text-foreground mb-3">
                    ⚙️ Información Técnica
                  </Text>
                  <View className="gap-2">
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Módulo Nativo:</Text>
                      <Text className="text-xs text-success font-medium">ACTIVO</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Magic Value:</Text>
                      <Text className="text-xs text-foreground font-mono">0xDEADBEEF</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">EEPROM Size:</Text>
                      <Text className="text-xs text-foreground font-mono">256 bytes</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">VID Offset:</Text>
                      <Text className="text-xs text-foreground font-mono">0x88</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">PID Offset:</Text>
                      <Text className="text-xs text-foreground font-mono">0x8A</Text>
                    </View>
                  </View>
                </View>

                {/* Botón Copiar Info */}
                <TouchableOpacity
                  onPress={async () => {
                    const debugInfo = `=== MIB2 Controller Debug Info ===\n\n` +
                      `Estado: ${status}\n` +
                      `Dispositivos: ${devices.length}\n\n` +
                      (device ? (
                        `Device ID: ${device.deviceId}\n` +
                        `VID:PID: 0x${device.vendorId.toString(16).toUpperCase()}:0x${device.productId.toString(16).toUpperCase()}\n` +
                        `Chipset: ${device.chipset}\n` +
                        `Fabricante: ${device.manufacturer}\n` +
                        `Producto: ${device.product}\n` +
                        `Serial: ${device.serialNumber}\n`
                      ) : 'No hay dispositivo conectado\n') +
                      `\nMagic Value: 0xDEADBEEF\n` +
                      `EEPROM Size: 256 bytes\n` +
                      `VID Offset: 0x88\n` +
                      `PID Offset: 0x8A`;
                    
                    await Clipboard.setStringAsync(debugInfo);
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert('✅ Copiado', 'Información de debug copiada al portapapeles');
                  }}
                  className="bg-primary rounded-xl p-4 active:opacity-80"
                >
                  <Text className="text-background font-semibold text-center">
                    📋 Copiar Info de Debug
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* App Info */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Información de la App
            </Text>

            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Versión</Text>
                <Text className="text-sm text-foreground font-medium">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Creada por</Text>
                <Text className="text-sm text-foreground font-medium">Felipe Plazas</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Plataforma</Text>
                <Text className="text-sm text-foreground font-medium">Android</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Compatible con</Text>
                <Text className="text-sm text-foreground font-medium">MIB2 STD2</Text>
              </View>
            </View>
          </View>

          {/* Warning */}
          <View className="bg-error/10 border border-error rounded-2xl p-4">
            <Text className="text-sm text-error font-medium mb-2">
              ⚠️ Advertencia de Seguridad
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              Esta aplicación permite ejecutar comandos con privilegios root en la unidad MIB2. 
              El uso incorrecto puede resultar en daños permanentes al sistema. 
              Usa esta herramienta bajo tu propia responsabilidad.
            </Text>
          </View>

          {/* Credits */}
          <View className="items-center py-4">
            <Text className="text-xs text-muted text-center">
              MIB2 Controller v1.0.0
            </Text>
            <Text className="text-xs text-muted text-center mt-1">
              Creada por Felipe Plazas
            </Text>
            <Text className="text-xs text-muted text-center mt-1">
              Para unidades MIB2 STD2 Technisat/Preh
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
