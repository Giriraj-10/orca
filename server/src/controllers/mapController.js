const COASTAL_REGIONS = require('../data/coastalRegions');
const FishingZone = require('../models/FishingZone');
const MarineObservation = require('../models/MarineObservation');
const { generateFishingZones, generateMarineObservations } = require('../data/seedData');
const { calculateDestination } = require('../utils/geoUtils');

// @desc    Get layered geospatial datasets for Leaflet visualization
// @route   GET /api/map/layers
const getMapLayers = async (req, res, next) => {
  try {
    let zones = [];
    let observations = [];

    try {
      zones = await FishingZone.find({});
      observations = await MarineObservation.find({});
    } catch (e) {
      // fallback
    }

    if (!zones || zones.length === 0) zones = generateFishingZones();
    if (!observations || observations.length === 0) observations = generateMarineObservations();

    // 1. SST Heat/Gradient Layer points
    const sstLayer = observations.map(obs => ({
      id: `sst-${obs._id || obs.location}`,
      latitude: obs.latitude,
      longitude: obs.longitude,
      sst: obs.sst,
      label: `${obs.sst}°C`,
      color: obs.sst > 28.5 ? '#f97316' : obs.sst > 27.0 ? '#06b6d4' : '#3b82f6',
      intensity: (obs.sst - 24) / 8 // normalized 0..1
    }));

    // 2. Chlorophyll concentration points
    const chlorophyllLayer = observations.map(obs => ({
      id: `chl-${obs._id || obs.location}`,
      latitude: obs.latitude,
      longitude: obs.longitude,
      chlorophyll: obs.chlorophyll,
      label: `${obs.chlorophyll} mg/m³`,
      color: obs.chlorophyll > 2.2 ? '#10b981' : obs.chlorophyll > 1.4 ? '#14b8a6' : '#64748b',
      intensity: Math.min(1.0, obs.chlorophyll / 3.0)
    }));

    // 3. Potential Fishing Zones (PFZs)
    const fishingZonesLayer = zones.map(z => ({
      id: z._id || z.name,
      name: z.name,
      regionId: z.regionId,
      latitude: z.center?.latitude || z.coordinates?.[1],
      longitude: z.center?.longitude || z.coordinates?.[0],
      suitability: z.suitability,
      confidence: z.confidence,
      radiusMeters: (z.radiusKm || 12) * 1000,
      indicators: z.indicators,
      reasoning: z.reasoning,
      targetSpecies: z.targetSpecies || ['Tuna', 'Mackerel', 'Sardine']
    }));

    // 4. Marine Risk Zones (Derived from high wave/wind hotspots)
    const riskZonesLayer = COASTAL_REGIONS.map(r => {
      const isHighSwell = r.baseline.waveHeight >= 1.5;
      const isHighWind = r.baseline.windSpeed >= 20.0;
      let level = 'LOW';
      if (isHighSwell && isHighWind) level = 'HIGH';
      else if (isHighSwell || isHighWind) level = 'MODERATE';

      return {
        id: `risk-${r.id}`,
        name: `${r.name} Danger Sector`,
        latitude: r.center.latitude + 0.1,
        longitude: r.center.longitude - 0.15,
        riskLevel: level,
        waveHeight: r.baseline.waveHeight,
        windSpeed: r.baseline.windSpeed,
        color: level === 'HIGH' ? '#ef4444' : level === 'MODERATE' ? '#f59e0b' : '#10b981',
        radiusMeters: 18000,
        warning: level !== 'LOW' ? `Elevated swell (${r.baseline.waveHeight}m) and wind chop.` : 'Benign sea conditions.'
      };
    });

    // 5. Weather Vectors Layer
    const weatherLayer = COASTAL_REGIONS.map(r => ({
      id: `wx-${r.id}`,
      name: r.name,
      latitude: r.center.latitude,
      longitude: r.center.longitude,
      windSpeed: r.baseline.windSpeed,
      windDirection: r.baseline.windDirection,
      condition: r.baseline.condition,
      temperature: r.baseline.sst + 1.2
    }));

    // 6. Wave Height Layer
    const waveLayer = observations.map(obs => ({
      id: `wave-${obs._id || obs.location}`,
      latitude: obs.latitude,
      longitude: obs.longitude,
      waveHeight: obs.waveHeight,
      label: `${obs.waveHeight} m`,
      severity: obs.waveHeight >= 2.0 ? 'HIGH' : obs.waveHeight >= 1.2 ? 'MODERATE' : 'LOW'
    }));

    // 7. Tide Stations Layer
    const tideLayer = COASTAL_REGIONS.map(r => ({
      id: `tide-${r.id}`,
      name: `${r.name} Tide Gauge`,
      latitude: r.center.latitude - 0.05,
      longitude: r.center.longitude + 0.05,
      status: r.baseline.tide
    }));

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      mode: 'DEMO',
      layers: {
        sst: sstLayer,
        chlorophyll: chlorophyllLayer,
        fishingZones: fishingZonesLayer,
        riskZones: riskZonesLayer,
        weather: weatherLayer,
        waveHeight: waveLayer,
        tide: tideLayer
      },
      regions: COASTAL_REGIONS.map(r => ({
        id: r.id,
        name: r.name,
        state: r.state,
        sea: r.sea,
        center: r.center
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMapLayers
};
