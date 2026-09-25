const express = require('express');
const router = express.Router();
const {
  getFishingZones,
  getNearbyFishingZones,
  analyzeFishingZone
} = require('../controllers/fishingZoneController');

router.get('/', getFishingZones);
router.get('/nearby', getNearbyFishingZones);
router.post('/analyze', analyzeFishingZone);

module.exports = router;
