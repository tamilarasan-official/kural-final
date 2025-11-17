const mongoose = require('mongoose');
const Booth = require('../src/models/Booth');
const config = require('../config/config');

// Connect to MongoDB
const connectDB = async() => {
    try {
        await mongoose.connect(config.DATABASE_URI);
        console.log('✅ MongoDB Connected...');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        process.exit(1);
    }
};

// Create AssemblyIncharge user
const createAssemblyIncharge = async() => {
    try {
        // Check if AssemblyIncharge already exists
        const existingUser = await Booth.findOne({ mobileNumber: '9500000001' });
        if (existingUser) {
            console.log('✅ Assembly Incharge already exists:', existingUser.mobileNumber);
            return existingUser;
        }

        // Get a user ID for createdBy (or create a dummy ObjectId)
        const mongoose = require('mongoose');
        const dummyUserId = new mongoose.Types.ObjectId();

        // Create AssemblyIncharge user
        const assemblyInchargeData = {
            firstName: 'Assembly',
            lastName: 'Incharge',
            mobileNumber: '9500000001',
            gender: 'Male',
            password: 'password123',
            role: 'AssemblyIncharge-119 ', // This role contains 'assembly' and 'incharge'
            boothAllocation: '119 -All',
            status: 'Active',
            email: 'assembly.incharge@test.com',
            address: {
                street: 'Test Street',
                city: 'Coimbatore',
                state: 'Tamil Nadu',
                country: 'India',
                postalCode: '641045'
            },
            remarks: 'Test AssemblyIncharge user for role-based navigation testing',
            createdBy: dummyUserId
        };

        const assemblyIncharge = await Booth.create(assemblyInchargeData);
        console.log('✅ AssemblyIncharge user created successfully:');
        console.log('📱 Mobile Number:', assemblyIncharge.mobileNumber);
        console.log('🔑 Password: password123');
        console.log('👤 Role:', assemblyIncharge.role);
        console.log('📍 Booth Allocation:', assemblyIncharge.boothAllocation);

        return assemblyIncharge;
    } catch (error) {
        console.error('❌ Error creating AssemblyIncharge user:', error.message);
        throw error;
    }
};

// Create additional test Booth user (booth agent)
const createTestBooth = async() => {
    try {
        // Check if test booth already exists
        const existingBooth = await Booth.findOne({ mobileNumber: '9500000002' });
        if (existingBooth) {
            console.log('✅ Test Booth user already exists:', existingBooth.mobileNumber);
            return existingBooth;
        }

        // Get a user ID for createdBy (or create a dummy ObjectId)
        const mongoose = require('mongoose');
        const dummyUserId = new mongoose.Types.ObjectId();

        // Create test booth user
        const boothData = {
            firstName: 'Test',
            lastName: 'Booth',
            mobileNumber: '9500000002',
            gender: 'Female',
            password: 'password123',
            role: 'Booth Agent', // This role contains 'booth'
            boothAllocation: '119 -001',
            status: 'Active',
            email: 'test.booth@test.com',
            address: {
                street: 'Booth Street',
                city: 'Coimbatore',
                state: 'Tamil Nadu',
                country: 'India',
                postalCode: '641045'
            },
            remarks: 'Test Booth user for role-based navigation testing',
            createdBy: dummyUserId
        };

        const booth = await Booth.create(boothData);
        console.log('✅ Test Booth user created successfully:');
        console.log('📱 Mobile Number:', booth.mobileNumber);
        console.log('🔑 Password: password123');
        console.log('👤 Role:', booth.role);
        console.log('📍 Booth Allocation:', booth.boothAllocation);

        return booth;
    } catch (error) {
        console.error('❌ Error creating test Booth user:', error.message);
        throw error;
    }
};

// Main execution
const main = async() => {
    try {
        await connectDB();

        console.log('🚀 Creating test users for role-based navigation...\n');

        await createAssemblyIncharge();
        console.log('');
        await createTestBooth();

        console.log('\n✅ Test users created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('👨‍💼 AssemblyIncharge: 9500000001 / password123');
        console.log('👥 Booth Agent: 9500000002 / password123');
        console.log('\n🔄 You can now test the role-based navigation in the app!');

    } catch (error) {
        console.error('❌ Script failed:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the script
if (require.main === module) {
    main();
}

module.exports = { createAssemblyIncharge, createTestBooth };