#!/usr/bin/env node

const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../src/utils/logger');

// Add your migration logic here
const runMigrations = async () => {
  try {
    await mongoose.connect(config.DATABASE_URI);
    logger.info('Connected to MongoDB for migrations');

    // Example migration: Add index to User model
    const userCollection = mongoose.connection.db.collection('users');
    
    // Check if index exists
    const indexes = await userCollection.indexes();
    const emailIndexExists = indexes.some(index => 
      index.key && index.key.email === 1
    );

    if (!emailIndexExists) {
      await userCollection.createIndex({ email: 1 }, { unique: true });
      logger.info('Created unique index on email field');
    }

    // Add more migrations as needed
    
    logger.info('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();