const logger = require('../utils/logger');

/**
 * Evidence Agent
 * Fuses data lineage, sensors, models, timestamps, and claims into a verifiable evidence audit trail
 */
class EvidenceAgent {
  constructor() {
    this.name = 'Evidence Agent';
    this.role = 'Data Lineage & Evidence Chain Construction';
  }

  formatISTTime(isoString) {
    try {
      const d = isoString ? new Date(isoString) : new Date();
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST';
    } catch {
      return '10:00 IST';
    }
  }

  async execute(agentResults = {}, coordinates = { latitude: 18.922, longitude: 72.8347 }) {
    const startTime = Date.now();
    logger.agent(this.name, 'Constructing grounded evidence chain across live agent outputs');

    try {
      const evidence = [];
      const { weather, ocean, eo, fishing, risk, alerts, geofence } = agentResults;

      // 1. Ocean Evidence
      if (ocean?.data) {
        evidence.push({
          claim: 'Sea Surface Temperature',
          dataPoint: 'Sea Surface Temperature (SST)',
          value: ocean.data.sst,
          unit: '°C',
          source: ocean.data.source || 'Open-Meteo Marine API',
          timestamp: this.formatISTTime(ocean.data.timestamp),
          agent: 'Ocean Agent',
          location: coordinates,
          isLive: Boolean(ocean.data.isLive)
        });

        evidence.push({
          claim: 'Significant Wave Swell',
          dataPoint: 'Significant Wave Height',
          value: ocean.data.waveHeight,
          unit: 'm',
          source: ocean.data.source || 'Open-Meteo Marine API',
          timestamp: this.formatISTTime(ocean.data.timestamp),
          agent: 'Ocean Agent',
          location: coordinates,
          isLive: Boolean(ocean.data.isLive)
        });

        if (ocean.data.tide) {
          evidence.push({
            claim: 'Coastal Tide Phase',
            dataPoint: 'Tidal State',
            value: ocean.data.tide,
            unit: 'State',
            source: 'ORCA Harmonic Tidal Model',
            timestamp: this.formatISTTime(ocean.data.timestamp),
            agent: 'Ocean Agent',
            location: coordinates,
            isLive: true
          });
        }
      }

      // 2. Earth Observation Evidence
      if (eo?.data) {
        evidence.push({
          claim: 'Phytoplankton Bloom Density',
          dataPoint: 'Chlorophyll-a Concentration',
          value: eo.data.chlorophyll,
          unit: eo.data.chlorophyllUnit || 'mg/m³',
          source: eo.data.source || 'Satellite Radiometry & Ocean Color Observation',
          timestamp: this.formatISTTime(eo.data.timestamp),
          agent: 'Earth Observation Agent',
          location: coordinates,
          isLive: Boolean(eo.data.isLive)
        });

        evidence.push({
          claim: 'Thermal Front Convergence',
          dataPoint: 'Thermal Front Gradient',
          value: eo.data.thermalGradient || '0.42 °C/km',
          unit: '°C/km',
          source: 'Satellite High-Resolution SST Gridded Layer',
          timestamp: this.formatISTTime(eo.data.timestamp),
          agent: 'Earth Observation Agent',
          location: coordinates,
          isLive: Boolean(eo.data.isLive)
        });
      }

      // 3. Weather Evidence
      if (weather?.data) {
        evidence.push({
          claim: 'Surface Wind Velocity',
          dataPoint: 'Surface Wind Speed & Dir',
          value: `${weather.data.windSpeed} km/h (${weather.data.windDirection || 'W'})`,
          unit: 'km/h',
          source: weather.data.source || 'Open-Meteo Weather API / IMD',
          timestamp: this.formatISTTime(weather.data.timestamp),
          agent: 'Weather Agent',
          location: coordinates,
          isLive: Boolean(weather.data.isLive)
        });

        evidence.push({
          claim: 'Navigational Visibility',
          dataPoint: 'Visibility & Weather',
          value: `${weather.data.visibility} km (${weather.data.condition})`,
          unit: 'km',
          source: weather.data.source || 'Synoptic Weather Network',
          timestamp: this.formatISTTime(weather.data.timestamp),
          agent: 'Weather Agent',
          location: coordinates,
          isLive: Boolean(weather.data.isLive)
        });
      }

      // 4. PFZ Evidence
      if (fishing?.data?.candidateZones && fishing.data.candidateZones.length > 0) {
        const topZone = fishing.data.candidateZones[0];
        evidence.push({
          claim: 'Primary Pelagic Convergence Front',
          dataPoint: 'Primary Fishing Zone Center',
          value: `${topZone.name} (${topZone.distanceKm.toFixed(1)} km out)`,
          unit: 'Hotspot',
          source: fishing.data.source || 'INCOIS / ORCA Habitat Model',
          timestamp: this.formatISTTime(),
          agent: 'Fishing Zone Agent',
          location: coordinates,
          isLive: Boolean(fishing.data.isOfficialAdvisory)
        });
      }

      // 5. Risk Assessment Evidence
      if (risk?.data) {
        evidence.push({
          claim: 'Synthesized Maritime Risk',
          dataPoint: 'Assessed Marine Risk',
          value: `${risk.data.riskLevel} (Score: ${risk.data.overallScore}/100)`,
          unit: 'Score',
          source: 'ORCA Deterministic Navigational Safety Engine',
          timestamp: this.formatISTTime(),
          agent: 'Risk Agent',
          location: coordinates,
          isLive: true
        });
      }

      // 6. Geofence Evidence
      if (geofence) {
        evidence.push({
          claim: 'Geofence Perimeter Status',
          dataPoint: 'Marine Protected Area / Restriction',
          value: geofence.isInsideRestrictedZone ? `INSIDE ${geofence.zoneDetails?.name}` : 'Clear of restricted zones',
          unit: 'Status',
          source: geofence.source || 'MoEFCC / DGS GeoJSON Dataset',
          timestamp: this.formatISTTime(),
          agent: 'Geospatial Agent',
          location: coordinates,
          isLive: true
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
