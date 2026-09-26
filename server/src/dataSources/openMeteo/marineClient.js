const axios = require('axios');
const dataSourcesConfig = require('../../config/dataSources');
const logger = require('../../utils/logger');

class OpenMeteoMarineClient {
  constructor() {
    this.baseUrl = dataSourcesConfig.openMeteo.marineBaseUrl;
    this.timeout = dataSourcesConfig.apiTimeoutMs;
  }

  /**
   * Fetch hourly marine parameters for coordinates
   */
  async fetchMarineConditions(latitude, longitude, targetDate = null) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const url = `${this.baseUrl}/v1/marine`;
    const params = {
      latitude: lat,
      longitude: lng,
      hourly: [
        'wave_height',
        'wave_direction',
        'wave_period',
        'wind_wave_height',
        'swell_wave_height',
        'ocean_current_velocity',
        'ocean_current_direction',
        'sea_surface_temperature'
      ].join(','),
      timezone: 'auto'
    };

    logger.debug(`[OpenMeteoMarineClient] Requesting marine data for [${lat}, ${lng}]`);
    const response = await axios.get(url, { params, timeout: this.timeout });
    return response.data;
  }
}

module.exports = new OpenMeteoMarineClient();
