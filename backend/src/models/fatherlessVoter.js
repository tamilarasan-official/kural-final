const mongoose = require('mongoose');

const FatherlessVoterSchema = new mongoose.Schema({
  Name: { type: String },
  Relation: { type: String },
  'Father Name': { type: String },
  Number: { type: String },
  sex: { type: String },
  Door_No: { type: mongoose.Schema.Types.Mixed },
  Anubhag_number: { type: Number },
  Anubhag_name: { type: String },
  age: { type: Number },
  vidhansabha: { type: Number },
  Part_no: { type: Number },
  'Part Name': { type: String },
  'Mobile No': { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false, collection: 'fatherless' });

module.exports = mongoose.model('FatherlessVoter', FatherlessVoterSchema);
