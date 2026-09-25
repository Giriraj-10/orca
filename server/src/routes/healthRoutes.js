const express = require('express');
const router = express.Router();
const { getDbStatus } = require('../config/db');
const env = require('../config/env');

router.get('/', (req, res) => {
  const db = getDbStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ORCA — Marine EcOsystem Reasoning with Collaborative Agents',
    uptimeSeconds: Math.floor(process.uptime()),
    database: db.isConnected ? 'CONNECTED' : 'STANDALONE_FALLBACK',
    dataMode: env.DATA_MODE,
    aiEngine: env.GEMINI_API_KEY ? 'GEMINI_ENABLED' : 'DETERMINISTIC_FALLBACK'
  });
});

module.exports = router;
