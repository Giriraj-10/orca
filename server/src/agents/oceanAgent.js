const toolRegistry = require('../tools/ToolRegistry');
const logger = require('../utils/logger');

class OceanAgent {
  constructor() {
    this.name = 'Ocean Agent';
    this.role = 'Oceanographic & Hydrodynamic Evaluation';
  }

  async execute(latitude, longitude, targetDate = new Date()) {
    const startTime = Date.now();
    logger.agent(this.name, `Invoking marine_tool for dynamics at [${latitude}, ${longitude}]`);

    try {
      const marineData = await toolRegistry.executeTool('marine_tool', {
        latitude,
        longitude,
        targetDate
      });

      const latencyMs = Date.now() - startTime;

      const waveHeight = marineData.wave?.height ?? marineData.waveHeight ?? 1.1;
      const wavePeriod = marineData.wave?.period ?? marineData.wavePeriod ?? 8.0;
      const waveDirection = marineData.wave?.direction ?? 240;
      const currentSpeed = marineData.current?.velocity ?? marineData.currentSpeed ?? 0.4;
      const currentDirection = marineData.current?.direction ?? 180;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          location: marineData.location || { latitude, longitude },
          sst: marineData.sst,
          waveHeight: Number(waveHeight.toFixed(2)),
          wavePeriod: Number(wavePeriod.toFixed(1)),
          waveDirection: waveDirection,
          currentSpeed: Number(currentSpeed.toFixed(2)),
          currentDirection: currentDirection,
          tide: marineData.tide || 'Semi-diurnal Harmonic Tide',
          seaCondition: marineData.seaCondition || 'Moderate',
          timeseries: marineData.timeseries || [],
          source: marineData.source || 'Open-Meteo Marine Hydrodynamic API',
          dataMode: marineData.dataMode || 'live',
          isLive: Boolean(marineData.isLive),
          isCached: Boolean(marineData.isCached),
          timestamp: marineData.timestamp || new Date().toISOString()
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
