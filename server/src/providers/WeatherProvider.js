const COASTAL_REGIONS = require('../data/coastalRegions');
const { calculateDistance } = require('../utils/geoUtils');
const logger = require('../utils/logger');

/**
 * Base Weather Provider Interface
 */
class BaseWeatherProvider {
  async getWeather(latitude, longitude, targetDate = new Date()) {
    throw new Error('getWeather method must be implemented by subclass');
  }
}

/**
 * Demo Weather Provider (Simulated high-resolution coastal weather)
 */
class DemoWeatherProvider extends BaseWeatherProvider {
  async getWeather(latitude, longitude, targetDate = new Date()) {
    // Find closest coastal reference region
    let closest = COASTAL_REGIONS[0];
    let minDist = Infinity;
    for (const r of COASTAL_REGIONS) {
      const d = calculateDistance(latitude, longitude, r.center.latitude, r.center.longitude);
      if (d < minDist) {
        minDist = d;
        closest = r;
      }
    }

    // Dynamic diurnal variance based on time of day
    const hour = new Date(targetDate).getHours();
    const diurnalTemp = Math.sin((hour - 9) * (Math.PI / 12)) * 2.2;
    const diurnalWind = Math.cos((hour - 14) * (Math.PI / 12)) * 3.5;

    // Small deterministic pseudo-random offset based on lat/lng
    const spatialJitter = Math.sin(latitude * 10 + longitude * 10);

    const temp = Number((closest.baseline.sst + diurnalTemp + (spatialJitter * 0.5)).toFixed(1));
    const windSpeed = Math.max(4, Number((closest.baseline.windSpeed + diurnalWind + (spatialJitter * 2)).toFixed(1)));
    
    // Wind conditions description
    let condition = closest.baseline.condition;
    if (windSpeed > 28) condition = 'Gale Warnings / Rough Wind';
    else if (windSpeed > 20) condition = 'Moderate Fresh Breeze';
    else if (closest.baseline.precipitation > 1.0) condition = 'Scattered Squalls';

    return {
      location: `${closest.name} Marine Sector`,
      regionId: closest.id,
      coordinates: { latitude, longitude },
      temperature: temp,
      windSpeed: windSpeed,
      windDirection: closest.baseline.windDirection,
      precipitation: closest.baseline.precipitation,
      visibility: closest.baseline.visibility,
      condition: condition,
      source: 'Demo Coastal High-Res WRF Engine',
      mode: 'DEMO',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Live Weather Provider (Adapter for external marine weather APIs)
 */
class LiveWeatherProvider extends BaseWeatherProvider {
  constructor(apiKey = process.env.WEATHER_API_KEY, baseUrl = process.env.WEATHER_API_URL) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async getWeather(latitude, longitude, targetDate = new Date()) {
    if (!this.apiKey || !this.baseUrl) {
      logger.warn('LiveWeatherProvider: No API credentials configured, falling back to DemoWeatherProvider');
      const fallback = new DemoWeatherProvider();
      const res = await fallback.getWeather(latitude, longitude, targetDate);
      res.note = 'Live source unavailable — showing simulated/demo data';
      return res;
    }

    try {
      // Clean adapter call when URL and key are provided
      const axios = require('axios');
      const response = await axios.get(`${this.baseUrl}`, {
        params: { lat: latitude, lon: longitude, key: this.apiKey },
        timeout: 4000
      });
      return {
        location: response.data.name || 'Live Marine Station',
        coordinates: { latitude, longitude },
        temperature: response.data.temp,
        windSpeed: response.data.wind_speed,
        windDirection: response.data.wind_deg,
        precipitation: response.data.rain || 0,
        visibility: response.data.visibility / 1000,
        condition: response.data.weather?.[0]?.description || 'Clear',
        source: 'Live Meteorological Station Feed',
        mode: 'LIVE',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      logger.warn(`LiveWeatherProvider API failed (${err.message}). Gracefully falling back to Demo.`);
      const fallback = new DemoWeatherProvider();
      const res = await fallback.getWeather(latitude, longitude, targetDate);
      res.note = 'Live source unavailable — showing simulated/demo data';
      return res;
    }
  }
}

module.exports = {
  BaseWeatherProvider,
  DemoWeatherProvider,
  LiveWeatherProvider
};
