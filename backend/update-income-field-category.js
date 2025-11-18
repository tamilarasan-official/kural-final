const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function updateIncomeFieldCategory() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const VoterField = mongoose.model('VoterField', new mongoose.Schema({}, { strict: false, collection: 'voterFields' }));

        // Find the income field
        const incomeField = await VoterField.findOne({ name: 'annual_income' });

        if (!incomeField) {
            console.log('❌ Income field not found in voterFields collection');
            await mongoose.disconnect();
            return;
        }

        console.log('📋 Current income field:');
        console.log(JSON.stringify(incomeField.toObject(), null, 2));
        console.log('');

        // Update with category and order
        incomeField.category = 'personal'; // Can be: documents, community, health, personal
        incomeField.order = incomeField.order || 100;
        incomeField.visible = true;
        incomeField.label = incomeField.label || 'Annual Income';

        await incomeField.save();

        console.log('✅ Income field updated:');
        console.log(JSON.stringify(incomeField.toObject(), null, 2));
        console.log('');
        console.log('💡 Field will now appear in:');
        console.log('  - Voter Detail screen (personal section)');
        console.log('  - Add/Edit Voter modal');

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateIncomeFieldCategory();