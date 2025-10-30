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
    timestamps: true
});

// Index for better performance
surveyResponseSchema.index({ formId: 1 });
surveyResponseSchema.index({ respondentId: 1 });
surveyResponseSchema.index({ submittedAt: -1 });

// Virtual for public data
surveyResponseSchema.virtual('publicData').get(function() {
    const { __v, ipAddress, userAgent, ...publicData } = this.toObject();
    return publicData;
});

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);