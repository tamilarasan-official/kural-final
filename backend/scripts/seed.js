#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../src/models/User');
const logger = require('../src/utils/logger');

const seedData = async () => {
    try {
        await mongoose.connect(config.DATABASE_URI);
        logger.info('Connected to MongoDB for seeding');

        // Clear existing users (optional - remove in production)
        if (process.argv.includes('--clear')) {
            await User.deleteMany({});
            logger.info('Cleared existing users');
        }

        // Check if admin user exists
        const adminExists = await User.findOne({ email: 'admin@example.com' });

        if (!adminExists) {
            // Create admin user
            const adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
                emailVerified: true
            });
            logger.info('Admin user created');
        } else {
            logger.info('Admin user already exists');
        }

        // Create sample users
        const sampleUsers = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'user',
                emailVerified: true
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password123',
                role: 'user',
                emailVerified: true
            }
        ];

        for (const userData of sampleUsers) {
            const userExists = await User.findOne({ email: userData.email });
            if (!userExists) {
                await User.create(userData);
                logger.info(`Sample user created: ${userData.email}`);
            } else {
                logger.info(`User already exists: ${userData.email}`);
            }
        }

        logger.info('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();