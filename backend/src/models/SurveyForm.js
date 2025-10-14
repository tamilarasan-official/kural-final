const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
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
    enum: ['text', 'single_choice', 'multiple_choice', 'rating', 'dropdown'],
    required: true
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
    required: true
  },
  validation: {
    minLength: Number,
    maxLength: Number,
    pattern: String
  }
});

const surveyFormSchema = new mongoose.Schema({
  formId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  tamilTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: 'Please fill out the form below. Fields marked with * are required.'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Active'
  },
  questions: [questionSchema],
  activeElection: {
    type: String,
    default: '118 - Thondamuthur'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responseCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better performance
// formId index is automatically created by unique: true
surveyFormSchema.index({ status: 1 });
surveyFormSchema.index({ activeElection: 1 });

// Virtual for public data (exclude sensitive fields)
surveyFormSchema.virtual('publicData').get(function() {
  const { __v, ...publicData } = this.toObject();
  return publicData;
});

module.exports = mongoose.model('SurveyForm', surveyFormSchema);
