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
const SurveyResponseSchema = new mongoose.Schema({
    formId: String,
    respondentId: String,
    respondentName: String,
    respondentVoterId: String,
    respondentMobile: String,
    respondentAge: Number,
    answers: Array,
    isComplete: Boolean,
    submittedAt: Date
}, { timestamps: true });

const SurveyResponse = mongoose.model('SurveyResponse', SurveyResponseSchema, 'surveyresponses');

const VoterSchema = new mongoose.Schema({
    voterID: String,
    name: mongoose.Schema.Types.Mixed,
    Name: String,
    surveyed: Boolean,
    booth_id: String
}, { strict: false });

const Voter = mongoose.model('Voter', VoterSchema, 'voters');

async function checkSurveyVoterResponses() {
    try {
        console.log('\n=== CHECKING SURVEY RESPONSES vs VOTER FLAGS ===\n');

        // Get all complete survey responses
        const responses = await SurveyResponse.find({ isComplete: true });
        console.log(`Total complete survey responses: ${responses.length}\n`);

        // Group by formId
        const responsesByForm = {};
        for (const response of responses) {
            if (!responsesByForm[response.formId]) {
                responsesByForm[response.formId] = [];
            }
            responsesByForm[response.formId].push(response);
        }

        console.log('Responses by Survey Form:');
        for (const [formId, formResponses] of Object.entries(responsesByForm)) {
            console.log(`\nFormID: ${formId}`);
            console.log(`  Total responses: ${formResponses.length}`);
            console.log('  Voter IDs:');
            for (const response of formResponses) {
                console.log(`    - ${response.respondentVoterId || response.respondentId} (${response.respondentName})`);
            }
        }

        // Check voters with surveyed=true flag
        console.log('\n\n=== VOTERS WITH SURVEYED FLAG ===\n');
        const surveyedVoters = await Voter.find({ surveyed: true });
        console.log(`Total voters with surveyed=true: ${surveyedVoters.length}\n`);

        for (const voter of surveyedVoters) {
            const voterName = voter.name ? .english || voter.Name || 'Unknown';
            console.log(`- ${voter.voterID}: ${voterName} (booth: ${voter.booth_id})`);

            // Check which surveys this voter completed
            const voterResponses = await SurveyResponse.find({
                respondentVoterId: voter.voterID,
                isComplete: true
            });

            if (voterResponses.length > 0) {
                console.log(`  Completed surveys:`);
                for (const response of voterResponses) {
                    console.log(`    - FormID: ${response.formId} (submitted: ${response.submittedAt})`);
                }
            } else {
                console.log(`  ⚠️ No survey responses found for this voter!`);
            }
        }

        // THE PROBLEM: How to check if voter completed SPECIFIC survey
        console.log('\n\n=== THE ISSUE ===\n');
        console.log('Current Logic (survey-voter-selection.tsx):');
        console.log('  1. Fetches all voters in booth');
        console.log('  2. Marks voters with surveyed=true as "completed"');
        console.log('  3. Problem: surveyed=true means "completed ANY survey", not "completed THIS survey"');
        console.log('\nCorrect Logic Should Be:');
        console.log('  1. Fetch all voters in booth');
        console.log('  2. Fetch survey responses for THIS specific formId');
        console.log('  3. Mark voters who have responses for THIS formId as "completed"');
        console.log('\nExample API Call Needed:');
        console.log('  GET /api/v1/surveys/{surveyId}/responses');
        console.log('  Returns: [{ respondentVoterId: "ABC123", respondentName: "John" }, ...]');
        console.log('  Mobile app: completedVoterIds = responses.map(r => r.respondentVoterId)');

        console.log('\n=== SOLUTION ===\n');
        console.log('Need to create API endpoint:');
        console.log('  GET /api/v1/surveys/:surveyId/completed-voters');
        console.log('  Returns list of voter IDs who completed this specific survey');

    } catch (error) {
        console.error('Error checking survey responses:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

checkSurveyVoterResponses();