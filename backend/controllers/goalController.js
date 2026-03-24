const Goal = require('../models/Goal');

// @desc    Get all goals for logged in user
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user.id }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: goals.length,
            data: goals
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add a goal
// @route   POST /api/goals
// @access  Private
exports.addGoal = async (req, res) => {
    try {
        req.body.user = req.user.id;

        const goal = await Goal.create(req.body);

        res.status(201).json({
            success: true,
            data: goal
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res) => {
    try {
        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ success: false, error: 'No goal found' });
        }

        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: goal
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ success: false, error: 'No goal found' });
        }

        if (goal.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        await goal.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
