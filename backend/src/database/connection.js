const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('../../config/config');

const connectDB = async () => {
    try {
        const databaseUri = config.NODE_ENV === 'test' ? config.DATABASE_URI_TEST : config.DATABASE_URI;

        const conn = await mongoose.connect(databaseUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        logger.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;