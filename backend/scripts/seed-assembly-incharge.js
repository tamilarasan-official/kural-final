const mongoose = require('mongoose');
const Cadre = require('../src/models/Cadre');
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
        const existingUser = await Cadre.findOne({ mobileNumber: '9500000001' });
        if (existingUser) {
            console.log('✅ AssemblyIncharge user already exists:', existingUser.mobileNumber);
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

        const assemblyIncharge = await Cadre.create(assemblyInchargeData);
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

// Create additional test Cadre user (booth agent)
const createTestCadre = async() => {
    try {
        // Check if test cadre already exists
        const existingCadre = await Cadre.findOne({ mobileNumber: '9500000002' });
        if (existingCadre) {
            console.log('✅ Test Cadre user already exists:', existingCadre.mobileNumber);
            return existingCadre;
        }

        // Get a user ID for createdBy (or create a dummy ObjectId)
        const mongoose = require('mongoose');
        const dummyUserId = new mongoose.Types.ObjectId();

        // Create test cadre user
        const cadreData = {
            firstName: 'Test',
            lastName: 'Cadre',
            mobileNumber: '9500000002',
            gender: 'Female',
            password: 'password123',
            role: 'Booth Agent', // This role contains 'booth'
            boothAllocation: '119 -001',
            status: 'Active',
            email: 'test.cadre@test.com',
            address: {
                street: 'Booth Street',
                city: 'Coimbatore',
                state: 'Tamil Nadu',
                country: 'India',
                postalCode: '641045'
            },
            remarks: 'Test Cadre user for role-based navigation testing',
            createdBy: dummyUserId
        };

        const cadre = await Cadre.create(cadreData);
        console.log('✅ Test Cadre user created successfully:');
        console.log('📱 Mobile Number:', cadre.mobileNumber);
        console.log('🔑 Password: password123');
        console.log('👤 Role:', cadre.role);
        console.log('📍 Booth Allocation:', cadre.boothAllocation);

        return cadre;
    } catch (error) {
        console.error('❌ Error creating test Cadre user:', error.message);
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
        await createTestCadre();

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

module.exports = { createAssemblyIncharge, createTestCadre };