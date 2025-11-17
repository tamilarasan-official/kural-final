const http = require('http');

// Test server health
function testServer() {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/health',
        method: 'GET'
    };

    console.log(`\n🔍 Testing Server Health: http://${options.hostname}:${options.port}${options.path}\n`);

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`✅ Server is running! Status: ${res.statusCode}`);
            console.log('Response:', data);

            // Now test the booth endpoint
            testBoothEndpoint();
        });
    });

    req.on('error', (error) => {
        console.error('❌ Server not responding:', error.message);
        console.log('💡 Please start the server with: node src/server.js');
    });

    req.end();
}

function testBoothEndpoint() {
    const boothId = 'BOOTH001';
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/v1/voters/by-booth/${boothId}?page=1&limit=3`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    console.log(`\n🔍 Testing Booth Endpoint: http://${options.hostname}:${options.port}${options.path}\n`);

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);

                if (res.statusCode === 200) {
                    console.log('✅ Booth API Response Success!');
                    console.log(`\n📊 Pagination:`);
                    console.log(JSON.stringify(response.pagination, null, 2));

                    console.log(`\n👥 Voters (${response.voters.length} returned):`);
                    response.voters.forEach((voter, index) => {
                        console.log(`\nVoter ${index + 1}:`);
                        console.log(`  - Name: ${voter.name?.english || voter.name?.tamil || 'N/A'}`);
                        console.log(`  - Voter ID: ${voter.voterID || 'N/A'}`);
                        console.log(`  - Booth ID: ${voter.boothid || 'N/A'}`);
                        console.log(`  - AC: ${voter.ac || 'N/A'}`);
                    });

                    console.log('\n✅ Booth endpoint test completed successfully!');
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
    });

    req.end();
}

testServer();