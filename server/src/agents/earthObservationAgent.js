const { DemoEarthObservationProvider, LiveEarthObservationProvider } = require('../providers/EarthObservationProvider');
const env = require('../config/env');
const logger = require('../utils/logger');

class EarthObservationAgent {
  constructor() {
    this.name = 'Earth Observation Agent';
    this.role = 'Satellite Remote Sensing & Chlorophyll Extraction';
    this.provider = env.DATA_MODE === 'LIVE' ? new LiveEarthObservationProvider() : new DemoEarthObservationProvider();
  }

  async execute(latitude, longitude) {
    const startTime = Date.now();
    logger.agent(this.name, `Extracting satellite radiometric data at [${latitude}, ${longitude}]`);

    try {
      const data = await this.provider.getEOData(latitude, longitude);
      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          regionName: data.regionName,
          regionId: data.regionId,
          chlorophyll: data.chlorophyll,
          sst: data.sst,
          thermalGradient: data.thermalGradient,
          productivityIndex: data.productivityIndex,
          sensor: data.sensor,
          satelliteResolution: data.satelliteResolution,
          source: data.source,
          mode: data.mode,
          timestamp: data.timestamp
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
