const DynamicField = require('../models/DynamicField');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * @desc    Get all dynamic fields with filters
 * @route   GET /api/v1/dynamic-fields
 * @access  Private/Admin
 */
const getAllDynamicFields = asyncHandler(async(req, res) => {
    const {
        page = 1,
            limit = 50,
            status,
            category,
            fieldType,
            applicableTo,
            search
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (status) {
        filter.status = status;
    }

    if (category) {
        filter.category = category;
    }

    if (fieldType) {
        filter.fieldType = fieldType;
    }

    if (applicableTo) {
        filter.applicableTo = applicableTo;
    }

    if (search) {
        filter.$or = [
            { fieldId: { $regex: search, $options: 'i' } },
            { 'label.english': { $regex: search, $options: 'i' } },
            { 'label.tamil': { $regex: search, $options: 'i' } }
        ];
    }

    const [total, fields] = await Promise.all([
        DynamicField.countDocuments(filter),
        DynamicField.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
    ]);

    res.status(200).json({
        success: true,
        data: fields,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    });
});

/**
 * @desc    Get dynamic field by ID
 * @route   GET /api/v1/dynamic-fields/:id
 * @access  Private
 */
const getDynamicFieldById = asyncHandler(async(req, res) => {
    const field = await DynamicField.findById(req.params.id);

    if (!field) {
        return res.status(404).json({
            success: false,
            message: 'Dynamic field not found'
        });
    }

    res.status(200).json({
        success: true,
        data: field
    });
});

/**
 * @desc    Get dynamic field by fieldId
 * @route   GET /api/v1/dynamic-fields/field/:fieldId
 * @access  Private
 */
const getDynamicFieldByFieldId = asyncHandler(async(req, res) => {
    const field = await DynamicField.findOne({ fieldId: req.params.fieldId });

    if (!field) {
        return res.status(404).json({
            success: false,
            message: 'Dynamic field not found'
        });
    }

    res.status(200).json({
        success: true,
        data: field
    });
});

/**
 * @desc    Create new dynamic field
 * @route   POST /api/v1/dynamic-fields
 * @access  Private/Admin
 */
const createDynamicField = asyncHandler(async(req, res) => {
    // Add user info if available
    if (req.user) {
        req.body.createdBy = req.user.id;
    }

    const field = await DynamicField.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Dynamic field created successfully',
        data: field
    });
});

/**
 * @desc    Update dynamic field
 * @route   PUT /api/v1/dynamic-fields/:id
 * @access  Private/Admin
 */
const updateDynamicField = asyncHandler(async(req, res) => {
    let field = await DynamicField.findById(req.params.id);

    if (!field) {
        return res.status(404).json({
            success: false,
            message: 'Dynamic field not found'
        });
    }

    // Add user info if available
    if (req.user) {
        req.body.updatedBy = req.user.id;
    }

    field = await DynamicField.findByIdAndUpdate(
        req.params.id,
        req.body, {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        message: 'Dynamic field updated successfully',
        data: field
    });
});

/**
 * @desc    Delete dynamic field
 * @route   DELETE /api/v1/dynamic-fields/:id
 * @access  Private/Admin
 */
const deleteDynamicField = asyncHandler(async(req, res) => {
    const field = await DynamicField.findById(req.params.id);

    if (!field) {
        return res.status(404).json({
            success: false,
            message: 'Dynamic field not found'
        });
    }

    // Soft delete - set status to archived
    field.status = 'archived';
    await field.save();

    res.status(200).json({
        success: true,
        message: 'Dynamic field archived successfully'
    });
});

/**
 * @desc    Get fields for specific form/screen
 * @route   GET /api/v1/dynamic-fields/form/:formType
 * @access  Public (for mobile app)
 */
const getFieldsForForm = asyncHandler(async(req, res) => {
    const { formType } = req.params;
    const { formId } = req.query;

    const fields = await DynamicField.getFieldsForForm(formType, formId);

    // Convert to mobile-friendly format
    const mobileConfig = fields.map(field => {
        const fieldDoc = new DynamicField(field);
        return fieldDoc.getMobileConfig();
    });

    res.status(200).json({
        success: true,
        data: mobileConfig,
        count: mobileConfig.length
    });
});

/**
 * @desc    Get fields for mobile app (all active fields)
 * @route   GET /api/v1/dynamic-fields/mobile/all
 * @access  Public (for mobile app)
 */
const getFieldsForMobile = asyncHandler(async(req, res) => {
    const { category, applicableTo } = req.query;

    const filter = { status: 'active' };

    if (category) {
        filter.category = category;
    }

    if (applicableTo) {
        filter.applicableTo = applicableTo;
    }

    const fields = await DynamicField.find(filter)
        .sort({ order: 1 })
        .lean();

    // Convert to mobile-friendly format
    const mobileConfig = fields.map(field => {
        const fieldDoc = new DynamicField(field);
        return fieldDoc.getMobileConfig();
    });

    res.status(200).json({
        success: true,
        data: mobileConfig,
        count: mobileConfig.length,
        timestamp: new Date().toISOString()
    });
});

/**
 * @desc    Bulk create dynamic fields
 * @route   POST /api/v1/dynamic-fields/bulk
 * @access  Private/Admin
 */
const bulkCreateDynamicFields = asyncHandler(async(req, res) => {
    const { fields } = req.body;

    if (!Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Fields array is required'
        });
    }

    // Add user info if available
    const fieldsWithUser = fields.map(field => ({
        ...field,
        createdBy: req.user?.id
    }));

    const createdFields = await DynamicField.insertMany(fieldsWithUser);

    res.status(201).json({
        success: true,
        message: `${createdFields.length} dynamic fields created successfully`,
        data: createdFields
    });
});

/**
 * @desc    Update field order
 * @route   PUT /api/v1/dynamic-fields/reorder
 * @access  Private/Admin
 */
const reorderFields = asyncHandler(async(req, res) => {
    const { fieldOrders } = req.body; // Array of { fieldId, order }

    if (!Array.isArray(fieldOrders)) {
        return res.status(400).json({
            success: false,
            message: 'fieldOrders array is required'
        });
    }

    // Update each field's order
    const updatePromises = fieldOrders.map(({ fieldId, order }) =>
        DynamicField.findOneAndUpdate({ fieldId }, { order }, { new: true })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
        success: true,
        message: 'Field order updated successfully'
    });
});

/**
 * @desc    Get field statistics
 * @route   GET /api/v1/dynamic-fields/stats
 * @access  Private/Admin
 */
const getFieldStats = asyncHandler(async(req, res) => {
    const stats = await DynamicField.aggregate([{
        $group: {
            _id: '$status',
            count: { $sum: 1 }
        }
    }]);

    const typeStats = await DynamicField.aggregate([{
            $match: { status: 'active' }
        },
        {
            $group: {
                _id: '$fieldType',
                count: { $sum: 1 }
            }
        }
    ]);

    const categoryStats = await DynamicField.aggregate([{
            $match: { status: 'active' }
        },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            byStatus: stats,
            byType: typeStats,
            byCategory: categoryStats,
            total: await DynamicField.countDocuments()
        }
    });
});

module.exports = {
    getAllDynamicFields,
    getDynamicFieldById,
    getDynamicFieldByFieldId,
    createDynamicField,
    updateDynamicField,
    deleteDynamicField,
    getFieldsForForm,
    getFieldsForMobile,
    bulkCreateDynamicFields,
    reorderFields,
    getFieldStats
};