const express = require('express');
const router = express.Router();
const {
  getConditions,
  getForecast,
  getTides,
  getObservations,
  compareLocations
} = require('../controllers/marineController');

router.get('/conditions', getConditions);
router.get('/current', getConditions);
router.get('/forecast', getForecast);
router.get('/tides', getTides);
router.get('/observations', getObservations);
router.get('/nearby', getConditions);
router.get('/compare', compareLocations);

module.exports = router;
