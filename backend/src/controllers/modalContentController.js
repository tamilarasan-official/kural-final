const { asyncHandler } = require('../utils/asyncHandler');
const ModalContent = require('../models/ModalContent');

// Get modal content by type
const getModalContent = asyncHandler(async (req, res) => {
  const { modalType } = req.params;

  const modalContent = await ModalContent.findOne({ 
    modalType: modalType.toLowerCase(),
    isActive: true 
  });

  if (!modalContent) {
    return res.status(404).json({
      success: false,
      message: 'Modal content not found'
    });
  }

  res.status(200).json({
    success: true,
    data: modalContent
  });
});

// Get all modal content
const getAllModalContent = asyncHandler(async (req, res) => {
  const modalContents = await ModalContent.find({ isActive: true }).sort({ modalType: 1 });

  res.status(200).json({
    success: true,
    data: modalContents
  });
});

// Create or update modal content
const createOrUpdateModalContent = asyncHandler(async (req, res) => {
  const { modalType, title, content } = req.body;

  const modalContent = await ModalContent.findOneAndUpdate(
    { modalType: modalType.toLowerCase() },
    {
      modalType: modalType.toLowerCase(),
      title,
      content,
      lastUpdated: new Date(),
      isActive: true
    },
    { 
      upsert: true, 
      new: true, 
      runValidators: true 
    }
  );

  res.status(200).json({
    success: true,
    message: 'Modal content updated successfully',
    data: modalContent
  });
});

// Delete modal content (soft delete)
const deleteModalContent = asyncHandler(async (req, res) => {
  const { modalType } = req.params;

  const modalContent = await ModalContent.findOneAndUpdate(
    { modalType: modalType.toLowerCase() },
    { isActive: false },
    { new: true }
  );

  if (!modalContent) {
    return res.status(404).json({
      success: false,
      message: 'Modal content not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Modal content deleted successfully'
  });
});

module.exports = {
  getModalContent,
  getAllModalContent,
  createOrUpdateModalContent,
  deleteModalContent
};
