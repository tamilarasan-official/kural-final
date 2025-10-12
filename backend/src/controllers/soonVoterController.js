const SoonVoter = require('../models/soonVoter');

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Normalize date
    if (payload.dateOfBirth && typeof payload.dateOfBirth === 'string') {
      const d = new Date(payload.dateOfBirth);
      if (!isNaN(d.getTime())) payload.dateOfBirth = d; else delete payload.dateOfBirth;
    }

    // Normalize numbers
    if (payload.part != null) payload.part = Number(payload.part) || 0;
    if (payload.age != null) payload.age = Number(payload.age) || undefined;

    // Normalize gender
    if (payload.gender) payload.gender = String(payload.gender).toLowerCase();

    // Remove location field entirely (schema no longer contains location)
    if (payload.location) delete payload.location;

    const doc = await SoonVoter.create(payload);
    res.json({ success: true, data: doc });
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const q = (req.query.q || '').trim();
    const filter = {};
    if (q) filter.$or = [{ voterName: { $regex: q, $options: 'i' } }, { epicId: { $regex: q, $options: 'i' } }];
    const [items, total] = await Promise.all([
      SoonVoter.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SoonVoter.countDocuments(filter)
    ]);
    res.json({ success: true, data: items, pagination: { total, page, limit, totalPages: Math.ceil(total/limit) } });
  } catch (e) { next(e); }
};


