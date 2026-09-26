const dsm = require('../dataSources/DataSourceManager');
const Alert = require('../models/Alert');
const logger = require('../utils/logger');

// @desc    Get active maritime alerts for coordinates
// @route   GET /api/alerts (and GET /api/alerts/nearby)
const getAlerts = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude || req.query.lat) || 18.922;
    const lng = parseFloat(req.query.longitude || req.query.lng) || 72.8347;
    const radiusKm = parseFloat(req.query.radiusKm) || 120;

    const alertResult = await dsm.alert.getAlerts(lat, lng, radiusKm);

    // Also include any user-broadcast alerts from database
    let dbAlerts = [];
    try {
      dbAlerts = await Alert.find({ active: true }).sort({ issuedAt: -1 }).limit(10);
    } catch {
      // ignore
    }

    const combined = [...(alertResult.alerts || []), ...dbAlerts];

    res.json({
      success: true,
      count: combined.length,
      data: combined,
      source: alertResult.source,
      isLive: alertResult.isLive,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast a new maritime safety advisory (Authority/Admin only)
// @route   POST /api/alerts
const createAlert = async (req, res, next) => {
  try {
    const { title, description, severity, regionId, coordinates, affectedRadiusKm } = req.body;

    const alert = await Alert.create({
      title,
      description,
      severity: severity || 'WARNING',
      regionId: regionId || 'all',
      coordinates: coordinates || { latitude: 18.922, longitude: 72.8347 },
      affectedRadiusKm: affectedRadiusKm || 50,
      issuedBy: req.user ? req.user.name : 'Maritime Port Authority',
      issuedAt: new Date(),
      active: true
    });

    res.status(201).json({
      success: true,
      message: 'Maritime safety advisory broadcasted successfully',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  createAlert
};
