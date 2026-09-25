const COASTAL_REGIONS = require('./coastalRegions');
const { calculateDestination } = require('../utils/geoUtils');

const getDemoUsers = () => [
  {
    name: 'Captain Rajesh Patil',
    email: 'fisherman@orca.demo',
    password: 'ORCA@123',
    role: 'Fisherman',
    preferredLocation: { name: 'Mumbai Offshore', latitude: 18.922, longitude: 72.8347 }
  },
  {
    name: 'Dr. Priya Varma',
    email: 'researcher@orca.demo',
    password: 'ORCA@123',
    role: 'Researcher',
    preferredLocation: { name: 'Kochi Offshore', latitude: 9.9312, longitude: 76.2673 }
  },
  {
    name: 'Commander K. Nair',
    email: 'authority@orca.demo',
    password: 'ORCA@123',
    role: 'Authority',
    preferredLocation: { name: 'Chennai Coast', latitude: 13.0827, longitude: 80.2707 }
  },
  {
    name: 'ORCA System Admin',
    email: 'admin@orca.demo',
    password: 'ORCA@123',
    role: 'Administrator',
    preferredLocation: { name: 'Mumbai Offshore', latitude: 18.922, longitude: 72.8347 }
  }
];

const generateMarineObservations = () => {
  const observations = [];
  const now = new Date();

  COASTAL_REGIONS.forEach((region) => {
    // Generate 4 spatial grid points per region for rich heatmaps/layers
    const offsets = [
      { km: 0, brg: 0, sstOffset: 0, chlOffset: 0, waveOffset: 0 },
      { km: 15, brg: 270, sstOffset: -0.2, chlOffset: 0.3, waveOffset: 0.1 },
      { km: 25, brg: 230, sstOffset: -0.4, chlOffset: 0.55, waveOffset: 0.2 },
      { km: 35, brg: 310, sstOffset: 0.3, chlOffset: -0.2, waveOffset: -0.1 }
    ];

    offsets.forEach((off, idx) => {
      const dest = off.km === 0
        ? region.center
        : calculateDestination(region.center.latitude, region.center.longitude, off.km, off.brg);

      observations.push({
        location: `${region.name} - Point ${idx + 1}`,
        regionId: region.id,
        latitude: dest.latitude,
        longitude: dest.longitude,
        timestamp: new Date(now.getTime() - idx * 3600000),
        sst: Number((region.baseline.sst + off.sstOffset).toFixed(1)),
        chlorophyll: Math.max(0.2, Number((region.baseline.chlorophyll + off.chlOffset).toFixed(2))),
        waveHeight: Number((region.baseline.waveHeight + off.waveOffset).toFixed(1)),
        currentSpeed: Number((region.baseline.currentSpeed + (idx * 0.05)).toFixed(2)),
        tide: region.baseline.tide,
        source: 'Demo Oceanographic In-Situ & Satellite Blend',
        mode: 'DEMO'
      });
    });
  });

  return observations;
};

const generateWeatherObservations = () => {
  const weatherList = [];
  const now = new Date();

  COASTAL_REGIONS.forEach((region) => {
    weatherList.push({
      location: region.name,
      regionId: region.id,
      latitude: region.center.latitude,
      longitude: region.center.longitude,
      timestamp: now,
      temperature: Number((region.baseline.sst + 1.2).toFixed(1)),
      windSpeed: region.baseline.windSpeed,
      windDirection: region.baseline.windDirection,
      precipitation: region.baseline.precipitation,
      visibility: region.baseline.visibility,
      condition: region.baseline.condition,
      source: 'Demo Coastal High-Res WRF Weather Engine',
      mode: 'DEMO'
    });
  });

  return weatherList;
};

const generateOceanObservations = () => {
  const oceanList = [];
  const now = new Date();

  COASTAL_REGIONS.forEach((region) => {
    oceanList.push({
      location: region.name,
      regionId: region.id,
      latitude: region.center.latitude,
      longitude: region.center.longitude,
      timestamp: now,
      sst: region.baseline.sst,
      waveHeight: region.baseline.waveHeight,
      wavePeriod: 8.5,
      waveDirection: region.sea === 'Arabian Sea' ? 'SW' : 'SE',
      currentSpeed: region.baseline.currentSpeed,
      currentDirection: region.sea === 'Arabian Sea' ? 'SSE' : 'NNE',
      tide: region.baseline.tide,
      salinity: 35.2,
      seaCondition: region.baseline.waveHeight < 1.2 ? 'Calm to Moderate' : 'Rough Swell',
      source: 'Demo Moored Buoy & In-situ Network',
      mode: 'DEMO'
    });
  });

  return oceanList;
};

const generateFishingZones = () => {
  const zones = [];
  const now = new Date();

  COASTAL_REGIONS.forEach((region) => {
    region.fishingHotspots.forEach((spot, idx) => {
      const dest = calculateDestination(region.center.latitude, region.center.longitude, spot.offsetKm, spot.bearing);
      const sst = Number((region.baseline.sst + (idx === 0 ? 0.2 : idx === 1 ? -0.3 : 0.4)).toFixed(1));
      const chlorophyll = Number((region.baseline.chlorophyll + (idx === 0 ? 0.4 : idx === 1 ? 0.1 : -0.2)).toFixed(2));

      zones.push({
        name: spot.name,
        regionId: region.id,
        geometry: {
          type: 'Point',
          coordinates: [dest.longitude, dest.latitude]
        },
        center: {
          latitude: dest.latitude,
          longitude: dest.longitude
        },
        radiusKm: 12,
        suitability: spot.suitability,
        confidence: spot.confidence,
        indicators: {
          sst: sst,
          chlorophyll: chlorophyll,
          waveHeight: region.baseline.waveHeight,
          windSpeed: region.baseline.windSpeed,
          upwellingIndicator: chlorophyll > 1.8 ? 'Strong Upwelling Front' : 'Moderate Front'
        },
        reasoning: `Favorable SST (${sst}°C) coinciding with elevated chlorophyll concentration (${chlorophyll} mg/m³). Satellite telemetry indicates potential aggregation of pelagic species. Prototype suitability estimate.`,
        targetSpecies: ['Mackerel', 'Sardine', 'Tuna', 'Carangids', 'Squid'],
        generatedAt: now,
        mode: 'DEMO'
      });
    });
  });

  return zones;
};

const generateAlerts = () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 3600000);

  return [
    {
      title: 'Moderate Swell Warning — Arabian Sea Central Shelf',
      type: 'WAVE',
      severity: 'MODERATE',
      regionId: 'mumbai',
      regionName: 'Mumbai Coast',
      message: 'Wave heights forecasted up to 1.8m due to prevailing south-westerly swell. Small artisanal non-motorized craft advised to exercise caution.',
      issuedAt: now,
      expiresAt: tomorrow,
      isActive: true,
      advisoryDisclaimer: 'Informational advisory only. Refer to INCOIS & IMD official marine bulletins before sailing.'
    },
    {
      title: 'High Chlorophyll Front — Malabar Upwelling Belt',
      type: 'FISHING_UPDATE',
      severity: 'INFO',
      regionId: 'kochi',
      regionName: 'Kochi Offshore',
      message: 'Strong chlorophyll front (> 2.8 mg/m³) observed 14km West-Northwest of Vypin. High suitability for pelagic shoaling.',
      issuedAt: now,
      expiresAt: tomorrow,
      isActive: true,
      advisoryDisclaimer: 'Prototype fisheries estimation only. Verify local coastal regulation zone limits.'
    },
    {
      title: 'Fresh Breeze & Chop Advisory — Odisha Coast',
      type: 'WIND',
      severity: 'MODERATE',
      regionId: 'odisha',
      regionName: 'Odisha Coast (Puri & Paradip)',
      message: 'Surface wind gusts exceeding 24 km/h from North-East producing choppy coastal seas. Motorized vessels should verify bilge pumps and communication lines.',
      issuedAt: now,
      expiresAt: tomorrow,
      isActive: true,
      advisoryDisclaimer: 'Informational advisory only. Consult official port warnings.'
    },
    {
      title: 'Optimal Marine Conditions — Goa Coastal Waters',
      type: 'SAFETY',
      severity: 'INFO',
      regionId: 'goa',
      regionName: 'Goa Coastal Waters',
      message: 'Smooth sea state (< 0.9m waves) and fair weather across Goa coastal waters. Suitable for routine harvesting and research operations.',
      issuedAt: now,
      expiresAt: tomorrow,
      isActive: true,
      advisoryDisclaimer: 'Advisory disclaimer: prototype model assessment.'
    }
  ];
};

const generateDataSources = () => [
  {
    name: 'Satellite Earth Observation Dataset (OCM-3 / MODIS Aqua)',
    category: 'Earth Observation',
    provider: 'ISRO OCM-3 & NASA Ocean Biology (Simulated Demo Layer)',
    status: 'AVAILABLE',
    mode: 'DEMO',
    updateFrequency: 'Daily (24h revisit cycle)',
    coverage: 'Indian Coastal & EEZ Waters (1km grid resolution)',
    parameters: ['Chlorophyll-a (mg/m³)', 'Thermal Front Gradients', 'Turbidity / KD490'],
    lastSync: new Date(),
    description: 'High-resolution ocean colour radiometry capturing primary productivity and chlorophyll concentrations across shelf zones.'
  },
  {
    name: 'Sea Surface Temperature Gridded Analysis (SST)',
    category: 'Oceanographic',
    provider: 'INCOIS & NOAA Coral Reef Watch Blend (Simulated)',
    status: 'AVAILABLE',
    mode: 'DEMO',
    updateFrequency: 'Hourly updates',
    coverage: 'Pan-Indian Ocean Basin',
    parameters: ['Sea Surface Temperature (°C)', 'SST Anomalies', 'Thermocline Depth'],
    lastSync: new Date(),
    description: 'Blended satellite and in-situ SST products critical for identifying ocean thermal fronts where pelagic fishes congregate.'
  },
  {
    name: 'Coastal Weather & Atmospheric Numerical Model (WRF)',
    category: 'Weather',
    provider: 'IMD & Coastal WRF Mesoscale Model (Simulated)',
    status: 'AVAILABLE',
    mode: 'DEMO',
    updateFrequency: '3-Hourly cycle',
    coverage: 'India West & East Coasts',
    parameters: ['Wind Speed (km/h)', 'Wind Direction', 'Precipitation (mm)', 'Visibility (km)', 'Barometric Pressure'],
    lastSync: new Date(),
    description: 'Synoptic weather forecast models providing surface wind velocity, convective activity, and atmospheric visibility for seaworthiness.'
  },
  {
    name: 'Ocean Wave & Hydrodynamic Mooring Buoy Network',
    category: 'Oceanographic',
    provider: 'National Moored Buoy Programme (INCOIS / NIOT Simulated)',
    status: 'AVAILABLE',
    mode: 'DEMO',
    updateFrequency: 'Real-time (30-minute telemetric)',
    coverage: 'Arabian Sea & Bay of Bengal Buoy Arrays',
    parameters: ['Significant Wave Height (m)', 'Wave Period (s)', 'Current Velocity (m/s)', 'Tidal Elevation'],
    lastSync: new Date(),
    description: 'In-situ sensor moorings measuring wave spectra, surface currents, and water temperature for seaworthiness evaluation.'
  },
  {
    name: 'ORCA Collaborative Multi-Agent Reasoning Engine',
    category: 'AI Reasoning',
    provider: 'ORCA Hybrid Engine (Coordinator + Specialized Domain Agents + Gemini LLM / Fallback)',
    status: 'AVAILABLE',
    mode: 'DEMO',
    updateFrequency: 'Continuous On-Demand',
    coverage: 'All Indexed Coastal Sectors',
    parameters: ['Intent Classification', 'Suitability Estimation', 'Risk Scoring', 'Evidence Fusion'],
    lastSync: new Date(),
    description: 'Collaborative agent orchestrator synthesizing atmospheric, oceanographic, and satellite feeds into actionable marine guidance.'
  }
];

module.exports = {
  getDemoUsers,
  generateMarineObservations,
  generateWeatherObservations,
  generateOceanObservations,
  generateFishingZones,
  generateAlerts,
  generateDataSources
};
