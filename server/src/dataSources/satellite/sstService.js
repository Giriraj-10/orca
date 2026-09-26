const openMeteoMarine = require('../openMeteo/marineService');
const logger = require('../../utils/logger');

class SstService {
  async getSST(latitude, longitude, targetDate = null) {
    try {
      const marineData = await openMeteoMarine.getMarineConditions(latitude, longitude, targetDate);
      return {
        value: marineData.sst,
        unit: '°C',
        timestamp: marineData.timestamp,
        source: 'Open-Meteo Global Marine Model (ECMWF/NOAA Analysis)',
        sensorType: 'Numerical Ocean Hydrodynamic Model SST',
        isModelDerived: true,
        isLive: true,
        disclaimer: 'Model-derived marine SST analysis (operational numerical grid, not direct satellite radiometer thermal pixel)'
      };
    } catch (err) {
      logger.warn(`[SstService] Open-Meteo SST failed: ${err.message}. Using baseline estimation.`);
      const lat = parseFloat(latitude);
      const estSst = Number((28.2 - (Math.abs(lat - 15) * 0.12)).toFixed(1));
      return {
        value: estSst,
        unit: '°C',
        timestamp: new Date().toISOString(),
        source: 'ORCA Climatological SST Baseline',
        sensorType: 'Climatological Model',
        isModelDerived: true,
        isLive: false,
        note: 'Live marine SST service unreachable — using climatological baseline'
      };
    }
  }
}

module.exports = new SstService();
