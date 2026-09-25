const { DemoOceanProvider, LiveOceanProvider } = require('../providers/OceanProvider');
const env = require('../config/env');
const logger = require('../utils/logger');

class OceanAgent {
  constructor() {
    this.name = 'Ocean Agent';
    this.role = 'Oceanographic & Hydrodynamic Evaluation';
    this.provider = env.DATA_MODE === 'LIVE' ? new LiveOceanProvider() : new DemoOceanProvider();
  }

  async execute(latitude, longitude, targetDate = new Date()) {
    const startTime = Date.now();
    logger.agent(this.name, `Evaluating ocean dynamics at [${latitude}, ${longitude}]`);

    try {
      const data = await this.provider.getOceanConditions(latitude, longitude, targetDate);
      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          location: data.location,
          regionId: data.regionId,
          sst: data.sst,
          waveHeight: data.waveHeight,
          wavePeriod: data.wavePeriod,
          waveDirection: data.waveDirection,
          currentSpeed: data.currentSpeed,
          currentDirection: data.currentDirection,
          tide: data.tide,
          seaCondition: data.seaCondition,
          salinity: data.salinity,
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

module.exports = new OceanAgent();
