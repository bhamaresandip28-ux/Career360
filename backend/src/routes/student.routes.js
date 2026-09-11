/**
 * Career360 — Student Routes (Phase 2)
 * All routes require authentication + STUDENT role
 * (Faculty/Admin read-only routes defined in their own route files)
 */

const router     = require('express').Router();
const ctrl       = require('../controllers/student.controller');
const authenticate = require('../middleware/authenticate');
const authorize    = require('../middleware/authorize');
const validate     = require('../middleware/validate');
const v            = require('../validators/student.validator');

// All routes require authentication
router.use(authenticate);

// ─── Public reference data (any authenticated user) ───────────────────────────
router.get ('/departments',                        ctrl.getDepartments);
router.post('/departments',                        authorize('ADMIN'), ctrl.createDepartment);
router.get ('/departments/:departmentId/batches',  ctrl.getBatches);

// ─── Staff routes (Faculty & Admin) ───────────────────────────────────────────
router.get('/roster', authorize('FACULTY', 'ADMIN'), ctrl.getRoster);

// ─── Student-only routes ──────────────────────────────────────────────────────
router.use(authorize('STUDENT'));

// Profile
router.get ('/profile',              ctrl.getProfile);
router.put ('/profile',              validate(v.updateProfileSchema),           ctrl.updateProfile);
router.get ('/profile/completeness', ctrl.getCompleteness);

// Skills
router.get   ('/skills',     ctrl.getSkills);
router.post  ('/skills',     validate(v.createSkillSchema),    ctrl.createSkill);
router.put   ('/skills/:id', validate(v.updateSkillSchema),    ctrl.updateSkill);
router.delete('/skills/:id',                                   ctrl.deleteSkill);

// Projects
router.get   ('/projects',     ctrl.getProjects);
router.post  ('/projects',     validate(v.createProjectSchema),    ctrl.createProject);
router.put   ('/projects/:id', validate(v.updateProjectSchema),    ctrl.updateProject);
router.delete('/projects/:id',                                     ctrl.deleteProject);

// Certifications
router.get   ('/certifications',     ctrl.getCertifications);
router.post  ('/certifications',     validate(v.createCertificationSchema), ctrl.createCertification);
router.put   ('/certifications/:id', validate(v.updateCertificationSchema), ctrl.updateCertification);
router.delete('/certifications/:id',                                        ctrl.deleteCertification);

// Internships
router.get   ('/internships',     ctrl.getInternships);
router.post  ('/internships',     validate(v.createInternshipSchema), ctrl.createInternship);
router.put   ('/internships/:id', validate(v.updateInternshipSchema), ctrl.updateInternship);
router.delete('/internships/:id',                                     ctrl.deleteInternship);

// Achievements
router.get   ('/achievements',     ctrl.getAchievements);
router.post  ('/achievements',     validate(v.createAchievementSchema), ctrl.createAchievement);
router.put   ('/achievements/:id', validate(v.updateAchievementSchema), ctrl.updateAchievement);
router.delete('/achievements/:id',                                      ctrl.deleteAchievement);

// Professional Links
router.get('/links', ctrl.getLinks);
router.put('/links', validate(v.upsertLinkSchema), ctrl.upsertLinks);

// Career Preferences
router.get('/career-preferences', ctrl.getCareerPreferences);
router.put('/career-preferences', validate(v.updateCareerPreferenceSchema), ctrl.updateCareerPreferences);

module.exports = router;
