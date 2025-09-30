const express = require('express');
const {
  getPartColors,
  getPartColorByPartNumber,
  updatePartColor,
  getPartColorsSummary
} = require('../controllers/partColorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - temporarily disabled for testing
// router.use(protect);

router.route('/')
  .get(getPartColors);

router.route('/summary')
  .get(getPartColorsSummary);

router.route('/:partNumber')
  .get(getPartColorByPartNumber)
  .put(updatePartColor);

module.exports = router;
