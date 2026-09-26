/**
 * IMD Data Normalizer
 */

class ImdNormalizer {
  normalize(raw) {
    if (!raw) throw new Error('Invalid IMD payload');

    return {
      location: {
        station: raw.stationName || raw.city || 'IMD Coastal Station',
        latitude: raw.latitude || raw.lat,
        longitude: raw.longitude || raw.lon
      },
      timestamp: raw.observationTime || raw.timestamp || new Date().toISOString(),
      temperature: Number(raw.temp || raw.temperature || 28),
      windSpeed: Number(raw.windSpeed || raw.wind_speed || 12),
      windDirection: raw.windDirection || raw.wind_dir || 'SW',
      precipitation: Number(raw.rainfall || raw.rain || 0),
      visibility: Number(raw.visibility || 9.0),
      condition: raw.weatherCondition || raw.weather || 'Fair Weather',
      source: 'India Meteorological Department (IMD)',
      isLive: true
    };
  }

  normalizeWarnings(raw) {
    if (!raw || !Array.isArray(raw.warnings)) return [];
    return raw.warnings.map(w => ({
      type: w.type || 'WEATHER_WARNING',
      severity: w.severity || 'MODERATE',
      title: w.title || 'IMD Coastal Weather Warning',
      description: w.description || w.details || '',
      issuedAt: w.issuedAt || new Date().toISOString(),
      source: 'IMD Coastal Warning Division',
      isLive: true
    }));
  }
}

module.exports = new ImdNormalizer();
