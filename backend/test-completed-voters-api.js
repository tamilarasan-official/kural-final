const mongoose = require('mongoose');

// MongoDB connection URI with auth
const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

// Define schemas
const SurveySchema = new mongoose.Schema({
    formId: String,
    title: String,
    formNumber: Number,
    status: String
}, { strict: false });

const Survey = mongoose.model('Survey', SurveySchema, 'surveys');

const SurveyResponseSchema = new mongoose.Schema({
    formId: String,
    respondentId: String,
    respondentName: String,
    respondentVoterId: String,
    isComplete: Boolean,
    submittedAt: Date
}, { strict: false });

const SurveyResponse = mongoose.model('SurveyResponse', SurveyResponseSchema, 'surveyresponses');

async function testCompletedVotersAPI() {
    try {
        console.log('\n=== TESTING COMPLETED VOTERS API LOGIC ===\n');

        // Get all surveys
        const surveys = await Survey.find().sort({ formNumber: 1 });
        console.log(`Found ${surveys.length} surveys\n`);

        for (const survey of surveys) {
            console.log(`\n📋 Survey: "${survey.title}"`);
            console.log(`   ID: ${survey._id}`);
            console.log(`   FormID: ${survey.formId}`);
            console.log(`   Status: ${survey.status}`);

            // Simulate what the API endpoint returns
            const formId = survey.formId || survey.formid || survey._id.toString();

            const responses = await SurveyResponse.find({
                formId: formId,
                isComplete: true
            }).select('respondentVoterId respondentName respondentId submittedAt');

            console.log(`   Complete responses: ${responses.length}`);

            if (responses.length > 0) {
                const completedVoterIds = responses.map(r => r.respondentVoterId || r.respondentId);
                console.log(`   Completed voter IDs: ${completedVoterIds.join(', ')}`);

                console.log('\n   ✅ API Response would be:');
                console.log('   {');
                console.log('     "success": true,');
                console.log('     "data": {');
                console.log(`       "completedVoterIds": [${completedVoterIds.map(id => `"${id}"`).join(', ')}],`);
                console.log(`       "completedCount": ${responses.length}`);
                console.log('     }');
                console.log('   }');
            } else {
                console.log('   ℹ️ No completed responses');
                console.log('\n   ✅ API Response would be:');
                console.log('   {');
                console.log('     "success": true,');
                console.log('     "data": {');
                console.log('       "completedVoterIds": [],');
                console.log('       "completedCount": 0');
                console.log('     }');
                console.log('   }');
            }
        }

        console.log('\n\n=== EXPECTED BEHAVIOR IN MOBILE APP ===\n');
        console.log('Survey 1 ("test" - FormID: 691b7344f94d177a777a7cc4):');
        console.log('  - Should show 2 voters as completed: SJI3233896, VWW6438653');
        console.log('  - All other voters in booth should show as not completed');
        console.log('\nSurvey 2 ("jello-123456" - FormID: 691ba41f230ad96b0b1a947e):');
        console.log('  - Should show 0 voters as completed');
        console.log('  - All voters in booth should show as available to select');
        console.log('\nOld buggy behavior (FIXED):');
        console.log('  - Both surveys showed 2 completed because app used voter.surveyed flag');
        console.log('  - This flag tracks "completed ANY survey", not "completed THIS survey"');
        console.log('\nNew correct behavior:');
        console.log('  - App calls GET /api/v1/surveys/{surveyId}/completed-voters');
        console.log('  - Gets voter IDs who completed THIS specific survey');
        console.log('  - Marks only those voters as completed in the UI');

    } catch (error) {
        console.error('Error testing API:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

testCompletedVotersAPI();