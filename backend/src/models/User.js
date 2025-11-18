const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../config/config');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters'],
        index: true
    },
    phone: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Please add a phone number'],
        unique: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'Booth Agent', 'Assembly CI', 'AssemblyIncharge', 'Polling Officer', 'Supervisor', 'Coordinator'],
        default: 'user',
        index: true
    },
    aci_id: {
        type: String,
        trim: true,
        index: true
    },
    aci_name: {
        type: String,
        trim: true
    },
    booth_id: {
        type: String,
        trim: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    avatar: {
        type: String,
        default: null
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== INDEXES FOR PERFORMANCE =====
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ aci_id: 1, booth_id: 1 });

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Check if password is bcrypt format
    if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    // Fallback to SHA-256 for legacy passwords
    const hashedInput = crypto.createHash('sha256').update(enteredPassword).digest('hex');
    return hashedInput === this.password;
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(20).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    return verificationToken;
};

// Handle failed login attempts
UserSchema.methods.incLoginAttempts = function() {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
    }

    return this.updateOne(updates);
};

// Static method for finding active users
UserSchema.statics.findActive = function(filters = {}) {
    return this.find({...filters, isActive: true }).lean().exec();
};

module.exports = mongoose.model('User', UserSchema);