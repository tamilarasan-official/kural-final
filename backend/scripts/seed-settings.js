const mongoose = require('mongoose');
const config = require('../config/config');
const {
  VoterCategory,
  VoterLanguage,
  Scheme,
  Feedback,
  Party,
  Religion,
  CasteCategory,
  Caste,
  SubCaste
} = require('../src/models/Settings');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const voterCategoriesData = [
  { id: '1', name: 'Available', description: 'Voters who are available', icon: '✅', color: '#4CAF50' },
  { id: '2', name: 'Unavailable', description: 'Voters who are unavailable', icon: '❌', color: '#F44336' },
  { id: '3', name: 'Unidentified', description: 'Voters whose status is unknown', icon: '❓', color: '#212121' },
  { id: '4', name: 'Shifted', description: 'Voters who have shifted residence', icon: '⬆️', color: '#1976D2' },
  { id: '5', name: 'Death', description: 'Voters who are deceased', icon: 'RIP', color: '#000000' },
  { id: '6', name: 'Outstation', description: 'Voters who are out of station', icon: '➡️➡️', color: '#1976D2' },
  { id: '7', name: 'Differently Abled', description: 'Voters with disabilities', icon: '♿', color: '#1976D2' },
  { id: '8', name: 'Party Member', description: 'Voters who are party members', icon: '👥', color: '#D32F2F' },
  { id: '9', name: 'BLA-2', description: 'Booth Level Agent - 2', icon: '🗳️', color: '#1976D2' },
  { id: '10', name: 'பொறுப்பாளர் (In-Charge)', description: 'In-Charge person for a booth', icon: '👔', color: '#795548' },
  { id: '11', name: 'Postal Vote', description: 'Voters who cast postal votes', icon: '📮', color: '#D32F2F' },
  { id: '12', name: 'Duplicate', description: 'Duplicate voter entries', icon: '👥', color: '#E91E63' },
  { id: '13', name: 'Booth Agent', description: 'Agent for a specific booth', icon: '🏛️', color: '#388E3C' },
  { id: '14', name: 'Booth Agent & BLA-2', description: 'Both Booth Agent and BLA-2', icon: '👥', color: '#388E3C' }
];

const voterLanguagesData = [
  { id: '1', englishName: 'Malayalam', nativeName: 'മലയാളം', code: 'ml' },
  { id: '2', englishName: 'Tamil', nativeName: 'தமிழ்', code: 'ta' },
  { id: '3', englishName: 'Telugu', nativeName: 'తెలుగు', code: 'te' },
  { id: '4', englishName: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn' },
  { id: '5', englishName: 'Hindi', nativeName: 'हिन्दी', code: 'hi' },
  { id: '6', englishName: 'English', nativeName: 'English', code: 'en' }
];

const schemesData = [
  { id: '1', name: 'Amma Laptop', provider: 'STATE_GOVT', icon: '💻', description: 'Free laptop scheme for students' },
  { id: '2', name: 'Amma Canteen', provider: 'STATE_GOVT', icon: '🍽️', description: 'Subsidized food scheme' },
  { id: '3', name: 'Amma Water', provider: 'STATE_GOVT', icon: '💧', description: 'Free drinking water scheme' },
  { id: '4', name: 'Amma Pharmacy', provider: 'STATE_GOVT', icon: '💊', description: 'Free medicine scheme' },
  { id: '5', name: 'Amma Cement', provider: 'STATE_GOVT', icon: '🏗️', description: 'Subsidized cement scheme' }
];

const feedbackData = [
  { id: '1', title: 'Water issue at our village', description: 'Water supply problem in the village area', language: 'English' },
  { id: '2', title: 'Road repair needed', description: 'Main road needs immediate repair', language: 'Tamil' },
  { id: '3', title: 'Electricity problem', description: 'Frequent power cuts in our area', language: 'Hindi' }
];

const partiesData = [
  { id: '1', tamilName: 'அ.தி.மு.க', englishName: 'ADMK', symbol: '🍃🍃', color: '#4CAF50' },
  { id: '2', tamilName: 'பா.ஜ.க', englishName: 'BJP', symbol: '🪷', color: '#FF9800' },
  { id: '3', tamilName: 'பா.ம.க', englishName: 'PMK', symbol: '🥭', color: '#FF9800' },
  { id: '4', tamilName: 'அ.ம.மு.க', englishName: 'AMMK', symbol: '🥘', color: '#9E9E9E' },
  { id: '5', tamilName: 'தே.மு.தி.க', englishName: 'DMDK', symbol: '🥁', color: '#795548' },
  { id: '6', tamilName: 'நடுநிலை', englishName: 'No Party (Swing Voters)', symbol: '⚫', color: '#212121' },
  { id: '7', tamilName: 'தி.மு.க', englishName: 'DMK', symbol: '☀️', color: '#FFEB3B' },
  { id: '8', tamilName: 'காங்கிரஸ்', englishName: 'INC', symbol: '✋', color: '#00BCD4' }
];

const religionsData = [
  { id: '1', name: 'Hindu', symbol: '🕉️', color: '#FF9800' },
  { id: '2', name: 'Muslim', symbol: '☪️', color: '#4CAF50' },
  { id: '3', name: 'Christian', symbol: '✝️', color: '#9C27B0' },
  { id: '4', name: 'Jainism', symbol: '☸️', color: '#FFEB3B' },
  { id: '5', name: 'Sikhism', symbol: '⚔️', color: '#212121' },
  { id: '6', name: 'Buddhism', symbol: '☸️', color: '#FFEB3B' }
];

const casteCategoriesData = [
  { id: '1', abbreviation: 'ST', number: '23' },
  { id: '2', abbreviation: 'SC', number: '22' },
  { id: '3', abbreviation: 'MBC', number: '21' },
  { id: '4', abbreviation: 'BC', number: '20' },
  { id: '5', abbreviation: 'OC', number: '19' }
];

const castesData = [
  { id: '1', englishName: 'Brahmin', tamilName: 'பிராமணர்', label: 'Hindul' },
  { id: '2', englishName: 'Vanniyar', tamilName: 'வன்னியர்', label: 'Hindul' },
  { id: '3', englishName: 'Mudaliar', tamilName: 'முதலியார்', label: 'Hindul' },
  { id: '4', englishName: 'Chettiar', tamilName: 'செட்டியார்', label: 'Hindul' },
  { id: '5', englishName: 'Naidu', tamilName: 'நாயுடு', label: 'Hindul' }
];

const subCastesData = [
  { id: '1', name: 'Iyer (ஐயர்)', parentCaste: 'Brahmin', label: 'Hindul' },
  { id: '2', name: 'Iyengar (ஐயங்கார்)', parentCaste: 'Brahmin', label: 'Hindul' },
  { id: '3', name: 'Vanniyar (வன்னியர்)', parentCaste: 'Vanniyar', label: 'Hindul' },
  { id: '4', name: 'Mudaliar (முதலியார்)', parentCaste: 'Mudaliar', label: 'Hindul' }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await VoterCategory.deleteMany({});
    await VoterLanguage.deleteMany({});
    await Scheme.deleteMany({});
    await Feedback.deleteMany({});
    await Party.deleteMany({});
    await Religion.deleteMany({});
    await CasteCategory.deleteMany({});
    await Caste.deleteMany({});
    await SubCaste.deleteMany({});

    console.log('Cleared existing data');

    // Insert new data
    await VoterCategory.insertMany(voterCategoriesData);
    console.log('✅ Voter Categories seeded');

    await VoterLanguage.insertMany(voterLanguagesData);
    console.log('✅ Voter Languages seeded');

    await Scheme.insertMany(schemesData);
    console.log('✅ Schemes seeded');

    await Feedback.insertMany(feedbackData);
    console.log('✅ Feedback seeded');

    await Party.insertMany(partiesData);
    console.log('✅ Parties seeded');

    await Religion.insertMany(religionsData);
    console.log('✅ Religions seeded');

    await CasteCategory.insertMany(casteCategoriesData);
    console.log('✅ Caste Categories seeded');

    await Caste.insertMany(castesData);
    console.log('✅ Castes seeded');

    await SubCaste.insertMany(subCastesData);
    console.log('✅ Sub-Castes seeded');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
connectDB().then(() => {
  seedDatabase();
});
