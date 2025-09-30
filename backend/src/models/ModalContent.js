const mongoose = require('mongoose');

const modalContentSchema = new mongoose.Schema({
  modalType: {
    type: String,
    required: true,
    unique: true,
    enum: ['about', 'help', 'terms', 'privacy']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
// modalType index is automatically created by unique: true
modalContentSchema.index({ isActive: 1 });

module.exports = mongoose.model('ModalContent', modalContentSchema);
