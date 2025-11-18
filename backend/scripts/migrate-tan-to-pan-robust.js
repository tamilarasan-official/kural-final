const mongoose = require('mongoose');
const config = require('../config/config');

// Connect to MongoDB with retry logic
const connectWithRetry = async(retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(config.DATABASE_URI, {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
            });
            console.log('✅ Connected to MongoDB\n');
            return;
        } catch (error) {
            console.log(`❌ Connection attempt ${i + 1}/${retries} failed:`, error.message);
            if (i < retries - 1) {
                console.log('⏳ Retrying in 5 seconds...\n');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    throw new Error('Failed to connect to MongoDB after multiple retries');
};

async function migrateTanToPan() {
    try {
        await connectWithRetry();

        const db = mongoose.connection.db;
        console.log('🔄 Migrating TAN field to pan field...\n');

        // Count voters with TAN field
        const totalCount = await db.collection('voters').countDocuments({ TAN: { $exists: true } });
        console.log(`📊 Found ${totalCount} voters with TAN field\n`);

        if (totalCount === 0) {
            console.log('✅ No voters to migrate. All done!\n');
            return;
        }

        let migratedCount = 0;
        let errorCount = 0;
        const BATCH_SIZE = 100; // Process 100 at a time

        // Use cursor to avoid loading all documents into memory
        const cursor = db.collection('voters').find({ TAN: { $exists: true } });
        let batch = [];

        console.log('🚀 Starting migration in batches of', BATCH_SIZE, '...\n');

        while (await cursor.hasNext()) {
            try {
                const voter = await cursor.next();
                batch.push(voter);

                // Process batch when full
                if (batch.length >= BATCH_SIZE) {
                    await processBatch(db, batch);
                    migratedCount += batch.length;
                    batch = [];

                    if (migratedCount % 1000 === 0) {
                        console.log(`📈 Progress: ${migratedCount}/${totalCount} voters migrated...`);
                    }
                }
            } catch (error) {
                console.error('❌ Error processing voter:', error.message);
                errorCount++;

                // If too many errors, reconnect
                if (errorCount > 10) {
                    console.log('⚠️  Too many errors, reconnecting...');
                    await mongoose.connection.close();
                    await connectWithRetry();
                    errorCount = 0;
                }
            }
        }

        // Process remaining batch
        if (batch.length > 0) {
            await processBatch(db, batch);
            migratedCount += batch.length;
        }

        console.log('\n🎉 Migration complete!');
        console.log(`✅ Migrated: ${migratedCount} voters`);
        console.log(`❌ Errors: ${errorCount} voters\n`);

        // Verify migration
        const remainingTAN = await db.collection('voters').countDocuments({ TAN: { $exists: true } });
        const newPan = await db.collection('voters').countDocuments({ pan: { $exists: true } });

        console.log('📊 Verification:');
        console.log(`   Remaining TAN fields: ${remainingTAN}`);
        console.log(`   New pan fields: ${newPan}\n`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Connection closed');
        process.exit(0);
    }
}

async function processBatch(db, batch) {
    const bulkOps = batch.map(voter => {
        const tanValue = voter.TAN;

        return {
            updateOne: {
                filter: { _id: voter._id },
                update: {
                    $set: {
                        pan: typeof tanValue === 'object' && tanValue ? .value !== undefined ?
                            tanValue.value :
                            tanValue
                    },
                    $unset: { TAN: "" }
                }
            }
        };
    });

    if (bulkOps.length > 0) {
        await db.collection('voters').bulkWrite(bulkOps, { ordered: false });
    }
}

// Run migration
migrateTanToPan();