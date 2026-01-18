/**
 * Reducer para gestión de estado del proceso de spoofing
 * Simplifica la lógica de auto-spoof.tsx eliminando múltiples useState
 */

export type SpoofStep = 
  | 'idle' 
  | 'validating' 
  | 'creating_backup' 
  | 'writing_vid_low' 
  | 'writing_vid_high' 
  | 'writing_pid_low' 
  | 'writing_pid_high' 
  | 'verifying' 
  | 'rolling_back'  // Nuevo: rollback automático si verificación falla
  | 'success' 
  | 'error';

export interface SpoofingResult {
  originalVID: string;
  originalPID: string;
  newVID: string;
  newPID: string;
  chipset: string;
  deviceName: string;
  timestamp: Date;
}

export interface EepromProgress {
  progress: number; // 0-100
  bytesProcessed: number;
  totalBytes: number;
  operation: 'read' | 'write';
}

export interface DryRunChange {
  offset: number;
  offsetHex: string;
  currentValue: string;
  newValue: string;
  description: string;
}

export interface DryRunResult {
  wouldSucceed: boolean;
  currentVID: number;
  currentPID: number;
  targetVID: number;
  targetPID: number;
  changes: DryRunChange[];
  warnings: string[];
  eepromType: 'external_eeprom' | 'efuse' | 'unknown';
}

export interface ChecksumResult {
  valid: boolean;
  storedChecksum: number;
  calculatedChecksum: number;
  checksumOffset: number;
  dataRange: string;
  affectsVIDPID: boolean;
  details: string;
}

export interface SafeTestStep {
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  duration: number;
  details: string;
}

export interface SafeTestResult {
  success: boolean;
  wouldSucceedInRealMode: boolean;
  steps: SafeTestStep[];
  summary: {
    currentVID: string;
    currentPID: string;
    targetVID: string;
    targetPID: string;
    eepromType: string;
    isWritable: boolean;
    totalChanges: number;
    estimatedRealTime: number;
  };
  warnings: string[];
  errors: string[];
}

export interface SpoofState {
  // Estado del proceso
  isExecuting: boolean;
  currentStep: SpoofStep;
  
  // Mensajes
  errorMessage: string;
  successMessage: string;
  
  // Progreso EEPROM
  eepromProgress: EepromProgress;
  
  // Resultado
  spoofingResult: SpoofingResult | null;
  showSuccessModal: boolean;
  
  // Testing
  isTesting: boolean;
  testResult: 'success' | 'fail' | null;
  
  // Configuración
  skipVerification: boolean;
  
  // Dry-Run
  isDryRunning: boolean;
  dryRunResult: DryRunResult | null;
  
  // Checksum
  isVerifyingChecksum: boolean;
  checksumResult: ChecksumResult | null;
  
  // Safe Test Mode
  isSafeTestRunning: boolean;
  safeTestProgress: number;
  safeTestProgressDetails: string;
  safeTestResult: SafeTestResult | null;
}

export type SpoofAction =
  | { type: 'START_EXECUTION' }
  | { type: 'SET_STEP'; payload: SpoofStep }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_SUCCESS'; payload: { message: string; result: SpoofingResult } }
  | { type: 'UPDATE_PROGRESS'; payload: Partial<EepromProgress> }
  | { type: 'RESET_PROGRESS'; payload: { operation: 'read' | 'write'; totalBytes: number } }
  | { type: 'SHOW_SUCCESS_MODAL'; payload: boolean }
  | { type: 'START_TEST' }
  | { type: 'SET_TEST_RESULT'; payload: 'success' | 'fail' | null }
  | { type: 'TOGGLE_SKIP_VERIFICATION' }
  | { type: 'START_DRY_RUN' }
  | { type: 'SET_DRY_RUN_RESULT'; payload: DryRunResult | null }
  | { type: 'START_CHECKSUM_VERIFY' }
  | { type: 'SET_CHECKSUM_RESULT'; payload: ChecksumResult | null }
  | { type: 'START_SAFE_TEST' }
  | { type: 'UPDATE_SAFE_TEST_PROGRESS'; payload: { progress: number; details: string } }
  | { type: 'SET_SAFE_TEST_RESULT'; payload: SafeTestResult | null }
  | { type: 'RESET' };

export const initialSpoofState: SpoofState = {
  isExecuting: false,
  currentStep: 'idle',
  errorMessage: '',
  successMessage: '',
  eepromProgress: {
    progress: 0,
    bytesProcessed: 0,
    totalBytes: 0,
    operation: 'read',
  },
  spoofingResult: null,
  showSuccessModal: false,
  isTesting: false,
  testResult: null,
  skipVerification: false,
  isDryRunning: false,
  dryRunResult: null,
  isVerifyingChecksum: false,
  checksumResult: null,
  isSafeTestRunning: false,
  safeTestProgress: 0,
  safeTestProgressDetails: '',
  safeTestResult: null,
};

export function spoofReducer(state: SpoofState, action: SpoofAction): SpoofState {
  switch (action.type) {
    case 'START_EXECUTION':
      return {
        ...state,
        isExecuting: true,
        currentStep: 'validating',
        errorMessage: '',
        successMessage: '',
        spoofingResult: null,
        showSuccessModal: false,
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
        isExecuting: action.payload !== 'success' && action.payload !== 'error' && action.payload !== 'idle',
      };

    case 'SET_ERROR':
      return {
        ...state,
        currentStep: 'error',
        errorMessage: action.payload,
        isExecuting: false,
      };

    case 'SET_SUCCESS':
      return {
        ...state,
        currentStep: 'success',
        successMessage: action.payload.message,
        spoofingResult: action.payload.result,
        isExecuting: false,
      };

    case 'UPDATE_PROGRESS':
      return {
        ...state,
        eepromProgress: {
          ...state.eepromProgress,
          ...action.payload,
        },
      };

    case 'RESET_PROGRESS':
      return {
        ...state,
        eepromProgress: {
          progress: 0,
          bytesProcessed: 0,
          totalBytes: action.payload.totalBytes,
          operation: action.payload.operation,
        },
      };

    case 'SHOW_SUCCESS_MODAL':
      return {
        ...state,
        showSuccessModal: action.payload,
      };

    case 'START_TEST':
      return {
        ...state,
        isTesting: true,
        testResult: null,
      };

    case 'SET_TEST_RESULT':
      return {
        ...state,
        isTesting: false,
        testResult: action.payload,
      };

    case 'TOGGLE_SKIP_VERIFICATION':
      return {
        ...state,
        skipVerification: !state.skipVerification,
      };

    case 'START_DRY_RUN':
      return {
        ...state,
        isDryRunning: true,
        dryRunResult: null,
      };

    case 'SET_DRY_RUN_RESULT':
      return {
        ...state,
        isDryRunning: false,
        dryRunResult: action.payload,
      };

    case 'START_CHECKSUM_VERIFY':
      return {
        ...state,
        isVerifyingChecksum: true,
        checksumResult: null,
      };

    case 'SET_CHECKSUM_RESULT':
      return {
        ...state,
        isVerifyingChecksum: false,
        checksumResult: action.payload,
      };

    case 'START_SAFE_TEST':
      return {
        ...state,
        isSafeTestRunning: true,
        safeTestProgress: 0,
        safeTestProgressDetails: '',
        safeTestResult: null,
      };

    case 'UPDATE_SAFE_TEST_PROGRESS':
      return {
        ...state,
        safeTestProgress: action.payload.progress,
        safeTestProgressDetails: action.payload.details,
      };

    case 'SET_SAFE_TEST_RESULT':
      return {
        ...state,
        isSafeTestRunning: false,
        safeTestResult: action.payload,
      };

    case 'RESET':
      return initialSpoofState;

    default:
      return state;
  }
}

/**
 * Helper functions para obtener texto e iconos de pasos
 */
export function getStepText(step: SpoofStep): string {
  switch (step) {
    case 'idle':
      return 'Listo para iniciar';
    case 'validating':
      return 'Validando compatibilidad del chipset...';
    case 'creating_backup':
      return 'Creando backup de seguridad de EEPROM...';
    case 'writing_vid_low':
      return 'Escribiendo VID byte bajo (0x88)...';
    case 'writing_vid_high':
      return 'Escribiendo VID byte alto (0x89)...';
    case 'writing_pid_low':
      return 'Escribiendo PID byte bajo (0x8A)...';
    case 'writing_pid_high':
      return 'Escribiendo PID byte alto (0x8B)...';
    case 'verifying':
      return 'Verificando escritura...';
    case 'success':
      return '✅ Spoofing completado exitosamente';
    case 'error':
      return '❌ Error durante el spoofing';
    default:
      return '';
  }
}

export function getStepIcon(currentStep: SpoofStep, step: SpoofStep, isExecuting: boolean): string {
  if (currentStep === step && isExecuting) return '⏳';
  if (currentStep === 'rolling_back' && step === 'rolling_back') return '⚠️'; // Icono de advertencia para rollback
  if (currentStep === 'success' && ['validating', 'creating_backup', 'writing_vid_low', 'writing_vid_high', 'writing_pid_low', 'writing_pid_high', 'verifying'].includes(step)) return '✅';
  if (currentStep === 'error') return '❌';
  return '⚪';
}
