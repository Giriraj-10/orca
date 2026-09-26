const dsm = require('../dataSources/DataSourceManager');

// @desc    Geocode natural language location search
// @route   GET /api/geocode/search
const searchLocation = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || '';
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query parameter q is required' });
    }

    const result = await dsm.geo.searchLocation(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if coordinate is inside or near restricted zones
// @route   POST /api/geofence/check
const checkGeofence = async (req, res, next) => {
  try {
    const lat = parseFloat(req.body.latitude || req.query.latitude) || 18.922;
    const lng = parseFloat(req.body.longitude || req.query.longitude) || 72.8347;

    const result = dsm.geo.checkGeofence(lat, lng);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all marine geofence boundaries as GeoJSON
// @route   GET /api/geofence/all
const getAllGeofences = async (req, res, next) => {
  try {
    const geofences = dsm.geo.getGeofences();
    res.json({
      success: true,
      data: geofences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate minimum-risk dynamic route avoiding hazards and MPAs
const calculateRoute = async (req, res, next) => {
  try {
    let { startLat, startLng, destLat, destLng, start, destination, vesselSpeedKnots } = req.body;
    
    if (start && Array.isArray(start)) {
      startLng = start[0];
      startLat = start[1];
    }
    if (destination && Array.isArray(destination)) {
      destLng = destination[0];
      destLat = destination[1];
    }

    if (startLat === undefined || startLng === undefined || destLat === undefined || destLng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'startLat, startLng, destLat, and destLng (or start, destination coordinate arrays) are required'
      });
    }

    const route = await dsm.geo.calculateRoute({
      startLat,
      startLng,
      destLat,
      destLng,
      vesselSpeedKnots: vesselSpeedKnots || 10
    });

    res.json({
      success: true,
      route
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchLocation,
  checkGeofence,
  getAllGeofences,
  calculateRoute
};
