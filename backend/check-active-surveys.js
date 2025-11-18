const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function checkActiveSurveys() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const SurveyForm = mongoose.model('SurveyForm', new mongoose.Schema({}, { strict: false, collection: 'surveyforms' }));

        // Get all survey forms with their status
        const allSurveys = await SurveyForm.find({}).select('title status assignedACs').lean();
        console.log('\n📋 All Survey Forms:', JSON.stringify(allSurveys, null, 2));

        // Count active surveys
        const activeSurveys = allSurveys.filter(s => (s.status || '').toLowerCase() === 'active');
        console.log('\n✅ Active Surveys:', activeSurveys.length);
        console.log('Active Survey Details:', JSON.stringify(activeSurveys, null, 2));

        // Explain the calculation
        console.log('\n🧮 Dashboard Calculation Explanation:');
        console.log('Total Voters: 103');
        console.log('Active Survey Forms:', activeSurveys.length);
        console.log('Total Responses Needed: 103 ×', activeSurveys.length, '=', 103 * activeSurveys.length);
        console.log('Completed Responses: (103 × ' + activeSurveys.length + ' - 204) = ' + (103 * activeSurveys.length - 204));
        console.log('Visits Pending: 204');
        console.log('\n💡 This means each voter needs to complete', activeSurveys.length, 'different survey forms.');

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkActiveSurveys();