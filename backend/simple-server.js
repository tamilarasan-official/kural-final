const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const Voter = require('./src/models/voter');
const profileRoutes = require('./src/routes/profileRoutes');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.DATABASE_URI)
  .then(() => console.log('✅ MongoDB Connected...'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Routes
app.use('/api/v1/profile', profileRoutes);

// Search endpoint
app.get('/api/v1/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('Search term:', searchTerm);

    // Search in multiple fields
    const searchQuery = {
      $or: [
        { Name: { $regex: searchTerm, $options: 'i' } },
        { 'Father Name': { $regex: searchTerm, $options: 'i' } },
        { Number: { $regex: searchTerm, $options: 'i' } },
        { Anubhag_name: { $regex: searchTerm, $options: 'i' } },
        { 'Part Name': { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Get total count for pagination
    const totalCount = await Voter.countDocuments(searchQuery);
    console.log('Matching documents:', totalCount);
    
    // Get voters with pagination
    const voters = await Voter.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ sr: 1 });

    console.log('Returned voters:', voters.length);

    res.json({
      voters,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Local access: http://localhost:${PORT}`);
  console.log(`🌐 Network access: http://192.168.31.31:${PORT}`);
});
