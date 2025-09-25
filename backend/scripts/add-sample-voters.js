const mongoose = require('mongoose');
const Voter = require('../src/models/voter');
const config = require('../config/config');

const sampleVoters = [
  {
    sr: "001",
    name: "John Doe",
    Relation: "Self",
    Father_Name: "Robert Doe",
    Number: "9876543210",
    sex: "Male",
    makan: "123 Main St",
    Anubhag_number: "A001",
    age: 35,
    vidhansabha: 119,
    Part_Name: "Thondamuthur"
  },
  {
    sr: "002", 
    name: "Jane Smith",
    Relation: "Self",
    Father_Name: "Michael Smith",
    Number: "9876543211",
    sex: "Female",
    makan: "456 Oak Ave",
    Anubhag_number: "A002",
    age: 28,
    vidhansabha: 119,
    Part_Name: "Thondamuthur"
  },
  {
    sr: "003",
    name: "Mike Johnson",
    Relation: "Self", 
    Father_Name: "David Johnson",
    Number: "9876543212",
    sex: "Male",
    makan: "789 Pine St",
    Anubhag_number: "A003",
    age: 42,
    vidhansabha: 119,
    Part_Name: "Thondamuthur"
  }
];

async function addSampleVoters() {
  try {
    await mongoose.connect(config.DATABASE_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing voters
    await Voter.deleteMany({});
    console.log('Cleared existing voters');
    
    // Add sample voters
    await Voter.insertMany(sampleVoters);
    console.log('Added sample voters:', sampleVoters.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addSampleVoters();
