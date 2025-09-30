const mongoose = require('mongoose');
const config = require('../config/config');
const Profile = require('../src/models/Profile');

// Connect to MongoDB
mongoose.connect(config.DATABASE_URI)
  .then(() => console.log('✅ MongoDB Connected for profile seeding...'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// Sample profile data
const sampleProfile = {
  userId: 'user_6379048464',
  firstName: 'Tamilarasan',
  lastName: 'P',
  email: 'tamilarasan@example.com',
  mobileNumber: '9876543210',
  role: 'User'
};

// Seed profile data
const seedProfile = async () => {
  try {
    // Clear existing profiles
    await Profile.deleteMany({});
    console.log('🗑️ Cleared existing profiles');

    // Create sample profile
    const profile = await Profile.create(sampleProfile);
    console.log('✅ Sample profile created:', profile);

    console.log('🎉 Profile seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Profile seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding
seedProfile();
