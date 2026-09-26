const logger = require('../utils/logger');
const COASTAL_REGIONS = require('../data/coastalRegions');
const { calculateDistance, findNearest } = require('../utils/geoUtils');
const toolRegistry = require('../tools/ToolRegistry');

class GeospatialAgent {
  constructor() {
    this.name = 'Geospatial Agent';
    this.role = 'Spatial Indexing, Geocoding & Boundary Reasoning';
  }

  findNearestRegion(latitude, longitude) {
    return findNearest(latitude, longitude, COASTAL_REGIONS);
  }

  async resolveLocationName(query) {
    if (!query) return null;
    try {
      const geoResult = await toolRegistry.executeTool('geocoding_tool', { query });
      if (geoResult && geoResult.latitude && geoResult.longitude) {
        return {
          name: geoResult.name,
          fullName: geoResult.fullName,
          center: { latitude: geoResult.latitude, longitude: geoResult.longitude },
          source: geoResult.source
        };
      }
    } catch (err) {
      logger.warn(`[GeospatialAgent] Geocode tool error: ${err.message}`);
    }

    // Baseline keyword alias fallback
    const q = query.toLowerCase();
    for (const region of COASTAL_REGIONS) {
      if (q.includes(region.id) || q.includes(region.name.toLowerCase())) {
        return { name: region.name, center: region.center, source: 'Coastal Registry' };
      }
    }
    return null;
  }

  async execute(latitude, longitude, queryText = '') {
    const startTime = Date.now();
    logger.agent(this.name, `Performing spatial resolution for query "${queryText}" [${latitude}, ${longitude}]`);

    try {
      let resolvedLoc = null;
      if (queryText) {
        resolvedLoc = await this.resolveLocationName(queryText);
      }

      const targetCoords = resolvedLoc
        ? { latitude: resolvedLoc.center.latitude, longitude: resolvedLoc.center.longitude }
        : { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };

      const nearestRegion = this.findNearestRegion(targetCoords.latitude, targetCoords.longitude);

      // Check geofence
      const geofenceStatus = await toolRegistry.executeTool('geofence_tool', targetCoords);

      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          resolvedLocation: resolvedLoc ? resolvedLoc.name : nearestRegion.name,
          targetCoordinates: targetCoords,
          nearestRegion: nearestRegion,
          distanceToPortKm: nearestRegion.distanceKm || 0,
          seaBasin: nearestRegion.sea,
          geofenceStatus,
          allRegions: COASTAL_REGIONS.map(r => ({ id: r.id, name: r.name, center: r.center }))
        }
      };
    } catch (err) {
      logger.error(`${this.name} failed: ${err.message}`);
      return {
        success: false,
        agent: this.name,
        role: this.role,
        error: err.message,
        data: null
      };
    }
  }
}

module.exports = new GeospatialAgent();
