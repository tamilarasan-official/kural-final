const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  sr: Number,
  Name: String,
  Relation: String,
  'Father Name': String,  // Note: actual field has space, not underscore
  Number: String,
  sex: String,
  makan: Number,
  Anubhag_number: Number,
  Anubhag_name: String,
  age: Number,
  vidhansabha: Number,
  bhag_no: Number,
  'Part Name': String     // Note: actual field has space, not underscore
}, {
  collection: 'votersdata' // Use the actual collection name
});

module.exports = mongoose.model('Voter', voterSchema);