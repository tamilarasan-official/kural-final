const TransgenderVoter = require('../models/transgenderVoter');
const { asyncHandler } = require('../utils/asyncHandler');

// List transgender voters with pagination and optional search
const listTransgenderVoters = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const q = (req.query.q || '').trim();

  const filter = {};
  if (q) {
    filter.$or = [
      { 'Name': { $regex: q, $options: 'i' } },
      { 'Number': { $regex: q, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    TransgenderVoter.find(filter).skip((page - 1) * limit).limit(limit),
    TransgenderVoter.countDocuments(filter),
  ]);

  // Calculate gender summary
  const maleCount = await TransgenderVoter.countDocuments({ sex: 'Male' });
  const femaleCount = await TransgenderVoter.countDocuments({ sex: 'Female' });
  const otherCount = await TransgenderVoter.countDocuments({ sex: 'Third' });

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

module.exports = { listTransgenderVoters };


