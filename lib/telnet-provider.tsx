/**
 * Telnet Provider - React Context for MIB2 Connection Management
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TelnetClient,
  TelnetConfig,
  TelnetResponse,
  ConnectionStatus,
  DEFAULT_MIB2_CONFIG,
  validateCommand,
} from './telnet-client';

interface TelnetContextValue {
  // Connection state
  connectionStatus: ConnectionStatus;
  isConnecting: boolean;
  
  // Configuration
  config: TelnetConfig;
  updateConfig: (config: Partial<TelnetConfig>) => Promise<void>;
  
  // Connection methods
  connect: () => Promise<TelnetResponse>;
  disconnect: () => Promise<void>;
  
  // Command execution
  executeCommand: (command: string) => Promise<TelnetResponse>;
  
  // Command history
  commandHistory: TelnetResponse[];
  clearHistory: () => void;
}

const TelnetContext = createContext<TelnetContextValue | undefined>(undefined);

const STORAGE_KEY_CONFIG = '@mib2_controller:telnet_config';
const STORAGE_KEY_HISTORY = '@mib2_controller:command_history';
const MAX_HISTORY_ITEMS = 100;

export function TelnetProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<TelnetClient | null>(null);
  const [config, setConfig] = useState<TelnetConfig>(DEFAULT_MIB2_CONFIG);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false });
  const [isConnecting, setIsConnecting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<TelnetResponse[]>([]);

  // Load saved configuration on mount
  useEffect(() => {
    loadConfig();
    loadHistory();
  }, []);

  // Initialize client when config changes
  useEffect(() => {
    const newClient = new TelnetClient(config);
    setClient(newClient);
  }, [config]);

  const loadConfig = async () => {
    try {
      const savedConfig = await AsyncStorage.getItem(STORAGE_KEY_CONFIG);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_MIB2_CONFIG, ...parsed });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        setCommandHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const updateConfig = useCallback(async (newConfig: Partial<TelnetConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updatedConfig));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }, [config]);

  const connect = useCallback(async (): Promise<TelnetResponse> => {
    if (!client) {
      return {
        success: false,
        output: '',
        error: 'Client not initialized',
        timestamp: Date.now(),
      };
    }

    setIsConnecting(true);
    try {
      const response = await client.connect();
      setConnectionStatus(client.getStatus());
      
      // Add connection attempt to history
      addToHistory(response);
      
      return response;
    } finally {
      setIsConnecting(false);
    }
  }, [client]);

  const disconnect = useCallback(async () => {
    if (!client) return;

    await client.disconnect();
    setConnectionStatus({ connected: false });
  }, [client]);

  const executeCommand = useCallback(async (command: string): Promise<TelnetResponse> => {
    if (!client) {
      return {
        success: false,
        output: '',
        error: 'Client not initialized',
        timestamp: Date.now(),
      };
    }

    // Validate command
    const validation = validateCommand(command);
    if (!validation.valid) {
      const errorResponse: TelnetResponse = {
        success: false,
        output: '',
        error: validation.error,
        timestamp: Date.now(),
      };
      addToHistory(errorResponse);
      return errorResponse;
    }

    const response = await client.executeCommand(command);
    setConnectionStatus(client.getStatus());
    
    // Add to history
    addToHistory(response);
    
    return response;
  }, [client]);

  const addToHistory = useCallback((response: TelnetResponse) => {
    setCommandHistory((prev) => {
      const updated = [response, ...prev].slice(0, MAX_HISTORY_ITEMS);
      
      // Save to AsyncStorage
      AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated)).catch((error) => {
        console.error('Error saving history:', error);
      });
      
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setCommandHistory([]);
    AsyncStorage.removeItem(STORAGE_KEY_HISTORY).catch((error) => {
      console.error('Error clearing history:', error);
    });
  }, []);

  const value: TelnetContextValue = {
    connectionStatus,
    isConnecting,
    config,
    updateConfig,
    connect,
    disconnect,
    executeCommand,
    commandHistory,
    clearHistory,
  };

  return <TelnetContext.Provider value={value}>{children}</TelnetContext.Provider>;
}

/**
 * Hook to access Telnet context
 */
export function useTelnet(): TelnetContextValue {
  const context = useContext(TelnetContext);
  if (!context) {
    throw new Error('useTelnet must be used within a TelnetProvider');
  }
  return context;
}
