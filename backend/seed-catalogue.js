const mongoose = require('mongoose');
const Catalogue = require('./src/models/catalogue');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kural', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const catalogueItems = [{
        title: 'KuralApp',
        price: '₹3',
        description: 'Team App - 3 Rs per vote',
        fullDescription: 'KuralElection Analytics Manager - India\'s First ElectionTech SaaS Application. Complete election management solution with voter analytics, campaign tracking, and real-time insights.',
        imageUrl: 'https://via.placeholder.com/300x200/1976D2/FFFFFF?text=Thedal+App',
        features: ['Voter Analytics', 'Campaign Tracking', 'Real-time Dashboard', 'Mobile App'],
        category: 'software',
        sortOrder: 1
    },
    {
        title: 'Voter List',
        price: '₹1',
        description: 'Voter List Data Entry',
        fullDescription: 'Complete voter database with detailed information including voter ID, name, address, age, and polling station details. Essential for election planning and voter outreach.',
        imageUrl: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Voter+List',
        features: ['Complete Database', 'Search & Filter', 'Export Options', 'Real-time Updates'],
        category: 'data',
        sortOrder: 2
    },
    {
        title: 'Voter Photo',
        price: '₹1',
        description: 'Voter identification photos',
        fullDescription: 'High-quality voter identification photos for verification and database management. Essential for preventing duplicate registrations and ensuring accurate voter identification.',
        imageUrl: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Voter+Photo',
        features: ['High Quality', 'Easy Upload', 'Bulk Processing', 'Verification Ready'],
        category: 'data',
        sortOrder: 3
    },
    {
        title: 'Filed Survey',
        price: '₹30,000',
        description: 'Field survey reports',
        fullDescription: 'Field Survey Services help political campaigns collect accurate voter data through trained field agents using mobile/tablet devices. Surveys include voter preferences, contact details, and local issues. Ideal for booth-level insights, micro-targeting, and data-driven campaigning. Available with geo-tagging and real-time dashboard access.',
        imageUrl: 'https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=Field+Survey',
        features: ['Trained Agents', 'Mobile Devices', 'Geo-tagging', 'Real-time Dashboard'],
        category: 'services',
        sortOrder: 4
    },
    {
        title: 'Slip Box - paper',
        price: '₹3,500',
        description: 'Thermal printer for receipts',
        fullDescription: 'Slip Box is a compact, portable device designed specifically for efficient and unlimited voter slip generation. Built for booth-level election operations, it\'s the perfect companion for on-the-ground campaign teams and polling agents. Model: SB123WP',
        imageUrl: 'https://via.placeholder.com/300x200/607D8B/FFFFFF?text=Slip+Box+Paper',
        features: ['Portable Design', 'Thermal Printing', 'Battery Powered', 'High Speed'],
        category: 'hardware',
        sortOrder: 5
    },
    {
        title: 'Slip Box - sticker',
        price: '₹4,500',
        description: 'Sticker printing device',
        fullDescription: 'Slip Box is a compact, portable device designed specifically for efficient and unlimited voter slip generation. Built for booth-level election operations, it\'s the perfect companion for on-the-ground campaign teams and polling agents. 2 in 1 product - Sticker and Paper Slips',
        imageUrl: 'https://via.placeholder.com/300x200/795548/FFFFFF?text=Slip+Box+Sticker',
        features: ['2-in-1 Design', 'Sticker Printing', 'Paper Slips', 'Portable'],
        category: 'hardware',
        sortOrder: 6
    },
    {
        title: 'Slip paper',
        price: '₹25',
        description: 'Thermal paper rolls',
        fullDescription: 'Slip Paper are ideal for printing voter slips during election campaigns, offering crisp and clear output without the need for ink or cartridges. Whether you\'re operating a booth, managing door-to-door outreach, or organizing ward-level voter engagement, Slip Paper ensures seamless and professional-looking slip generation.',
        imageUrl: 'https://via.placeholder.com/300x200/FFC107/FFFFFF?text=Slip+Paper',
        features: ['No Ink Required', 'Crisp Output', 'Bulk Available', 'Easy Storage'],
        category: 'consumables',
        sortOrder: 7
    },
    {
        title: 'Slip sticker',
        price: '₹50',
        description: 'Voting stickers',
        fullDescription: 'Slip Stickers are high-quality sticker papers designed specifically for fast, durable, and hassle-free voter slip printing during election campaigns. Unlike regular paper, these come with a self-adhesive backing, allowing slips to be easily pasted on voter doors, ID sheets, booth registers, or campaign materials. Ideal for door-to-door canvassing, booth management, and micro-level voter tracking, Slip Stickers ensure professional presentation.',
        imageUrl: 'https://via.placeholder.com/300x200/E91E63/FFFFFF?text=Slip+Sticker',
        features: ['Self-Adhesive', 'High Quality', 'Weather Resistant', 'Easy Application'],
        category: 'consumables',
        sortOrder: 8
    },
    {
        title: 'EVM - thermocol',
        price: '₹150',
        description: 'Thermocol EVM unit',
        fullDescription: 'Dummy Electronic Voting Machine is an answer for exhibition/demonstration of voting to candidates. It helps in Evading the disarray of voter, mis-step in voting & other common voting mistakes. The most important advantage of taking dummy evm is that you can propagate to your voters the ballot number to press as well as it even avoids confusion in the minds of the voters. More importantly, it serves as a tool for education and encouraging voters to vote.',
        imageUrl: 'https://via.placeholder.com/300x200/3F51B5/FFFFFF?text=EVM+Thermocol',
        features: ['Educational Tool', 'Voter Training', 'Lightweight', 'Durable'],
        category: 'hardware',
        sortOrder: 9
    },
    {
        title: 'EVM - plastic',
        price: '₹250',
        description: 'Plastic EVM unit',
        fullDescription: 'Dummy Electronic Voting Machine is an answer for exhibition/demonstration of voting to candidates. It helps in Evading the disarray of voter, mis-step in voting & other common voting mistakes. The most important advantage of taking dummy evm is that you can propagate to your voters the ballot number to press as well as it even avoids confusion in the minds of the voters. More importantly, it serves as a tool for education and encouraging voters to vote.',
        imageUrl: 'https://via.placeholder.com/300x200/009688/FFFFFF?text=EVM+Plastic',
        features: ['Educational Tool', 'Voter Training', 'Durable Material', 'Realistic Design'],
        category: 'hardware',
        sortOrder: 10
    }
];

async function seedCatalogue() {
    try {
        console.log('Starting catalogue seeding...');

        // Clear existing catalogue items
        await Catalogue.deleteMany({});
        console.log('Cleared existing catalogue items');

        // Insert new catalogue items
        const insertedItems = await Catalogue.insertMany(catalogueItems);
        console.log(`Successfully inserted ${insertedItems.length} catalogue items`);

        console.log('Catalogue seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding catalogue:', error);
        process.exit(1);
    }
}

seedCatalogue();