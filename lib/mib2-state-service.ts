/**
 * MIB2 State Service
 * 
 * Verifica el estado del sistema MIB2 para habilitar/deshabilitar
 * comandos de Telnet relevantes según las condiciones detectadas.
 */

export interface MIB2SystemState {
  // Estado de conexión
  isConnected: boolean;
  connectionTime: Date | null;
  
  // Estado del sistema
  hasRootAccess: boolean;
  isSDMounted: boolean;
  sdMountPath: string | null;
  isToolboxInstalled: boolean;
  toolboxPath: string | null;
  isSystemPatched: boolean;
  
  // Información del sistema
  qnxVersion: string | null;
  firmwareVersion: string | null;
  hardwarePartNumber: string | null;
  
  // Estado de verificación
  lastVerification: Date | null;
  verificationInProgress: boolean;
  verificationErrors: string[];
}

export interface StateCheckResult {
  success: boolean;
  state: Partial<MIB2SystemState>;
  output: string;
  error?: string;
}

// Comandos para verificar cada estado
const STATE_CHECK_COMMANDS = {
  rootAccess: {
    command: 'whoami',
    parser: (output: string): boolean => {
      return output.trim().toLowerCase() === 'root';
    }
  },
  sdMounted: {
    command: 'mount | grep -E "/mnt/sd|/fs/sd"',
    parser: (output: string): { mounted: boolean; path: string | null } => {
      const lines = output.trim().split('\n').filter(l => l.length > 0);
      if (lines.length > 0) {
        // Extraer el punto de montaje
        const match = output.match(/on\s+(\/\S+)/);
        return { mounted: true, path: match ? match[1] : '/mnt/sd' };
      }
      return { mounted: false, path: null };
    }
  },
  toolboxInstalled: {
    command: 'ls -la /eso/bin/apps 2>/dev/null || ls -la /eso 2>/dev/null || echo "NOT_FOUND"',
    parser: (output: string): { installed: boolean; path: string | null } => {
      if (output.includes('NOT_FOUND') || output.includes('No such file')) {
        return { installed: false, path: null };
      }
      // Verificar si hay archivos del toolbox
      if (output.includes('toolbox') || output.includes('gem') || output.includes('apps')) {
        return { installed: true, path: '/eso' };
      }
      return { installed: false, path: null };
    }
  },
  systemPatched: {
    command: 'ls -la /eso/hmi/lsd/tsd.mibstd2.system.swap 2>/dev/null || echo "NOT_PATCHED"',
    parser: (output: string): boolean => {
      return !output.includes('NOT_PATCHED') && !output.includes('No such file');
    }
  },
  qnxVersion: {
    command: 'uname -a',
    parser: (output: string): string | null => {
      // QNX output format: QNX localhost 6.5.0 2012/07/06-14:15:45EDT armle
      const match = output.match(/QNX\s+\S+\s+(\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    }
  },
  firmwareVersion: {
    command: 'cat /etc/version 2>/dev/null || cat /mnt/efs-persist/version 2>/dev/null || echo "UNKNOWN"',
    parser: (output: string): string | null => {
      if (output.includes('UNKNOWN')) return null;
      // Buscar patrón de versión tipo T480, T594, etc.
      const match = output.match(/[TU]\d{3,4}/i);
      return match ? match[0].toUpperCase() : output.trim().substring(0, 20);
    }
  },
  hardwarePartNumber: {
    command: 'cat /mnt/efs-persist/hwinfo 2>/dev/null || pidin info 2>/dev/null | head -5 || echo "UNKNOWN"',
    parser: (output: string): string | null => {
      if (output.includes('UNKNOWN')) return null;
      // Buscar número de parte tipo 5F0 035 XXX
      const match = output.match(/5F\d[\s-]?\d{3}[\s-]?\d{3}/);
      return match ? match[0].replace(/[\s-]/g, ' ') : null;
    }
  }
};

// Estado inicial
const INITIAL_STATE: MIB2SystemState = {
  isConnected: false,
  connectionTime: null,
  hasRootAccess: false,
  isSDMounted: false,
  sdMountPath: null,
  isToolboxInstalled: false,
  toolboxPath: null,
  isSystemPatched: false,
  qnxVersion: null,
  firmwareVersion: null,
  hardwarePartNumber: null,
  lastVerification: null,
  verificationInProgress: false,
  verificationErrors: []
};

// Singleton para mantener el estado
let currentState: MIB2SystemState = { ...INITIAL_STATE };
let stateListeners: ((state: MIB2SystemState) => void)[] = [];

/**
 * Obtiene el estado actual del sistema MIB2
 */
export function getMIB2State(): MIB2SystemState {
  return { ...currentState };
}

/**
 * Actualiza el estado y notifica a los listeners
 */
function updateState(partialState: Partial<MIB2SystemState>): void {
  currentState = { ...currentState, ...partialState };
  stateListeners.forEach(listener => listener(currentState));
}

/**
 * Suscribirse a cambios de estado
 */
export function subscribeMIB2State(listener: (state: MIB2SystemState) => void): () => void {
  stateListeners.push(listener);
  // Notificar estado actual inmediatamente
  listener(currentState);
  // Retornar función para desuscribirse
  return () => {
    stateListeners = stateListeners.filter(l => l !== listener);
  };
}

/**
 * Marca la conexión como establecida
 */
export function setConnected(connected: boolean): void {
  if (connected) {
    updateState({
      isConnected: true,
      connectionTime: new Date()
    });
  } else {
    // Resetear estado al desconectar
    updateState({
      ...INITIAL_STATE,
      lastVerification: currentState.lastVerification
    });
  }
}

/**
 * Ejecuta un comando de verificación y parsea el resultado
 */
export async function executeStateCheck(
  checkName: keyof typeof STATE_CHECK_COMMANDS,
  executeCommand: (cmd: string) => Promise<string>
): Promise<StateCheckResult> {
  const check = STATE_CHECK_COMMANDS[checkName];
  
  try {
    const output = await executeCommand(check.command);
    const result = check.parser(output);
    
    return {
      success: true,
      state: parseCheckResult(checkName, result),
      output
    };
  } catch (error) {
    return {
      success: false,
      state: {},
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Convierte el resultado del parser al formato de estado
 */
function parseCheckResult(checkName: string, result: unknown): Partial<MIB2SystemState> {
  switch (checkName) {
    case 'rootAccess':
      return { hasRootAccess: result as boolean };
    case 'sdMounted':
      const sdResult = result as { mounted: boolean; path: string | null };
      return { isSDMounted: sdResult.mounted, sdMountPath: sdResult.path };
    case 'toolboxInstalled':
      const tbResult = result as { installed: boolean; path: string | null };
      return { isToolboxInstalled: tbResult.installed, toolboxPath: tbResult.path };
    case 'systemPatched':
      return { isSystemPatched: result as boolean };
    case 'qnxVersion':
      return { qnxVersion: result as string | null };
    case 'firmwareVersion':
      return { firmwareVersion: result as string | null };
    case 'hardwarePartNumber':
      return { hardwarePartNumber: result as string | null };
    default:
      return {};
  }
}

/**
 * Ejecuta verificación completa del sistema
 */
export async function verifyFullSystemState(
  executeCommand: (cmd: string) => Promise<string>
): Promise<MIB2SystemState> {
  updateState({ verificationInProgress: true, verificationErrors: [] });
  
  const errors: string[] = [];
  const newState: Partial<MIB2SystemState> = {};
  
  // Verificar cada estado en secuencia
  const checks: (keyof typeof STATE_CHECK_COMMANDS)[] = [
    'rootAccess',
    'sdMounted',
    'toolboxInstalled',
    'systemPatched',
    'qnxVersion',
    'firmwareVersion',
    'hardwarePartNumber'
  ];
  
  for (const checkName of checks) {
    const result = await executeStateCheck(checkName, executeCommand);
    if (result.success) {
      Object.assign(newState, result.state);
    } else {
      errors.push(`${checkName}: ${result.error}`);
    }
  }
  
  updateState({
    ...newState,
    lastVerification: new Date(),
    verificationInProgress: false,
    verificationErrors: errors
  });
  
  return getMIB2State();
}

/**
 * Verifica un estado específico
 */
export async function verifySingleState(
  checkName: keyof typeof STATE_CHECK_COMMANDS,
  executeCommand: (cmd: string) => Promise<string>
): Promise<StateCheckResult> {
  const result = await executeStateCheck(checkName, executeCommand);
  if (result.success) {
    updateState(result.state);
  }
  return result;
}

/**
 * Determina qué categorías de scripts están disponibles según el estado
 */
export function getAvailableScriptCategories(state: MIB2SystemState): {
  verification: boolean;
  preparation: boolean;
  installation: boolean;
  activation: boolean;
  system: boolean;
} {
  return {
    // Verificación siempre disponible si hay conexión
    verification: state.isConnected,
    // Preparación disponible si hay root
    preparation: state.isConnected && state.hasRootAccess,
    // Instalación disponible si SD está montada
    installation: state.isConnected && state.hasRootAccess && state.isSDMounted,
    // Activación disponible si Toolbox está instalado
    activation: state.isConnected && state.hasRootAccess && state.isToolboxInstalled,
    // Sistema siempre disponible con root
    system: state.isConnected && state.hasRootAccess
  };
}

/**
 * Determina si un script específico está habilitado según el estado
 */
export function isScriptEnabled(scriptId: string, state: MIB2SystemState): {
  enabled: boolean;
  reason?: string;
} {
  // Scripts de verificación siempre habilitados si hay conexión
  const verificationScripts = ['verify_root', 'list_storage', 'check_sd_mounted', 'check_eso', 'system_info'];
  if (verificationScripts.includes(scriptId)) {
    return state.isConnected 
      ? { enabled: true }
      : { enabled: false, reason: 'requires_connection' };
  }
  
  // Scripts de preparación requieren root
  const preparationScripts = ['create_mount_point', 'mount_sd_qnx6', 'mount_sd_alt1', 'mount_sd_alt2', 'list_sd_contents'];
  if (preparationScripts.includes(scriptId)) {
    if (!state.isConnected) return { enabled: false, reason: 'requires_connection' };
    if (!state.hasRootAccess) return { enabled: false, reason: 'requires_root' };
    // Si SD ya está montada, deshabilitar comandos de montaje
    if (state.isSDMounted && scriptId.startsWith('mount_sd')) {
      return { enabled: false, reason: 'sd_already_mounted' };
    }
    return { enabled: true };
  }
  
  // Scripts de instalación requieren SD montada
  const installationScripts = ['set_permissions', 'run_install', 'run_install_sh', 'run_bootstrap', 'verify_installation'];
  if (installationScripts.includes(scriptId)) {
    if (!state.isConnected) return { enabled: false, reason: 'requires_connection' };
    if (!state.hasRootAccess) return { enabled: false, reason: 'requires_root' };
    if (!state.isSDMounted) return { enabled: false, reason: 'requires_sd_mounted' };
    // Si Toolbox ya está instalado, deshabilitar instalación
    if (state.isToolboxInstalled && scriptId.startsWith('run_')) {
      return { enabled: false, reason: 'toolbox_already_installed' };
    }
    return { enabled: true };
  }
  
  // Scripts de activación requieren Toolbox instalado
  const activationScripts = ['run_gem', 'patch_swap'];
  if (activationScripts.includes(scriptId)) {
    if (!state.isConnected) return { enabled: false, reason: 'requires_connection' };
    if (!state.hasRootAccess) return { enabled: false, reason: 'requires_root' };
    if (!state.isToolboxInstalled) return { enabled: false, reason: 'requires_toolbox' };
    // Si sistema ya está parcheado, deshabilitar parche
    if (state.isSystemPatched && scriptId === 'patch_swap') {
      return { enabled: false, reason: 'system_already_patched' };
    }
    return { enabled: true };
  }
  
  // Scripts de sistema requieren root
  const systemScripts = ['reboot_mib', 'unmount_sd', 'list_processes', 'network_info'];
  if (systemScripts.includes(scriptId)) {
    if (!state.isConnected) return { enabled: false, reason: 'requires_connection' };
    if (!state.hasRootAccess) return { enabled: false, reason: 'requires_root' };
    // Unmount solo si SD está montada
    if (scriptId === 'unmount_sd' && !state.isSDMounted) {
      return { enabled: false, reason: 'sd_not_mounted' };
    }
    return { enabled: true };
  }
  
  // Por defecto, habilitar si hay conexión
  return state.isConnected 
    ? { enabled: true }
    : { enabled: false, reason: 'requires_connection' };
}

/**
 * Obtiene el siguiente paso recomendado según el estado actual
 */
export function getRecommendedNextStep(state: MIB2SystemState): {
  scriptId: string | null;
  category: string | null;
  message: string;
} {
  if (!state.isConnected) {
    return {
      scriptId: null,
      category: null,
      message: 'connect_first'
    };
  }
  
  if (!state.hasRootAccess) {
    return {
      scriptId: 'verify_root',
      category: 'verification',
      message: 'verify_root_access'
    };
  }
  
  if (!state.isSDMounted) {
    return {
      scriptId: 'mount_sd_qnx6',
      category: 'preparation',
      message: 'mount_sd_card'
    };
  }
  
  if (!state.isToolboxInstalled) {
    return {
      scriptId: 'run_install',
      category: 'installation',
      message: 'install_toolbox'
    };
  }
  
  if (!state.isSystemPatched) {
    return {
      scriptId: 'patch_swap',
      category: 'activation',
      message: 'patch_system'
    };
  }
  
  return {
    scriptId: null,
    category: null,
    message: 'system_ready'
  };
}

/**
 * Resetea el estado a valores iniciales
 */
export function resetMIB2State(): void {
  currentState = { ...INITIAL_STATE };
  stateListeners.forEach(listener => listener(currentState));
}
