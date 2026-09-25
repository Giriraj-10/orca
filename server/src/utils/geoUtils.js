/**
 * Geospatial utility functions for marine computations
 */

// Convert degrees to radians
function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

// Convert radians to degrees
function toDeg(radians) {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate Haversine distance between two coordinates in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Calculate bearing/direction in degrees from point 1 to point 2
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const brng = toDeg(Math.atan2(y, x));
  return Math.round((brng + 360) % 360);
}

/**
 * Calculate destination point given distance (km) and bearing (degrees)
 */
function calculateDestination(lat, lon, distanceKm, bearingDeg) {
  const R = 6371;
  const d = distanceKm / R;
  const brng = toRad(bearingDeg);
  const lat1 = toRad(lat);
  const lon1 = toRad(lon);

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng));
  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );

  return {
    latitude: Number(toDeg(lat2).toFixed(4)),
    longitude: Number(toDeg(lon2).toFixed(4))
  };
}

/**
 * Find nearest location from list of candidates
 */
function findNearest(lat, lon, locations) {
  if (!locations || locations.length === 0) return null;
  let nearest = null;
  let minDistance = Infinity;

  for (const loc of locations) {
    const locLat = loc.latitude || loc.lat || (loc.center && loc.center.latitude);
    const locLon = loc.longitude || loc.lng || (loc.center && loc.center.longitude);
    if (locLat == null || locLon == null) continue;

    const dist = calculateDistance(lat, lon, locLat, locLon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...loc, distanceKm: dist };
    }
  }

  return nearest;
}

module.exports = {
  calculateDistance,
  calculateBearing,
  calculateDestination,
  findNearest
};
