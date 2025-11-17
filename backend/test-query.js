const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb')
    .then(async() => {
        console.log('Connected to MongoDB');

        // Test the exact query from the controller
        const query = {
            $or: [
                { phone: '9209642500' },
                { phone: 9209642500 },
                { email: '9209642500' }
            ]
        };

        console.log('Query:', JSON.stringify(query, null, 2));

        const user = await User.findOne(query).select('+password');

        if (user) {
            console.log('✅ FOUND!');
            console.log('  - Phone:', user.phone, '(type:', typeof user.phone + ')');
            console.log('  - Role:', user.role);
            console.log('  - Name:', user.name);
            console.log('  - Password hash:', user.password ? .substring(0, 30) + '...');
        } else {
            console.log('❌ NOT FOUND');
        }

        mongoose.connection.close();
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error:', err.message);
        process.exit(1);
    });