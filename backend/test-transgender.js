const mongoose = require('mongoose');
const Voter = require('./src/models/voter');

mongoose.connect('mongodb://localhost:27017/mykural', {})
    .then(async() => {
        console.log('Connected to MongoDB');

        // Check transgender voters count
        const count = await Voter.countDocuments({
            $or: [
                { gender: { $regex: /transgender/i } },
                { gender: { $regex: /third/i } },
                { gender: { $regex: /others/i } },
                { gender: { $regex: /other/i } },
                { sex: { $regex: /transgender/i } },
                { sex: { $regex: /third/i } },
                { sex: { $regex: /others/i } },
                { sex: { $regex: /other/i } }
            ]
        });

        console.log('\nTransgender voters count:', count);

        if (count > 0) {
            // Get a sample transgender voter
            const sample = await Voter.findOne({
                $or: [
                    { gender: { $regex: /transgender/i } },
                    { gender: { $regex: /third/i } },
                    { gender: { $regex: /others/i } },
                    { gender: { $regex: /other/i } }
                ]
            }).lean();

            console.log('\nSample transgender voter:');
            console.log(JSON.stringify(sample, null, 2));
        } else {
            // Check what genders exist in the database
            console.log('\nNo transgender voters found. Checking all genders...');
            const genders = await Voter.distinct('gender');
            const sexes = await Voter.distinct('sex');
            console.log('\nDistinct genders:', genders);
            console.log('\nDistinct sexes:', sexes);

            // Get sample of voters
            const samples = await Voter.find({}).limit(3).lean();
            console.log('\nSample voters:');
            samples.forEach((v, i) => {
                console.log(`\nVoter ${i + 1}:`, {
                    name: v.name || v.Name,
                    gender: v.gender,
                    sex: v.sex
                });
            });
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });