const express = require('express');
const router = express.Router();
const { analyzeRisk } = require('../controllers/riskController');

router.post('/analyze', analyzeRisk);
router.post('/calculate', analyzeRisk);
router.get('/nearby', analyzeRisk);
router.get('/', analyzeRisk);

module.exports = router;
