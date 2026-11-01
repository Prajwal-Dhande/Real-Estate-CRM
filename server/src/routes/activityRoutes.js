const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, activityController.createActivity);
router.get('/lead/:leadId', authenticate, activityController.getActivitiesByLead);
router.patch('/:id/complete', authenticate, activityController.completeFollowUp);

module.exports = router;
