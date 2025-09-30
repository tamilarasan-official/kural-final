const express = require('express');
const {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  updateSurveyStatus,
  deleteSurvey,
  getSurveyStats,
  submitSurveyResponse
} = require('../controllers/surveyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - temporarily disabled for testing
// router.use(protect);

// Survey routes
router.route('/')
  .get(getAllSurveys)
  .post(createSurvey);

router.route('/stats')
  .get(getSurveyStats);

router.route('/:id')
  .get(getSurveyById)
  .put(updateSurvey)
  .delete(deleteSurvey);

router.route('/:id/status')
  .put(updateSurveyStatus);

router.route('/:id/responses')
  .post(submitSurveyResponse);

module.exports = router;
