const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/metrics', authenticate, dashboardController.getDashboardMetrics);

module.exports = router;

