/**
 * Network API Routes
 * 
 * Provides network scanning and host checking capabilities
 */

import { Router } from 'express';
import { z } from 'zod';
import net from 'net';

const router = Router();

// Validation schemas
const checkHostSchema = z.object({
  host: z.string().min(7).max(15),
  port: z.number().int().min(1).max(65535),
});

/**
 * POST /api/network/check
 * Check if a host has a specific port open
 */
router.post('/check', async (req, res) => {
  try {
    const { host, port } = checkHostSchema.parse(req.body);

    const result = await checkPort(host, port, 2000);

    res.json({
      responding: result.open,
      responseTime: result.responseTime,
      deviceInfo: result.open ? 'Telnet service detected' : undefined,
    });
  } catch (error) {
    console.error('Host check error:', error);
    res.status(500).json({
      responding: false,
      error: error instanceof Error ? error.message : 'Check failed',
    });
  }
});

/**
 * Check if a port is open on a host
 */
function checkPort(
  host: string,
  port: number,
  timeout: number = 2000
): Promise<{ open: boolean; responseTime: number }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      socket.destroy();
      resolve({ open: true, responseTime });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ open: false, responseTime: timeout });
    });

    socket.on('error', () => {
      socket.destroy();
      resolve({ open: false, responseTime: Date.now() - startTime });
    });

    socket.connect(port, host);
  });
}

export default router;
