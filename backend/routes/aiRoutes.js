const express = require('express');
const { getInsights, parseSms } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/insights', getInsights);
router.post('/parse-sms', parseSms);

module.exports = router;
