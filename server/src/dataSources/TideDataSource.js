const BaseDataSource = require('./BaseDataSource');
const tideService = require('./tides/tideService');

class TideDataSource extends BaseDataSource {
  constructor() {
    super('Marine Tide & Tidal Level Data Source', 1800); // 30 min TTL
  }

  async getTide(latitude, longitude, targetDate = new Date()) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    return this.fetchWithFallback({
      params: { latitude: lat, longitude: lng, targetDate: new Date(targetDate).toISOString().substring(0, 13) },
      cacheNamespace: 'tides',
      primaryFetcher: async (p) => {
        return tideService.getTideData(p.latitude, p.longitude, targetDate);
      },
      demoFetcher: async (p) => {
        return {
          ...tideService.getTideData(p.latitude, p.longitude, targetDate),
          dataMode: 'demo',
          isLive: false,
          source: 'Demo Harmonic Tide Calculation'
        };
      }
    });
  }
}

module.exports = new TideDataSource();
