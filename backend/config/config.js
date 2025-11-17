const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: parseInt(process.env.PORT, 10) || 5000,
    HOST: process.env.HOST || '0.0.0.0',

    // Database
    DATABASE_URI: process.env.DATABASE_URI || 'mongodb://kuraladmin:Kuraldb%40app%23dev2025@178.16.137.247:27017/kuraldb?authSource=kuraldb',
    DATABASE_URI_TEST: process.env.MANGODB_URI_TEST || 'mongodb://localhost:27017/backend_db_test',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
    JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 30,

    // Email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    SMTP_EMAIL: process.env.SMTP_EMAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    FROM_EMAIL: process.env.FROM_EMAIL,
    FROM_NAME: process.env.FROM_NAME,

    // File Upload
    MAX_FILE_UPLOAD: parseInt(process.env.MAX_FILE_UPLOAD, 10) || 1000000,
    FILE_UPLOAD_PATH: process.env.FILE_UPLOAD_PATH || './uploads',

    // Redis
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

    // Rate Limiting
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 900000, // 15 minutes
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};