const Age60AboveVoter = require('../models/age60AboveVoter');
const { asyncHandler } = require('../utils/asyncHandler');

// List age 60+ voters with pagination and optional search
const listAge60AboveVoters = asyncHandler(async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const q = (req.query.q || '').trim();

    const filter = {};
    if (q) {
        filter.$or = [
            { 'Name': { $regex: q, $options: 'i' } },
            { 'Number': { $regex: q, $options: 'i' } },
            { 's.Name': { $regex: q, $options: 'i' } },
            { 's.Number': { $regex: q, $options: 'i' } },
        ];
    }

    const [items, total] = await Promise.all([
        Age60AboveVoter.find(filter).skip((page - 1) * limit).limit(limit),
        Age60AboveVoter.countDocuments(filter),
    ]);

    // Robust gender summary: normalize 'sex' value (case-insensitive) and consider nested 's.sex'
    // Use aggregation to avoid missing variants like 'male', 'Male', 'M', etc.
    const agg = await Age60AboveVoter.aggregate([{
            $project: {
                sexVal: {
                    $toLower: {
                        $ifNull: [
                            '$sex',
                            { $ifNull: ['$s.sex', null] }
                        ]
                    }
                }
            }
        },
        { $group: { _id: '$sexVal', count: { $sum: 1 } } }
    ]);

    let maleCount = 0,
        femaleCount = 0,
        otherCount = 0;
    for (const row of agg) {
        const id = row._id;
        if (!id) continue;
        if (id === 'male' || id === 'm') maleCount = row.count;
        else if (id === 'female' || id === 'f') femaleCount = row.count;
        else if (id === 'third' || id === 'other' || id === 't') otherCount += row.count;
        else otherCount += row.count; // any unrecognized values count as 'other'
    }

    res.json({
        success: true,
        data: items,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            limit,
            hasNext: page * limit < total,
            hasPrev: page > 1
        },
        genderSummary: {
            male: maleCount,
            female: femaleCount,
            other: otherCount,
            total: total
        }
    });
});

module.exports = { listAge60AboveVoters };