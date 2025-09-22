#!/usr/bin/env node

const http = require('http');
const config = require('../config/config');

const options = {
    host: config.HOST,
    port: config.PORT,
    path: '/health',
    timeout: 2000
};

const request = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on('error', (err) => {
    console.log('ERROR:', err.message);
    process.exit(1);
});

request.end();