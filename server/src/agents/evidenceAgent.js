const logger = require('../utils/logger');

class EvidenceAgent {
  constructor() {
    this.name = 'Evidence Agent';
    this.role = 'Data Lineage & Evidence Fusion';
  }

  formatISTTime(isoString) {
    try {
      const d = isoString ? new Date(isoString) : new Date();
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST';
    } catch {
      return '10:00 IST';
    }
  }

  async execute(agentResults = {}) {
    const startTime = Date.now();
    logger.agent(this.name, 'Aggregating evidence across agent outputs');

    try {
      const evidence = [];

      const { weather, ocean, eo, fishing, risk } = agentResults;

      if (ocean?.data) {
        evidence.push({
          dataPoint: 'Sea Surface Temperature (SST)',
          value: `${ocean.data.sst} °C`,
          source: ocean.data.source || 'Demo Oceanographic In-Situ & Buoy Blend',
          timestamp: this.formatISTTime(ocean.data.timestamp),
          agent: 'Ocean Agent'
        });

        evidence.push({
          dataPoint: 'Significant Wave Height',
          value: `${ocean.data.waveHeight} m (${ocean.data.seaCondition || 'Moderate'})`,
          source: ocean.data.source || 'Demo Ocean Wave Buoys',
          timestamp: this.formatISTTime(ocean.data.timestamp),
          agent: 'Ocean Agent'
        });

        if (ocean.data.tide) {
          evidence.push({
            dataPoint: 'Tidal State',
            value: ocean.data.tide,
            source: 'Harmonic Tide Gauge Station',
            timestamp: this.formatISTTime(ocean.data.timestamp),
            agent: 'Ocean Agent'
          });
        }
      }

      if (eo?.data) {
        evidence.push({
          dataPoint: 'Chlorophyll-a Concentration',
          value: `${eo.data.chlorophyll} mg/m³`,
          source: eo.data.source || 'Demo Satellite EO Radiometer (OCM-3/MODIS)',
          timestamp: this.formatISTTime(eo.data.timestamp),
          agent: 'Earth Observation Agent'
        });

        evidence.push({
          dataPoint: 'Thermal Front Gradient',
          value: eo.data.thermalGradient || '0.45 °C/km',
          source: 'Satellite High-Resolution SST Gridded Layer',
          timestamp: this.formatISTTime(eo.data.timestamp),
          agent: 'Earth Observation Agent'
        });
      }

      if (weather?.data) {
        evidence.push({
          dataPoint: 'Surface Wind Speed & Dir',
          value: `${weather.data.windSpeed} km/h (${weather.data.windDirection || 'W'})`,
          source: weather.data.source || 'Demo Coastal Meteorological WRF Mesh',
          timestamp: this.formatISTTime(weather.data.timestamp),
          agent: 'Weather Agent'
        });

        evidence.push({
          dataPoint: 'Visibility & Weather',
          value: `${weather.data.visibility} km (${weather.data.condition})`,
          source: weather.data.source || 'Synoptic Weather Network',
          timestamp: this.formatISTTime(weather.data.timestamp),
          agent: 'Weather Agent'
        });
      }

      if (fishing?.data?.candidateZones && fishing.data.candidateZones.length > 0) {
        const topZone = fishing.data.candidateZones[0];
        evidence.push({
          dataPoint: 'Primary Fishing Zone Center',
          value: `${topZone.name} (${topZone.distanceKm.toFixed(1)} km out)`,
          source: 'ORCA Habitat Suitability Model',
          timestamp: this.formatISTTime(),
          agent: 'Fishing Zone Agent'
        });
      }

      if (risk?.data) {
        evidence.push({
          dataPoint: 'Assessed Marine Risk',
          value: `${risk.data.riskLevel} (Score: ${risk.data.overallScore}/100)`,
          source: 'ORCA Navigational Safety Heuristic',
          timestamp: this.formatISTTime(),
          agent: 'Risk Agent'
        });
      }

      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: evidence
      };
    } catch (err) {
      logger.error(`${this.name} failed: ${err.message}`);
      return {
        success: false,
        agent: this.name,
        role: this.role,
        error: err.message,
        data: []
      };
    }
  }
}

module.exports = new EvidenceAgent();
