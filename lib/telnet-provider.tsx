/**
 * Telnet Provider - React Context for MIB2 Connection Management
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TelnetClient,
  TelnetConfig,
  TelnetMessage,
  DEFAULT_MIB2_CONFIG,
} from './telnet-client';

interface TelnetContextValue {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  
  // Configuration
  config: TelnetConfig;
  updateConfig: (config: Partial<TelnetConfig>) => Promise<void>;
  
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Command execution
  sendCommand: (command: string) => void;
  
  // Message history
  messages: TelnetMessage[];
  clearMessages: () => void;
}

const TelnetContext = createContext<TelnetContextValue | undefined>(undefined);

const STORAGE_KEY_CONFIG = '@mib2_controller:telnet_config';
const STORAGE_KEY_MESSAGES = '@mib2_controller:telnet_messages';
const MAX_MESSAGES = 500;

export function TelnetProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<TelnetClient | null>(null);
  const [config, setConfig] = useState<TelnetConfig>(DEFAULT_MIB2_CONFIG);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<TelnetMessage[]>([]);

  // Load saved configuration on mount
  useEffect(() => {
    loadConfig();
    loadMessages();
  }, []);

  // Save messages when they change
  useEffect(() => {
    saveMessages();
  }, [messages]);

  const loadConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading telnet config:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const updateConfig = useCallback(async (newConfig: Partial<TelnetConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving telnet config:', error);
    }
  }, [config]);

  const addMessage = useCallback((message: TelnetMessage) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      // Keep only last MAX_MESSAGES
      if (updated.length > MAX_MESSAGES) {
        return updated.slice(-MAX_MESSAGES);
      }
      return updated;
    });
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    
    try {
      const newClient = new TelnetClient(config, {
        onMessage: addMessage,
        onConnect: () => {
          setIsConnected(true);
          setIsConnecting(false);
        },
        onDisconnect: () => {
          setIsConnected(false);
          setClient(null);
        },
      });

      await newClient.connect();
      setClient(newClient);
    } catch (error) {
      setIsConnecting(false);
      addMessage({
        type: 'error',
        text: `Error de conexión: ${(error as Error).message}`,
        timestamp: new Date(),
      });
      throw error;
    }
  }, [config, isConnecting, isConnected, addMessage]);

  const disconnect = useCallback(() => {
    if (client) {
      client.disconnect();
      setClient(null);
      setIsConnected(false);
    }
  }, [client]);

  const sendCommand = useCallback((command: string) => {
    if (!client || !isConnected) {
      addMessage({
        type: 'error',
        text: 'No conectado a MIB2',
        timestamp: new Date(),
      });
      return;
    }

    client.sendCommand(command);
  }, [client, isConnected, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value: TelnetContextValue = {
    isConnected,
    isConnecting,
    config,
    updateConfig,
    connect,
    disconnect,
    sendCommand,
    messages,
    clearMessages,
  };

  return <TelnetContext.Provider value={value}>{children}</TelnetContext.Provider>;
}

export function useTelnet() {
  const context = useContext(TelnetContext);
  if (!context) {
    throw new Error('useTelnet must be used within TelnetProvider');
  }
  return context;
}
