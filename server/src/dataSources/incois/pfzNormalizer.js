/**
 * INCOIS PFZ Normalizer
 */

class PfzNormalizer {
  normalizeOfficial(rawFeed, sector = 'All') {
    if (!rawFeed) return null;

    // Standardized INCOIS PFZ structure
    const zones = Array.isArray(rawFeed.zones || rawFeed) ? (rawFeed.zones || rawFeed) : [];

    return {
      source: 'INCOIS (Indian National Centre for Ocean Information Services)',
      advisoryDate: rawFeed.advisoryDate || rawFeed.date || new Date().toISOString().split('T')[0],
      sector: rawFeed.sector || sector,
      retrievedAt: new Date().toISOString(),
      isOfficialAdvisory: true,
      dataMode: 'live',
      zones: zones.map((z, idx) => ({
        id: z.id || `incois-pfz-${idx + 1}`,
        name: z.name || `INCOIS Zone ${idx + 1}`,
        sector: z.sector || sector,
        coordinates: {
          latitude: z.latitude || z.lat,
          longitude: z.longitude || z.lng
        },
        bearingDegrees: z.bearing || null,
        distanceKm: z.distanceKm || null,
        targetSpecies: z.targetSpecies || ['Tuna', 'Mackerel', 'Sardine'],
        depthRangeMeters: z.depth || '20-50m',
        validity: z.validity || '48 Hours from Issuance',
        disclaimer: 'Official INCOIS PFZ Advisory'
      }))
    };
  }

  normalizeDerived({ latitude, longitude, sst, chlorophyll, waveHeight, windSpeed, candidateHotspots }) {
    return {
      source: 'ORCA Derived Marine Intelligence (PFZ Analytics Mode)',
      advisoryDate: new Date().toISOString().split('T')[0],
      sector: 'Dynamic Localized Coastal Sector',
      retrievedAt: new Date().toISOString(),
      isOfficialAdvisory: false,
      dataMode: 'derived',
      disclaimer: 'ORCA DERIVED PFZ SUITABILITY — NOT OFFICIAL INCOIS PFZ ADVISORY',
      inputTelemetry: {
        sst,
        chlorophyll,
        waveHeight,
        windSpeed
      },
      zones: candidateHotspots
    };
  }
}

module.exports = new PfzNormalizer();
