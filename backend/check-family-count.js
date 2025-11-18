const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function checkFamilyCount() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        // Count total voters
        const totalVoters = await Voter.countDocuments();
        console.log(`👥 Total Voters: ${totalVoters}`);

        // Count voters with familyId
        const votersWithFamily = await Voter.countDocuments({ familyId: { $exists: true, $ne: null } });
        console.log(`✅ Voters with familyId: ${votersWithFamily}`);

        // Count unique family IDs
        const uniqueFamilyIds = await Voter.distinct('familyId', { familyId: { $exists: true, $ne: null } });
        console.log(`👨‍👩‍👧‍👦 Unique Families: ${uniqueFamilyIds.length}\n`);

        // Show sample families
        console.log('📋 Sample Families:');
        for (let i = 0; i < Math.min(5, uniqueFamilyIds.length); i++) {
            const familyId = uniqueFamilyIds[i];
            const members = await Voter.find({ familyId }).select('Name Age sex').lean();
            console.log(`\n${familyId}: ${members.length} members`);
            members.forEach(m => {
                console.log(`  - ${m.Name} (${m.Age || '?'}y, ${m.sex || '?'})`);
            });
        }

        console.log('\n💡 Expected Dashboard Display (for all voters):');
        console.log(`  Total Voters: ${totalVoters}`);
        console.log(`  Total Families: ${uniqueFamilyIds.length} (manually mapped) + address-based singles`);
        console.log(`  Visits Pending: 0 (no active surveys)`);

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkFamilyCount();