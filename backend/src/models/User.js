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
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    phone: {
        type: mongoose.Schema.Types.Mixed, // Allow both String and Number
        required: [true, 'Please add a phone number'],
        unique: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
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
        default: 'user'
    },
    aci_id: {
        type: String,
        trim: true
    },
    aci_name: {
        type: String,
        trim: true
    },
    booth_id: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
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

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for better query performance
UserSchema.index({ createdAt: -1 });

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    console.log('🔐 matchPassword called');
    console.log('  - Entered password:', enteredPassword);
    console.log('  - Stored hash:', this.password);
    console.log('  - Hash length:', this.password && this.password.length);
    console.log('  - Starts with $2a$:', this.password && this.password.startsWith('$2a$'));
    console.log('  - Starts with $2b$:', this.password && this.password.startsWith('$2b$'));

    // Check if password is bcrypt format (starts with $2a$ or $2b$)
    if (this.password && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
        console.log('  - Using bcrypt comparison');
        // Use bcrypt comparison for bcrypt hashed passwords
        const result = await bcrypt.compare(enteredPassword, this.password);
        console.log('  - Bcrypt result:', result);
        return result;
    }

    // Otherwise, assume it's SHA-256 hash (64 character hex string)
    // For SHA-256, hash the entered password and compare
    const crypto = require('crypto');
    const hashedInput = crypto.createHash('sha256').update(enteredPassword).digest('hex');
    console.log('  - Using SHA-256 comparison');
    console.log('  - Hashed input:', hashedInput);
    console.log('  - Match:', hashedInput === this.password);
    return hashedInput === this.password;
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
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
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }

    return this.updateOne(updates);
};

module.exports = mongoose.model('User', UserSchema);