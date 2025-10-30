const Cadre = require('../models/Cadre');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all cadres
// @route   GET /api/v1/cadres
// @access  Private
const getAllCadres = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, status, search, booth } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
        filter.status = status;
    }
    if (booth) {
        filter.boothAllocation = { $regex: booth, $options: 'i' };
    }
    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { mobileNumber: { $regex: search, $options: 'i' } },
            { boothAllocation: { $regex: search, $options: 'i' } }
        ];
    }

    const cadres = await Cadre.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Cadre.countDocuments(filter);

    res.status(200).json({
        success: true,
        data: cadres,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    });
});

// @desc    Get cadre by ID
// @route   GET /api/v1/cadres/:id
// @access  Private
const getCadreById = asyncHandler(async(req, res) => {
    const cadre = await Cadre.findById(req.params.id).select('-password');

    if (!cadre) {
        return res.status(404).json({
            success: false,
            message: 'Cadre not found'
        });
    }

    res.status(200).json({
        success: true,
        data: cadre
    });
});

// @desc    Create new cadre
// @route   POST /api/v1/cadres
// @access  Private (but allow anonymous creation when testing)
const createCadre = asyncHandler(async(req, res) => {
    const {
        activeElection,
        firstName,
        lastName,
        mobileNumber,
        gender,
        password,
        role,
        boothAllocation,
        status,
        email,
        address,
        remarks
    } = req.body;

    // Check if mobile number already exists
    const existingCadre = await Cadre.findOne({ mobileNumber });
    if (existingCadre) {
        return res.status(400).json({
            success: false,
            message: 'Cadre with this mobile number already exists'
        });
    }

    const cadre = await Cadre.create({
        activeElection: activeElection || '119  - Thondamuthur',
        firstName,
        lastName: lastName || '',
        mobileNumber,
        gender,
        password,
        role,
        boothAllocation,
        status: status || 'Active',
        email: email || '',
        address: {
            street: address?.street || '',
            city: address?.city || '',
            state: address?.state || 'Tamil Nadu',
            country: address?.country || 'India',
            postalCode: address?.postalCode || ''
        },
        remarks: remarks || '',
        createdBy: req.user ? req.user.id : null
    });

    res.status(201).json({
        success: true,
        data: cadre.getPublicProfile(),
        message: 'Cadre created successfully'
    });
});

// @desc    Login cadre
// @route   POST /api/v1/cadres/login
// @access  Public
const loginCadre = asyncHandler(async(req, res) => {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
        return res.status(400).json({ success: false, message: 'Please provide mobile number and password' });
    }

    // Find cadre and include password for match
    const cadre = await Cadre.findOne({ mobileNumber }).select('+password');

    if (!cadre) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await cadre.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login and set logged in flag
    await Cadre.updateOne({ _id: cadre._id }, {
        lastLogin: new Date(),
        isLoggedIn: true
    });

    // Create token
    const token = cadre.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token,
        data: cadre.getPublicProfile()
    });
});

// @desc    Update cadre
// @route   PUT /api/v1/cadres/:id
// @access  Private
const updateCadre = asyncHandler(async(req, res) => {
    const cadre = await Cadre.findById(req.params.id);

    if (!cadre) {
        return res.status(404).json({
            success: false,
            message: 'Cadre not found'
        });
    }

    // Check if mobile number is being changed and if it already exists
    if (req.body.mobileNumber && req.body.mobileNumber !== cadre.mobileNumber) {
        const existingCadre = await Cadre.findOne({
            mobileNumber: req.body.mobileNumber,
            _id: { $ne: req.params.id }
        });
        if (existingCadre) {
            return res.status(400).json({
                success: false,
                message: 'Cadre with this mobile number already exists'
            });
        }
    }

    // If password is being updated, load the document and save to ensure pre-save hooks (hashing) run.
    if (req.body.password) {
        const cadreToUpdate = await Cadre.findById(req.params.id);
        if (!cadreToUpdate) {
            return res.status(404).json({ success: false, message: 'Cadre not found' });
        }

        // Apply allowed updates from req.body
        const updatable = ['activeElection', 'firstName', 'lastName', 'mobileNumber', 'gender', 'password', 'role', 'boothAllocation', 'status', 'email', 'address', 'remarks'];
        updatable.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                cadreToUpdate[key] = req.body[key];
            }
        });

        await cadreToUpdate.save();
        const updated = await Cadre.findById(req.params.id).select('-password');

        return res.status(200).json({ success: true, data: updated, message: 'Cadre updated successfully' });
    }

    const updatedCadre = await Cadre.findByIdAndUpdate(
        req.params.id,
        req.body, { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, data: updatedCadre, message: 'Cadre updated successfully' });
});

// @desc    Delete cadre
// @route   DELETE /api/v1/cadres/:id
// @access  Private
const deleteCadre = asyncHandler(async(req, res) => {
    const cadre = await Cadre.findById(req.params.id);

    if (!cadre) {
        return res.status(404).json({
            success: false,
            message: 'Cadre not found'
        });
    }

    await Cadre.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Cadre deleted successfully'
    });
});

// @desc    Get cadre statistics
// @route   GET /api/v1/cadres/stats
// @access  Private
const getCadreStats = asyncHandler(async(req, res) => {
    const stats = await Cadre.aggregate([{
        $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
                $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
            },
            inactive: {
                $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
            },
            pending: {
                $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
            },
            loggedIn: {
                $sum: { $cond: ['$isLoggedIn', 1, 0] }
            }
        }
    }]);

    const result = stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        loggedIn: 0
    };

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Update cadre login status
// @route   PUT /api/v1/cadres/:id/login-status
// @access  Private
const updateLoginStatus = asyncHandler(async(req, res) => {
    const { isLoggedIn } = req.body;

    const existing = await Cadre.findById(req.params.id);
    if (!existing) {
        return res.status(404).json({ success: false, message: 'Cadre not found' });
    }

    const update = {
        isLoggedIn
    };
    if (isLoggedIn) update.lastLogin = new Date();

    const cadre = await Cadre.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');

    if (!cadre) {
        return res.status(404).json({
            success: false,
            message: 'Cadre not found'
        });
    }

    res.status(200).json({
        success: true,
        data: cadre,
        message: 'Login status updated successfully'
    });
});

module.exports = {
    getAllCadres,
    getCadreById,
    createCadre,
    loginCadre,
    updateCadre,
    deleteCadre,
    getCadreStats,
    updateLoginStatus
};