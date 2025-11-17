const mongoose = require('mongoose');
const config = require('./config/config');

mongoose.connect(config.DATABASE_URI, {})
    .then(async() => {
        console.log('Connected to MongoDB');

        const User = require('./src/models/user');

        // Find the booth agent we just logged in with
        const agent = await User.findOne({ phone: 7223380281 }).lean();

        if (agent) {
            console.log('\n✅ Booth Agent found:');
            console.log(JSON.stringify(agent, null, 2));
        } else {
            console.log('❌ Booth Agent not found');
        }

        // Check a sample voter to see ac and boothid fields
        const Voter = require('./src/models/voter');
        const sampleVoter = await Voter.findOne({ boothid: { $exists: true } }).lean();

        if (sampleVoter) {
            console.log('\n✅ Sample Voter with boothid:');
            console.log('ac:', sampleVoter.ac);
            console.log('boothid:', sampleVoter.boothid);
            console.log('partno:', sampleVoter.partno);
            console.log('name:', sampleVoter.name);
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });