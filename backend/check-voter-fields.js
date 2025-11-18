const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function checkVoterFields() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const VoterField = mongoose.model('VoterField', new mongoose.Schema({}, { strict: false, collection: 'voterFields' }));

        const allFields = await VoterField.find({}).lean();
        console.log(`📊 Total voter fields: ${allFields.length}\n`);

        // Check for fields with missing properties
        const issues = [];

        allFields.forEach(field => {
            const fieldIssues = [];

            if (!field.name) fieldIssues.push('Missing name');
            if (!field.label) fieldIssues.push('Missing label');
            if (!field.type) fieldIssues.push('Missing type');
            if (field.visible === undefined) fieldIssues.push('Missing visible');

            if (fieldIssues.length > 0) {
                issues.push({
                    _id: field._id,
                    name: field.name || 'UNNAMED',
                    label: field.label || 'NO LABEL',
                    issues: fieldIssues
                });
            }
        });

        if (issues.length > 0) {
            console.log('⚠️  Fields with Missing Properties:\n');
            issues.forEach((issue, idx) => {
                console.log(`${idx + 1}. ${issue.name} (${issue.label})`);
                console.log(`   ID: ${issue._id}`);
                console.log(`   Issues: ${issue.issues.join(', ')}`);
                console.log('');
            });

            console.log('💡 These fields may cause errors in the mobile app.\n');
        } else {
            console.log('✅ All fields have required properties!\n');
        }

        // Show all fields summary
        console.log('📋 All Voter Fields Summary:\n');
        allFields.forEach((field, idx) => {
            console.log(`${idx + 1}. ${field.name || 'UNNAMED'}`);
            console.log(`   Label: "${field.label || 'NO LABEL'}"`);
            console.log(`   Type: ${field.type || 'UNKNOWN'}`);
            console.log(`   Category: ${field.category || 'none'}`);
            console.log(`   Visible: ${field.visible !== false ? 'Yes' : 'No'}`);
            console.log(`   Order: ${field.order || 0}`);
            console.log('');
        });

        await mongoose.disconnect();
        console.log('✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkVoterFields();