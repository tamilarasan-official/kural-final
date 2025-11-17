const http = require('http');

const phone = '7223380281';
const password = 'Booth@001';

const data = JSON.stringify({
    phone: phone,
    password: password
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/booths/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing booth login...');
console.log('Phone:', phone);
console.log('Password:', password);
console.log('URL:', `http://localhost:5000/api/v1/booths/login`);

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('\n📊 Response Status:', res.statusCode);
        console.log('📄 Response Body:', responseData);

        try {
            const parsed = JSON.parse(responseData);
            console.log('\n✅ Parsed Response:', JSON.stringify(parsed, null, 2));

            if (parsed.success) {
                console.log('\n🎉 LOGIN SUCCESSFUL!');
                console.log('Token:', parsed.token);
                console.log('User:', parsed.data);
            } else {
                console.log('\n❌ LOGIN FAILED:', parsed.message);
            }
        } catch (e) {
            console.log('\n❌ Failed to parse response');
        }

        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('\n❌ Request Error:', error.message);
    console.error('Make sure the backend server is running on port 5000');
    process.exit(1);
});

req.write(data);
req.end();