const express = require('express');
const {
    getAllVoterFields,
    getVoterFieldByName,
    createVoterField,
    updateVoterField,
    deleteVoterField,
    toggleVoterFieldVisibility
} = require('../controllers/voterFieldController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route for mobile app to get visible fields
router.get('/', getAllVoterFields);
router.get('/:name', getVoterFieldByName);

// Protected admin routes
router.use(protect); // All routes below require authentication

router.post('/', createVoterField);
router.put('/:name', updateVoterField);
router.delete('/:name', deleteVoterField);
router.put('/:name/visibility', toggleVoterFieldVisibility);

module.exports = router;