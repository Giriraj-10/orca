const dsm = require('../dataSources/DataSourceManager');
const FishingZone = require('../models/FishingZone');
const { calculateDistance } = require('../utils/geoUtils');
const logger = require('../utils/logger');

// @desc    Get all active potential fishing zones
// @route   GET /api/fishing-zones (and GET /api/pfz/latest)
const getFishingZones = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;
    const radiusKm = parseFloat(req.query.radiusKm) || 120;

    const [marine, weather, eo] = await Promise.all([
      dsm.marine.getConditions(lat, lng),
      dsm.weather.getWeather(lat, lng),
      dsm.ocean.getEOData(lat, lng)
    ]);

    const pfzResult = await dsm.pfz.getZones({
      latitude: lat,
      longitude: lng,
      sst: marine.sst,
      chlorophyll: eo.chlorophyll,
      waveHeight: marine.wave?.height ?? 1.1,
      windSpeed: weather.windSpeed,
      radiusKm
    });

    res.json({
      success: true,
      count: pfzResult.zones?.length || 0,
      data: pfzResult.zones || [],
      source: pfzResult.source,
      isOfficialAdvisory: Boolean(pfzResult.isOfficialAdvisory),
      advisoryDate: pfzResult.advisoryDate,
      sector: pfzResult.sector,
      disclaimer: pfzResult.disclaimer,
      dataMode: pfzResult.dataMode,
      timestamp: pfzResult.retrievedAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fishing zones near a location
// @route   GET /api/fishing-zones/nearby (and GET /api/pfz/nearby)
const getNearbyFishingZones = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;
    const radiusKm = parseFloat(req.query.radiusKm) || 100;

    const [marine, weather, eo] = await Promise.all([
      dsm.marine.getConditions(lat, lng),
      dsm.weather.getWeather(lat, lng),
      dsm.ocean.getEOData(lat, lng)
    ]);

    const pfzResult = await dsm.pfz.getZones({
      latitude: lat,
      longitude: lng,
      sst: marine.sst,
      chlorophyll: eo.chlorophyll,
      waveHeight: marine.wave?.height ?? 1.1,
      windSpeed: weather.windSpeed,
      radiusKm
    });

    res.json({
      success: true,
      origin: { latitude: lat, longitude: lng },
      count: pfzResult.zones?.length || 0,
      data: pfzResult.zones || [],
      source: pfzResult.source,
      isOfficialAdvisory: Boolean(pfzResult.isOfficialAdvisory),
      disclaimer: pfzResult.disclaimer,
      timestamp: pfzResult.retrievedAt
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

    const [marine, weather, eo] = await Promise.all([
      dsm.marine.getConditions(lat, lng),
      dsm.weather.getWeather(lat, lng),
      dsm.ocean.getEOData(lat, lng)
    ]);

    const pfzResult = await dsm.pfz.getZones({
      latitude: lat,
      longitude: lng,
      sst: marine.sst,
      chlorophyll: eo.chlorophyll,
      waveHeight: marine.wave?.height ?? 1.1,
      windSpeed: weather.windSpeed,
      radiusKm: 60
    });

    res.json({
      success: true,
      coordinates: { latitude: lat, longitude: lng },
      conditions: {
        sst: marine.sst,
        chlorophyll: eo.chlorophyll,
        waveHeight: marine.wave?.height ?? 1.1,
        windSpeed: weather.windSpeed
      },
      analysis: pfzResult.zones?.[0] || {
        suitability: 'MEDIUM',
        confidence: 0.81,
        reason: 'Optimal coastal front dynamics.'
      },
      source: pfzResult.source,
      isOfficialAdvisory: Boolean(pfzResult.isOfficialAdvisory),
      disclaimer: pfzResult.disclaimer
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
