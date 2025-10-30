const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

const cadreSchema = new mongoose.Schema({
    // Personal Details
    activeElection: {
        type: String,
        required: true,
        default: '119  - Thondamuthur'
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        trim: true,
        default: ''
    },
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Mobile number must be 10 digits'
        }
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },

    // Role and Allocation
    role: {
        type: String,
        required: true,
        enum: ['Booth Agent', 'Polling Officer', 'Supervisor', 'Coordinator', 'AssemblyIncharge', 'AssemblyIncharge-119 ']
    },
    boothAllocation: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive', 'Pending'],
        default: 'Active'
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },

    // Address Details
    address: {
        street: {
            type: String,
            trim: true,
            default: ''
        },
        city: {
            type: String,
            trim: true,
            default: ''
        },
        state: {
            type: String,
            required: true,
            default: 'Tamil Nadu'
        },
        country: {
            type: String,
            required: true,
            default: 'India'
        },
        postalCode: {
            type: String,
            trim: true,
            default: ''
        }
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    },

    // System fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() {
            return this.isNew;
        }
    },
    lastLogin: {
        type: Date,
        default: null
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
// mobileNumber index is automatically created by unique: true
cadreSchema.index({ status: 1 });
cadreSchema.index({ activeElection: 1 });
cadreSchema.index({ boothAllocation: 1 });
cadreSchema.index({ createdBy: 1 });

// Virtual for full name
cadreSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`.trim();
});

// Encrypt password using bcrypt
cadreSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
cadreSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
cadreSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRE
    });
};

// Method to get public profile (without sensitive data)
cadreSchema.methods.getPublicProfile = function() {
    const cadre = this.toObject();
    delete cadre.password;
    return cadre;
};

module.exports = mongoose.model('Cadre', cadreSchema);