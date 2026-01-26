import { useState, useCallback } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, TextInput, ActivityIndicator, Platform } from "react-native";
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from "@/lib/language-context";
import { 
  nativePing, 
  nativeTcpPing, 
  nativeScanPorts, 
  nativeFindMIB2,
  combinedPing,
  quickArpScan,
  getArpTable,
  detectMIB2WithArp,
  type PingResult as NativePingResult,
  type PortScanResult,
  type MIB2FindResult,
  type ArpScanResult,
  type ArpEntry
} from "@/lib/network-scanner";

interface ScanResult {
  ip: string;
  port: number;
  status: 'open' | 'closed' | 'timeout';
  responseTime?: number;
  hostname?: string;
}

interface PingResult {
  ip: string;
  success: boolean;
  responseTime?: number;
  error?: string;
  method?: 'icmp' | 'tcp';
}

export default function NetworkScannerScreen() {
  const t = useTranslation();
  const colors = useColors();
  
  // Estados
  const [targetIp, setTargetIp] = useState('192.168.1.4');
  const [isScanning, setIsScanning] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isArpScanning, setIsArpScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [arpResults, setArpResults] = useState<ArpScanResult[]>([]);
  const [pingResult, setPingResult] = useState<PingResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  // Puertos comunes de MIB2
  const MIB2_PORTS = [23, 123, 21, 22, 80, 8080, 3000];

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  // Función para hacer ping TCP (simula ping conectando a un puerto)
  const tcpPing = async (ip: string, port: number, timeout: number = 3000): Promise<ScanResult> => {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      // En React Native no hay acceso directo a sockets TCP
      // Usamos fetch con timeout como aproximación
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      fetch(`http://${ip}:${port}`, {
        method: 'HEAD',
        signal: controller.signal,
      })
        .then(() => {
          clearTimeout(timeoutId);
          resolve({
            ip,
            port,
            status: 'open',
            responseTime: Date.now() - startTime,
          });
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          // Si hay error de conexión rechazada, el puerto está cerrado pero el host existe
          if (error.name === 'AbortError') {
            resolve({ ip, port, status: 'timeout' });
          } else {
            // Conexión rechazada = host existe pero puerto cerrado
            resolve({ 
              ip, 
              port, 
              status: 'closed',
              responseTime: Date.now() - startTime,
            });
          }
        });
    });
  };

  // Escanear puertos de MIB2 usando módulo nativo
  const handleScanPorts = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setScanResults([]);
    setScanProgress(0);
    setPingResult(null);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    addLog(`🔍 Iniciando escaneo nativo de puertos en ${targetIp}...`);
    
    try {
      // Usar escaneo nativo de puertos
      const nativeResults = await nativeScanPorts(targetIp, MIB2_PORTS, 3000);
      
      const results: ScanResult[] = nativeResults.map(r => ({
        ip: r.host,
        port: r.port,
        status: r.status,
        responseTime: r.responseTime,
      }));
      
      // Log cada resultado
      for (const result of results) {
        if (result.status === 'open') {
          addLog(`✅ Puerto ${result.port} ABIERTO (${result.responseTime}ms)`);
        } else if (result.status === 'closed') {
          addLog(`❌ Puerto ${result.port} cerrado (${result.responseTime}ms)`);
        } else {
          addLog(`⏱️ Puerto ${result.port} timeout`);
        }
      }
      
      setScanResults(results);
      setScanProgress(100);
      
      const openPorts = results.filter(r => r.status === 'open');
      if (openPorts.length > 0) {
        addLog(`✅ Escaneo completado: ${openPorts.length} puertos abiertos`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        addLog(`⚠️ Escaneo completado: No se encontraron puertos abiertos`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      // Fallback al método antiguo
      addLog(`⚠️ Usando fallback TCP...`);
      const results: ScanResult[] = [];
      
      for (let i = 0; i < MIB2_PORTS.length; i++) {
        const port = MIB2_PORTS[i];
        addLog(`📡 Escaneando puerto ${port}...`);
        
        const result = await tcpPing(targetIp, port, 3000);
        results.push(result);
        
        if (result.status === 'open') {
          addLog(`✅ Puerto ${port} ABIERTO (${result.responseTime}ms)`);
        } else if (result.status === 'closed') {
          addLog(`❌ Puerto ${port} cerrado`);
        } else {
          addLog(`⏱️ Puerto ${port} timeout`);
        }
        
        setScanProgress(((i + 1) / MIB2_PORTS.length) * 100);
        setScanResults([...results]);
      }
      
      const openPorts = results.filter(r => r.status === 'open');
      if (openPorts.length > 0) {
        addLog(`✅ Escaneo completado: ${openPorts.length} puertos abiertos`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        addLog(`⚠️ Escaneo completado: No se encontraron puertos abiertos`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    }
    
    setIsScanning(false);
  };

  // Ping usando módulo nativo (ICMP + TCP fallback)
  const handlePing = async () => {
    if (isPinging) return;
    
    setIsPinging(true);
    setPingResult(null);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    addLog(`🏓 Haciendo ping ICMP nativo a ${targetIp}...`);
    
    try {
      // Usar ping combinado (ICMP primero, luego TCP como fallback)
      const result = await combinedPing(targetIp, 5000);
      
      if (result.success) {
        setPingResult({
          ip: targetIp,
          success: true,
          responseTime: result.responseTime,
          method: result.method,
        });
        addLog(`✅ Host ${targetIp} alcanzable vía ${result.method.toUpperCase()} (${result.responseTime}ms)`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        setPingResult({
          ip: targetIp,
          success: false,
          error: result.error || 'Host no responde',
          method: result.method,
        });
        addLog(`❌ Host ${targetIp} no responde (${result.error})`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      // Fallback a método antiguo si el nativo falla
      addLog(`⚠️ Fallback a ping TCP...`);
      const result23 = await tcpPing(targetIp, 23, 5000);
      
      if (result23.status === 'open' || result23.status === 'closed') {
        setPingResult({
          ip: targetIp,
          success: true,
          responseTime: result23.responseTime,
          method: 'tcp',
        });
        addLog(`✅ Host ${targetIp} alcanzable (${result23.responseTime}ms)`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        setPingResult({
          ip: targetIp,
          success: false,
          error: 'Host no responde',
          method: 'tcp',
        });
        addLog(`❌ Host ${targetIp} no responde`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    }
    
    setIsPinging(false);
  };

  // Escanear red local (buscar MIB2) usando módulo nativo
  const handleScanNetwork = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setScanResults([]);
    setScanProgress(0);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    addLog(`🔍 Buscando MIB2 en la red local (nativo)...`);
    
    try {
      // Usar búsqueda nativa de MIB2
      const nativeResults = await nativeFindMIB2(3000);
      
      const results: ScanResult[] = nativeResults
        .filter(r => r.found)
        .map(r => ({
          ip: r.ip,
          port: r.port,
          status: 'open' as const,
          responseTime: r.responseTime,
        }));
      
      for (const result of results) {
        addLog(`✅ ¡MIB2 encontrado en ${result.ip}:${result.port}! (${result.responseTime}ms)`);
        setTargetIp(result.ip);
      }
      
      setScanResults(results);
      setScanProgress(100);
      
      if (results.length > 0) {
        addLog(`✅ Búsqueda completada: ${results.length} dispositivo(s) encontrado(s)`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        addLog(`⚠️ No se encontró ningún MIB2 en la red`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      // Fallback al método antiguo
      addLog(`⚠️ Usando fallback manual...`);
      
      const commonIPs = [
        '192.168.1.1',
        '192.168.1.4',
        '192.168.1.10',
        '192.168.0.1',
        '192.168.0.4',
        '10.200.1.1',
      ];
      
      const results: ScanResult[] = [];
      
      for (let i = 0; i < commonIPs.length; i++) {
        const ip = commonIPs[i];
        addLog(`📡 Probando ${ip}:23...`);
        
        const result = await tcpPing(ip, 23, 2000);
        
        if (result.status === 'open') {
          results.push(result);
          addLog(`✅ ¡MIB2 encontrado en ${ip}!`);
          setTargetIp(ip);
        } else {
          const result123 = await tcpPing(ip, 123, 2000);
          if (result123.status === 'open') {
            results.push({ ...result123, ip });
            addLog(`✅ ¡MIB2 encontrado en ${ip}:123!`);
            setTargetIp(ip);
          }
        }
        
        setScanProgress(((i + 1) / commonIPs.length) * 100);
      }
      
      setScanResults(results);
      
      if (results.length > 0) {
        addLog(`✅ Búsqueda completada: ${results.length} dispositivo(s) encontrado(s)`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        addLog(`⚠️ No se encontró ningún MIB2 en la red`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    }
    
    setIsScanning(false);
  };

  // Escaneo ARP - Descubre dispositivos incluso con puertos cerrados
  const handleArpScan = async () => {
    if (isArpScanning || isScanning) return;
    
    setIsArpScanning(true);
    setArpResults([]);
    setScanProgress(0);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    addLog(`🔍 Iniciando escaneo ARP (descubre dispositivos sin puertos abiertos)...`);
    
    try {
      // Usar escaneo ARP rápido nativo
      const results = await quickArpScan(3000);
      
      setArpResults(results);
      setScanProgress(100);
      
      // Log resultados
      for (const result of results) {
        const status = result.isMIB2Likely ? '🌟 MIB2 DETECTADO' : 
                       result.isMIB2Candidate ? '🟡 Posible MIB2' : '🟢 Dispositivo';
        const telnetInfo = result.hasTelnet ? ' (Telnet:23)' : 
                          result.hasAltTelnet ? ' (Telnet:123)' : '';
        addLog(`${status}: ${result.ip} - MAC: ${result.mac}${telnetInfo}`);
        
        // Si encontramos MIB2, actualizar IP de destino
        if (result.isMIB2Likely || result.isMIB2Candidate) {
          setTargetIp(result.ip);
        }
      }
      
      const mib2Found = results.filter(r => r.isMIB2Likely || r.isMIB2Candidate);
      if (mib2Found.length > 0) {
        addLog(`✅ Escaneo ARP completado: ${mib2Found.length} posible(s) MIB2 encontrado(s)`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else if (results.length > 0) {
        addLog(`⚠️ Escaneo ARP completado: ${results.length} dispositivo(s), ninguno parece MIB2`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      } else {
        addLog(`❌ Escaneo ARP completado: No se encontraron dispositivos`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      addLog(`❌ Error en escaneo ARP: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    
    setIsArpScanning(false);
  };

  // Auto-detectar MIB2 usando ARP + puertos
  const handleAutoDetect = async () => {
    if (isArpScanning || isScanning) return;
    
    setIsArpScanning(true);
    setArpResults([]);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    addLog(`🚀 Auto-detección de MIB2 iniciada...`);
    
    try {
      const mib2 = await detectMIB2WithArp(4000);
      
      if (mib2) {
        setArpResults([mib2]);
        setTargetIp(mib2.ip);
        
        const telnetInfo = mib2.hasTelnet ? 'Telnet:23' : 
                          mib2.hasAltTelnet ? 'Telnet:123' : 'Sin Telnet';
        addLog(`🎉 ¡MIB2 encontrado! IP: ${mib2.ip}, MAC: ${mib2.mac}, ${telnetInfo}`);
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        addLog(`❌ No se pudo detectar MIB2 automáticamente`);
        addLog(`💡 Sugerencia: Verifica que Ethernet esté habilitado en GEM`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      addLog(`❌ Error en auto-detección: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    
    setIsArpScanning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#34C759';
      case 'closed': return '#FF3B30';
      case 'timeout': return '#FF9500';
      default: return colors.muted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return t('network_scanner.status_open') || 'Abierto';
      case 'closed': return t('network_scanner.status_closed') || 'Cerrado';
      case 'timeout': return t('network_scanner.status_timeout') || 'Timeout';
      default: return status;
    }
  };

  return (
    <ScreenContainer>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {t('network_scanner.title') || 'Network Scanner'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t('network_scanner.subtitle') || 'Verificar conectividad con MIB2'}
          </Text>
        </View>

        {/* IP Input */}
        <View style={[styles.inputSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.foreground }]}>
            {t('network_scanner.target_ip') || 'IP de destino'}
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background, 
              color: colors.foreground,
              borderColor: colors.border,
            }]}
            value={targetIp}
            onChangeText={setTargetIp}
            placeholder="192.168.1.4"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGrid}>
          {/* Ping Button */}
          <Pressable
            onPress={handlePing}
            disabled={isPinging || isScanning}
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: '#007AFF',
                opacity: (isPinging || isScanning) ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
          >
            {isPinging ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="antenna.radiowaves.left.and.right" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {isPinging ? (t('network_scanner.pinging') || 'Probando...') : 'Ping'}
            </Text>
          </Pressable>

          {/* Scan Ports Button */}
          <Pressable
            onPress={handleScanPorts}
            disabled={isPinging || isScanning}
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: '#34C759',
                opacity: (isPinging || isScanning) ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="network" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {isScanning ? `${Math.round(scanProgress)}%` : (t('network_scanner.scan_ports') || 'Escanear Puertos')}
            </Text>
          </Pressable>

          {/* Find MIB2 Button */}
          <Pressable
            onPress={handleScanNetwork}
            disabled={isPinging || isScanning || isArpScanning}
            style={({ pressed }) => [
              styles.actionButton,
              styles.fullWidthButton,
              { 
                backgroundColor: '#FF9500',
                opacity: (isPinging || isScanning || isArpScanning) ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="magnifyingglass" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {isScanning ? `${Math.round(scanProgress)}%` : (t('network_scanner.find_mib2') || 'Buscar MIB2 en Red')}
            </Text>
          </Pressable>

          {/* ARP Scan Button */}
          <Pressable
            onPress={handleArpScan}
            disabled={isPinging || isScanning || isArpScanning}
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: '#5856D6',
                opacity: (isPinging || isScanning || isArpScanning) ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
          >
            {isArpScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="network" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {isArpScanning ? (t('network_scanner.scanning') || 'Escaneando...') : (t('network_scanner.arp_scan') || 'ARP Scan')}
            </Text>
          </Pressable>

          {/* Auto-Detect MIB2 Button */}
          <Pressable
            onPress={handleAutoDetect}
            disabled={isPinging || isScanning || isArpScanning}
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: '#FF2D55',
                opacity: (isPinging || isScanning || isArpScanning) ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
          >
            {isArpScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="sparkles" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {t('network_scanner.auto_detect') || 'Auto-Detectar'}
            </Text>
          </Pressable>
        </View>

        {/* ARP Results */}
        {arpResults.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t('network_scanner.arp_results') || 'Dispositivos Detectados (ARP)'}
            </Text>
            {arpResults.map((result, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setTargetIp(result.ip);
                  addLog(`📌 IP seleccionada: ${result.ip}`);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={({ pressed }) => [
                  styles.arpResultItem,
                  { 
                    backgroundColor: result.isMIB2Likely ? '#34C75915' : 
                                    result.isMIB2Candidate ? '#FF950015' : colors.background,
                    borderColor: result.isMIB2Likely ? '#34C759' : 
                                result.isMIB2Candidate ? '#FF9500' : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={styles.arpResultHeader}>
                  <View style={styles.arpResultInfo}>
                    <Text style={[styles.arpResultIp, { color: colors.foreground }]}>
                      {result.ip}
                    </Text>
                    <Text style={[styles.arpResultMac, { color: colors.muted }]}>
                      MAC: {result.mac}
                    </Text>
                  </View>
                  <View style={styles.arpResultBadges}>
                    {result.isMIB2Likely && (
                      <View style={[styles.badge, { backgroundColor: '#34C759' }]}>
                        <Text style={styles.badgeText}>MIB2</Text>
                      </View>
                    )}
                    {result.isMIB2Candidate && !result.isMIB2Likely && (
                      <View style={[styles.badge, { backgroundColor: '#FF9500' }]}>
                        <Text style={styles.badgeText}>Posible</Text>
                      </View>
                    )}
                    {result.hasTelnet && (
                      <View style={[styles.badge, { backgroundColor: '#007AFF' }]}>
                        <Text style={styles.badgeText}>:23</Text>
                      </View>
                    )}
                    {result.hasAltTelnet && (
                      <View style={[styles.badge, { backgroundColor: '#5856D6' }]}>
                        <Text style={styles.badgeText}>:123</Text>
                      </View>
                    )}
                  </View>
                </View>
                {result.responseTime && result.responseTime > 0 && (
                  <Text style={[styles.arpResultTime, { color: colors.muted }]}>
                    {result.responseTime}ms
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Ping Result */}
        {pingResult && (
          <View style={[styles.resultCard, { 
            backgroundColor: pingResult.success ? '#34C75915' : '#FF3B3015',
            borderColor: pingResult.success ? '#34C759' : '#FF3B30',
          }]}>
            <View style={styles.resultHeader}>
              <IconSymbol 
                name={pingResult.success ? "checkmark.circle.fill" : "xmark.circle.fill"} 
                size={24} 
                color={pingResult.success ? '#34C759' : '#FF3B30'} 
              />
              <Text style={[styles.resultTitle, { color: pingResult.success ? '#34C759' : '#FF3B30' }]}>
                {pingResult.success 
                  ? (t('network_scanner.host_reachable') || 'Host Alcanzable')
                  : (t('network_scanner.host_unreachable') || 'Host No Alcanzable')}
              </Text>
            </View>
            {pingResult.success && pingResult.responseTime && (
              <Text style={[styles.resultDetail, { color: colors.muted }]}>
                {t('network_scanner.response_time') || 'Tiempo de respuesta'}: {pingResult.responseTime}ms
              </Text>
            )}
            {!pingResult.success && pingResult.error && (
              <Text style={[styles.resultDetail, { color: colors.muted }]}>
                {pingResult.error}
              </Text>
            )}
          </View>
        )}

        {/* Scan Results */}
        {scanResults.length > 0 && (
          <View style={[styles.resultsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t('network_scanner.scan_results') || 'Resultados del Escaneo'}
            </Text>
            {scanResults.map((result, index) => (
              <View 
                key={`${result.ip}-${result.port}-${index}`}
                style={[styles.resultRow, { borderBottomColor: colors.border }]}
              >
                <View style={styles.resultInfo}>
                  <Text style={[styles.portText, { color: colors.foreground }]}>
                    {result.ip}:{result.port}
                  </Text>
                  {result.responseTime && (
                    <Text style={[styles.responseText, { color: colors.muted }]}>
                      {result.responseTime}ms
                    </Text>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(result.status) }]}>
                    {getStatusText(result.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Connection Tips */}
        <View style={[styles.tipsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.tipsHeader}>
            <IconSymbol name="info.circle.fill" size={20} color="#FF9500" />
            <Text style={[styles.tipsTitle, { color: colors.foreground }]}>
              {t('network_scanner.tips_title') || 'Consejos de Conexión'}
            </Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={[styles.tipItem, { color: colors.muted }]}>
              • {t('network_scanner.tip_1') || 'IP típica de MIB2: 192.168.1.4'}
            </Text>
            <Text style={[styles.tipItem, { color: colors.muted }]}>
              • {t('network_scanner.tip_2') || 'Puertos Telnet: 23 o 123'}
            </Text>
            <Text style={[styles.tipItem, { color: colors.muted }]}>
              • {t('network_scanner.tip_3') || 'Verifica que Ethernet esté habilitado en GEM'}
            </Text>
            <Text style={[styles.tipItem, { color: colors.muted }]}>
              • {t('network_scanner.tip_4') || 'Configura IP estática en Android: 192.168.1.10'}
            </Text>
          </View>
        </View>

        {/* Logs Section */}
        <View style={[styles.logsSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.logsHeader}>
            <IconSymbol name="doc.fill" size={18} color={colors.muted} />
            <Text style={[styles.logsTitle, { color: colors.foreground }]}>
              {t('network_scanner.logs') || 'Logs'}
            </Text>
          </View>
          <ScrollView style={styles.logsContainer} nestedScrollEnabled>
            {logs.length === 0 ? (
              <Text style={[styles.logEmpty, { color: colors.muted }]}>
                {t('network_scanner.no_logs') || 'Sin actividad reciente'}
              </Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} style={[styles.logItem, { color: colors.muted }]}>
                  {log}
                </Text>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  inputSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 17,
    borderWidth: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  fullWidthButton: {
    flex: 2,
    minWidth: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  resultDetail: {
    fontSize: 15,
    marginLeft: 34,
  },
  resultsSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultInfo: {
    flex: 1,
  },
  portText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  responseText: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tipsSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 15,
    lineHeight: 22,
  },
  logsSection: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  logsTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  logsContainer: {
    maxHeight: 200,
  },
  logEmpty: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  logItem: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 20,
    marginBottom: 4,
  },
  // ARP Scan Styles
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  arpResultItem: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  arpResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  arpResultInfo: {
    flex: 1,
  },
  arpResultIp: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  arpResultMac: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 2,
  },
  arpResultBadges: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    maxWidth: 120,
    justifyContent: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  arpResultTime: {
    fontSize: 12,
    marginTop: 6,
  },
});
