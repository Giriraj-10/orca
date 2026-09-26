const dsm = require('../dataSources/DataSourceManager');
const riskAgent = require('../agents/riskAgent');

// @desc    Calculate deterministic risk score from live API inputs
// @route   POST /api/risk/analyze (and POST /api/risk/calculate)
const analyzeRisk = async (req, res, next) => {
  try {
    const lat = parseFloat(req.body.latitude || req.query.latitude) || 18.922;
    const lng = parseFloat(req.body.longitude || req.query.longitude) || 72.8347;

    let [weather, marine, geofence, alerts] = await Promise.all([
      dsm.weather.getWeather(lat, lng),
      dsm.marine.getConditions(lat, lng),
      dsm.geo.checkGeofence(lat, lng),
      dsm.alert.getAlerts(lat, lng, 100)
    ]);

    // Support simulation/test parameter overrides
    if (req.body.waveHeight !== undefined) {
      marine = { ...marine, waveHeight: req.body.waveHeight, wave: { height: req.body.waveHeight } };
    }
    if (req.body.windSpeed !== undefined) {
      weather = { ...weather, windSpeed: req.body.windSpeed };
    }
    if (req.body.visibility !== undefined) {
      weather = { ...weather, visibility: req.body.visibility };
    }
    if (req.body.alertsCount !== undefined) {
      alerts = { ...alerts, count: req.body.alertsCount };
    }

    const riskResult = await riskAgent.execute(weather, marine, geofence, alerts);

    res.json({
      success: true,
      coordinates: { latitude: lat, longitude: lng },
      risk: riskResult.data,
      assessment: riskResult.data,
      liveInputs: {
        waveHeightMeters: marine.wave?.height ?? marine.waveHeight,
        windSpeedKmh: weather.windSpeed,
        visibilityKm: weather.visibility,
        precipitationRate: weather.precipitation,
        isInsideGeofence: geofence.isInsideRestrictedZone,
        activeAlertsCount: alerts.count
      },
      sources: {
        weather: weather.source,
        marine: marine.source,
        geofence: geofence.source
      },
      isLive: Boolean(weather.isLive && marine.isLive),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeRisk
};
