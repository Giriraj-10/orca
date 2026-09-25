const mongoose = require('mongoose');

const marineObservationSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true
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
    type: Number, // Sea Surface Temp in °C
    required: true
  },
  chlorophyll: {
    type: Number, // Chlorophyll-a in mg/m³
    required: true
  },
  waveHeight: {
    type: Number, // Significant wave height in meters
    required: true
  },
  currentSpeed: {
    type: Number, // Current speed in m/s
    default: 0.4
  },
  tide: {
    type: String,
    default: 'Normal'
  },
  source: {
    type: String,
    default: 'Demo EO & Oceanographic Engine'
  },
  mode: {
    type: String,
    enum: ['DEMO', 'LIVE'],
    default: 'DEMO'
  }
}, { timestamps: true });

marineObservationSchema.index({ latitude: 1, longitude: 1 });
marineObservationSchema.index({ regionId: 1 });

module.exports = mongoose.model('MarineObservation', marineObservationSchema);
