const BaseDataSource = require('./BaseDataSource');
const pfzService = require('./incois/pfzService');
const { generateFishingZones } = require('../data/seedData');

class PFZDataSource extends BaseDataSource {
  constructor() {
    super('Potential Fishing Zone (PFZ) Data Source', 3600); // 1 hour TTL
  }

  async getZones({ latitude, longitude, sst, chlorophyll, waveHeight, windSpeed, radiusKm }) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    return this.fetchWithFallback({
      params: { latitude: lat, longitude: lng, sst, chlorophyll, waveHeight, windSpeed, radiusKm },
      cacheNamespace: 'pfz',
      primaryFetcher: async (p) => {
        return await pfzService.getPotentialFishingZones(p);
      },
      demoFetcher: async (p) => {
        const demoZones = generateFishingZones();
        return {
          source: 'Demo Potential Fishing Zones Dataset',
          advisoryDate: new Date().toISOString().split('T')[0],
          sector: 'Simulated Indian Coastal Sectors',
          isOfficialAdvisory: false,
          dataMode: 'demo',
          disclaimer: 'DEMO DATA — Simulated PFZ coordinates for demonstration only',
          zones: demoZones
        };
      }
    });
  }
}

module.exports = new PFZDataSource();
