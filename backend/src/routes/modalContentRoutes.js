const express = require('express');
const {
  getModalContent,
  getAllModalContent,
  createOrUpdateModalContent,
  deleteModalContent
} = require('../controllers/modalContentController');

const router = express.Router();

// Get all modal content
router.route('/').get(getAllModalContent);

// Get modal content by type
router.route('/:modalType').get(getModalContent);

// Create or update modal content
router.route('/').post(createOrUpdateModalContent);

// Delete modal content (soft delete)
router.route('/:modalType').delete(deleteModalContent);

module.exports = router;
