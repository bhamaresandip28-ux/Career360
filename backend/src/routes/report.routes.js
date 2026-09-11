/**
 * Career360 — Reporting Routes (Phase 7)
 */

const router       = require('express').Router();
const ctrl         = require('../controllers/report.controller');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');

router.use(authenticate);

// Student verified CV and Official Transcript (accessible by student, faculty, coordinator, admin)
router.get('/student-cv',               ctrl.getStudentCV);
router.get('/student-cv/:studentId',    authorize('FACULTY', 'PLACEMENT_COORDINATOR', 'ADMIN'), ctrl.getStudentCV);

router.get('/transcript',               ctrl.getAcademicTranscript);
router.get('/transcript/:studentId',    authorize('FACULTY', 'PLACEMENT_COORDINATOR', 'ADMIN'), ctrl.getAcademicTranscript);

// Coordinator & Admin placement overview
router.get('/placement-summary',        authorize('PLACEMENT_COORDINATOR', 'ADMIN'), ctrl.getPlacementSummary);

// CSV Export
router.get('/export-csv',               authorize('FACULTY', 'PLACEMENT_COORDINATOR', 'ADMIN'), ctrl.exportCSV);

module.exports = router;
