const express = require('express');
const { listTransgenderVoters } = require('../controllers/transgenderController');
// const { protect } = require('../middleware/auth');

const router = express.Router();

// router.use(protect);
router.get('/', listTransgenderVoters);

module.exports = router;


