const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

async function checkFamilyGrouping() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const Voter = mongoose.model('Voter', new mongoose.Schema({}, { strict: false, collection: 'voters' }));

        // Get sample of voters to check address fields
        const voters = await Voter.find({}).limit(103).lean();
        console.log(`\n📊 Analyzing ${voters.length} voters...\n`);

        // Check familyId field
        const withFamilyId = voters.filter(v => v.familyId);
        console.log('👥 Voters with familyId:', withFamilyId.length);

        // Analyze address-based grouping (same logic as dashboard)
        const familyIds = new Set();
        const addressBasedFamilies = new Set();
        const addressSamples = [];

        voters.forEach((voter) => {
            if (voter.familyId) {
                familyIds.add(voter.familyId);
            } else {
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

                    // Collect samples for debugging
                    if (addressSamples.length < 10) {
                        addressSamples.push({
                            voterID: voter.voterID || voter.EPIC_No,
                            houseNo,
                            street,
                            combinedAddress: address
                        });
                    }
                }
            }
        });

        console.log('\n🏠 Address-Based Family Grouping:');
        console.log('  Unique addresses:', addressBasedFamilies.size);
        console.log('  Manual familyId:', familyIds.size);
        console.log('  Total families:', familyIds.size + addressBasedFamilies.size);

        console.log('\n📋 Sample Addresses (first 10 voters):');
        addressSamples.forEach((sample, idx) => {
            console.log(`  ${idx + 1}. VoterID: ${sample.voterID}`);
            console.log(`     House: "${sample.houseNo}"`);
            console.log(`     Street: "${sample.street}"`);
            console.log(`     Combined: "${sample.combinedAddress}"`);
            console.log('');
        });

        // Check if addresses are actually unique or duplicated
        const addressCount = {};
        voters.forEach((voter) => {
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
                addressCount[address] = (addressCount[address] || 0) + 1;
            }
        });

        const duplicateAddresses = Object.entries(addressCount)
            .filter(([_, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (duplicateAddresses.length > 0) {
            console.log('\n🏘️ Top addresses with multiple voters (should be same family):');
            duplicateAddresses.forEach(([address, count]) => {
                console.log(`  "${address}" → ${count} voters`);
            });
        } else {
            console.log('\n⚠️ No duplicate addresses found!');
            console.log('   This means every voter has a unique address.');
            console.log('   Result: 103 voters = 103 families');
        }

        console.log('\n💡 Conclusion:');
        if (addressBasedFamilies.size === voters.length) {
            console.log('❌ Each voter is counted as a separate family');
            console.log('   Reason: All voters have unique addresses or missing address data');
            console.log('   Fix: Ensure family members share the same house number and street');
        } else {
            console.log('✅ Address-based grouping is working correctly');
            console.log(`   ${voters.length} voters grouped into ${addressBasedFamilies.size + familyIds.size} families`);
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkFamilyGrouping();