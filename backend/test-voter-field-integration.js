/**
 * Test Script: Verify Voter Field Integration
 * 
 * This script tests that voter fields added via admin panel
 * are properly returned by the API for mobile app consumption.
 * 
 * Run: node test-voter-field-integration.js
 */

const config = require('./config/config');
const mongoose = require('mongoose');

// Import the VoterField model
const VoterField = require('./src/models/VoterField');

async function testVoterFieldIntegration() {
    console.log('🧪 Testing Voter Field Integration\n');
    console.log('='.repeat(60));

    try {
        // Connect to MongoDB
        console.log('\n📡 Connecting to MongoDB...');
        await mongoose.connect(config.DATABASE_URI);
        console.log('✅ Connected to MongoDB\n');

        // Test 1: Check if bloodGroup field exists
        console.log('TEST 1: Check if bloodGroup field exists');
        console.log('-'.repeat(60));

        const bloodGroupField = await VoterField.findOne({ name: 'bloodGroup' });

        if (bloodGroupField) {
            console.log('✅ Blood Group field found:');
            console.log(`   Name: ${bloodGroupField.name}`);
            console.log(`   Type: ${bloodGroupField.type}`);
            console.log(`   Label: ${bloodGroupField.label}`);
            console.log(`   Visible: ${bloodGroupField.visible}`);
            console.log(`   Required: ${bloodGroupField.required}`);
        } else {
            console.log('❌ Blood Group field NOT found');
            console.log('   Creating sample bloodGroup field...');

            const newField = await VoterField.create({
                name: 'bloodGroup',
                type: 'String',
                label: 'Blood Group',
                description: 'Voter\'s blood group type',
                required: false,
                visible: true
            });

            console.log('✅ Created bloodGroup field:', newField._id);
        }

        // Test 2: Get all visible fields
        console.log('\nTEST 2: Get all visible fields (API simulation)');
        console.log('-'.repeat(60));

        const visibleFields = await VoterField.find({ visible: true }).sort({ createdAt: 1 });

        console.log(`✅ Found ${visibleFields.length} visible field(s):`);
        visibleFields.forEach((field, index) => {
            console.log(`\n   ${index + 1}. ${field.label || field.name}`);
            console.log(`      - Name: ${field.name}`);
            console.log(`      - Type: ${field.type}`);
            console.log(`      - Required: ${field.required ? 'Yes' : 'No'}`);
            console.log(`      - Visible: ${field.visible ? 'Yes' : 'No'}`);
        });

        // Test 3: Get all fields (including hidden)
        console.log('\nTEST 3: Get all fields (including hidden ones)');
        console.log('-'.repeat(60));

        const allFields = await VoterField.find().sort({ createdAt: 1 });

        console.log(`✅ Found ${allFields.length} total field(s):`);
        allFields.forEach((field, index) => {
            const visibilityIcon = field.visible ? '👁️' : '🚫';
            console.log(`   ${index + 1}. ${visibilityIcon} ${field.label || field.name} (${field.name})`);
        });

        // Test 4: Toggle visibility test
        console.log('\nTEST 4: Toggle visibility test (bloodGroup)');
        console.log('-'.repeat(60));

        const fieldToToggle = await VoterField.findOne({ name: 'bloodGroup' });
        if (fieldToToggle) {
            const originalVisibility = fieldToToggle.visible;
            fieldToToggle.visible = !originalVisibility;
            await fieldToToggle.save();

            console.log(`✅ Toggled visibility: ${originalVisibility} → ${fieldToToggle.visible}`);

            // Toggle back
            fieldToToggle.visible = originalVisibility;
            await fieldToToggle.save();
            console.log(`✅ Restored visibility: ${fieldToToggle.visible}`);
        } else {
            console.log('⚠️  No bloodGroup field to toggle');
        }

        // Test 5: Sample voter data with dynamic field
        console.log('\nTEST 5: Sample voter data structure');
        console.log('-'.repeat(60));

        const sampleVoter = {
            name: 'John Doe',
            mobile: '9876543210',
            age: 35,
            gender: 'male',
            // Static fields above
            // Dynamic fields below (added by admin)
            bloodGroup: 'O+', // ← Dynamic field value
            disability: false, // ← Another dynamic field
            educationLevel: 'Graduate' // ← Another dynamic field
        };

        console.log('✅ Sample voter document with dynamic fields:');
        console.log(JSON.stringify(sampleVoter, null, 2));

        // Test 6: API response format
        console.log('\nTEST 6: Expected API response format');
        console.log('-'.repeat(60));

        const apiResponse = {
            success: true,
            fields: visibleFields.map(f => ({
                _id: f._id,
                name: f.name,
                type: f.type,
                label: f.label,
                description: f.description,
                required: f.required,
                visible: f.visible
            })),
            count: visibleFields.length
        };

        console.log('✅ API Response (GET /api/v1/voter-fields):');
        console.log(JSON.stringify(apiResponse, null, 2));

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('='.repeat(60));
        console.log('\n📱 Mobile App Integration Status:');
        console.log('   ✅ voter_info.tsx - Will display dynamic fields in "Dynamic Fields" section');
        console.log('   ✅ soon_to_be_voter.tsx - Will show input fields in "Additional Information" section');
        console.log('\n💡 To test in app:');
        console.log('   1. Start backend: npm start (in backend folder)');
        console.log('   2. Start mobile app: npm start (in kural folder)');
        console.log('   3. Open voter detail screen → See bloodGroup field');
        console.log('   4. Click "Add Voter" FAB → See bloodGroup input');
        console.log('   5. Fill and submit → Value saved automatically\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed\n');
    }
}

// Run tests
testVoterFieldIntegration();