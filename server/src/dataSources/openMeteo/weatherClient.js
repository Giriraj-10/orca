const axios = require('axios');
const dataSourcesConfig = require('../../config/dataSources');
const logger = require('../../utils/logger');

class OpenMeteoWeatherClient {
  constructor() {
    this.baseUrl = dataSourcesConfig.openMeteo.weatherBaseUrl;
    this.timeout = dataSourcesConfig.apiTimeoutMs;
  }

  async fetchWeather(latitude, longitude, targetDate = null) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const url = `${this.baseUrl}/v1/forecast`;
    const params = {
      latitude: lat,
      longitude: lng,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'rain',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'visibility'
      ].join(','),
      hourly: [
        'temperature_2m',
        'precipitation',
        'wind_speed_10m',
        'wind_direction_10m',
        'weather_code'
      ].join(','),
      timezone: 'auto'
    };

    logger.debug(`[OpenMeteoWeatherClient] Requesting weather forecast for [${lat}, ${lng}]`);
    const response = await axios.get(url, { params, timeout: this.timeout });
    return response.data;
  }
}

module.exports = new OpenMeteoWeatherClient();
