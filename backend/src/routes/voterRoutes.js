const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voterController');

router.get('/voters', voterController.getVoters);
router.get('/search', voterController.searchVoters);

module.exports = router;