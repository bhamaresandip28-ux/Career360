/**
 * Career360 — Student Controller (Phase 2)
 * Thin HTTP adapter — delegates to student.service.js
 */

const studentService = require('../services/student.service');
const auditService   = require('../services/audit.service');
const { sendSuccess } = require('../utils/apiResponse');

// ─── Profile ──────────────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
  try {
    const data = await studentService.getProfile(req.user.id);
    sendSuccess(res, data, 'Profile fetched successfully.');
  } catch (e) { next(e); }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await studentService.upsertProfile(req.user.id, req.body);
    auditService.recordAudit({
      userId: req.user.id,
      action: 'PROFILE_UPDATE',
      entityType: 'STUDENT_PROFILE',
      entityId: profile.id,
      details: { rollNumber: profile.rollNumber, departmentId: profile.departmentId },
      req,
    });
    sendSuccess(res, { profile }, 'Profile updated successfully.');
  } catch (e) { next(e); }
};

const getCompleteness = async (req, res, next) => {
  try {
    const completeness = await studentService.calculateCompleteness(req.user.id);
    sendSuccess(res, { completeness }, 'Profile completeness calculated.');
  } catch (e) { next(e); }
};

// ─── Departments & Batches ────────────────────────────────────────────────────
const getDepartments = async (req, res, next) => {
  try {
    const departments = await studentService.getDepartments();
    sendSuccess(res, { departments }, 'Departments fetched.');
  } catch (e) { next(e); }
};

const createDepartment = async (req, res, next) => {
  try {
    const department = await studentService.createDepartment(req.body);
    sendSuccess(res, { department }, 'Department created successfully.', 201);
  } catch (e) { next(e); }
};

const getBatches = async (req, res, next) => {
  try {
    const batches = await studentService.getBatchesByDepartment(req.params.departmentId);
    sendSuccess(res, { batches }, 'Batches fetched.');
  } catch (e) { next(e); }
};

// ─── Skills ──────────────────────────────────────────────────────────────────
const getSkills    = async (req, res, next) => {
  try { sendSuccess(res, { skills: await studentService.getSkills(req.user.id) }); } catch (e) { next(e); }
};
const createSkill  = async (req, res, next) => {
  try { sendSuccess(res, { skill: await studentService.createSkill(req.user.id, req.body) }, 'Skill added.', 201); } catch (e) { next(e); }
};
const updateSkill  = async (req, res, next) => {
  try { sendSuccess(res, { skill: await studentService.updateSkill(req.user.id, req.params.id, req.body) }, 'Skill updated.'); } catch (e) { next(e); }
};
const deleteSkill  = async (req, res, next) => {
  try { await studentService.deleteSkill(req.user.id, req.params.id); sendSuccess(res, null, 'Skill deleted.'); } catch (e) { next(e); }
};

// ─── Projects ─────────────────────────────────────────────────────────────────
const getProjects    = async (req, res, next) => {
  try { sendSuccess(res, { projects: await studentService.getProjects(req.user.id) }); } catch (e) { next(e); }
};
const createProject  = async (req, res, next) => {
  try { sendSuccess(res, { project: await studentService.createProject(req.user.id, req.body) }, 'Project added.', 201); } catch (e) { next(e); }
};
const updateProject  = async (req, res, next) => {
  try { sendSuccess(res, { project: await studentService.updateProject(req.user.id, req.params.id, req.body) }, 'Project updated.'); } catch (e) { next(e); }
};
const deleteProject  = async (req, res, next) => {
  try { await studentService.deleteProject(req.user.id, req.params.id); sendSuccess(res, null, 'Project deleted.'); } catch (e) { next(e); }
};

// ─── Certifications ───────────────────────────────────────────────────────────
const getCertifications   = async (req, res, next) => {
  try { sendSuccess(res, { certifications: await studentService.getCertifications(req.user.id) }); } catch (e) { next(e); }
};
const createCertification = async (req, res, next) => {
  try { sendSuccess(res, { certification: await studentService.createCertification(req.user.id, req.body) }, 'Certification added.', 201); } catch (e) { next(e); }
};
const updateCertification = async (req, res, next) => {
  try { sendSuccess(res, { certification: await studentService.updateCertification(req.user.id, req.params.id, req.body) }, 'Certification updated.'); } catch (e) { next(e); }
};
const deleteCertification = async (req, res, next) => {
  try { await studentService.deleteCertification(req.user.id, req.params.id); sendSuccess(res, null, 'Certification deleted.'); } catch (e) { next(e); }
};

// ─── Internships ──────────────────────────────────────────────────────────────
const getInternships   = async (req, res, next) => {
  try { sendSuccess(res, { internships: await studentService.getInternships(req.user.id) }); } catch (e) { next(e); }
};
const createInternship = async (req, res, next) => {
  try { sendSuccess(res, { internship: await studentService.createInternship(req.user.id, req.body) }, 'Internship added.', 201); } catch (e) { next(e); }
};
const updateInternship = async (req, res, next) => {
  try { sendSuccess(res, { internship: await studentService.updateInternship(req.user.id, req.params.id, req.body) }, 'Internship updated.'); } catch (e) { next(e); }
};
const deleteInternship = async (req, res, next) => {
  try { await studentService.deleteInternship(req.user.id, req.params.id); sendSuccess(res, null, 'Internship deleted.'); } catch (e) { next(e); }
};

// ─── Achievements ─────────────────────────────────────────────────────────────
const getAchievements   = async (req, res, next) => {
  try { sendSuccess(res, { achievements: await studentService.getAchievements(req.user.id) }); } catch (e) { next(e); }
};
const createAchievement = async (req, res, next) => {
  try { sendSuccess(res, { achievement: await studentService.createAchievement(req.user.id, req.body) }, 'Achievement added.', 201); } catch (e) { next(e); }
};
const updateAchievement = async (req, res, next) => {
  try { sendSuccess(res, { achievement: await studentService.updateAchievement(req.user.id, req.params.id, req.body) }, 'Achievement updated.'); } catch (e) { next(e); }
};
const deleteAchievement = async (req, res, next) => {
  try { await studentService.deleteAchievement(req.user.id, req.params.id); sendSuccess(res, null, 'Achievement deleted.'); } catch (e) { next(e); }
};

// ─── Links ────────────────────────────────────────────────────────────────────
const getLinks    = async (req, res, next) => {
  try { sendSuccess(res, { links: await studentService.getLinks(req.user.id) }); } catch (e) { next(e); }
};
const upsertLinks = async (req, res, next) => {
  try { sendSuccess(res, { links: await studentService.upsertLinks(req.user.id, req.body.links) }, 'Links saved.'); } catch (e) { next(e); }
};

// ─── Career Preferences ───────────────────────────────────────────────────────
const getCareerPreferences    = async (req, res, next) => {
  try { sendSuccess(res, { preferences: await studentService.getCareerPreferences(req.user.id) }); } catch (e) { next(e); }
};
const updateCareerPreferences = async (req, res, next) => {
  try { sendSuccess(res, { preferences: await studentService.upsertCareerPreferences(req.user.id, req.body) }, 'Career preferences saved.'); } catch (e) { next(e); }
};

const getRoster = async (req, res, next) => {
  try {
    const students = await studentService.getRoster(req.query);
    sendSuccess(res, { students }, 'Student roster fetched.');
  } catch (e) { next(e); }
};

module.exports = {
  getProfile, updateProfile, getCompleteness,
  getDepartments, createDepartment, getBatches, getRoster,
  getSkills, createSkill, updateSkill, deleteSkill,
  getProjects, createProject, updateProject, deleteProject,
  getCertifications, createCertification, updateCertification, deleteCertification,
  getInternships, createInternship, updateInternship, deleteInternship,
  getAchievements, createAchievement, updateAchievement, deleteAchievement,
  getLinks, upsertLinks,
  getCareerPreferences, updateCareerPreferences,
};
