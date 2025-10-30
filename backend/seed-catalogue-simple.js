const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Catalogue = require('./src/models/catalogue');

dotenv.config({ path: './config/config.env' });

const DB_URI = process.env.DATABASE_URI || 'mongodb+srv://kural_db:kural_2025@cluster0.tcoecok.mongodb.net/kural?retryWrites=true&w=majority&appName=Cluster0';

const products = [{
        title: 'KuralApp',
        price: '₹3',
        description: 'Team App - 3 Rs per vote',
        fullDescription: 'KuralElection Analytics Manager - India\'s First ElectionTech SaaS Application. Complete election management solution with voter analytics, campaign tracking, and real-time insights.',
        imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
        features: ['Voter Analytics', 'Campaign Tracking', 'Real-time Dashboard', 'Mobile App'],
        category: 'Software',
        isActive: true,
        sortOrder: 1,
    },
    {
        title: 'Voter List',
        price: '₹1',
        description: 'Voter List Data Entry',
        fullDescription: 'Complete voter database with detailed information including voter ID, name, address, age, and polling station details. Essential for election planning and voter outreach.',
        imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop',
        features: ['Complete Database', 'Search & Filter', 'Export Options', 'Real-time Updates'],
        category: 'Data',
        isActive: true,
        sortOrder: 2,
    },
    {
        title: 'Voter Photo',
        price: '₹1',
        description: 'Voter identification photos',
        fullDescription: 'High-quality voter identification photos for verification and database management. Essential for preventing duplicate registrations and ensuring accurate voter identification.',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        features: ['High Quality', 'Easy Upload', 'Bulk Processing', 'Verification Ready'],
        category: 'Data',
        isActive: true,
        sortOrder: 3,
    },
    {
        title: 'Filed Survey',
        price: '₹30,000',
        description: 'Field survey reports',
        fullDescription: 'Field Survey Services help political campaigns collect accurate voter data through trained field agents using mobile/tablet devices. Surveys include voter preferences, contact details, and local issues. Ideal for booth-level insights, micro-targeting, and data-driven campaigning. Available with geo-tagging and real-time dashboard access.',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
        features: ['Trained Agents', 'Mobile Devices', 'Geo-tagging', 'Real-time Dashboard'],
        category: 'Services',
        isActive: true,
        sortOrder: 4,
    },
    {
        title: 'Slip Box - paper',
        price: '₹3,500',
        description: 'Thermal printer for receipts',
        fullDescription: 'Slip Box is a compact, portable device designed specifically for efficient and unlimited voter slip generation. Built for booth-level election operations, it\'s the perfect companion for on-the-ground campaign teams and polling agents. Model: SB123WP',
        imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
        features: ['Portable Design', 'Thermal Printing', 'Battery Powered', 'High Speed'],
        category: 'Hardware',
        isActive: true,
        sortOrder: 5,
    },
    {
        title: 'Slip Box - sticker',
        price: '₹4,500',
        description: 'Sticker printing device',
        fullDescription: 'Slip Box is a compact, portable device designed specifically for efficient and unlimited voter slip generation. Built for booth-level election operations, it\'s the perfect companion for on-the-ground campaign teams and polling agents. 2 in 1 product - Sticker and Paper Slips',
        imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
        features: ['2-in-1 Design', 'Sticker Printing', 'Paper Slips', 'Portable'],
        category: 'Hardware',
        isActive: true,
        sortOrder: 6,
    },
    {
        title: 'Slip paper',
        price: '₹25',
        description: 'Thermal paper rolls',
        fullDescription: 'Slip Paper are ideal for printing voter slips during election campaigns, offering crisp and clear output without the need for ink or cartridges. Whether you\'re operating a booth, managing door-to-door outreach, or organizing ward-level voter engagement, Slip Paper ensures seamless and professional-looking slip generation.',
        imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop',
        features: ['No Ink Required', 'Crisp Output', 'Bulk Available', 'Easy Storage'],
        category: 'Consumables',
        isActive: true,
        sortOrder: 7,
    },
    {
        title: 'Slip sticker',
        price: '₹50',
        description: 'Voting stickers',
        fullDescription: 'Slip Stickers are high-quality sticker papers designed specifically for fast, durable, and hassle-free voter slip printing during election campaigns. Unlike regular paper, these come with a self-adhesive backing, allowing slips to be easily pasted on voter doors, ID sheets, booth registers, or campaign materials. Ideal for door-to-door canvassing, booth management, and micro-level voter tracking, Slip Stickers ensure professional presentation.',
        imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop',
        features: ['Self-Adhesive', 'High Quality', 'Weather Resistant', 'Easy Application'],
        category: 'Consumables',
        isActive: true,
        sortOrder: 8,
    },
    {
        title: 'EVM - thermocol',
        price: '₹150',
        description: 'Thermocol EVM unit',
        fullDescription: 'Dummy Electronic Voting Machine is an answer for exhibition/demonstration of voting to candidates. It helps in Evading the disarray of voter, mis-step in voting & other common voting mistakes. The most important advantage of taking dummy evm is that you can propagate to your voters the ballot number to press as well as it even avoids confusion in the minds of the voters. More importantly, it serves as a tool for education and encouraging voters to vote.',
        imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
        features: ['Educational Tool', 'Voter Training', 'Lightweight', 'Durable'],
        category: 'Hardware',
        isActive: true,
        sortOrder: 9,
    },
    {
        title: 'EVM - plastic',
        price: '₹250',
        description: 'Plastic EVM unit',
        fullDescription: 'Dummy Electronic Voting Machine is an answer for exhibition/demonstration of voting to candidates. It helps in Evading the disarray of voter, mis-step in voting & other common voting mistakes. The most important advantage of taking dummy evm is that you can propagate to your voters the ballot number to press as well as it even avoids confusion in the minds of the voters. More importantly, it serves as a tool for education and encouraging voters to vote.',
        imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
        features: ['Educational Tool', 'Voter Training', 'Durable Material', 'Realistic Design'],
        category: 'Hardware',
        isActive: true,
        sortOrder: 10,
    },
];

const seedCatalogue = async() => {
    try {
        console.log('Starting catalogue seeding...');
        await mongoose.connect(DB_URI);
        console.log('MongoDB Connected for seeding...');

        // Insert new data without clearing existing
        await Catalogue.insertMany(products);
        console.log('Catalogue items seeded successfully!');

    } catch (error) {
        console.error('Error seeding catalogue:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedCatalogue();