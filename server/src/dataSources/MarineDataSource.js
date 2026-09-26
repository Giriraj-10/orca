const BaseDataSource = require('./BaseDataSource');
const openMeteoMarine = require('./openMeteo/marineService');
const { DemoOceanProvider } = require('../providers/OceanProvider');
const demoOcean = new DemoOceanProvider();

class MarineDataSource extends BaseDataSource {
  constructor() {
    super('Marine Hydrodynamic Data Source', 900); // 15 min TTL
  }

  async getConditions(latitude, longitude, targetDate = null) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    return this.fetchWithFallback({
      params: { latitude: lat, longitude: lng, targetDate },
      cacheNamespace: 'marine',
      primaryFetcher: async (p) => {
        const live = await openMeteoMarine.getMarineConditions(p.latitude, p.longitude, p.targetDate);
        return {
          ...live,
          waveHeight: live.wave?.height ?? 1.1
        };
      },
      demoFetcher: async (p) => {
        const demo = await demoOcean.getOceanConditions(p.latitude, p.longitude, p.targetDate);
        return {
          ...demo,
          wave: {
            height: demo.waveHeight,
            direction: 240,
            period: demo.wavePeriod || 8.0,
            windWaveHeight: Number((demo.waveHeight * 0.6).toFixed(1)),
            swellHeight: Number((demo.waveHeight * 0.8).toFixed(1))
          },
          current: {
            velocity: demo.currentSpeed,
            direction: 180
          }
        };
      }
    });
  }
}

module.exports = new MarineDataSource();
