const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Voter Categories Routes
router.route('/voter-categories')
  .get(settingsController.getAllVoterCategories)
  .post(settingsController.createVoterCategory);

router.route('/voter-categories/:id')
  .get(settingsController.getVoterCategoryById)
  .put(settingsController.updateVoterCategory)
  .delete(settingsController.deleteVoterCategory);

// Voter Languages Routes
router.route('/voter-languages')
  .get(settingsController.getAllVoterLanguages)
  .post(settingsController.createVoterLanguage);

router.route('/voter-languages/:id')
  .get(settingsController.getVoterLanguageById)
  .put(settingsController.updateVoterLanguage)
  .delete(settingsController.deleteVoterLanguage);

// Schemes Routes
router.route('/schemes')
  .get(settingsController.getAllSchemes)
  .post(settingsController.createScheme);

router.route('/schemes/:id')
  .get(settingsController.getSchemeById)
  .put(settingsController.updateScheme)
  .delete(settingsController.deleteScheme);

// Feedback Routes
router.route('/feedback')
  .get(settingsController.getAllFeedback)
  .post(settingsController.createFeedback);

router.route('/feedback/:id')
  .get(settingsController.getFeedbackById)
  .put(settingsController.updateFeedback)
  .delete(settingsController.deleteFeedback);

// Parties Routes
router.route('/parties')
  .get(settingsController.getAllParties)
  .post(settingsController.createParty);

router.route('/parties/:id')
  .get(settingsController.getPartyById)
  .put(settingsController.updateParty)
  .delete(settingsController.deleteParty);

// Religions Routes
router.route('/religions')
  .get(settingsController.getAllReligions)
  .post(settingsController.createReligion);

router.route('/religions/:id')
  .get(settingsController.getReligionById)
  .put(settingsController.updateReligion)
  .delete(settingsController.deleteReligion);

// Caste Categories Routes
router.route('/caste-categories')
  .get(settingsController.getAllCasteCategories)
  .post(settingsController.createCasteCategory);

router.route('/caste-categories/:id')
  .get(settingsController.getCasteCategoryById)
  .put(settingsController.updateCasteCategory)
  .delete(settingsController.deleteCasteCategory);

// Castes Routes
router.route('/castes')
  .get(settingsController.getAllCastes)
  .post(settingsController.createCaste);

router.route('/castes/:id')
  .get(settingsController.getCasteById)
  .put(settingsController.updateCaste)
  .delete(settingsController.deleteCaste);

// Sub-Castes Routes
router.route('/sub-castes')
  .get(settingsController.getAllSubCastes)
  .post(settingsController.createSubCaste);

router.route('/sub-castes/:id')
  .get(settingsController.getSubCasteById)
  .put(settingsController.updateSubCaste)
  .delete(settingsController.deleteSubCaste);

// History Routes
router.route('/history')
  .get(settingsController.getAllHistory)
  .post(settingsController.createHistory);

router.route('/history/:id')
  .get(settingsController.getHistoryById)
  .put(settingsController.updateHistory)
  .delete(settingsController.deleteHistory);

module.exports = router;
