const VoterField = require('../models/VoterField');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * @desc    Get all voter fields (visible only for mobile)
 * @route   GET /api/v1/voter-fields
 * @access  Public
 */
const getAllVoterFields = asyncHandler(async(req, res) => {
    const { includeHidden } = req.query;

    // Build filter
    const filter = {};

    // Only show visible fields unless explicitly requested
    if (!includeHidden || includeHidden === 'false') {
        filter.visible = true;
    }

    const fields = await VoterField.find(filter)
        .sort({ order: 1, name: 1 })
        .lean();

    res.status(200).json({
        success: true,
        data: fields,
        count: fields.length
    });
});

/**
 * @desc    Get voter field by name
 * @route   GET /api/v1/voter-fields/:name
 * @access  Public
 */
const getVoterFieldByName = asyncHandler(async(req, res) => {
    const field = await VoterField.findOne({ name: req.params.name }).lean();

    if (!field) {
        return res.status(404).json({
            success: false,
            message: 'Voter field not found'
        });
    }

    res.status(200).json({
        success: true,
        data: field
    });
});

/**
 * @desc    Create new voter field
 * @route   POST /api/v1/voter-fields
 * @access  Private/Admin
 */
const createVoterField = asyncHandler(async(req, res) => {
    const field = await VoterField.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Voter field created successfully',
        data: field
    });
});

/**
 * @desc    Update voter field
 * @route   PUT /api/v1/voter-fields/:name
 * @access  Private/Admin
 */
const updateVoterField = asyncHandler(async(req, res) => {
    let field = await VoterField.findOne({ name: req.params.name });

    if (!field) {
        return res.status(404).json({
            success: false,
            message: 'Voter field not found'
        });
    }

    field = await VoterField.findOneAndUpdate({ name: req.params.name },
        req.body, {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        message: 'Voter field updated successfully',
        data: field
    });
});

/**
 * @desc    Delete voter field
 * @route   DELETE /api/v1/voter-fields/:name
 * @access  Private/Admin
 */
const deleteVoterField = asyncHandler(async(req, res) => {
    const field = await VoterField.findOne({ name: req.params.name });

    if (!field) {
        return res.status(404).json({
            success: false,
            message: 'Voter field not found'
        });
    }

    await VoterField.deleteOne({ name: req.params.name });

    res.status(200).json({
        success: true,
        message: 'Voter field deleted successfully'
    });
});

/**
 * @desc    Toggle voter field visibility
 * @route   PUT /api/v1/voter-fields/:name/visibility
 * @access  Private/Admin
 */
const toggleVoterFieldVisibility = asyncHandler(async(req, res) => {
    const field = await VoterField.findOne({ name: req.params.name });

    if (!field) {
        return res.status(404).json({
            success: false,
            message: 'Voter field not found'
        });
    }

    field.visible = !field.visible;
    await field.save();

    res.status(200).json({
        success: true,
        message: `Voter field visibility set to ${field.visible}`,
        data: field
    });
});

module.exports = {
    getAllVoterFields,
    getVoterFieldByName,
    createVoterField,
    updateVoterField,
    deleteVoterField,
    toggleVoterFieldVisibility
};