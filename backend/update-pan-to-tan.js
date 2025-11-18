const mongoose = require('mongoose');
const config = require('./config/config');

mongoose.connect(config.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

async function updatePanToTan() {
    try {
        console.log('🔄 Updating PAN label to TAN Number...\n');

        // Update the label in voterFields collection
        const result = await db.collection('voterFields').updateOne({ name: 'pan' }, { $set: { label: 'TAN Number' } });

        console.log('✅ Update result:', result.modifiedCount, 'document(s) modified\n');

        // Verify the update
        const updatedField = await db.collection('voterFields').findOne({ name: 'pan' });
        console.log('📋 Updated field:', {
            name: updatedField.name,
            label: updatedField.label,
            type: updatedField.type,
            visible: updatedField.visible,
            order: updatedField.order
        });

        console.log('\n✅ Done! Now close and reopen the voter detail screen in the mobile app.');
        console.log('   The app will fetch the latest field definitions and show "TAN Number" instead of "PAN Number".\n');

    } catch (error) {
        console.error('❌ Update failed:', error);
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
    updatePanToTan();
});