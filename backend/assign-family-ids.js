const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function assignFamilyIds() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        // Get all voters
        const allVoters = await Voter.find({}).lean();
        console.log(`📊 Total voters: ${allVoters.length}\n`);

        // Group voters by address (same logic as dashboard)
        const addressGroups = new Map();
        const votersWithoutAddress = [];

        allVoters.forEach((voter) => {
            // Skip if already has familyId
            if (voter.familyId) {
                return;
            }

            // Extract address fields
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

            // Create address key
            const addressKey = `${houseNo}-${street}`.trim();

            if (addressKey && addressKey !== '-' && street) {
                if (!addressGroups.has(addressKey)) {
                    addressGroups.set(addressKey, []);
                }
                addressGroups.get(addressKey).push(voter);
            } else {
                votersWithoutAddress.push(voter);
            }
        });

        console.log('🏠 Address Groups Analysis:');
        console.log(`  Unique addresses: ${addressGroups.size}`);
        console.log(`  Voters without valid address: ${votersWithoutAddress.length}`);

        // Count groups with multiple voters (actual families)
        const familyGroups = Array.from(addressGroups.entries())
            .filter(([_, voters]) => voters.length >= 2)
            .sort((a, b) => b[1].length - a[1].length);

        const singleVoterGroups = Array.from(addressGroups.entries())
            .filter(([_, voters]) => voters.length === 1);

        console.log(`  Families (2+ voters): ${familyGroups.length}`);
        console.log(`  Single voters: ${singleVoterGroups.length}\n`);

        // Show top 10 families
        console.log('👨‍👩‍👧‍👦 Top 10 Largest Families:');
        familyGroups.slice(0, 10).forEach(([address, voters], idx) => {
            const head = voters.sort((a, b) => (parseInt(b.Age || b.age) || 0) - (parseInt(a.Age || a.age) || 0))[0];
            console.log(`  ${idx + 1}. ${voters.length} members - ${head.Name} (${address.substring(0, 50)}...)`);
        });

        console.log('\n🔄 Assigning Family IDs...\n');

        let familyCounter = 1;
        let updatedCount = 0;
        let errorCount = 0;

        // Assign family IDs to groups with 2+ voters
        for (const [address, voters] of familyGroups) {
            const familyId = `FAM${String(familyCounter).padStart(4, '0')}`; // FAM0001, FAM0002, etc.

            try {
                // Update all voters in this family
                const voterIds = voters.map(v => v._id);
                const result = await Voter.updateMany({ _id: { $in: voterIds } }, { $set: { familyId: familyId } });

                updatedCount += result.modifiedCount;

                if (familyCounter <= 5) {
                    console.log(`✅ ${familyId}: Assigned to ${result.modifiedCount} voters`);
                    console.log(`   Address: ${address.substring(0, 60)}`);
                    console.log(`   Members: ${voters.map(v => v.Name).join(', ')}\n`);
                }

                familyCounter++;
            } catch (error) {
                console.error(`❌ Error assigning ${familyId}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n📊 Summary:');
        console.log(`  Families created: ${familyCounter - 1}`);
        console.log(`  Voters assigned to families: ${updatedCount}`);
        console.log(`  Voters remaining without family: ${singleVoterGroups.length + votersWithoutAddress.length}`);
        console.log(`  Errors: ${errorCount}`);

        console.log('\n💡 What was done:');
        console.log('  ✅ Voters with same address (2+ people) grouped into families');
        console.log('  ✅ Family IDs assigned as FAM0001, FAM0002, etc.');
        console.log('  ✅ Single voters and voters without address kept separate');
        console.log('  ✅ Existing familyId values preserved');

        console.log('\n💡 What you can do next:');
        console.log('  1. Use "Map Family" in the app to manually group remaining voters');
        console.log('  2. Dashboard will now show correct family count');
        console.log('  3. Family Manager will display all assigned families');

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

assignFamilyIds();