const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/transgender-voters?limit=5',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', JSON.parse(data));
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
    process.exit(1);
});

req.end();