const express = require('express');
const { register, login, updateProfile, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.route('/profile').get(protect, getUserProfile).put(protect, updateProfile);

module.exports = router;
