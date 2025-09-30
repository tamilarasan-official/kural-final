const mongoose = require('mongoose');

// Voter Categories Schema
const voterCategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Voter Languages Schema
const voterLanguageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  englishName: { type: String, required: true },
  nativeName: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Schemes Schema
const schemeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  provider: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Parties Schema
const partySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tamilName: { type: String, required: true },
  englishName: { type: String, required: true },
  symbol: { type: String, required: true },
  color: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Religions Schema
const religionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  color: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Caste Categories Schema
const casteCategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  abbreviation: { type: String, required: true },
  number: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Castes Schema
const casteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  englishName: { type: String, required: true },
  tamilName: { type: String, required: true },
  label: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Sub-Castes Schema
const subCasteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  parentCaste: { type: String, required: true },
  label: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const VoterCategory = mongoose.model('VoterCategory', voterCategorySchema);
const VoterLanguage = mongoose.model('VoterLanguage', voterLanguageSchema);
const Scheme = mongoose.model('Scheme', schemeSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Party = mongoose.model('Party', partySchema);
const Religion = mongoose.model('Religion', religionSchema);
const CasteCategory = mongoose.model('CasteCategory', casteCategorySchema);
const Caste = mongoose.model('Caste', casteSchema);
const SubCaste = mongoose.model('SubCaste', subCasteSchema);

// History Schema (Voting History options for settings)
const historySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  year: { type: String, required: false },
  title: { type: String, required: true },
  tag: { type: String, required: true },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const History = mongoose.model('History', historySchema);

module.exports = {
  VoterCategory,
  VoterLanguage,
  Scheme,
  Feedback,
  Party,
  Religion,
  CasteCategory,
  Caste,
  SubCaste
  ,History
};
