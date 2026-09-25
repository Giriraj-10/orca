const COASTAL_REGIONS = require('../data/coastalRegions');
const { calculateDistance } = require('../utils/geoUtils');
const logger = require('../utils/logger');

class BaseEarthObservationProvider {
  async getEOData(latitude, longitude) {
    throw new Error('getEOData must be implemented by subclass');
  }
}

class DemoEOProvider extends BaseEarthObservationProvider {
  async getEOData(latitude, longitude) {
    let closest = COASTAL_REGIONS[0];
    let minDist = Infinity;
    for (const r of COASTAL_REGIONS) {
      const d = calculateDistance(latitude, longitude, r.center.latitude, r.center.longitude);
      if (d < minDist) {
        minDist = d;
        closest = r;
      }
    }

    const spatialJitter = Math.sin(latitude * 12) * Math.cos(longitude * 12);
    const chlorophyll = Math.max(0.15, Number((closest.baseline.chlorophyll + (spatialJitter * 0.35)).toFixed(2)));
    const sst = Number((closest.baseline.sst + (spatialJitter * 0.3)).toFixed(1));

    // Calculate thermal gradient and productivity indicator
    let productivity = 'MODERATE';
    if (chlorophyll >= 2.0) productivity = 'VERY HIGH (Plankton Bloom & High Biomass)';
    else if (chlorophyll >= 1.4) productivity = 'HIGH (Productive Pelagic Front)';
    else if (chlorophyll >= 0.8) productivity = 'MODERATE (Stable Coastal Waters)';
    else productivity = 'LOW (Clear Oceanic Waters)';

    return {
      regionName: closest.name,
      regionId: closest.id,
      coordinates: { latitude, longitude },
      chlorophyll: chlorophyll, // mg/m³
      sst: sst, // °C
      thermalGradient: `${(0.4 + Math.abs(spatialJitter * 0.8)).toFixed(2)} °C/km`,
      productivityIndex: productivity,
      sensor: 'Ocean Colour Monitor (OCM-3) & MODIS Aqua Simulated',
      satelliteResolution: '1 km x 1 km Spatial Grid',
      source: 'Demo Satellite Earth Observation Dataset',
      mode: 'DEMO',
      timestamp: new Date().toISOString()
    };
  }
}

class LiveEOProvider extends BaseEarthObservationProvider {
  constructor(apiKey = process.env.EO_API_KEY, baseUrl = process.env.EO_API_URL) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getEOData(latitude, longitude) {
    if (!this.apiKey || !this.baseUrl) {
      logger.warn('LiveEOProvider: No credentials configured, falling back to DemoEOProvider');
      const fallback = new DemoEOProvider();
      const res = await fallback.getEOData(latitude, longitude);
      res.note = 'Live source unavailable — showing simulated/demo data';
      return res;
    }

    try {
      const axios = require('axios');
      const response = await axios.get(`${this.baseUrl}`, {
        params: { lat: latitude, lon: longitude, key: this.apiKey },
        timeout: 4000
      });
      return {
        regionName: response.data.region || 'Live EO Sector',
        coordinates: { latitude, longitude },
        chlorophyll: response.data.chlorophyll,
        sst: response.data.sst,
        thermalGradient: response.data.gradient || '0.5 °C/km',
        productivityIndex: response.data.productivity || 'HIGH',
        sensor: response.data.sensor || 'Live Multispectral Radiometer',
        source: 'Live Earth Observation Satellite Service',
        mode: 'LIVE',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      logger.warn(`LiveEOProvider failed (${err.message}). Falling back to Demo.`);
      const fallback = new DemoEOProvider();
      const res = await fallback.getEOData(latitude, longitude);
      res.note = 'Live source unavailable — showing simulated/demo data';
      return res;
    }
  }
}

module.exports = {
  BaseEarthObservationProvider,
  DemoEarthObservationProvider: DemoEOProvider,
  LiveEarthObservationProvider: LiveEOProvider
};
