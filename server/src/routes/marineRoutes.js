const express = require('express');
const router = express.Router();
const {
  getConditions,
  getObservations,
  getNearby,
  compareLocations
} = require('../controllers/marineController');

router.get('/conditions', getConditions);
router.get('/observations', getObservations);
router.get('/nearby', getNearby);
router.get('/compare', compareLocations);

module.exports = router;
