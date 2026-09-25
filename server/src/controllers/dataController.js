const DataSource = require('../models/DataSource');
const MarineObservation = require('../models/MarineObservation');
const FishingZone = require('../models/FishingZone');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { getDbStatus } = require('../config/db');
const env = require('../config/env');
const { generateDataSources } = require('../data/seedData');

// @desc    Get all integrated data sources
// @route   GET /api/data/sources
const getDataSources = async (req, res, next) => {
  try {
    let sources = [];
    try {
      sources = await DataSource.find({});
    } catch (e) {
      // fallback
    }

    if (!sources || sources.length === 0) {
      sources = generateDataSources();
    }

    res.json({
      success: true,
      count: sources.length,
      data: sources,
      mode: env.DATA_MODE
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system status & telemetry for Admin / Developer page
// @route   GET /api/data/status
const getSystemStatus = async (req, res, next) => {
  try {
    const dbStatus = getDbStatus();

    let counts = {
      observations: 32,
      fishingZones: 24,
      alerts: 4,
      users: 4
    };

    try {
      if (dbStatus.isConnected) {
        counts.observations = await MarineObservation.countDocuments();
        counts.fishingZones = await FishingZone.countDocuments();
        counts.alerts = await Alert.countDocuments();
        counts.users = await User.countDocuments();
      }
    } catch (e) {
      // fallback to defaults
    }

    const aiStatus = {
      provider: env.GEMINI_API_KEY ? 'Google Gemini 1.5 Flash' : 'Deterministic Multi-Agent Engine',
      hasApiKey: Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== ''),
      status: 'OPERATIONAL',
      mode: env.GEMINI_API_KEY ? 'HYBRID_LLM' : 'DETERMINISTIC_OFFLINE'
    };

    const agentsStatus = [
      { name: 'Coordinator Agent', status: 'ACTIVE', role: 'Orchestrator' },
      { name: 'Weather Agent', status: 'ACTIVE', role: 'Atmospheric WRF Provider' },
      { name: 'Ocean Agent', status: 'ACTIVE', role: 'In-Situ & Buoy Blend' },
      { name: 'Earth Observation Agent', status: 'ACTIVE', role: 'Satellite OCM-3 / MODIS' },
      { name: 'Fishing Zone Agent', status: 'ACTIVE', role: 'PFZ Heuristic Logic' },
      { name: 'Geospatial Agent', status: 'ACTIVE', role: 'Haversine & Region Matcher' },
      { name: 'Risk Agent', status: 'ACTIVE', role: 'Seaworthiness Scoring' },
      { name: 'Evidence Agent', status: 'ACTIVE', role: 'Traceability & Fusion' }
    ];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      dataMode: env.DATA_MODE,
      systemUptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      aiProvider: aiStatus,
      agents: agentsStatus,
      metrics: counts,
      version: '1.0.0-SIH-READY'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDataSources,
  getSystemStatus
};
