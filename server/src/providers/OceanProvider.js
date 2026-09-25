const COASTAL_REGIONS = require('../data/coastalRegions');
const { calculateDistance } = require('../utils/geoUtils');
const logger = require('../utils/logger');

class BaseOceanProvider {
  async getOceanConditions(latitude, longitude, targetDate = new Date()) {
    throw new Error('getOceanConditions must be implemented by subclass');
  }
}

class DemoOceanProvider extends BaseOceanProvider {
  async getOceanConditions(latitude, longitude, targetDate = new Date()) {
    let closest = COASTAL_REGIONS[0];
    let minDist = Infinity;
    for (const r of COASTAL_REGIONS) {
      const d = calculateDistance(latitude, longitude, r.center.latitude, r.center.longitude);
      if (d < minDist) {
        minDist = d;
        closest = r;
      }
    }

    const spatialJitter = Math.cos(latitude * 8 + longitude * 8);
    const sst = Number((closest.baseline.sst + (spatialJitter * 0.4)).toFixed(1));
    const waveHeight = Math.max(0.3, Number((closest.baseline.waveHeight + (spatialJitter * 0.25)).toFixed(1)));
    const currentSpeed = Number((closest.baseline.currentSpeed + (spatialJitter * 0.08)).toFixed(2));

    let seaCondition = 'Moderate';
    if (waveHeight < 0.8) seaCondition = 'Calm / Smooth';
    else if (waveHeight < 1.4) seaCondition = 'Slight to Moderate';
    else if (waveHeight < 2.2) seaCondition = 'Rough';
    else seaCondition = 'Very Rough / High Swell';

    return {
      location: closest.name,
      regionId: closest.id,
      coordinates: { latitude, longitude },
      sst: sst,
      waveHeight: waveHeight,
      wavePeriod: 8.5,
      waveDirection: closest.sea === 'Arabian Sea' ? 'SW' : 'SE',
      currentSpeed: currentSpeed,
      currentDirection: closest.sea === 'Arabian Sea' ? 'SSE' : 'NNE',
      tide: closest.baseline.tide,
      seaCondition: seaCondition,
      salinity: 35.1,
      source: 'Demo Oceanographic In-Situ & Buoy Network',
      mode: 'DEMO',
      timestamp: new Date().toISOString()
    };
  }
}

class LiveOceanProvider extends BaseOceanProvider {
  constructor(apiKey = process.env.OCEAN_API_KEY, baseUrl = process.env.OCEAN_API_URL) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getOceanConditions(latitude, longitude, targetDate = new Date()) {
    if (!this.apiKey || !this.baseUrl) {
      logger.warn('LiveOceanProvider: No API credentials configured, falling back to DemoOceanProvider');
      const fallback = new DemoOceanProvider();
      const res = await fallback.getOceanConditions(latitude, longitude, targetDate);
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
        location: response.data.location || 'Live Marine Mooring',
        coordinates: { latitude, longitude },
        sst: response.data.water_temp,
        waveHeight: response.data.wave_height,
        wavePeriod: response.data.wave_period,
        waveDirection: response.data.wave_dir,
        currentSpeed: response.data.current_speed,
        tide: response.data.tide,
        seaCondition: response.data.sea_state,
        source: 'Live Oceanographic Moored Buoy Feed',
        mode: 'LIVE',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      logger.warn(`LiveOceanProvider failed (${err.message}). Falling back to Demo.`);
      const fallback = new DemoOceanProvider();
      const res = await fallback.getOceanConditions(latitude, longitude, targetDate);
      res.note = 'Live source unavailable — showing simulated/demo data';
      return res;
    }
  }
}

module.exports = {
  BaseOceanProvider,
  DemoOceanProvider,
  LiveOceanProvider
};
