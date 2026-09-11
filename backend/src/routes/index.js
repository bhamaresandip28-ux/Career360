/**
 * API v1 — Route Index
 *
 * Phase 0: /health implemented
 * Phase 1: /auth and /users implemented
 * Phase 2: /students implemented
 */

const express  = require('express');
const AppError = require('../utils/AppError');

const healthRoutes  = require('./health.routes');
const authRoutes    = require('./auth.routes');
const usersRoutes   = require('./users.routes');
const studentRoutes   = require('./student.routes');
const academicRoutes  = require('./academic.routes');
const placementRoutes    = require('./placement.routes');
const analyticsRoutes    = require('./analytics.routes');
const careerRoutes       = require('./career.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes       = require('./report.routes');
const auditRoutes        = require('./audit.routes');
const placementInsightsRoutes = require('./placementInsights.routes');

const router = express.Router();

// ─── Implemented routes ───────────────────────────────────────────────────────
router.use('/health',        healthRoutes);
router.use('/auth',          authRoutes);
router.use('/users',         usersRoutes);
router.use('/students',      studentRoutes);
router.use('/academics',     academicRoutes);
router.use('/placement',     placementRoutes);
router.use('/analytics',     analyticsRoutes);
router.use('/career',        careerRoutes);
router.use('/insights',      placementInsightsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports',       reportRoutes);
router.use('/audit-logs',    auditRoutes);

// ─── Future routes (Coming Soon) — placeholders ──────────────────────────────
const notImplemented = (moduleName) => (req, res, next) => {
  next(new AppError(
    `${moduleName} API is not yet implemented. Coming in a future phase.`,
    501,
    'NOT_IMPLEMENTED'
  ));
};

router.use('/ai', notImplemented('AI'));

module.exports = router;
