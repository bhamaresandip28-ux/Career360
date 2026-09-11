/**
 * Health routes
 * GET /api/v1/health
 */

const express = require('express');
const { getHealth } = require('../controllers/health.controller');

const router = express.Router();

router.get('/', getHealth);

module.exports = router;
