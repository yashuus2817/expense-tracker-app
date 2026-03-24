const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a goal title']
    },
    targetAmount: {
        type: Number,
        required: [true, 'Please add a target amount']
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        required: [true, 'Please add a deadline']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Goal', GoalSchema);
