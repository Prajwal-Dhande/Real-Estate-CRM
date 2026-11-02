const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Meta WhatsApp Business Cloud API verification & webhook
router.get('/whatsapp', webhookController.verifyWebhook);
router.post('/whatsapp', webhookController.handleIncomingWhatsApp);

// Direct simulation endpoint for interactive testing
router.post('/whatsapp/simulate', webhookController.simulateIncomingWhatsApp);

module.exports = router;

