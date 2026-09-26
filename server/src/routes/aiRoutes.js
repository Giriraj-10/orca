const express = require('express');
const router = express.Router();
const { processAiQuery, getAiHistory } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { aiQueryLimiter } = require('../middleware/rateLimiter');

router.post('/query', aiQueryLimiter, optionalAuth, processAiQuery);
router.post('/chat', aiQueryLimiter, optionalAuth, processAiQuery);
router.get('/history', optionalAuth, getAiHistory);

module.exports = router;
