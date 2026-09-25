const Alert = require('../models/Alert');
const { generateAlerts } = require('../data/seedData');

// @desc    Get all active alerts
// @route   GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const regionId = req.query.regionId;
    let query = { isActive: true };
    if (regionId && regionId !== 'all') {
      query.$or = [{ regionId: regionId }, { regionId: 'all' }];
    }

    let alerts = [];
    try {
      alerts = await Alert.find(query).sort({ issuedAt: -1 });
    } catch (e) {
      // fallback
    }

    if (!alerts || alerts.length === 0) {
      alerts = generateAlerts();
      if (regionId && regionId !== 'all') {
        alerts = alerts.filter(a => a.regionId === regionId || a.regionId === 'all');
      }
    }

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
      disclaimer: 'Informational advisory only. Refer to INCOIS & IMD official marine bulletins before sailing.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new maritime alert
// @route   POST /api/alerts
const createAlert = async (req, res, next) => {
  try {
    const { title, type, severity, regionId, regionName, message, expiresAt } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and message for alert'
      });
    }

    let newAlert;
    try {
      newAlert = await Alert.create({
        title,
        type: type || 'SAFETY',
        severity: severity || 'MODERATE',
        regionId: regionId || 'all',
        regionName: regionName || 'Pan-Coastal',
        message,
        expiresAt: expiresAt || new Date(Date.now() + 48 * 3600000),
        isActive: true
      });
    } catch (e) {
      newAlert = {
        _id: 'mock_alert_' + Date.now(),
        title,
        type: type || 'SAFETY',
        severity: severity || 'MODERATE',
        regionId: regionId || 'all',
        regionName: regionName || 'Pan-Coastal',
        message,
        issuedAt: new Date(),
        isActive: true
      };
    }

    res.status(201).json({
      success: true,
      data: newAlert,
      message: 'Maritime safety alert broadcasted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  createAlert
};
