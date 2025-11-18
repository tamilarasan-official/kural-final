const MasterDataSection = require('../models/MasterDataSection');
const MasterDataResponse = require('../models/MasterDataResponse');
const Voter = require('../models/Voter');

/**
 * @desc    Get all active master data sections (for booth agents)
 * @route   GET /api/v1/master-data/sections
 * @access  Private (Booth Agent)
 */
exports.getSections = async(req, res) => {
    try {
        // Get user's aci_id from authenticated user
        const userAciId = req.user.aci_id;

        // Build query to filter sections by aci_id or global sections (no aci_id restriction)
        const query = {
            $and: [
                { isVisible: true }, // Changed from isActive to isVisible to match your schema
                {
                    $or: [
                        { aci_id: { $exists: false } }, // Global sections (no aci_id specified)
                        { aci_id: { $size: 0 } }, // Empty array (global sections)
                        { aci_id: userAciId }, // Sections assigned to this aci_id
                    ]
                }
            ]
        };

        const sections = await MasterDataSection.find(query)
            .select('-createdBy -updatedBy -__v')
            .sort({ order: 1, name: 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: sections.length,
            data: sections,
        });
    } catch (error) {
        console.error('Error fetching master data sections:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching master data sections',
            error: error.message,
        });
    }
};

/**
 * @desc    Get a single section by ID
 * @route   GET /api/v1/master-data/sections/:id
 * @access  Private (Booth Agent)
 */
exports.getSectionById = async(req, res) => {
    try {
        const { id } = req.params;

        const section = await MasterDataSection.findById(id)
            .select('-createdBy -updatedBy -__v')
            .lean();

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found',
            });
        }

        res.status(200).json({
            success: true,
            data: section,
        });
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching section',
            error: error.message,
        });
    }
};

/**
 * @desc    Submit master data response for a voter
 * @route   POST /api/v1/master-data/responses
 * @access  Private (Booth Agent)
 */
exports.submitResponse = async(req, res) => {
    try {
        const {
            voterId,
            sectionId,
            responses,
            boothId,
            aciId,
            deviceInfo,
            location,
        } = req.body;

        // Validate required fields
        if (!voterId || !sectionId || !responses) {
            return res.status(400).json({
                success: false,
                message: 'Voter ID, Section ID, and responses are required',
            });
        }

        // Verify voter exists
        const voter = await Voter.findById(voterId).lean();
        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found',
            });
        }

        // Verify section exists
        const section = await MasterDataSection.findById(sectionId).lean();
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found',
            });
        }

        // Check if response already exists (update if exists, create if not)
        const existingResponse = await MasterDataResponse.findOne({
            voterId,
            sectionId,
        });

        let response;

        if (existingResponse) {
            // Update existing response
            existingResponse.responses = new Map(Object.entries(responses));
            existingResponse.submittedBy = req.user._id;
            existingResponse.submittedByName = req.user.name || req.user.username;
            existingResponse.boothId = boothId || req.user.booth_id;
            existingResponse.aciId = aciId || req.user.aci_id;
            existingResponse.deviceInfo = deviceInfo;
            // Only set location if coordinates are provided
            if (location && location.coordinates && location.coordinates.length === 2) {
                existingResponse.location = location;
            }
            existingResponse.submittedAt = new Date();

            response = await existingResponse.save();
        } else {
            // Create new response
            const responseData = {
                voterId,
                voterEpicNo: voter.voterID || voter.Number,
                sectionId,
                sectionName: section.name,
                responses: new Map(Object.entries(responses)),
                submittedBy: req.user._id,
                submittedByName: req.user.name || req.user.username,
                boothId: boothId || req.user.booth_id,
                aciId: aciId || req.user.aci_id,
                deviceInfo,
                submittedAt: new Date(),
                isComplete: true,
            };

            // Only add location if coordinates are provided
            if (location && location.coordinates && location.coordinates.length === 2) {
                responseData.location = location;
            }

            response = await MasterDataResponse.create(responseData);
        }

        res.status(201).json({
            success: true,
            message: existingResponse ? 'Response updated successfully' : 'Response submitted successfully',
            data: response,
        });
    } catch (error) {
        console.error('Error submitting master data response:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Response already exists for this voter and section',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error submitting response',
            error: error.message,
        });
    }
};

/**
 * @desc    Get responses for a specific voter
 * @route   GET /api/v1/master-data/responses/:voterId
 * @access  Private (Booth Agent)
 */
exports.getResponsesByVoter = async(req, res) => {
    try {
        const { voterId } = req.params;

        const responses = await MasterDataResponse.find({ voterId })
            .populate('sectionId', 'sectionName sectionNameTamil order icon')
            .select('-__v')
            .sort({ 'sectionId.order': 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: responses.length,
            data: responses,
        });
    } catch (error) {
        console.error('Error fetching voter responses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching voter responses',
            error: error.message,
        });
    }
};

/**
 * @desc    Check if voter has completed all sections
 * @route   GET /api/v1/master-data/completion/:voterId
 * @access  Private (Booth Agent)
 */
exports.getCompletionStatus = async(req, res) => {
    try {
        const { voterId } = req.params;

        // Get all active sections
        const allSections = await MasterDataSection.find({ isActive: true })
            .select('_id sectionName')
            .lean();

        // Get completed sections for this voter
        const completedResponses = await MasterDataResponse.find({
                voterId,
                isComplete: true,
            })
            .select('sectionId')
            .lean();

        const completedSectionIds = completedResponses.map(r => r.sectionId.toString());

        // Calculate completion status
        const totalSections = allSections.length;
        const completedSections = completedSectionIds.length;
        const isFullyComplete = totalSections === completedSections;

        // Build incomplete sections list
        const incompleteSections = allSections.filter(
            section => !completedSectionIds.includes(section._id.toString())
        );

        res.status(200).json({
            success: true,
            data: {
                totalSections,
                completedSections,
                completionPercentage: totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0,
                isFullyComplete,
                incompleteSections,
            },
        });
    } catch (error) {
        console.error('Error checking completion status:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking completion status',
            error: error.message,
        });
    }
};