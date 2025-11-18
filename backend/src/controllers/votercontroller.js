const Voter = require('../models/Voter');
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
        limit = 50
    } = req.body;

    // Limit max results to 50 for performance
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    // Build optimized search query
    const searchQuery = {};
    const orConditions = [];

    // Mobile search
    if (mobileNo && mobileNo.trim()) {
        const mobileTrimmed = mobileNo.trim();
        orConditions.push({ 'Mobile No': { $regex: mobileTrimmed, $options: 'i' } }, { mobile: { $regex: mobileTrimmed, $options: 'i' } });
    }

    // EPIC ID search (use text index if exact match)
    if (epicId && epicId.trim()) {
        const epicTrimmed = epicId.trim();
        orConditions.push({ Number: epicTrimmed }, { voterID: epicTrimmed }, { Number: { $regex: epicTrimmed, $options: 'i' } }, { voterID: { $regex: epicTrimmed, $options: 'i' } });
    }

    // Age exact match
    if (age && age.trim()) {
        const ageNum = parseInt(age.trim());
        if (!isNaN(ageNum)) {
            searchQuery.age = ageNum;
        }
    }

    // Part number exact match
    if (partNo) {
        const partNum = parseInt(partNo.toString());
        if (!isNaN(partNum)) {
            searchQuery.$or = searchQuery.$or || [];
            searchQuery.$or.push({ Part_no: partNum }, { boothno: partNum });
        }
    }

    // Serial number exact match
    if (serialNo && serialNo.trim()) {
        const serialNum = parseInt(serialNo.trim());
        if (!isNaN(serialNum)) {
            searchQuery.sr = serialNum;
        }
    }

    // Name search
    if (voterFirstName && voterFirstName.trim()) {
        const nameTrimmed = voterFirstName.trim();
        const fullName = voterLastName && voterLastName.trim() ?
            `${nameTrimmed} ${voterLastName.trim()}` :
            nameTrimmed;

        orConditions.push({ Name: { $regex: fullName, $options: 'i' } }, { 'name.english': { $regex: fullName, $options: 'i' } }, { 'name.tamil': { $regex: fullName, $options: 'i' } });
    }

    // Relation/Father name search
    if (relationFirstName && relationFirstName.trim()) {
        const relationTrimmed = relationFirstName.trim();
        const fullRelation = relationLastName && relationLastName.trim() ?
            `${relationTrimmed} ${relationLastName.trim()}` :
            relationTrimmed;

        orConditions.push({ 'Father Name': { $regex: fullRelation, $options: 'i' } }, { fathername: { $regex: fullRelation, $options: 'i' } });
    }

    // Add OR conditions if any exist
    if (orConditions.length > 0) {
        searchQuery.$or = orConditions;
    }

    // Validate query
    if (Object.keys(searchQuery).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide at least one search parameter'
        });
    }

    try {
        // Execute count and find in parallel
        const [totalCount, voters] = await Promise.all([
            Voter.countDocuments(searchQuery),
            Voter.find(searchQuery)
            .select('sr name Name voterID Number age gender sex mobile booth_id aci_id')
            .sort({ sr: 1 })
            .skip(skip)
            .limit(limitNum)
            .lean()
        ]);

        const totalPages = Math.ceil(totalCount / limitNum);

        res.status(200).json({
            success: true,
            data: voters,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1,
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
    const voter = await Voter.findById(req.params.id).lean();

    if (!voter) {
        return res.status(404).json({
            success: false,
            message: 'Voter not found'
        });
    }

    // Helper to extract value from nested objects
    const extractValue = (field) => {
        if (field && typeof field === 'object' && 'value' in field) {
            return field.value;
        }
        return field;
    };

    // Normalize voter name
    let voterName = 'Unknown';
    let voterNameTamil = '';

    if (voter.name) {
        // Check for nested structure: name.value.english
        if (voter.name.value && typeof voter.name.value === 'object' && voter.name.value.english) {
            voterName = voter.name.value.english;
            voterNameTamil = voter.name.value.tamil || '';
        }
        // Check for direct object: name.english
        else if (typeof voter.name === 'object' && voter.name.english) {
            voterName = voter.name.english;
            voterNameTamil = voter.name.tamil || '';
        }
        // Check for plain string
        else if (typeof voter.name === 'string') {
            voterName = voter.name;
        }
    }
    // Fallback to uppercase Name field
    else if (voter.Name) {
        voterName = extractValue(voter.Name);
    }

    // Normalize voter data
    const normalizedVoter = {
        ...voter,
        name: {
            english: voterName,
            tamil: voterNameTamil
        },
        voterID: extractValue(voter.voterID) || extractValue(voter.Number) || '',
        age: extractValue(voter.age) || 0,
        gender: extractValue(voter.gender) || extractValue(voter.sex) || '',
        mobile: extractValue(voter.mobile) || '',
        address: extractValue(voter.address) || '',
        fathername: extractValue(voter.fathername) || '',
        guardian: extractValue(voter.guardian) || '',
        DOB: extractValue(voter.DOB) || '',
        emailid: extractValue(voter.emailid) || '',
        aadhar: extractValue(voter.aadhar) || '',
        PAN: extractValue(voter.PAN) || '',
        religion: extractValue(voter.religion) || '',
        caste: extractValue(voter.caste) || '',
        subcaste: extractValue(voter.subcaste) || '',
        Door_No: extractValue(voter.Door_No) || extractValue(voter.doornumber) || ''
    };

    res.status(200).json({
        success: true,
        data: normalizedVoter
    });
});

// @desc    Get voters by part number
// @route   GET /api/v1/voters/by-part/:partNumber
// @access  Private
const getVotersByPart = asyncHandler(async(req, res) => {
    const { partNumber } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 50);
    const skip = (page - 1) * limit;

    try {
        let query = {};

        // Check if partNumber contains "All"
        if (partNumber.includes('All') || partNumber.toLowerCase() === 'all') {
            query = {};
        } else {
            const parts = partNumber.toString().split('-');
            const partNum = parseInt(parts.length > 1 ? parts[1] : parts[0]);

            if (isNaN(partNum)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid part number format',
                    message: `Cannot parse part number: ${partNumber}`
                });
            }

            query = { $or: [{ Part_no: partNum }, { boothno: partNum }] };
        }

        // Execute count and find in parallel
        const [total, voters] = await Promise.all([
            Voter.countDocuments(query),
            Voter.find(query)
            .select('sr name Name voterID Number age gender sex mobile booth_id aci_id Part_no boothno')
            .sort({ sr: 1 })
            .skip(skip)
            .limit(limit)
            .lean()
        ]);

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

// Get voters by booth ID and ACI ID
const getVotersByBoothId = asyncHandler(async(req, res) => {
    const { boothId, aciId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    if (!aciId || !boothId) {
        return res.status(400).json({
            success: false,
            message: 'Both aciId and boothId are required.'
        });
    }

    try {
        const aciIdNumber = Number(aciId);

        // Optimized query - prefer number type
        const query = {
            aci_id: aciIdNumber,
            booth_id: boothId
        };

        // Execute count and find in parallel
        const [totalCount, voters] = await Promise.all([
            Voter.countDocuments(query),
            Voter.find(query)
            .select('sr name Name voterID Number DOB address emailid aadhar PAN religion caste subcaste boothno booth_id aci_id aci_name age gender mobile sex Part_no verified status verifiedAt verifiedBy surveyed Door_No doornumber fathername guardian fatherless specialCategories')
            .sort({ sr: 1 })
            .skip(skip)
            .limit(limit)
            .lean()
        ]);

        // Helper to extract value from object or return primitive
        const extractValue = (field) => {
            if (field && typeof field === 'object' && 'value' in field) {
                return field.value;
            }
            return field;
        };

        // Normalize voter data
        const normalizedVoters = voters.map((voter) => {
            // Handle name nested object structure
            let voterName = 'Unknown';
            let voterNameTamil = '';

            if (voter.name) {
                // Check for nested structure: name.value.english
                if (voter.name.value && typeof voter.name.value === 'object' && voter.name.value.english) {
                    voterName = voter.name.value.english;
                    voterNameTamil = voter.name.value.tamil || '';
                }
                // Check for direct object: name.english
                else if (typeof voter.name === 'object' && voter.name.english) {
                    voterName = voter.name.english;
                    voterNameTamil = voter.name.tamil || '';
                }
                // Check for plain string
                else if (typeof voter.name === 'string') {
                    voterName = voter.name;
                }
            }
            // Fallback to uppercase Name field
            else if (voter.Name) {
                voterName = extractValue(voter.Name);
            }

            return {
                ...voter,
                sr: voter.sr || 0,
                name: {
                    english: voterName,
                    tamil: voterNameTamil
                },
                voterID: extractValue(voter.voterID) || extractValue(voter.Number) || '',
                DOB: extractValue(voter.DOB) || '',
                address: extractValue(voter.address) || '',
                emailid: extractValue(voter.emailid) || '',
                aadhar: extractValue(voter.aadhar) || '',
                PAN: extractValue(voter.PAN) || '',
                religion: extractValue(voter.religion) || '',
                caste: extractValue(voter.caste) || '',
                subcaste: extractValue(voter.subcaste) || '',
                boothno: extractValue(voter.boothno) || extractValue(voter.Part_no) || '',
                booth_id: extractValue(voter.booth_id) || '',
                aci_id: extractValue(voter.aci_id) || '',
                aci_name: extractValue(voter.aci_name) || '',
                age: extractValue(voter.age) || 0,
                gender: extractValue(voter.gender) || extractValue(voter.sex) || '',
                mobile: extractValue(voter.mobile) || '',
                Door_No: extractValue(voter.Door_No) || extractValue(voter.doornumber) || '',
                fathername: extractValue(voter.fathername) || '',
                guardian: extractValue(voter.guardian) || '',
                fatherless: Boolean(voter.fatherless),
                verified: voter.verified || false,
                status: voter.status || 'pending',
                verifiedAt: voter.verifiedAt || null,
                verifiedBy: voter.verifiedBy || null,
                specialCategories: voter.specialCategories || []
            };
        });
        res.json({
            success: true,
            voters: normalizedVoters,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalVoters: totalCount,
                limit: limit
            }
        });
    } catch (error) {
        console.error('[getVotersByBoothId] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch voters by booth ID',
            message: error.message
        });
    }
});

// Get gender statistics for a specific part
const getPartGenderStats = asyncHandler(async(req, res) => {
    const { partNumber } = req.params;

    try {
        let matchStage = {};

        if (!(partNumber.includes('All') || partNumber.toLowerCase() === 'all')) {
            const partNum = parseInt(partNumber);
            if (isNaN(partNum)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid part number format'
                });
            }
            matchStage = { $or: [{ Part_no: partNum }, { boothno: partNum }] };
        }

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    male: { $sum: { $cond: [{ $in: ['$sex', ['Male', 'male', 'M']] }, 1, 0] } },
                    female: { $sum: { $cond: [{ $in: ['$sex', ['Female', 'female', 'F']] }, 1, 0] } },
                    other: {
                        $sum: {
                            $cond: [{
                                $and: [
                                    { $ne: ['$sex', null] },
                                    { $not: { $in: ['$sex', ['Male', 'male', 'M', 'Female', 'female', 'F']] } }
                                ]
                            }, 1, 0]
                        }
                    }
                }
            }
        ];

        const stats = await Voter.aggregate(pipeline).exec();

        res.json({
            success: true,
            stats: stats.length > 0 ? stats[0] : { total: 0, male: 0, female: 0, other: 0 }
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
                    boothno_normalized: { $ifNull: ['$Part_no', '$boothno'] }
                }
            },
            {
                $group: {
                    _id: '$boothno_normalized',
                    boothname: { $first: '$Part Name' },
                    boothnameTamil: { $first: '$Part Name Tamil' }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    boothNumber: '$_id',
                    boothname: 1,
                    boothnameTamil: 1,
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
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    try {
        const query = { age: { $gte: minAge, $lte: maxAge } };

        const [total, voters] = await Promise.all([
            Voter.countDocuments(query),
            Voter.find(query)
            .select('sr name Name voterID Number age gender sex mobile booth_id aci_id')
            .sort({ age: -1, sr: 1 })
            .skip(skip)
            .limit(limit)
            .lean()
        ]);

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
            error: 'Failed to fetch voters by age range',
            message: error.message
        });
    }
});

// @desc    Create a new voter
// @route   POST /api/v1/voters
// @access  Private
const createVoter = asyncHandler(async(req, res) => {

    const {
        voterId,
        nameEnglish,
        nameTamil,
        dob,
        address,
        fatherName,
        doorNumber,
        fatherless,
        guardian,
        age,
        gender,
        mobile,
        email,
        aadhar,
        pan,
        religion,
        caste,
        subcaste,
        booth_id,
        boothname,
        boothno,
        aci_id,
        aci_name,
        // Legacy fields for backward compatibility
        fullName,
        phoneNumber,
        familyId,
        specialCategories,
        partNumber,
        boothId
    } = req.body;

    // Use new field names, fall back to legacy if not provided
    const finalVoterId = voterId;
    const finalName = nameEnglish || fullName;
    const finalAge = age;
    const finalGender = gender;
    const finalAddress = address;
    const finalMobile = mobile || phoneNumber;
    const finalBoothId = booth_id || boothId || partNumber;

    // Validate required fields
    if (!finalVoterId || !finalName || !finalAge || !finalGender || !finalAddress || !finalBoothId) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields: voterId, name, age, gender, address, and booth_id'
        });
    }

    try {
        const boothNumeric = parseInt(finalBoothId.replace(/[^0-9]/g, '')) || parseInt(finalBoothId) || 0;

        // Check duplicates and get serial number in parallel
        const [existingVoter, lastVoter] = await Promise.all([
            Voter.findOne({
                $or: [
                    { Number: finalVoterId },
                    { voterID: finalVoterId }
                ]
            }).select('_id').lean(),
            Voter.findOne({
                $or: [
                    { Part_no: boothNumeric },
                    { boothno: boothNumeric },
                    { booth_id: finalBoothId }
                ]
            }).select('sr').sort({ sr: -1 }).limit(1).lean()
        ]);

        if (existingVoter) {
            return res.status(400).json({
                success: false,
                message: 'A voter with this ID already exists'
            });
        }

        const newSerialNumber = lastVoter ? (lastVoter.sr || 0) + 1 : 1;

        // Extract known static fields
        const staticFieldNames = [
            'voterId', 'nameEnglish', 'nameTamil', 'dob', 'address', 'fatherName',
            'doorNumber', 'fatherless', 'guardian', 'age', 'gender', 'mobile', 'email',
            'aadhar', 'pan', 'religion', 'caste', 'subcaste', 'booth_id', 'boothname',
            'boothno', 'aci_id', 'aci_name', 'fullName', 'phoneNumber', 'familyId',
            'specialCategories', 'partNumber', 'boothId'
        ];

        // Extract dynamic fields (anything not in staticFieldNames)
        const dynamicFields = {};
        Object.keys(req.body).forEach(key => {
            if (!staticFieldNames.includes(key)) {
                dynamicFields[key] = req.body[key];
            }
        });

        // Create voter object with all fields
        const voterData = {
            // Serial and identification
            sr: newSerialNumber,
            Number: finalVoterId,
            voterID: finalVoterId,

            // Name fields
            Name: finalName,
            name: {
                english: finalName,
                tamil: nameTamil || ''
            },

            // Demographics
            age: parseInt(finalAge),
            sex: finalGender,
            gender: finalGender,
            DOB: dob ? new Date(dob) : undefined,

            // Family information
            fathername: fatherName || '',
            'Father Name': fatherName || '',
            fatherless: fatherless || false,
            guardian: guardian || '',

            // Contact information
            mobile: finalMobile || '',
            'Mobile No': finalMobile || '',
            emailid: email || '',
            email: email || '',

            // Address information
            address: finalAddress,
            Door_No: doorNumber ? parseInt(doorNumber) : undefined,
            doornumber: doorNumber || '',

            // Identity documents
            aadhar: aadhar || '',
            aadharNumber: aadhar || '',
            PAN: pan || '',
            panNumber: pan || '',

            // Community information
            religion: religion || '',
            caste: caste || '',
            subcaste: subcaste || '',

            // Booth information
            booth_id: finalBoothId,
            Part_no: parseInt(finalBoothId) || 0,
            boothno: (boothno && !isNaN(boothno)) ? parseInt(boothno) : (parseInt(finalBoothId) || 0),
            boothname: boothname || '',
            'Part Name': boothname || '',

            // ACI information
            ac: aci_id || '',
            aci_id: aci_id ? parseInt(aci_id) : undefined,
            aci_name: aci_name || '',

            // Legacy fields for compatibility
            familyId: familyId || null,
            specialCategories: specialCategories || [],

            // Status
            verified: false,
            status: 'pending',

            // Add all dynamic fields
            ...dynamicFields
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
        // Prepare update data
        const updateData = {
            verified: true,
            status: 'verified',
            verifiedAt: new Date()
        };

        if (req.user && req.user._id) {
            updateData.verifiedBy = req.user._id;
        }

        // Find and update voter by ID or EPIC number
        let voter;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a MongoDB ObjectId - use direct update to bypass validation
            voter = await Voter.findByIdAndUpdate(
                id, { $set: updateData }, { new: true, runValidators: false }
            ).lean();
        } else {
            // It's an EPIC number
            voter = await Voter.findOneAndUpdate({ Number: id }, { $set: updateData }, { new: true, runValidators: false }).lean();
        }

        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found'
            });
        }

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
        // If updating voterID, also update Number field for backward compatibility
        if (updateData.voterID) {
            updateData.Number = updateData.voterID;
        }

        // Find and update voter by ID or EPIC number
        let voter;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a MongoDB ObjectId - use direct update to bypass validation
            voter = await Voter.findByIdAndUpdate(
                id, { $set: updateData }, { new: true, runValidators: false, strict: false }
            ).lean();
        } else {
            // It's an EPIC number
            voter = await Voter.findOneAndUpdate({ Number: id }, { $set: updateData }, { new: true, runValidators: false }).lean();
        }

        if (!voter) {
            return res.status(404).json({
                success: false,
                message: 'Voter not found'
            });
        }

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
    getVotersByBoothId,
    getPartGenderStats,
    getPartNames,
    getVotersByAgeRange,
    createVoter,
    markVoterAsVerified,
    getVoterByEpicNumber,
    updateVoterInfo
};