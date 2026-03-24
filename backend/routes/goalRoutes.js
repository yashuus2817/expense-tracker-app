const express = require('express');
const { getGoals, addGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all routes

router
    .route('/')
    .get(getGoals)
    .post(addGoal);

router
    .route('/:id')
    .put(updateGoal)
    .delete(deleteGoal);

module.exports = router;
