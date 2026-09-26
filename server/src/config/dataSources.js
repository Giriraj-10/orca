/**
 * ORCA Central Data Sources Configuration
 */

module.exports = {
  dataMode: (process.env.DATA_MODE || 'hybrid').toLowerCase(), // 'live', 'hybrid', 'demo'
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 900, // 15 mins default
  apiTimeoutMs: parseInt(process.env.API_TIMEOUT_MS, 10) || 10000, // 10s default

  // IMD API (Indian Meteorological Department)
  imd: {
    apiKey: process.env.IMD_API_KEY || '',
    baseUrl: process.env.IMD_API_BASE_URL || ''
  },

  // Open-Meteo Public Weather & Marine APIs (Reliable, Key-free High-Precision Feeds)
  openMeteo: {
    weatherBaseUrl: process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com',
    marineBaseUrl: process.env.OPEN_METEO_MARINE_BASE_URL || 'https://marine-api.open-meteo.com'
  },

  // INCOIS (Indian National Centre for Ocean Information Services)
  incois: {
    baseUrl: process.env.INCOIS_API_BASE_URL || 'https://incois.gov.in',
    advisoryFeedUrl: process.env.INCOIS_ADVISORY_FEED_URL || ''
  },

  // MOSDAC (Meteorological and Oceanographic Satellite Data Archival Centre - ISRO)
  mosdac: {
    username: process.env.MOSDAC_USERNAME || '',
    password: process.env.MOSDAC_PASSWORD || '',
    baseUrl: process.env.MOSDAC_BASE_URL || 'https://www.mosdac.gov.in'
  },

  // NASA OceanColor Web Services
  nasaOceanColor: {
    apiKey: process.env.NASA_OCEANCOLOR_API_KEY || '',
    baseUrl: process.env.NASA_OCEANCOLOR_BASE_URL || 'https://oceancolor.gsfc.nasa.gov'
  },

  // OpenStreetMap Nominatim for Coastal Geocoding
  osm: {
    baseUrl: process.env.OSM_BASE_URL || 'https://nominatim.openstreetmap.org',
    userAgent: process.env.OSM_USER_AGENT || 'ORCA-Marine-Platform/1.0 (contact@orca.marine.internal)'
  }
};
