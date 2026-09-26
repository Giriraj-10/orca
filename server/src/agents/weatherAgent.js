const toolRegistry = require('../tools/ToolRegistry');
const logger = require('../utils/logger');

class WeatherAgent {
  constructor() {
    this.name = 'Weather Agent';
    this.role = 'Atmospheric & Meteorological Analysis';
  }

  async execute(latitude, longitude, targetDate = new Date()) {
    const startTime = Date.now();
    logger.agent(this.name, `Invoking weather_tool for [${latitude}, ${longitude}]`);

    try {
      const weatherData = await toolRegistry.executeTool('weather_tool', {
        latitude,
        longitude,
        targetDate
      });

      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          location: weatherData.location || { latitude, longitude },
          temperature: weatherData.temperature,
          windSpeed: weatherData.windSpeed,
          windDirection: weatherData.windDirection,
          precipitation: weatherData.precipitation,
          visibility: weatherData.visibility,
          condition: weatherData.condition,
          hourlyTrends: weatherData.hourlyTrends || [],
          source: weatherData.source || 'IMD / Open-Meteo High-Resolution Weather',
          dataMode: weatherData.dataMode || 'live',
          isLive: Boolean(weatherData.isLive),
          isCached: Boolean(weatherData.isCached),
          timestamp: weatherData.timestamp || new Date().toISOString()
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
