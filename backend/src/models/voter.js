const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
    // Production database fields
    name: {
        english: String,
        tamil: String
    },
    voterID: String, // Was 'Number' in old schema
    fathername: String,
    doornumber: String,
    age: Number,
    gender: String, // Was 'sex' in old schema
    mobile: String,
    emailid: String,
    address: String,
    DOB: Date,
    aadhar: String,
    PAN: String,
    religion: String,
    ac: String,
    caste: String,
    subcaste: String,
    booth_id: String,
    booth_agent_id: String,
    boothname: String,
    boothno: Number,
    aci_id: Number,
    aci_name: String,

    // Special categories
    fatherless: Boolean,
    guardian: String,

    // Legacy/additional fields (keeping for compatibility)
    sr: Number,
    Name: String,
    Relation: String,
    'Father Name': String,
    Number: String,
    sex: String,
    Door_No: Number,
    Anubhag_number: Number,
    Anubhag_name: String,
    vidhansabha: Number,
    Part_no: Number,
    'Part Name': String,
    'Mobile No': String,
    familyId: String,
    specialCategories: [String],

    // Verification fields
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'verified'],
        default: 'pending'
    },

    // Survey tracking
    surveyed: {
        type: Boolean,
        default: false
    },

    // Additional Information
    dateOfBirth: Date,
    mobileNumber: String,
    whatsappNumber: String,
    email: String,
    location: String,
    aadharNumber: String,
    panNumber: String,
    membershipNumber: String,
    category: String,
    casteCategory: String,
    party: String,
    schemes: String,
    history: String,
    feedback: String,
    language: String,
    remarks: String
}, {
    collection: 'voters',
    timestamps: true
});

module.exports = mongoose.model('Voter', voterSchema);