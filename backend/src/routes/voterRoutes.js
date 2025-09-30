const express = require('express');
const {
  searchVoters,
  getVoterById,
  getVotersByPart,
  getPartGenderStats,
  getPartNames
} = require('../controllers/voterController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - temporarily disabled for testing
// router.use(protect);

// Voter search routes
router.route('/search')
  .post(searchVoters);

router.route('/part-names')
  .get(getPartNames);

router.route('/by-part/:partNumber')
  .get(getVotersByPart);

router.route('/stats/:partNumber')
  .get(getPartGenderStats);

router.route('/:id')
  .get(getVoterById);

module.exports = router;