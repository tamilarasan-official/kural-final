const {
  VoterCategory,
  VoterLanguage,
  Scheme,
  Feedback,
  Party,
  Religion,
  CasteCategory,
  Caste,
  SubCaste
} = require('../models/Settings');
const { History } = require('../models/Settings');

// Generic CRUD operations
const createItem = async (Model, req, res) => {
  try {
    const item = new Model(req.body);
    await item.save();
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating item',
      error: error.message
    });
  }
};

const getAllItems = async (Model, req, res) => {
  try {
    const items = await Model.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

const getItemById = async (Model, req, res) => {
  try {
    const item = await Model.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item',
      error: error.message
    });
  }
};

const updateItem = async (Model, req, res) => {
  try {
    const item = await Model.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating item',
      error: error.message
    });
  }
};

const deleteItem = async (Model, req, res) => {
  try {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
};

// Voter Categories
exports.createVoterCategory = (req, res) => createItem(VoterCategory, req, res);
exports.getAllVoterCategories = (req, res) => getAllItems(VoterCategory, req, res);
exports.getVoterCategoryById = (req, res) => getItemById(VoterCategory, req, res);
exports.updateVoterCategory = (req, res) => updateItem(VoterCategory, req, res);
exports.deleteVoterCategory = (req, res) => deleteItem(VoterCategory, req, res);

// Voter Languages
exports.createVoterLanguage = (req, res) => createItem(VoterLanguage, req, res);
exports.getAllVoterLanguages = (req, res) => getAllItems(VoterLanguage, req, res);
exports.getVoterLanguageById = (req, res) => getItemById(VoterLanguage, req, res);
exports.updateVoterLanguage = (req, res) => updateItem(VoterLanguage, req, res);
exports.deleteVoterLanguage = (req, res) => deleteItem(VoterLanguage, req, res);

// Schemes
exports.createScheme = (req, res) => createItem(Scheme, req, res);
exports.getAllSchemes = (req, res) => getAllItems(Scheme, req, res);
exports.getSchemeById = (req, res) => getItemById(Scheme, req, res);
exports.updateScheme = (req, res) => updateItem(Scheme, req, res);
exports.deleteScheme = (req, res) => deleteItem(Scheme, req, res);

// Feedback
exports.createFeedback = (req, res) => createItem(Feedback, req, res);
exports.getAllFeedback = (req, res) => getAllItems(Feedback, req, res);
exports.getFeedbackById = (req, res) => getItemById(Feedback, req, res);
exports.updateFeedback = (req, res) => updateItem(Feedback, req, res);
exports.deleteFeedback = (req, res) => deleteItem(Feedback, req, res);

// Parties
exports.createParty = (req, res) => createItem(Party, req, res);
exports.getAllParties = (req, res) => getAllItems(Party, req, res);
exports.getPartyById = (req, res) => getItemById(Party, req, res);
exports.updateParty = (req, res) => updateItem(Party, req, res);
exports.deleteParty = (req, res) => deleteItem(Party, req, res);

// Religions
exports.createReligion = (req, res) => createItem(Religion, req, res);
exports.getAllReligions = (req, res) => getAllItems(Religion, req, res);
exports.getReligionById = (req, res) => getItemById(Religion, req, res);
exports.updateReligion = (req, res) => updateItem(Religion, req, res);
exports.deleteReligion = (req, res) => deleteItem(Religion, req, res);

// Caste Categories
exports.createCasteCategory = (req, res) => createItem(CasteCategory, req, res);
exports.getAllCasteCategories = (req, res) => getAllItems(CasteCategory, req, res);
exports.getCasteCategoryById = (req, res) => getItemById(CasteCategory, req, res);
exports.updateCasteCategory = (req, res) => updateItem(CasteCategory, req, res);
exports.deleteCasteCategory = (req, res) => deleteItem(CasteCategory, req, res);

// Castes
exports.createCaste = (req, res) => createItem(Caste, req, res);
exports.getAllCastes = (req, res) => getAllItems(Caste, req, res);
exports.getCasteById = (req, res) => getItemById(Caste, req, res);
exports.updateCaste = (req, res) => updateItem(Caste, req, res);
exports.deleteCaste = (req, res) => deleteItem(Caste, req, res);

// Sub-Castes
exports.createSubCaste = (req, res) => createItem(SubCaste, req, res);
exports.getAllSubCastes = (req, res) => getAllItems(SubCaste, req, res);
exports.getSubCasteById = (req, res) => getItemById(SubCaste, req, res);
exports.updateSubCaste = (req, res) => updateItem(SubCaste, req, res);
exports.deleteSubCaste = (req, res) => deleteItem(SubCaste, req, res);

// History (with seeding when empty)
exports.createHistory = (req, res) => createItem(History, req, res);
exports.getAllHistory = async (req, res) => {
  try {
    const count = await History.countDocuments();
    if (count === 0) {
      const seed = [
        { id: 'H1', year: '2024', title: '2024-MP', tag: 'MP', icon: '' },
        { id: 'H2', year: '2022', title: '2022-Local Body', tag: 'ULB', icon: '' },
        { id: 'H3', year: '2021', title: '2021-MLA', tag: 'AC', icon: '' },
        { id: 'H4', year: '', title: 'Not Voted', tag: 'NONE', icon: '' }
      ];
      await History.insertMany(seed);
    }
    const items = await History.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
  }
};
exports.getHistoryById = (req, res) => getItemById(History, req, res);
exports.updateHistory = (req, res) => updateItem(History, req, res);
exports.deleteHistory = (req, res) => deleteItem(History, req, res);
