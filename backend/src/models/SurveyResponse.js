const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    answer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    answerText: String, // For text answers
    selectedOptions: [String], // For multiple choice answers
    rating: Number, // For rating questions
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const surveyResponseSchema = new mongoose.Schema({
    formId: {
        type: String,
        required: true,
        ref: 'SurveyForm'
    },
    respondentId: {
        type: String,
        required: true
    },
    respondentName: {
        type: String,
        required: true
    },
    respondentMobile: {
        type: String,
        required: false
    },
    respondentAge: {
        type: Number
    },
    respondentCity: {
        type: String
    },
    respondentVoterId: {
        type: String
    },
    answers: [answerSchema],
    isComplete: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true,
    collection: 'surveyresponses'
});

// ===== PERFORMANCE INDEXES =====
// Compound indexes for common query patterns
surveyResponseSchema.index({ formId: 1, submittedAt: -1 });
surveyResponseSchema.index({ respondentId: 1, formId: 1 });
surveyResponseSchema.index({ formId: 1, isComplete: 1 });
surveyResponseSchema.index({ respondentVoterId: 1 });
surveyResponseSchema.index({ createdAt: -1 });

// Text index for searching responses
surveyResponseSchema.index({ respondentName: 'text', respondentVoterId: 'text' });

// Virtual for public data
surveyResponseSchema.virtual('publicData').get(function() {
    const { __v, ipAddress, userAgent, ...publicData } = this.toObject();
    return publicData;
});

// Static method for finding responses by form
surveyResponseSchema.statics.findByForm = function(formId, options = {}) {
    const { page = 1, limit = 50, complete = null } = options;
    const skip = (page - 1) * limit;

    const query = { formId };
    if (complete !== null) {
        query.isComplete = complete;
    }

    return this.find(query)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

// Static method for counting responses by form
surveyResponseSchema.statics.countByForm = function(formId) {
    return this.countDocuments({ formId }).exec();
};

// Static method for finding by respondent
surveyResponseSchema.statics.findByRespondent = function(respondentId) {
    return this.find({ respondentId })
        .sort({ submittedAt: -1 })
        .lean()
        .exec();
};

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);