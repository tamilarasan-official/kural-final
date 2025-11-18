const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function diagnosticCheck() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Check total voters
        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));
        const totalVoters = await Voter.countDocuments();
        console.log('\n👥 Total Voters:', totalVoters);

        // 2. Check total families
        const totalFamilies = await Voter.distinct('familyID').then(ids => ids.length);
        console.log('👨‍👩‍👧‍👦 Total Families:', totalFamilies);

        // 3. Check surveyed voters
        const surveyedVoters = await Voter.countDocuments({ surveyed: true });
        console.log('✅ Surveyed Voters:', surveyedVoters);

        // 4. Check survey forms
        const SurveyForm = mongoose.model('SurveyForm', new mongoose.Schema({}, { strict: false, collection: 'surveyforms' }));
        const allSurveys = await SurveyForm.find({}).select('title status').lean();
        const activeSurveys = allSurveys.filter(s => (s.status || '').toLowerCase() === 'active');

        console.log('\n📋 Survey Forms:');
        console.log('  Total:', allSurveys.length);
        console.log('  Active:', activeSurveys.length);
        allSurveys.forEach(s => {
            console.log(`  - "${s.title}" (${s.status || 'no status'})`);
        });

        // 5. Calculate visits pending
        const totalResponsesNeeded = totalVoters * activeSurveys.length;
        const visitsPending = Math.max(0, totalResponsesNeeded - surveyedVoters);

        console.log('\n🧮 Calculation:');
        console.log('  Total Voters:', totalVoters);
        console.log('  Active Survey Forms:', activeSurveys.length);
        console.log('  Total Responses Needed:', totalVoters, '×', activeSurveys.length, '=', totalResponsesNeeded);
        console.log('  Completed Responses:', surveyedVoters);
        console.log('  Visits Pending:', visitsPending);

        console.log('\n💡 Expected Dashboard Display:');
        console.log('  Total Voters:', totalVoters);
        console.log('  Total Families:', totalFamilies);
        console.log('  Visits Pending:', visitsPending);

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

diagnosticCheck();