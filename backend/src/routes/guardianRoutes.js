const express = require('express');
const { listGuardianVoters } = require('../controllers/guardianController');

const router = express.Router();

router.route('/')
  .get(listGuardianVoters);

module.exports = router;
