const mongoose = require('mongoose');
const config = require('./config/config');

mongoose.connect(config.DATABASE_URI).then(async() => {
    console.log('✅ Connected\n');
    console.log('🧪 Testing bloodgroup update...\n');

    const db = mongoose.connection.db;

    // Update bloodgroup
    const result = await db.collection('voters').updateOne({ voterID: 'SJI3233895' }, { $set: { bloodgroup: 'A+' } });

    console.log('📊 Update result:', result.modifiedCount, 'document(s) modified\n');

    // Verify
    const voter = await db.collection('voters').findOne({ voterID: 'SJI3233895' }, { projection: { voterID: 1, bloodgroup: 1, pan: 1, TAN: 1, _id: 0 } });

    console.log('📋 Voter after update:');
    console.log(JSON.stringify(voter, null, 2));

    console.log('\n✅ Test complete!');
    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});