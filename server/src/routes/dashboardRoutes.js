const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/metrics', authenticate, dashboardController.getDashboardMetrics);
router.get('/marketing-roi', authenticate, dashboardController.getMarketingRoiMetrics);

module.exports = router;

