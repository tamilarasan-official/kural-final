const mongoose = require('mongoose');

/**
 * MasterDataSection Model
 * Stores sections (tabs) and their associated questions for master data collection
 * Created by admin panel, consumed by booth agents
 */
const masterDataSectionSchema = new mongoose.Schema({
    // Section identification
    name: {
        type: String,
        required: [true, 'Section name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },

    // Display order for tabs
    order: {
        type: Number,
        default: 0,
    },

    // Questions in this section
    questions: [{
        prompt: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['text', 'number', 'select', 'multiple-choice', 'radio', 'checkbox', 'date', 'textarea', 'dropdown'],
            default: 'text',
        },
        options: [{
            label: String,
            value: String,
            _id: mongoose.Schema.Types.ObjectId,
        }],
        isRequired: {
            type: Boolean,
            default: false,
        },
        order: {
            type: Number,
            default: 0,
        },
    }],

    // Visibility status
    isVisible: {
        type: Boolean,
        default: true,
    },

    // ACI filtering - sections can be assigned to specific ACIs
    aci_id: {
        type: [Number],
        default: [],
    },
    aci_name: {
        type: [String],
        default: [],
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
    collection: 'masterDataSections', // Match the actual collection name in database
    strict: false, // Allow additional fields from database
});

// Indexes for performance
masterDataSectionSchema.index({ name: 1 });
masterDataSectionSchema.index({ order: 1, isVisible: 1 });
masterDataSectionSchema.index({ isVisible: 1 });
masterDataSectionSchema.index({ aci_id: 1 });

module.exports = mongoose.model('MasterDataSection', masterDataSectionSchema);