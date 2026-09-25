const FishingZone = require('../models/FishingZone');
const fishingZoneAgent = require('../agents/fishingZoneAgent');
const weatherAgent = require('../agents/weatherAgent');
const oceanAgent = require('../agents/oceanAgent');
const earthObservationAgent = require('../agents/earthObservationAgent');
const { calculateDistance } = require('../utils/geoUtils');
const { generateFishingZones } = require('../data/seedData');

// @desc    Get all active potential fishing zones
// @route   GET /api/fishing-zones
const getFishingZones = async (req, res, next) => {
  try {
    const regionId = req.query.regionId;
    let query = {};
    if (regionId) query.regionId = regionId;

    let zones = [];
    try {
      zones = await FishingZone.find(query).sort({ confidence: -1 });
    } catch (e) {
      // fallback
    }

    if (!zones || zones.length === 0) {
      zones = generateFishingZones();
      if (regionId) zones = zones.filter(z => z.regionId === regionId);
    }

    res.json({
      success: true,
      count: zones.length,
      data: zones,
      mode: 'DEMO',
      disclaimer: 'Prototype suitability estimate — not an official regulatory forecast'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fishing zones near a location
// @route   GET /api/fishing-zones/nearby
const getNearbyFishingZones = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude) || 18.922;
    const lng = parseFloat(req.query.longitude) || 72.8347;
    const maxRadius = parseFloat(req.query.radiusKm) || 100;

    let zones = [];
    try {
      zones = await FishingZone.find({});
    } catch (e) {
      // fallback
    }

    if (!zones || zones.length === 0) {
      zones = generateFishingZones();
    }

    // Annotate with distance
    const nearby = zones
      .map(z => {
        const zLat = z.center ? z.center.latitude : z.coordinates?.[1];
        const zLng = z.center ? z.center.longitude : z.coordinates?.[0];
        const dist = calculateDistance(lat, lng, zLat, zLng);
        return {
          ...z.toObject ? z.toObject() : z,
          distanceKm: dist
        };
      })
      .filter(z => z.distanceKm <= maxRadius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      origin: { latitude: lat, longitude: lng },
      count: nearby.length,
      data: nearby,
      mode: 'DEMO',
      disclaimer: 'Prototype suitability estimate'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dynamically analyze a custom point for fishing suitability
// @route   POST /api/fishing-zones/analyze
const analyzeFishingZone = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const lat = parseFloat(latitude) || 18.922;
    const lng = parseFloat(longitude) || 72.8347;

    const [wRes, oRes, eoRes] = await Promise.all([
      weatherAgent.execute(lat, lng),
      oceanAgent.execute(lat, lng),
      earthObservationAgent.execute(lat, lng)
    ]);

    const result = await fishingZoneAgent.execute(lat, lng, wRes.data, oRes.data, eoRes.data);

    res.json({
      success: true,
      coordinates: { latitude: lat, longitude: lng },
      analysis: result.data,
      mode: 'DEMO',
      disclaimer: 'Prototype suitability estimate'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFishingZones,
  getNearbyFishingZones,
  analyzeFishingZone
};
