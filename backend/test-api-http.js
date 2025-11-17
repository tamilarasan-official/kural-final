const http = require('http');

// Test the actual API endpoint using Node.js http module
function testBoothAPI() {
    const boothId = 'BOOTH001';
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/v1/voters/by-booth/${boothId}?page=1&limit=5`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log(`\n🔍 Testing API Endpoint: http://${options.hostname}:${options.port}${options.path}\n`);

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);

                if (res.statusCode === 200) {
                    console.log('✅ API Response Success!');
                    console.log(`\n📊 Pagination:`);
                    console.log(JSON.stringify(response.pagination, null, 2));

                    console.log(`\n👥 Voters (showing first 3):`);
                    response.voters.slice(0, 3).forEach((voter, index) => {
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
                    console.error(`❌ API Error (${res.statusCode}):`, response);
                }
            } catch (error) {
                console.error('❌ Parse Error:', error.message);
                console.log('Raw response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Request Error:', error.message);
        console.log('💡 Make sure the backend server is running on port 5000');
    });

    req.end();
}

testBoothAPI();