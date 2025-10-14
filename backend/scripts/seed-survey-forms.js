const mongoose = require('mongoose');
const config = require('../config/config');
const SurveyForm = require('../src/models/SurveyForm');

// Connect to MongoDB
mongoose.connect(config.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected...');
  seedSurveyForms();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

const seedSurveyForms = async () => {
  try {
    console.log('🌱 Seeding Survey Forms data...');

    // Clear existing survey forms
    await SurveyForm.deleteMany({});
    console.log('🗑️  Cleared existing survey forms');

    // Sample survey form data based on the images
    const surveyForms = [
      {
        formId: 'FORM001',
        title: 'Voter Opinion Poll Questions',
        tamilTitle: 'வாக்காளர் கருத்துக்கணிப்பு கேள்விகள்',
        description: 'Comprehensive voter opinion and feedback survey',
        instructions: 'Please fill out the form below. Fields marked with * are required.',
        status: 'Active',
        questions: [
          {
            questionId: 'q1',
            questionText: 'Your Name',
            questionType: 'text',
            required: true,
            order: 1,
            validation: {
              minLength: 2,
              maxLength: 50
            }
          },
          {
            questionId: 'q2',
            questionText: 'Your Mobile Number',
            questionType: 'text',
            required: true,
            order: 2,
            validation: {
              pattern: '^[0-9]{10}$'
            }
          },
          {
            questionId: 'q3',
            questionText: 'Your Age',
            questionType: 'text',
            required: true,
            order: 3,
            validation: {
              pattern: '^[0-9]{1,3}$'
            }
          },
          {
            questionId: 'q4',
            questionText: 'Your City/Village',
            questionType: 'text',
            required: true,
            order: 4,
            validation: {
              minLength: 2,
              maxLength: 100
            }
          },
          {
            questionId: 'q5',
            questionText: 'Your Voter Id',
            questionType: 'text',
            required: false,
            order: 5
          },
          {
            questionId: 'q6',
            questionText: 'சாதாரணமாக நீங்கள் எந்த கட்சியை ஆதரிக்கிறீர்கள்?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'தி.மு.', optionValue: 'dmk' },
              { optionId: 'opt2', optionText: 'அ.தி.மு.', optionValue: 'aiadmk' },
              { optionId: 'opt3', optionText: 'பா.ஜ.', optionValue: 'bjp' },
              { optionId: 'opt4', optionText: 'கா.', optionValue: 'congress' },
              { optionId: 'opt5', optionText: 'நாம்', optionValue: 'ntk' },
              { optionId: 'opt6', optionText: 'மற்ற', optionValue: 'other' }
            ],
            required: true,
            order: 6
          },
          {
            questionId: 'q7',
            questionText: 'வரும் 2026 சட்டமன்ற தேர்தலில் நீங்கள் யாருக்கு வாக்களிக்க இருக்கிறீர்கள்?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'வேட்பாளர் பெயரை', optionValue: 'candidate_name' },
              { optionId: 'opt2', optionText: 'கட்சியை', optionValue: 'party' },
              { optionId: 'opt3', optionText: 'இன்னும்', optionValue: 'undecided' },
              { optionId: 'opt4', optionText: 'வாக்களிக்கப்', optionValue: 'will_vote' }
            ],
            required: true,
            order: 7
          },
          {
            questionId: 'q8',
            questionText: 'தற்போதைய உங்கள் பகுதியில் மிக முக்கியமான பிரச்சனை எது',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'குடிநீர்', optionValue: 'drinking_water' },
              { optionId: 'opt2', optionText: 'சாலை வசதி', optionValue: 'road_facility' },
              { optionId: 'opt3', optionText: 'வேலைவாய்ப்பு', optionValue: 'employment' },
              { optionId: 'opt4', optionText: 'ஊழல்', optionValue: 'corruption' },
              { optionId: 'opt5', optionText: 'மின்சாரம்', optionValue: 'electricity' },
              { optionId: 'opt6', optionText: 'பெண்களின் பாதுகாப்பு', optionValue: 'women_safety' },
              { optionId: 'opt7', optionText: 'கல்வி', optionValue: 'education' },
              { optionId: 'opt8', optionText: 'பிற', optionValue: 'other' }
            ],
            required: true,
            order: 8
          },
          {
            questionId: 'q9',
            questionText: 'உங்கள் தற்போதைய MLA-வின் செயல்பாட்டில் நீங்கள் திருப்தியாக இருக்கிறீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'சில நேரங்களில்', optionValue: 'sometimes' },
              { optionId: 'opt4', optionText: 'தெரியவில்லை', optionValue: 'dont_know' }
            ],
            required: true,
            order: 9
          },
          {
            questionId: 'q10',
            questionText: 'கடந்த தேர்தலுக்குப் பிறகு ஏதேனும் ஒரு கட்சி உங்களை தொடர்புகொண்டதா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'தேர்தலின்போது மட்டும்', optionValue: 'during_election' }
            ],
            required: true,
            order: 10
          },
          {
            questionId: 'q11',
            questionText: 'வேட்பாளர்கள் உங்களிடம் தொடர்பு கொள்ள எந்த முறையை நீங்கள் விரும்புகிறீர்கள்?',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'வீடு வீடாக', optionValue: 'door_to_door' },
              { optionId: 'opt2', optionText: 'வாட்ஸ்அப்', optionValue: 'whatsapp' },
              { optionId: 'opt3', optionText: 'தொலைபேசி', optionValue: 'phone' },
              { optionId: 'opt4', optionText: 'பொதுக் கூட்டம்', optionValue: 'public_meeting' },
              { optionId: 'opt5', optionText: 'சமூக ஊடகம்', optionValue: 'social_media' }
            ],
            required: true,
            order: 11
          },
          {
            questionId: 'q12',
            questionText: 'உங்கள் ஓட்டு மாற்றத்தை உருவாக்கும் என நம்புகிறீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'நிச்சயமில்லை', optionValue: 'uncertain' }
            ],
            required: true,
            order: 12
          },
          {
            questionId: 'q13',
            questionText: 'ஒரு சிறந்த வேட்பாளரிடம் நீங்கள் எதிர்பார்க்கும் முக்கிய பண்புகள் என்ன?',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'கல்வியுள்ள', optionValue: 'educated' },
              { optionId: 'opt2', optionText: 'எளிதில் அணுகக்கூடிய', optionValue: 'approachable' },
              { optionId: 'opt3', optionText: 'நேர்மையான', optionValue: 'honest' },
              { optionId: 'opt4', optionText: 'உள்ளூரில் வாழ்பவர்', optionValue: 'local_resident' },
              { optionId: 'opt5', optionText: 'ஊழலில்லாத', optionValue: 'non_corrupt' }
            ],
            required: true,
            order: 13
          },
          {
            questionId: 'q14',
            questionText: 'உங்கள் பகுதியில் ஒரு நல்ல வேட்பாளரை ஆதரிக்க அல்லது களத்தில் உதவ நீங்கள் தயாராக இருக்கிறீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'யோசித்து பார்க்கிறேன்', optionValue: 'considering' }
            ],
            required: true,
            order: 14
          },
          {
            questionId: 'q15',
            questionText: 'உங்கள் பகுதியில் உள்ள MLA அல்லது MP-வின் பெயரை நீங்கள் அறிந்துள்ளீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' }
            ],
            required: true,
            order: 15
          }
        ],
        activeElection: '118 - Thondamuthur',
        isPublished: true,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        formId: 'FORM002',
        title: 'Community Issues Survey',
        tamilTitle: 'சமூக பிரச்சனைகள் கணிப்பு',
        description: 'Survey about local community issues and concerns',
        instructions: 'Please fill out the form below. Fields marked with * are required.',
        status: 'Active',
        questions: [
          {
            questionId: 'q1',
            questionText: 'Your Name',
            questionType: 'text',
            required: true,
            order: 1,
            validation: {
              minLength: 2,
              maxLength: 50
            }
          },
          {
            questionId: 'q2',
            questionText: 'Your Mobile Number',
            questionType: 'text',
            required: true,
            order: 2,
            validation: {
              pattern: '^[0-9]{10}$'
            }
          },
          {
            questionId: 'q3',
            questionText: 'Your Age',
            questionType: 'text',
            required: true,
            order: 3,
            validation: {
              pattern: '^[0-9]{1,3}$'
            }
          },
          {
            questionId: 'q4',
            questionText: 'Your City/Village',
            questionType: 'text',
            required: true,
            order: 4,
            validation: {
              minLength: 2,
              maxLength: 100
            }
          },
          {
            questionId: 'q5',
            questionText: 'Your Voter Id',
            questionType: 'text',
            required: false,
            order: 5
          },
          {
            questionId: 'q6',
            questionText: 'சாதாரணமாக நீங்கள் எந்த கட்சியை ஆதரிக்கிறீர்கள்?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'தி.மு.', optionValue: 'dmk' },
              { optionId: 'opt2', optionText: 'அ.தி.மு.', optionValue: 'aiadmk' },
              { optionId: 'opt3', optionText: 'பா.ஜ.', optionValue: 'bjp' },
              { optionId: 'opt4', optionText: 'கா.', optionValue: 'congress' },
              { optionId: 'opt5', optionText: 'நாம்', optionValue: 'ntk' },
              { optionId: 'opt6', optionText: 'மற்ற', optionValue: 'other' }
            ],
            required: true,
            order: 6
          },
          {
            questionId: 'q7',
            questionText: 'வரும் 2026 சட்டமன்ற தேர்தலில் நீங்கள் யாருக்கு வாக்களிக்க இருக்கிறீர்கள்?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'வேட்பாளர் பெயரை', optionValue: 'candidate_name' },
              { optionId: 'opt2', optionText: 'கட்சியை', optionValue: 'party' },
              { optionId: 'opt3', optionText: 'இன்னும்', optionValue: 'undecided' },
              { optionId: 'opt4', optionText: 'வாக்களிக்கப்', optionValue: 'will_vote' }
            ],
            required: true,
            order: 7
          },
          {
            questionId: 'q8',
            questionText: 'தற்போதைய உங்கள் பகுதியில் மிக முக்கியமான பிரச்சனை எது',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'குடிநீர்', optionValue: 'drinking_water' },
              { optionId: 'opt2', optionText: 'சாலை வசதி', optionValue: 'road_facility' },
              { optionId: 'opt3', optionText: 'வேலைவாய்ப்பு', optionValue: 'employment' },
              { optionId: 'opt4', optionText: 'ஊழல்', optionValue: 'corruption' },
              { optionId: 'opt5', optionText: 'மின்சாரம்', optionValue: 'electricity' },
              { optionId: 'opt6', optionText: 'பெண்களின் பாதுகாப்பு', optionValue: 'women_safety' },
              { optionId: 'opt7', optionText: 'கல்வி', optionValue: 'education' },
              { optionId: 'opt8', optionText: 'பிற', optionValue: 'other' }
            ],
            required: true,
            order: 8
          },
          {
            questionId: 'q9',
            questionText: 'உங்கள் தற்போதைய MLA-வின் செயல்பாட்டில் நீங்கள் திருப்தியாக இருக்கிறீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'சில நேரங்களில்', optionValue: 'sometimes' },
              { optionId: 'opt4', optionText: 'தெரியவில்லை', optionValue: 'dont_know' }
            ],
            required: true,
            order: 9
          },
          {
            questionId: 'q10',
            questionText: 'கடந்த தேர்தலுக்குப் பிறகு ஏதேனும் ஒரு கட்சி உங்களை தொடர்புகொண்டதா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'தேர்தலின்போது மட்டும்', optionValue: 'during_election' }
            ],
            required: true,
            order: 10
          },
          {
            questionId: 'q11',
            questionText: 'வேட்பாளர்கள் உங்களிடம் தொடர்பு கொள்ள எந்த முறையை நீங்கள் விரும்புகிறீர்கள்?',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'வீடு வீடாக', optionValue: 'door_to_door' },
              { optionId: 'opt2', optionText: 'வாட்ஸ்அப்', optionValue: 'whatsapp' },
              { optionId: 'opt3', optionText: 'தொலைபேசி', optionValue: 'phone' },
              { optionId: 'opt4', optionText: 'பொதுக் கூட்டம்', optionValue: 'public_meeting' },
              { optionId: 'opt5', optionText: 'சமூக ஊடகம்', optionValue: 'social_media' }
            ],
            required: true,
            order: 11
          },
          {
            questionId: 'q12',
            questionText: 'உங்கள் ஓட்டு மாற்றத்தை உருவாக்கும் என நம்புகிறீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'நிச்சயமில்லை', optionValue: 'uncertain' }
            ],
            required: true,
            order: 12
          },
          {
            questionId: 'q13',
            questionText: 'ஒரு சிறந்த வேட்பாளரிடம் நீங்கள் எதிர்பார்க்கும் முக்கிய பண்புகள் என்ன?',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'கல்வியுள்ள', optionValue: 'educated' },
              { optionId: 'opt2', optionText: 'எளிதில் அணுகக்கூடிய', optionValue: 'approachable' },
              { optionId: 'opt3', optionText: 'நேர்மையான', optionValue: 'honest' },
              { optionId: 'opt4', optionText: 'உள்ளூரில் வாழ்பவர்', optionValue: 'local_resident' },
              { optionId: 'opt5', optionText: 'ஊழலில்லாத', optionValue: 'non_corrupt' }
            ],
            required: true,
            order: 13
          },
          {
            questionId: 'q14',
            questionText: 'உங்கள் பகுதியில் ஒரு நல்ல வேட்பாளரை ஆதரிக்க அல்லது களத்தில் உதவ நீங்கள் தயாராக இருக்கிறீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'யோசித்து பார்க்கிறேன்', optionValue: 'considering' }
            ],
            required: true,
            order: 14
          },
          {
            questionId: 'q15',
            questionText: 'உங்கள் பகுதியில் உள்ள MLA அல்லது MP-வின் பெயரை நீங்கள் அறிந்துள்ளீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' }
            ],
            required: true,
            order: 15
          }
        ],
        activeElection: '118 - Thondamuthur',
        isPublished: true,
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        formId: 'FORM003',
        title: 'Political Engagement Survey',
        tamilTitle: 'அரசியல் ஈடுபாடு கணிப்பு',
        description: 'Survey about political engagement and candidate preferences',
        instructions: 'Please fill out the form below. Fields marked with * are required.',
        status: 'Active',
        questions: [
          {
            questionId: 'q1',
            questionText: 'Your Name',
            questionType: 'text',
            required: true,
            order: 1,
            validation: {
              minLength: 2,
              maxLength: 50
            }
          },
          {
            questionId: 'q2',
            questionText: 'Your Mobile Number',
            questionType: 'text',
            required: true,
            order: 2,
            validation: {
              pattern: '^[0-9]{10}$'
            }
          },
          {
            questionId: 'q3',
            questionText: 'Your Age',
            questionType: 'text',
            required: true,
            order: 3,
            validation: {
              pattern: '^[0-9]{1,3}$'
            }
          },
          {
            questionId: 'q4',
            questionText: 'Your City/Village',
            questionType: 'text',
            required: true,
            order: 4,
            validation: {
              minLength: 2,
              maxLength: 100
            }
          },
          {
            questionId: 'q5',
            questionText: 'Your Voter Id',
            questionType: 'text',
            required: false,
            order: 5
          },
          {
            questionId: 'q6',
            questionText: 'சாதாரணமாக நீங்கள் எந்த கட்சியை ஆதரிக்கிறீர்கள்?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'தி.மு.', optionValue: 'dmk' },
              { optionId: 'opt2', optionText: 'அ.தி.மு.', optionValue: 'aiadmk' },
              { optionId: 'opt3', optionText: 'பா.ஜ.', optionValue: 'bjp' },
              { optionId: 'opt4', optionText: 'கா.', optionValue: 'congress' },
              { optionId: 'opt5', optionText: 'நாம்', optionValue: 'ntk' },
              { optionId: 'opt6', optionText: 'மற்ற', optionValue: 'other' }
            ],
            required: true,
            order: 6
          },
          {
            questionId: 'q7',
            questionText: 'வரும் 2026 சட்டமன்ற தேர்தலில் நீங்கள் யாருக்கு வாக்களிக்க இருக்கிறீர்கள்?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'வேட்பாளர் பெயரை', optionValue: 'candidate_name' },
              { optionId: 'opt2', optionText: 'கட்சியை', optionValue: 'party' },
              { optionId: 'opt3', optionText: 'இன்னும்', optionValue: 'undecided' },
              { optionId: 'opt4', optionText: 'வாக்களிக்கப்', optionValue: 'will_vote' }
            ],
            required: true,
            order: 7
          },
          {
            questionId: 'q8',
            questionText: 'தற்போதைய உங்கள் பகுதியில் மிக முக்கியமான பிரச்சனை எது',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'குடிநீர்', optionValue: 'drinking_water' },
              { optionId: 'opt2', optionText: 'சாலை வசதி', optionValue: 'road_facility' },
              { optionId: 'opt3', optionText: 'வேலைவாய்ப்பு', optionValue: 'employment' },
              { optionId: 'opt4', optionText: 'ஊழல்', optionValue: 'corruption' },
              { optionId: 'opt5', optionText: 'மின்சாரம்', optionValue: 'electricity' },
              { optionId: 'opt6', optionText: 'பெண்களின் பாதுகாப்பு', optionValue: 'women_safety' },
              { optionId: 'opt7', optionText: 'கல்வி', optionValue: 'education' },
              { optionId: 'opt8', optionText: 'பிற', optionValue: 'other' }
            ],
            required: true,
            order: 8
          },
          {
            questionId: 'q9',
            questionText: 'உங்கள் தற்போதைய MLA-வின் செயல்பாட்டில் நீங்கள் திருப்தியாக இருக்கிறீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'சில நேரங்களில்', optionValue: 'sometimes' },
              { optionId: 'opt4', optionText: 'தெரியவில்லை', optionValue: 'dont_know' }
            ],
            required: true,
            order: 9
          },
          {
            questionId: 'q10',
            questionText: 'கடந்த தேர்தலுக்குப் பிறகு ஏதேனும் ஒரு கட்சி உங்களை தொடர்புகொண்டதா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'தேர்தலின்போது மட்டும்', optionValue: 'during_election' }
            ],
            required: true,
            order: 10
          },
          {
            questionId: 'q11',
            questionText: 'வேட்பாளர்கள் உங்களிடம் தொடர்பு கொள்ள எந்த முறையை நீங்கள் விரும்புகிறீர்கள்?',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'வீடு வீடாக', optionValue: 'door_to_door' },
              { optionId: 'opt2', optionText: 'வாட்ஸ்அப்', optionValue: 'whatsapp' },
              { optionId: 'opt3', optionText: 'தொலைபேசி', optionValue: 'phone' },
              { optionId: 'opt4', optionText: 'பொதுக் கூட்டம்', optionValue: 'public_meeting' },
              { optionId: 'opt5', optionText: 'சமூக ஊடகம்', optionValue: 'social_media' }
            ],
            required: true,
            order: 11
          },
          {
            questionId: 'q12',
            questionText: 'உங்கள் ஓட்டு மாற்றத்தை உருவாக்கும் என நம்புகிறீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'நிச்சயமில்லை', optionValue: 'uncertain' }
            ],
            required: true,
            order: 12
          },
          {
            questionId: 'q13',
            questionText: 'ஒரு சிறந்த வேட்பாளரிடம் நீங்கள் எதிர்பார்க்கும் முக்கிய பண்புகள் என்ன?',
            questionType: 'multiple_choice',
            options: [
              { optionId: 'opt1', optionText: 'கல்வியுள்ள', optionValue: 'educated' },
              { optionId: 'opt2', optionText: 'எளிதில் அணுகக்கூடிய', optionValue: 'approachable' },
              { optionId: 'opt3', optionText: 'நேர்மையான', optionValue: 'honest' },
              { optionId: 'opt4', optionText: 'உள்ளூரில் வாழ்பவர்', optionValue: 'local_resident' },
              { optionId: 'opt5', optionText: 'ஊழலில்லாத', optionValue: 'non_corrupt' }
            ],
            required: true,
            order: 13
          },
          {
            questionId: 'q14',
            questionText: 'உங்கள் பகுதியில் ஒரு நல்ல வேட்பாளரை ஆதரிக்க அல்லது களத்தில் உதவ நீங்கள் தயாராக இருக்கிறீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' },
              { optionId: 'opt3', optionText: 'யோசித்து பார்க்கிறேன்', optionValue: 'considering' }
            ],
            required: true,
            order: 14
          },
          {
            questionId: 'q15',
            questionText: 'உங்கள் பகுதியில் உள்ள MLA அல்லது MP-வின் பெயரை நீங்கள் அறிந்துள்ளீர்களா?',
            questionType: 'single_choice',
            options: [
              { optionId: 'opt1', optionText: 'ஆம்', optionValue: 'yes' },
              { optionId: 'opt2', optionText: 'இல்லை', optionValue: 'no' }
            ],
            required: true,
            order: 15
          }
        ],
        activeElection: '118 - Thondamuthur',
        isPublished: true,
        createdBy: new mongoose.Types.ObjectId()
      }
    ];

    // Insert survey forms
    const createdForms = await SurveyForm.insertMany(surveyForms);
    console.log(`✅ Created ${createdForms.length} survey forms`);

    // Display created forms
    createdForms.forEach(form => {
      console.log(`📋 Form ${form.formId}: ${form.tamilTitle} (${form.status})`);
    });

    console.log('🎉 Survey forms seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding survey forms:', error);
    process.exit(1);
  }
};
