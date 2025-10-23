const express = require('express');
const { listAge60AboveVoters } = require('../controllers/age60AboveController');

const router = express.Router();

router.route('/').get(listAge60AboveVoters);

module.exports = router;