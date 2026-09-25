const MarineObservation = require('../models/MarineObservation');
const WeatherObservation = require('../models/WeatherObservation');
const OceanObservation = require('../models/OceanObservation');
const COASTAL_REGIONS = require('../data/coastalRegions');
const { calculateDistance } = require('../utils/geoUtils');
const geospatialAgent = require('../agents/geospatialAgent');
const weatherAgent = require('../agents/weatherAgent');
const oceanAgent = require('../agents/oceanAgent');
const earthObservationAgent = require('../agents/earthObservationAgent');
const fishingZoneAgent = require('../agents/fishingZoneAgent');
const riskAgent = require('../agents/riskAgent');

// @desc    Get current marine conditions for a region or coordinates
// @route   GET /api/marine/conditions
const getConditions = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude) || 18.922;
    const lng = parseFloat(req.query.longitude) || 72.8347;
    const regionId = req.query.regionId;

    let targetRegion = COASTAL_REGIONS[0];
    if (regionId) {
      const match = COASTAL_REGIONS.find(r => r.id === regionId);
      if (match) targetRegion = match;
    } else {
      let minDist = Infinity;
      for (const r of COASTAL_REGIONS) {
        const d = calculateDistance(lat, lng, r.center.latitude, r.center.longitude);
        if (d < minDist) {
          minDist = d;
          targetRegion = r;
        }
      }
    }

    // Run agents for this location
    const [wRes, oRes, eoRes] = await Promise.all([
      weatherAgent.execute(lat, lng),
      oceanAgent.execute(lat, lng),
      earthObservationAgent.execute(lat, lng)
    ]);

    const weather = wRes.data;
    const ocean = oRes.data;
    const eo = eoRes.data;

    const [fRes, rRes] = await Promise.all([
      fishingZoneAgent.execute(lat, lng, weather, ocean, eo),
      riskAgent.execute(weather, ocean)
    ]);

    const fishing = fRes.data;
    const risk = rRes.data;

    res.json({
      success: true,
      region: {
        id: targetRegion.id,
        name: targetRegion.name,
        state: targetRegion.state,
        sea: targetRegion.sea,
        center: targetRegion.center
      },
      currentConditions: {
        sst: ocean.sst,
        chlorophyll: eo.chlorophyll,
        waveHeight: ocean.waveHeight,
        wavePeriod: ocean.wavePeriod,
        windSpeed: weather.windSpeed,
        windDirection: weather.windDirection,
        tideStatus: ocean.tide,
        seaCondition: ocean.seaCondition,
        fishingSuitability: fishing.overallSuitability,
        fishingConfidence: fishing.overallConfidence,
        riskLevel: risk.riskLevel,
        riskScore: risk.overallScore,
        weatherCondition: weather.condition,
        visibility: weather.visibility
      },
      subFactors: risk.subFactors,
      mode: 'DEMO',
      disclaimer: 'ORCA prototype estimate based on simulated coastal feeds'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get marine observations list (for trend charts / tables)
// @route   GET /api/marine/observations
const getObservations = async (req, res, next) => {
  try {
    const regionId = req.query.regionId;
    let query = {};
    if (regionId) query.regionId = regionId;

    let observations = [];
    try {
      observations = await MarineObservation.find(query).sort({ timestamp: -1 }).limit(50);
    } catch (e) {
      // fallback
    }

    if (!observations || observations.length === 0) {
      const { generateMarineObservations } = require('../data/seedData');
      observations = generateMarineObservations();
      if (regionId) observations = observations.filter(o => o.regionId === regionId);
    }

    res.json({
      success: true,
      count: observations.length,
      data: observations,
      mode: 'DEMO'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get observations nearby a point
// @route   GET /api/marine/nearby
const getNearby = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude) || 18.922;
    const lng = parseFloat(req.query.longitude) || 72.8347;

    const nearestRegion = geospatialAgent.findNearestRegion(lat, lng);
    const [wRes, oRes, eoRes] = await Promise.all([
      weatherAgent.execute(lat, lng),
      oceanAgent.execute(lat, lng),
      earthObservationAgent.execute(lat, lng)
    ]);

    res.json({
      success: true,
      nearestRegion,
      weather: wRes.data,
      ocean: oRes.data,
      eo: eoRes.data,
      mode: 'DEMO'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare marine conditions between two locations
// @route   GET /api/marine/compare
const compareLocations = async (req, res, next) => {
  try {
    const loc1 = req.query.loc1 || 'mumbai';
    const loc2 = req.query.loc2 || 'goa';

    const r1 = COASTAL_REGIONS.find(r => r.id.toLowerCase() === loc1.toLowerCase()) || COASTAL_REGIONS[0];
    const r2 = COASTAL_REGIONS.find(r => r.id.toLowerCase() === loc2.toLowerCase()) || COASTAL_REGIONS[1];

    const [c1Weather, c1Ocean, c1Eo] = await Promise.all([
      weatherAgent.execute(r1.center.latitude, r1.center.longitude),
      oceanAgent.execute(r1.center.latitude, r1.center.longitude),
      earthObservationAgent.execute(r1.center.latitude, r1.center.longitude)
    ]);

    const [c2Weather, c2Ocean, c2Eo] = await Promise.all([
      weatherAgent.execute(r2.center.latitude, r2.center.longitude),
      oceanAgent.execute(r2.center.latitude, r2.center.longitude),
      earthObservationAgent.execute(r2.center.latitude, r2.center.longitude)
    ]);

    const [c1Fishing, c1Risk] = await Promise.all([
      fishingZoneAgent.execute(r1.center.latitude, r1.center.longitude, c1Weather.data, c1Ocean.data, c1Eo.data),
      riskAgent.execute(c1Weather.data, c1Ocean.data)
    ]);

    const [c2Fishing, c2Risk] = await Promise.all([
      fishingZoneAgent.execute(r2.center.latitude, r2.center.longitude, c2Weather.data, c2Ocean.data, c2Eo.data),
      riskAgent.execute(c2Weather.data, c2Ocean.data)
    ]);

    const dist = calculateDistance(r1.center.latitude, r1.center.longitude, r2.center.latitude, r2.center.longitude);

    res.json({
      success: true,
      distanceBetweenKm: dist,
      locationA: {
        id: r1.id,
        name: r1.name,
        state: r1.state,
        sea: r1.sea,
        coordinates: r1.center,
        metrics: {
          sst: c1Ocean.data.sst,
          chlorophyll: c1Eo.data.chlorophyll,
          waveHeight: c1Ocean.data.waveHeight,
          windSpeed: c1Weather.data.windSpeed,
          seaCondition: c1Ocean.data.seaCondition,
          fishingSuitability: c1Fishing.data.overallSuitability,
          fishingConfidence: c1Fishing.data.overallConfidence,
          riskLevel: c1Risk.data.riskLevel,
          riskScore: c1Risk.data.overallScore
        }
      },
      locationB: {
        id: r2.id,
        name: r2.name,
        state: r2.state,
        sea: r2.sea,
        coordinates: r2.center,
        metrics: {
          sst: c2Ocean.data.sst,
          chlorophyll: c2Eo.data.chlorophyll,
          waveHeight: c2Ocean.data.waveHeight,
          windSpeed: c2Weather.data.windSpeed,
          seaCondition: c2Ocean.data.seaCondition,
          fishingSuitability: c2Fishing.data.overallSuitability,
          fishingConfidence: c2Fishing.data.overallConfidence,
          riskLevel: c2Risk.data.riskLevel,
          riskScore: c2Risk.data.overallScore
        }
      },
      analysisSummary: `Comparing ${r1.name} against ${r2.name} (${dist} km distance). ${r1.name} reports SST of ${c1Ocean.data.sst}°C and Chlorophyll of ${c1Eo.data.chlorophyll} mg/m³, while ${r2.name} exhibits SST of ${c2Ocean.data.sst}°C and Chlorophyll of ${c2Eo.data.chlorophyll} mg/m³. Suitability is rated ${c1Fishing.data.overallSuitability} for ${r1.name} and ${c2Fishing.data.overallSuitability} for ${r2.name}.`,
      disclaimer: 'Comparative prototype evaluation. Neither location is unilaterally endorsed without vessel-specific context.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConditions,
  getObservations,
  getNearby,
  compareLocations
};
