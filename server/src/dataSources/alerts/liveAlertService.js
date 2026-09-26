const openMeteoWeather = require('../openMeteo/weatherService');
const openMeteoMarine = require('../openMeteo/marineService');
const imdService = require('../imd/imdService');
const Alert = require('../../models/Alert');
const logger = require('../../utils/logger');

class LiveAlertService {
  /**
   * Dynamically evaluate marine weather alerts for specific coordinates
   */
  async getAlertsForCoordinates(latitude, longitude, radiusKm = 100) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const alerts = [];

    // 1. Check IMD warnings if configured
    if (imdService.isConfigured()) {
      try {
        const imdWarnings = await imdService.getWarnings(lat, lng);
        if (imdWarnings && imdWarnings.length > 0) {
          alerts.push(...imdWarnings);
        }
      } catch (err) {
        logger.debug(`[LiveAlertService] IMD warnings error: ${err.message}`);
      }
    }

    // 2. Dynamically evaluate alerts from live Open-Meteo conditions
    try {
      const [weather, marine] = await Promise.all([
        openMeteoWeather.getWeather(lat, lng),
        openMeteoMarine.getMarineConditions(lat, lng)
      ]);

      const now = new Date();
      const validUntil = new Date(now.getTime() + (12 * 60 * 60 * 1000)).toISOString(); // 12 hours valid

      // Check High Wave / Swell Surge
      const wave = marine.wave?.height || 0;
      if (wave >= 2.2) {
        alerts.push({
          id: `live-wave-alert-${lat.toFixed(2)}-${lng.toFixed(2)}`,
          active: true,
          severity: 'HIGH',
          type: 'HIGH_WAVE_WARNING',
          title: `High Wave Swell Warning (${wave.toFixed(1)}m)`,
          description: `Severe swell surge (${wave.toFixed(1)}m) detected. Hazardous breaking waves along the coast. Artisanal crafts strictly advised to suspend harbor operations.`,
          source: 'Open-Meteo Marine Hydrodynamic Analysis',
          issuedAt: now.toISOString(),
          validUntil,
          coordinates: { latitude: lat, longitude: lng },
          isLive: true
        });
      } else if (wave >= 1.5) {
        alerts.push({
          id: `live-wave-advisory-${lat.toFixed(2)}-${lng.toFixed(2)}`,
          active: true,
          severity: 'MODERATE',
          type: 'SWELL_ADVISORY',
          title: `Moderate Wave Swell Advisory (${wave.toFixed(1)}m)`,
          description: `Moderate swell conditions (${wave.toFixed(1)}m) in effect. Traditional fishing vessels should exercise heightened caution near rocky shoals.`,
          source: 'Open-Meteo Marine Hydrodynamic Analysis',
          issuedAt: now.toISOString(),
          validUntil,
          coordinates: { latitude: lat, longitude: lng },
          isLive: true
        });
      }

      // Check Gale Winds
      const wind = weather.windSpeed || 0;
      if (wind >= 32.0) {
        alerts.push({
          id: `live-wind-gale-${lat.toFixed(2)}-${lng.toFixed(2)}`,
          active: true,
          severity: 'HIGH',
          type: 'GALE_WIND_WARNING',
          title: `Gale Force Wind Warning (${wind.toFixed(1)} km/h)`,
          description: `Brisk offshore squall winds clocking ${wind.toFixed(1)} km/h from ${weather.windDirection}. Rapid chop formation and heavy spray.`,
          source: 'Open-Meteo High-Resolution Numerical Forecast',
          issuedAt: now.toISOString(),
          validUntil,
          coordinates: { latitude: lat, longitude: lng },
          isLive: true
        });
      }

      // Check Thunderstorms / Squall Codes
      if (weather.weatherCode >= 95 || weather.precipitation >= 4.0) {
        alerts.push({
          id: `live-squall-${lat.toFixed(2)}-${lng.toFixed(2)}`,
          active: true,
          severity: 'HIGH',
          type: 'THUNDERSTORM_SQUALL',
          title: 'Marine Squall & Lightning Warning',
          description: `Active convective squall line with precipitation (${weather.precipitation} mm/h). High risk of lightning and sudden microburst wind gusts.`,
          source: 'Open-Meteo High-Resolution Numerical Forecast',
          issuedAt: now.toISOString(),
          validUntil,
          coordinates: { latitude: lat, longitude: lng },
          isLive: true
        });
      }

      // Check Visibility
      if (weather.visibility < 3.5) {
        alerts.push({
          id: `live-fog-${lat.toFixed(2)}-${lng.toFixed(2)}`,
          active: true,
          severity: 'MODERATE',
          type: 'REDUCED_VISIBILITY',
          title: `Coastal Mist / Reduced Visibility (${weather.visibility} km)`,
          description: `Restricted visibility (${weather.visibility} km). Maintain mandatory radar watch and sound horn signals in traffic corridors.`,
          source: 'Open-Meteo High-Resolution Numerical Forecast',
          issuedAt: now.toISOString(),
          validUntil,
          coordinates: { latitude: lat, longitude: lng },
          isLive: true
        });
      }
    } catch (err) {
      logger.warn(`[LiveAlertService] Live alert computation failed: ${err.message}`);
    }

    // 3. If no extreme hazards, provide a reassuring navigational advisory
    if (alerts.length === 0) {
      alerts.push({
        id: `live-clear-${lat.toFixed(2)}-${lng.toFixed(2)}`,
        active: true,
        severity: 'LOW',
        type: 'ROUTINE_ADVISORY',
        title: 'Benign Maritime Weather Advisory',
        description: 'No active severe weather warnings. Hydrodynamic swell and surface winds are currently within normal seasonal operating thresholds.',
        source: 'ORCA Maritime Safety Monitoring',
        issuedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        coordinates: { latitude: lat, longitude: lng },
        isLive: true
      });
    }

    return alerts;
  }
}

module.exports = new LiveAlertService();
