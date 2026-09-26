const axios = require('axios');
const dataSourcesConfig = require('../../config/dataSources');
const logger = require('../../utils/logger');

class NasaOceanColorAdapter {
  constructor() {
    this.apiKey = dataSourcesConfig.nasaOceanColor.apiKey;
    this.baseUrl = dataSourcesConfig.nasaOceanColor.baseUrl;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim() !== '');
  }

  async fetchChlorophyll(latitude, longitude, targetDate = new Date()) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      logger.info(`[NasaOceanColorAdapter] Querying OceanColor for [${latitude}, ${longitude}]`);
      const response = await axios.get(`${this.baseUrl}/api/point`, {
        params: { lat: latitude, lon: longitude, product: 'chlor_a' },
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        timeout: dataSourcesConfig.apiTimeoutMs
      });
      return {
        value: response.data.value,
        sensor: 'MODIS Aqua / VIIRS Satellite Radiometer',
        timestamp: response.data.time || new Date().toISOString(),
        quality: response.data.quality || 'Good'
      };
    } catch (err) {
      logger.warn(`[NasaOceanColorAdapter] OceanColor query failed: ${err.message}`);
      return null;
    }
  }
}

module.exports = new NasaOceanColorAdapter();
