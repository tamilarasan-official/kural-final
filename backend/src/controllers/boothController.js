const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all booths
// @route   GET /api/v1/booths
// @access  Private
const getAllBooths = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, status, search, booth } = req.query;
    const skip = (page - 1) * limit;

    // Build filter object - only get Booth Agent users
    const filter = { role: 'Booth Agent' };
    if (status && status !== 'all') {
        filter.status = status;
    }
    if (booth) {
        filter.boothAllocation = { $regex: booth, $options: 'i' };
    }
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { mobileNumber: { $regex: search, $options: 'i' } },
            { boothAllocation: { $regex: search, $options: 'i' } }
        ];
    }

    const [total, booths] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
    ]);

    res.status(200).json({
        success: true,
        data: booths,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    });
});

// @desc    Get booth by ID
// @route   GET /api/v1/booths/:id
// @access  Private
const getBoothById = asyncHandler(async(req, res) => {
    const booth = await User.findById(req.params.id).select('-password');

    if (!booth) {
        return res.status(404).json({
            success: false,
            message: 'Booth not found'
        });
    }

    res.status(200).json({
        success: true,
        data: booth
    });
});

// @desc    Create new booth
// @route   POST /api/v1/booths
// @access  Private (but allow anonymous creation when testing)
const createBooth = asyncHandler(async(req, res) => {
    const {
        activeElection,
        name,
        firstName,
        lastName,
        phone,
        mobileNumber,
        gender,
        password,
        role,
        boothAllocation,
        status,
        email,
        address,
        remarks,
        aci_id,
        aci_name,
        booth_id,
        booth_agent_id
    } = req.body;

    // Support both old (mobileNumber) and new (phone) field names
    const phoneField = phone || mobileNumber;
    const nameField = name || (firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName);

    // Check if phone number already exists
    const existingBooth = await User.findOne({
        $or: [
            { phone: phoneField },
            { mobileNumber: phoneField }
        ]
    });
    if (existingBooth) {
        return res.status(400).json({
            success: false,
            message: 'Booth with this phone number already exists'
        });
    }

    const booth = await User.create({
        activeElection: activeElection || '119  - Thondamuthur',
        name: nameField,
        phone: phoneField,
        firstName,
        lastName: lastName || '',
        mobileNumber: phoneField,
        gender,
        password,
        role,
        boothAllocation,
        status: status || 'Active',
        email: email || '',
        aci_id,
        aci_name,
        booth_id,
        booth_agent_id,
        address: {
            street: address && address.street || '',
            city: address && address.city || '',
            state: address && address.state || 'Tamil Nadu',
            country: address && address.country || 'India',
            postalCode: address && address.postalCode || ''
        },
        remarks: remarks || '',
        createdBy: req.user ? req.user.id : null
    });

    res.status(201).json({
        success: true,
        data: booth.getPublicProfile(),
        message: 'Booth created successfully'
    });
});

// @desc    Login booth
// @route   POST /api/v1/booths/login
// @access  Public
const loginBooth = asyncHandler(async(req, res) => {
    const { phone, mobileNumber, password } = req.body;

    // Support both old (mobileNumber) and new (phone) field names
    const phoneField = phone || mobileNumber;

    if (!phoneField || !password) {
        return res.status(400).json({ success: false, message: 'Please provide phone number and password' });
    }

    const phoneAsNumber = phoneField && /^\d+$/.test(phoneField) ? Number(phoneField) : phoneField;

    const User = require('../models/User');
    const userBoothAgent = await User.findOne({
        $or: [
            { phone: phoneField },
            { phone: phoneAsNumber }
        ],
        role: 'Booth Agent'
    }).select('+password');

    if (userBoothAgent) {
        const isMatch = await userBoothAgent.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last login
        userBoothAgent.lastLogin = new Date();
        userBoothAgent.isActive = true;
        await userBoothAgent.save();

        const token = userBoothAgent.getSignedJwtToken();

        return res.status(200).json({
            success: true,
            token,
            data: {
                _id: userBoothAgent._id,
                name: userBoothAgent.name,
                phone: userBoothAgent.phone,
                role: userBoothAgent.role,
                aci_id: userBoothAgent.aci_id,
                aci_name: userBoothAgent.aci_name,
                booth_id: userBoothAgent.booth_id,
                boothAllocation: userBoothAgent.boothAllocation || userBoothAgent.activeElection,
                isActive: userBoothAgent.isActive
            }
        });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// @desc    Update booth
// @route   PUT /api/v1/booths/:id
// @access  Private
const updateBooth = asyncHandler(async(req, res) => {
    const booth = await User.findById(req.params.id);

    if (!booth) {
        return res.status(404).json({
            success: false,
            message: 'Booth not found'
        });
    }

    // Check if phone/mobile number is being changed and if it already exists
    const phoneField = req.body.phone || req.body.mobileNumber;
    const currentPhone = booth.phone || booth.mobileNumber;

    if (phoneField && phoneField !== currentPhone) {
        const existingBooth = await User.findOne({
            $or: [
                { phone: phoneField },
                { mobileNumber: phoneField }
            ],
            _id: { $ne: req.params.id }
        });
        if (existingBooth) {
            return res.status(400).json({
                success: false,
                message: 'Booth with this phone number already exists'
            });
        }
    }

    // If password is being updated, load the document and save to ensure pre-save hooks (hashing) run.
    if (req.body.password) {
        const boothToUpdate = await User.findById(req.params.id);
        if (!boothToUpdate) {
            return res.status(404).json({ success: false, message: 'Booth not found' });
        }

        // Apply allowed updates from req.body
        const updatable = ['activeElection', 'name', 'firstName', 'lastName', 'phone', 'mobileNumber', 'gender', 'password', 'role', 'boothAllocation', 'status', 'email', 'address', 'remarks', 'aci_id', 'aci_name', 'booth_id', 'booth_agent_id'];
        updatable.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                boothToUpdate[key] = req.body[key];
            }
        });

        await boothToUpdate.save();
        const updated = await User.findById(req.params.id).select('-password');

        return res.status(200).json({ success: true, data: updated, message: 'Booth updated successfully' });
    }

    const updatedBooth = await User.findByIdAndUpdate(
        req.params.id,
        req.body, { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, data: updatedBooth, message: 'Booth updated successfully' });
});

// @desc    Delete booth
// @route   DELETE /api/v1/booths/:id
// @access  Private
const deleteBooth = asyncHandler(async(req, res) => {
    const booth = await Booth.findById(req.params.id);

    if (!booth) {
        return res.status(404).json({
            success: false,
            message: 'Booth not found'
        });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Booth deleted successfully'
    });
});

// @desc    Get booth statistics
// @route   GET /api/v1/booths/stats
// @access  Private
const getBoothStats = asyncHandler(async(req, res) => {
    const stats = await Booth.aggregate([{
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

// @desc    Update booth login status
// @route   PUT /api/v1/booths/:id/login-status
// @access  Private
const updateLoginStatus = asyncHandler(async(req, res) => {
    const { isLoggedIn } = req.body;

    const existing = await Booth.findById(req.params.id);
    if (!existing) {
        return res.status(404).json({ success: false, message: 'Booth not found' });
    }

    const update = {
        isLoggedIn
    };
    if (isLoggedIn) update.lastLogin = new Date();

    const booth = await Booth.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');

    if (!booth) {
        return res.status(404).json({
            success: false,
            message: 'Booth not found'
        });
    }

    res.status(200).json({
        success: true,
        data: booth,
        message: 'Login status updated successfully'
    });
});

module.exports = {
    getAllBooths,
    getBoothById,
    createBooth,
    loginBooth,
    updateBooth,
    deleteBooth,
    getBoothStats,
    updateLoginStatus
};