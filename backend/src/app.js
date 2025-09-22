const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const config = require('../config/config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize());
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;