const express = require('express');
const router = express.Router();
const { getDataSources, getSystemStatus } = require('../controllers/dataController');

router.get('/sources', getDataSources);
router.get('/status', getSystemStatus);

module.exports = router;
