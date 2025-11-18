const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function checkIncomeField() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check voterFields collection
        const VoterField = mongoose.model('VoterField', new mongoose.Schema({}, { strict: false, collection: 'voterFields' }));

        const incomeField = await VoterField.findOne({
            $or: [
                { name: 'annual_income' },
                { name: 'income' },
                { label: /income/i }
            ]
        }).lean();

        if (incomeField) {
            console.log('✅ Income field found in voterFields collection:');
            console.log(JSON.stringify(incomeField, null, 2));
            console.log('');
        } else {
            console.log('❌ No income field found in voterFields collection\n');
            console.log('Checking all fields...');
            const allFields = await VoterField.find({}).lean();
            console.log(`Total fields: ${allFields.length}\n`);
            console.log('Field names:');
            allFields.forEach(f => console.log(`  - ${f.name} (${f.label}) - visible: ${f.visible}`));
        }

        // Check voters collection for annual_income
        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        const votersWithIncome = await Voter.countDocuments({ annual_income: { $exists: true } });
        console.log(`\n📊 Voters with annual_income field: ${votersWithIncome}`);

        if (votersWithIncome > 0) {
            const sampleVoter = await Voter.findOne({ annual_income: { $exists: true } }).lean();
            console.log('\n📋 Sample voter with annual_income:');
            console.log('voterID:', sampleVoter.voterID);
            console.log('annual_income:', JSON.stringify(sampleVoter.annual_income, null, 2));

            // Check if it's nested
            if (typeof sampleVoter.annual_income === 'object' && sampleVoter.annual_income.value !== undefined) {
                console.log('\n⚠️  Field is stored as NESTED OBJECT {value, visible}');
                console.log('   Frontend should extract: annual_income.value');
            } else {
                console.log('\n✅ Field is stored as FLAT VALUE');
            }
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkIncomeField();