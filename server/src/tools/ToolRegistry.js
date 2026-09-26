const dsm = require('../dataSources/DataSourceManager');
const logger = require('../utils/logger');

/**
 * ORCA Tool Registry
 * Exposes standardized tools invoked by Autonomous Agents and the Planner
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.registerCoreTools();
  }

  register(name, description, executeFn) {
    this.tools.set(name, {
      name,
      description,
      execute: executeFn
    });
  }

  getTool(name) {
    return this.tools.get(name);
  }

  listTools() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description
    }));
  }

  registerCoreTools() {
    // 1. Weather Tool
    this.register(
      'weather_tool',
      'Fetches current and hourly meteorological data (winds, temperature, rain, visibility, squalls) for marine coordinates',
      async ({ latitude, longitude, targetDate }) => {
        return await dsm.weather.getWeather(latitude, longitude, targetDate);
      }
    );

    // 2. Marine Hydrodynamic Tool
    this.register(
      'marine_tool',
      'Fetches physical oceanographic conditions (significant wave height, wave period, swell, current velocity, sea condition, SST)',
      async ({ latitude, longitude, targetDate }) => {
        return await dsm.marine.getConditions(latitude, longitude, targetDate);
      }
    );

    // 3. Earth Observation Satellite Tool
    this.register(
      'satellite_eo_tool',
      'Fetches satellite radiometry (chlorophyll-a concentration, thermal front gradient, upwelling index)',
      async ({ latitude, longitude, targetDate }) => {
        return await dsm.ocean.getEOData(latitude, longitude, targetDate);
      }
    );

    // 4. Potential Fishing Zone (PFZ) Tool
    this.register(
      'pfz_tool',
      'Retrieves official INCOIS PFZ advisories or calculates derived pelagic habitat suitability hotspots',
      async ({ latitude, longitude, sst, chlorophyll, waveHeight, windSpeed, radiusKm }) => {
        return await dsm.pfz.getZones({ latitude, longitude, sst, chlorophyll, waveHeight, windSpeed, radiusKm });
      }
    );

    // 5. Marine Tide Tool
    this.register(
      'tide_tool',
      'Calculates coastal tidal phase (flood/ebb/slack) and height above chart datum for harbor navigation',
      async ({ latitude, longitude, targetDate }) => {
        return await dsm.tide.getTide(latitude, longitude, targetDate);
      }
    );

    // 6. Marine Geofence Tool
    this.register(
      'geofence_tool',
      'Checks if vessel coordinates fall within Marine Protected Areas (MPAs) or restricted defense/petroleum security zones',
      async ({ latitude, longitude }) => {
        return dsm.geo.checkGeofence(latitude, longitude);
      }
    );

    // 7. Route Optimization Tool
    this.register(
      'route_tool',
      'Calculates minimum-risk maritime navigation waypoints avoiding high swell, squall hazards, and restricted geofences',
      async ({ startLat, startLng, destLat, destLng, vesselSpeedKnots }) => {
        return await dsm.geo.calculateRoute({ startLat, startLng, destLat, destLng, vesselSpeedKnots });
      }
    );

    // 8. Maritime Alert Tool
    this.register(
      'alert_tool',
      'Evaluates real-time synoptic hazards (cyclone, gale wind, high wave swell, thunderstorm squall) for coordinates',
      async ({ latitude, longitude, radiusKm }) => {
        return await dsm.alert.getAlerts(latitude, longitude, radiusKm);
      }
    );

    // 9. Coastal Geocoding Tool
    this.register(
      'geocoding_tool',
      'Resolves natural language coastal names and port queries to exact geographic coordinates',
      async ({ query }) => {
        return await dsm.geo.searchLocation(query);
      }
    );
  }

  async executeTool(name, params) {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool "${name}" not found in ToolRegistry`);
    }
    logger.debug(`[ToolRegistry] Executing tool: ${name}`);
    return await tool.execute(params);
  }
}

module.exports = new ToolRegistry();
