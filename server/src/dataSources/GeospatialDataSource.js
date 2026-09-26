const BaseDataSource = require('./BaseDataSource');
const geocodingService = require('./geocoding/geocodingService');
const geofenceService = require('./geofencing/geofenceService');
const routeOptimizerService = require('./routing/routeOptimizerService');

class GeospatialDataSource extends BaseDataSource {
  constructor() {
    super('Geospatial & Marine GIS Data Source', 86400); // 24 hours TTL for spatial registry
  }

  async searchLocation(query) {
    return geocodingService.searchLocation(query);
  }

  getGeofences() {
    return geofenceService.getAllGeofences();
  }

  checkGeofence(latitude, longitude) {
    return geofenceService.checkPoint(latitude, longitude);
  }

  async calculateRoute(params) {
    return routeOptimizerService.calculateSafestRoute(params);
  }
}

module.exports = new GeospatialDataSource();
