const riskAgent = require('../agents/riskAgent');
const weatherAgent = require('../agents/weatherAgent');
const oceanAgent = require('../agents/oceanAgent');
const geospatialAgent = require('../agents/geospatialAgent');

// @desc    Analyze maritime risk for given coordinates
// @route   POST /api/risk/analyze
const analyzeRisk = async (req, res, next) => {
  try {
    const lat = parseFloat(req.body.latitude) || 18.922;
    const lng = parseFloat(req.body.longitude) || 72.8347;

    const [wRes, oRes] = await Promise.all([
      weatherAgent.execute(lat, lng),
      oceanAgent.execute(lat, lng)
    ]);

    const result = await riskAgent.execute(wRes.data, oRes.data);

    res.json({
      success: true,
      coordinates: { latitude: lat, longitude: lng },
      weatherSnapshot: {
        windSpeed: wRes.data.windSpeed,
        windDirection: wRes.data.windDirection,
        visibility: wRes.data.visibility,
        condition: wRes.data.condition
      },
      oceanSnapshot: {
        sst: oRes.data.sst,
        waveHeight: oRes.data.waveHeight,
        currentSpeed: oRes.data.currentSpeed,
        seaCondition: oRes.data.seaCondition
      },
      assessment: result.data,
      mode: 'DEMO',
      disclaimer: 'ORCA risk assessment is an informational prototype and not a substitute for official marine safety advisories.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get risk profile for nearby region
// @route   GET /api/risk/nearby
const getNearbyRisk = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude) || 18.922;
    const lng = parseFloat(req.query.longitude) || 72.8347;

    const region = geospatialAgent.findNearestRegion(lat, lng);
    const [wRes, oRes] = await Promise.all([
      weatherAgent.execute(lat, lng),
      oceanAgent.execute(lat, lng)
    ]);

    const result = await riskAgent.execute(wRes.data, oRes.data);

    res.json({
      success: true,
      region,
      assessment: result.data,
      mode: 'DEMO'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeRisk,
  getNearbyRisk
};
