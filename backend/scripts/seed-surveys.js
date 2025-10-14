const mongoose = require('mongoose');
const config = require('../config/config');
const Survey = require('../src/models/Survey');

// Connect to MongoDB
mongoose.connect(config.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected...');
  seedSurveys();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

const seedSurveys = async () => {
  try {
    console.log('🌱 Seeding Survey data...');

    // Clear existing surveys
    await Survey.deleteMany({});
    console.log('🗑️  Cleared existing surveys');

    // Sample survey data
    const surveys = [
      {
        formNumber: 1,
        formId: 'FORM001',
        title: 'Voter Opinion Poll Questions',
        tamilTitle: 'வாக்காளர் கருத்துக்கணிப்பு கேள்விகள்',
        description: 'General voter opinion and feedback survey',
        status: 'Active',
        questions: [
          {
            questionId: 'q1',
            questionText: 'How satisfied are you with the current government?',
            questionType: 'rating',
            required: true,
            order: 1
          },
          {
            questionId: 'q2',
            questionText: 'What is your main concern?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'Economy', optionValue: 'economy' },
              { optionId: 'opt2', optionText: 'Healthcare', optionValue: 'healthcare' },
              { optionId: 'opt3', optionText: 'Education', optionValue: 'education' },
              { optionId: 'opt4', optionText: 'Infrastructure', optionValue: 'infrastructure' }
            ],
            required: true,
            order: 2
          }
        ],
        activeElection: '118 - Thondamuthur',
        isPublished: true,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        formNumber: 2,
        formId: 'FORM002',
        title: 'Voter Opinion Poll Questions',
        tamilTitle: 'வாக்காளர் கருத்துக்கணிப்பு கேள்விகள்',
        description: 'Detailed voter feedback and suggestions survey',
        status: 'Active',
        questions: [
          {
            questionId: 'q1',
            questionText: 'Rate the performance of local representatives',
            questionType: 'rating',
            required: true,
            order: 1
          },
          {
            questionId: 'q2',
            questionText: 'What improvements do you suggest?',
            questionType: 'text',
            required: false,
            order: 2
          }
        ],
        activeElection: '118 - Thondamuthur',
        isPublished: true,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        formNumber: 3,
        formId: 'FORM003',
        title: 'Voter Opinion Poll Questions',
        tamilTitle: 'வாக்காளர் கருத்துக்கணிப்பு கேள்விகள்',
        description: 'Comprehensive voter satisfaction and policy feedback survey',
        status: 'Active',
        questions: [
          {
            questionId: 'q1',
            questionText: 'How would you rate the overall governance?',
            questionType: 'rating',
            required: true,
            order: 1
          },
          {
            questionId: 'q2',
            questionText: 'What are your top priorities?',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'Job Creation', optionValue: 'jobs' },
              { optionId: 'opt2', optionText: 'Healthcare', optionValue: 'healthcare' },
              { optionId: 'opt3', optionText: 'Education', optionValue: 'education' },
              { optionId: 'opt4', optionText: 'Infrastructure', optionValue: 'infrastructure' }
            ],
            required: true,
            order: 2
          }
        ],
        activeElection: '118 - Thondamuthur',
        isPublished: true,
        createdBy: new mongoose.Types.ObjectId()
      }
    ];

    // Insert surveys
    const createdSurveys = await Survey.insertMany(surveys);
    console.log(`✅ Created ${createdSurveys.length} surveys`);

    // Display created surveys
    createdSurveys.forEach(survey => {
      console.log(`📋 Form ${survey.formNumber}: ${survey.tamilTitle} (${survey.status})`);
    });

    console.log('🎉 Survey seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding surveys:', error);
    process.exit(1);
  }
};
