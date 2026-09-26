/**
 * ORCA Deterministic Risk Engine Configuration
 * Configurable weights and safety thresholds
 */

module.exports = {
  // Relative factor weights (summing to 1.0)
  weights: {
    waveWeight: 0.35,
    windWeight: 0.25,
    weatherWeight: 0.20,
    alertWeight: 0.15,
    geofenceWeight: 0.05
  },

  // Scoring thresholds (0 - 100)
  thresholds: {
    highRisk: 55,
    moderateRisk: 25
  },

  // Wave height hazard scales (meters)
  waveScale: {
    extreme: 2.8,   // 40 pts
    rough: 1.8,     // 25 pts
    moderate: 1.2,  // 12 pts
    calm: 0.0       // 4 pts
  },

  // Wind speed hazard scales (km/h)
  windScale: {
    gale: 35.0,     // 35 pts
    fresh: 24.0,    // 22 pts
    moderate: 15.0, // 10 pts
    light: 0.0      // 3 pts
  },

  // Visibility hazard scales (km)
  visibilityScale: {
    fog: 3.0,       // 15 pts
    mist: 6.0       // 8 pts
  }
};
