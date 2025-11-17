const mongoose = require("mongoose");
const config = require("../../config/config");

// Enable mongoose debug mode to see actual queries
mongoose.set('debug', true);

// Connection options for better stability
const connectionOptions = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 2, // Maintain at least 2 socket connections
    serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds (increased for high latency)
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 30000, // Initial connection timeout of 30 seconds
    family: 4 // Use IPv4, skip trying IPv6
};

const connectDB = async() => {
    try {
        await mongoose.connect(config.DATABASE_URI, connectionOptions);
        console.log("✅ MongoDB Connected...");

        // Handle connection events
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected! Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

    } catch (err) {
        console.error("❌ MongoDB connection failed", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;