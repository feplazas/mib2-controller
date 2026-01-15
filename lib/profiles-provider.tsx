/**
 * Profiles Provider
 * 
 * Manages multiple configuration profiles for different MIB2 units
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConnectionProfile {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  description?: string;
  color?: string;
  createdAt: number;
  lastUsed?: number;
}

interface ProfilesContextType {
  profiles: ConnectionProfile[];
  activeProfile: ConnectionProfile | null;
  createProfile: (profile: Omit<ConnectionProfile, 'id' | 'createdAt'>) => Promise<void>;
  updateProfile: (id: string, updates: Partial<ConnectionProfile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveProfile: (id: string) => Promise<void>;
  getProfile: (id: string) => ConnectionProfile | undefined;
  duplicateProfile: (id: string) => Promise<void>;
}

const ProfilesContext = createContext<ProfilesContextType | undefined>(undefined);

const STORAGE_KEY = '@mib2_profiles';
const ACTIVE_PROFILE_KEY = '@mib2_active_profile';

const DEFAULT_PROFILE: Omit<ConnectionProfile, 'id' | 'createdAt'> = {
  name: 'MIB2 Principal',
  host: '192.168.1.4',
  port: 23,
  username: 'root',
  password: 'root',
  description: 'Configuración por defecto',
  color: '#0066CC',
};

function generateId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function ProfilesProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<ConnectionProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<ConnectionProfile | null>(null);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const [profilesData, activeProfileId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(ACTIVE_PROFILE_KEY),
      ]);

      let loadedProfiles: ConnectionProfile[] = [];

      if (profilesData) {
        loadedProfiles = JSON.parse(profilesData);
      } else {
        // Create default profile if none exist
        const defaultProfile: ConnectionProfile = {
          ...DEFAULT_PROFILE,
          id: generateId(),
          createdAt: Date.now(),
        };
        loadedProfiles = [defaultProfile];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loadedProfiles));
      }

      setProfiles(loadedProfiles);

      // Set active profile
      if (activeProfileId) {
        const active = loadedProfiles.find(p => p.id === activeProfileId);
        if (active) {
          setActiveProfileState(active);
        } else {
          setActiveProfileState(loadedProfiles[0]);
        }
      } else {
        setActiveProfileState(loadedProfiles[0]);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const saveProfiles = async (newProfiles: ConnectionProfile[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles));
      setProfiles(newProfiles);
    } catch (error) {
      console.error('Error saving profiles:', error);
      throw error;
    }
  };

  const createProfile = async (profileData: Omit<ConnectionProfile, 'id' | 'createdAt'>) => {
    const newProfile: ConnectionProfile = {
      ...profileData,
      id: generateId(),
      createdAt: Date.now(),
    };

    const updatedProfiles = [...profiles, newProfile];
    await saveProfiles(updatedProfiles);
  };

  const updateProfile = async (id: string, updates: Partial<ConnectionProfile>) => {
    const updatedProfiles = profiles.map(profile =>
      profile.id === id ? { ...profile, ...updates } : profile
    );

    await saveProfiles(updatedProfiles);

    // Update active profile if it was updated
    if (activeProfile?.id === id) {
      const updated = updatedProfiles.find(p => p.id === id);
      if (updated) {
        setActiveProfileState(updated);
      }
    }
  };

  const deleteProfile = async (id: string) => {
    if (profiles.length === 1) {
      throw new Error('No puedes eliminar el único perfil');
    }

    const updatedProfiles = profiles.filter(profile => profile.id !== id);
    await saveProfiles(updatedProfiles);

    // If deleted profile was active, switch to first profile
    if (activeProfile?.id === id) {
      await setActiveProfile(updatedProfiles[0].id);
    }
  };

  const setActiveProfile = async (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) {
      throw new Error('Perfil no encontrado');
    }

    // Update last used timestamp
    await updateProfile(id, { lastUsed: Date.now() });

    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, id);
    setActiveProfileState(profile);
  };

  const getProfile = (id: string): ConnectionProfile | undefined => {
    return profiles.find(p => p.id === id);
  };

  const duplicateProfile = async (id: string) => {
    const profile = getProfile(id);
    if (!profile) {
      throw new Error('Perfil no encontrado');
    }

    const duplicated: Omit<ConnectionProfile, 'id' | 'createdAt'> = {
      ...profile,
      name: `${profile.name} (Copia)`,
    };

    await createProfile(duplicated);
  };

  const value: ProfilesContextType = {
    profiles,
    activeProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    getProfile,
    duplicateProfile,
  };

  return (
    <ProfilesContext.Provider value={value}>
      {children}
    </ProfilesContext.Provider>
  );
}

export function useProfiles(): ProfilesContextType {
  const context = useContext(ProfilesContext);
  if (context === undefined) {
    throw new Error('useProfiles must be used within ProfilesProvider');
  }
  return context;
}
