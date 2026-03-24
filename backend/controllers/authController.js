const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    try {
        const { name, mobileNumber, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'Passwords do not match' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const user = await User.create({
            name,
            mobileNumber,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                email: user.email,
                theme: user.theme,
                budget: user.monthlyBudget,
                token: generateToken(user._id)
            });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            _id: user._id,
            name: user.name,
            mobileNumber: user.mobileNumber,
            email: user.email,
            theme: user.theme,
            budget: user.monthlyBudget,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.theme = req.body.theme || user.theme;
            user.monthlyBudget = req.body.monthlyBudget !== undefined ? req.body.monthlyBudget : user.monthlyBudget;
            if (req.body.name) user.name = req.body.name;
            if (req.body.mobileNumber) user.mobileNumber = req.body.mobileNumber;

            const updatedUser = await user.save();

            res.json({
                success: true,
                _id: updatedUser._id,
                name: updatedUser.name,
                mobileNumber: updatedUser.mobileNumber,
                theme: updatedUser.theme,
                budget: updatedUser.monthlyBudget
            });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                email: user.email,
                theme: user.theme,
                budget: user.monthlyBudget
            });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
