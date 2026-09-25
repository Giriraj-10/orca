const mongoose = require('mongoose');

const weatherObservationSchema = new mongoose.Schema({
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
  temperature: {
    type: Number, // Air temp °C
    required: true
  },
  windSpeed: {
    type: Number, // km/h
    required: true
  },
  windDirection: {
    type: String,
    default: 'W'
  },
  precipitation: {
    type: Number, // mm
    default: 0
  },
  visibility: {
    type: Number, // km
    default: 10
  },
  condition: {
    type: String,
    default: 'Clear'
  },
  source: {
    type: String,
    default: 'Demo Marine Weather Model'
  },
  mode: {
    type: String,
    enum: ['DEMO', 'LIVE'],
    default: 'DEMO'
  }
}, { timestamps: true });

weatherObservationSchema.index({ latitude: 1, longitude: 1 });
weatherObservationSchema.index({ regionId: 1 });

module.exports = mongoose.model('WeatherObservation', weatherObservationSchema);
