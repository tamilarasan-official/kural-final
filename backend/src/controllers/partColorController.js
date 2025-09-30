const PartColor = require('../models/partColor');
const Vulnerability = require('../models/vulnerability');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all part colors
// @route   GET /api/v1/part-colors
// @access  Private
const getPartColors = asyncHandler(async (req, res) => {
  const partColors = await PartColor.find()
    .populate('vulnerabilityId', 'name color')
    .sort({ partNumber: 1 });
  
  res.json({
    success: true,
    partColors
  });
});

// @desc    Get part color by part number
// @route   GET /api/v1/part-colors/:partNumber
// @access  Private
const getPartColorByPartNumber = asyncHandler(async (req, res) => {
  const partColor = await PartColor.findOne({ partNumber: parseInt(req.params.partNumber) })
    .populate('vulnerabilityId', 'name color');
  
  if (!partColor) {
    return res.status(404).json({
      success: false,
      error: 'Part color not found'
    });
  }
  
  res.json({
    success: true,
    partColor
  });
});

// @desc    Update part color
// @route   PUT /api/v1/part-colors/:partNumber
// @access  Private
const updatePartColor = asyncHandler(async (req, res) => {
  const { vulnerabilityId, color } = req.body;
  const partNumber = parseInt(req.params.partNumber);
  
  // Verify vulnerability exists
  const vulnerability = await Vulnerability.findById(vulnerabilityId);
  if (!vulnerability) {
    return res.status(400).json({
      success: false,
      error: 'Invalid vulnerability ID'
    });
  }
  
  const partColor = await PartColor.findOneAndUpdate(
    { partNumber },
    { 
      vulnerabilityId,
      color: color || vulnerability.color,
      updatedAt: new Date()
    },
    { 
      new: true, 
      upsert: true,
      runValidators: true 
    }
  ).populate('vulnerabilityId', 'name color');
  
  res.json({
    success: true,
    partColor
  });
});

// @desc    Get part colors summary
// @route   GET /api/v1/part-colors/summary
// @access  Private
const getPartColorsSummary = asyncHandler(async (req, res) => {
  const summary = await PartColor.aggregate([
    {
      $lookup: {
        from: 'vulnerabilities',
        localField: 'vulnerabilityId',
        foreignField: '_id',
        as: 'vulnerability'
      }
    },
    {
      $unwind: '$vulnerability'
    },
    {
      $group: {
        _id: '$vulnerabilityId',
        vulnerabilityName: { $first: '$vulnerability.name' },
        color: { $first: '$vulnerability.color' },
        count: { $sum: 1 },
        partNumbers: { $push: '$partNumber' }
      }
    },
    {
      $sort: { vulnerabilityName: 1 }
    }
  ]);
  
  res.json({
    success: true,
    summary
  });
});

module.exports = {
  getPartColors,
  getPartColorByPartNumber,
  updatePartColor,
  getPartColorsSummary
};
