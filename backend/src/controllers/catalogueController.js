const Catalogue = require('../models/catalogue');
const { asyncHandler } = require('../utils/asyncHandler');

// List catalogue items with pagination and optional search
const listCatalogueItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const q = (req.query.q || '').trim();
  const category = req.query.category || '';

  const filter = { isActive: true };
  
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { fullDescription: { $regex: q, $options: 'i' } }
    ];
  }

  if (category) {
    filter.category = category;
  }

  const [items, total] = await Promise.all([
    Catalogue.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Catalogue.countDocuments(filter),
  ]);

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
    }
  });
});

// Get single catalogue item by ID
const getCatalogueItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const item = await Catalogue.findById(id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Catalogue item not found'
    });
  }

  res.json({
    success: true,
    data: item
  });
});

// Create catalogue item
const createCatalogueItem = asyncHandler(async (req, res) => {
  const item = await Catalogue.create(req.body);
  
  res.status(201).json({
    success: true,
    data: item
  });
});

// Update catalogue item
const updateCatalogueItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const item = await Catalogue.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Catalogue item not found'
    });
  }

  res.json({
    success: true,
    data: item
  });
});

// Delete catalogue item
const deleteCatalogueItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const item = await Catalogue.findByIdAndDelete(id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Catalogue item not found'
    });
  }

  res.json({
    success: true,
    message: 'Catalogue item deleted successfully'
  });
});

module.exports = { 
  listCatalogueItems, 
  getCatalogueItem, 
  createCatalogueItem, 
  updateCatalogueItem, 
  deleteCatalogueItem 
};

