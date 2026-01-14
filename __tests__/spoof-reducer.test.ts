import { describe, it, expect } from 'vitest';
import { spoofReducer, initialSpoofState } from '../lib/spoof-reducer';
import type { SpoofAction } from '../lib/spoof-reducer';

describe('spoofReducer', () => {
  it('should return initial state', () => {
    expect(initialSpoofState.isExecuting).toBe(false);
    expect(initialSpoofState.currentStep).toBe('idle');
    expect(initialSpoofState.errorMessage).toBe('');
  });

  it('should handle START_EXECUTION', () => {
    const action: SpoofAction = { type: 'START_EXECUTION' };
    const newState = spoofReducer(initialSpoofState, action);
    
    expect(newState.isExecuting).toBe(true);
    expect(newState.currentStep).toBe('validating');
    expect(newState.errorMessage).toBe('');
    expect(newState.successMessage).toBe('');
  });

  it('should handle SET_STEP', () => {
    const action: SpoofAction = { type: 'SET_STEP', payload: 'creating_backup' };
    const newState = spoofReducer(initialSpoofState, action);
    
    expect(newState.currentStep).toBe('creating_backup');
    expect(newState.isExecuting).toBe(true);
  });

  it('should stop execution on success step', () => {
    const action: SpoofAction = { type: 'SET_STEP', payload: 'success' };
    const newState = spoofReducer(initialSpoofState, action);
    
    expect(newState.currentStep).toBe('success');
    expect(newState.isExecuting).toBe(false);
  });

  it('should handle SET_ERROR', () => {
    const action: SpoofAction = { type: 'SET_ERROR', payload: 'Test error message' };
    const newState = spoofReducer(initialSpoofState, action);
    
    expect(newState.currentStep).toBe('error');
    expect(newState.errorMessage).toBe('Test error message');
    expect(newState.isExecuting).toBe(false);
  });

  it('should handle SET_SUCCESS', () => {
    const result = {
      originalVID: '0x0B95',
      originalPID: '0x772A',
      newVID: '0x2001',
      newPID: '0x3C05',
      chipset: 'AX88772A',
      deviceName: 'USB Ethernet',
      timestamp: new Date(),
    };
    
    const action: SpoofAction = { 
      type: 'SET_SUCCESS', 
      payload: { 
        message: 'Success!',
        result 
      } 
    };
    const newState = spoofReducer(initialSpoofState, action);
    
    expect(newState.currentStep).toBe('success');
    expect(newState.successMessage).toBe('Success!');
    expect(newState.spoofingResult).toEqual(result);
    expect(newState.isExecuting).toBe(false);
  });

  it('should handle UPDATE_PROGRESS', () => {
    const action: SpoofAction = { 
      type: 'UPDATE_PROGRESS', 
      payload: { progress: 50, bytesProcessed: 128 } 
    };
    const newState = spoofReducer(initialSpoofState, action);
    
    expect(newState.eepromProgress.progress).toBe(50);
    expect(newState.eepromProgress.bytesProcessed).toBe(128);
  });

  it('should handle RESET_PROGRESS', () => {
    const stateWithProgress = {
      ...initialSpoofState,
      eepromProgress: {
        progress: 50,
        bytesProcessed: 128,
        totalBytes: 256,
        operation: 'read' as const,
      },
    };
    
    const action: SpoofAction = { 
      type: 'RESET_PROGRESS', 
      payload: { operation: 'write', totalBytes: 4 } 
    };
    const newState = spoofReducer(stateWithProgress, action);
    
    expect(newState.eepromProgress.progress).toBe(0);
    expect(newState.eepromProgress.bytesProcessed).toBe(0);
    expect(newState.eepromProgress.totalBytes).toBe(4);
    expect(newState.eepromProgress.operation).toBe('write');
  });

  it('should handle SHOW_SUCCESS_MODAL', () => {
    const action: SpoofAction = { type: 'SHOW_SUCCESS_MODAL', payload: true };
    const newState = spoofReducer(initialSpoofState, action);
    
    expect(newState.showSuccessModal).toBe(true);
  });

  it('should handle START_TEST', () => {
    const action: SpoofAction = { type: 'START_TEST' };
    const newState = spoofReducer(initialSpoofState, action);
    
    expect(newState.isTesting).toBe(true);
    expect(newState.testResult).toBe(null);
  });

  it('should handle SET_TEST_RESULT', () => {
    const stateWithTesting = {
      ...initialSpoofState,
      isTesting: true,
    };
    
    const action: SpoofAction = { type: 'SET_TEST_RESULT', payload: 'success' };
    const newState = spoofReducer(stateWithTesting, action);
    
    expect(newState.isTesting).toBe(false);
    expect(newState.testResult).toBe('success');
  });

  it('should handle TOGGLE_SKIP_VERIFICATION', () => {
    const action: SpoofAction = { type: 'TOGGLE_SKIP_VERIFICATION' };
    const newState = spoofReducer(initialSpoofState, action);
    
    expect(newState.skipVerification).toBe(true);
    
    const newState2 = spoofReducer(newState, action);
    expect(newState2.skipVerification).toBe(false);
  });

  it('should handle RESET', () => {
    const modifiedState = {
      ...initialSpoofState,
      isExecuting: true,
      currentStep: 'writing_vid_low' as const,
      errorMessage: 'Some error',
    };
    
    const action: SpoofAction = { type: 'RESET' };
    const newState = spoofReducer(modifiedState, action);
    
    expect(newState).toEqual(initialSpoofState);
  });
});
