const mongoose = require('mongoose');

const CatalogueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  fullDescription: { type: String, required: true },
  imageUrl: { type: String, required: true },
  features: [{ type: String }],
  category: { type: String, default: 'election' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true, versionKey: false, collection: 'catalogue' });

module.exports = mongoose.model('Catalogue', CatalogueSchema);

