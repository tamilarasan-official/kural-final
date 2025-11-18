const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function verifyIncomeFix() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Check voterFields collection
        const VoterField = mongoose.model('VoterField', new mongoose.Schema({}, { strict: false, collection: 'voterFields' }));
        const incomeField = await VoterField.findOne({ name: 'annual_income' }).lean();

        console.log('📋 Income Field Configuration:');
        console.log(JSON.stringify(incomeField, null, 2));
        console.log('');

        // 2. Check voter data
        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        const nestedCount = await Voter.countDocuments({ 'annual_income.value': { $exists: true } });
        const flatCount = await Voter.countDocuments({
            annual_income: { $exists: true, $type: 'string' }
        });

        console.log('📊 Voter Data Status:');
        console.log(`  Voters with NESTED annual_income: ${nestedCount} ❌`);
        console.log(`  Voters with FLAT annual_income: ${flatCount} ✅`);
        console.log('');

        // 3. Get sample voter
        const sampleVoter = await Voter.findOne({ annual_income: { $exists: true } }).lean();
        console.log('📋 Sample Voter Data:');
        console.log(`  VoterID: ${sampleVoter.voterID || sampleVoter['EPIC No']}`);
        console.log(`  annual_income value: "${sampleVoter.annual_income}"`);
        console.log(`  annual_income type: ${typeof sampleVoter.annual_income}`);
        console.log('');

        // 4. Verification
        console.log('✅ Verification Results:');
        if (incomeField && incomeField.visible && incomeField.category === 'personal') {
            console.log('  ✅ Field is visible in voterFields');
            console.log(`  ✅ Category is "${incomeField.category}"`);
        } else {
            console.log('  ❌ Field configuration issue');
        }

        if (nestedCount === 0 && flatCount > 0) {
            console.log('  ✅ All voter data is flat (not nested)');
        } else {
            console.log('  ❌ Some data still nested');
        }

        console.log('\n💡 What This Means:');
        console.log('1. The "annual income" field WILL appear in:');
        console.log('   - Voter Detail screen (Personal section)');
        console.log('   - Add New Voter modal (Additional Fields)');
        console.log('   - Edit Voter form');
        console.log('');
        console.log('2. To see it in the app:');
        console.log('   - Close and restart the mobile app');
        console.log('   - Pull down to refresh voter fields');
        console.log('   - Open any voter detail page');
        console.log('   - Scroll to "Personal" section');

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyIncomeFix();