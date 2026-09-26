const express = require('express');
const router = express.Router();
const {
  searchLocation,
  checkGeofence,
  getAllGeofences,
  calculateRoute
} = require('../controllers/geospatialController');

router.get('/geocode/search', searchLocation);
router.post('/geofence/check', checkGeofence);
router.get('/geofence/all', getAllGeofences);
router.post('/routes/safest', calculateRoute);

module.exports = router;
