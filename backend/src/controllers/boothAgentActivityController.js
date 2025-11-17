const BoothAgentActivity = require('../models/BoothAgentActivity');

exports.login = async(req, res) => {
    try {
        const { userId } = req.body;
        const activity = new BoothAgentActivity({
            userId,
            loginTime: new Date(),
            status: 'login'
        });
        await activity.save();
        res.status(201).json({ message: 'Login activity recorded successfully', activity });
    } catch (error) {
        res.status(500).json({ message: 'Error recording login activity', error });
    }
};

exports.logout = async(req, res) => {
    try {
        const { userId } = req.body;
        const activity = await BoothAgentActivity.findOne({ userId, status: 'login' }).sort({ createdAt: -1 });
        if (activity) {
            activity.logoutTime = new Date();
            activity.status = 'logout';
            await activity.save();
            res.status(200).json({ message: 'Logout activity recorded successfully', activity });
        } else {
            res.status(404).json({ message: 'No active login session found for this user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error recording logout activity', error });
    }
};

exports.updateLocation = async(req, res) => {
    try {
        const { userId, location } = req.body;
        const activity = await BoothAgentActivity.findOne({ userId, status: 'login' }).sort({ createdAt: -1 });
        if (activity) {
            activity.location = location;
            await activity.save();
            res.status(200).json({ message: 'Location updated successfully', activity });
        } else {
            res.status(404).json({ message: 'No active login session found for this user' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating location', error });
    }
};

exports.getBoothAgentActivity = async(req, res) => {
    try {
        const activity = await BoothAgentActivity.find().populate('userId', 'name');
        res.status(200).json(activity);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booth agent activity', error });
    }
};