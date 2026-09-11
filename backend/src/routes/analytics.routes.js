/**
 * Career360 — Analytics Routes (Phase 5)
 */

const router       = require('express').Router();
const ctrl         = require('../controllers/analytics.controller');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');

router.use(authenticate);

// Platform Overview (Admin, Coordinator, Faculty)
router.get('/overview', ctrl.getOverview);

// Deep Placement Analytics (Placement Coordinator & Admin)
router.get('/placement', authorize('ADMIN', 'PLACEMENT_COORDINATOR'), ctrl.getPlacement);

// Faculty Scholastic & Early Warning Monitoring (Faculty & Admin)
router.get('/faculty', authorize('ADMIN', 'FACULTY'), ctrl.getFaculty);

// Department Benchmarks (All authenticated staff)
router.get('/departments', ctrl.getDepartments);

module.exports = router;
