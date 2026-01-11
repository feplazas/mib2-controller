import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { usbService, UsbDevice } from './usb-service';
import { addDiagnosticLog } from '@/app/(tabs)/diagnostic';

export type UsbStatus = 'disconnected' | 'detected' | 'connected';

interface UsbStatusContextType {
  status: UsbStatus;
  device: UsbDevice | null;
  devices: UsbDevice[];
  isScanning: boolean;
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

  // Escanear dispositivos USB
  const scanDevices = useCallback(async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    addDiagnosticLog('info', '🔄 [Context] Escaneando dispositivos USB...');
    
    try {
      await usbService.initialize();
      const foundDevices = await usbService.listDevices();
      setDevices(foundDevices);
      
      addDiagnosticLog('info', `📱 [Context] Encontrados ${foundDevices.length} dispositivos`);
      
      if (foundDevices.length > 0) {
        // Si hay dispositivos pero no estamos conectados, marcar como "detected"
        if (status === 'disconnected') {
          setStatus('detected');
          addDiagnosticLog('success', '✅ [Context] Estado cambiado a: DETECTED');
        }
      } else {
        // No hay dispositivos
        if (status !== 'disconnected') {
          setStatus('disconnected');
          setDevice(null);
          addDiagnosticLog('warn', '⚠️  [Context] Estado cambiado a: DISCONNECTED');
        }
      }
    } catch (error) {
      addDiagnosticLog('error', `❌ [Context] Error al escanear: ${error}`);
      setStatus('disconnected');
      setDevice(null);
      setDevices([]);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, status]);

  // Conectar a un dispositivo específico
  const connectToDevice = useCallback(async (targetDevice: UsbDevice): Promise<boolean> => {
    addDiagnosticLog('info', `🔌 [Context] Intentando conectar a ${targetDevice.deviceName}...`);
    
    try {
      // Verificar permisos
      const hasPermission = await usbService.hasPermission(targetDevice);
      if (!hasPermission) {
        addDiagnosticLog('warn', '⚠️  [Context] Solicitando permisos...');
        const granted = await usbService.requestPermission(targetDevice);
        if (!granted) {
          addDiagnosticLog('error', '❌ [Context] Permiso denegado');
          return false;
        }
        addDiagnosticLog('success', '✅ [Context] Permiso concedido');
      }

      // Abrir conexión
      const opened = await usbService.openDevice(targetDevice);
      if (opened) {
        setDevice(targetDevice);
        setStatus('connected');
        addDiagnosticLog('success', `✅ [Context] CONECTADO a ${targetDevice.deviceName}`);
        return true;
      } else {
        addDiagnosticLog('error', '❌ [Context] No se pudo abrir el dispositivo');
        return false;
      }
    } catch (error) {
      addDiagnosticLog('error', `❌ [Context] Error de conexión: ${error}`);
      return false;
    }
  }, []);

  // Desconectar dispositivo actual
  const disconnectDevice = useCallback(async () => {
    if (!device) return;
    
    addDiagnosticLog('info', '🔌 [Context] Desconectando dispositivo...');
    
    try {
      await usbService.closeDevice();
      setDevice(null);
      setStatus(devices.length > 0 ? 'detected' : 'disconnected');
      addDiagnosticLog('success', '✅ [Context] Dispositivo desconectado');
    } catch (error) {
      addDiagnosticLog('error', `❌ [Context] Error al desconectar: ${error}`);
    }
  }, [device, devices.length]);

  // Escaneo automático al montar y cuando la app vuelve al foreground
  useEffect(() => {
    // Escaneo inicial
    scanDevices();

    // Listener de cambios de estado de la app
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        addDiagnosticLog('info', '📱 [Context] App activa, re-escaneando...');
        scanDevices();
      }
    });

    // Escaneo periódico cada 5 segundos
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        scanDevices();
      }
    }, 5000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [scanDevices]);

  const value: UsbStatusContextType = {
    status,
    device,
    devices,
    isScanning,
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

export function useUsbStatus() {
  const context = useContext(UsbStatusContext);
  if (context === undefined) {
    throw new Error('useUsbStatus must be used within a UsbStatusProvider');
  }
  return context;
}
