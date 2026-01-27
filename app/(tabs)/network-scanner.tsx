import { useState, useCallback } from "react";
import { ScrollView, Text, View, Pressable, StyleSheet, TextInput, ActivityIndicator, Platform, useWindowDimensions } from "react-native";
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SkeletonNetworkScan } from '@/components/ui/skeleton-loader';
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
  DEFAULT_NETWORK_TIMEOUT,
  QUICK_SCAN_TIMEOUT,
  EXTENDED_TIMEOUT,
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
  const { width } = useWindowDimensions();
  
  // Responsive breakpoints
  const isTablet = width >= 768;
  const isLargePhone = width >= 414;
  
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
  const tcpPing = async (ip: string, port: number, timeout: number = DEFAULT_NETWORK_TIMEOUT): Promise<ScanResult> => {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
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
          if (error.name === 'AbortError') {
            resolve({ ip, port, status: 'timeout' });
          } else {
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
    
    addLog(`🔍 ${t('network_scanner.starting_scan') || 'Iniciando escaneo de puertos en'} ${targetIp}...`);
    
    try {
      const nativeResults = await nativeScanPorts(targetIp, MIB2_PORTS, DEFAULT_NETWORK_TIMEOUT);
      
      const results: ScanResult[] = nativeResults.map(r => ({
        ip: r.host,
        port: r.port,
        status: r.status,
        responseTime: r.responseTime,
      }));
      
      for (const result of results) {
        if (result.status === 'open') {
          addLog(`✅ ${t('network_scanner.port') || 'Puerto'} ${result.port} ${t('network_scanner.open') || 'ABIERTO'} (${result.responseTime}ms)`);
        } else if (result.status === 'closed') {
          addLog(`❌ ${t('network_scanner.port') || 'Puerto'} ${result.port} ${t('network_scanner.closed') || 'cerrado'}`);
        } else {
          addLog(`⏱️ ${t('network_scanner.port') || 'Puerto'} ${result.port} timeout`);
        }
      }
      
      setScanResults(results);
      setScanProgress(100);
      
      const openPorts = results.filter(r => r.status === 'open');
      if (openPorts.length > 0) {
        addLog(`✅ ${t('network_scanner.scan_complete') || 'Escaneo completado'}: ${openPorts.length} ${t('network_scanner.ports_open') || 'puertos abiertos'}`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        addLog(`⚠️ ${t('network_scanner.no_ports_found') || 'No se encontraron puertos abiertos'}`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      addLog(`⚠️ ${t('network_scanner.using_fallback') || 'Usando fallback TCP'}...`);
      const results: ScanResult[] = [];
      
      for (let i = 0; i < MIB2_PORTS.length; i++) {
        const port = MIB2_PORTS[i];
        const result = await tcpPing(targetIp, port, DEFAULT_NETWORK_TIMEOUT);
        results.push(result);
        
        if (result.status === 'open') {
          addLog(`✅ ${t('network_scanner.port') || 'Puerto'} ${port} ${t('network_scanner.open') || 'ABIERTO'} (${result.responseTime}ms)`);
        }
        
        setScanProgress(((i + 1) / MIB2_PORTS.length) * 100);
        setScanResults([...results]);
      }
      
      const openPorts = results.filter(r => r.status === 'open');
      if (openPorts.length > 0) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    
    addLog(`🏓 Ping ICMP ${t('network_scanner.to') || 'a'} ${targetIp}...`);
    
    try {
      const result = await combinedPing(targetIp, DEFAULT_NETWORK_TIMEOUT);
      
      if (result.success) {
        setPingResult({
          ip: targetIp,
          success: true,
          responseTime: result.responseTime,
          method: result.method,
        });
        addLog(`✅ Host ${targetIp} ${t('network_scanner.reachable') || 'alcanzable'} (${result.method.toUpperCase()}: ${result.responseTime}ms)`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        setPingResult({
          ip: targetIp,
          success: false,
          error: result.error || t('network_scanner.no_response') || 'Host no responde',
          method: result.method,
        });
        addLog(`❌ Host ${targetIp} ${t('network_scanner.unreachable') || 'no responde'}`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      addLog(`⚠️ Fallback TCP...`);
      const result23 = await tcpPing(targetIp, 23, DEFAULT_NETWORK_TIMEOUT);
      
      if (result23.status === 'open' || result23.status === 'closed') {
        setPingResult({
          ip: targetIp,
          success: true,
          responseTime: result23.responseTime,
          method: 'tcp',
        });
        addLog(`✅ Host ${targetIp} ${t('network_scanner.reachable') || 'alcanzable'} (${result23.responseTime}ms)`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        setPingResult({
          ip: targetIp,
          success: false,
          error: t('network_scanner.no_response') || 'Host no responde',
          method: 'tcp',
        });
        addLog(`❌ Host ${targetIp} ${t('network_scanner.unreachable') || 'no responde'}`);
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
    
    addLog(`🔍 ${t('network_scanner.searching_mib2') || 'Buscando MIB2 en la red'}...`);
    
    try {
      const nativeResults = await nativeFindMIB2(DEFAULT_NETWORK_TIMEOUT);
      
      const results: ScanResult[] = nativeResults
        .filter(r => r.found)
        .map(r => ({
          ip: r.ip,
          port: r.port,
          status: 'open' as const,
          responseTime: r.responseTime,
        }));
      
      for (const result of results) {
        addLog(`✅ MIB2 ${t('network_scanner.found_at') || 'encontrado en'} ${result.ip}:${result.port}! (${result.responseTime}ms)`);
        setTargetIp(result.ip);
      }
      
      setScanResults(results);
      setScanProgress(100);
      
      if (results.length > 0) {
        addLog(`✅ ${results.length} ${t('network_scanner.devices_found') || 'dispositivo(s) encontrado(s)'}`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        addLog(`⚠️ ${t('network_scanner.no_mib2_found') || 'No se encontró ningún MIB2'}`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      addLog(`⚠️ ${t('network_scanner.using_fallback') || 'Usando fallback'}...`);
      const commonIPs = ['192.168.1.1', '192.168.1.4', '192.168.0.1', '10.200.1.1'];
      const results: ScanResult[] = [];
      
      for (let i = 0; i < commonIPs.length; i++) {
        const ip = commonIPs[i];
        const result = await tcpPing(ip, 23, QUICK_SCAN_TIMEOUT);
        
        if (result.status === 'open') {
          results.push(result);
          addLog(`✅ MIB2 ${t('network_scanner.found_at') || 'encontrado en'} ${ip}:23`);
          setTargetIp(ip);
        }
        
        setScanProgress(((i + 1) / commonIPs.length) * 100);
      }
      
      setScanResults(results);
      
      if (results.length > 0) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
    
    setIsScanning(false);
  };

  // ARP Scan
  const handleArpScan = async () => {
    if (isArpScanning) return;
    
    setIsArpScanning(true);
    setArpResults([]);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    addLog(`📡 ${t('network_scanner.arp_scanning') || 'Escaneando tabla ARP'}...`);
    
    try {
      const results = await quickArpScan();
      setArpResults(results);
      
      if (results.length > 0) {
        addLog(`✅ ${results.length} ${t('network_scanner.devices_detected') || 'dispositivos detectados'}`);
        
        const mib2Candidates = results.filter(r => r.isMIB2Likely || r.isMIB2Candidate);
        if (mib2Candidates.length > 0) {
          addLog(`🎯 ${mib2Candidates.length} ${t('network_scanner.possible_mib2') || 'posible(s) MIB2'}`);
        }
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        addLog(`⚠️ ${t('network_scanner.no_devices_found') || 'No se encontraron dispositivos'}`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      addLog(`❌ Error ARP: ${error}`);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    
    setIsArpScanning(false);
  };

  // Auto-Detect MIB2
  const handleAutoDetect = async () => {
    if (isArpScanning) return;
    
    setIsArpScanning(true);
    setArpResults([]);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    addLog(`🔮 ${t('network_scanner.auto_detecting') || 'Auto-detectando MIB2'}...`);
    
    try {
      // detectMIB2WithArp retorna un solo resultado o null
      const result = await detectMIB2WithArp();
      
      if (result) {
        setArpResults([result]);
        setTargetIp(result.ip);
        addLog(`🎯 MIB2 ${t('network_scanner.detected') || 'detectado'}: ${result.ip}`);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        // Si no encontró con detectMIB2WithArp, hacer ARP scan completo
        const arpResults = await quickArpScan();
        setArpResults(arpResults);
        
        const candidates = arpResults.filter(r => r.isMIB2Candidate);
        if (candidates.length > 0) {
          addLog(`⚠️ ${candidates.length} ${t('network_scanner.candidates_found') || 'candidatos encontrados'}`);
        } else {
          addLog(`❌ ${t('network_scanner.no_mib2_detected') || 'No se detectó MIB2'}`);
        }
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
    
    setIsArpScanning(false);
  };

  const getStatusColor = (status: 'open' | 'closed' | 'timeout') => {
    switch (status) {
      case 'open': return '#34C759';
      case 'closed': return '#FF3B30';
      case 'timeout': return '#FF9500';
    }
  };

  const getStatusText = (status: 'open' | 'closed' | 'timeout') => {
    switch (status) {
      case 'open': return t('network_scanner.open') || 'Abierto';
      case 'closed': return t('network_scanner.closed') || 'Cerrado';
      case 'timeout': return 'Timeout';
    }
  };

  const isAnyLoading = isPinging || isScanning || isArpScanning;

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView 
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          isTablet && styles.contentTablet
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <View style={styles.headerIcon}>
            <IconSymbol name="point.3.connected.trianglepath.dotted" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {t('network_scanner.title') || 'Network Scanner'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t('network_scanner.subtitle') || 'Verificar conectividad con MIB2'}
          </Text>
        </Animated.View>

        {/* IP Input Card */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(100)}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.cardHeader}>
            <IconSymbol name="network" size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {t('network_scanner.target_ip') || 'IP de destino'}
            </Text>
          </View>
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
            selectTextOnFocus
          />
        </Animated.View>

        {/* Action Buttons Grid */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(200)}
          style={[
            styles.buttonGrid,
            isTablet && styles.buttonGridTablet
          ]}
        >
          {/* Ping Button */}
          <Pressable
            onPress={handlePing}
            disabled={isAnyLoading}
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: '#007AFF',
                opacity: isAnyLoading ? 0.5 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {isPinging ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="antenna.radiowaves.left.and.right" size={22} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {isPinging ? (t('network_scanner.pinging') || 'Probando...') : 'Ping'}
            </Text>
          </Pressable>

          {/* Scan Ports Button */}
          <Pressable
            onPress={handleScanPorts}
            disabled={isAnyLoading}
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: '#34C759',
                opacity: isAnyLoading ? 0.5 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="network" size={22} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {isScanning ? `${Math.round(scanProgress)}%` : (t('network_scanner.scan_ports') || 'Puertos')}
            </Text>
          </Pressable>

          {/* ARP Scan Button */}
          <Pressable
            onPress={handleArpScan}
            disabled={isAnyLoading}
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: '#5856D6',
                opacity: isAnyLoading ? 0.5 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {isArpScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="list.bullet" size={22} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {t('network_scanner.arp_scan') || 'ARP'}
            </Text>
          </Pressable>

          {/* Find MIB2 Button */}
          <Pressable
            onPress={handleScanNetwork}
            disabled={isAnyLoading}
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: '#FF9500',
                opacity: isAnyLoading ? 0.5 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="magnifyingglass" size={22} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {t('network_scanner.find_mib2') || 'Buscar'}
            </Text>
          </Pressable>

          {/* Auto-Detect Button - Full Width */}
          <Pressable
            onPress={handleAutoDetect}
            disabled={isAnyLoading}
            style={({ pressed }) => [
              styles.actionButton,
              styles.fullWidthButton,
              { 
                backgroundColor: '#FF2D55',
                opacity: isAnyLoading ? 0.5 : pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {isArpScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <IconSymbol name="sparkles" size={22} color="#FFFFFF" />
            )}
            <Text style={styles.buttonText}>
              {t('network_scanner.auto_detect') || 'Auto-Detectar MIB2'}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Loading Indicator - Animated Network Scan */}
        {isAnyLoading && (
          <Animated.View 
            entering={FadeInUp.duration(300)}
            style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <SkeletonNetworkScan 
              message={
                isPinging ? (t('network_scanner.pinging') || 'Probando conexión...') :
                isScanning ? (t('network_scanner.scanning') || 'Escaneando red...') :
                isArpScanning ? (t('network_scanner.arp_scanning') || 'Detectando dispositivos...') :
                (t('network_scanner.loading') || 'Cargando...')
              }
              progress={scanProgress}
              showProgress={isScanning && scanProgress > 0}
            />
          </Animated.View>
        )}

        {/* Ping Result */}
        {pingResult && !isAnyLoading && (
          <Animated.View 
            entering={FadeInUp.duration(300)}
            style={[styles.resultCard, { 
              backgroundColor: pingResult.success ? '#34C75915' : '#FF3B3015',
              borderColor: pingResult.success ? '#34C759' : '#FF3B30',
            }]}
          >
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
                {t('network_scanner.response_time') || 'Tiempo de respuesta'}: {pingResult.responseTime}ms ({pingResult.method?.toUpperCase()})
              </Text>
            )}
            {!pingResult.success && pingResult.error && (
              <Text style={[styles.resultDetail, { color: colors.muted }]}>
                {pingResult.error}
              </Text>
            )}
          </Animated.View>
        )}

        {/* ARP Results */}
        {arpResults.length > 0 && !isAnyLoading && (
          <Animated.View 
            entering={FadeInUp.duration(300)}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.cardHeader}>
              <IconSymbol name="list.bullet" size={20} color="#5856D6" />
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {t('network_scanner.arp_results') || 'Dispositivos Detectados'}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: '#5856D6' }]}>
                <Text style={styles.countBadgeText}>{arpResults.length}</Text>
              </View>
            </View>
            {arpResults.map((result, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  setTargetIp(result.ip);
                  addLog(`📌 IP ${t('network_scanner.selected') || 'seleccionada'}: ${result.ip}`);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={({ pressed }) => [
                  styles.arpResultItem,
                  { 
                    backgroundColor: result.isMIB2Likely ? '#34C75910' : 
                                    result.isMIB2Candidate ? '#FF950010' : colors.background,
                    borderColor: result.isMIB2Likely ? '#34C759' : 
                                result.isMIB2Candidate ? '#FF9500' : colors.border,
                    opacity: pressed ? 0.7 : 1,
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                  },
                ]}
              >
                <View style={styles.arpResultHeader}>
                  <View style={styles.arpResultInfo}>
                    <Text style={[styles.arpResultIp, { color: colors.foreground }]}>
                      {result.ip}
                    </Text>
                    <Text style={[styles.arpResultMac, { color: colors.muted }]}>
                      {result.mac}
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
                        <Text style={styles.badgeText}>{t('network_scanner.possible') || 'Posible'}</Text>
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
          </Animated.View>
        )}

        {/* Scan Results */}
        {scanResults.length > 0 && !isAnyLoading && (
          <Animated.View 
            entering={FadeInUp.duration(300)}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.cardHeader}>
              <IconSymbol name="network" size={20} color="#34C759" />
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {t('network_scanner.scan_results') || 'Resultados del Escaneo'}
              </Text>
            </View>
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
          </Animated.View>
        )}

        {/* Connection Tips */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(300)}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.cardHeader}>
            <IconSymbol name="info.circle.fill" size={20} color="#FF9500" />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
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
              • {t('network_scanner.tip_3') || 'Habilitar Ethernet en GEM → debugging mlp'}
            </Text>
            <Text style={[styles.tipItem, { color: colors.muted }]}>
              • {t('network_scanner.tip_4') || 'IP estática Android: 192.168.1.10'}
            </Text>
          </View>
        </Animated.View>

        {/* Logs Section */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(400)}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.cardHeader}>
            <IconSymbol name="doc.fill" size={18} color={colors.muted} />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {t('network_scanner.logs') || 'Logs'}
            </Text>
            {logs.length > 0 && (
              <View style={[styles.countBadge, { backgroundColor: colors.muted }]}>
                <Text style={styles.countBadgeText}>{logs.length}</Text>
              </View>
            )}
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
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  contentTablet: {
    paddingHorizontal: 32,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    borderWidth: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  buttonGridTablet: {
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidthButton: {
    minWidth: '100%',
    flex: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  resultDetail: {
    fontSize: 14,
    marginLeft: 34,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultInfo: {
    flex: 1,
  },
  portText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  responseText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  logsContainer: {
    maxHeight: 180,
  },
  logEmpty: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
  logItem: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
    marginBottom: 4,
  },
  arpResultItem: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
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
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  arpResultMac: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 4,
    opacity: 0.8,
  },
  arpResultBadges: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
    maxWidth: 130,
    justifyContent: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  arpResultTime: {
    fontSize: 11,
    marginTop: 8,
  },
  loadingCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});
