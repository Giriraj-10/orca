const mongoose = require('mongoose');

const dataSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Earth Observation', 'Oceanographic', 'Weather', 'Geospatial', 'AI Reasoning'],
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'DEGRADED', 'UNAVAILABLE', 'SIMULATED'],
    default: 'AVAILABLE'
  },
  mode: {
    type: String,
    enum: ['DEMO', 'LIVE'],
    default: 'DEMO'
  },
  updateFrequency: {
    type: String,
    default: 'Hourly'
  },
  coverage: {
    type: String,
    default: 'Indian Coastal & EEZ Waters'
  },
  parameters: [{
    type: String
  }],
  lastSync: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('DataSource', dataSourceSchema);
