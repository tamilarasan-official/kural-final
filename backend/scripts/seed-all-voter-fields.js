const mongoose = require('mongoose');
const config = require('../config/config');

// Connect to MongoDB
mongoose.connect(config.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

async function seedAllVoterFields() {
    try {
        console.log('🔄 Seeding ALL voter fields (standard + custom)...\n');

        const VoterField = mongoose.model('VoterField', new mongoose.Schema({}, { strict: false, collection: 'voterFields' }));

        // Clear existing fields
        await VoterField.deleteMany({});
        console.log('🗑️  Cleared existing voter fields\n');

        // Define ALL fields (both standard and custom)
        const allFields = [
            // Basic Information
            { name: 'voterId', type: 'String', label: 'Voter ID', description: 'EPIC number', required: true, visible: true, order: 1, category: 'basic' },
            { name: 'nameEnglish', type: 'String', label: 'Name (English)', description: 'Full name in English', required: true, visible: true, order: 2, category: 'basic' },
            { name: 'nameTamil', type: 'String', label: 'Name (Tamil)', description: 'Full name in Tamil', required: false, visible: true, order: 3, category: 'basic' },
            { name: 'age', type: 'Number', label: 'Age', description: 'Voter age', required: true, visible: true, order: 4, category: 'basic' },
            { name: 'gender', type: 'String', label: 'Gender', description: 'Male/Female/Transgender', required: true, visible: true, order: 5, category: 'basic' },
            { name: 'dob', type: 'Date', label: 'Date of Birth', description: 'Date of birth', required: false, visible: true, order: 6, category: 'basic' },

            // Family Information
            { name: 'fatherName', type: 'String', label: 'Father Name', description: 'Father\'s name', required: false, visible: true, order: 7, category: 'family' },
            { name: 'fatherless', type: 'Boolean', label: 'Fatherless', description: 'Is fatherless?', required: false, visible: true, order: 8, category: 'family' },
            { name: 'guardian', type: 'String', label: 'Guardian Name', description: 'Guardian name if fatherless', required: false, visible: true, order: 9, category: 'family' },

            // Contact Information
            { name: 'mobile', type: 'String', label: 'Mobile Number', description: 'Contact number', required: false, visible: true, order: 10, category: 'contact' },
            { name: 'email', type: 'String', label: 'Email ID', description: 'Email address', required: false, visible: true, order: 11, category: 'contact' },

            // Address Information
            { name: 'doorNumber', type: 'String', label: 'Door Number', description: 'House/door number', required: false, visible: true, order: 12, category: 'address' },
            { name: 'address', type: 'String', label: 'Address', description: 'Complete address', required: true, visible: true, order: 13, category: 'address' },

            // Identity Documents
            { name: 'aadhar', type: 'String', label: 'Aadhar Number', description: '12-digit Aadhar number', required: false, visible: true, order: 14, category: 'documents' },
            { name: 'pan', type: 'String', label: 'PAN Number', description: '10-character PAN', required: false, visible: true, order: 15, category: 'documents' },

            // Community Information
            { name: 'religion', type: 'String', label: 'Religion', description: 'Religious affiliation', required: false, visible: true, order: 16, category: 'community' },
            { name: 'caste', type: 'String', label: 'Caste', description: 'Caste category', required: false, visible: true, order: 17, category: 'community' },
            { name: 'subcaste', type: 'String', label: 'Sub Caste', description: 'Sub caste', required: false, visible: true, order: 18, category: 'community' },

            // Custom Fields (Examples - Admin can add more)
            { name: 'bloodgroup', type: 'String', label: 'Blood Group', description: 'Blood group type', required: false, visible: true, order: 19, category: 'health' },
            { name: 'education', type: 'String', label: 'Education Level', description: 'Highest education qualification', required: false, visible: false, order: 20, category: 'personal' },
            { name: 'occupation', type: 'String', label: 'Occupation', description: 'Current occupation', required: false, visible: false, order: 21, category: 'personal' },
            { name: 'maritalStatus', type: 'String', label: 'Marital Status', description: 'Married/Single/Widow/Divorced', required: false, visible: false, order: 22, category: 'personal' },
        ];

        // Insert all fields
        await VoterField.insertMany(allFields);

        console.log('✅ Seeded fields:');
        console.log(`   📋 Basic Information: 6 fields`);
        console.log(`   👨‍👩‍👧 Family Information: 3 fields`);
        console.log(`   📞 Contact Information: 2 fields`);
        console.log(`   🏠 Address Information: 2 fields`);
        console.log(`   🆔 Identity Documents: 2 fields`);
        console.log(`   🕉️  Community Information: 3 fields`);
        console.log(`   ➕ Custom Fields: 4 fields`);
        console.log(`\n🎉 Total: ${allFields.length} fields created!\n`);

        console.log('📝 Field Management:');
        console.log('   - Visible fields: Will show in mobile app');
        console.log('   - Hidden fields: Won\'t show (can be enabled later)');
        console.log('   - Admin can rename labels anytime');
        console.log('   - Admin can change field order');
        console.log('   - Admin can add new custom fields\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
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
    seedAllVoterFields();
});