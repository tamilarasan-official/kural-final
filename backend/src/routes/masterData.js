const express = require('express');
const router = express.Router();
const {
    getSections,
    getSectionById,
    submitResponse,
    getResponsesByVoter,
    getCompletionStatus,
} = require('../controllers/masterDataController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Section routes
router.get('/sections', getSections);
router.get('/sections/:id', getSectionById);

// Response routes
router.post('/responses', submitResponse);
router.get('/responses/:voterId', getResponsesByVoter);
router.get('/completion/:voterId', getCompletionStatus);

module.exports = router;