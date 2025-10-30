const mongoose = require('mongoose');
const Election = require('../src/models/Election');
const User = require('../src/models/User');
const config = require('../config/config');

// Sample election data
const sampleElections = [{
        electionId: 'EL001',
        electionName: '119  - Thondamuthur',
        constituency: '119  - Thondamuthur',
        category: 'General',
        partName: 'Part 1',
        anubhagName: 'Anubhag 1',
        anubhagNumber: 'A001',
        bhagNumber: 'B001',
        voterNumber: 'V001',
        voterName: 'John Doe',
        fatherName: 'Robert Doe',
        relation: 'Son',
        age: 35,
        gender: 'Male',
        mobileNumber: '9876543210',
        address: '123 Main Street, Thondamuthur',
        photo: null,
        isActive: true
    },
    {
        electionId: 'EL002',
        electionName: '119  - Thondamuthur',
        constituency: '119  - Thondamuthur',
        category: 'General',
        partName: 'Part 2',
        anubhagName: 'Anubhag 2',
        anubhagNumber: 'A002',
        bhagNumber: 'B002',
        voterNumber: 'V002',
        voterName: 'Jane Smith',
        fatherName: 'Michael Smith',
        relation: 'Daughter',
        age: 28,
        gender: 'Female',
        mobileNumber: '9876543211',
        address: '456 Oak Avenue, Thondamuthur',
        photo: null,
        isActive: true
    },
    {
        electionId: 'EL003',
        electionName: '120 - Coimbatore North',
        constituency: '120 - Coimbatore North',
        category: 'General',
        partName: 'Part 1',
        anubhagName: 'Anubhag 1',
        anubhagNumber: 'A003',
        bhagNumber: 'B003',
        voterNumber: 'V003',
        voterName: 'Raj Kumar',
        fatherName: 'Suresh Kumar',
        relation: 'Son',
        age: 42,
        gender: 'Male',
        mobileNumber: '9876543212',
        address: '789 Pine Street, Coimbatore North',
        photo: null,
        isActive: true
    }
];

const seedElections = async() => {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.DATABASE_URI);
        console.log('Connected to MongoDB');

        // Clear existing elections
        await Election.deleteMany({});
        console.log('Cleared existing elections');

        // Get a user to assign as creator
        const user = await User.findOne();
        if (!user) {
            console.log('No users found. Please create a user first.');
            return;
        }

        // Add user ID to all elections
        const electionsWithUser = sampleElections.map(election => ({
            ...election,
            createdBy: user._id
        }));

        // Insert sample elections
        const createdElections = await Election.insertMany(electionsWithUser);
        console.log(`Created ${createdElections.length} elections`);

        console.log('Election seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding elections:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run the seed function
seedElections();