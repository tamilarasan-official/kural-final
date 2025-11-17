const mongoose = require('mongoose');

// MongoDB connection - using the correct connection string from config
const MONGODB_URI = 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Define Voter schema
const voterSchema = new mongoose.Schema({}, {
    strict: false,
    collection: 'voters'
});

const Voter = mongoose.model('Voter', voterSchema);

async function testBoothEndpoint() {
    try {
        const boothId = 'BOOTH001';
        const page = 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        console.log(`\n🔍 Testing booth endpoint for: ${boothId}`);
        console.log(`📄 Page: ${page}, Limit: ${limit}, Skip: ${skip}\n`);

        // Query voters where boothid matches
        const query = { boothid: boothId };

        const [voters, totalCount] = await Promise.all([
            Voter.find(query)
            .select('name voterID DOB address emailid aadhar PAN religion caste subcaste partno boothid ac age gender mobile sex')
            .skip(skip)
            .limit(limit)
            .lean(),
            Voter.countDocuments(query)
        ]);

        console.log(`✅ Found ${voters.length} voters out of ${totalCount} total for booth ${boothId}\n`);

        // Display voter details
        voters.forEach((voter, index) => {
            console.log(`Voter ${index + 1}:`);
            console.log(`  - Name: ${voter.name?.english || voter.name?.tamil || 'N/A'}`);
            console.log(`  - Voter ID: ${voter.voterID || 'N/A'}`);
            console.log(`  - Booth ID: ${voter.boothid || 'N/A'}`);
            console.log(`  - AC: ${voter.ac || 'N/A'}`);
            console.log(`  - Part No: ${voter.partno || 'N/A'}`);
            console.log(`  - Age: ${voter.age || 'N/A'}`);
            console.log(`  - Gender: ${voter.gender || voter.sex || 'N/A'}`);
            console.log('');
        });

        const response = {
            success: true,
            voters: voters,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalVoters: totalCount,
                limit: limit
            }
        };

        console.log('📊 Response Summary:');
        console.log(JSON.stringify(response.pagination, null, 2));

        mongoose.connection.close();
        console.log('\n✅ Test completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

testBoothEndpoint();