const https = require('https');
const fs = require('fs');
const app = require('./app');
const config = require('../config/config');
const connectDB = require('./database/connection');

// Connect to database
connectDB();

const PORT = config.PORT || 5000;
const HTTPS_PORT = config.HTTPS_PORT || 5443;

// SSL Certificate options
const sslOptions = {
  key: fs.readFileSync('./ssl/private.key'),
  cert: fs.readFileSync('./ssl/certificate.crt')
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Start HTTPS server
httpsServer.listen(HTTPS_PORT, config.HOST, () => {
  console.log(`HTTPS Server running on https://${config.HOST}:${HTTPS_PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});

// Also keep HTTP server for development
const httpServer = app.listen(PORT, config.HOST, () => {
  console.log(`HTTP Server running on http://${config.HOST}:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
  httpsServer.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = { httpsServer, httpServer };

