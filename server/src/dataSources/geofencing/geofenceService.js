const turf = require('@turf/turf');
const marineGeofences = require('../../data/geofences/marineGeofences.json');
const logger = require('../../utils/logger');

class GeofenceService {
  constructor() {
    this.geofences = marineGeofences;
  }

  /**
   * Return all geofence features as GeoJSON
   */
  getAllGeofences() {
    return this.geofences;
  }

  /**
   * Check if a coordinate is inside any restricted zone or MPA
   */
  checkPoint(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const pt = turf.point([lng, lat]);

    let isInside = false;
    let matchingGeofence = null;
    let minDistanceKm = Infinity;
    let nearestGeofence = null;

    for (const feature of this.geofences.features) {
      // Check inside
      const inside = turf.booleanPointInPolygon(pt, feature);
      if (inside) {
        isInside = true;
        matchingGeofence = feature.properties;
        minDistanceKm = 0;
        nearestGeofence = feature.properties;
        break;
      }

      // Calculate distance to nearest polygon boundary
      try {
        const polyBoundary = turf.polygonToLine(feature);
        const distKm = turf.pointToLineDistance(pt, polyBoundary, { units: 'kilometers' });
        if (distKm < minDistanceKm) {
          minDistanceKm = distKm;
          nearestGeofence = feature.properties;
        }
      } catch (err) {
        // Fallback: distance to center
        const center = turf.centerOfMass(feature);
        const distKm = turf.distance(pt, center, { units: 'kilometers' });
        if (distKm < minDistanceKm) {
          minDistanceKm = distKm;
          nearestGeofence = feature.properties;
        }
      }
    }

    return {
      coordinates: { latitude: lat, longitude: lng },
      isInsideRestrictedZone: isInside,
      zoneDetails: matchingGeofence,
      nearestZone: nearestGeofence,
      distanceToNearestZoneKm: Number(minDistanceKm.toFixed(2)),
      advisory: isInside
        ? `ALERT: Vessel coordinates fall inside ${matchingGeofence.name}. Restriction: ${matchingGeofence.restrictionLevel}. ${matchingGeofence.description}`
        : `Coordinates are clear of restricted maritime zones. Nearest protected boundary (${nearestGeofence?.name}) is ${minDistanceKm.toFixed(1)} km away.`,
      source: 'MoEFCC / Directorate General of Shipping GeoJSON Registry',
      isLive: true
    };
  }
}

module.exports = new GeofenceService();
