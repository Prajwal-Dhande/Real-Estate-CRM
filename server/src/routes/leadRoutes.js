const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, leadController.getLeads);
router.get('/:id', authenticate, leadController.getLeadById);
router.post('/', authenticate, leadController.createLead);
router.patch('/:id/stage', authenticate, leadController.updateLeadStage);
router.patch('/:id/followup', authenticate, leadController.updateLeadFollowup);
router.patch('/:id', authenticate, leadController.updateLead);
router.delete('/:id', authenticate, leadController.deleteLead);

module.exports = router;

