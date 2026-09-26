const toolRegistry = require('../tools/ToolRegistry');
const logger = require('../utils/logger');

class EarthObservationAgent {
  constructor() {
    this.name = 'Earth Observation Agent';
    this.role = 'Satellite Radiometry & Chlorophyll Evaluation';
  }

  async execute(latitude, longitude, targetDate = new Date()) {
    const startTime = Date.now();
    logger.agent(this.name, `Invoking satellite_eo_tool for [${latitude}, ${longitude}]`);

    try {
      const eoData = await toolRegistry.executeTool('satellite_eo_tool', {
        latitude,
        longitude,
        targetDate
      });

      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          coordinates: { latitude, longitude },
          chlorophyll: eoData.chlorophyll,
          chlorophyllUnit: eoData.chlorophyllUnit || 'mg/m³',
          chlorophyllSource: eoData.chlorophyllSource || 'Satellite Earth Observation Feed',
          sst: eoData.sst,
          thermalGradient: eoData.thermalGradient || '0.42 °C/km',
          source: eoData.source || 'Satellite Radiometry & Ocean Color Observation',
          dataMode: eoData.dataMode || 'live',
          isLive: Boolean(eoData.isLive),
          timestamp: eoData.timestamp || new Date().toISOString()
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

module.exports = new EarthObservationAgent();
