/**
 * Placement Insights Routes
 * Historical analytics and student benchmark comparison endpoints.
 */

const express = require('express');
const router = express.Router();
const placementInsightsController = require('../controllers/placementInsights.controller');
const authenticate = require('../middleware/authenticate');

// Public or student-accessible historical insights
router.get('/overview', placementInsightsController.getOverview);
router.get('/companies', placementInsightsController.getCompanyPlacements);
router.get('/skills', placementInsightsController.getPlacedSkills);
router.get('/skill-to-company', placementInsightsController.getSkillCompanyAnalysis);
router.get('/trends', placementInsightsController.getTrends);

// Student-specific profile benchmark against historical placements
router.get('/compare', authenticate, placementInsightsController.compareProfile);

module.exports = router;
