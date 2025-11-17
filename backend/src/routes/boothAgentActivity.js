const express = require('express');
const router = express.Router();
const boothAgentActivityController = require('../controllers/boothAgentActivityController');
const { protect } = require('../middleware/auth');

router.post('/login', protect, boothAgentActivityController.login);
router.post('/logout', protect, boothAgentActivityController.logout);
router.post('/location', protect, boothAgentActivityController.updateLocation);
router.get('/', protect, boothAgentActivityController.getBoothAgentActivity);

module.exports = router;