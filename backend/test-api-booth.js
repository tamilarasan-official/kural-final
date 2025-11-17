// Test the actual API endpoint
async function testBoothAPI() {
    try {
        const boothId = 'BOOTH001';
        const url = `http://localhost:5000/api/v1/voters/by-booth/${boothId}?page=1&limit=5`;

        console.log(`\n🔍 Testing API Endpoint: ${url}\n`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ API Response Success!');
            console.log(`\n📊 Pagination:`);
            console.log(JSON.stringify(data.pagination, null, 2));

            console.log(`\n👥 Voters (showing first 3):`);
            data.voters.slice(0, 3).forEach((voter, index) => {
                console.log(`\nVoter ${index + 1}:`);
                console.log(`  - Name: ${voter.name?.english || voter.name?.tamil || 'N/A'}`);
                console.log(`  - Voter ID: ${voter.voterID || 'N/A'}`);
                console.log(`  - Booth ID: ${voter.boothid || 'N/A'}`);
                console.log(`  - AC: ${voter.ac || 'N/A'}`);
                console.log(`  - Age: ${voter.age || 'N/A'}`);
                console.log(`  - Gender: ${voter.gender || 'N/A'}`);
            });

            console.log('\n✅ API test completed successfully!');
        } else {
            console.error('❌ API Error:', data);
        }
    } catch (error) {
        console.error('❌ Test Error:', error.message);
    }
}

testBoothAPI();