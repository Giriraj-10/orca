const { DemoWeatherProvider, LiveWeatherProvider } = require('../providers/WeatherProvider');
const env = require('../config/env');
const logger = require('../utils/logger');

class WeatherAgent {
  constructor() {
    this.name = 'Weather Agent';
    this.role = 'Atmospheric & Meteorological Analysis';
    this.provider = env.DATA_MODE === 'LIVE' ? new LiveWeatherProvider() : new DemoWeatherProvider();
  }

  async execute(latitude, longitude, targetDate = new Date()) {
    const startTime = Date.now();
    logger.agent(this.name, `Analyzing weather conditions at [${latitude}, ${longitude}]`);

    try {
      const data = await this.provider.getWeather(latitude, longitude, targetDate);
      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          location: data.location,
          regionId: data.regionId,
          temperature: data.temperature,
          windSpeed: data.windSpeed,
          windDirection: data.windDirection,
          precipitation: data.precipitation,
          visibility: data.visibility,
          condition: data.condition,
          source: data.source,
          mode: data.mode,
          timestamp: data.timestamp
        }
      };
    } catch (err) {
      logger.error(`${this.name} failed: ${err.message}`);
      return {
        success: false,
        agent: this.name,
        role: this.role,
        error: err.message,
        data: null
      };
    }
  }
}

module.exports = new WeatherAgent();
