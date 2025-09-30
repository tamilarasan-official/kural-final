const mongoose = require('mongoose');
const Vulnerability = require('../src/models/vulnerability');

// Connect to MongoDB
mongoose.connect('mongodb+srv://kural_db:kural_2025@cluster0.tcoecok.mongodb.net/kural?retryWrites=true&w=majority&appName=Cluster0');

const vulnerabilities = [
  {
    name: 'High Risk',
    color: '#FF6B6B', // Red
    description: 'High vulnerability areas requiring immediate attention'
  },
  {
    name: 'Medium Risk',
    color: '#FFD93D', // Yellow
    description: 'Medium vulnerability areas requiring monitoring'
  },
  {
    name: 'Low Risk',
    color: '#6BCF7F', // Green
    description: 'Low vulnerability areas with minimal risk'
  },
  {
    name: 'Safe',
    color: '#4ECDC4', // Teal
    description: 'Safe areas with no significant vulnerabilities'
  },
  {
    name: 'Unknown',
    color: '#95A5A6', // Gray
    description: 'Areas with unknown vulnerability status'
  }
];

async function seedVulnerabilities() {
  try {
    console.log('🌱 Seeding vulnerabilities...');
    
    // Clear existing data
    await Vulnerability.deleteMany({});
    console.log('🗑️  Cleared existing vulnerability data');
    
    // Insert sample data
    const insertedVulnerabilities = await Vulnerability.insertMany(vulnerabilities);
    console.log(`✅ Inserted ${insertedVulnerabilities.length} vulnerabilities`);
    
    console.log('🎉 Vulnerability seeding completed successfully!');
    
    // Show summary
    console.log('\n📈 Vulnerability Summary:');
    insertedVulnerabilities.forEach(vuln => {
      console.log(`${vuln.name}: ${vuln.color} - ${vuln.description}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding vulnerabilities:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedVulnerabilities();
