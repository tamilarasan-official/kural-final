const SurveyForm = require('../models/SurveyForm');
const SurveyResponse = require('../models/SurveyResponse');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all survey forms
// @route   GET /api/v1/survey-forms
// @access  Private
const getAllSurveyForms = asyncHandler(async (req, res) => {
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

  const forms = await SurveyForm.find(filter)
    .select('-questions.validation')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SurveyForm.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: forms,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

// @desc    Get survey form by ID
// @route   GET /api/v1/survey-forms/:id
// @access  Private
const getSurveyFormById = asyncHandler(async (req, res) => {
  const form = await SurveyForm.findOne({ formId: req.params.id });

  if (!form) {
    return res.status(404).json({
      success: false,
      message: 'Survey form not found'
    });
  }

  res.status(200).json({
    success: true,
    data: form
  });
});

// @desc    Create new survey form
// @route   POST /api/v1/survey-forms
// @access  Private
const createSurveyForm = asyncHandler(async (req, res) => {
  const {
    formId,
    title,
    tamilTitle,
    description,
    instructions,
    status,
    questions,
    activeElection,
    startDate,
    endDate
  } = req.body;

  // Check if form ID already exists
  const existingForm = await SurveyForm.findOne({ formId });
  if (existingForm) {
    return res.status(400).json({
      success: false,
      message: 'Survey form with this ID already exists'
    });
  }

  const form = await SurveyForm.create({
    formId,
    title: title || '',
    tamilTitle: tamilTitle || '',
    description: description || '',
    instructions: instructions || 'Please fill out the form below. Fields marked with * are required.',
    status: status || 'Active',
    questions: questions || [],
    activeElection: activeElection || '118 - Thondamuthur',
    startDate: startDate || new Date(),
    endDate,
    createdBy: req.user?.id || new mongoose.Types.ObjectId()
  });

  res.status(201).json({
    success: true,
    data: form,
    message: 'Survey form created successfully'
  });
});

// @desc    Update survey form
// @route   PUT /api/v1/survey-forms/:id
// @access  Private
const updateSurveyForm = asyncHandler(async (req, res) => {
  const form = await SurveyForm.findOne({ formId: req.params.id });

  if (!form) {
    return res.status(404).json({
      success: false,
      message: 'Survey form not found'
    });
  }

  // Check if form ID is being changed and if it already exists
  if (req.body.formId && req.body.formId !== form.formId) {
    const existingForm = await SurveyForm.findOne({ 
      formId: req.body.formId,
      _id: { $ne: form._id }
    });
    if (existingForm) {
      return res.status(400).json({
        success: false,
        message: 'Survey form with this ID already exists'
      });
    }
  }

  const updatedForm = await SurveyForm.findOneAndUpdate(
    { formId: req.params.id },
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedForm,
    message: 'Survey form updated successfully'
  });
});

// @desc    Delete survey form
// @route   DELETE /api/v1/survey-forms/:id
// @access  Private
const deleteSurveyForm = asyncHandler(async (req, res) => {
  const form = await SurveyForm.findOne({ formId: req.params.id });

  if (!form) {
    return res.status(404).json({
      success: false,
      message: 'Survey form not found'
    });
  }

  // Also delete all responses for this form
  await SurveyResponse.deleteMany({ formId: req.params.id });
  await SurveyForm.findOneAndDelete({ formId: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Survey form and all responses deleted successfully'
  });
});

// @desc    Submit survey response
// @route   POST /api/v1/survey-forms/:id/responses
// @access  Private
const submitSurveyResponse = asyncHandler(async (req, res) => {
  const formId = req.params.id;
  const {
    respondentId,
    respondentName,
    respondentMobile,
    respondentAge,
    respondentCity,
    respondentVoterId,
    answers
  } = req.body;

  // Check if form exists and is active
  const form = await SurveyForm.findOne({ formId });
  if (!form) {
    return res.status(404).json({
      success: false,
      message: 'Survey form not found'
    });
  }

  if (form.status !== 'Active') {
    return res.status(400).json({
      success: false,
      message: 'Survey form is not active'
    });
  }

  // Check if respondent already submitted
  const existingResponse = await SurveyResponse.findOne({ 
    formId, 
    respondentId 
  });
  if (existingResponse) {
    return res.status(400).json({
      success: false,
      message: 'Response already submitted for this survey form'
    });
  }

  // Validate required questions
  const requiredQuestions = form.questions.filter(q => q.required);
  const answeredQuestionIds = answers.map(a => a.questionId);
  const missingRequired = requiredQuestions.filter(q => 
    !answeredQuestionIds.includes(q.questionId)
  );

  if (missingRequired.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Please answer all required questions: ${missingRequired.map(q => q.questionText).join(', ')}`
    });
  }

  const response = await SurveyResponse.create({
    formId,
    respondentId,
    respondentName,
    respondentMobile,
    respondentAge,
    respondentCity,
    respondentVoterId,
    answers,
    isComplete: true,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Update response count
  await SurveyForm.findOneAndUpdate(
    { formId },
    { $inc: { responseCount: 1 } }
  );

  res.status(201).json({
    success: true,
    data: response,
    message: 'Survey response submitted successfully'
  });
});

// @desc    Get survey responses
// @route   GET /api/v1/survey-forms/:id/responses
// @access  Private
const getSurveyResponses = asyncHandler(async (req, res) => {
  const formId = req.params.id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const responses = await SurveyResponse.find({ formId })
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SurveyResponse.countDocuments({ formId });

  res.status(200).json({
    success: true,
    data: responses,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
});

module.exports = {
  getAllSurveyForms,
  getSurveyFormById,
  createSurveyForm,
  updateSurveyForm,
  deleteSurveyForm,
  submitSurveyResponse,
  getSurveyResponses
};
