const mongoose = require("mongoose");
const config = require("../../config/config");

const connectDB = async () => {
  try {
    await mongoose.connect(config.DATABASE_URI)
    console.log("✅ MongoDB Connected...");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
