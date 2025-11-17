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
const { swaggerUi, specs } = require('../swagger');

// Import models to ensure they're connected
require('./models/User');
require('./models/Voter');
require('./models/Survey');
require('./models/SurveyResponse');
require('./models/ModalContent');
require('./models/BoothAgentActivity');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const voterRoutes = require('./routes/voterRoutes');
const boothRoutes = require('./routes/boothRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const modalContentRoutes = require('./routes/modalContentRoutes');
const boothAgentActivityRoutes = require('./routes/boothAgentActivity');

const app = express();

// Trust proxy
app.set('trust proxy', 1);
// Disable ETag to avoid 304 Not Modified responses for API consumers that expect bodies
app.set('etag', false);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: '*', // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log('✓ CORS enabled for all origins');


// Rate limiting - DISABLED for both development and production (unlimited requests)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100000, // Unlimited (100k requests per 15 minutes)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: () => true, // Skip rate limiting for all requests (unlimited)
});

// Rate limiting disabled - Unlimited requests for development and production
console.log('✓ Rate limiting disabled - Unlimited API requests allowed');

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Disable caching for API responses
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Data sanitization
app.use(mongoSanitize());
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Add detailed request logging for debugging
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} from ${req.ip}`);
    next();
});


// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/voters', voterRoutes);
app.use('/api/v1/booths', boothRoutes);
app.use('/api/v1/surveys', surveyRoutes);
app.use('/api/v1/modal-content', modalContentRoutes);
app.use('/api/v1/activity', boothAgentActivityRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;