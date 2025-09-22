const app = require('./app');
const connectDB = require('./database/connection');
const logger = require('./utils/logger');
const config = require('../config/config');

// Connect to database
connectDB();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

const PORT = config.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

module.exports = server;