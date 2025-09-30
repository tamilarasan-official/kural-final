const mongoose = require('mongoose');

const voterInfoSchema = new mongoose.Schema({
  voterId: { 
    type: String, 
    required: true, 
    unique: true,
    ref: 'Voter'
  },
  // Basic Information
  religion: { type: String, default: '' },
  caste: { type: String, default: '' },
  subCaste: { type: String, default: '' },
  category: { type: String, default: '' },
  casteCategory: { type: String, default: '' },
  party: { type: String, default: '' },
  schemes: { type: String, default: '' },
  history: { type: String, default: '' },
  feedback: { type: String, default: '' },
  language: { type: String, default: '' },
  
  // Additional Information
  aadhar: { type: String, default: '' },
  pan: { type: String, default: '' },
  membership: { type: String, default: '' },
  remarks: { type: String, default: '' },
  dob: { type: String, default: '' },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
voterInfoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('VoterInfo', voterInfoSchema);
