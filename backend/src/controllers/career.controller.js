/**
 * Career Intelligence & Preparation Controller
 */

const careerService = require('../services/career.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getTargetRoles = async (req, res, next) => {
  try {
    const roles = await careerService.getTargetRoles();
    sendSuccess(res, roles, 'Target roles fetched successfully.');
  } catch (e) { next(e); }
};

const getMyTargetRole = async (req, res, next) => {
  try {
    const role = await careerService.getStudentTargetRole(req.user.id);
    sendSuccess(res, role, 'Current target role fetched.');
  } catch (e) { next(e); }
};

const setTargetRole = async (req, res, next) => {
  try {
    const { targetRoleId } = req.body;
    const role = await careerService.setStudentTargetRole(req.user.id, targetRoleId);
    sendSuccess(res, role, 'Target role updated successfully.');
  } catch (e) { next(e); }
};

const getReadiness = async (req, res, next) => {
  try {
    const studentId = (['FACULTY', 'PLACEMENT_COORDINATOR', 'ADMIN'].includes(req.user.role) && req.query.studentId)
      ? req.query.studentId
      : req.user.id;

    const targetRoleId = req.query.targetRoleId || null;
    const readiness = await careerService.computeReadinessScore(studentId, targetRoleId);
    sendSuccess(res, readiness, 'Readiness score computed successfully.');
  } catch (e) { next(e); }
};

const getSkillGap = async (req, res, next) => {
  try {
    const studentId = (['FACULTY', 'PLACEMENT_COORDINATOR', 'ADMIN'].includes(req.user.role) && req.query.studentId)
      ? req.query.studentId
      : req.user.id;

    const targetRoleId = req.query.targetRoleId || null;
    const gapAnalysis = await careerService.analyzeSkillGap(studentId, targetRoleId);
    sendSuccess(res, gapAnalysis, 'Skill gap analysis generated.');
  } catch (e) { next(e); }
};

const getRoadmap = async (req, res, next) => {
  try {
    const roadmap = await careerService.getStudentRoadmap(req.user.id);
    sendSuccess(res, roadmap, 'Career roadmap fetched.');
  } catch (e) { next(e); }
};

const createRoadmapItem = async (req, res, next) => {
  try {
    const item = await careerService.createRoadmapItem(req.user.id, req.body);
    sendCreated(res, item, 'Roadmap milestone added.');
  } catch (e) { next(e); }
};

const updateRoadmapItem = async (req, res, next) => {
  try {
    const item = await careerService.updateRoadmapItem(req.user.id, req.params.id, req.body);
    sendSuccess(res, item, 'Roadmap milestone updated.');
  } catch (e) { next(e); }
};

const deleteRoadmapItem = async (req, res, next) => {
  try {
    await careerService.deleteRoadmapItem(req.user.id, req.params.id);
    sendSuccess(res, null, 'Roadmap milestone removed.');
  } catch (e) { next(e); }
};

const getPreparation = async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;
    const catalog = await careerService.getPreparationCatalog(req.user.id, { category, difficulty });
    sendSuccess(res, catalog, 'Preparation catalog fetched.');
  } catch (e) { next(e); }
};

const updatePreparationProgress = async (req, res, next) => {
  try {
    const progress = await careerService.updatePrepProgress(req.user.id, req.params.id, req.body);
    sendSuccess(res, progress, 'Preparation progress saved.');
  } catch (e) { next(e); }
};

module.exports = {
  getTargetRoles,
  getMyTargetRole,
  setTargetRole,
  getReadiness,
  getSkillGap,
  getRoadmap,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  getPreparation,
  updatePreparationProgress,
};
