const mongoose = require('mongoose');

const SoonVoterSchema = new mongoose.Schema({
  part: { type: Number, default: 0 },
  serialNo: { type: String },
  epicId: { type: String },
  voterName: { type: String },
  relationName: { type: String },
  relationType: { type: String },
  mobileNumber: { type: String },
  dateOfBirth: { type: Date },
  age: { type: Number },
  ne: { type: String },
  address: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'], lowercase: true },
  remarks: { type: String },
  // location removed per requirement
}, { timestamps: true, versionKey: false, collection: 'soon_voter' });



module.exports = mongoose.model('SoonVoter', SoonVoterSchema);


