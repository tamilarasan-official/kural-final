const mongoose = require('mongoose');

/**
 * MasterDataResponse Model
 * Stores responses submitted by booth agents for master data sections
 */
const masterDataResponseSchema = new mongoose.Schema({
    // Voter information
    voterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voter',
        required: [true, 'Voter ID is required'],
    },
    voterEpicNo: {
        type: String,
        trim: true,
    },

    // Section information
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterDataSection',
        required: [true, 'Section ID is required'],
    },
    sectionName: {
        type: String,
        required: true,
    },

    // Responses (key-value pairs: questionId -> answer)
    responses: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
    },

    // Booth Agent who submitted
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Submitted by is required'],
    },
    submittedByName: {
        type: String,
        trim: true,
    },

    // Booth information
    boothId: {
        type: String,
        trim: true,
    },
    aciId: {
        type: Number,
    },

    // Submission metadata
    submittedAt: {
        type: Date,
        default: Date.now,
    },

    // Completion status
    isComplete: {
        type: Boolean,
        default: true,
    },

    // Device/Location info
    deviceInfo: {
        platform: String,
        version: String,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        },
    },
}, {
    timestamps: true,
    collection: 'masterDataResponses', // Match camelCase naming
});

// Indexes for performance
masterDataResponseSchema.index({ voterId: 1, sectionId: 1 });
masterDataResponseSchema.index({ submittedBy: 1, submittedAt: -1 });
masterDataResponseSchema.index({ boothId: 1, aciId: 1 });
masterDataResponseSchema.index({ sectionId: 1, isComplete: 1 });
masterDataResponseSchema.index({ submittedAt: -1 });
// Geospatial index - only for documents with location
masterDataResponseSchema.index({ location: '2dsphere' }, { sparse: true });

// Compound index to prevent duplicate responses (one response per voter per section)
masterDataResponseSchema.index({ voterId: 1, sectionId: 1 }, { unique: true });

module.exports = mongoose.model('MasterDataResponse', masterDataResponseSchema);