import { ScrollView, Text, View, TouchableOpacity, Alert, TextInput, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useUsbStatus } from '@/lib/usb-status-context';
import { usbService } from '@/lib/usb-service';
import * as Haptics from 'expo-haptics';

export default function AdvancedDiagScreen() {
  const { status, device } = useUsbStatus();
  const [eepromData, setEepromData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingOffset, setEditingOffset] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (status === 'connected' && device) {
      loadEEPROMDump();
    }
  }, [status, device]);

  const loadEEPROMDump = async () => {
    if (!device) return;
    
    setIsLoading(true);
    try {
      const dump = await usbService.dumpEEPROM();
      setEepromData(dump.data);
      console.log('[AdvancedDiag] EEPROM dump loaded:', dump.size, 'bytes');
    } catch (error: any) {
      Alert.alert('Error', `No se pudo leer la EEPROM: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHexDump = (): { offset: number; hex: string; ascii: string; isImportant: boolean }[] => {
    if (!eepromData || eepromData.length !== 512) {
      return [];
    }

    const lines: { offset: number; hex: string; ascii: string; isImportant: boolean }[] = [];
    const bytesPerLine = 16;

    for (let i = 0; i < 256; i += bytesPerLine) {
      const offset = i;
      const hexBytes: string[] = [];
      const asciiChars: string[] = [];

      for (let j = 0; j < bytesPerLine; j++) {
        const byteIndex = (i + j) * 2;
        const hexByte = eepromData.substring(byteIndex, byteIndex + 2);
        hexBytes.push(hexByte);

        // Convertir a ASCII (solo caracteres imprimibles)
        const byteValue = parseInt(hexByte, 16);
        const asciiChar = (byteValue >= 32 && byteValue <= 126) ? String.fromCharCode(byteValue) : '.';
        asciiChars.push(asciiChar);
      }

      // Marcar offsets importantes (VID/PID)
      const isImportant = (offset >= 0x88 && offset <= 0x8B);

      lines.push({
        offset,
        hex: hexBytes.join(' '),
        ascii: asciiChars.join(''),
        isImportant,
      });
    }

    return lines;
  };

  const getByteAtOffset = (offset: number): string => {
    if (!eepromData || offset < 0 || offset >= 256) return '00';
    const byteIndex = offset * 2;
    return eepromData.substring(byteIndex, byteIndex + 2).toUpperCase();
  };

  const handleEditByte = (offset: number) => {
    const currentValue = getByteAtOffset(offset);
    setEditingOffset(offset);
    setEditValue(currentValue);
  };

  const handleSaveByte = async () => {
    if (editingOffset === null || !editValue) return;

    // Validar formato hexadecimal
    if (!/^[0-9A-Fa-f]{2}$/.test(editValue)) {
      Alert.alert('Error', 'Valor inválido. Debe ser un byte hexadecimal (00-FF)');
      return;
    }

    Alert.alert(
      '⚠️ Confirmar Escritura',
      `¿Deseas escribir el valor 0x${editValue.toUpperCase()} en el offset 0x${editingOffset.toString(16).toUpperCase().padStart(2, '0')}?\n\n` +
      `Esta operación modificará permanentemente la EEPROM.`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setEditingOffset(null) },
        {
          text: 'Escribir',
          style: 'destructive',
          onPress: () => performWriteByte(),
        },
      ]
    );
  };

  const performWriteByte = async () => {
    if (editingOffset === null || !editValue) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await usbService.writeEEPROM(editingOffset, editValue);
      
      // Recargar dump para mostrar cambio
      await loadEEPROMDump();
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        '✅ Escritura Exitosa',
        `Byte escrito en offset 0x${editingOffset.toString(16).toUpperCase().padStart(2, '0')}: 0x${editValue.toUpperCase()}\n\n` +
        `🔌 Para aplicar cambios:\n` +
        `1. Desconecta el adaptador USB\n` +
        `2. Espera 5 segundos\n` +
        `3. Vuelve a conectarlo`
      );
      
      setEditingOffset(null);
      setEditValue('');
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', `No se pudo escribir el byte: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingOffset(null);
    setEditValue('');
  };

  const getOffsetLabel = (offset: number): string | null => {
    switch (offset) {
      case 0x88:
        return 'VID Low';
      case 0x89:
        return 'VID High';
      case 0x8A:
        return 'PID Low';
      case 0x8B:
        return 'PID High';
      default:
        return null;
    }
  };

  const hexLines = formatHexDump();

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-foreground mb-2">
              🔬 Diagnóstico Avanzado
            </Text>
            <Text className="text-sm text-muted text-center">
              Editor hexadecimal de EEPROM byte-por-byte
            </Text>
          </View>

          {/* Estado */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              📡 Estado de Conexión
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Estado:</Text>
                <Text className="text-sm text-foreground font-bold">
                  {status === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'}
                </Text>
              </View>
              {device && (
                <>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Dispositivo:</Text>
                    <Text className="text-sm text-foreground">
                      {device.deviceName}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">VID:PID:</Text>
                    <Text className="text-sm text-foreground font-mono">
                      {device.vendorId.toString(16).padStart(4, '0').toUpperCase()}:
                      {device.productId.toString(16).padStart(4, '0').toUpperCase()}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Botón de Recarga */}
          <TouchableOpacity
            onPress={loadEEPROMDump}
            disabled={status !== 'connected' || isLoading}
            className={`rounded-xl p-4 items-center ${
              status === 'connected' && !isLoading ? 'bg-primary' : 'bg-border'
            }`}
          >
            <Text className={`text-sm font-bold ${
              status === 'connected' && !isLoading ? 'text-background' : 'text-muted'
            }`}>
              {isLoading ? '⏳ Cargando...' : '🔄 Recargar EEPROM'}
            </Text>
          </TouchableOpacity>

          {/* Dump Hexadecimal */}
          {status !== 'connected' && (
            <View className="bg-surface rounded-2xl p-8 border border-border items-center">
              <Text className="text-4xl mb-4">🔌</Text>
              <Text className="text-lg font-bold text-foreground mb-2">
                No hay dispositivo conectado
              </Text>
              <Text className="text-sm text-muted text-center">
                Conecta un adaptador USB para ver el dump de EEPROM
              </Text>
            </View>
          )}

          {status === 'connected' && hexLines.length > 0 && (
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-lg font-bold text-foreground mb-4">
                📋 Dump Hexadecimal (256 bytes)
              </Text>
              
              {/* Leyenda */}
              <View className="bg-background rounded-lg p-3 mb-4">
                <Text className="text-xs text-muted mb-2">
                  <Text className="text-primary font-bold">■</Text> Offsets importantes (VID/PID)
                </Text>
                <Text className="text-xs text-muted">
                  Toca cualquier byte para editarlo
                </Text>
              </View>

              {/* Tabla Hexadecimal */}
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View>
                  {hexLines.map((line) => (
                    <View key={line.offset} className="flex-row mb-1">
                      {/* Offset */}
                      <Text className={`text-xs font-mono mr-2 ${
                        line.isImportant ? 'text-primary font-bold' : 'text-muted'
                      }`}>
                        {line.offset.toString(16).padStart(4, '0').toUpperCase()}:
                      </Text>
                      
                      {/* Bytes Hexadecimales */}
                      <View className="flex-row gap-1">
                        {line.hex.split(' ').map((byte, index) => {
                          const offset = line.offset + index;
                          const label = getOffsetLabel(offset);
                          const isEditing = editingOffset === offset;
                          
                          return (
                            <TouchableOpacity
                              key={offset}
                              onPress={() => handleEditByte(offset)}
                              className={`px-1 rounded ${
                                isEditing ? 'bg-primary' :
                                line.isImportant ? 'bg-primary/20' : 'bg-transparent'
                              }`}
                            >
                              <Text className={`text-xs font-mono ${
                                isEditing ? 'text-background font-bold' :
                                line.isImportant ? 'text-primary font-bold' : 'text-foreground'
                              }`}>
                                {byte.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      
                      {/* ASCII */}
                      <Text className="text-xs font-mono text-muted ml-4">
                        {line.ascii}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Editor de Byte */}
          {editingOffset !== null && (
            <View className="bg-primary/10 rounded-2xl p-6 border-2 border-primary">
              <Text className="text-lg font-bold text-foreground mb-4">
                ✏️ Editar Byte
              </Text>
              
              <View className="gap-4">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Offset:</Text>
                  <Text className="text-sm text-foreground font-mono font-bold">
                    0x{editingOffset.toString(16).toUpperCase().padStart(2, '0')}
                    {getOffsetLabel(editingOffset) && ` (${getOffsetLabel(editingOffset)})`}
                  </Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Valor Actual:</Text>
                  <Text className="text-sm text-foreground font-mono font-bold">
                    0x{getByteAtOffset(editingOffset)}
                  </Text>
                </View>
                
                <View>
                  <Text className="text-sm text-muted mb-2">Nuevo Valor (hex):</Text>
                  <TextInput
                    value={editValue}
                    onChangeText={setEditValue}
                    placeholder="00-FF"
                    maxLength={2}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'default'}
                    className="bg-background rounded-xl p-4 text-foreground font-mono text-base border border-border"
                  />
                </View>
                
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleSaveByte}
                    className="flex-1 bg-primary rounded-xl p-3 items-center"
                  >
                    <Text className="text-sm font-bold text-background">
                      💾 Guardar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    className="flex-1 bg-border rounded-xl p-3 items-center"
                  >
                    <Text className="text-sm font-bold text-foreground">
                      ❌ Cancelar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Advertencias */}
          <View className="bg-red-500/10 rounded-2xl p-6 border border-red-500">
            <Text className="text-lg font-bold text-red-500 mb-4">
              ⚠️ ADVERTENCIA
            </Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">
                • La edición manual de EEPROM es para usuarios expertos
              </Text>
              <Text className="text-sm text-muted">
                • Valores incorrectos pueden inutilizar el adaptador ("brick")
              </Text>
              <Text className="text-sm text-muted">
                • Siempre crea un backup antes de modificar
              </Text>
              <Text className="text-sm text-muted">
                • Los cambios requieren reconexión del adaptador
              </Text>
              <Text className="text-sm text-muted">
                • Usa "Auto Spoof" para cambios seguros de VID/PID
              </Text>
            </View>
          </View>

          {/* Información de Offsets */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-bold text-foreground mb-4">
              📍 Offsets Importantes
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">0x88:</Text>
                <Text className="text-sm text-foreground font-mono">
                  VID Byte Bajo
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">0x89:</Text>
                <Text className="text-sm text-foreground font-mono">
                  VID Byte Alto
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">0x8A:</Text>
                <Text className="text-sm text-foreground font-mono">
                  PID Byte Bajo
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">0x8B:</Text>
                <Text className="text-sm text-foreground font-mono">
                  PID Byte Alto
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
