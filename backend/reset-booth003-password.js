const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const connectDB = async() => {
    try {
        await mongoose.connect('mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb');
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const resetPassword = async() => {
    await connectDB();

    const User = require('./src/models/User');

    const phone = 7014080047;
    const newPassword = 'tb07klwy20';

    console.log('🔍 Finding user with phone:', phone);

    const user = await User.findOne({ phone: phone });

    if (!user) {
        console.log('❌ User not found with phone:', phone);
        process.exit(1);
    }

    console.log('✅ User found:', user.name);
    console.log('   Role:', user.role);
    console.log('   Booth:', user.booth_id);
    console.log('   ACI:', user.aci_id, '-', user.aci_name);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log('🔑 New password hash:', hashedPassword);
    console.log('   Hash starts with:', hashedPassword.substring(0, 4));

    // Update the password directly (bypass pre-save hook)
    await User.updateOne({ phone: phone }, { $set: { password: hashedPassword } });

    console.log('✅ Password updated successfully!');
    console.log('📱 Phone:', phone);
    console.log('🔐 Password:', newPassword);

    // Fetch user again with password field to test
    const updatedUser = await User.findOne({ phone: phone }).select('+password');
    const isMatch = await updatedUser.matchPassword(newPassword);
    console.log('🧪 Password verification test:', isMatch ? '✅ PASS' : '❌ FAIL');

    process.exit(0);
};

resetPassword();