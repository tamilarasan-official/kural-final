const mongoose = require('mongoose');
const config = require('../config/config');

mongoose.connect(config.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

async function migrateTanToPan() {
    try {
        console.log('🔄 Migrating TAN field to pan field...\n');

        const voters = await db.collection('voters').find({ TAN: { $exists: true } }).toArray();
        console.log(`📊 Found ${voters.length} voters with TAN field\n`);

        let migratedCount = 0;

        for (const voter of voters) {
            // Copy TAN value to pan field and remove TAN
            await db.collection('voters').updateOne({ _id: voter._id }, {
                $set: { pan: voter.TAN },
                $unset: { TAN: "" }
            });
            migratedCount++;

            if (migratedCount % 1000 === 0) {
                console.log(`📈 Progress: ${migratedCount}/${voters.length} voters migrated...`);
            }
        }

        console.log('\n🎉 Migration complete!');
        console.log(`✅ Migrated: ${migratedCount} voters`);
        console.log('📋 TAN → pan field renamed\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
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
    migrateTanToPan();
});