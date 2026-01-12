import { Alert, FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

import { ScreenContainer } from "@/components/screen-container";
import { useTelnet } from "@/lib/telnet-provider";
import { MIB2_COMMANDS } from "@/lib/telnet-client";
import { useColors } from "@/hooks/use-colors";

export default function CommandsScreen() {
  const colors = useColors();
  const { isConnected, isConnecting, connect, disconnect, sendCommand, messages, clearMessages } = useTelnet();
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Filter suggestions based on input
  const suggestions = Object.entries(MIB2_COMMANDS)
    .filter(([key, cmd]) => 
      commandInput && (
        key.toLowerCase().includes(commandInput.toLowerCase()) ||
        cmd.toLowerCase().includes(commandInput.toLowerCase())
      )
    )
    .slice(0, 5);

  const handleSendCommand = () => {
    if (!commandInput.trim()) return;

    if (!isConnected) {
      Alert.alert('No Conectado', 'Debes conectarte a la unidad MIB2 primero');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Add to history
    setCommandHistory(prev => [...prev, commandInput]);
    setHistoryIndex(-1);
    
    // Send command
    sendCommand(commandInput);
    
    // Clear input
    setCommandInput('');
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (command: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCommandInput(command);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleCopyMessage = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClearTerminal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearMessages();
  };

  const handleConnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await connect();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDisconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    disconnect();
  };

  const getMessageColor = (type: string): string => {
    switch (type) {
      case 'command':
        return colors.primary;
      case 'error':
        return '#EF4444';
      case 'info':
        return '#F59E0B';
      case 'response':
      default:
        return colors.foreground;
    }
  };

  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <ScreenContainer className="flex-1">
      <View className="flex-1 p-4 gap-4">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">Terminal Telnet</Text>
            <Text className="text-sm text-muted">
              {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
            </Text>
          </View>
          <View className="flex-row gap-2">
            {!isConnected ? (
              <Pressable
                onPress={handleConnect}
                disabled={isConnecting}
                className="bg-success px-4 py-2 rounded-lg active:opacity-80"
              >
                <Text className="text-background font-semibold">
                  {isConnecting ? 'Conectando...' : 'Conectar'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleDisconnect}
                className="bg-error px-4 py-2 rounded-lg active:opacity-80"
              >
                <Text className="text-background font-semibold">Desconectar</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Terminal Output */}
        <View className="flex-1 bg-background border border-border rounded-xl overflow-hidden">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 p-4"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {messages.length === 0 ? (
              <View className="flex-1 items-center justify-center">
                <Text className="text-muted text-center">
                  Terminal vacía{'\n'}
                  {isConnected ? 'Escribe un comando abajo' : 'Conecta primero para enviar comandos'}
                </Text>
              </View>
            ) : (
              <View className="gap-1">
                {messages.map((msg, index) => (
                  <Pressable
                    key={index}
                    onLongPress={() => handleCopyMessage(msg.text)}
                    className="active:opacity-70"
                  >
                    <View className="flex-row gap-2">
                      <Text className="text-xs text-muted font-mono">
                        {formatTimestamp(msg.timestamp)}
                      </Text>
                      <Text
                        className="flex-1 text-sm font-mono"
                        style={{ color: getMessageColor(msg.type) }}
                      >
                        {msg.text}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Clear Button */}
          {messages.length > 0 && (
            <Pressable
              onPress={handleClearTerminal}
              className="absolute top-2 right-2 bg-surface/90 px-3 py-1 rounded-lg active:opacity-80"
            >
              <Text className="text-xs text-muted font-semibold">Limpiar</Text>
            </Pressable>
          )}
        </View>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View className="bg-surface border border-border rounded-xl p-2 max-h-40">
            <ScrollView>
              {suggestions.map(([key, cmd]) => (
                <Pressable
                  key={key}
                  onPress={() => handleSelectSuggestion(cmd)}
                  className="p-2 active:bg-primary/10 rounded-lg"
                >
                  <Text className="text-sm font-semibold text-foreground">{key}</Text>
                  <Text className="text-xs text-muted font-mono" numberOfLines={1}>
                    {cmd}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Command Input */}
        <View className="flex-row gap-2">
          <View className="flex-1">
            <TextInput
              ref={inputRef}
              value={commandInput}
              onChangeText={(text) => {
                setCommandInput(text);
                setShowSuggestions(text.length > 0);
              }}
              onSubmitEditing={handleSendCommand}
              placeholder={isConnected ? "Escribe un comando..." : "Conecta primero..."}
              placeholderTextColor={colors.muted}
              editable={isConnected}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground font-mono"
            />
          </View>
          <Pressable
            onPress={handleSendCommand}
            disabled={!isConnected || !commandInput.trim()}
            className={`px-6 py-3 rounded-xl active:opacity-80 ${
              isConnected && commandInput.trim() ? 'bg-primary' : 'bg-muted/20'
            }`}
          >
            <Text
              className={`font-semibold ${
                isConnected && commandInput.trim() ? 'text-background' : 'text-muted'
              }`}
            >
              Enviar
            </Text>
          </Pressable>
        </View>

        {/* Quick Commands */}
        <View>
          <Text className="text-sm font-semibold text-foreground mb-2">Comandos Rápidos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {Object.entries(MIB2_COMMANDS).slice(0, 6).map(([key, cmd]) => (
              <Pressable
                key={key}
                onPress={() => {
                  setCommandInput(cmd);
                  setShowSuggestions(false);
                }}
                className="bg-surface border border-border px-4 py-2 rounded-full active:opacity-80"
              >
                <Text className="text-xs font-semibold text-foreground">{key}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScreenContainer>
  );
}
