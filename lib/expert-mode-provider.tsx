/**
 * Expert Mode Provider
 * 
 * Manages expert mode state and PIN authentication
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExpertModeContextType {
  isExpertMode: boolean;
  isPinSet: boolean;
  enableExpertMode: (pin: string) => Promise<boolean>;
  disableExpertMode: () => Promise<void>;
  setPin: (newPin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  resetPin: () => Promise<void>;
}

const ExpertModeContext = createContext<ExpertModeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  EXPERT_MODE: '@mib2_expert_mode',
  PIN_HASH: '@mib2_pin_hash',
};

/**
 * Simple hash function for PIN storage
 * In production, use a proper cryptographic hash like bcrypt
 */
function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

export function ExpertModeProvider({ children }: { children: React.ReactNode }) {
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);

  // Load expert mode state on mount
  useEffect(() => {
    loadExpertModeState();
  }, []);

  const loadExpertModeState = async () => {
    try {
      const [expertModeValue, pinHashValue] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXPERT_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH),
      ]);

      setIsExpertMode(expertModeValue === 'true');
      setIsPinSet(pinHashValue !== null);
    } catch (error) {
      console.error('Error loading expert mode state:', error);
    }
  };

  const setPin = async (newPin: string): Promise<void> => {
    if (newPin.length < 4) {
      throw new Error('PIN debe tener al menos 4 dígitos');
    }

    const hashed = hashPin(newPin);
    await AsyncStorage.setItem(STORAGE_KEYS.PIN_HASH, hashed);
    setIsPinSet(true);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      const storedHash = await AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH);
      if (!storedHash) {
        return false;
      }

      const inputHash = hashPin(pin);
      return inputHash === storedHash;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  };

  const enableExpertMode = async (pin: string): Promise<boolean> => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      await AsyncStorage.setItem(STORAGE_KEYS.EXPERT_MODE, 'true');
      setIsExpertMode(true);
      return true;
    }
    return false;
  };

  const disableExpertMode = async (): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEYS.EXPERT_MODE, 'false');
    setIsExpertMode(false);
  };

  const changePin = async (oldPin: string, newPin: string): Promise<boolean> => {
    const isOldPinValid = await verifyPin(oldPin);
    if (!isOldPinValid) {
      return false;
    }

    await setPin(newPin);
    return true;
  };

  const resetPin = async (): Promise<void> => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.PIN_HASH, STORAGE_KEYS.EXPERT_MODE]);
    setIsPinSet(false);
    setIsExpertMode(false);
  };

  const value: ExpertModeContextType = {
    isExpertMode,
    isPinSet,
    enableExpertMode,
    disableExpertMode,
    setPin,
    verifyPin,
    changePin,
    resetPin,
  };

  return (
    <ExpertModeContext.Provider value={value}>
      {children}
    </ExpertModeContext.Provider>
  );
}

export function useExpertMode(): ExpertModeContextType {
  const context = useContext(ExpertModeContext);
  if (context === undefined) {
    throw new Error('useExpertMode must be used within ExpertModeProvider');
  }
  return context;
}
