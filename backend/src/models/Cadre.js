const mongoose = require('mongoose');

const cadreSchema = new mongoose.Schema({
  // Personal Details
  activeElection: {
    type: String,
    required: true,
    default: '119 - Thondamuthur'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Mobile number must be 10 digits'
    }
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Role and Allocation
  role: {
    type: String,
    required: true,
    enum: ['Booth Agent', 'Polling Officer', 'Supervisor', 'Coordinator']
  },
  boothAllocation: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  
  // Address Details
  address: {
    street: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      required: true,
      default: 'Tamil Nadu'
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    },
    postalCode: {
      type: String,
      trim: true,
      default: ''
    }
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  
  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
// mobileNumber index is automatically created by unique: true
cadreSchema.index({ status: 1 });
cadreSchema.index({ activeElection: 1 });
cadreSchema.index({ boothAllocation: 1 });
cadreSchema.index({ createdBy: 1 });

// Virtual for full name
cadreSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Method to get public profile (without sensitive data)
cadreSchema.methods.getPublicProfile = function() {
  const cadre = this.toObject();
  delete cadre.password;
  return cadre;
};

module.exports = mongoose.model('Cadre', cadreSchema);
