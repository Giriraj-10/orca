const mongoose = require('mongoose');

const oceanObservationSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  regionId: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sst: {
    type: Number, // °C
    required: true
  },
  waveHeight: {
    type: Number, // meters
    required: true
  },
  wavePeriod: {
    type: Number, // seconds
    default: 8
  },
  waveDirection: {
    type: String,
    default: 'SW'
  },
  currentSpeed: {
    type: Number, // m/s
    default: 0.4
  },
  currentDirection: {
    type: String,
    default: 'SSE'
  },
  tide: {
    type: String,
    default: 'High Tide (+1.2m)'
  },
  salinity: {
    type: Number, // PSU
    default: 35.2
  },
  seaCondition: {
    type: String,
    default: 'Moderate'
  },
  source: {
    type: String,
    default: 'Demo Oceanographic In-Situ & Satellite Blend'
  },
  mode: {
    type: String,
    enum: ['DEMO', 'LIVE'],
    default: 'DEMO'
  }
}, { timestamps: true });

oceanObservationSchema.index({ latitude: 1, longitude: 1 });
oceanObservationSchema.index({ regionId: 1 });

module.exports = mongoose.model('OceanObservation', oceanObservationSchema);
