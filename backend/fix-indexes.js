const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function fixIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('masterDataResponses');

        // Get existing indexes
        console.log('\nCurrent indexes:');
        const indexes = await collection.indexes();
        console.log(JSON.stringify(indexes, null, 2));

        // Drop the location index if it exists
        try {
            console.log('\nDropping location_2dsphere index...');
            await collection.dropIndex('location_2dsphere');
            console.log('✓ Dropped location_2dsphere index');
        } catch (error) {
            console.log('Note: location_2dsphere index did not exist');
        }

        // Create sparse geospatial index
        console.log('\nCreating sparse location index...');
        await collection.createIndex({ location: '2dsphere' }, { sparse: true });
        console.log('✓ Created sparse location_2dsphere index');

        // Show new indexes
        console.log('\nNew indexes:');
        const newIndexes = await collection.indexes();
        console.log(JSON.stringify(newIndexes, null, 2));

        console.log('\n✅ Index fix completed successfully!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

fixIndexes();