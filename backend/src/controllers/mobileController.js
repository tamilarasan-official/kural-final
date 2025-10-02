const MobileVoter = require('../models/mobileVoter');
const { asyncHandler } = require('../utils/asyncHandler');

// List mobile voters with pagination and optional search
const listMobileVoters = asyncHandler(async (req, res) => {
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
    MobileVoter.find(filter).skip((page - 1) * limit).limit(limit),
    MobileVoter.countDocuments(filter),
  ]);

  // Calculate gender summary - handle both root level and nested 's' object
  const maleCount = await MobileVoter.countDocuments({ $or: [{ sex: 'Male' }, { 's.sex': 'Male' }] });
  const femaleCount = await MobileVoter.countDocuments({ $or: [{ sex: 'Female' }, { 's.sex': 'Female' }] });
  const otherCount = await MobileVoter.countDocuments({ $or: [{ sex: 'Third' }, { 's.sex': 'Third' }] });

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

module.exports = { listMobileVoters };
