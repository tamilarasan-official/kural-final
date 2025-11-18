const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function fixIncomeField() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        // Find voters with nested annual_income
        const votersWithNestedIncome = await Voter.countDocuments({
            'annual_income.value': { $exists: true }
        });

        console.log(`📊 Voters with nested annual_income: ${votersWithNestedIncome}\n`);

        if (votersWithNestedIncome === 0) {
            console.log('✅ No nested annual_income fields found. All good!');
            await mongoose.disconnect();
            return;
        }

        console.log('🔄 Flattening annual_income field...\n');

        // Get all voters with nested structure
        const voters = await Voter.find({
            'annual_income.value': { $exists: true }
        }).lean();

        let updated = 0;
        let errors = 0;

        for (const voter of voters) {
            try {
                const flatValue = voter.annual_income.value;

                // Update with flat value
                await Voter.updateOne({ _id: voter._id }, { $set: { annual_income: flatValue } });

                updated++;

                if (updated <= 5) {
                    console.log(`✅ Fixed voter ${voter.voterID}: "${voter.annual_income.value}" → "${flatValue}"`);
                }
            } catch (error) {
                console.error(`❌ Error fixing voter ${voter._id}:`, error.message);
                errors++;
            }
        }

        console.log(`\n📊 Results:`);
        console.log(`  Updated: ${updated}`);
        console.log(`  Errors: ${errors}`);

        // Verify the fix
        const stillNested = await Voter.countDocuments({
            'annual_income.value': { $exists: true }
        });

        console.log(`  Still nested: ${stillNested}\n`);

        if (stillNested === 0) {
            console.log('✅ All annual_income fields flattened successfully!');
        } else {
            console.log('⚠️  Some fields still nested. Re-run the script.');
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixIncomeField();