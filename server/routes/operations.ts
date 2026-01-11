/**
 * API Routes for Operation History Management
 */

import { Router } from 'express';
import { getDb } from '../db';
import { operationHistory } from '../../drizzle/schema.js';
import { desc, eq, and, gte, sql } from 'drizzle-orm';

const router = Router();

/**
 * Record a new operation
 */
router.post('/record', async (req, res) => {
  try {
    const {
      operationType,
      deviceVid,
      devicePid,
      deviceChipset,
      result,
      dryRun,
      executionTimeMs,
      errorMessage,
      backupId,
      metadata,
    } = req.body;

    if (!operationType || !deviceVid || !devicePid || !result) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const [newOperation] = await db.insert(operationHistory).values({
      operationType,
      deviceVid,
      devicePid,
      deviceChipset: deviceChipset || null,
      result,
      dryRun: dryRun ? 1 : 0,
      executionTimeMs: executionTimeMs || null,
      errorMessage: errorMessage || null,
      backupId: backupId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    res.json({ success: true, id: newOperation.insertId });
  } catch (error) {
    console.error('[Operations API] Error recording operation:', error);
    res.status(500).json({ error: 'Failed to record operation' });
  }
});

/**
 * Get operation statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const stats = await db
      .select({
        totalOperations: sql<number>`COUNT(*)`,
        successfulOperations: sql<number>`SUM(CASE WHEN result = 'success' THEN 1 ELSE 0 END)`,
        failedOperations: sql<number>`SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END)`,
        dryRunOperations: sql<number>`SUM(CASE WHEN dryRun = 1 THEN 1 ELSE 0 END)`,
        averageExecutionTime: sql<number>`AVG(executionTimeMs)`,
        spoofingCount: sql<number>`SUM(CASE WHEN operationType = 'spoofing' THEN 1 ELSE 0 END)`,
        recoveryCount: sql<number>`SUM(CASE WHEN operationType = 'recovery' THEN 1 ELSE 0 END)`,
        restoreCount: sql<number>`SUM(CASE WHEN operationType = 'restore' THEN 1 ELSE 0 END)`,
      })
      .from(operationHistory);

    const result = stats[0];

    res.json({
      totalOperations: Number(result.totalOperations) || 0,
      successfulOperations: Number(result.successfulOperations) || 0,
      failedOperations: Number(result.failedOperations) || 0,
      dryRunOperations: Number(result.dryRunOperations) || 0,
      averageExecutionTime: Math.round(Number(result.averageExecutionTime) || 0),
      operationsByType: {
        spoofing: Number(result.spoofingCount) || 0,
        recovery: Number(result.recoveryCount) || 0,
        restore: Number(result.restoreCount) || 0,
      },
    });
  } catch (error) {
    console.error('[Operations API] Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * Get recent operations
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const operations = await db
      .select()
      .from(operationHistory)
      .orderBy(desc(operationHistory.createdAt))
      .limit(limit);

    // Parse metadata JSON strings
    const parsedOperations = operations.map((op: any) => ({
      ...op,
      metadata: op.metadata ? JSON.parse(op.metadata) : null,
      dryRun: op.dryRun === 1,
    }));

    res.json(parsedOperations);
  } catch (error) {
    console.error('[Operations API] Error fetching recent operations:', error);
    res.status(500).json({ error: 'Failed to fetch recent operations' });
  }
});

/**
 * Get operations by type
 */
router.get('/by-type', async (req, res) => {
  try {
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!type || !['spoofing', 'recovery', 'restore'].includes(type)) {
      return res.status(400).json({ error: 'Invalid operation type' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const operations = await db
      .select()
      .from(operationHistory)
      .where(eq(operationHistory.operationType, type))
      .orderBy(desc(operationHistory.createdAt))
      .limit(limit);

    const parsedOperations = operations.map((op: any) => ({
      ...op,
      metadata: op.metadata ? JSON.parse(op.metadata) : null,
      dryRun: op.dryRun === 1,
    }));

    res.json(parsedOperations);
  } catch (error) {
    console.error('[Operations API] Error fetching operations by type:', error);
    res.status(500).json({ error: 'Failed to fetch operations by type' });
  }
});

/**
 * Get operations by device
 */
router.get('/by-device', async (req, res) => {
  try {
    const { vid, pid } = req.query;

    if (!vid || !pid) {
      return res.status(400).json({ error: 'Missing vid or pid' });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const operations = await db
      .select()
      .from(operationHistory)
      .where(
        and(
          eq(operationHistory.deviceVid, vid as string),
          eq(operationHistory.devicePid, pid as string)
        )
      )
      .orderBy(desc(operationHistory.createdAt));

    const parsedOperations = operations.map((op: any) => ({
      ...op,
      metadata: op.metadata ? JSON.parse(op.metadata) : null,
      dryRun: op.dryRun === 1,
    }));

    res.json(parsedOperations);
  } catch (error) {
    console.error('[Operations API] Error fetching operations by device:', error);
    res.status(500).json({ error: 'Failed to fetch operations by device' });
  }
});

/**
 * Clean old history
 */
router.post('/clean', async (req, res) => {
  try {
    const { daysToKeep } = req.body;

    if (!daysToKeep || daysToKeep < 1) {
      return res.status(400).json({ error: 'Invalid daysToKeep value' });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const result = await db
      .delete(operationHistory)
      .where(sql`${operationHistory.createdAt} < ${cutoffDate}`);

    res.json({ success: true, deletedCount: (result as any).rowsAffected || 0 });
  } catch (error) {
    console.error('[Operations API] Error cleaning old history:', error);
    res.status(500).json({ error: 'Failed to clean old history' });
  }
});

export default router;
