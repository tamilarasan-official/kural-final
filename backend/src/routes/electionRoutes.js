const express = require('express');
const {
  getAllElections,
  getElection,
  createElection,
  updateElection,
  deleteElection,
  searchElections,
  getElectionsByConstituency
} = require('../controllers/electionController');
// const { protect } = require('../middleware/auth');

const router = express.Router();

// Temporarily disable authentication for testing
// router.use(protect);

// Routes
router.route('/')
  .get(getAllElections)
  .post(createElection);

router.route('/search')
  .get(searchElections);

router.route('/constituency/:constituency')
  .get(getElectionsByConstituency);

router.route('/:id')
  .get(getElection)
  .put(updateElection)
  .delete(deleteElection);

module.exports = router;
