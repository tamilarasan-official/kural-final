const Profile = require('../models/Profile');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await Profile.findOne({ userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Create or update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, mobileNumber, role } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and mobile number are required'
      });
    }
    
    // Check if profile exists
    let profile = await Profile.findOne({ userId });
    
    if (profile) {
      // Update existing profile
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.email = email;
      profile.mobileNumber = mobileNumber;
      profile.role = role || profile.role;
      
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        userId,
        firstName,
        lastName,
        email,
        mobileNumber,
        role: role || 'User'
      });
      
      await profile.save();
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Create default profile for new user
exports.createDefaultProfile = async (userId, mobileNumber) => {
  try {
    const profile = new Profile({
      userId,
      firstName: 'User',
      lastName: 'Name',
      email: `user${userId}@example.com`,
      mobileNumber,
      role: 'User'
    });
    
    await profile.save();
    return profile;
  } catch (error) {
    console.error('Create default profile error:', error);
    throw error;
  }
};
