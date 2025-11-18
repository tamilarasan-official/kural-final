const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function removeDuplicateCollections() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        // Collections to remove (incorrect lowercase versions)
        const collectionsToRemove = ['masterdataresponses', 'masterdatasections'];

        for (const collectionName of collectionsToRemove) {
            try {
                // Check if collection exists
                const collections = await db.listCollections({ name: collectionName }).toArray();

                if (collections.length > 0) {
                    // Check document count before dropping
                    const count = await db.collection(collectionName).countDocuments();
                    console.log(`\n📊 Collection: ${collectionName}`);
                    console.log(`   Documents: ${count}`);

                    // Drop the collection
                    await db.collection(collectionName).drop();
                    console.log(`   ✅ Dropped successfully`);
                } else {
                    console.log(`\n⚠️  Collection '${collectionName}' does not exist`);
                }
            } catch (error) {
                console.error(`\n❌ Error dropping ${collectionName}:`, error.message);
            }
        }

        // List remaining master data collections
        console.log('\n\n=== Remaining Master Data Collections ===');
        const allCollections = await db.listCollections().toArray();
        const masterCollections = allCollections.filter(c => c.name.toLowerCase().includes('master'));

        for (const coll of masterCollections) {
            const count = await db.collection(coll.name).countDocuments();
            console.log(`✓ ${coll.name} - ${count} documents`);
        }

        console.log('\n✅ Cleanup completed successfully!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

removeDuplicateCollections();