const mongoose = require('mongoose');
const MasterDataSection = require('../src/models/MasterDataSection');
const config = require('../config/config');

/**
 * Seed Master Data Sections
 * Run: node scripts/seed-master-data.js
 */

const masterDataSections = [{
        sectionName: 'Social & Demographic',
        sectionNameTamil: 'சமூக & மக்கள்தொகை',
        order: 1,
        icon: 'people',
        description: 'Social and demographic information',
        descriptionTamil: 'சமூக மற்றும் மக்கள்தொகை தகவல்',
        isActive: true,
        questions: [{
                questionId: 'marital_status',
                questionText: 'Marital Status',
                questionTextTamil: 'திருமண நிலை',
                fieldType: 'select',
                options: [
                    { label: 'Single', labelTamil: 'திருமணமாகாதவர்', value: 'single' },
                    { label: 'Married', labelTamil: 'திருமணமானவர்', value: 'married' },
                    { label: 'Widowed', labelTamil: 'விதவை/விடுபட்டவர்', value: 'widowed' },
                    { label: 'Divorced', labelTamil: 'விவாகரத்து', value: 'divorced' },
                ],
                required: true,
                order: 1,
            },
            {
                questionId: 'family_members',
                questionText: 'Number of Family Members',
                questionTextTamil: 'குடும்ப உறுப்பினர்களின் எண்ணிக்கை',
                fieldType: 'number',
                required: true,
                placeholder: 'Enter number',
                placeholderTamil: 'எண்ணை உள்ளிடவும்',
                order: 2,
                validation: {
                    min: 1,
                    max: 50,
                },
            },
            {
                questionId: 'mother_tongue',
                questionText: 'Mother Tongue',
                questionTextTamil: 'தாய்மொழி',
                fieldType: 'select',
                options: [
                    { label: 'Tamil', labelTamil: 'தமிழ்', value: 'tamil' },
                    { label: 'Telugu', labelTamil: 'தெலுங்கு', value: 'telugu' },
                    { label: 'Malayalam', labelTamil: 'மலையாளம்', value: 'malayalam' },
                    { label: 'Kannada', labelTamil: 'கன்னடம்', value: 'kannada' },
                    { label: 'Hindi', labelTamil: 'இந்தி', value: 'hindi' },
                    { label: 'Other', labelTamil: 'மற்றவை', value: 'other' },
                ],
                required: false,
                order: 3,
            },
        ],
    },
    {
        sectionName: 'Household & Assets',
        sectionNameTamil: 'வீடு & சொத்துக்கள்',
        order: 2,
        icon: 'home',
        description: 'Household and asset information',
        descriptionTamil: 'வீடு மற்றும் சொத்து தகவல்',
        isActive: true,
        questions: [{
                questionId: 'house_ownership',
                questionText: 'House Ownership',
                questionTextTamil: 'வீட்டு உரிமை',
                fieldType: 'radio',
                options: [
                    { label: 'Own', labelTamil: 'சொந்தம்', value: 'own' },
                    { label: 'Rented', labelTamil: 'வாடகை', value: 'rented' },
                    { label: 'Leased', labelTamil: 'குத்தகை', value: 'leased' },
                ],
                required: true,
                order: 1,
            },
            {
                questionId: 'house_type',
                questionText: 'Type of House',
                questionTextTamil: 'வீட்டின் வகை',
                fieldType: 'select',
                options: [
                    { label: 'Pucca (Concrete)', labelTamil: 'பக்கா (கான்கிரீட்)', value: 'pucca' },
                    { label: 'Semi-Pucca', labelTamil: 'அரை-பக்கா', value: 'semi_pucca' },
                    { label: 'Kutcha (Thatched)', labelTamil: 'குட்சா (ஓலை)', value: 'kutcha' },
                ],
                required: false,
                order: 2,
            },
            {
                questionId: 'vehicles',
                questionText: 'Vehicles Owned',
                questionTextTamil: 'சொந்த வாகனங்கள்',
                fieldType: 'multiselect',
                options: [
                    { label: 'Two-Wheeler', labelTamil: 'இருசக்கர வாகனம்', value: 'two_wheeler' },
                    { label: 'Four-Wheeler', labelTamil: 'நான்கு சக்கர வாகனம்', value: 'four_wheeler' },
                    { label: 'Bicycle', labelTamil: 'மிதிவண்டி', value: 'bicycle' },
                    { label: 'None', labelTamil: 'ஏதுமில்லை', value: 'none' },
                ],
                required: false,
                order: 3,
            },
            {
                questionId: 'land_ownership',
                questionText: 'Land Ownership (in acres)',
                questionTextTamil: 'நில உரிமை (ஏக்கரில்)',
                fieldType: 'number',
                required: false,
                placeholder: 'Enter land in acres',
                placeholderTamil: 'ஏக்கரில் நிலத்தை உள்ளிடவும்',
                order: 4,
                validation: {
                    min: 0,
                    max: 10000,
                },
            },
        ],
    },
    {
        sectionName: 'Education & Employment',
        sectionNameTamil: 'கல்வி & வேலைவாய்ப்பு',
        order: 3,
        icon: 'school',
        description: 'Education and employment details',
        descriptionTamil: 'கல்வி மற்றும் வேலைவாய்ப்பு விவரங்கள்',
        isActive: true,
        questions: [{
                questionId: 'education_level',
                questionText: 'Education Level',
                questionTextTamil: 'கல்வி நிலை',
                fieldType: 'select',
                options: [
                    { label: 'Illiterate', labelTamil: 'படிக்காதவர்', value: 'illiterate' },
                    { label: 'Primary (1-5)', labelTamil: 'முதல்நிலை (1-5)', value: 'primary' },
                    { label: 'Middle (6-8)', labelTamil: 'நடுநிலை (6-8)', value: 'middle' },
                    { label: 'Secondary (9-10)', labelTamil: 'இடைநிலை (9-10)', value: 'secondary' },
                    { label: 'Higher Secondary (11-12)', labelTamil: 'மேல்நிலை (11-12)', value: 'higher_secondary' },
                    { label: 'Graduate', labelTamil: 'பட்டதாரி', value: 'graduate' },
                    { label: 'Post Graduate', labelTamil: 'முதுகலை பட்டதாரி', value: 'post_graduate' },
                ],
                required: true,
                order: 1,
            },
            {
                questionId: 'employment_status',
                questionText: 'Employment Status',
                questionTextTamil: 'வேலைவாய்ப்பு நிலை',
                fieldType: 'radio',
                options: [
                    { label: 'Employed', labelTamil: 'வேலையுள்ளவர்', value: 'employed' },
                    { label: 'Self-Employed', labelTamil: 'சுயதொழில்', value: 'self_employed' },
                    { label: 'Unemployed', labelTamil: 'வேலையில்லாதவர்', value: 'unemployed' },
                    { label: 'Student', labelTamil: 'மாணவர்', value: 'student' },
                    { label: 'Retired', labelTamil: 'ஓய்வு பெற்றவர்', value: 'retired' },
                ],
                required: true,
                order: 2,
            },
            {
                questionId: 'occupation',
                questionText: 'Occupation',
                questionTextTamil: 'தொழில்',
                fieldType: 'text',
                required: false,
                placeholder: 'Enter occupation',
                placeholderTamil: 'தொழிலை உள்ளிடவும்',
                order: 3,
                validation: {
                    maxLength: 100,
                },
            },
            {
                questionId: 'monthly_income',
                questionText: 'Monthly Income Range',
                questionTextTamil: 'மாதாந்திர வருமான வரம்பு',
                fieldType: 'select',
                options: [
                    { label: 'Below ₹10,000', labelTamil: '₹10,000-க்கு கீழ்', value: 'below_10k' },
                    { label: '₹10,000 - ₹25,000', labelTamil: '₹10,000 - ₹25,000', value: '10k_25k' },
                    { label: '₹25,000 - ₹50,000', labelTamil: '₹25,000 - ₹50,000', value: '25k_50k' },
                    { label: '₹50,000 - ₹1,00,000', labelTamil: '₹50,000 - ₹1,00,000', value: '50k_100k' },
                    { label: 'Above ₹1,00,000', labelTamil: '₹1,00,000-க்கு மேல்', value: 'above_100k' },
                ],
                required: false,
                order: 4,
            },
        ],
    },
    {
        sectionName: 'Health & Welfare',
        sectionNameTamil: 'சுகாதாரம் & நலன்',
        order: 4,
        icon: 'local-hospital',
        description: 'Health and welfare benefits',
        descriptionTamil: 'சுகாதாரம் மற்றும் நலன் பயன்கள்',
        isActive: true,
        questions: [{
                questionId: 'health_insurance',
                questionText: 'Do you have health insurance?',
                questionTextTamil: 'உங்களிடம் சுகாதார காப்பீடு உள்ளதா?',
                fieldType: 'radio',
                options: [
                    { label: 'Yes', labelTamil: 'ஆம்', value: 'yes' },
                    { label: 'No', labelTamil: 'இல்லை', value: 'no' },
                ],
                required: false,
                order: 1,
            },
            {
                questionId: 'government_schemes',
                questionText: 'Enrolled in Government Schemes',
                questionTextTamil: 'அரசு திட்டங்களில் பதிவு',
                fieldType: 'multiselect',
                options: [
                    { label: 'Ration Card', labelTamil: 'ரேஷன் அட்டை', value: 'ration_card' },
                    { label: 'Ayushman Bharat', labelTamil: 'ஆயுஷ்மான் பாரத்', value: 'ayushman' },
                    { label: 'PM Kisan', labelTamil: 'பிரதமர் கிசான்', value: 'pm_kisan' },
                    { label: 'Old Age Pension', labelTamil: 'முதுமை ஓய்வூதியம்', value: 'old_age_pension' },
                    { label: 'Widow Pension', labelTamil: 'விதவை ஓய்வூதியம்', value: 'widow_pension' },
                    { label: 'None', labelTamil: 'ஏதுமில்லை', value: 'none' },
                ],
                required: false,
                order: 2,
            },
            {
                questionId: 'chronic_illness',
                questionText: 'Any Chronic Illness?',
                questionTextTamil: 'ஏதேனும் நாள்பட்ட நோய்?',
                fieldType: 'textarea',
                required: false,
                placeholder: 'Describe if any',
                placeholderTamil: 'ஏதேனும் இருந்தால் விவரிக்கவும்',
                order: 3,
                validation: {
                    maxLength: 500,
                },
            },
        ],
    },
];

async function seedMasterData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.DATABASE_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing sections
        await MasterDataSection.deleteMany({});
        console.log('🗑️  Cleared existing master data sections');

        // Insert new sections
        const result = await MasterDataSection.insertMany(masterDataSections);
        console.log(`✅ Inserted ${result.length} master data sections`);

        // Display summary
        console.log('\n📊 Summary:');
        result.forEach((section, index) => {
            console.log(`${index + 1}. ${section.sectionName} (${section.questions.length} questions)`);
        });

        console.log('\n✅ Master data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding master data:', error);
        process.exit(1);
    }
}

// Run the seed function
seedMasterData();