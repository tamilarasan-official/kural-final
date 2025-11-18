/**
 * Seed Script for Dynamic Fields
 * Run this script to populate initial dynamic fields in MongoDB
 * 
 * Usage: node seed-dynamic-fields.js
 */

const mongoose = require('mongoose');
const config = require('../config/config');
const DynamicField = require('../src/models/DynamicField');

// Connect to MongoDB
const connectDB = async() => {
    try {
        await mongoose.connect(config.DATABASE_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sample dynamic fields for voter registration
const voterRegistrationFields = [{
        fieldId: 'voter_full_name',
        label: {
            english: 'Full Name',
            tamil: 'முழு பெயர்'
        },
        fieldType: 'text',
        placeholder: {
            english: 'Enter full name',
            tamil: 'முழு பெயரை உள்ளிடவும்'
        },
        validation: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        config: {
            autoCapitalize: 'words'
        },
        order: 1,
        category: 'personal',
        applicableTo: ['voter_registration'],
        status: 'active'
    },
    {
        fieldId: 'voter_email',
        label: {
            english: 'Email Address',
            tamil: 'மின்னஞ்சல் முகவரி'
        },
        fieldType: 'email',
        placeholder: {
            english: 'Enter email address',
            tamil: 'மின்னஞ்சல் முகவரியை உள்ளிடவும்'
        },
        validation: {
            required: false,
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        config: {
            keyboardType: 'email-address',
            autoCapitalize: 'none'
        },
        order: 2,
        category: 'personal',
        applicableTo: ['voter_registration'],
        status: 'active'
    },
    {
        fieldId: 'voter_phone',
        label: {
            english: 'Phone Number',
            tamil: 'தொலைபேசி எண்'
        },
        fieldType: 'phone',
        placeholder: {
            english: 'Enter phone number',
            tamil: 'தொலைபேசி எண்ணை உள்ளிடவும்'
        },
        validation: {
            required: true,
            minLength: 10,
            maxLength: 15,
            pattern: '^[0-9+\\-\\s()]+$'
        },
        config: {
            keyboardType: 'phone-pad'
        },
        order: 3,
        category: 'personal',
        applicableTo: ['voter_registration'],
        status: 'active'
    },
    {
        fieldId: 'voter_age',
        label: {
            english: 'Age',
            tamil: 'வயது'
        },
        fieldType: 'number',
        placeholder: {
            english: 'Enter age',
            tamil: 'வயதை உள்ளிடவும்'
        },
        validation: {
            required: true,
            min: 18,
            max: 120
        },
        config: {
            keyboardType: 'numeric'
        },
        order: 4,
        category: 'personal',
        applicableTo: ['voter_registration'],
        status: 'active'
    },
    {
        fieldId: 'voter_gender',
        label: {
            english: 'Gender',
            tamil: 'பாலினம்'
        },
        fieldType: 'radio',
        options: [{
                value: 'male',
                label: { english: 'Male', tamil: 'ஆண்' },
                order: 1
            },
            {
                value: 'female',
                label: { english: 'Female', tamil: 'பெண்' },
                order: 2
            },
            {
                value: 'other',
                label: { english: 'Other', tamil: 'மற்றவை' },
                order: 3
            }
        ],
        validation: {
            required: true
        },
        order: 5,
        category: 'personal',
        applicableTo: ['voter_registration'],
        status: 'active'
    },
    {
        fieldId: 'voter_address',
        label: {
            english: 'Address',
            tamil: 'முகவரி'
        },
        fieldType: 'textarea',
        placeholder: {
            english: 'Enter full address',
            tamil: 'முழு முகவரியை உள்ளிடவும்'
        },
        helpText: {
            english: 'Include street, city, state, and postal code',
            tamil: 'தெரு, நகரம், மாநிலம் மற்றும் அஞ்சல் குறியீட்டைச் சேர்க்கவும்'
        },
        validation: {
            required: true,
            maxLength: 500
        },
        config: {
            numberOfLines: 4,
            multiline: true
        },
        order: 6,
        category: 'address',
        applicableTo: ['voter_registration'],
        status: 'active'
    },
    {
        fieldId: 'voter_education',
        label: {
            english: 'Education Level',
            tamil: 'கல்வி நிலை'
        },
        fieldType: 'dropdown',
        options: [{
                value: 'no_formal',
                label: { english: 'No Formal Education', tamil: 'முறையான கல்வி இல்லை' },
                order: 1
            },
            {
                value: 'primary',
                label: { english: 'Primary School', tamil: 'ஆரம்பப் பள்ளி' },
                order: 2
            },
            {
                value: 'secondary',
                label: { english: 'Secondary School', tamil: 'இடைநிலைப் பள்ளி' },
                order: 3
            },
            {
                value: 'higher_secondary',
                label: { english: 'Higher Secondary', tamil: 'உயர்நிலை' },
                order: 4
            },
            {
                value: 'graduate',
                label: { english: 'Graduate', tamil: 'பட்டதாரி' },
                order: 5
            },
            {
                value: 'postgraduate',
                label: { english: 'Postgraduate', tamil: 'முதுகலை' },
                order: 6
            }
        ],
        validation: {
            required: false
        },
        order: 7,
        category: 'additional',
        applicableTo: ['voter_registration'],
        status: 'active'
    },
    {
        fieldId: 'voter_occupation',
        label: {
            english: 'Occupation',
            tamil: 'தொழில்'
        },
        fieldType: 'text',
        placeholder: {
            english: 'Enter occupation',
            tamil: 'தொழிலை உள்ளிடவும்'
        },
        validation: {
            required: false,
            maxLength: 100
        },
        order: 8,
        category: 'additional',
        applicableTo: ['voter_registration'],
        status: 'active'
    }
];

// Sample dynamic fields for survey forms
const surveyFields = [{
        fieldId: 'survey_satisfaction',
        label: {
            english: 'How satisfied are you?',
            tamil: 'நீங்கள் எவ்வளவு திருப்தியாக இருக்கிறீர்கள்?'
        },
        fieldType: 'rating',
        helpText: {
            english: 'Rate from 1 to 5 stars',
            tamil: '1 முதல் 5 நட்சத்திரங்கள் வரை மதிப்பிடவும்'
        },
        validation: {
            required: true,
            min: 1,
            max: 5
        },
        config: {
            maximumValue: 5
        },
        order: 1,
        category: 'feedback',
        applicableTo: ['survey'],
        status: 'active'
    },
    {
        fieldId: 'survey_recommendation',
        label: {
            english: 'Would you recommend us?',
            tamil: 'எங்களை பரிந்துரைப்பீர்களா?'
        },
        fieldType: 'radio',
        options: [{
                value: 'yes',
                label: { english: 'Yes', tamil: 'ஆம்' },
                order: 1
            },
            {
                value: 'no',
                label: { english: 'No', tamil: 'இல்லை' },
                order: 2
            },
            {
                value: 'maybe',
                label: { english: 'Maybe', tamil: 'ஒருவேளை' },
                order: 3
            }
        ],
        validation: {
            required: true
        },
        order: 2,
        category: 'feedback',
        applicableTo: ['survey'],
        status: 'active'
    },
    {
        fieldId: 'survey_improvements',
        label: {
            english: 'What can we improve?',
            tamil: 'நாம் எதை மேம்படுத்தலாம்?'
        },
        fieldType: 'checkbox',
        options: [{
                value: 'service',
                label: { english: 'Service Quality', tamil: 'சேவை தரம்' },
                order: 1
            },
            {
                value: 'speed',
                label: { english: 'Speed', tamil: 'வேகம்' },
                order: 2
            },
            {
                value: 'pricing',
                label: { english: 'Pricing', tamil: 'விலை' },
                order: 3
            },
            {
                value: 'support',
                label: { english: 'Support', tamil: 'ஆதரவு' },
                order: 4
            }
        ],
        helpText: {
            english: 'Select all that apply',
            tamil: 'பொருந்தும் அனைத்தையும் தேர்ந்தெடுக்கவும்'
        },
        order: 3,
        category: 'feedback',
        applicableTo: ['survey'],
        status: 'active'
    },
    {
        fieldId: 'survey_comments',
        label: {
            english: 'Additional Comments',
            tamil: 'கூடுதல் கருத்துகள்'
        },
        fieldType: 'textarea',
        placeholder: {
            english: 'Share your thoughts...',
            tamil: 'உங்கள் எண்ணங்களைப் பகிரவும்...'
        },
        validation: {
            required: false,
            maxLength: 1000
        },
        config: {
            numberOfLines: 5,
            multiline: true
        },
        order: 4,
        category: 'feedback',
        applicableTo: ['survey'],
        status: 'active'
    }
];

// Seed function
const seedDynamicFields = async() => {
    try {
        console.log('🌱 Starting to seed dynamic fields...');

        // Clear existing dynamic fields (optional - comment out if you don't want to clear)
        await DynamicField.deleteMany({});
        console.log('🗑️  Cleared existing dynamic fields');

        // Insert voter registration fields
        const voterFields = await DynamicField.insertMany(voterRegistrationFields);
        console.log(`✅ Created ${voterFields.length} voter registration fields`);

        // Insert survey fields
        const survFields = await DynamicField.insertMany(surveyFields);
        console.log(`✅ Created ${survFields.length} survey fields`);

        console.log('🎉 Successfully seeded all dynamic fields!');
        console.log('\n📊 Summary:');
        console.log(`   - Total fields created: ${voterFields.length + survFields.length}`);
        console.log(`   - Voter registration fields: ${voterFields.length}`);
        console.log(`   - Survey fields: ${survFields.length}`);

        // Display field IDs for reference
        console.log('\n📋 Field IDs created:');
        console.log('   Voter Registration:');
        voterFields.forEach(field => {
            console.log(`      - ${field.fieldId} (${field.fieldType})`);
        });
        console.log('   Survey:');
        survFields.forEach(field => {
            console.log(`      - ${field.fieldId} (${field.fieldType})`);
        });

    } catch (error) {
        console.error('❌ Error seeding dynamic fields:', error);
        throw error;
    }
};

// Run the seed script
const run = async() => {
    try {
        await connectDB();
        await seedDynamicFields();
        console.log('\n✅ All done! Closing database connection...');
        await mongoose.connection.close();
        console.log('👋 Database connection closed. Goodbye!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
};

// Execute if run directly
if (require.main === module) {
    run();
}

module.exports = { seedDynamicFields };