const BoothAgentActivity = require('../models/BoothAgentActivity');
const { asyncHandler } = require('../utils/asyncHandler');

exports.login = asyncHandler(async(req, res) => {
    const { userId } = req.body;
    const activity = await BoothAgentActivity.create({
        userId,
        loginTime: new Date(),
        status: 'login'
    });
    res.status(201).json({ message: 'Login activity recorded successfully', activity });
});

exports.logout = asyncHandler(async(req, res) => {
    const { userId } = req.body;
    const activity = await BoothAgentActivity.findOneAndUpdate({ userId, status: 'login' }, { logoutTime: new Date(), status: 'logout' }, { sort: { createdAt: -1 }, new: true });

    if (!activity) {
        return res.status(404).json({ message: 'No active login session found for this user' });
    }

    res.status(200).json({ message: 'Logout activity recorded successfully', activity });
});

exports.updateLocation = asyncHandler(async(req, res) => {
    const { userId, location } = req.body;
    const activity = await BoothAgentActivity.findOneAndUpdate({ userId, status: 'login' }, { location }, { sort: { createdAt: -1 }, new: true });

    if (!activity) {
        return res.status(404).json({ message: 'No active login session found for this user' });
    }

    res.status(200).json({ message: 'Location updated successfully', activity });
});

exports.getBoothAgentActivity = asyncHandler(async(req, res) => {
    const activity = await BoothAgentActivity.find()
        .populate('userId', 'name')
        .lean();
    res.status(200).json(activity);
});