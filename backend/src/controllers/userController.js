const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const users = await User.find()
        .select('-password')
        .skip(startIndex)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
        success: true,
        count: users.length,
        pagination: {
            page,
            limit,
            pages: Math.ceil(total / limit),
            total
        },
        data: users
    });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Users can only access their own profile unless they are admin
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to access this user'
        });
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Users can only update their own profile unless they are admin
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to update this user'
        });
    }

    // Don't allow non-admin users to update role
    if (req.body.role && req.user.role !== 'admin') {
        delete req.body.role;
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).select('-password');

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});