const crypto = require('crypto');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async(req, res, next) => {
    const { name, email, phone, password, role, aci_id, aci_name } = req.body;

    // Check if user already exists (by phone or email)
    const existingUser = await User.findOne({
        $or: [
            { phone: phone },
            { email: email }
        ]
    });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            error: 'User already exists'
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        phone,
        password,
        role,
        aci_id,
        aci_name
    });

    // Generate email verification token if email provided
    if (email) {
        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
    }

    // TODO: Send verification email
    logger.info(`User registered: ${user.phone || user.email}`);

    sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async(req, res, next) => {
    const { email, phone, password } = req.body;

    // Support both phone and email login
    const loginField = phone || email;

    console.log('🔐 Login attempt:', { phone, email, loginField, passwordLength: password && password.length });

    // Validate credentials
    if (!loginField || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide phone/email and password'
        });
    }

    // Convert phone to number if it's a string of digits
    const phoneAsNumber = loginField && /^\d+$/.test(loginField) ? Number(loginField) : loginField;

    console.log('🔍 Searching for user:', { loginField, phoneAsNumber, type: typeof phoneAsNumber });

    // Build query
    const query = {
        $or: [
            { phone: loginField },
            { phone: phoneAsNumber },
            { email: loginField }
        ]
    };
    console.log('📝 Query object:', JSON.stringify(query, null, 2));

    // DEBUGGING: Try direct collection query first
    const mongoose = require('mongoose');
    const directUser = await mongoose.connection.db.collection('users').findOne({ phone: phoneAsNumber });
    console.log('🔍 Direct collection query result:', directUser ? { phone: directUser.phone, role: directUser.role } : 'NOT FOUND');

    // Check for user (support both phone and email, and phone as both string and number)
    const user = await User.findOne(query).select('+password');

    console.log('👤 User found:', user ? { id: user._id, phone: user.phone, role: user.role, passwordHash: user.password && user.password.substring(0, 20) + '...' } : 'NO USER FOUND');

    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // IMPORTANT: Auth endpoint is ONLY for Assembly CI and Admin users
    // Booth Agents should use /api/v1/booths/login endpoint
    if (user.role !== 'Assembly CI' && user.role !== 'AssemblyIncharge' && user.role !== 'admin') {
        console.log('❌ User role not authorized for this endpoint:', user.role);
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials' // Don't reveal the reason
        });
    }

    // Check if account is locked
    if (user.isLocked) {
        return res.status(423).json({
            success: false,
            error: 'Account is locked due to too many failed login attempts'
        });
    }

    console.log('🔑 Checking password match...');
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('✅ Password match result:', isMatch);

    if (!isMatch) {
        // Increment login attempts
        await user.incLoginAttempts();

        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
        await user.updateOne({
            $unset: { loginAttempts: 1, lockUntil: 1 }
        });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user.phone || user.email}`);
    sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async(req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: 'User logged out successfully'
    });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return res.status(401).json({
            success: false,
            error: 'Password is incorrect'
        });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'There is no user with that email'
        });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    logger.info(`Password reset token generated for user: ${user.email}`);

    res.status(200).json({
        success: true,
        data: 'Email sent'
    });
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async(req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: resetPasswordToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            error: 'Invalid token'
        });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        data: {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            aci_id: user.aci_id,
            aci_name: user.aci_name,
            booth_id: user.booth_id
        }
    });
};