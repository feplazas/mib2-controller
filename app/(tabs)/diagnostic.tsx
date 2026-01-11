import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect } from "react";
import * as Clipboard from "expo-clipboard";
import { ScreenContainer } from "@/components/screen-container";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

// Global log storage
let globalLogs: LogEntry[] = [];
let logListeners: ((logs: LogEntry[]) => void)[] = [];

export function addDiagnosticLog(level: LogEntry["level"], message: string) {
  const entry: LogEntry = {
    timestamp: new Date().toLocaleTimeString(),
    level,
    message,
  };
  
  globalLogs.push(entry);
  
  // Keep only last 200 logs
  if (globalLogs.length > 200) {
    globalLogs = globalLogs.slice(-200);
  }
  
  // Notify all listeners
  logListeners.forEach(listener => listener([...globalLogs]));
  
  // Also log to console
  console.log(`[USB-DIAG] [${level.toUpperCase()}] ${message}`);
}

export function clearDiagnosticLogs() {
  globalLogs = [];
  logListeners.forEach(listener => listener([]));
}

export default function DiagnosticScreen() {
  const [logs, setLogs] = useState<LogEntry[]>(globalLogs);

  useEffect(() => {
    // Subscribe to log updates
    const listener = (newLogs: LogEntry[]) => setLogs(newLogs);
    logListeners.push(listener);

    // Initial log
    if (logs.length === 0) {
      addDiagnosticLog("info", "Sistema de diagnóstico USB iniciado");
      addDiagnosticLog("info", "Conecta un dispositivo USB y presiona 'Escanear' en la pestaña USB");
    }

    return () => {
      logListeners = logListeners.filter(l => l !== listener);
    };
  }, []);

  const handleCopyLogs = async () => {
    const logsText = logs
      .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`)
      .join("\n");
    
    await Clipboard.setStringAsync(logsText);
    Alert.alert("Logs copiados", "Los logs se copiaron al portapapeles. Puedes enviarlos para diagnóstico.");
  };

  const handleClearLogs = () => {
    clearDiagnosticLogs();
    addDiagnosticLog("info", "Logs limpiados");
  };

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "info": return "text-blue-400";
      case "warn": return "text-yellow-400";
      case "error": return "text-red-400";
      case "success": return "text-green-400";
    }
  };

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "info": return "ℹ️";
      case "warn": return "⚠️";
      case "error": return "❌";
      case "success": return "✅";
    }
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-1">
        <Text className="text-2xl font-bold text-foreground mb-2">
          Diagnóstico USB
        </Text>
        <Text className="text-sm text-muted mb-4">
          Información detallada sobre la detección de dispositivos USB
        </Text>

        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={handleCopyLogs}
            className="flex-1 bg-primary px-4 py-3 rounded-lg active:opacity-80"
          >
            <Text className="text-background font-semibold text-center">
              📋 Copiar Logs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearLogs}
            className="flex-1 bg-surface px-4 py-3 rounded-lg active:opacity-80 border border-border"
          >
            <Text className="text-foreground font-semibold text-center">
              🗑️ Limpiar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1 bg-surface rounded-lg p-3 border border-border"
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {logs.length === 0 ? (
            <Text className="text-muted text-center py-8">
              No hay logs todavía
            </Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} className="mb-2">
                <View className="flex-row items-start gap-2">
                  <Text className="text-xs">{getLevelIcon(log.level)}</Text>
                  <View className="flex-1">
                    <Text className="text-xs text-muted">
                      {log.timestamp}
                    </Text>
                    <Text className={`text-sm ${getLevelColor(log.level)}`}>
                      {log.message}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View className="mt-4 bg-surface rounded-lg p-4 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-2">
            💡 Cómo usar:
          </Text>
          <Text className="text-xs text-muted leading-relaxed">
            1. Ve a la pestaña "USB"{"\n"}
            2. Conecta tu adaptador USB-Ethernet{"\n"}
            3. Presiona "Escanear Dispositivos USB"{"\n"}
            4. Vuelve aquí para ver los logs detallados{"\n"}
            5. Copia los logs y envíalos si necesitas ayuda
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
