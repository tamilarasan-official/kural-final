const Election = require('../models/Election');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all elections
// @route   GET /api/v1/elections
// @access  Private
const getAllElections = asyncHandler(async (req, res) => {
  const elections = await Election.find({ isActive: true })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: elections.length,
    data: elections
  });
});

// @desc    Get single election
// @route   GET /api/v1/elections/:id
// @access  Private
const getElection = asyncHandler(async (req, res) => {
  const election = await Election.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!election) {
    return res.status(404).json({
      success: false,
      message: 'Election not found'
    });
  }

  res.status(200).json({
    success: true,
    data: election
  });
});

// @desc    Create new election
// @route   POST /api/v1/elections
// @access  Private
const createElection = asyncHandler(async (req, res) => {
  // Add user to req.body if available
  if (req.user && req.user.id) {
    req.body.createdBy = req.user.id;
  } else {
    // For testing without authentication, use a default user
    const defaultUser = await require('../models/User').findOne();
    if (defaultUser) {
      req.body.createdBy = defaultUser._id;
    }
  }

  const election = await Election.create(req.body);

  res.status(201).json({
    success: true,
    data: election
  });
});

// @desc    Update election
// @route   PUT /api/v1/elections/:id
// @access  Private
const updateElection = asyncHandler(async (req, res) => {
  let election = await Election.findById(req.params.id);

  if (!election) {
    return res.status(404).json({
      success: false,
      message: 'Election not found'
    });
  }

  // Make sure user owns election (skip if no authentication)
  if (req.user && election.createdBy.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'User not authorized to update this election'
    });
  }

  election = await Election.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: election
  });
});

// @desc    Delete election
// @route   DELETE /api/v1/elections/:id
// @access  Private
const deleteElection = asyncHandler(async (req, res) => {
  const election = await Election.findById(req.params.id);

  if (!election) {
    return res.status(404).json({
      success: false,
      message: 'Election not found'
    });
  }

  // Make sure user owns election (skip if no authentication)
  if (req.user && election.createdBy.toString() !== req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'User not authorized to delete this election'
    });
  }

  // Soft delete
  election.isActive = false;
  await election.save();

  res.status(200).json({
    success: true,
    message: 'Election deleted successfully'
  });
});

// @desc    Search elections
// @route   GET /api/v1/elections/search
// @access  Private
const searchElections = asyncHandler(async (req, res) => {
  const { q, constituency, category } = req.query;
  let query = { isActive: true };

  // Search by text query
  if (q) {
    query.$or = [
      { electionName: { $regex: q, $options: 'i' } },
      { constituency: { $regex: q, $options: 'i' } },
      { voterName: { $regex: q, $options: 'i' } },
      { voterNumber: { $regex: q, $options: 'i' } },
      { mobileNumber: { $regex: q, $options: 'i' } }
    ];
  }

  // Filter by constituency
  if (constituency) {
    query.constituency = { $regex: constituency, $options: 'i' };
  }

  // Filter by category
  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }

  const elections = await Election.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: elections.length,
    data: elections
  });
});

// @desc    Get elections by constituency
// @route   GET /api/v1/elections/constituency/:constituency
// @access  Private
const getElectionsByConstituency = asyncHandler(async (req, res) => {
  const elections = await Election.find({ 
    constituency: req.params.constituency,
    isActive: true 
  })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: elections.length,
    data: elections
  });
});

module.exports = {
  getAllElections,
  getElection,
  createElection,
  updateElection,
  deleteElection,
  searchElections,
  getElectionsByConstituency
};
