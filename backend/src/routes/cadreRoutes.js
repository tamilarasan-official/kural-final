const express = require('express');
const {
  getAllCadres,
  getCadreById,
  createCadre,
  updateCadre,
  deleteCadre,
  getCadreStats,
  updateLoginStatus
} = require('../controllers/cadreController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - temporarily disabled for testing
// router.use(protect);

// Cadre routes
router.route('/')
  .get(getAllCadres)
  .post(createCadre);

router.route('/stats')
  .get(getCadreStats);

router.route('/:id')
  .get(getCadreById)
  .put(updateCadre)
  .delete(deleteCadre);

router.route('/:id/login-status')
  .put(updateLoginStatus);

module.exports = router;
