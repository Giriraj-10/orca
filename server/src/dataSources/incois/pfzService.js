const incoisClient = require('./incoisClient');
const pfzNormalizer = require('./pfzNormalizer');
const { calculateDistance, calculateDestination } = require('../../utils/geoUtils');
const logger = require('../../utils/logger');

class PfzService {
  /**
   * Evaluate suitability score deterministically
   */
  evaluateSuitability(sst, chlorophyll, waveHeight, windSpeed) {
    let score = 0;
    const reasons = [];

    // SST Window (26.0 - 29.2 °C optimal)
    if (sst >= 26.0 && sst <= 29.2) {
      score += 35;
      reasons.push(`SST (${sst}°C) aligns with the optimal thermal boundary for pelagic aggregation`);
    } else if (sst >= 24.5 && sst <= 30.5) {
      score += 20;
      reasons.push(`SST (${sst}°C) is marginally acceptable`);
    } else {
      reasons.push(`SST (${sst}°C) is outside the typical productive window`);
    }

    // Chlorophyll-a
    if (chlorophyll >= 1.8) {
      score += 40;
      reasons.push(`Elevated chlorophyll (${chlorophyll} mg/m³) indicates strong phytoplankton bloom`);
    } else if (chlorophyll >= 1.0) {
      score += 25;
      reasons.push(`Moderate chlorophyll levels (${chlorophyll} mg/m³)`);
    } else {
      score += 10;
      reasons.push(`Low chlorophyll concentration (${chlorophyll} mg/m³)`);
    }

    // Navigational Sea State
    if (waveHeight <= 1.4 && windSpeed <= 20) {
      score += 25;
      reasons.push(`Calm sea state (${waveHeight}m waves, ${windSpeed} km/h wind) facilitates harvesting`);
    } else if (waveHeight <= 2.2 && windSpeed <= 30) {
      score += 10;
      reasons.push(`Challenging surface conditions (${waveHeight}m waves, ${windSpeed} km/h wind)`);
    } else {
      score -= 20;
      reasons.push(`Rough sea state (${waveHeight}m waves, ${windSpeed} km/h wind) impedes safe navigation`);
    }

    let suitability = 'LOW';
    let confidence = 0.74;
    if (score >= 80) {
      suitability = 'HIGH';
      confidence = 0.89;
    } else if (score >= 50) {
      suitability = 'MEDIUM';
      confidence = 0.81;
    }

    return { suitability, confidence, score, reasoning: reasons.join('. ') + '.' };
  }

  /**
   * Retrieve PFZ advisories or compute derived PFZ suitability map
   */
  async getPotentialFishingZones({ latitude, longitude, sst = 28.0, chlorophyll = 1.8, waveHeight = 1.1, windSpeed = 14.0, radiusKm = 100 }) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // 1. Try official INCOIS advisory feed / bulletin
    const officialFeed = await incoisClient.fetchLatestAdvisory();
    if (officialFeed && officialFeed.raw) {
      logger.info('[PfzService] Official INCOIS advisory ingested successfully');
      const normalized = pfzNormalizer.normalizeOfficial(officialFeed.raw);
      if (normalized && normalized.zones && normalized.zones.length > 0) {
        // Annotate zones with distance to user's point
        normalized.zones = normalized.zones.map(z => ({
          ...z,
          distanceKm: calculateDistance(lat, lng, z.coordinates.latitude, z.coordinates.longitude)
        })).filter(z => z.distanceKm <= radiusKm).sort((a, b) => a.distanceKm - b.distanceKm);

        return normalized;
      }
    }

    // 2. Secondary Mode: PFZ ANALYTICS MODE (ORCA DERIVED PFZ SUITABILITY)
    logger.info(`[PfzService] INCOIS operational feed unavailable. Computing dynamic ORCA PFZ suitability around [${lat}, ${lng}]`);

    // Dynamically project candidate pelagic convergence fronts around coordinates
    const angles = [240, 270, 310]; // offshore seaward bearings
    const baseEval = this.evaluateSuitability(sst, chlorophyll, waveHeight, windSpeed);

    const candidateHotspots = angles.map((bearing, idx) => {
      const offsetKm = 15 + (idx * 9);
      const dest = calculateDestination(lat, lng, offsetKm, bearing);
      const zoneSst = Number((sst + (idx === 0 ? 0.2 : idx === 1 ? -0.3 : 0.4)).toFixed(1));
      const zoneChl = Number((chlorophyll + (idx === 0 ? 0.25 : idx === 1 ? -0.15 : 0.1)).toFixed(2));
      const zoneEval = this.evaluateSuitability(zoneSst, zoneChl, waveHeight, windSpeed);

      return {
        id: `orca-derived-pfz-${idx + 1}`,
        name: `Derived Pelagic Front ${idx + 1} (${offsetKm}km WSW)`,
        coordinates: { latitude: dest.latitude, longitude: dest.longitude },
        distanceKm: offsetKm,
        bearingDegrees: bearing,
        suitability: zoneEval.suitability,
        confidence: zoneEval.confidence,
        indicators: {
          sst: zoneSst,
          chlorophyll: zoneChl,
          waveHeight: waveHeight,
          windSpeed: windSpeed,
          upwellingIndicator: zoneChl > 1.7 ? 'Strong' : 'Moderate'
        },
        reason: zoneEval.reasoning,
        targetSpecies: ['Indian Mackerel', 'Yellowfin Tuna', 'Sardinella longiceps', 'Ribbonfish'],
        disclaimer: 'ORCA DERIVED PFZ SUITABILITY — NOT OFFICIAL INCOIS PFZ ADVISORY'
      };
    });

    return pfzNormalizer.normalizeDerived({
      latitude: lat,
      longitude: lng,
      sst,
      chlorophyll,
      waveHeight,
      windSpeed,
      candidateHotspots
    });
  }
}

module.exports = new PfzService();
