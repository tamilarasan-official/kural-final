const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config/config');

// Connect to MongoDB
mongoose.connect(config.DATABASE_URI, {})
    .then(async() => {
        console.log('Connected to MongoDB');

        // Get User model
        const User = require('./src/models/user');

        // Search for booth agents
        console.log('\nSearching for booth agents...');
        const boothAgents = await User.find({ role: { $regex: /booth/i } }).limit(20).lean();
        console.log(`Found ${boothAgents.length} booth agent users:`);
        boothAgents.forEach((u, i) => {
            console.log(`${i + 1}. Name: ${u.name}, Phone: ${u.phone}, Role: ${u.role}`);
        });

        // Try to find user with phone 2233802281
        let user = await User.findOne({ phone: '2233802281' });

        if (!user) {
            // Try with regex
            user = await User.findOne({ phone: { $regex: '2233802281' } });
        }

        if (!user) {
            // Search by name if visible in image
            user = await User.findOne({ name: { $regex: /Agent_001/i } });
        }

        if (!user && boothAgents.length > 0) {
            console.log('\nNo user found with phone 2233802281. Available booth agents listed above.');
            console.log('Please specify which user to reset password for.');
            process.exit(1);
        }

        if (!user) {
            console.log('\nNo booth agent users found in database.');
            process.exit(1);
        }

        console.log('\nUser found:');
        console.log('- Name:', user.name);
        console.log('- Phone:', user.phone);
        console.log('- Role:', user.role);
        if (user.password) {
            console.log('- Current password hash:', user.password.substring(0, 20) + '...');
        } else {
            console.log('- Current password: NOT SET');
        }

        // Set the new password (User model pre-save hook will hash it)
        user.password = 'Booth@001';
        await user.save();

        console.log('\n✅ Password successfully reset to: Booth@001');

        // Fetch user again with password field to verify
        const updatedUser = await User.findById(user._id).select('+password');

        // Verify the password
        const isMatch = await bcrypt.compare('Booth@001', updatedUser.password);
        console.log('✅ Password verification:', isMatch ? 'SUCCESS' : 'FAILED');

        if (isMatch) {
            console.log('\n🎉 Password reset completed successfully!');
            console.log('📱 Phone: 7223380281');
            console.log('🔑 Password: Booth@001');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });