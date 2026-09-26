const axios = require('axios');
const dataSourcesConfig = require('../../config/dataSources');
const cacheManager = require('../cache/cacheManager');
const logger = require('../../utils/logger');

class GeocodingService {
  constructor() {
    this.baseUrl = dataSourcesConfig.osm.baseUrl;
    this.userAgent = dataSourcesConfig.osm.userAgent;
    this.lastRequestTimestamp = 0;
    this.minRequestIntervalMs = 1100; // Enforce max 1 request/second for Nominatim compliance

    // High-precision fallback coordinates for major Indian maritime sectors
    this.offlineBaselines = {
      'mumbai': { name: 'Mumbai Offshore', latitude: 18.922, longitude: 72.8347, state: 'Maharashtra', sea: 'Arabian Sea' },
      'bombay': { name: 'Mumbai Offshore', latitude: 18.922, longitude: 72.8347, state: 'Maharashtra', sea: 'Arabian Sea' },
      'goa': { name: 'Goa Coastal Waters', latitude: 15.4989, longitude: 73.8278, state: 'Goa', sea: 'Arabian Sea' },
      'panaji': { name: 'Goa Coastal Waters', latitude: 15.4989, longitude: 73.8278, state: 'Goa', sea: 'Arabian Sea' },
      'kochi': { name: 'Kochi & Malabar Shelf', latitude: 9.9312, longitude: 76.2673, state: 'Kerala', sea: 'Arabian Sea' },
      'cochin': { name: 'Kochi & Malabar Shelf', latitude: 9.9312, longitude: 76.2673, state: 'Kerala', sea: 'Arabian Sea' },
      'chennai': { name: 'Chennai Coromandel Coast', latitude: 13.0827, longitude: 80.2707, state: 'Tamil Nadu', sea: 'Bay of Bengal' },
      'madras': { name: 'Chennai Coromandel Coast', latitude: 13.0827, longitude: 80.2707, state: 'Tamil Nadu', sea: 'Bay of Bengal' },
      'vizag': { name: 'Visakhapatnam Deep Coast', latitude: 17.6868, longitude: 83.2185, state: 'Andhra Pradesh', sea: 'Bay of Bengal' },
      'visakhapatnam': { name: 'Visakhapatnam Deep Coast', latitude: 17.6868, longitude: 83.2185, state: 'Andhra Pradesh', sea: 'Bay of Bengal' },
      'odisha': { name: 'Odisha Coast (Puri & Paradip)', latitude: 19.8135, longitude: 85.8312, state: 'Odisha', sea: 'Bay of Bengal' },
      'puri': { name: 'Odisha Coast (Puri & Paradip)', latitude: 19.8135, longitude: 85.8312, state: 'Odisha', sea: 'Bay of Bengal' },
      'paradip': { name: 'Odisha Coast (Puri & Paradip)', latitude: 19.8135, longitude: 85.8312, state: 'Odisha', sea: 'Bay of Bengal' },
      'veraval': { name: 'Gujarat Coast (Veraval & Porbandar)', latitude: 20.9077, longitude: 70.3667, state: 'Gujarat', sea: 'Arabian Sea' },
      'porbandar': { name: 'Gujarat Coast (Veraval & Porbandar)', latitude: 20.9077, longitude: 70.3667, state: 'Gujarat', sea: 'Arabian Sea' },
      'gujarat': { name: 'Gujarat Coast (Veraval & Porbandar)', latitude: 20.9077, longitude: 70.3667, state: 'Gujarat', sea: 'Arabian Sea' },
      'port blair': { name: 'Andaman & Nicobar (Port Blair)', latitude: 11.6234, longitude: 92.7265, state: 'Andaman & Nicobar', sea: 'Andaman Sea' },
      'andaman': { name: 'Andaman & Nicobar (Port Blair)', latitude: 11.6234, longitude: 92.7265, state: 'Andaman & Nicobar', sea: 'Andaman Sea' }
    };
  }

  async searchLocation(query) {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query must be a valid string');
    }

    const cleanQuery = query.trim().toLowerCase();

    // 1. Check cache (24 hours TTL for geocoding)
    const cached = cacheManager.get('geocoding', { query: cleanQuery });
    if (cached) {
      return { ...cached.payload, isCached: true };
    }

    // 2. Enforce rate limiting before hitting Nominatim
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTimestamp;
    if (timeSinceLast < this.minRequestIntervalMs) {
      await new Promise(r => setTimeout(r, this.minRequestIntervalMs - timeSinceLast));
    }
    this.lastRequestTimestamp = Date.now();

    // 3. Attempt Nominatim OpenStreetMap Geocoding
    try {
      logger.info(`[GeocodingService] Querying OpenStreetMap Nominatim for "${query}"`);
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 3,
          countrycodes: 'in' // Prioritize Indian locations
        },
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'en'
        },
        timeout: dataSourcesConfig.apiTimeoutMs
      });

      if (response.data && response.data.length > 0) {
        const topResult = response.data[0];
        const result = {
          name: topResult.display_name.split(',')[0],
          fullName: topResult.display_name,
          latitude: parseFloat(topResult.lat),
          longitude: parseFloat(topResult.lon),
          boundingBox: topResult.boundingbox,
          source: 'OpenStreetMap Nominatim Geocoding API',
          isLive: true,
          timestamp: new Date().toISOString()
        };

        // Cache for 24 hours (86400 seconds)
        cacheManager.set('geocoding', { query: cleanQuery }, result, 86400, result.source);
        return result;
      }
    } catch (err) {
      logger.warn(`[GeocodingService] Nominatim geocode failed: ${err.message}. Checking offline port registry.`);
    }

    // 4. Fallback to offline coastal ports registry
    for (const [key, loc] of Object.entries(this.offlineBaselines)) {
      if (cleanQuery.includes(key)) {
        const result = {
          name: loc.name,
          fullName: `${loc.name}, ${loc.state}, India`,
          latitude: loc.latitude,
          longitude: loc.longitude,
          source: 'ORCA Maritime Port Baseline Registry',
          isLive: false,
          isFallback: true,
          timestamp: new Date().toISOString()
        };
        cacheManager.set('geocoding', { query: cleanQuery }, result, 86400, result.source);
        return result;
      }
    }

    // Default fallback to central coastal sector
    return {
      name: query,
      fullName: `${query} (Default Maritime Sector)`,
      latitude: 18.922,
      longitude: 72.8347,
      source: 'Default Coastal Sector Baseline',
      isLive: false,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new GeocodingService();
