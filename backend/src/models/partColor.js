const mongoose = require('mongoose');

const partColorSchema = new mongoose.Schema({
  partNumber: {
    type: Number,
    required: true,
    unique: true
  },
  vulnerabilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vulnerability',
    required: true
  },
  color: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PartColor', partColorSchema);
