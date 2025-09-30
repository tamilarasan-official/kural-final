const express = require('express');
const router = express.Router();
const voterInfoController = require('../controllers/voterInfoController');

// Voter Info Routes
router.route('/:voterId')
  .get(voterInfoController.getVoterInfo)
  .post(voterInfoController.saveVoterInfo)
  .put(voterInfoController.saveVoterInfo)
  .delete(voterInfoController.deleteVoterInfo);

// Get all voter info (admin route)
router.route('/')
  .get(voterInfoController.getAllVoterInfo);

module.exports = router;
