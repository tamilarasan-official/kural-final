const Voter = require('../models/voter');

exports.getVoters = async (req, res) => {
  try {
    const voters = await Voter.find();
    res.json(voters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchVoters = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('Search term:', searchTerm);
    console.log('Searching in votersdata collection...');

    // First, let's check if we can find any documents at all
    const totalDocs = await Voter.countDocuments({});
    console.log('Total documents in collection:', totalDocs);

    // Let's also try to find one document to see the structure
    const sampleDoc = await Voter.findOne({});
    console.log('Sample document:', sampleDoc ? 'Found' : 'Not found');
    if (sampleDoc) {
      console.log('Sample document keys:', Object.keys(sampleDoc));
    }

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

    console.log('Search query:', JSON.stringify(searchQuery, null, 2));

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
};