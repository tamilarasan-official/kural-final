const Survey = require('../models/Survey');
const Voter = require('../models/Voter');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all surveys
// @route   GET /api/v1/surveys
// @access  Private
const getAllSurveys = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, status, search, aci_id } = req.query;
    const skip = (page - 1) * limit;
    const SurveyResponse = require('../models/SurveyResponse');

    // Build filter object
    const filter = {};
    const andConditions = [];

    // Filter by assignedACs if aci_id is provided (for booth agents)
    if (aci_id) {
        const aciIdNumber = Number(aci_id);
        andConditions.push({
            $or: [
                { assignedACs: aciIdNumber },
                { assignedACs: { $exists: false } }, // Include surveys without assignedACs (for all)
                { assignedACs: { $size: 0 } } // Include surveys with empty assignedACs array
            ]
        });
    }

    if (status && status !== 'all') {
        andConditions.push({ status: status });
    }

    if (search) {
        andConditions.push({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { tamilTitle: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        });
    }

    // Combine all conditions with $and if there are multiple conditions
    if (andConditions.length > 0) {
        filter.$and = andConditions;
    }

    console.log('📋 Survey filter:', JSON.stringify(filter, null, 2));
    const surveys = await Survey.find(filter)
        .select('-responses')
        .sort({ formNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    // Get response counts for each survey from surveyresponses collection
    const surveysWithCounts = await Promise.all(surveys.map(async(survey) => {
        const formId = survey.formId || survey.formid || survey._id.toString();
        const responseCount = await SurveyResponse.countDocuments({
            formId: formId,
            isComplete: true
        });
        return {
            ...survey,
            responseCount: responseCount
        };
    }));

    const total = await Survey.countDocuments(filter);

    res.status(200).json({
        success: true,
        data: surveysWithCounts,
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
const getSurveyById = asyncHandler(async(req, res) => {
    const { id } = req.params;
    let survey;

    console.log('\n📋 GET SURVEY BY ID:', id);

    // Check if the id looks like a MongoDB ObjectId (24 hex characters)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        survey = await Survey.findById(id).select('-responses').lean();
    } else {
        // Otherwise, treat it as a formId
        survey = await Survey.findOne({ formId: id }).select('-responses').lean();
    }

    if (!survey) {
        console.log('❌ Survey not found');
        return res.status(404).json({
            success: false,
            message: 'Survey not found'
        });
    }

    console.log('✅ Survey found:');
    console.log('   - _id:', survey._id);
    console.log('   - formId:', survey.formId);
    console.log('   - title:', survey.title);
    console.log('   - has questions field:', !!survey.questions);
    console.log('   - questions length:', survey.questions ? survey.questions.length : 0);
    console.log('   - has questionA field:', !!survey.questionA);
    console.log('   - questionA length:', survey.questionA ? survey.questionA.length : 0);
    if (survey.questionA && survey.questionA.length > 0) {
        console.log('   - First question from questionA:', JSON.stringify(survey.questionA[0], null, 2));
    }

    res.status(200).json({
        success: true,
        data: survey
    });
});

// @desc    Create new survey
// @route   POST /api/v1/surveys
// @access  Private
const createSurvey = asyncHandler(async(req, res) => {
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
        activeElection: activeElection || '119  - Thondamuthur',
        startDate: startDate || new Date(),
        endDate,
        isPublished: isPublished || false,
        createdBy: (req.user && req.user.id) || 'system'
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
const updateSurvey = asyncHandler(async(req, res) => {
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
        req.body, { new: true, runValidators: true }
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
const updateSurveyStatus = asyncHandler(async(req, res) => {
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status must be either Active or Inactive'
        });
    }

    const survey = await Survey.findByIdAndUpdate(
        req.params.id, { status }, { new: true }
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
const deleteSurvey = asyncHandler(async(req, res) => {
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
const getSurveyStats = asyncHandler(async(req, res) => {
    const stats = await Survey.aggregate([{
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
    }]);

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
const submitSurveyResponse = asyncHandler(async(req, res) => {
    const {
        respondentId,
        respondentName,
        respondentVoterId,
        respondentMobile,
        respondentAge,
        responses,
        answers // Frontend sends 'answers', backend expects 'responses'
    } = req.body;

    const SurveyResponse = require('../models/SurveyResponse');

    // Use answers if responses is not provided (frontend sends 'answers')
    const surveyAnswers = answers || responses || [];

    console.log('\n📝 SUBMIT SURVEY RESPONSE');
    console.log('Survey ID:', req.params.id);
    console.log('Respondent:', { respondentId, respondentName, respondentVoterId });
    console.log('Answers count:', surveyAnswers.length);

    // Get survey using lean() to get raw document
    const survey = await Survey.findById(req.params.id).lean();

    if (!survey) {
        console.log('❌ Survey not found');
        return res.status(404).json({
            success: false,
            message: 'Survey not found'
        });
    }

    console.log('Survey status:', survey.status);

    // Accept both 'Active' and 'active' status
    const surveyStatus = (survey.status || '').toLowerCase();
    if (surveyStatus !== 'active') {
        console.log('❌ Survey is not active, status:', survey.status);
        return res.status(400).json({
            success: false,
            message: 'Survey is not active'
        });
    }

    // Use formId or _id for the response
    const formId = survey.formId || survey.formid || req.params.id;

    // Check if respondent already submitted using voterId
    if (respondentVoterId) {
        const existingResponse = await SurveyResponse.findOne({
            formId: formId,
            respondentVoterId: respondentVoterId
        });

        if (existingResponse) {
            console.log('❌ Response already submitted by this voter');
            return res.status(400).json({
                success: false,
                message: 'Response already submitted for this survey'
            });
        }
    }

    // Create survey response in surveyresponses collection
    const surveyResponse = await SurveyResponse.create({
        formId: formId,
        respondentId: respondentId,
        respondentName: respondentName,
        respondentVoterId: respondentVoterId,
        respondentMobile: respondentMobile,
        respondentAge: respondentAge,
        answers: surveyAnswers.map(r => ({
            questionId: r.questionId,
            answer: r.answer,
            answerText: typeof r.answer === 'string' ? r.answer : null,
            selectedOptions: Array.isArray(r.answer) ? r.answer : [r.answer],
            submittedAt: new Date()
        })),
        isComplete: true,
        submittedAt: new Date()
    });

    console.log('✅ Survey response created:', surveyResponse._id);

    // Update voter's surveyed field to true
    if (respondentVoterId) {
        console.log('🔍 Updating voter surveyed status for voterID:', respondentVoterId);
        console.log('🔍 Query:', { voterID: respondentVoterId });
        const updateResult = await Voter.updateOne({ voterID: respondentVoterId }, { $set: { surveyed: true } });
        console.log('✅ Update result:', JSON.stringify(updateResult, null, 2));
        console.log('   - matchedCount:', updateResult.matchedCount);
        console.log('   - modifiedCount:', updateResult.modifiedCount);

        // Verify the update
        const voter = await Voter.findOne({ voterID: respondentVoterId });
        if (voter) {
            const voterName = (voter.name && voter.name.english) ? voter.name.english : voter.Name;
            console.log('✅ Voter found:', voterName);
            console.log('   - voterID:', voter.voterID);
            console.log('   - booth_id:', voter.booth_id);
            console.log('   - surveyed status:', voter.surveyed);
        } else {
            console.log('⚠️ Voter not found with voterID:', respondentVoterId);
            // Try to find what voterID values exist in database
            const sampleVoters = await Voter.find({}).limit(3).select('voterID name');
            console.log('   Sample voterIDs in database:', sampleVoters.map(v => v.voterID));
        }
    } else {
        console.log('⚠️ No respondentVoterId provided in request!');
    }

    res.status(201).json({
        success: true,
        message: 'Survey response submitted successfully',
        data: surveyResponse
    });
});

// @desc    Get survey progress by ACI
// @route   GET /api/v1/surveys/progress?aci_id={id}
// @access  Private
const getSurveyProgress = asyncHandler(async(req, res) => {
    const { aci_id } = req.query;
    const User = require('../models/User');

    if (!aci_id) {
        return res.status(400).json({
            success: false,
            message: 'aci_id is required'
        });
    }

    // Get all booth agents for this ACI
    const boothAgents = await User.find({
        aci_id: aci_id,
        role: 'Booth Agent',
        status: 'Active'
    }).select('name phoneNumber booth_id booth_number');

    // Get active surveys
    const surveys = await Survey.find({ status: 'Active' }).select('responses');

    // Calculate progress for each booth
    const boothProgress = boothAgents.map(agent => {
        // Count total responses from this agent across all surveys
        let completedSurveys = 0;
        let totalSurveys = surveys.length;

        surveys.forEach(survey => {
            const agentResponses = survey.responses.filter(
                r => r.respondentId === agent._id.toString() || r.respondentId === agent.booth_id
            );
            if (agentResponses.length > 0) {
                completedSurveys += agentResponses.length;
            }
        });

        const progressPercentage = totalSurveys > 0 ? Math.round((completedSurveys / totalSurveys) * 100) : 0;

        return {
            boothId: agent.booth_id || agent._id.toString(),
            boothNumber: agent.booth_number || `Booth ${agent.name}`,
            agentName: agent.name,
            agentPhone: agent.phoneNumber,
            completed: completedSurveys,
            total: totalSurveys,
            progressPercentage
        };
    });

    // Calculate overall progress and new metrics
    const totalCompleted = boothProgress.reduce((sum, booth) => sum + booth.completed, 0);
    const totalPossible = boothProgress.reduce((sum, booth) => sum + booth.total, 0);
    const overallProgress = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // Calculate average completed surveys per booth
    const avgCompleted = boothAgents.length > 0 ?
        Math.round(totalCompleted / boothAgents.length) :
        0;

    // Count fully completed booths (100% progress)
    const fullyCompletedBooths = boothProgress.filter(booth => booth.progressPercentage === 100).length;

    // Survey rate is the same as overall progress
    const surveyRate = overallProgress;

    res.status(200).json({
        success: true,
        data: {
            overallProgress,
            totalCompleted,
            totalBooths: boothAgents.length,
            totalSurveys: surveys.length,
            avgCompleted,
            fullyCompletedBooths,
            surveyRate,
            booths: boothProgress
        }
    });
});

// @desc    Get completed voters for a survey
// @route   GET /api/v1/surveys/:id/completed-voters
// @access  Private
const getCompletedVoters = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const SurveyResponse = require('../models/SurveyResponse');

    console.log('\n📊 GET COMPLETED VOTERS for survey:', id);

    // Get survey to find formId
    const survey = await Survey.findById(id).lean();

    if (!survey) {
        return res.status(404).json({
            success: false,
            message: 'Survey not found'
        });
    }

    const formId = survey.formId || survey.formid || id;
    console.log('Using formId:', formId);

    // Get all responses for this survey
    const responses = await SurveyResponse.find({
        formId: formId,
        isComplete: true
    }).select('respondentVoterId respondentName respondentId submittedAt');

    console.log('Found responses:', responses.length);

    // Extract voter IDs
    const completedVoterIds = responses.map(r => r.respondentVoterId || r.respondentId);

    res.status(200).json({
        success: true,
        data: {
            completedVoterIds: completedVoterIds,
            completedCount: responses.length,
            responses: responses
        }
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
    submitSurveyResponse,
    getSurveyProgress,
    getCompletedVoters
};