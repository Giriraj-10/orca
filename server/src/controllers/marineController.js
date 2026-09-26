const dsm = require('../dataSources/DataSourceManager');
const riskAgent = require('../agents/riskAgent');
const COASTAL_REGIONS = require('../data/coastalRegions');
const { calculateDistance } = require('../utils/geoUtils');
const logger = require('../utils/logger');

// @desc    Get live marine conditions for coordinates or coastal sector
// @route   GET /api/marine/conditions (and GET /api/marine/current)
const getConditions = async (req, res, next) => {
  try {
    let lat = parseFloat(req.query.latitude || req.query.lat);
    let lng = parseFloat(req.query.longitude || req.query.lng);
    const regionId = req.query.regionId;
    const targetDate = req.query.targetDate || null;

    let targetRegion = null;
    if (regionId) {
      targetRegion = COASTAL_REGIONS.find(r => r.id === regionId);
      if (targetRegion && (isNaN(lat) || isNaN(lng))) {
        lat = targetRegion.center.latitude;
        lng = targetRegion.center.longitude;
      }
    }

    if (isNaN(lat) || isNaN(lng)) {
      lat = 18.922;
      lng = 72.8347;
      targetRegion = COASTAL_REGIONS[0];
    } else if (!targetRegion) {
      // Find nearest reference sector for descriptive naming
      let minDist = Infinity;
      for (const r of COASTAL_REGIONS) {
        const d = calculateDistance(lat, lng, r.center.latitude, r.center.longitude);
        if (d < minDist) {
          minDist = d;
          targetRegion = r;
        }
      }
    }

    // Run live data sources in parallel
    const [marine, weather, eo, tide, geofence, alerts] = await Promise.all([
      dsm.marine.getConditions(lat, lng, targetDate),
      dsm.weather.getWeather(lat, lng, targetDate),
      dsm.ocean.getEOData(lat, lng, targetDate),
      dsm.tide.getTide(lat, lng, targetDate),
      dsm.geo.checkGeofence(lat, lng),
      dsm.alert.getAlerts(lat, lng, 100)
    ]);

    const sst = marine.sst ?? 28.0;
    const chlorophyll = eo.chlorophyll ?? 1.8;
    const waveHeight = marine.wave?.height ?? 1.1;
    const wavePeriod = marine.wave?.period ?? 8.0;
    const windSpeed = weather.windSpeed ?? 14.0;
    const windDirection = weather.windDirection ?? 'W';

    // Downstream deterministic risk and PFZ evaluation
    const [riskRes, pfzRes] = await Promise.all([
      riskAgent.execute(weather, marine, geofence, alerts),
      dsm.pfz.getZones({ latitude: lat, longitude: lng, sst, chlorophyll, waveHeight, windSpeed, radiusKm: 120 })
    ]);

    const risk = riskRes.data;
    const candidateZones = pfzRes.zones || [];
    let topSuitability = 'MEDIUM';
    let topConfidence = 0.82;
    if (candidateZones.length > 0) {
      topSuitability = candidateZones[0].suitability;
      topConfidence = candidateZones[0].confidence;
    }

    res.json({
      success: true,
      region: {
        id: targetRegion ? targetRegion.id : 'custom',
        name: targetRegion ? targetRegion.name : 'Target Coastal Waters',
        state: targetRegion ? targetRegion.state : 'Maritime Sector',
        sea: targetRegion ? targetRegion.sea : 'Indian Ocean',
        coordinates: { latitude: lat, longitude: lng }
      },
      currentConditions: {
        sst: Number(sst.toFixed(1)),
        chlorophyll: Number(chlorophyll.toFixed(2)),
        waveHeight: Number(waveHeight.toFixed(2)),
        wavePeriod: Number(wavePeriod.toFixed(1)),
        windSpeed: Number(windSpeed.toFixed(1)),
        windDirection: windDirection,
        tideStatus: tide.currentTideState,
        seaCondition: marine.seaCondition || 'Moderate',
        fishingSuitability: topSuitability,
        fishingConfidence: topConfidence,
        riskLevel: risk.riskLevel,
        riskScore: risk.overallScore,
        weatherCondition: weather.condition,
        visibility: weather.visibility
      },
      subFactors: risk.subFactors,
      sources: {
        marine: marine.source,
        weather: weather.source,
        chlorophyll: eo.source,
        tide: tide.source,
        pfz: pfzRes.source
      },
      dataMode: marine.dataMode || weather.dataMode || 'live',
      isLive: Boolean(marine.isLive && weather.isLive),
      isCached: Boolean(marine.isCached || weather.isCached),
      retrievedAt: new Date().toISOString(),
      disclaimer: 'Live operational marine forecast synthesized from Open-Meteo & IMD'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live hourly forecast for diurnal Recharts graphs
// @route   GET /api/marine/forecast
const getForecast = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;

    const [marine, weather] = await Promise.all([
      dsm.marine.getConditions(lat, lng),
      dsm.weather.getWeather(lat, lng)
    ]);

    // Build unified 24h diurnal hourly forecast combining marine and weather
    const hourlyCombined = [];
    const marineTs = marine.timeseries || [];
    const weatherTs = weather.hourlyTrends || [];

    const count = Math.min(24, Math.max(marineTs.length, weatherTs.length));
    for (let i = 0; i < count; i++) {
      const mItem = marineTs[i] || {};
      const wItem = weatherTs[i] || {};
      hourlyCombined.push({
        time: mItem.time || wItem.time || `${i}:00`,
        isoTime: mItem.isoTime || wItem.isoTime,
        sst: mItem.sst ?? marine.sst,
        waveHeight: mItem.waveHeight ?? marine.wave?.height ?? 1.1,
        wavePeriod: mItem.wavePeriod ?? 8.0,
        currentSpeed: mItem.currentSpeed ?? 0.4,
        windSpeed: wItem.windSpeed ?? weather.windSpeed ?? 14,
        precipitation: wItem.precipitation ?? 0,
        temp: wItem.temp ?? weather.temperature ?? 28
      });
    }

    res.json({
      success: true,
      location: { latitude: lat, longitude: lng },
      hourlyForecast: hourlyCombined,
      source: 'Open-Meteo Marine & Numerical Weather Forecast',
      isLive: Boolean(marine.isLive && weather.isLive),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic coastal tide data
// @route   GET /api/marine/tides
const getTides = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;
    const date = req.query.date ? new Date(req.query.date) : new Date();

    const tide = await dsm.tide.getTide(lat, lng, date);
    res.json({
      success: true,
      data: tide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get marine observations list (fallback or history)
// @route   GET /api/marine/observations
const getObservations = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;

    const [marine, weather] = await Promise.all([
      dsm.marine.getConditions(lat, lng),
      dsm.weather.getWeather(lat, lng)
    ]);

    const timeseries = (marine.timeseries || []).map(ts => ({
      timestamp: ts.isoTime,
      latitude: lat,
      longitude: lng,
      sst: ts.sst,
      waveHeight: ts.waveHeight,
      currentSpeed: ts.currentSpeed,
      windSpeed: weather.windSpeed
    }));

    res.json({
      success: true,
      count: timeseries.length,
      data: timeseries,
      source: marine.source,
      isLive: marine.isLive
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare marine conditions between two locations using live telemetry
// @route   GET /api/marine/compare
const compareLocations = async (req, res, next) => {
  try {
    const loc1 = req.query.loc1 || 'mumbai';
    const loc2 = req.query.loc2 || 'goa';

    // Resolve coordinates for both locations via geocoding
    const [geoA, geoB] = await Promise.all([
      dsm.geo.searchLocation(loc1),
      dsm.geo.searchLocation(loc2)
    ]);

    const [mA, wA, eoA] = await Promise.all([
      dsm.marine.getConditions(geoA.latitude, geoA.longitude),
      dsm.weather.getWeather(geoA.latitude, geoA.longitude),
      dsm.ocean.getEOData(geoA.latitude, geoA.longitude)
    ]);

    const [mB, wB, eoB] = await Promise.all([
      dsm.marine.getConditions(geoB.latitude, geoB.longitude),
      dsm.weather.getWeather(geoB.latitude, geoB.longitude),
      dsm.ocean.getEOData(geoB.latitude, geoB.longitude)
    ]);

    const [riskA, riskB] = await Promise.all([
      riskAgent.execute(wA, mA),
      riskAgent.execute(wB, mB)
    ]);

    const dist = calculateDistance(geoA.latitude, geoA.longitude, geoB.latitude, geoB.longitude);

    res.json({
      success: true,
      distanceBetweenKm: Number(dist.toFixed(1)),
      locationA: {
        name: geoA.name,
        fullName: geoA.fullName,
        coordinates: { latitude: geoA.latitude, longitude: geoA.longitude },
        metrics: {
          sst: mA.sst,
          chlorophyll: eoA.chlorophyll,
          waveHeight: mA.wave?.height ?? mA.waveHeight,
          windSpeed: wA.windSpeed,
          seaCondition: mA.seaCondition,
          riskLevel: riskA.data?.riskLevel,
          riskScore: riskA.data?.overallScore
        },
        source: mA.source
      },
      locationB: {
        name: geoB.name,
        fullName: geoB.fullName,
        coordinates: { latitude: geoB.latitude, longitude: geoB.longitude },
        metrics: {
          sst: mB.sst,
          chlorophyll: eoB.chlorophyll,
          waveHeight: mB.wave?.height ?? mB.waveHeight,
          windSpeed: wB.windSpeed,
          seaCondition: mB.seaCondition,
          riskLevel: riskB.data?.riskLevel,
          riskScore: riskB.data?.overallScore
        },
        source: mB.source
      },
      analysisSummary: `Live comparison between ${geoA.name} and ${geoB.name} (${dist.toFixed(0)} km apart). ${geoA.name} reports SST of ${mA.sst}°C and wave height of ${mA.wave?.height}m. Meanwhile, ${geoB.name} reports SST of ${mB.sst}°C and wave height of ${mB.wave?.height}m. Risk assessed as ${riskA.data?.riskLevel} for ${geoA.name} vs ${riskB.data?.riskLevel} for ${geoB.name}.`,
      isLive: Boolean(mA.isLive && mB.isLive)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConditions,
  getForecast,
  getTides,
  getObservations,
  compareLocations
};
