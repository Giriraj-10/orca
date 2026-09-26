const logger = require('../utils/logger');

/**
 * Planner Agent
 * Dynamically plans which specialized tools must execute based on intent, time, and coordinates
 */
class PlannerAgent {
  constructor() {
    this.name = 'Planner Agent';
    this.role = 'Intent-Driven Dynamic Tool Execution Planning';
  }

  planTools(intent, queryText = '') {
    const q = (queryText || '').toLowerCase();
    const plannedTools = [];

    // All queries benefit from spatial geocoding if a location name is present
    plannedTools.push({ tool: 'geocoding_tool', priority: 1, reason: 'Resolve coastal port or offshore sector coordinates' });

    switch (intent) {
      case 'SAFETY':
      case 'RISK':
        plannedTools.push(
          { tool: 'weather_tool', priority: 2, reason: 'Evaluate wind speed, squall cells, and visibility' },
          { tool: 'marine_tool', priority: 2, reason: 'Evaluate significant wave swell and current velocity' },
          { tool: 'tide_tool', priority: 3, reason: 'Verify tidal window for harbor egress' },
          { tool: 'alert_tool', priority: 3, reason: 'Check active coastal bulletins and gale warnings' },
          { tool: 'geofence_tool', priority: 4, reason: 'Ensure operations avoid restricted defense/conservation zones' }
        );
        break;

      case 'FISHING_ZONE':
        plannedTools.push(
          { tool: 'weather_tool', priority: 2, reason: 'Check surface winds for harvesting feasibility' },
          { tool: 'marine_tool', priority: 2, reason: 'Fetch wave swell and Sea Surface Temperature (SST)' },
          { tool: 'satellite_eo_tool', priority: 2, reason: 'Measure chlorophyll-a phytoplankton bloom density' },
          { tool: 'pfz_tool', priority: 3, reason: 'Retrieve or derive Potential Fishing Zone candidate hotspots' },
          { tool: 'alert_tool', priority: 4, reason: 'Verify that target hotspots are clear of active weather alerts' }
        );
        break;

      case 'WEATHER':
        plannedTools.push(
          { tool: 'weather_tool', priority: 2, reason: 'Retrieve high-resolution meteorological forecast' },
          { tool: 'alert_tool', priority: 3, reason: 'Check severe storm warnings' }
        );
        break;

      case 'OCEAN_CONDITION':
      case 'SST':
      case 'CHLOROPHYLL':
        plannedTools.push(
          { tool: 'marine_tool', priority: 2, reason: 'Fetch hydrodynamic waves, currents, and SST' },
          { tool: 'satellite_eo_tool', priority: 2, reason: 'Fetch satellite radiometry and chlorophyll index' },
          { tool: 'tide_tool', priority: 3, reason: 'Calculate harmonic coastal tide level' }
        );
        break;

      case 'LOCATION_COMPARISON':
        plannedTools.push(
          { tool: 'marine_tool', priority: 2, reason: 'Benchmark SST and wave swell across locations' },
          { tool: 'weather_tool', priority: 2, reason: 'Benchmark wind speed and conditions across locations' },
          { tool: 'satellite_eo_tool', priority: 2, reason: 'Benchmark chlorophyll primary productivity' }
        );
        break;

      case 'ROUTE_QUERY':
        plannedTools.push(
          { tool: 'weather_tool', priority: 2, reason: 'Check en-route wind vectors' },
          { tool: 'marine_tool', priority: 2, reason: 'Check mid-channel wave swells' },
          { tool: 'geofence_tool', priority: 2, reason: 'Verify no prohibited zones along track' },
          { tool: 'route_tool', priority: 3, reason: 'Compute dynamic minimum-risk waypoints' }
        );
        break;

      default:
        // GENERAL_MARINE fallback query: holistic snapshot
        plannedTools.push(
          { tool: 'weather_tool', priority: 2, reason: 'Atmospheric conditions' },
          { tool: 'marine_tool', priority: 2, reason: 'Hydrodynamic conditions' },
          { tool: 'satellite_eo_tool', priority: 2, reason: 'Earth observation telemetry' },
          { tool: 'alert_tool', priority: 3, reason: 'Hazard scan' }
        );
        break;
    }

    logger.agent(this.name, `Planned ${plannedTools.length} tools for intent: ${intent}`);
    return plannedTools;
  }
}

module.exports = new PlannerAgent();
