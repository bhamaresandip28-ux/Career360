/**
 * Career360 — Audit Log Routes (Phase 7)
 */

const router       = require('express').Router();
const ctrl         = require('../controllers/audit.controller');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', ctrl.getAuditLogs);

module.exports = router;
