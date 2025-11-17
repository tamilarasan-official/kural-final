const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kuraldb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function fixPassword() {
    try {
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        const phone = '7014080047';
        const plainPassword = 'tb07klwy20';

        // Generate bcrypt hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);

        console.log('Phone:', phone);
        console.log('Plain password:', plainPassword);
        console.log('Bcrypt hash:', hashedPassword);

        // Update the password
        const result = await User.updateOne({ phone: phone }, { $set: { password: hashedPassword } });

        console.log('Update result:', result);
        console.log('✅ Password updated successfully!');

        // Verify the user can login now
        const user = await User.findOne({ phone: phone }).select('+password');
        if (user) {
            const isMatch = await bcrypt.compare(plainPassword, user.password);
            console.log('Password verification:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

fixPassword();