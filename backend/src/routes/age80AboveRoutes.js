const express = require('express');
const { listAge80AboveVoters } = require('../controllers/age80AboveController');

const router = express.Router();

router.route('/')
  .get(listAge80AboveVoters);

module.exports = router;
