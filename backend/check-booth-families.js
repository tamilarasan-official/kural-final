const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function checkBoothFamilies() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        // Get first 103 voters (likely your booth)
        const voters = await Voter.find({}).limit(103).lean();
        console.log(`📊 Checking first 103 voters...\n`);

        // Count families using EXACT dashboard logic
        const familyIds = new Set();
        const addressBasedFamilies = new Set();
        const votersWithFamilyId = [];
        const votersWithoutFamilyId = [];

        voters.forEach((voter) => {
            // Check if voter has a manually assigned familyId
            if (voter.familyId) {
                familyIds.add(voter.familyId);
                votersWithFamilyId.push({
                    name: voter.Name,
                    familyId: voter.familyId,
                    address: voter.address || voter.Anubhag_name
                });
            } else {
                // Fall back to address-based grouping
                const houseNo = voter['Address-House no'] ||
                    voter.HouseNo ||
                    voter.Door_No ||
                    voter.Door_no ||
                    voter.door_no ||
                    '';
                const street = voter['Address-Street'] ||
                    voter.Street ||
                    voter.Anubhag_name ||
                    voter.address ||
                    '';
                const address = `${houseNo}-${street}`.trim();

                if (address && address !== '-') {
                    addressBasedFamilies.add(address);
                }

                votersWithoutFamilyId.push({
                    name: voter.Name,
                    address: address
                });
            }
        });

        const totalFamilies = familyIds.size + addressBasedFamilies.size;

        console.log('📊 Dashboard Calculation Results:');
        console.log(`  Voters with familyId: ${votersWithFamilyId.length}`);
        console.log(`  Unique familyIds: ${familyIds.size}`);
        console.log(`  Voters without familyId: ${votersWithoutFamilyId.length}`);
        console.log(`  Unique addresses (fallback): ${addressBasedFamilies.size}`);
        console.log(`  TOTAL FAMILIES: ${totalFamilies}\n`);

        // Show sample voters with familyId
        if (votersWithFamilyId.length > 0) {
            console.log('✅ Sample voters WITH familyId:');
            votersWithFamilyId.slice(0, 5).forEach(v => {
                console.log(`  - ${v.name || 'Unknown'} → ${v.familyId} (${v.address || 'No address'})`);
            });
            console.log('');
        } else {
            console.log('❌ NO voters with familyId found in first 103 voters!\n');
            console.log('💡 This means these 103 voters were NOT assigned family IDs.');
            console.log('   Reason: They might be from different booths or have unique addresses.\n');
        }

        // Show which unique family IDs exist
        if (familyIds.size > 0) {
            console.log('👨‍👩‍👧‍👦 Unique Family IDs in this batch:');
            Array.from(familyIds).slice(0, 10).forEach(id => {
                const count = voters.filter(v => v.familyId === id).length;
                console.log(`  ${id}: ${count} members`);
            });
            console.log('');
        }

        // Show address distribution
        console.log('🏠 Address-based grouping (top 10):');
        const addressCounts = {};
        votersWithoutFamilyId.forEach(v => {
            if (v.address && v.address !== '-') {
                addressCounts[v.address] = (addressCounts[v.address] || 0) + 1;
            }
        });

        Object.entries(addressCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([address, count]) => {
                console.log(`  ${address.substring(0, 60)}: ${count} voter(s)`);
            });

        console.log(`\n💡 Expected Dashboard Display:`);
        console.log(`  Total Voters: 103`);
        console.log(`  Total Families: ${totalFamilies}`);

        if (totalFamilies === 103) {
            console.log(`\n⚠️  WARNING: Still showing 103 families = 103 voters`);
            console.log(`   This means ALL voters have unique addresses.`);
            console.log(`   Solution: Family IDs were assigned to voters with 2+ members per address.`);
            console.log(`   These 103 voters might be test data or single-person households.`);
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkBoothFamilies();