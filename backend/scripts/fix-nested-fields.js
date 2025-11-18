const mongoose = require('mongoose');
const config = require('../config/config');

// Connect to MongoDB
mongoose.connect(config.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

async function fixNestedFields() {
    try {
        console.log('🔄 Starting migration to fix nested field structures...\n');

        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        const voters = await Voter.find({}).lean();
        console.log(`📊 Found ${voters.length} voters to check\n`);

        let fixedCount = 0;
        let processedCount = 0;

        for (const voter of voters) {
            const updates = {};
            let needsUpdate = false;

            // Check each field in the voter document
            Object.keys(voter).forEach(key => {
                const value = voter[key];

                // Skip system fields
                if (key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') {
                    return;
                }

                // Check if value is an object with 'value' property
                if (value && typeof value === 'object' && !Array.isArray(value) && value.value !== undefined) {
                    updates[key] = value.value;
                    needsUpdate = true;
                    console.log(`  🔧 Fixing ${key}: ${JSON.stringify(value)} → ${value.value}`);
                }
            });

            if (needsUpdate) {
                await Voter.updateOne({ _id: voter._id }, { $set: updates });
                fixedCount++;
                console.log(`✅ Fixed voter ${voter.voterID || voter.Number} (${fixedCount} fixed so far)\n`);
            }

            processedCount++;
            if (processedCount % 100 === 0) {
                console.log(`📈 Progress: ${processedCount}/${voters.length} voters processed...`);
            }
        }

        console.log('\n🎉 Migration complete!');
        console.log(`✅ Processed: ${processedCount} voters`);
        console.log(`🔧 Fixed: ${fixedCount} voters with nested fields`);
        console.log(`📊 No changes: ${processedCount - fixedCount} voters\n`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Handle errors
db.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

db.once('open', () => {
    console.log('✅ Connected to MongoDB\n');
    fixNestedFields();
});