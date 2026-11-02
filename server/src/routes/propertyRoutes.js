const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

router.get('/', optionalAuthenticate, propertyController.getProperties);
router.post('/upload', optionalAuthenticate, propertyController.uploadDocument);
router.get('/blueprint/sample', propertyController.getSampleBlueprint);
router.get('/:id', optionalAuthenticate, propertyController.getPropertyById);
router.post('/', authenticate, propertyController.createProperty);
router.patch('/:id', authenticate, propertyController.updateProperty);
router.delete('/:id', authenticate, propertyController.deleteProperty);

module.exports = router;
