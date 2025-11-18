const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function findRealFamilies() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        // Find families with 2+ members
        const allFamilyIds = await Voter.distinct('familyId', { familyId: { $exists: true, $ne: null } });
        console.log(`📊 Total unique family IDs: ${allFamilyIds.length}\n`);

        // Count members for each family
        const familySizes = {};
        for (const familyId of allFamilyIds) {
            const count = await Voter.countDocuments({ familyId });
            familySizes[familyId] = count;
        }

        // Sort families by size
        const sortedFamilies = Object.entries(familySizes)
            .sort((a, b) => b[1] - a[1]);

        // Count distribution
        const singleMember = sortedFamilies.filter(([_, count]) => count === 1).length;
        const twoMembers = sortedFamilies.filter(([_, count]) => count === 2).length;
        const threePlus = sortedFamilies.filter(([_, count]) => count >= 3).length;

        console.log('👨‍👩‍👧‍👦 Family Size Distribution:');
        console.log(`  Single member (1): ${singleMember} families`);
        console.log(`  Two members (2): ${twoMembers} families`);
        console.log(`  Three+ members (3+): ${threePlus} families`);
        console.log(`  TOTAL: ${allFamilyIds.length} families\n`);

        // Show top 20 largest families
        console.log('🏠 Top 20 Largest Families:');
        for (let i = 0; i < Math.min(20, sortedFamilies.length); i++) {
            const [familyId, count] = sortedFamilies[i];
            const members = await Voter.find({ familyId }).select('Name Age sex address Anubhag_name').lean();

            console.log(`\n${i + 1}. ${familyId}: ${count} members`);
            console.log(`   Address: ${members[0]?.address || members[0]?.Anubhag_name || 'Unknown'}`);
            members.slice(0, 5).forEach(m => {
                console.log(`   - ${m.Name || 'Unknown'} (${m.Age || '?'}y, ${m.sex || '?'})`);
            });
            if (members.length > 5) {
                console.log(`   ... and ${members.length - 5} more`);
            }
        }

        console.log('\n💡 Analysis:');
        if (singleMember === allFamilyIds.length) {
            console.log('⚠️  ALL families have only 1 member each!');
            console.log('   This means the address-based grouping found NO shared households.');
            console.log('   Possible reasons:');
            console.log('   1. Test data with unique addresses');
            console.log('   2. Voter data has detailed addresses (building+unit) not just house+street');
            console.log('   3. Data quality issue - addresses not standardized');
        } else {
            console.log(`✅ Found ${twoMembers + threePlus} families with 2+ members`);
            console.log('   The dashboard should reflect these grouped families.');
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

findRealFamilies();