const express = require('express');
const { getExpenses, addExpense, deleteExpense, getExpenseStats } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getExpenses)
    .post(protect, addExpense);

router.route('/stats')
    .get(protect, getExpenseStats);

router.route('/:id')
    .delete(protect, deleteExpense);

module.exports = router;
