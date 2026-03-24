const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    category: {
        type: String,
        required: [true, 'Please select a category']
    },
    notes: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        required: [true, 'Please add a date'],
        default: Date.now
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
