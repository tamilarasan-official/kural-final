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
        limit = 10
    } = req.body;

    // Build search query
    const searchQuery = {};

    // Add search conditions based on provided parameters
    if (mobileNo && mobileNo.trim()) {
        searchQuery.$or = searchQuery.$or || [];
        searchQuery.$or.push({ 'Mobile No': { $regex: mobileNo.trim(), $options: 'i' } }, { 'mobile': { $regex: mobileNo.trim(), $options: 'i' } });
    }

    if (epicId && epicId.trim()) {
        // Support both legacy 'Number' field and new 'voterID' field
        searchQuery.$or = searchQuery.$or || [];
        searchQuery.$or.push({ Number: { $regex: epicId.trim(), $options: 'i' } }, { voterID: { $regex: epicId.trim(), $options: 'i' } });
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
            // Support both field variants in DB: 'Part_no' and 'boothno'
            searchQuery.$or = searchQuery.$or || [];
            searchQuery.$or.push({ Part_no: partNum }, { boothno: partNum });
        }
    }

    if (serialNo && serialNo.trim()) {
        const serialNum = parseInt(serialNo.trim());
        if (!isNaN(serialNum)) {
            searchQuery.sr = serialNum;
        }
    }

    if (voterFirstName && voterFirstName.trim()) {
        // Support both legacy 'Name' field and new 'name.english'/'name.tamil' fields
        searchQuery.$or = searchQuery.$or || [];
        searchQuery.$or.push({ Name: { $regex: voterFirstName.trim(), $options: 'i' } }, { 'name.english': { $regex: voterFirstName.trim(), $options: 'i' } }, { 'name.tamil': { $regex: voterFirstName.trim(), $options: 'i' } });
    }

    if (voterLastName && voterLastName.trim()) {
        // If we have both first and last name, combine them
        if (voterFirstName && voterFirstName.trim()) {
            const fullName = `${voterFirstName.trim()} ${voterLastName.trim()}`;
            searchQuery.$or = searchQuery.$or || [];
            searchQuery.$or.push({ Name: { $regex: fullName, $options: 'i' } }, { 'name.english': { $regex: fullName, $options: 'i' } }, { 'name.tamil': { $regex: fullName, $options: 'i' } });
        } else {
            searchQuery.$or = searchQuery.$or || [];
            searchQuery.$or.push({ Name: { $regex: voterLastName.trim(), $options: 'i' } }, { 'name.english': { $regex: voterLastName.trim(), $options: 'i' } }, { 'name.tamil': { $regex: voterLastName.trim(), $options: 'i' } });
        }
    }

    if (relationFirstName && relationFirstName.trim()) {
        // Support both legacy 'Father Name' field and new 'fathername' field
        searchQuery.$or = searchQuery.$or || [];
        searchQuery.$or.push({ 'Father Name': { $regex: relationFirstName.trim(), $options: 'i' } }, { 'fathername': { $regex: relationFirstName.trim(), $options: 'i' } });
    }

    if (relationLastName && relationLastName.trim()) {
        // If we have both relation first and last name, combine them
        if (relationFirstName && relationFirstName.trim()) {
            const fullRelationName = `${relationFirstName.trim()} ${relationLastName.trim()}`;
            searchQuery.$or = searchQuery.$or || [];
            searchQuery.$or.push({ 'Father Name': { $regex: fullRelationName, $options: 'i' } }, { 'fathername': { $regex: fullRelationName, $options: 'i' } });
        } else {
            searchQuery.$or = searchQuery.$or || [];
            searchQuery.$or.push({ 'Father Name': { $regex: relationLastName.trim(), $options: 'i' } }, { 'fathername': { $regex: relationLastName.trim(), $options: 'i' } });
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

    // Helper to extract value from nested objects
    const extractValue = (field) => {
        if (field && typeof field === 'object' && 'value' in field) {
            return field.value;
        }
        return field;
    };

    // Normalize voter name
    let voterName = 'Unknown';
    if (voter.name) {
        // Check for nested structure: name.value.english
        if (voter.name.value && typeof voter.name.value === 'object' && voter.name.value.english) {
            voterName = voter.name.value.english;
        }
        // Check for direct object: name.english
        else if (typeof voter.name === 'object' && voter.name.english) {
            voterName = voter.name.english;
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
        ...voter.toObject(),
        name: voterName,
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
            query = { $or: [{ Part_no: partNum }, { boothno: partNum }] };
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

// Get voters by booth ID and ACI ID
const getVotersByBoothId = asyncHandler(async(req, res) => {
    const { boothId, aciId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    if (!aciId || !boothId) {
        return res.status(400).json({
            success: false,
            message: 'Both aciId and boothId are required.'
        });
    }

    try {
        console.log(`[getVotersByBoothId] Fetching voters for aci_id: ${aciId}, booth_id: ${boothId}, page: ${page}, limit: ${limit}`);

        // Convert aci_id to number for DB query (it's stored as Number in schema)
        const aciIdNumber = Number(aciId);

        // Query voters where both aci_id and booth_id match
        // Try both number and string for aci_id in case of data inconsistency
        const query = {
            $or: [
                { aci_id: aciIdNumber, booth_id: boothId },
                { aci_id: aciId, booth_id: boothId }
            ]
        };

        console.log(`[getVotersByBoothId] Query:`, JSON.stringify(query, null, 2));

        const [voters, totalCount] = await Promise.all([
            Voter.find(query)
            .select('sr name Name voterID DOB address emailid aadhar PAN religion caste subcaste boothno booth_id aci_id aci_name age gender mobile sex Part_no verified status verifiedAt verifiedBy surveyed Door_No doornumber fathername Number')
            .sort({ sr: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
            Voter.countDocuments(query)
        ]);

        console.log(`[getVotersByBoothId] Found ${voters.length} voters out of ${totalCount} total for aci_id ${aciId}, booth_id ${boothId}`);

        // Debug: Log first voter raw data to see actual field names
        if (voters.length > 0) {
            console.log('[getVotersByBoothId] First voter raw data:', JSON.stringify(voters[0], null, 2));
            console.log('[getVotersByBoothId] First voter name field:', voters[0].name);
            console.log('[getVotersByBoothId] First voter Name field:', voters[0].Name);
        }

        // Helper to extract value from object or return primitive
        const extractValue = (field) => {
            if (field && typeof field === 'object' && 'value' in field) {
                return field.value;
            }
            return field;
        };

        // Normalize voter data
        const normalizedVoters = voters.map(voter => {
            // Handle name nested object structure {value: {english, tamil}, visible}
            let voterName = 'Unknown';
            if (voter.name) {
                // Check for nested structure: name.value.english
                if (voter.name.value && typeof voter.name.value === 'object' && voter.name.value.english) {
                    voterName = voter.name.value.english;
                }
                // Check for direct object: name.english
                else if (typeof voter.name === 'object' && voter.name.english) {
                    voterName = voter.name.english;
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
                name: voterName,
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
            matchStage = { $or: [{ Part_no: partNum }, { boothno: partNum }] };
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
    console.log('📥 Creating voter with body:', JSON.stringify(req.body, null, 2));

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
        // Check if voter with this ID already exists
        const existingVoter = await Voter.findOne({
            $or: [
                { Number: finalVoterId },
                { voterID: finalVoterId }
            ]
        });

        if (existingVoter) {
            return res.status(400).json({
                success: false,
                message: 'A voter with this ID already exists'
            });
        }

        // Get the highest serial number in this booth to assign a new one
        // Extract numeric part from booth ID for querying
        const boothNumeric = parseInt(finalBoothId.replace(/[^0-9]/g, '')) || parseInt(finalBoothId) || 0;

        const lastVoter = await Voter.findOne({
            $or: [
                { Part_no: boothNumeric },
                { boothno: boothNumeric },
                { booth_id: finalBoothId }
            ]
        }).sort({ sr: -1 }).limit(1);

        const newSerialNumber = lastVoter ? (lastVoter.sr || 0) + 1 : 1;

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
            status: 'pending'
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
                // If updating voterID, also update Number field for backward compatibility
                if (key === 'voterID') {
                    voter.Number = updateData[key];
                }
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
    getVotersByBoothId,
    getPartGenderStats,
    getPartNames,
    getVotersByAgeRange,
    createVoter,
    markVoterAsVerified,
    getVoterByEpicNumber,
    updateVoterInfo
};