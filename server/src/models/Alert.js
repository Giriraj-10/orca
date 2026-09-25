const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['WAVE', 'WIND', 'WEATHER', 'FISHING_UPDATE', 'SAFETY', 'SYSTEM'],
    default: 'SAFETY'
  },
  severity: {
    type: String,
    enum: ['INFO', 'MODERATE', 'HIGH', 'CRITICAL'],
    default: 'MODERATE'
  },
  regionId: {
    type: String,
    default: 'all'
  },
  regionName: {
    type: String,
    default: 'Pan-Coastal'
  },
  message: {
    type: String,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  advisoryDisclaimer: {
    type: String,
    default: 'Informational advisory only. Refer to INCOIS & IMD official marine bulletins before sailing.'
  }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
