const express = require('express');
const router = express.Router();
const { getSST, getChlorophyll } = require('../controllers/oceanController');
const { getMapLayers } = require('../controllers/mapController');

router.get('/sst', getSST);
router.get('/chlorophyll', getChlorophyll);
router.get('/layers', getMapLayers);

module.exports = router;
