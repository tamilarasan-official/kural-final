const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function checkAdditionalFields() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const VoterField = mongoose.model('VoterField', new mongoose.Schema({}, { strict: false, collection: 'voterFields' }));

        // Hardcoded fields in the mobile app
        const hardcodedFields = [
            'voterId', 'nameEnglish', 'nameTamil', 'age', 'gender', 'dob',
            'fatherName', 'fatherless', 'guardian', 'mobile', 'email',
            'doorNumber', 'address', 'aadhar', 'pan', 'PAN', 'TAN',
            'religion', 'caste', 'subcaste', 'Number', 'Name', 'sex'
        ];

        // Get all visible fields
        const allFields = await VoterField.find({ visible: true }).sort({ order: 1 }).lean();

        console.log(`📊 Total visible fields: ${allFields.length}\n`);

        // Filter to get only additional fields (not hardcoded)
        const additionalFields = allFields.filter(field => !hardcodedFields.includes(field.name));

        console.log(`🎯 Fields in "Additional Fields" section: ${additionalFields.length}\n`);

        if (additionalFields.length > 0) {
            console.log('📋 Additional Fields (will show in modal):\n');
            additionalFields.forEach((field, idx) => {
                console.log(`${idx + 1}. ${field.name}`);
                console.log(`   Label: "${field.label}"`);
                console.log(`   Type: ${field.type}`);
                console.log(`   Category: ${field.category || 'none'}`);
                console.log(`   Order: ${field.order || 0}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No additional fields will be shown!');
            console.log('   All visible fields are already hardcoded in the form.\n');
        }

        console.log('💡 Hardcoded fields (excluded from Additional Fields):');
        const hardcodedInDB = allFields.filter(field => hardcodedFields.includes(field.name));
        hardcodedInDB.forEach(field => {
            console.log(`  - ${field.name} (${field.label})`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAdditionalFields();