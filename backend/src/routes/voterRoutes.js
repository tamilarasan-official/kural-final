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

// Temporary debug endpoint: returns total voters and count for a given part
router.get('/debug/part/:partNumber', async (req, res) => {
  try {
    const Voter = require('../models/voter');
    const part = parseInt(req.params.partNumber);
    const total = await Voter.countDocuments({});
    const countUpper = await Voter.countDocuments({ Part_no: part });
    const countLower = await Voter.countDocuments({ part_no: part });
    const sample = await Voter.findOne({ $or: [ { Part_no: part }, { part_no: part } ] }).lean();
    res.json({ success: true, total, part, countUpper, countLower, sample });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;