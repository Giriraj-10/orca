const toolRegistry = require('../tools/ToolRegistry');
const logger = require('../utils/logger');

class FishingZoneAgent {
  constructor() {
    this.name = 'Fishing Zone Agent';
    this.role = 'Pelagic Habitat & Suitability Estimation';
  }

  async execute(latitude, longitude, weatherData, oceanData, eoData) {
    const startTime = Date.now();
    logger.agent(this.name, `Invoking pfz_tool for coordinates [${latitude}, ${longitude}]`);

    try {
      const sst = oceanData?.sst || eoData?.sst || 28.0;
      const chlorophyll = eoData?.chlorophyll || 1.8;
      const waveHeight = oceanData?.waveHeight || 1.1;
      const windSpeed = weatherData?.windSpeed || 14.0;

      const pfzResult = await toolRegistry.executeTool('pfz_tool', {
        latitude,
        longitude,
        sst,
        chlorophyll,
        waveHeight,
        windSpeed,
        radiusKm: 120
      });

      const candidateZones = pfzResult.zones || [];
      const latencyMs = Date.now() - startTime;

      let topSuitability = 'MEDIUM';
      let topConfidence = 0.82;
      if (candidateZones.length > 0) {
        topSuitability = candidateZones[0].suitability;
        topConfidence = candidateZones[0].confidence;
      }

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          overallSuitability: topSuitability,
          overallConfidence: topConfidence,
          source: pfzResult.source,
          isOfficialAdvisory: Boolean(pfzResult.isOfficialAdvisory),
          disclaimer: pfzResult.disclaimer || 'ORCA DERIVED PFZ SUITABILITY — NOT OFFICIAL INCOIS PFZ ADVISORY',
          indicatorsAnalyzed: { sst, chlorophyll, waveHeight, windSpeed },
          candidateZones: candidateZones,
          timestamp: new Date().toISOString()
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

module.exports = new FishingZoneAgent();
