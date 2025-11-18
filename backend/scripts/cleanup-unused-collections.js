#!/usr/bin/env node

const mongoose = require('mongoose');
const config = require('../config/config');

// Collections that should be kept
const neededCollections = [
    'voters',
    'users',
    'booths',
    'boothagentactivities',
    'surveys',
    'surveyresponses',
    'dynamicfields',
    'voterFields',
    'modalcontents',
    'applanguage',
    'sessions',
    'masterdatasections'
];

const cleanupCollections = async() => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(config.DATABASE_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const existingCollectionNames = collections.map(c => c.name);

        console.log('\n📋 Current collections in database:');
        existingCollectionNames.forEach(name => console.log(`   - ${name}`));

        console.log('\n🗑️  Dropping all collections except needed ones...\n');

        let droppedCount = 0;
        let skippedCount = 0;

        for (const collectionName of existingCollectionNames) {
            // Skip system collections and needed collections
            if (collectionName.startsWith('system.') || neededCollections.includes(collectionName)) {
                console.log(`⏭️  Keeping: ${collectionName}`);
                skippedCount++;
            } else {
                try {
                    await db.dropCollection(collectionName);
                    console.log(`✅ Dropped: ${collectionName}`);
                    droppedCount++;
                } catch (error) {
                    console.error(`❌ Failed to drop ${collectionName}:`, error.message);
                }
            }
        }

        console.log(`\n📊 Summary: Kept ${skippedCount} collections, Dropped ${droppedCount} collections`);

        // Refresh collection list
        const remainingCollections = await db.listCollections().toArray();
        console.log('\n✅ Cleanup completed!');
        console.log('\n📋 Remaining collections:');
        remainingCollections.forEach(c => console.log(`   - ${c.name}`));

        console.log('\n🎯 Collections that should remain:');
        neededCollections.forEach(name => console.log(`   ✓ ${name}`));

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
};

cleanupCollections();