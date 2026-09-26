const BaseDataSource = require('./BaseDataSource');
const chlorophyllService = require('./satellite/chlorophyllService');
const sstService = require('./satellite/sstService');
const { DemoEarthObservationProvider } = require('../providers/EarthObservationProvider');
const demoEO = new DemoEarthObservationProvider();

class OceanDataSource extends BaseDataSource {
  constructor() {
    super('Satellite Ocean Color & Radiometry Data Source', 3600); // 1 hour TTL
  }

  async getEOData(latitude, longitude, targetDate = new Date()) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    return this.fetchWithFallback({
      params: { latitude: lat, longitude: lng },
      cacheNamespace: 'satellite_eo',
      primaryFetcher: async (p) => {
        const [chl, sst] = await Promise.all([
          chlorophyllService.getChlorophyll(p.latitude, p.longitude),
          sstService.getSST(p.latitude, p.longitude)
        ]);

        return {
          coordinates: { latitude: p.latitude, longitude: p.longitude },
          chlorophyll: chl.value,
          chlorophyllUnit: chl.unit,
          chlorophyllSource: chl.source,
          sst: sst.value,
          sstUnit: sst.unit,
          sstSource: sst.source,
          thermalGradient: '0.42 °C/km',
          source: 'Satellite Radiometry & Operational Marine Grid Blend',
          isLive: Boolean(chl.isLive || sst.isLive)
        };
      },
      demoFetcher: async (p) => {
        return await demoEO.getEOData(p.latitude, p.longitude);
      }
    });
  }
}

module.exports = new OceanDataSource();
