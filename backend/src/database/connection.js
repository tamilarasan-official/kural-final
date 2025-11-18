const mongoose = require("mongoose");
const config = require("../../config/config");
const logger = require("../utils/logger");

// Disable mongoose debug mode in production
mongoose.set('debug', config.NODE_ENV === 'development');

// Optimized connection options for production scale
const connectionOptions = {
    // Connection pool settings
    maxPoolSize: 100, // Increased for high concurrency (100k+ users)
    minPoolSize: 10, // Maintain minimum connections

    // Timeout settings
    serverSelectionTimeoutMS: 5000, // Reduced for faster failure detection
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000, // Reduced initial connection timeout

    // Performance settings
    maxIdleTimeMS: 30000, // Close idle connections after 30s
    waitQueueTimeoutMS: 5000, // Max time to wait for connection from pool

    // Network settings
    family: 4, // Use IPv4

    // Auto-reconnect settings
    retryWrites: true,
    retryReads: true,

    // Read preference for replica sets (if using)
    readPreference: 'primaryPreferred',

    // Write concern for reliability
    w: 'majority',
    wtimeoutMS: 5000
};

const connectDB = async() => {
    try {
        // Optimize mongoose for production
        mongoose.set('strictQuery', false);
        mongoose.set('autoIndex', config.NODE_ENV === 'development'); // Disable auto-indexing in production

        await mongoose.connect(config.DATABASE_URI, connectionOptions);

        logger.info("✅ MongoDB Connected Successfully");
        logger.info(`📊 Database: ${mongoose.connection.name}`);
        logger.info(`🔗 Host: ${mongoose.connection.host}`);
        logger.info(`🏊 Pool Size: ${connectionOptions.minPoolSize}-${connectionOptions.maxPoolSize}`);

        // Handle connection events
        mongoose.connection.on('connected', () => {
            logger.info('✅ Mongoose connected to MongoDB');
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️  MongoDB disconnected! Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('✅ MongoDB reconnected successfully');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('close', () => {
            logger.warn('🔴 MongoDB connection closed');
        });

        // Monitor pool state
        if (config.NODE_ENV === 'development') {
            setInterval(() => {
                const stats = mongoose.connection.db?.serverConfig?.s?.pool;
                if (stats) {
                    logger.debug(`🏊 Pool Stats - Available: ${stats.availableCount}, In Use: ${stats.inUseCount}`);
                }
            }, 30000); // Log every 30 seconds in dev
        }

    } catch (err) {
        logger.error("❌ MongoDB connection failed:", err.message);
        logger.error(err.stack);

        // Retry connection after 5 seconds
        if (config.NODE_ENV === 'production') {
            logger.info('🔄 Retrying connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        } else {
            process.exit(1);
        }
    }
};

// Graceful shutdown
const closeDB = async() => {
    try {
        await mongoose.connection.close();
        logger.info('✅ MongoDB connection closed gracefully');
    } catch (err) {
        logger.error('❌ Error closing MongoDB connection:', err);
    }
};

module.exports = connectDB;
module.exports.closeDB = closeDB;