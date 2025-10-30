const Voter = require('../models/voter');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Search voters with advance search parameters
// @route   POST /api/v1/voters/search
// @access  Private
const searchVoters = asyncHandler(async(req, res) => {
    const {
        mobileNo,
        Number: epicId,
        age,
        partNo,
        serialNo,
        Name: voterFirstName,
        'Father Name': voterLastName,
        relationFirstName,
        relationLastName,
        page = 1,
        limit = 10
    } = req.body;

    // Build search query
    const searchQuery = {};

    // Add search conditions based on provided parameters
    if (mobileNo && mobileNo.trim()) {
        searchQuery['Mobile No'] = { $regex: mobileNo.trim(), $options: 'i' };
    }

    if (epicId && epicId.trim()) {
        // Assuming EPIC ID might be stored in a field like 'Number' or similar
        searchQuery.Number = { $regex: epicId.trim(), $options: 'i' };
    }

    if (age && age.trim()) {
        const ageNum = parseInt(age.trim());
        if (!isNaN(ageNum)) {
            searchQuery.age = ageNum;
        }
    }

    if (partNo) {
        const partNum = parseInt(partNo.toString());
        if (!isNaN(partNum)) {
            // Support both field variants in DB: 'Part_no' and 'part_no'
            searchQuery.$or = [
                { Part_no: partNum },
                { part_no: partNum }
            ];
        }
    }

    if (serialNo && serialNo.trim()) {
        const serialNum = parseInt(serialNo.trim());
        if (!isNaN(serialNum)) {
            searchQuery.sr = serialNum;
        }
    }

    if (voterFirstName && voterFirstName.trim()) {
        searchQuery.Name = { $regex: voterFirstName.trim(), $options: 'i' };
    }

    if (voterLastName && voterLastName.trim()) {
        // If we have both first and last name, combine them
        if (voterFirstName && voterFirstName.trim()) {
            const fullName = `${voterFirstName.trim()} ${voterLastName.trim()}`;
            searchQuery.Name = { $regex: fullName, $options: 'i' };
        } else {
            searchQuery.Name = { $regex: voterLastName.trim(), $options: 'i' };
        }
    }

    if (relationFirstName && relationFirstName.trim()) {
        searchQuery['Father Name'] = { $regex: relationFirstName.trim(), $options: 'i' };
    }

    if (relationLastName && relationLastName.trim()) {
        // If we have both relation first and last name, combine them
        if (relationFirstName && relationFirstName.trim()) {
            const fullRelationName = `${relationFirstName.trim()} ${relationLastName.trim()}`;
            searchQuery['Father Name'] = { $regex: fullRelationName, $options: 'i' };
        } else {
            searchQuery['Father Name'] = { $regex: relationLastName.trim(), $options: 'i' };
        }
    }

    // If no search parameters provided, return empty result
    if (Object.keys(searchQuery).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide at least one search parameter'
        });
    }

    try {
        // Calculate pagination
        const skip = (page - 1) * limit;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Get total count for pagination
        const totalCount = await Voter.countDocuments(searchQuery);

        // Search voters with pagination
        const voters = await Voter.find(searchQuery)
            .sort({ sr: 1 }) // Sort by serial number
            .skip(skip)
            .limit(limitNum)
            .lean(); // Use lean() for better performance

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNext = pageNum < totalPages;
        const hasPrev = pageNum > 1;

        res.status(200).json({
            success: true,
            data: voters,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                hasNext,
                hasPrev,
                limit: limitNum
            },
            message: `Found ${totalCount} voters matching your search criteria`
        });

    } catch (error) {
        console.error('Voter search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching voters',
            error: error.message
        });
    }
});

// @desc    Get voter by ID
// @route   GET /api/v1/voters/:id
// @access  Private
const getVoterById = asyncHandler(async(req, res) => {
    const voter = await Voter.findById(req.params.id);

    if (!voter) {
        return res.status(404).json({
            success: false,
            message: 'Voter not found'
        });
    }

    res.status(200).json({
        success: true,
        data: voter
    });
});

// @desc    Get voters by part number
// @route   GET /api/v1/voters/by-part/:partNumber
// @access  Private
const getVotersByPart = asyncHandler(async(req, res) => {
    const { partNumber } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    try {
        let query = {};

        // Check if partNumber contains "All" (e.g., "119 -All")
        if (partNumber.includes('All') || partNumber.toLowerCase() === 'all') {
            // Return all voters without part number filter
            console.log(`[getVotersByPart] Fetching all voters (no part filter)`);
            query = {}; // Empty query to get all voters
        } else {
            // Parse part number - handle both "119 -001" and "001" formats
            // If hyphen exists, extract the number after it, otherwise use the whole number
            const parts = partNumber.toString().split('-');
            const partNum = parseInt(parts.length > 1 ? parts[1] : parts[0]);

            if (isNaN(partNum)) {
                console.error(`[getVotersByPart] Invalid part number: ${partNumber}`);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid part number format',
                    message: `Cannot parse part number: ${partNumber}`
                });
            }

            console.log(`[getVotersByPart] Searching for part number: ${partNumber} -> parsed as: ${partNum}`);
            query = { $or: [{ Part_no: partNum }, { part_no: partNum }] };
        }

        const voters = await Voter.find(query)
            .sort({ sr: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Voter.countDocuments(query);

        console.log(`[getVotersByPart] Found ${total} voters, returning ${voters.length} voters for page ${page}`);

        res.json({
            success: true,
            data: voters,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('[getVotersByPart] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch voters by part number',
            message: error.message
        });
    }
});

// Get gender statistics for a specific part
const getPartGenderStats = asyncHandler(async(req, res) => {
    const { partNumber } = req.params;

    try {
        let matchStage = {};

        // Check if partNumber contains "All"
        if (partNumber.includes('All') || partNumber.toLowerCase() === 'all') {
            // Get stats for all voters
            console.log(`[getPartGenderStats] Fetching stats for all voters`);
            matchStage = {}; // Empty match to get all voters
        } else {
            const partNum = parseInt(partNumber);
            if (isNaN(partNum)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid part number format'
                });
            }
            matchStage = { $or: [{ Part_no: partNum }, { part_no: partNum }] };
        }

        const stats = await Voter.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    male: { $sum: { $cond: [{ $eq: ['$sex', 'Male'] }, 1, 0] } },
                    female: { $sum: { $cond: [{ $eq: ['$sex', 'Female'] }, 1, 0] } },
                    other: { $sum: { $cond: [{ $not: { $in: ['$sex', ['Male', 'Female']] } }, 1, 0] } }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                success: true,
                stats: { total: 0, male: 0, female: 0, other: 0 }
            });
        }

        res.json({
            success: true,
            stats: stats[0]
        });
    } catch (error) {
        console.error('[getPartGenderStats] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch gender statistics'
        });
    }
});

// @desc    Get unique part names from votersdata collection
// @route   GET /api/v1/voters/part-names
// @access  Private
const getPartNames = asyncHandler(async(req, res) => {
    try {
        const partNames = await Voter.aggregate([{
                // Normalize possible field names into one key for grouping
                $addFields: {
                    part_no_normalized: { $ifNull: ['$Part_no', '$part_no'] }
                }
            },
            {
                $group: {
                    _id: '$part_no_normalized',
                    partName: { $first: '$Part Name' },
                    partNameTamil: { $first: '$Part Name Tamil' }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    partNumber: '$_id',
                    partName: 1,
                    partNameTamil: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: partNames,
            count: partNames.length
        });
    } catch (error) {
        console.error('Error fetching part names:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching part names',
            error: error.message
        });
    }
});

// @desc    Get voters by age range
// @route   GET /api/v1/voters/by-age-range?minAge=60&maxAge=120
// @access  Private
const getVotersByAgeRange = asyncHandler(async(req, res) => {
    const minAge = parseInt(req.query.minAge) || 60;
    const maxAge = parseInt(req.query.maxAge) || 120;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;

    try {
        console.log('[getVotersByAgeRange] params', { minAge, maxAge, page, limit });
        const query = { age: { $gte: minAge, $lte: maxAge } };
        const total = await Voter.countDocuments(query);
        const voters = await Voter.find(query)
            .sort({ sr: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        console.log('[getVotersByAgeRange] total found', total, 'returning', voters.length);

        res.status(200).json({
            success: true,
            voters,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch voters by age range'
        });
    }
});

// @desc    Create a new voter
// @route   POST /api/v1/voters
// @access  Private
const createVoter = asyncHandler(async(req, res) => {
    const {
        voterId,
        fullName,
        age,
        gender,
        phoneNumber,
        address,
        familyId,
        specialCategories,
        partNumber
    } = req.body;

    // Validate required fields
    if (!voterId || !fullName || !age || !gender || !address || !partNumber) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields: voterId, fullName, age, gender, address, partNumber'
        });
    }

    try {
        // Check if voter with this ID already exists
        const existingVoter = await Voter.findOne({ Number: voterId });
        if (existingVoter) {
            return res.status(400).json({
                success: false,
                message: 'A voter with this ID already exists'
            });
        }

        // Get the highest serial number in this part to assign a new one
        const lastVoter = await Voter.findOne({
            $or: [{ Part_no: parseInt(partNumber) }, { part_no: parseInt(partNumber) }]
        }).sort({ sr: -1 }).limit(1);

        const newSerialNumber = lastVoter ? (lastVoter.sr || 0) + 1 : 1;

        // Parse address to extract door number if possible
        const doorNoMatch = address.match(/\d+/);
        const doorNo = doorNoMatch ? parseInt(doorNoMatch[0]) : null;

        // Create voter object
        const voterData = {
            sr: newSerialNumber,
            Name: fullName,
            Number: voterId,
            sex: gender,
            age: parseInt(age),
            Part_no: parseInt(partNumber),
            'Mobile No': phoneNumber || '',
            Door_No: doorNo,
            // Store special categories and family ID as custom fields
            familyId: familyId || null,
            specialCategories: specialCategories || [],
            address: address
        };

        const voter = await Voter.create(voterData);

        res.status(201).json({
            success: true,
            data: voter,
            message: 'Voter created successfully'
        });

    } catch (error) {
        console.error('Create voter error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating voter',
            error: error.message
        });
    }
});

// @desc    Mark voter as verified
// @route   PUT /api/v1/voters/:id/verify
// @access  Private
const markVoterAsVerified = asyncHandler(async(req, res) => {
    const { id } = req.params;

    try {
        // Find voter by ID or EPIC number
        let voter;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a MongoDB ObjectId
            voter = await Voter.findById(id);
        } else {
            // It's an EPIC number
            voter = await Voter.findOne({ Number: id });
        }

        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found'
            });
        }

        // Update verification status
        voter.verified = true;
        voter.status = 'verified';
        voter.verifiedAt = new Date();
        if (req.user && req.user._id) {
            voter.verifiedBy = req.user._id;
        }

        await voter.save();

        res.status(200).json({
            success: true,
            data: voter,
            message: 'Voter marked as verified successfully'
        });

    } catch (error) {
        console.error('Mark voter as verified error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking voter as verified',
            error: error.message
        });
    }
});

// @desc    Get voter by EPIC number
// @route   GET /api/v1/voters/epic/:epicNumber
// @access  Private
const getVoterByEpicNumber = asyncHandler(async(req, res) => {
    const { epicNumber } = req.params;

    try {
        const voter = await Voter.findOne({ Number: epicNumber });

        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found with this EPIC number'
            });
        }

        res.status(200).json({
            success: true,
            data: voter
        });
    } catch (error) {
        console.error('Get voter by EPIC error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching voter by EPIC number',
            error: error.message
        });
    }
});

// @desc    Update voter additional information
// @route   PUT /api/v1/voters/:id/info
// @access  Private
const updateVoterInfo = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Find voter by ID or EPIC number
        let voter;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a MongoDB ObjectId
            voter = await Voter.findById(id);
        } else {
            // It's an EPIC number
            voter = await Voter.findOne({ Number: id });
        }

        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found'
            });
        }

        // Update voter information
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && updateData[key] !== null) {
                voter[key] = updateData[key];
            }
        });

        await voter.save();

        res.status(200).json({
            success: true,
            data: voter,
            message: 'Voter information updated successfully'
        });

    } catch (error) {
        console.error('Update voter info error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating voter information',
            error: error.message
        });
    }
});

module.exports = {
    searchVoters,
    getVoterById,
    getVotersByPart,
    getPartGenderStats,
    getPartNames,
    getVotersByAgeRange,
    createVoter,
    markVoterAsVerified,
    getVoterByEpicNumber,
    updateVoterInfo
};