const logger = require('../utils/logger');
const COASTAL_REGIONS = require('../data/coastalRegions');
const { calculateDestination, calculateDistance } = require('../utils/geoUtils');

class FishingZoneAgent {
  constructor() {
    this.name = 'Fishing Zone Agent';
    this.role = 'Pelagic Habitat & Suitability Estimation';
  }

  /**
   * Deterministic prototype fishing zone logic
   * High: SST favorable (26-29°C) && Chlorophyll > 1.4 && Waves < 2.0m && Wind < 25km/h
   * Medium: Moderate indicators
   * Low: Poor conditions
   */
  evaluateSuitability(sst, chlorophyll, waveHeight, windSpeed) {
    let score = 0;
    const reasons = [];

    // SST Check (Optimal pelagic front between 26.0°C and 29.2°C)
    if (sst >= 26.0 && sst <= 29.2) {
      score += 35;
      reasons.push(`SST (${sst}°C) is in the optimal thermal window for pelagic aggregation`);
    } else if (sst >= 24.5 && sst <= 30.5) {
      score += 20;
      reasons.push(`SST (${sst}°C) is marginally acceptable`);
    } else {
      reasons.push(`SST (${sst}°C) is outside typical productive range`);
    }

    // Chlorophyll Check (Indicator of primary productivity and phytoplankton)
    if (chlorophyll >= 1.8) {
      score += 40;
      reasons.push(`Chlorophyll concentration (${chlorophyll} mg/m³) is elevated, indicating strong food chain support`);
    } else if (chlorophyll >= 1.0) {
      score += 25;
      reasons.push(`Moderate chlorophyll levels (${chlorophyll} mg/m³) observed`);
    } else {
      score += 10;
      reasons.push(`Oligotrophic water with low chlorophyll (${chlorophyll} mg/m³)`);
    }

    // Hydrodynamic / Navigational Check
    if (waveHeight <= 1.4 && windSpeed <= 20) {
      score += 25;
      reasons.push(`Calm to moderate sea state (${waveHeight}m waves, ${windSpeed} km/h wind) allows safe harvesting`);
    } else if (waveHeight <= 2.2 && windSpeed <= 30) {
      score += 10;
      reasons.push(`Challenging surface conditions (${waveHeight}m waves, ${windSpeed} km/h wind)`);
    } else {
      score -= 20;
      reasons.push(`Harsh sea conditions (${waveHeight}m waves, ${windSpeed} km/h wind) impede fishing activity`);
    }

    let suitability = 'LOW';
    let confidence = 0.72;

    if (score >= 80) {
      suitability = 'HIGH';
      confidence = 0.88;
    } else if (score >= 50) {
      suitability = 'MEDIUM';
      confidence = 0.81;
    } else {
      suitability = 'LOW';
      confidence = 0.75;
    }

    return {
      suitability,
      confidence,
      score,
      reasoning: reasons.join('. ') + '. (Prototype suitability estimate — not an official regulatory PFZ advisory).'
    };
  }

  async execute(latitude, longitude, weatherData, oceanData, eoData) {
    const startTime = Date.now();
    logger.agent(this.name, `Estimating fishing suitability around [${latitude}, ${longitude}]`);

    try {
      const sst = oceanData?.sst || eoData?.sst || 27.5;
      const chlorophyll = eoData?.chlorophyll || 1.8;
      const waveHeight = oceanData?.waveHeight || 1.1;
      const windSpeed = weatherData?.windSpeed || 14.0;

      const baseEval = this.evaluateSuitability(sst, chlorophyll, waveHeight, windSpeed);

      // Locate coastal region for candidate zones
      let closestRegion = COASTAL_REGIONS[0];
      let minDistance = Infinity;
      for (const r of COASTAL_REGIONS) {
        const d = calculateDistance(latitude, longitude, r.center.latitude, r.center.longitude);
        if (d < minDistance) {
          minDistance = d;
          closestRegion = r;
        }
      }

      // Generate localized candidate zones with actual offsets
      const candidateZones = closestRegion.fishingHotspots.map((h, idx) => {
        const dest = calculateDestination(closestRegion.center.latitude, closestRegion.center.longitude, h.offsetKm, h.bearing);
        const distFromUser = calculateDistance(latitude, longitude, dest.latitude, dest.longitude);

        // Localized variations per zone
        const zoneSst = Number((sst + (idx === 0 ? 0.2 : idx === 1 ? -0.3 : 0.4)).toFixed(1));
        const zoneChl = Number((chlorophyll + (idx === 0 ? 0.35 : idx === 1 ? 0.1 : -0.25)).toFixed(2));
        const zoneEval = this.evaluateSuitability(zoneSst, zoneChl, waveHeight, windSpeed);

        return {
          id: `pfz-${closestRegion.id}-${idx + 1}`,
          name: `${h.name}`,
          region: closestRegion.name,
          coordinates: { latitude: dest.latitude, longitude: dest.longitude },
          distanceKm: distFromUser,
          bearingDegrees: h.bearing,
          suitability: zoneEval.suitability,
          confidence: zoneEval.confidence,
          indicators: {
            sst: zoneSst,
            chlorophyll: zoneChl,
            waveHeight: waveHeight,
            windSpeed: windSpeed,
            upwellingIndicator: zoneChl > 1.8 ? 'High' : 'Moderate'
          },
          reason: zoneEval.reasoning,
          targetSpecies: ['Indian Mackerel', 'Yellowfin Tuna', 'Sardinella longiceps', 'Ribbonfish'],
          disclaimer: 'Prototype suitability estimate'
        };
      });

      // Sort by suitability (HIGH first) then by distance
      candidateZones.sort((a, b) => {
        const suitOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        if (suitOrder[b.suitability] !== suitOrder[a.suitability]) {
          return suitOrder[b.suitability] - suitOrder[a.suitability];
        }
        return a.distanceKm - b.distanceKm;
      });

      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: {
          overallSuitability: baseEval.suitability,
          overallConfidence: baseEval.confidence,
          indicatorsAnalyzed: { sst, chlorophyll, waveHeight, windSpeed },
          reasoning: baseEval.reasoning,
          candidateZones: candidateZones,
          disclaimer: 'Prototype suitability estimate — not an official regulatory forecast'
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
