const mongoose = require('mongoose');
const Voter = require('../src/models/voter');

// Connect to MongoDB
mongoose.connect('mongodb+srv://kural_db:kural_2025@cluster0.tcoecok.mongodb.net/kural?retryWrites=true&w=majority&appName=Cluster0');

async function deleteAllVoters() {
  try {
    console.log('🗑️  Starting deletion of all voters...');
    
    // Count documents before deletion
    const countBefore = await Voter.countDocuments();
    console.log(`📊 Found ${countBefore} voters in the collection`);
    
    if (countBefore === 0) {
      console.log('ℹ️  No voters found to delete');
      return;
    }
    
    // Delete all documents
    const result = await Voter.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} voters`);
    
    // Verify deletion
    const countAfter = await Voter.countDocuments();
    console.log(`📊 Voters remaining after deletion: ${countAfter}`);
    
    if (countAfter === 0) {
      console.log('🎉 All voters have been successfully deleted!');
    } else {
      console.log('⚠️  Some voters may still remain in the collection');
    }
    
  } catch (error) {
    console.error('❌ Error deleting voters:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

deleteAllVoters();
