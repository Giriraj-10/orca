const BaseDataSource = require('./BaseDataSource');
const liveAlertService = require('./alerts/liveAlertService');
const { generateAlerts } = require('../data/seedData');

class AlertDataSource extends BaseDataSource {
  constructor() {
    super('Maritime Hazard & Alert Data Source', 300); // 5 min TTL
  }

  async getAlerts(latitude, longitude, radiusKm = 100) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    return this.fetchWithFallback({
      params: { latitude: lat, longitude: lng, radiusKm },
      cacheNamespace: 'alerts',
      primaryFetcher: async (p) => {
        const liveAlerts = await liveAlertService.getAlertsForCoordinates(p.latitude, p.longitude, p.radiusKm);
        return {
          alerts: liveAlerts,
          count: liveAlerts.length,
          source: 'Live Coastal Alert Engine & Synoptic Weather Mesh',
          isLive: true
        };
      },
      demoFetcher: async () => {
        const demo = generateAlerts();
        return {
          alerts: demo,
          count: demo.length,
          source: 'Demo Coastal Safety Advisories',
          isLive: false
        };
      }
    });
  }
}

module.exports = new AlertDataSource();
