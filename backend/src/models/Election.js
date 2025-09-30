const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  
  category: {
    type: String,
    required: true
  },
  electionType: {
    type: String,
    default: ''
  },
  electionBody: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'India'
  },
  state: {
    type: String,
    default: ''
  },
  electionDate: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  electionDescription: {
    type: String,
    default: ''
  },
  
  // Location Information
  pcName: {
    type: String,
    default: ''
  },
  acName: {
    type: String,
    default: ''
  },
  urbanName: {
    type: String,
    default: ''
  },
  ruralName: {
    type: String,
    default: ''
  },
  
  // Calendar of Events
  gazetteNotification: {
    type: String,
    default: ''
  },
  lastDateFillingNomination: {
    type: String,
    default: ''
  },
  scrutinyNomination: {
    type: String,
    default: ''
  },
  lastDateWithdrawalNomination: {
    type: String,
    default: ''
  },
  dateOfPoll: {
    type: String,
    default: ''
  },
  dateOfCounting: {
    type: String,
    default: ''
  },
  completionDeadline: {
    type: String,
    default: ''
  },
  
  // Booth Information
  totalBooths: {
    type: String,
    default: ''
  },
  totalAllBooths: {
    type: String,
    default: ''
  },
  pinkBooths: {
    type: String,
    default: ''
  },
  
  // Voter Information
  totalVoters: {
    type: String,
    default: ''
  },
  maleVoters: {
    type: String,
    default: ''
  },
  femaleVoters: {
    type: String,
    default: ''
  },
  transgenderVoters: {
    type: String,
    default: ''
  },
  
  // Remarks
  remarks: {
    type: String,
    default: ''
  },
  
  // Voter Details (keeping existing fields for backward compatibility)
  partName: {
    type: String,
    required: true
  },
  anubhagName: {
    type: String,
    required: true
  },
  anubhagNumber: {
    type: String,
    required: true
  },
  bhagNumber: {
    type: String,
    required: true
  },
  voterNumber: {
    type: String,
    required: true
  },
  voterName: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  relation: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  photo: {
    type: String, // URL or file path
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
electionSchema.index({ constituency: 1 });
electionSchema.index({ voterNumber: 1 });
electionSchema.index({ voterName: 1 });
electionSchema.index({ mobileNumber: 1 });

module.exports = mongoose.model('Election', electionSchema);
