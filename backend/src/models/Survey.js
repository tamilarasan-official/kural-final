const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    formNumber: {
        type: Number,
        required: true,
        unique: true
    },
    formId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        english: {
            type: String,
            trim: true
        },
        tamil: {
            type: String,
            trim: true
        }
    },
    tamilTitle: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    questions: [{
        id: {
            type: String,
            required: false
        },
        questionId: {
            type: String,
            required: false
        },
        text: {
            type: String,
            required: false
        },
        questionText: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: true,
            enum: [
                'short-text', // Short Text
                'paragraph', // Paragraph
                'yes-no', // Yes / No
                'multiple-choice', // Multiple Choice
                'checkboxes', // Checkboxes
                'dropdown', // Dropdown
                'date', // Date
                'number', // Number
                'multiple_choice', // Legacy support
                'single_choice', // Legacy support
                'text', // Legacy support
                'rating', // Legacy support
                'yes_no' // Legacy support
            ]
        },
        questionType: {
            type: String,
            required: false
        },
        options: [{
            optionId: String,
            optionText: String,
            optionValue: String,
            text: String,
            value: String
        }],
        required: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    questionA: [{
        qid: String,
        question: {
            english: String,
            tamil: String
        },
        type: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activeElection: {
        type: String,
        required: true,
        default: '119  - Thondamuthur'
    },
    assignedACs: [{
        type: Number,
        required: false
    }],
    acid: {
        type: String,
        trim: true
    },
    boothid: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    responses: [{
        respondentId: {
            type: String,
            required: true
        },
        respondentName: {
            type: String,
            required: true
        },
        responses: [{
            questionId: String,
            answer: mongoose.Schema.Types.Mixed,
            answeredAt: {
                type: Date,
                default: Date.now
            }
        }],
        submittedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    collection: 'surveys'
});

// ===== PERFORMANCE INDEXES =====
// Single field indexes
surveySchema.index({ status: 1 });
surveySchema.index({ createdBy: 1 });
surveySchema.index({ isPublished: 1 });
surveySchema.index({ assignedACs: 1 });
surveySchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
surveySchema.index({ status: 1, isPublished: 1 });
surveySchema.index({ activeElection: 1, status: 1 });
surveySchema.index({ acid: 1, boothid: 1 });
surveySchema.index({ status: 1, createdAt: -1 });

// Virtual for response count
surveySchema.virtual('responseCount').get(function() {
    return this.responses ? this.responses.length : 0;
});

// Method to get public survey data (without responses)
surveySchema.methods.getPublicData = function() {
    const survey = this.toObject();
    delete survey.responses;
    return survey;
};

// Static method for finding active surveys
surveySchema.statics.findActive = function(filters = {}) {
    return this.find({...filters, status: 'Active', isPublished: true })
        .select('-responses')
        .lean()
        .exec();
};

// Static method for finding surveys by booth
surveySchema.statics.findByBooth = function(aciId, boothId, options = {}) {
    const { includeResponses = false } = options;

    let query = this.find({ acid: aciId, boothid: boothId, status: 'Active' });

    if (!includeResponses) {
        query = query.select('-responses');
    }

    return query.lean().exec();
};

module.exports = mongoose.model('Survey', surveySchema);