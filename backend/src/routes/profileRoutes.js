const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// GET /api/v1/profile/:userId - Get user profile
router.get('/:userId', profileController.getProfile);

// PUT /api/v1/profile/:userId - Update user profile
router.put('/:userId', profileController.updateProfile);

module.exports = router;
