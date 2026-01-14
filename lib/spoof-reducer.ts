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
  if (currentStep === 'success' && ['validating', 'creating_backup', 'writing_vid_low', 'writing_vid_high', 'writing_pid_low', 'writing_pid_high', 'verifying'].includes(step)) return '✅';
  if (currentStep === 'error') return '❌';
  return '⚪';
}
