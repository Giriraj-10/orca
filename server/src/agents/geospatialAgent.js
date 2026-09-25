const logger = require('../utils/logger');
const COASTAL_REGIONS = require('../data/coastalRegions');
const { calculateDistance, findNearest } = require('../utils/geoUtils');

class GeospatialAgent {
  constructor() {
    this.name = 'Geospatial Agent';
    this.role = 'Spatial Indexing & Boundary Reasoning';
  }

  /**
   * Find nearest coastal reference region
   */
  findNearestRegion(latitude, longitude) {
    return findNearest(latitude, longitude, COASTAL_REGIONS);
  }

  /**
   * Resolve named location query to coordinates
   */
  resolveLocationName(query) {
    if (!query) return null;
    const q = query.toLowerCase();

    for (const region of COASTAL_REGIONS) {
      if (
        q.includes(region.id) ||
        q.includes(region.name.toLowerCase()) ||
        q.includes(region.state.toLowerCase()) ||
        q.includes(region.sea.toLowerCase())
      ) {
        return region;
      }
    }

    // Default aliases
    if (q.includes('bombay') || q.includes('mumbai')) return COASTAL_REGIONS.find(r => r.id === 'mumbai');
    if (q.includes('panaji') || q.includes('goa')) return COASTAL_REGIONS.find(r => r.id === 'goa');
    if (q.includes('cochin') || q.includes('kochi') || q.includes('kerala')) return COASTAL_REGIONS.find(r => r.id === 'kochi');
    if (q.includes('madras') || q.includes('chennai') || q.includes('tamil nadu')) return COASTAL_REGIONS.find(r => r.id === 'chennai');
    if (q.includes('vizag') || q.includes('visakhapatnam') || q.includes('andhra')) return COASTAL_REGIONS.find(r => r.id === 'vizag');
    if (q.includes('puri') || q.includes('paradip') || q.includes('odisha') || q.includes('orissa')) return COASTAL_REGIONS.find(r => r.id === 'odisha');
    if (q.includes('veraval') || q.includes('gujarat') || q.includes('porbandar')) return COASTAL_REGIONS.find(r => r.id === 'gujarat');
    if (q.includes('andaman') || q.includes('port blair') || q.includes('nicobar')) return COASTAL_REGIONS.find(r => r.id === 'andaman');

    return null;
  }

  /**
   * Compare two marine locations
   */
  compareLocations(locA, locB) {
    const dist = calculateDistance(
      locA.center.latitude, locA.center.longitude,
      locB.center.latitude, locB.center.longitude
    );

    return {
      distanceBetweenKm: dist,
      locationA: {
        name: locA.name,
        state: locA.state,
        sea: locA.sea,
        coordinates: locA.center,
        baseline: locA.baseline
      },
      locationB: {
        name: locB.name,
        state: locB.state,
        sea: locB.sea,
        coordinates: locB.center,
        baseline: locB.baseline
      },
      comparisonDeltas: {
        sstDelta: Number((locA.baseline.sst - locB.baseline.sst).toFixed(1)),
        chlorophyllDelta: Number((locA.baseline.chlorophyll - locB.baseline.chlorophyll).toFixed(2)),
        waveDelta: Number((locA.baseline.waveHeight - locB.baseline.waveHeight).toFixed(1)),
        windDelta: Number((locA.baseline.windSpeed - locB.baseline.windSpeed).toFixed(1))
      }
    };
  }

  async execute(latitude, longitude, queryText = '') {
    const startTime = Date.now();
    logger.agent(this.name, `Performing spatial resolution for query "${queryText}" [${latitude}, ${longitude}]`);

    try {
      const resolvedFromQuery = this.resolveLocationName(queryText);
      const targetCoords = resolvedFromQuery
        ? { latitude: resolvedFromQuery.center.latitude, longitude: resolvedFromQuery.center.longitude }
        : { latitude, longitude };

      const nearestRegion = this.findNearestRegion(targetCoords.latitude, targetCoords.longitude);

      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          resolvedLocation: resolvedFromQuery ? resolvedFromQuery.name : nearestRegion.name,
          targetCoordinates: targetCoords,
          nearestRegion: nearestRegion,
          distanceToPortKm: nearestRegion.distanceKm || 0,
          seaBasin: nearestRegion.sea,
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
