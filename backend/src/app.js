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

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const voterRoutes = require('./routes/voterRoutes');
const boothRoutes = require('./routes/boothRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const modalContentRoutes = require('./routes/modalContentRoutes');
const boothAgentActivityRoutes = require('./routes/boothAgentActivity');
const dynamicFieldRoutes = require('./routes/dynamicFieldRoutes');
const voterFieldRoutes = require('./routes/voterFieldRoutes');
const masterDataRoutes = require('./routes/masterData');

const app = express();

// Trust proxy for rate limiting behind load balancer
app.set('trust proxy', 1);

// Disable x-powered-by header
app.disable('x-powered-by');

// Security middleware - helmet with optimized settings
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS - optimized for production
const corsOptions = {
    origin: config.NODE_ENV === 'production' ?
        config.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Rate limiting - optimized for production
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.NODE_ENV === 'production' ? 1000 : 100000,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config.NODE_ENV === 'development',
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.'
        });
    }
});

// Apply rate limiter to API routes only
app.use('/api/', apiLimiter);

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp({
    whitelist: ['page', 'limit', 'sort', 'fields', 'aci_id', 'booth_id']
}));

// Compression middleware - gzip responses
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    },
    level: 6
}));

// HTTP request logging
if (config.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: logger.stream,
        skip: (req) => req.url === '/health'
    }));
}

// Cache control headers
app.use((req, res, next) => {
    // Don't cache API responses
    if (req.path.startsWith('/api/')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    next();
});

// Request ID middleware for tracking
app.use((req, res, next) => {
    req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-Id', req.id);
    next();
});

// Health check route
app.get('/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

    res.status(dbState === 1 ? 200 : 503).json({
        status: dbState === 1 ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        database: dbStatus,
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
        },
        pid: process.pid
    });
});

// Detailed health check
app.get('/health/detailed', async(req, res) => {
    const mongoose = require('mongoose');
    const checks = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        checks: {}
    };

    // Database check
    try {
        const dbState = mongoose.connection.readyState;
        checks.checks.database = {
            status: dbState === 1 ? 'pass' : 'fail',
            responseTime: 0
        };

        if (dbState === 1) {
            const start = Date.now();
            await mongoose.connection.db.admin().ping();
            checks.checks.database.responseTime = Date.now() - start;
        }
    } catch (err) {
        checks.checks.database = { status: 'fail', error: err.message };
        checks.status = 'unhealthy';
    }

    // Redis check (if available)
    try {
        const cache = require('./utils/cache');
        if (cache && cache.ping) {
            const start = Date.now();
            await cache.ping();
            checks.checks.redis = {
                status: 'pass',
                responseTime: Date.now() - start
            };
        }
    } catch (err) {
        checks.checks.redis = { status: 'fail', error: err.message };
    }

    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(checks);
});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/voters', voterRoutes);
app.use('/api/v1/booths', boothRoutes);
app.use('/api/v1/surveys', surveyRoutes);
app.use('/api/v1/modal-content', modalContentRoutes);
app.use('/api/v1/activity', boothAgentActivityRoutes);
app.use('/api/v1/dynamic-fields', dynamicFieldRoutes);
app.use('/api/v1/voter-fields', voterFieldRoutes);
app.use('/api/v1/master-data', masterDataRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;