/**
 * Health check controller
 */

const { sendSuccess } = require('../utils/apiResponse');
const { prisma } = require('../config/database');
const { env } = require('../config/env');

/**
 * GET /api/v1/health
 * Returns basic service health status.
 * Also performs a lightweight database ping when a DATABASE_URL is configured.
 */
const getHealth = async (req, res, next) => {
  try {
    const startTime = Date.now();

    let dbStatus = 'not_configured';
    let dbLatencyMs = null;

    // Only ping DB if a connection string is provided
    if (env.DATABASE_URL) {
      try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        dbLatencyMs = Date.now() - dbStart;
        dbStatus = 'connected';
      } catch {
        dbStatus = 'disconnected';
      }
    }

    return sendSuccess(res, {
      status:      'ok',
      service:     'Career360 API',
      version:     '0.1.0',
      phase:       'Phase 0 — Foundation',
      environment: env.NODE_ENV,
      uptime:      Math.floor(process.uptime()),
      timestamp:   new Date().toISOString(),
      latencyMs:   Date.now() - startTime,
      database: {
        status:    dbStatus,
        latencyMs: dbLatencyMs,
      },
    }, 'Service is healthy.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getHealth };
