/**
 * Career360 — Placement Routes (Phase 4)
 * Route mappings for companies, placement drives, applications, and selection rounds
 */

const router       = require('express').Router();
const ctrl         = require('../controllers/placement.controller');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const validate     = require('../middleware/validate');
const v            = require('../validators/placement.validator');

router.use(authenticate);

// ─── Companies & Jobs (Viewable by all, manageable by Coordinator/Admin) ───────
router.get ('/companies',     ctrl.getCompanies);
router.get ('/companies/:id', ctrl.getCompanyDetails);
router.post('/companies',     authorize('ADMIN', 'PLACEMENT_COORDINATOR'), validate(v.createCompanySchema), ctrl.createCompany);

router.get ('/jobs',          ctrl.getJobs);
router.post('/jobs',          authorize('ADMIN', 'PLACEMENT_COORDINATOR'), validate(v.createJobSchema),     ctrl.createJob);

// ─── Placement Drives ─────────────────────────────────────────────────────────
router.get ('/drives',        ctrl.getDrives);
router.get ('/drives/:id',    ctrl.getDriveDetails);
router.post('/drives',        authorize('ADMIN', 'PLACEMENT_COORDINATOR'), validate(v.createDriveSchema),   ctrl.createDrive);

// ─── Student Applications ─────────────────────────────────────────────────────
router.post('/apply',            authorize('STUDENT'), validate(v.applyDriveSchema), ctrl.applyForDrive);
router.get ('/applications/my',  authorize('STUDENT'),                               ctrl.getMyApplications);

// ─── Coordinator / Admin Application & Round Management ──────────────────────
router.get  ('/applications',             authorize('ADMIN', 'PLACEMENT_COORDINATOR'),                                    ctrl.getAllApplications);
router.get  ('/drives/:id/applications', authorize('ADMIN', 'PLACEMENT_COORDINATOR'),                                    ctrl.getDriveApplications);
router.patch('/applications/:id/status', authorize('ADMIN', 'PLACEMENT_COORDINATOR'), validate(v.updateApplicationStatusSchema), ctrl.updateApplicationStatus);

router.post ('/rounds',                  authorize('ADMIN', 'PLACEMENT_COORDINATOR'), validate(v.scheduleRoundSchema),   ctrl.scheduleRound);
router.patch('/rounds/:id',              authorize('ADMIN', 'PLACEMENT_COORDINATOR'),                                    ctrl.updateRoundStatus);

// ─── Placement Outcomes ───────────────────────────────────────────────────────
router.get ('/outcomes', ctrl.getOutcomes);
router.post('/outcomes', authorize('ADMIN', 'PLACEMENT_COORDINATOR'), validate(v.recordOutcomeSchema), ctrl.recordOutcome);

module.exports = router;
