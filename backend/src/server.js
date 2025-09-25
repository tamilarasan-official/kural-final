require("dotenv").config();
const app = require('./app');
const connectDB = require('./database/connection');
const config = require('../config/config');

// Connect to MongoDB Atlas
connectDB();

// Start server
const PORT = config.PORT || process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all network interfaces
app.listen(PORT, HOST, () => {
	console.log(`Server running on http://${HOST}:${PORT}`);
	console.log(`Local access: http://localhost:${PORT}`);
	console.log(`Network access: http://192.168.31.31:${PORT}`);
});