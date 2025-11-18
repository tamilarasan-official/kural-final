const mongoose = require('mongoose');
const config = require('../config/config');

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

async function renamePanToTan() {
    try {
        console.log('🔄 Starting migration to rename PAN to TAN...\n');

        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        // Count voters with PAN field
        const votersWithPan = await Voter.countDocuments({ PAN: { $exists: true, $ne: null, $ne: '' } });
        console.log(`📊 Found ${votersWithPan} voters with PAN field\n`);

        if (votersWithPan === 0) {
            console.log('✅ No voters with PAN field found. Nothing to migrate.');
            return;
        }

        // Rename PAN to TAN for all voters
        const result = await Voter.updateMany({ PAN: { $exists: true, $ne: null, $ne: '' } }, { $rename: { 'PAN': 'TAN' } });

        console.log('✅ Migration complete!');
        console.log(`🔧 Updated ${result.modifiedCount} voters`);
        console.log(`📝 Renamed field: PAN → TAN\n`);

        // Also update panNumber field if it exists
        const votersWithPanNumber = await Voter.countDocuments({ panNumber: { $exists: true, $ne: null, $ne: '' } });
        if (votersWithPanNumber > 0) {
            console.log(`📊 Found ${votersWithPanNumber} voters with panNumber field`);
            const result2 = await Voter.updateMany({ panNumber: { $exists: true, $ne: null, $ne: '' } }, { $rename: { 'panNumber': 'tanNumber' } });
            console.log(`✅ Renamed ${result2.modifiedCount} panNumber → tanNumber\n`);
        }

        console.log('🎉 All done!');

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
    renamePanToTan();
});