const mongoose = require('mongoose');

const fishingZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  regionId: {
    type: String,
    required: true
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  center: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  radiusKm: {
    type: Number,
    default: 12
  },
  suitability: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  confidence: {
    type: Number, // 0.0 to 1.0
    default: 0.8
  },
  indicators: {
    sst: Number,
    chlorophyll: Number,
    waveHeight: Number,
    windSpeed: Number,
    upwellingIndicator: { type: String, default: 'Moderate' }
  },
  reasoning: {
    type: String,
    required: true
  },
  targetSpecies: [{
    type: String
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  },
  mode: {
    type: String,
    enum: ['DEMO', 'LIVE'],
    default: 'DEMO'
  }
}, { timestamps: true });

fishingZoneSchema.index({ 'center.latitude': 1, 'center.longitude': 1 });
fishingZoneSchema.index({ regionId: 1 });

module.exports = mongoose.model('FishingZone', fishingZoneSchema);
