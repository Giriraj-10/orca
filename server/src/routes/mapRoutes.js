const express = require('express');
const router = express.Router();
const { getMapLayers } = require('../controllers/mapController');

router.get('/layers', getMapLayers);

module.exports = router;
