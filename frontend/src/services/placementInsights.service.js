/**
 * Career360 — Placement Insights Service
 * Frontend API calls for historical placement intelligence, trends, and student benchmarks
 */

import api from './api';

export const getHistoricalOverview = (params) =>
  api.get('/insights/overview', { params });

export const getCompanyPlacements = (params) =>
  api.get('/insights/companies', { params });

export const getPlacedSkills = (params) =>
  api.get('/insights/skills', { params });

export const getSkillCompanyAnalysis = () =>
  api.get('/insights/skill-to-company');

export const getPlacementTrends = () =>
  api.get('/insights/trends');

export const compareStudentWithHistorical = (targetRole) =>
  api.get('/insights/compare', { params: { targetRole } });

export default {
  getHistoricalOverview,
  getCompanyPlacements,
  getPlacedSkills,
  getSkillCompanyAnalysis,
  getPlacementTrends,
  compareStudentWithHistorical,
};
