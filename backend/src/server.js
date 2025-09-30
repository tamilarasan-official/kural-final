const app = require('./app');
const config = require('../config/config');
const connectDB = require('./database/connection');

// Connect to database
connectDB();

const PORT = config.PORT || 5000;

const server = app.listen(PORT, config.HOST, () => {
  console.log(`Server running on http://${config.HOST}:${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
  console.log(`Network access: http://192.168.31.31:${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = server;