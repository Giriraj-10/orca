/**
 * Coastal Regions of India with realistic marine baselines and bounds
 */

const COASTAL_REGIONS = [
  {
    id: 'mumbai',
    name: 'Mumbai Offshore',
    state: 'Maharashtra',
    sea: 'Arabian Sea',
    center: { latitude: 18.922, longitude: 72.8347 },
    bounds: {
      minLat: 18.6,
      maxLat: 19.3,
      minLng: 72.4,
      maxLng: 73.0
    },
    baseline: {
      sst: 27.6,
      chlorophyll: 1.85,
      waveHeight: 1.1,
      currentSpeed: 0.45,
      tide: 'Ebb Tide (+0.8m)',
      windSpeed: 14.5,
      windDirection: 'WSW',
      precipitation: 0.0,
      visibility: 9.5,
      condition: 'Partly Cloudy'
    },
    fishingHotspots: [
      { name: 'Bombay High Marine Belt', offsetKm: 18, bearing: 275, suitability: 'HIGH', confidence: 0.88 },
      { name: 'Alibag Offshore Ridge', offsetKm: 24, bearing: 210, suitability: 'HIGH', confidence: 0.84 },
      { name: 'Vasai Shallow Banks', offsetKm: 28, bearing: 330, suitability: 'MEDIUM', confidence: 0.76 }
    ]
  },
  {
    id: 'goa',
    name: 'Goa Coastal Waters',
    state: 'Goa',
    sea: 'Arabian Sea',
    center: { latitude: 15.4989, longitude: 73.8278 },
    bounds: {
      minLat: 15.1,
      maxLat: 15.8,
      minLng: 73.4,
      maxLng: 74.0
    },
    baseline: {
      sst: 28.4,
      chlorophyll: 2.15,
      waveHeight: 0.9,
      currentSpeed: 0.38,
      tide: 'Flood Tide (+1.2m)',
      windSpeed: 11.0,
      windDirection: 'SW',
      precipitation: 0.0,
      visibility: 10.0,
      condition: 'Clear Sea'
    },
    fishingHotspots: [
      { name: 'Mormugao Shelf Front', offsetKm: 15, bearing: 260, suitability: 'HIGH', confidence: 0.91 },
      { name: 'Aguada Bay Confluence', offsetKm: 12, bearing: 290, suitability: 'HIGH', confidence: 0.86 },
      { name: 'Cabo de Rama Trench Edge', offsetKm: 22, bearing: 215, suitability: 'MEDIUM', confidence: 0.79 }
    ]
  },
  {
    id: 'kochi',
    name: 'Kochi & Malabar Shelf',
    state: 'Kerala',
    sea: 'Arabian Sea',
    center: { latitude: 9.9312, longitude: 76.2673 },
    bounds: {
      minLat: 9.5,
      maxLat: 10.3,
      minLng: 75.8,
      maxLng: 76.5
    },
    baseline: {
      sst: 29.1,
      chlorophyll: 2.85, // High upwelling zone
      waveHeight: 1.3,
      currentSpeed: 0.55,
      tide: 'Slack Water (+0.5m)',
      windSpeed: 16.0,
      windDirection: 'WNW',
      precipitation: 1.2,
      visibility: 8.5,
      condition: 'Scattered Showers'
    },
    fishingHotspots: [
      { name: 'Vypin Coastal Upwelling', offsetKm: 14, bearing: 285, suitability: 'HIGH', confidence: 0.92 },
      { name: 'Fort Kochi Bank', offsetKm: 10, bearing: 250, suitability: 'HIGH', confidence: 0.89 },
      { name: 'Alappuzha Mud Bank Sector', offsetKm: 32, bearing: 180, suitability: 'HIGH', confidence: 0.85 }
    ]
  },
  {
    id: 'chennai',
    name: 'Chennai Coromandel Coast',
    state: 'Tamil Nadu',
    sea: 'Bay of Bengal',
    center: { latitude: 13.0827, longitude: 80.2707 },
    bounds: {
      minLat: 12.7,
      maxLat: 13.4,
      minLng: 80.1,
      maxLng: 80.7
    },
    baseline: {
      sst: 28.8,
      chlorophyll: 1.45,
      waveHeight: 1.4,
      currentSpeed: 0.62,
      tide: 'Flood Tide (+0.9m)',
      windSpeed: 18.5,
      windDirection: 'ESE',
      precipitation: 0.0,
      visibility: 10.0,
      condition: 'Breezy & Sunny'
    },
    fishingHotspots: [
      { name: 'Ennore Thermal Plume Zone', offsetKm: 16, bearing: 30, suitability: 'MEDIUM', confidence: 0.81 },
      { name: 'Marina Deep Shelf Drop-off', offsetKm: 19, bearing: 105, suitability: 'HIGH', confidence: 0.85 },
      { name: 'Kovalam Submarine Canyon', offsetKm: 25, bearing: 140, suitability: 'MEDIUM', confidence: 0.78 }
    ]
  },
  {
    id: 'vizag',
    name: 'Visakhapatnam Deep Coast',
    state: 'Andhra Pradesh',
    sea: 'Bay of Bengal',
    center: { latitude: 17.6868, longitude: 83.2185 },
    bounds: {
      minLat: 17.3,
      maxLat: 18.0,
      minLng: 83.1,
      maxLng: 83.7
    },
    baseline: {
      sst: 28.2,
      chlorophyll: 1.62,
      waveHeight: 1.2,
      currentSpeed: 0.48,
      tide: 'High Tide (+1.4m)',
      windSpeed: 15.0,
      windDirection: 'SE',
      precipitation: 0.0,
      visibility: 11.0,
      condition: 'Clear Waters'
    },
    fishingHotspots: [
      { name: 'Dolphin’s Nose Deep Trench', offsetKm: 13, bearing: 115, suitability: 'HIGH', confidence: 0.88 },
      { name: 'Bheemunipatnam Pelagic Zone', offsetKm: 22, bearing: 60, suitability: 'HIGH', confidence: 0.83 },
      { name: 'Gangavaram Coastal Drift', offsetKm: 17, bearing: 195, suitability: 'MEDIUM', confidence: 0.74 }
    ]
  },
  {
    id: 'odisha',
    name: 'Odisha Coast (Puri & Paradip)',
    state: 'Odisha',
    sea: 'Bay of Bengal',
    center: { latitude: 19.8135, longitude: 85.8312 },
    bounds: {
      minLat: 19.4,
      maxLat: 20.3,
      minLng: 85.5,
      maxLng: 86.8
    },
    baseline: {
      sst: 27.9,
      chlorophyll: 2.35, // Nutrient rich Chilika-Mahanadi outflow
      waveHeight: 1.6,
      currentSpeed: 0.58,
      tide: 'Ebb Tide (+1.1m)',
      windSpeed: 21.0,
      windDirection: 'NE',
      precipitation: 0.4,
      visibility: 8.0,
      condition: 'Rough Swell'
    },
    fishingHotspots: [
      { name: 'Chilika Mouth Nutrient Front', offsetKm: 18, bearing: 220, suitability: 'HIGH', confidence: 0.90 },
      { name: 'Paradip Port Offshore Bank', offsetKm: 26, bearing: 85, suitability: 'MEDIUM', confidence: 0.77 },
      { name: 'Gahirmatha Outer Margin (Permitted Sector)', offsetKm: 34, bearing: 65, suitability: 'LOW', confidence: 0.85 }
    ]
  },
  {
    id: 'gujarat',
    name: 'Gujarat Coast (Veraval & Porbandar)',
    state: 'Gujarat',
    sea: 'Arabian Sea',
    center: { latitude: 20.9077, longitude: 70.3667 },
    bounds: {
      minLat: 20.4,
      maxLat: 21.4,
      minLng: 69.8,
      maxLng: 70.8
    },
    baseline: {
      sst: 26.5,
      chlorophyll: 2.65, // Highly productive fisheries zone
      waveHeight: 1.0,
      currentSpeed: 0.52,
      tide: 'Spring Tide (+2.1m)',
      windSpeed: 17.5,
      windDirection: 'NW',
      precipitation: 0.0,
      visibility: 10.0,
      condition: 'Fair Sea'
    },
    fishingHotspots: [
      { name: 'Veraval Bank Prime Pelagic', offsetKm: 16, bearing: 190, suitability: 'HIGH', confidence: 0.93 },
      { name: 'Somnath Submarine Bank', offsetKm: 14, bearing: 155, suitability: 'HIGH', confidence: 0.89 },
      { name: 'Porbandar Coastal Convergence', offsetKm: 30, bearing: 305, suitability: 'HIGH', confidence: 0.87 }
    ]
  },
  {
    id: 'andaman',
    name: 'Andaman & Nicobar (Port Blair)',
    state: 'Andaman & Nicobar',
    sea: 'Andaman Sea',
    center: { latitude: 11.6234, longitude: 92.7265 },
    bounds: {
      minLat: 11.2,
      maxLat: 12.0,
      minLng: 92.4,
      maxLng: 93.1
    },
    baseline: {
      sst: 29.8,
      chlorophyll: 0.95, // Oceanic oligotrophic / coral reef waters
      waveHeight: 1.5,
      currentSpeed: 0.42,
      tide: 'Flood Tide (+1.0m)',
      windSpeed: 19.0,
      windDirection: 'SSW',
      precipitation: 2.5,
      visibility: 9.0,
      condition: 'Tropical Squalls'
    },
    fishingHotspots: [
      { name: 'Cinque Island Trench', offsetKm: 21, bearing: 185, suitability: 'HIGH', confidence: 0.84 },
      { name: 'Havelock Deep Oceanic Pass', offsetKm: 27, bearing: 45, suitability: 'HIGH', confidence: 0.87 },
      { name: 'Rutland Shoal Margin', offsetKm: 18, bearing: 210, suitability: 'MEDIUM', confidence: 0.75 }
    ]
  }
];

module.exports = COASTAL_REGIONS;
