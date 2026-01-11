import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usbService, UsbDevice } from './usb-service';
import { profilesService, VIDPIDProfile } from './profiles-service';

export type UsbStatus = 'disconnected' | 'detected' | 'connected';

interface UsbStatusContextType {
  status: UsbStatus;
  device: UsbDevice | null;
  devices: UsbDevice[];
  isScanning: boolean;
  detectedProfile: VIDPIDProfile | null;
  recommendedProfile: VIDPIDProfile | null;
  scanDevices: () => Promise<void>;
  connectToDevice: (device: UsbDevice) => Promise<boolean>;
  disconnectDevice: () => Promise<void>;
}

const UsbStatusContext = createContext<UsbStatusContextType | undefined>(undefined);

export function UsbStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<UsbStatus>('disconnected');
  const [device, setDevice] = useState<UsbDevice | null>(null);
  const [devices, setDevices] = useState<UsbDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedProfile, setDetectedProfile] = useState<VIDPIDProfile | null>(null);
  const [recommendedProfile, setRecommendedProfile] = useState<VIDPIDProfile | null>(null);

  // Escanear dispositivos USB
  const scanDevices = useCallback(async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    try {
      await usbService.initialize();
      const foundDevices = await usbService.scanDevices();
      setDevices(foundDevices);
      
      if (foundDevices.length > 0) {
        // Si hay dispositivos pero no estamos conectados, marcar como "detected"
        if (status === 'disconnected') {
          setStatus('detected');
        }
      } else {
        // No hay dispositivos
        if (status !== 'disconnected') {
          setStatus('disconnected');
          setDevice(null);
        }
      }
    } catch (error) {
      console.error('[UsbStatusProvider] Error scanning devices:', error);
      setStatus('disconnected');
      setDevice(null);
      setDevices([]);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, status]);

  // Conectar a un dispositivo específico
  const connectToDevice = useCallback(async (targetDevice: UsbDevice): Promise<boolean> => {
    try {
      // Solicitar permisos y abrir dispositivo
      const granted = await usbService.requestPermission(targetDevice.deviceId);
      if (!granted) {
        return false;
      }
      
      const opened = await usbService.openDevice(targetDevice.deviceId);
      if (!opened) {
        return false;
      }

      // Detectar perfil del dispositivo
      const profile = await profilesService.findProfileByVIDPID(
        targetDevice.vendorId,
        targetDevice.productId
      );
      setDetectedProfile(profile);
      
      // Sugerir perfil MIB2 compatible si el dispositivo no lo es
      if (profile && !profile.compatible) {
        const recommended = profilesService.getMIB2CompatibleProfiles()[0]; // D-Link DUB-E100
        setRecommendedProfile(recommended);
        console.log(`[UsbStatusProvider] Device not MIB2 compatible. Recommending: ${recommended.name}`);
      } else {
        setRecommendedProfile(null);
      }
      
      // Marcar como conectado
      setDevice(targetDevice);
      setStatus('connected');
      return true;
    } catch (error) {
      console.error('[UsbStatusProvider] Connection error:', error);
      return false;
    }
  }, []);

  // Desconectar dispositivo actual
  const disconnectDevice = useCallback(async () => {
    if (!device) return;
    
    try {
      setDevice(null);
      setDetectedProfile(null);
      setRecommendedProfile(null);
      setStatus(devices.length > 0 ? 'detected' : 'disconnected');
    } catch (error) {
      console.error('[UsbStatusProvider] Disconnection error:', error);
    }
  }, [device, devices.length]);

  // Escaneo automático al montar y cuando la app vuelve al foreground
  useEffect(() => {
    // Escaneo inicial
    scanDevices();

    // Listener de cambios de estado de la app
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App volvió al foreground, escanear nuevamente
        scanDevices();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [scanDevices]);

  // Escaneo periódico cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      scanDevices();
    }, 5000);

    return () => clearInterval(interval);
  }, [scanDevices]);

  const value: UsbStatusContextType = {
    status,
    device,
    devices,
    isScanning,
    detectedProfile,
    recommendedProfile,
    scanDevices,
    connectToDevice,
    disconnectDevice,
  };

  return (
    <UsbStatusContext.Provider value={value}>
      {children}
    </UsbStatusContext.Provider>
  );
}

export function useUsbStatus(): UsbStatusContextType {
  const context = useContext(UsbStatusContext);
  if (!context) {
    throw new Error('useUsbStatus must be used within UsbStatusProvider');
  }
  return context;
}
