/**
 * Career360 — Academic Routes (Phase 3)
 * Route mappings for student academic intelligence
 */

const router       = require('express').Router();
const ctrl         = require('../controllers/academic.controller');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const validate     = require('../middleware/validate');
const v            = require('../validators/academic.validator');

router.use(authenticate);

// ─── Reference Data (accessible to all authenticated roles) ───────────────────
router.get('/subjects', ctrl.getSubjects);
router.post('/subjects', authorize('ADMIN', 'FACULTY'), validate(v.createSubjectSchema), ctrl.createSubject);

// ─── Student Academic Management ──────────────────────────────────────────────
router.use(authorize('STUDENT'));

// Summary & Computed Insights
router.get('/summary', ctrl.getAcademicSummary);

// Semesters
router.get('/semesters',     ctrl.getSemesters);
router.post('/semesters',    validate(v.createSemesterSchema), ctrl.upsertSemester);
router.get('/semesters/:id', ctrl.getSemesterDetails);
router.delete('/semesters/:id', ctrl.deleteSemester);

// Subject Grade & Attendance Records
router.post('/records',      validate(v.createSubjectRecordSchema), ctrl.upsertSubjectRecord);
router.put('/records/:id',   validate(v.updateSubjectRecordSchema), ctrl.upsertSubjectRecord);
router.delete('/records/:id', ctrl.deleteSubjectRecord);

module.exports = router;
