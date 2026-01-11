/**
 * Telnet Client for MIB2 Communication
 * 
 * This module provides a Telnet client implementation for connecting to
 * MIB2 STD2 Technisat/Preh units over Ethernet.
 */

export interface TelnetConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  timeout?: number;
}

export interface TelnetResponse {
  success: boolean;
  output: string;
  error?: string;
  timestamp: number;
}

export interface ConnectionStatus {
  connected: boolean;
  host?: string;
  port?: number;
  lastActivity?: number;
}

/**
 * TelnetClient class for managing Telnet connections to MIB2 units
 */
export class TelnetClient {
  private config: TelnetConfig;
  private socket: WebSocket | null = null;
  private connectionStatus: ConnectionStatus = { connected: false };
  private responseBuffer: string = '';
  private pendingCommand: ((response: TelnetResponse) => void) | null = null;

  constructor(config: TelnetConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Connect to the MIB2 unit via Telnet
   */
  async connect(): Promise<TelnetResponse> {
    try {
      // In a real implementation, we would use a WebSocket proxy server
      // that bridges WebSocket to Telnet protocol
      // For now, we'll use the backend API endpoint
      const response = await fetch(`${this.getBackendUrl()}/api/telnet/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: this.config.host,
          port: this.config.port,
          username: this.config.username,
          password: this.config.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        this.connectionStatus = {
          connected: true,
          host: this.config.host,
          port: this.config.port,
          lastActivity: Date.now(),
        };
      }

      return {
        success: data.success,
        output: data.output || '',
        error: data.error,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Disconnect from the MIB2 unit
   */
  async disconnect(): Promise<void> {
    try {
      await fetch(`${this.getBackendUrl()}/api/telnet/disconnect`, {
        method: 'POST',
      });

      this.connectionStatus = { connected: false };
      this.responseBuffer = '';
      this.pendingCommand = null;
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  /**
   * Execute a shell command on the MIB2 unit
   */
  async executeCommand(command: string): Promise<TelnetResponse> {
    if (!this.connectionStatus.connected) {
      return {
        success: false,
        output: '',
        error: 'Not connected to MIB2 unit',
        timestamp: Date.now(),
      };
    }

    try {
      const response = await fetch(`${this.getBackendUrl()}/api/telnet/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();

      this.connectionStatus.lastActivity = Date.now();

      return {
        success: data.success,
        output: data.output || '',
        error: data.error,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get the current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Get the backend API URL
   */
  private getBackendUrl(): string {
    // In production, this would be the deployed backend URL
    // For development, use the local server
    return __DEV__ ? 'http://localhost:3000' : 'https://your-backend-url.com';
  }
}

/**
 * Default configuration for MIB2 connections
 */
export const DEFAULT_MIB2_CONFIG: TelnetConfig = {
  host: '192.168.1.4',
  port: 23,
  username: 'root',
  password: 'root',
  timeout: 30000,
};

/**
 * Validate a shell command for safety
 */
export function validateCommand(command: string): { valid: boolean; error?: string } {
  // Basic validation to prevent dangerous commands
  const dangerousPatterns = [
    /rm\s+-rf\s+\/(?!tmp|var\/tmp)/i, // Prevent recursive deletion of root
    /mkfs/i, // Prevent filesystem formatting
    /dd\s+if=/i, // Prevent disk operations
    />\s*\/dev\/sd/i, // Prevent writing to disk devices
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      return {
        valid: false,
        error: 'Command contains potentially dangerous operations',
      };
    }
  }

  return { valid: true };
}

/**
 * Parse firmware version from MIB2 output
 */
export function parseFirmwareVersion(output: string): string | null {
  // Example: MST2_EU_VW_PQ_P0480T
  const match = output.match(/MST2_[A-Z]{2}_[A-Z]{2}_[A-Z]{2}_P\d{4}[A-Z]/);
  return match ? match[0] : null;
}

/**
 * Format command output for display
 */
export function formatOutput(output: string): string {
  return output
    .trim()
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .join('\n');
}
