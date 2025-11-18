const mongoose = require('mongoose');

/**
 * Voter Field Schema
 * Stores custom field definitions for voter forms
 * These fields can be added by admin and will appear in voter registration/details
 */
const voterFieldSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['String', 'Number', 'Date', 'Boolean', 'Array']
    },
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    default: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    visible: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['basic', 'family', 'contact', 'address', 'documents', 'community', 'health', 'personal', 'other'],
        default: 'other'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    __v: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'voterFields'
});

// ===== PERFORMANCE INDEXES =====
// Compound indexes for common query patterns
voterFieldSchema.index({ visible: 1, order: 1 });
voterFieldSchema.index({ category: 1, order: 1 });
voterFieldSchema.index({ visible: 1, category: 1 });

// Static method for finding visible fields
voterFieldSchema.statics.findVisible = function(categoryFilter = null) {
    const query = { visible: true };

    if (categoryFilter) {
        query.category = categoryFilter;
    }

    return this.find(query)
        .sort({ order: 1 })
        .lean()
        .exec();
};

// Static method for finding fields by category
voterFieldSchema.statics.findByCategory = function(category) {
    return this.find({ category, visible: true })
        .sort({ order: 1 })
        .lean()
        .exec();
};

// Pre-save hook to update timestamps
voterFieldSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('VoterField', voterFieldSchema);