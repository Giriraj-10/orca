const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  regionId: {
    type: String,
    required: true
  },
  regionName: {
    type: String,
    required: true
  },
  center: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  overallScore: {
    type: Number, // 0 - 100
    default: 25
  },
  subFactors: {
    waveRisk: { level: String, score: Number, value: String },
    windRisk: { level: String, score: Number, value: String },
    visibilityRisk: { level: String, score: Number, value: String },
    weatherRisk: { level: String, score: Number, value: String }
  },
  explanation: {
    type: String,
    required: true
  },
  safetyRecommendations: [{
    type: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  mode: {
    type: String,
    enum: ['DEMO', 'LIVE'],
    default: 'DEMO'
  }
}, { timestamps: true });

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
