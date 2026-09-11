/**
 * Career360 — Placement Insights Controller
 * Provides endpoints for historical placement intelligence, trends, company breakdown,
 * and student benchmark comparisons.
 */

const placementInsightsService = require('../services/placementInsights.service');
const { sendSuccess } = require('../utils/apiResponse');

const getOverview = async (req, res, next) => {
  try {
    const data = await placementInsightsService.getHistoricalOverview(req.query);
    sendSuccess(res, data, 'Historical placement overview retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const getCompanyPlacements = async (req, res, next) => {
  try {
    const data = await placementInsightsService.getCompanyWisePlacements(req.query);
    sendSuccess(res, data, 'Company-wise historical placement data retrieved.');
  } catch (err) {
    next(err);
  }
};

const getPlacedSkills = async (req, res, next) => {
  try {
    const data = await placementInsightsService.getSkillsOfPlacedStudents(req.query);
    sendSuccess(res, data, 'Skills distribution of placed students retrieved.');
  } catch (err) {
    next(err);
  }
};

const getSkillCompanyAnalysis = async (req, res, next) => {
  try {
    const data = await placementInsightsService.getSkillToCompanyAnalysis();
    sendSuccess(res, data, 'Skill-to-company mapping retrieved.');
  } catch (err) {
    next(err);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const data = await placementInsightsService.getPlacementTrends();
    sendSuccess(res, data, 'Historical placement trends retrieved.');
  } catch (err) {
    next(err);
  }
};

const compareProfile = async (req, res, next) => {
  try {
    const studentId = req.user?.id;
    const targetRole = req.query.targetRole || req.query.role || 'Software Development Engineer';
    const data = await placementInsightsService.compareStudentWithHistorical(studentId, targetRole);
    sendSuccess(res, data, 'Comparison with historical placements completed.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverview,
  getCompanyPlacements,
  getPlacedSkills,
  getSkillCompanyAnalysis,
  getTrends,
  compareProfile,
};
