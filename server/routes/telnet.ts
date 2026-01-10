/**
 * Telnet API Routes
 * 
 * Provides WebSocket-to-Telnet proxy for MIB2 communication
 */

import { Router } from 'express';
import { z } from 'zod';
import { Telnet } from 'telnet-client';

const router = Router();

// Store active Telnet connections (in production, use Redis or similar)
const connections = new Map<string, Telnet>();

// Validation schemas
const connectSchema = z.object({
  host: z.string().min(7).max(15), // IP address format
  port: z.number().int().min(1).max(65535),
  username: z.string(),
  password: z.string(),
});

const executeSchema = z.object({
  command: z.string().min(1).max(1000),
});

/**
 * POST /api/telnet/connect
 * Establish a Telnet connection to MIB2 unit
 */
router.post('/connect', async (req, res) => {
  try {
    const { host, port, username, password } = connectSchema.parse(req.body);

    const connection = new Telnet();
    const sessionId = `${host}:${port}`;

    // Close existing connection if any
    if (connections.has(sessionId)) {
      const existingConn = connections.get(sessionId)!;
      await existingConn.end();
      connections.delete(sessionId);
    }

    // Connect to MIB2
    await connection.connect({
      host,
      port,
      timeout: 30000,
      shellPrompt: /[$#>]\s*$/,
      loginPrompt: /login:\s*$/i,
      passwordPrompt: /password:\s*$/i,
      username,
      password,
      execTimeout: 10000,
    });

    // Store connection
    connections.set(sessionId, connection);

    // Get initial output (login banner)
    const output = await connection.exec('echo "Connected to MIB2"');

    res.json({
      success: true,
      output: output || 'Connected successfully',
      sessionId,
    });
  } catch (error) {
    console.error('Telnet connection error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    });
  }
});

/**
 * POST /api/telnet/disconnect
 * Close the Telnet connection
 */
router.post('/disconnect', async (req, res) => {
  try {
    // Close all connections (in production, use session-specific disconnect)
    for (const [sessionId, connection] of connections.entries()) {
      await connection.end();
      connections.delete(sessionId);
    }

    res.json({
      success: true,
      message: 'Disconnected successfully',
    });
  } catch (error) {
    console.error('Telnet disconnect error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Disconnect failed',
    });
  }
});

/**
 * POST /api/telnet/execute
 * Execute a shell command on the MIB2 unit
 */
router.post('/execute', async (req, res) => {
  try {
    const { command } = executeSchema.parse(req.body);

    // Get the first available connection (in production, use session management)
    const connection = Array.from(connections.values())[0];

    if (!connection) {
      return res.status(400).json({
        success: false,
        error: 'Not connected to MIB2 unit',
      });
    }

    // Execute command
    const output = await connection.exec(command);

    res.json({
      success: true,
      output: output || '',
      command,
    });
  } catch (error) {
    console.error('Command execution error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Command execution failed',
    });
  }
});

/**
 * GET /api/telnet/status
 * Check connection status
 */
router.get('/status', (req, res) => {
  const isConnected = connections.size > 0;
  const sessions = Array.from(connections.keys());

  res.json({
    connected: isConnected,
    sessions,
    count: connections.size,
  });
});

export default router;
