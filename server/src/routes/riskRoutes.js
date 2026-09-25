const express = require('express');
const router = express.Router();
const {
  analyzeRisk,
  getNearbyRisk
} = require('../controllers/riskController');

router.post('/analyze', analyzeRisk);
router.get('/nearby', getNearbyRisk);

module.exports = router;
