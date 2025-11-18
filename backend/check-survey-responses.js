const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function checkSurveyResponses() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const SurveyResponse = mongoose.model('SurveyResponse', new mongoose.Schema({}, { strict: false, collection: 'surveyresponses' }));
        const Survey = mongoose.model('Survey', new mongoose.Schema({}, { strict: false, collection: 'surveys' }));

        // Get all surveys
        const surveys = await Survey.find({}).lean();
        console.log(`📊 Total surveys in database: ${surveys.length}\n`);

        // Check responses for each survey
        console.log('📋 Survey Response Counts:\n');

        for (const survey of surveys) {
            const formId = survey.formId || survey._id.toString();
            const responseCount = await SurveyResponse.countDocuments({
                formId: formId,
                isComplete: true
            });

            const allResponses = await SurveyResponse.countDocuments({ formId: formId });

            console.log(`Survey: "${survey.title || survey.name || 'Unnamed'}"`);
            console.log(`  FormID: ${formId}`);
            console.log(`  Status: ${survey.status}`);
            console.log(`  Complete Responses: ${responseCount}`);
            console.log(`  Total Responses (incl. incomplete): ${allResponses}`);
            console.log('');
        }

        // Get sample responses
        const sampleResponses = await SurveyResponse.find({}).limit(5).lean();
        console.log('\n📋 Sample Responses:\n');
        sampleResponses.forEach((resp, idx) => {
            console.log(`${idx + 1}. FormID: ${resp.formId}`);
            console.log(`   Respondent: ${resp.respondentId || resp.voterID}`);
            console.log(`   Complete: ${resp.isComplete}`);
            console.log(`   Submitted: ${resp.submittedAt}`);
            console.log('');
        });

        await mongoose.disconnect();
        console.log('✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkSurveyResponses();