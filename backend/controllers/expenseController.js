const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.addExpense = async (req, res) => {
    try {
        req.body.user = req.user.id;

        const expense = await Expense.create(req.body);

        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        } else {
            res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, error: 'No expense found' });
        }

        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this expense' });
        }

        await expense.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });

    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getExpenseStats = async (req, res) => {
    try {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const expenses = await Expense.find({
            user: req.user.id,
            date: { $gte: firstDay, $lte: lastDay }
        });

        const totalAmount = expenses.reduce((acc, current) => acc + current.amount, 0);

        const categoryTotals = expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                totalAmount,
                categoryTotals,
                currency: '₹'
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
