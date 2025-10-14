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
    type: String,
    required: true,
    trim: true
  },
  tamilTitle: {
    type: String,
    required: true,
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
    questionId: {
      type: String,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      required: true,
      enum: ['multiple_choice', 'single_choice', 'text', 'rating', 'yes_no']
    },
    options: [{
      optionId: String,
      optionText: String,
      optionValue: String
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activeElection: {
    type: String,
    required: true,
    default: '118 - Thondamuthur'
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
  timestamps: true
});

// Index for better query performance
// formNumber index is automatically created by unique: true
surveySchema.index({ status: 1 });
surveySchema.index({ activeElection: 1 });
surveySchema.index({ createdBy: 1 });
surveySchema.index({ isPublished: 1 });

// Virtual for response count
surveySchema.virtual('responseCount').get(function() {
  return this.responses.length;
});

// Method to get public survey data (without responses)
surveySchema.methods.getPublicData = function() {
  const survey = this.toObject();
  delete survey.responses;
  return survey;
};

module.exports = mongoose.model('Survey', surveySchema);
