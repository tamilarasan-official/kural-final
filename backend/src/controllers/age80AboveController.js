const Age80AboveVoter = require('../models/age80AboveVoter');
const { asyncHandler } = require('../utils/asyncHandler');

// List age 80+ voters with pagination and optional search
const listAge80AboveVoters = asyncHandler(async (req, res) => {
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
    Age80AboveVoter.find(filter).skip((page - 1) * limit).limit(limit),
    Age80AboveVoter.countDocuments(filter),
  ]);

  // Calculate gender summary - handle both root level and nested 's' object
  const maleCount = await Age80AboveVoter.countDocuments({ $or: [{ sex: 'Male' }, { 's.sex': 'Male' }] });
  const femaleCount = await Age80AboveVoter.countDocuments({ $or: [{ sex: 'Female' }, { 's.sex': 'Female' }] });
  const otherCount = await Age80AboveVoter.countDocuments({ $or: [{ sex: 'Third' }, { 's.sex': 'Third' }] });

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

module.exports = { listAge80AboveVoters };
