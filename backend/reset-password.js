const mongoose = require('mongoose');
const crypto = require('crypto');

const resetPassword = async() => {
    try {
        console.log('Connecting to production database...');
        await mongoose.connect('mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb');
        console.log('✅ Connected successfully!');

        // Set your new password here
        const newPassword = 'Kural@2025';
        const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

        console.log('\nUpdating password for THONDAMUTHUR_CI...');

        const result = await mongoose.connection.db.collection('users').updateOne({ phone: 9209642500 }, { $set: { password: hashedPassword, updatedAt: new Date() } });

        if (result.modifiedCount > 0) {
            console.log('\n✅ Password updated successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📱 Phone: 9209642500');
            console.log('🔑 New Password:', newPassword);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n🧪 Test login with:');
            console.log('  Phone: 9209642500');
            console.log('  Password:', newPassword);
            console.log('\n📝 SHA-256 Hash:', hashedPassword);
        } else {
            console.log('⚠️  No user found or password already set');
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

resetPassword();