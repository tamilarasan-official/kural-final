const mongoose = require('mongoose');

const TransgenderVoterSchema = new mongoose.Schema({
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
  s: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, versionKey: false, collection: 'Transegender Voter' });

module.exports = mongoose.model('TransgenderVoter', TransgenderVoterSchema);


