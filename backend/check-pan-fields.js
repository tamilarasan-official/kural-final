const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function checkPanFields() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const VoterField = mongoose.model('VoterField', new mongoose.Schema({}, { strict: false, collection: 'voterFields' }));

        const panFields = await VoterField.find({
            $or: [
                { name: 'pan' },
                { name: 'PAN' },
                { name: 'TAN' }
            ]
        }).lean();

        console.log('📋 PAN/TAN related fields:\n');
        panFields.forEach(f => {
            console.log(`${f.name}:`);
            console.log(`  Label: "${f.label}"`);
            console.log(`  Visible: ${f.visible}`);
            console.log(`  Category: ${f.category || 'none'}`);
            console.log(`  Order: ${f.order || 0}`);
            console.log('');
        });

        console.log('💡 Expected result in mobile app:');
        console.log('  In "Additional Information" section:');
        console.log('  Field Name: PAN (not TAN)');
        console.log('  Field Value: HTVTK2984B');
        console.log('  Display Label: "PAN Number"');

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkPanFields();