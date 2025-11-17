const http = require('http');

// Test booth agent login to see what data is returned
function testBoothLogin() {
    const postData = JSON.stringify({
        phone: '7223380281',
        password: 'Booth@001'
    });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/v1/booths/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log('\n🔍 Testing Booth Agent Login\n');

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);

                if (res.statusCode === 200) {
                    console.log('✅ Login Success!\n');
                    console.log('📋 User Data:');
                    console.log(JSON.stringify(response.data || response.user, null, 2));
                    console.log('\n🔑 Token:', response.token ? 'Present' : 'Missing');

                    // Check for booth_id field
                    const userData = response.data || response.user;
                    if (userData ? .booth_id) {
                        console.log(`\n✅ booth_id found: ${userData.booth_id}`);
                    } else {
                        console.log('\n❌ booth_id NOT FOUND in response!');
                        console.log('Available fields:', Object.keys(userData || {}));
                    }
                } else {
                    console.error(`❌ Login Failed (${res.statusCode}):`, response);
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

    req.write(postData);
    req.end();
}

testBoothLogin();