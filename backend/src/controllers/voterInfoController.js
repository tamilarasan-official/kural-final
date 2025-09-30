const VoterInfo = require('../models/VoterInfo');
const { asyncHandler } = require('../utils/asyncHandler');

// Get voter info by voter ID
const getVoterInfo = asyncHandler(async (req, res) => {
  const { voterId } = req.params;

  if (!voterId) {
    return res.status(400).json({
      success: false,
      message: 'Voter ID is required'
    });
  }

  try {
    let voterInfo = await VoterInfo.findOne({ voterId });

    // If no voter info exists, create a default one
    if (!voterInfo) {
      voterInfo = new VoterInfo({
        voterId,
        religion: '',
        caste: '',
        subCaste: '',
        category: '',
        casteCategory: '',
        party: '',
        schemes: '',
        history: '',
        feedback: '',
        language: '',
        aadhar: '',
        pan: '',
        membership: '',
        remarks: '',
        dob: ''
      });
      await voterInfo.save();
    }

    res.status(200).json({
      success: true,
      data: voterInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching voter info',
      error: error.message
    });
  }
});

// Create or update voter info
const saveVoterInfo = asyncHandler(async (req, res) => {
  const { voterId } = req.params;
  const voterInfoData = req.body;

  if (!voterId) {
    return res.status(400).json({
      success: false,
      message: 'Voter ID is required'
    });
  }

  try {
    // Use upsert to create or update
    const voterInfo = await VoterInfo.findOneAndUpdate(
      { voterId },
      { 
        ...voterInfoData,
        voterId,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Voter info saved successfully',
      data: voterInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving voter info',
      error: error.message
    });
  }
});

// Delete voter info
const deleteVoterInfo = asyncHandler(async (req, res) => {
  const { voterId } = req.params;

  if (!voterId) {
    return res.status(400).json({
      success: false,
      message: 'Voter ID is required'
    });
  }

  try {
    const voterInfo = await VoterInfo.findOneAndDelete({ voterId });

    if (!voterInfo) {
      return res.status(404).json({
        success: false,
        message: 'Voter info not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Voter info deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting voter info',
      error: error.message
    });
  }
});

// Get all voter info (for admin purposes)
const getAllVoterInfo = asyncHandler(async (req, res) => {
  try {
    const voterInfoList = await VoterInfo.find()
      .sort({ updatedAt: -1 })
      .limit(100); // Limit to prevent large responses

    res.status(200).json({
      success: true,
      data: voterInfoList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching voter info list',
      error: error.message
    });
  }
});

module.exports = {
  getVoterInfo,
  saveVoterInfo,
  deleteVoterInfo,
  getAllVoterInfo
};
