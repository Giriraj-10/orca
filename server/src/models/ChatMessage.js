const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  query: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  intent: {
    type: String,
    default: 'GENERAL_MARINE'
  },
  confidence: {
    type: Number,
    default: 0.85
  },
  confidenceLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'High'
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'NONE'],
    default: 'LOW'
  },
  recommendations: [{
    type: String
  }],
  locations: [{
    name: String,
    latitude: Number,
    longitude: Number,
    distanceKm: Number,
    suitability: String,
    confidence: Number,
    indicators: mongoose.Schema.Types.Mixed
  }],
  evidence: [{
    dataPoint: String,
    value: String,
    source: String,
    timestamp: String,
    agent: String
  }],
  agentsUsed: [{
    name: String,
    role: String,
    status: String,
    latencyMs: Number
  }],
  dataMode: {
    type: String,
    enum: ['DEMO', 'LIVE'],
    default: 'DEMO'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
