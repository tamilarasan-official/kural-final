const mongoose = require('mongoose');

const boothAgentActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    loginTime: {
        type: Date,
    },
    logoutTime: {
        type: Date,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    status: {
        type: String,
        enum: ['login', 'logout'],
    }
}, { timestamps: true });

boothAgentActivitySchema.index({ location: '2dsphere' });

const BoothAgentActivity = mongoose.model('BoothAgentActivity', boothAgentActivitySchema);

module.exports = BoothAgentActivity;