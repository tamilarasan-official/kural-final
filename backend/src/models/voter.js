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
    'Mobile No': String,
    // Additional fields for new voter creation
    familyId: String,
    specialCategories: [String],
    address: String,
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
    // Contact Information
    dateOfBirth: Date,
    mobileNumber: String,
    whatsappNumber: String,
    email: String,
    location: String,
    // Additional Information
    aadharNumber: String,
    panNumber: String,
    membershipNumber: String,
    religion: String,
    caste: String,
    subCaste: String,
    category: String,
    casteCategory: String,
    party: String,
    schemes: String,
    history: String,
    feedback: String,
    language: String,
    remarks: String
}, {
    collection: 'votersdata',
    timestamps: true
});

module.exports = mongoose.model('Voter', voterSchema);