/**
 * Career360 — Analytics Controller (Phase 5)
 */

const analyticsService = require('../services/analytics.service');
const { sendSuccess }   = require('../utils/apiResponse');

async function getOverview(req, res, next) {
  try {
    const stats = await analyticsService.getOverviewStats();
    return sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}

async function getPlacement(req, res, next) {
  try {
    const data = await analyticsService.getPlacementAnalytics();
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

async function getFaculty(req, res, next) {
  try {
    const { departmentId } = req.query;
    const data = await analyticsService.getFacultyAnalytics(departmentId);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

async function getDepartments(req, res, next) {
  try {
    const data = await analyticsService.getDepartmentAnalytics();
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview,
  getPlacement,
  getFaculty,
  getDepartments,
};
