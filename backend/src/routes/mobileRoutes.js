const express = require('express');
const { listMobileVoters } = require('../controllers/mobileController');

const router = express.Router();

router.route('/')
  .get(listMobileVoters);

module.exports = router;
