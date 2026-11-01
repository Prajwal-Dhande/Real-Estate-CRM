const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate } = require('../middleware/auth');

router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', authenticate, propertyController.createProperty);
router.patch('/:id', authenticate, propertyController.updateProperty);
router.delete('/:id', authenticate, propertyController.deleteProperty);

module.exports = router;

