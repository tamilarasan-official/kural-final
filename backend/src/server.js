const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const config = require('../config/config');
const connectDB = require('./database/connection');
const logger = require('./utils/logger');

const PORT = config.PORT || 5000;
const numCPUs = process.env.WEB_CONCURRENCY || os.cpus().length;

// Master process - fork workers
if (cluster.isMaster && config.NODE_ENV === 'production') {
    logger.info(`🚀 Master process ${process.pid} is running`);
    logger.info(`🔧 Forking ${numCPUs} workers...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Handle worker exits
    cluster.on('exit', (worker, code, signal) => {
        logger.error(`❌ Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
        cluster.fork();
    });

    cluster.on('online', (worker) => {
        logger.info(`✅ Worker ${worker.process.pid} is online`);
    });

} else {
    // Worker process - run server
    startServer();
}

async function startServer() {
    try {
        // Connect to database
        await connectDB();

        const server = app.listen(PORT, config.HOST, () => {
            const workerId = cluster.isWorker ? `Worker ${cluster.worker.id} (${process.pid})` : `Process ${process.pid}`;

            console.log('\n' + '='.repeat(70));
            console.log('🚀 KURAL API SERVER STARTED SUCCESSFULLY');
            console.log('='.repeat(70));
            console.log(`👷 Instance:          ${workerId}`);
            console.log(`📍 Server:            http://${config.HOST}:${PORT}`);
            console.log(`🏠 Local:             http://localhost:${PORT}`);
            console.log(`📚 API Docs:          http://localhost:${PORT}/api-docs`);
            console.log(`💚 Health:            http://localhost:${PORT}/health`);
            console.log(`⚙️  Environment:       ${config.NODE_ENV}`);
            console.log(`🔥 Cluster Mode:      ${cluster.isWorker ? 'ENABLED' : 'DISABLED'}`);
            console.log(`🧠 Workers:           ${numCPUs} CPUs`);
            console.log('='.repeat(70) + '\n');
        });

        // Graceful shutdown
        const gracefulShutdown = async(signal) => {
            logger.info(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async() => {
                logger.info('✅ HTTP server closed');

                try {
                    // Close database connection
                    const mongoose = require('mongoose');
                    await mongoose.connection.close();
                    logger.info('✅ Database connection closed');

                    // Close Redis connection if exists
                    const redis = require('./utils/cache');
                    if (redis.quit) {
                        await redis.quit();
                        logger.info('✅ Redis connection closed');
                    }

                    process.exit(0);
                } catch (err) {
                    logger.error('❌ Error during shutdown:', err);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('⚠️  Forcefully shutting down...');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            logger.error('❌ Unhandled Promise Rejection:', err);
            if (config.NODE_ENV === 'production') {
                gracefulShutdown('UNHANDLED_REJECTION');
            }
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            logger.error('❌ Uncaught Exception:', err);
            if (config.NODE_ENV === 'production') {
                gracefulShutdown('UNCAUGHT_EXCEPTION');
            } else {
                process.exit(1);
            }
        });

        return server;

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

module.exports = cluster.isWorker ? null : startServer;