const express = require('express');
const {
    getAllBooths,
    getBoothById,
    createBooth,
    loginBooth,
    updateBooth,
    deleteBooth,
    getBoothStats,
    updateLoginStatus
} = require('../controllers/boothController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - temporarily disabled for testing
// router.use(protect);

// Booth routes
router.route('/')
    .get(getAllBooths)
    .post(createBooth);

// Public login for booths
router.post('/login', loginBooth);

router.route('/stats')
    .get(getBoothStats);

router.route('/:id')
    .get(getBoothById)
    .put(updateBooth)
    .delete(deleteBooth);

router.route('/:id/login-status')
    .put(updateLoginStatus);

module.exports = router;