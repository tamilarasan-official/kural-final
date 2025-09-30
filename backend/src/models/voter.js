const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  sr: Number,
  Name: String,
  Relation: String,
  'Father Name': String,
  Number: String,
  sex: String,
  Door_No: Number,
  Anubhag_number: Number,
  Anubhag_name: String,
  age: Number,
  vidhansabha: Number,
  Part_no: Number,
  'Part Name': String,
  'Mobile No': String
}, {
  collection: 'votersdata'
});

module.exports = mongoose.model('Voter', voterSchema);