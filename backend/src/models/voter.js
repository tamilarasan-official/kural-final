const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
    // Core voter identification
    name: {
        english: { type: String, trim: true },
        tamil: { type: String, trim: true }
    },
    voterID: { type: String, trim: true },
    fathername: { type: String, trim: true },
    doornumber: { type: String, trim: true },
    age: { type: Number, min: 0, max: 150 },
    gender: { type: String, enum: ['Male', 'Female', 'Others', 'male', 'female', 'M', 'F', null], trim: true },
    mobile: { type: String, trim: true },
    emailid: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    DOB: Date,
    aadhar: { type: String, trim: true },
    PAN: { type: String, trim: true, uppercase: true },
    religion: { type: String, trim: true },
    ac: { type: String, trim: true },
    caste: { type: String, trim: true },
    subcaste: { type: String, trim: true },

    // Booth & Assembly assignment
    booth_id: { type: String, trim: true, index: true },
    booth_agent_id: { type: String, trim: true },
    boothname: { type: String, trim: true },
    boothno: { type: Number },
    aci_id: { type: Number, index: true },
    aci_name: { type: String, trim: true },

    // Dynamic fields
    bloodgroup: { type: String, trim: true, uppercase: true },
    pan: { type: String, trim: true, uppercase: true },

    // Family & special categories
    familyId: { type: String, trim: true, index: true },
    fatherless: { type: Boolean, default: false },
    guardian: { type: String, trim: true },
    specialCategories: [{ type: String, trim: true }],

    // Legacy fields (keeping for compatibility)
    sr: Number,
    Name: { type: String, trim: true },
    Relation: { type: String, trim: true },
    'Father Name': { type: String, trim: true },
    Number: { type: String, trim: true },
    sex: { type: String, trim: true },
    Door_No: Number,
    Anubhag_number: Number,
    Anubhag_name: { type: String, trim: true },
    vidhansabha: Number,
    Part_no: Number,
    'Part Name': { type: String, trim: true },
    'Mobile No': { type: String, trim: true },

    // Verification tracking
    verified: { type: Boolean, default: false, index: true },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'verified'], default: 'pending' },

    // Survey tracking
    surveyed: { type: Boolean, default: false, index: true },
    surveyedAt: Date,

    // Additional fields
    dateOfBirth: Date,
    mobileNumber: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    location: { type: String, trim: true },
    aadharNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true, uppercase: true },
    membershipNumber: { type: String, trim: true },
    category: { type: String, trim: true },
    casteCategory: { type: String, trim: true },
    party: { type: String, trim: true },
    schemes: { type: String, trim: true },
    history: { type: String, trim: true },
    feedback: { type: String, trim: true },
    language: { type: String, trim: true },
    remarks: { type: String, trim: true }
}, {
    collection: 'voters',
    timestamps: true,
    strict: false // Allow dynamic fields
});

// ===== CRITICAL PERFORMANCE INDEXES =====

// Compound index for booth queries (most common query pattern)
voterSchema.index({ aci_id: 1, booth_id: 1 });

// Unique index on voterID for fast lookups and data integrity
voterSchema.index({ voterID: 1 }, { unique: true, sparse: true });

// Text index for search functionality
voterSchema.index({
    'name.english': 'text',
    'Name': 'text',
    'voterID': 'text',
    'Number': 'text',
    'mobile': 'text',
    'Mobile No': 'text'
});

// Index for family queries
voterSchema.index({ familyId: 1 });

// Compound index for survey tracking
voterSchema.index({ surveyed: 1, booth_id: 1 });

// Index for verification queries
voterSchema.index({ verified: 1, booth_id: 1 });

// Index for age-based filtering
voterSchema.index({ age: 1 });

// Index for gender-based filtering
voterSchema.index({ gender: 1 });

// Index for timestamps (recent voters)
voterSchema.index({ createdAt: -1 });

// ===== PERFORMANCE METHODS =====

// Static method for optimized booth query
voterSchema.statics.findByBooth = function(aciId, boothId, options = {}) {
    const { page = 1, limit = 50, select = null } = options;
    const skip = (page - 1) * limit;

    let query = this.find({ aci_id: Number(aciId), booth_id: boothId });

    if (select) {
        query = query.select(select);
    }

    return query
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

// Static method for optimized count
voterSchema.statics.countByBooth = function(aciId, boothId) {
    return this.countDocuments({
        aci_id: Number(aciId),
        booth_id: boothId
    }).exec();
};

// Static method for text search
voterSchema.statics.searchVoters = function(searchTerm, filters = {}, options = {}) {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const query = {
        $text: { $search: searchTerm },
        ...filters
    };

    return this.find(query)
        .select('voterID name Name age gender mobile booth_id aci_id')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

module.exports = mongoose.model('Voter', voterSchema);