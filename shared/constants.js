// Shared constants for ORCA system
module.exports = {
  USER_ROLES: {
    FISHERMAN: 'Fisherman',
    RESEARCHER: 'Researcher',
    AUTHORITY: 'Authority',
    ADMINISTRATOR: 'Administrator'
  },
  DATA_MODES: {
    DEMO: 'DEMO',
    LIVE: 'LIVE'
  },
  RISK_LEVELS: {
    LOW: 'LOW',
    MODERATE: 'MODERATE',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  },
  SUITABILITY_LEVELS: {
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW'
  },
  INTENTS: {
    FISHING_ZONE: 'FISHING_ZONE',
    SAFETY: 'SAFETY',
    WEATHER: 'WEATHER',
    OCEAN_CONDITION: 'OCEAN_CONDITION',
    SST: 'SST',
    CHLOROPHYLL: 'CHLOROPHYLL',
    RISK: 'RISK',
    MAP_QUERY: 'MAP_QUERY',
    LOCATION_COMPARISON: 'LOCATION_COMPARISON',
    GENERAL_MARINE: 'GENERAL_MARINE',
    UNKNOWN: 'UNKNOWN'
  },
  COASTAL_REGIONS: [
    { id: 'mumbai', name: 'Mumbai Coast', state: 'Maharashtra', lat: 18.922, lng: 72.8347, sea: 'Arabian Sea' },
    { id: 'goa', name: 'Goa Coast', state: 'Goa', lat: 15.4989, lng: 73.8278, sea: 'Arabian Sea' },
    { id: 'kochi', name: 'Kochi Offshore', state: 'Kerala', lat: 9.9312, lng: 76.2673, sea: 'Arabian Sea' },
    { id: 'chennai', name: 'Chennai Coast', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, sea: 'Bay of Bengal' },
    { id: 'vizag', name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, sea: 'Bay of Bengal' },
    { id: 'odisha', name: 'Odisha Coast (Puri/Paradip)', state: 'Odisha', lat: 19.8135, lng: 85.8312, sea: 'Bay of Bengal' },
    { id: 'gujarat', name: 'Gujarat Coast (Veraval)', state: 'Gujarat', lat: 20.9077, lng: 70.3667, sea: 'Arabian Sea' },
    { id: 'andaman', name: 'Andaman & Nicobar (Port Blair)', state: 'Andaman', lat: 11.6234, lng: 92.7265, sea: 'Andaman Sea' }
  ],
  SAFETY_DISCLAIMER: 'ORCA is a research and decision-support prototype. Marine conditions and fishing suitability estimates are generated from available datasets and model logic. They should not be treated as official navigation, weather, fisheries or safety advisories.'
};
