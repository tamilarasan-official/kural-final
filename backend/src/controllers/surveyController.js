const Survey = require('../models/Survey');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all surveys
// @route   GET /api/v1/surveys
// @access  Private
const getAllSurveys = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tamilTitle: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const surveys = await Survey.find(filter)
    .select('-responses')
    .sort({ formNumber: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Survey.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: surveys,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

// @desc    Get survey by ID
// @route   GET /api/v1/surveys/:id
// @access  Private
const getSurveyById = asyncHandler(async (req, res) => {
  const survey = await Survey.findById(req.params.id).select('-responses');

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: 'Survey not found'
    });
  }

  res.status(200).json({
    success: true,
    data: survey
  });
});

// @desc    Create new survey
// @route   POST /api/v1/surveys
// @access  Private
const createSurvey = asyncHandler(async (req, res) => {
  const {
    formNumber,
    title,
    tamilTitle,
    description,
    status,
    questions,
    activeElection,
    startDate,
    endDate,
    isPublished
  } = req.body;

  // Check if form number already exists
  const existingSurvey = await Survey.findOne({ formNumber });
  if (existingSurvey) {
    return res.status(400).json({
      success: false,
      message: 'Survey with this form number already exists'
    });
  }

  const survey = await Survey.create({
    formNumber,
    title: title || '',
    tamilTitle: tamilTitle || '',
    description: description || '',
    status: status || 'Active',
    questions: questions || [],
    activeElection: activeElection || '118 - Thondamuthur',
    startDate: startDate || new Date(),
    endDate,
    isPublished: isPublished || false,
    createdBy: req.user?.id || 'system'
  });

  res.status(201).json({
    success: true,
    data: survey.getPublicData(),
    message: 'Survey created successfully'
  });
});

// @desc    Update survey
// @route   PUT /api/v1/surveys/:id
// @access  Private
const updateSurvey = asyncHandler(async (req, res) => {
  const survey = await Survey.findById(req.params.id);

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: 'Survey not found'
    });
  }

  // Check if form number is being changed and if it already exists
  if (req.body.formNumber && req.body.formNumber !== survey.formNumber) {
    const existingSurvey = await Survey.findOne({ 
      formNumber: req.body.formNumber,
      _id: { $ne: req.params.id }
    });
    if (existingSurvey) {
      return res.status(400).json({
        success: false,
        message: 'Survey with this form number already exists'
      });
    }
  }

  const updatedSurvey = await Survey.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-responses');

  res.status(200).json({
    success: true,
    data: updatedSurvey,
    message: 'Survey updated successfully'
  });
});

// @desc    Update survey status
// @route   PUT /api/v1/surveys/:id/status
// @access  Private
const updateSurveyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be either Active or Inactive'
    });
  }

  const survey = await Survey.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).select('-responses');

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: 'Survey not found'
    });
  }

  res.status(200).json({
    success: true,
    data: survey,
    message: `Survey status updated to ${status}`
  });
});

// @desc    Delete survey
// @route   DELETE /api/v1/surveys/:id
// @access  Private
const deleteSurvey = asyncHandler(async (req, res) => {
  const survey = await Survey.findById(req.params.id);

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: 'Survey not found'
    });
  }

  await Survey.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Survey deleted successfully'
  });
});

// @desc    Get survey statistics
// @route   GET /api/v1/surveys/stats
// @access  Private
const getSurveyStats = asyncHandler(async (req, res) => {
  const stats = await Survey.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
        },
        inactive: {
          $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
        },
        published: {
          $sum: { $cond: ['$isPublished', 1, 0] }
        },
        totalResponses: {
          $sum: { $size: '$responses' }
        }
      }
    }
  ]);

  const result = stats[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    published: 0,
    totalResponses: 0
  };

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Submit survey response
// @route   POST /api/v1/surveys/:id/responses
// @access  Private
const submitSurveyResponse = asyncHandler(async (req, res) => {
  const { respondentId, respondentName, responses } = req.body;

  const survey = await Survey.findById(req.params.id);

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: 'Survey not found'
    });
  }

  if (survey.status !== 'Active') {
    return res.status(400).json({
      success: false,
      message: 'Survey is not active'
    });
  }

  // Check if respondent already submitted
  const existingResponse = survey.responses.find(r => r.respondentId === respondentId);
  if (existingResponse) {
    return res.status(400).json({
      success: false,
      message: 'Response already submitted for this survey'
    });
  }

  survey.responses.push({
    respondentId,
    respondentName,
    responses,
    submittedAt: new Date()
  });

  await survey.save();

  res.status(201).json({
    success: true,
    message: 'Survey response submitted successfully'
  });
});

module.exports = {
  getAllSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  updateSurveyStatus,
  deleteSurvey,
  getSurveyStats,
  submitSurveyResponse
};
