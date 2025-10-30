const express = require('express');
const {
    getAllSurveyForms,
    getSurveyFormById,
    createSurveyForm,
    updateSurveyForm,
    deleteSurveyForm,
    submitSurveyResponse,
    getSurveyResponses,
    getCompletedVoters
} = require('../controllers/surveyFormController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected - temporarily disabled for testing
// router.use(protect);

// Survey form routes
router.route('/')
    .get(getAllSurveyForms)
    .post(createSurveyForm);

router.route('/:id')
    .get(getSurveyFormById)
    .put(updateSurveyForm)
    .delete(deleteSurveyForm);

router.route('/:id/responses')
    .post(submitSurveyResponse)
    .get(getSurveyResponses);

router.route('/:id/completed-voters')
    .get(getCompletedVoters);

module.exports = router;