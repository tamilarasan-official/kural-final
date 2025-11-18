const mongoose = require('mongoose');

/**
 * Dynamic Field Schema
 * This schema stores field configurations that can be added via admin panel
 * and automatically reflected in the mobile app without code changes
 */
const dynamicFieldSchema = new mongoose.Schema({
    // Unique identifier for the field
    fieldId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    // Field label/name displayed in the app
    label: {
        english: {
            type: String,
            required: true,
            trim: true
        },
        tamil: {
            type: String,
            trim: true
        }
    },

    // Field type determines how it's rendered in the app
    fieldType: {
        type: String,
        required: true,
        enum: [
            'text', // Single line text input
            'textarea', // Multi-line text input
            'number', // Numeric input
            'email', // Email input
            'phone', // Phone number input
            'date', // Date picker
            'time', // Time picker
            'datetime', // Date and time picker
            'dropdown', // Single select dropdown
            'radio', // Radio button group
            'checkbox', // Multiple checkboxes
            'switch', // Toggle switch (boolean)
            'slider', // Numeric slider
            'rating', // Star rating
            'image', // Image upload
            'file', // File upload
            'location', // GPS location picker
            'signature', // Digital signature
            'barcode', // Barcode scanner
            'qrcode' // QR code scanner
        ]
    },

    // Placeholder text for input fields
    placeholder: {
        english: String,
        tamil: String
    },

    // Help text or description
    helpText: {
        english: String,
        tamil: String
    },

    // Options for dropdown, radio, checkbox fields
    options: [{
        value: {
            type: String,
            required: true
        },
        label: {
            english: {
                type: String,
                required: true
            },
            tamil: String
        },
        order: {
            type: Number,
            default: 0
        }
    }],

    // Validation rules
    validation: {
        required: {
            type: Boolean,
            default: false
        },
        minLength: Number,
        maxLength: Number,
        min: Number,
        max: Number,
        pattern: String, // Regex pattern for validation
        customValidation: String // Custom validation function name
    },

    // Default value
    defaultValue: mongoose.Schema.Types.Mixed,

    // Conditional display logic
    conditionalDisplay: {
        enabled: {
            type: Boolean,
            default: false
        },
        dependsOn: String, // fieldId of the field this depends on
        condition: String, // equals, notEquals, contains, greaterThan, lessThan
        value: mongoose.Schema.Types.Mixed // Value to compare against
    },

    // Field configuration
    config: {
        multiline: Boolean, // For text fields
        numberOfLines: Number, // For textarea
        keyboardType: String, // numeric, email-address, phone-pad, etc.
        autoCapitalize: String, // none, sentences, words, characters
        secureTextEntry: Boolean, // For password fields
        editable: {
            type: Boolean,
            default: true
        },
        step: Number, // For number/slider fields
        minimumValue: Number, // For slider
        maximumValue: Number, // For slider
        dateFormat: String, // For date fields
        timeFormat: String, // For time fields
        allowMultiple: Boolean, // For file/image upload
        maxFiles: Number, // Maximum number of files
        acceptedFormats: [String], // Accepted file formats
        captureMode: String // camera, gallery, both
    },

    // Display order in the form
    order: {
        type: Number,
        default: 0
    },

    // Category/Section for grouping fields
    category: {
        type: String,
        trim: true,
        default: 'general'
    },

    // Which forms/screens should this field appear in
    applicableTo: [{
        type: String,
        enum: [
            'voter_registration',
            'survey',
            'booth_agent',
            'cadre',
            'volunteer',
            'custom_form',
            'all'
        ]
    }],

    // Form/Screen ID if applicable to specific forms
    formIds: [{
        type: String
    }],

    // Styling options
    styling: {
        width: {
            type: String,
            enum: ['full', 'half', 'third', 'quarter'],
            default: 'full'
        },
        backgroundColor: String,
        textColor: String,
        borderColor: String,
        fontSize: Number
    },

    // Field status
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Version control
    version: {
        type: Number,
        default: 1
    },

    // Analytics
    usageCount: {
        type: Number,
        default: 0
    },

    lastUsedAt: Date

}, {
    timestamps: true,
    collection: 'dynamicfields'
});

// Indexes for better query performance
// fieldId index is automatically created by unique: true
dynamicFieldSchema.index({ status: 1 });
dynamicFieldSchema.index({ category: 1 });
dynamicFieldSchema.index({ applicableTo: 1 });
dynamicFieldSchema.index({ formIds: 1 });
dynamicFieldSchema.index({ order: 1 });
dynamicFieldSchema.index({ createdAt: -1 });

// Pre-save middleware to handle version increment
dynamicFieldSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.version += 1;
    }
    next();
});

// Method to get field configuration for mobile app
dynamicFieldSchema.methods.getMobileConfig = function() {
    return {
        fieldId: this.fieldId,
        label: this.label,
        fieldType: this.fieldType,
        placeholder: this.placeholder,
        helpText: this.helpText,
        options: this.options,
        validation: this.validation,
        defaultValue: this.defaultValue,
        conditionalDisplay: this.conditionalDisplay,
        config: this.config,
        order: this.order,
        category: this.category,
        styling: this.styling
    };
};

// Static method to get active fields for a specific form
dynamicFieldSchema.statics.getFieldsForForm = async function(formType, formId = null) {
    const query = {
        status: 'active',
        $or: [
            { applicableTo: formType },
            { applicableTo: 'all' }
        ]
    };

    if (formId) {
        query.$or.push({ formIds: formId });
    }

    return this.find(query).sort({ order: 1 }).lean();
};

module.exports = mongoose.model('DynamicField', dynamicFieldSchema);