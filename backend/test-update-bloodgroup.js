const mongoose = require('mongoose');
const config = require('./config/config');

mongoose.connect(config.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

async function testUpdateBloodgroup() {
    try {
        console.log('🔄 Testing bloodgroup update...\n');

        // Find a voter with null bloodgroup
        const voterBefore = await db.collection('voters').findOne({
            voterID: 'MAW3535636'
        });

        console.log('📋 BEFORE UPDATE:');
        console.log('  Voter ID:', voterBefore.voterID);
        console.log('  Blood Group:', voterBefore.bloodgroup);
        console.log('  Type:', typeof voterBefore.bloodgroup);

        // Update the bloodgroup
        const updateResult = await db.collection('voters').updateOne({ voterID: 'MAW3535636' }, { $set: { bloodgroup: 'O+' } });

        console.log('\n✅ Update Result:');
        console.log('  Matched:', updateResult.matchedCount);
        console.log('  Modified:', updateResult.modifiedCount);

        // Verify the update
        const voterAfter = await db.collection('voters').findOne({
            voterID: 'MAW3535636'
        });

        console.log('\n📋 AFTER UPDATE:');
        console.log('  Voter ID:', voterAfter.voterID);
        console.log('  Blood Group:', voterAfter.bloodgroup);
        console.log('  Type:', typeof voterAfter.bloodgroup);

        if (voterAfter.bloodgroup === 'O+') {
            console.log('\n🎉 SUCCESS! Bloodgroup updated correctly!');
        } else {
            console.log('\n❌ FAILED! Bloodgroup not updated.');
        }

        // Clean up - set it back to null for testing
        await db.collection('voters').updateOne({ voterID: 'MAW3535636' }, { $set: { bloodgroup: null } });
        console.log('\n🔄 Reset bloodgroup back to null for testing');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

db.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

db.once('open', () => {
    console.log('✅ Connected to MongoDB\n');
    testUpdateBloodgroup();
});