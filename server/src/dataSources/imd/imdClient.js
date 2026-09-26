const axios = require('axios');
const dataSourcesConfig = require('../../config/dataSources');
const logger = require('../../utils/logger');

class ImdClient {
  constructor() {
    this.apiKey = dataSourcesConfig.imd.apiKey;
    this.baseUrl = dataSourcesConfig.imd.baseUrl;
    this.timeout = dataSourcesConfig.apiTimeoutMs;
  }

  isConfigured() {
    return Boolean(this.baseUrl && this.baseUrl.trim() !== '');
  }

  async fetchObservation(latitude, longitude) {
    if (!this.isConfigured()) {
      throw new Error('IMD_API_BASE_URL not configured in environment');
    }

    const url = `${this.baseUrl}/weather/current`;
    const headers = {};
    if (this.apiKey) {
      headers['X-API-KEY'] = this.apiKey;
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    logger.info(`[ImdClient] Fetching IMD coastal observation for [${latitude}, ${longitude}]`);
    const response = await axios.get(url, {
      params: { lat: latitude, lon: longitude },
      headers,
      timeout: this.timeout
    });
    return response.data;
  }

  async fetchWarnings(latitude, longitude) {
    if (!this.isConfigured()) {
      throw new Error('IMD_API_BASE_URL not configured');
    }

    const url = `${this.baseUrl}/weather/warnings`;
    const response = await axios.get(url, {
      params: { lat: latitude, lon: longitude },
      timeout: this.timeout
    });
    return response.data;
  }
}

module.exports = new ImdClient();
