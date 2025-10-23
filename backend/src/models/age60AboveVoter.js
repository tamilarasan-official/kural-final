const mongoose = require('mongoose');

const Age60AboveVoterSchema = new mongoose.Schema({
    Name: { type: String },
    Relation: { type: String },
    'Father Name': { type: String },
    Number: { type: String },
    sex: { type: String },
    Door_no: { type: mongoose.Schema.Types.Mixed },
    Anubhag_number: { type: Number },
    Anubhag_name: { type: String },
    age: { type: Number },
    vidhansabha: { type: Number },
    part_no: { type: Number },
    'Part Name': { type: String },
    'Mobile No': { type: String },
    s: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, versionKey: false, collection: '60 and above' });

module.exports = mongoose.model('Age60AboveVoter', Age60AboveVoterSchema);