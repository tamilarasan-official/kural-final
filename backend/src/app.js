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
require('./models/Profile');
require('./models/Election');
require('./models/Settings');
require('./models/Cadre');
require('./models/Survey');
require('./models/SurveyForm');
require('./models/SurveyResponse');
require('./models/ModalContent');
require('./models/voter');
require('./models/vulnerability');
require('./models/partColor');
require('./models/transgenderVoter');
require('./models/fatherlessVoter');
require('./models/guardianVoter');
require('./models/mobileVoter');
require('./models/age80AboveVoter');
require('./models/age60AboveVoter');
require('./models/catalogue');
require('./models/soonVoter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const voterRoutes = require('./routes/voterRoutes');
const vulnerabilityRoutes = require('./routes/vulnerabilityRoutes');
const partColorRoutes = require('./routes/partColorRoutes');
const electionRoutes = require('./routes/electionRoutes');
const profileRoutes = require('./routes/profileRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const cadreRoutes = require('./routes/cadreRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const surveyFormRoutes = require('./routes/surveyFormRoutes');
const modalContentRoutes = require('./routes/modalContentRoutes');
const voterInfoRoutes = require('./routes/voterInfoRoutes');
const transgenderRoutes = require('./routes/transgenderRoutes');
const fatherlessRoutes = require('./routes/fatherlessRoutes');
const guardianRoutes = require('./routes/guardianRoutes');
const mobileRoutes = require('./routes/mobileRoutes');
const age80AboveRoutes = require('./routes/age80AboveRoutes');
const age60AboveRoutes = require('./routes/age60AboveRoutes');
const catalogueRoutes = require('./routes/catalogueRoutes');
const soonVoterRoutes = require('./routes/soonVoterRoutes');

const app = express();

// Trust proxy
app.set('trust proxy', 1);
// Disable ETag to avoid 304 Not Modified responses for API consumers that expect bodies
app.set('etag', false);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
}));

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
app.use('/api/v1/voters', voterRoutes);
app.use('/api/v1/vulnerabilities', vulnerabilityRoutes);
app.use('/api/v1/part-colors', partColorRoutes);
app.use('/api/v1/elections', electionRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/cadres', cadreRoutes);
app.use('/api/v1/surveys', surveyRoutes);
app.use('/api/v1/survey-forms', surveyFormRoutes);
app.use('/api/v1/modal-content', modalContentRoutes);
app.use('/api/v1/voter-info', voterInfoRoutes);
app.use('/api/v1/transgender-voters', transgenderRoutes);
app.use('/api/v1/fatherless-voters', fatherlessRoutes);
app.use('/api/v1/guardian-voters', guardianRoutes);
app.use('/api/v1/mobile-voters', mobileRoutes);
app.use('/api/v1/age80above-voters', age80AboveRoutes);
app.use('/api/v1/age60above-voters', age60AboveRoutes);
app.use('/api/v1/catalogue', catalogueRoutes);
app.use('/api/v1/soon-voters', soonVoterRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;