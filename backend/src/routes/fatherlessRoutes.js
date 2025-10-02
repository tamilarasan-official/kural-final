const express = require('express');
const { listFatherlessVoters } = require('../controllers/fatherlessController');
// const { protect } = require('../middleware/auth'); // Uncomment if authentication is needed

const router = express.Router();

// router.use(protect); // Apply protection if needed

router.route('/')
  .get(listFatherlessVoters);

module.exports = router;
