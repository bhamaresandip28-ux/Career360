/**
 * Career360 — Career Intelligence & Preparation Routes (Phase 6)
 */

const router       = require('express').Router();
const ctrl         = require('../controllers/career.controller');
const authenticate = require('../middleware/authenticate');
const validate     = require('../middleware/validate');
const v            = require('../validators/career.validator');

router.use(authenticate);

// ─── Target Roles ─────────────────────────────────────────────────────────────
router.get ('/roles',       ctrl.getTargetRoles);
router.get ('/target-role', ctrl.getMyTargetRole);
router.post('/target-role', validate(v.setTargetRoleSchema), ctrl.setTargetRole);

// ─── Readiness & Skill Gap ───────────────────────────────────────────────────
router.get('/readiness', ctrl.getReadiness);
router.get('/skill-gap', ctrl.getSkillGap);

// ─── Career Roadmap Milestones ───────────────────────────────────────────────
router.get   ('/roadmap',     ctrl.getRoadmap);
router.post  ('/roadmap',     validate(v.createRoadmapItemSchema), ctrl.createRoadmapItem);
router.patch ('/roadmap/:id', validate(v.updateRoadmapItemSchema), ctrl.updateRoadmapItem);
router.delete('/roadmap/:id', ctrl.deleteRoadmapItem);

// ─── Preparation Hub ─────────────────────────────────────────────────────────
router.get  ('/preparation',     ctrl.getPreparation);
router.patch('/preparation/:id', validate(v.updatePrepProgressSchema), ctrl.updatePreparationProgress);

module.exports = router;
