const riskConfig = require('../config/riskConfig');
const toolRegistry = require('../tools/ToolRegistry');
const logger = require('../utils/logger');

/**
 * Deterministic Seaworthiness & Risk Engine
 * Computes safety score from live physical observations, active alerts, and geofence status
 */
class RiskAgent {
  constructor() {
    this.name = 'Risk Agent';
    this.role = 'Maritime Hazard & Seaworthiness Risk Assessment';
  }

  evaluateRisk(weatherData, oceanData, geofenceData = null, alertData = null) {
    const windSpeed = weatherData?.windSpeed || 14;
    const waveHeight = oceanData?.waveHeight || 1.1;
    const visibility = weatherData?.visibility || 10;
    const precipitation = weatherData?.precipitation || 0;

    let waveRiskScore = 0;
    let windRiskScore = 0;
    let visRiskScore = 0;
    let weatherRiskScore = 0;
    let geofenceRiskScore = 0;
    let alertRiskScore = 0;

    // 1. Wave assessment (Max 40)
    if (waveHeight >= riskConfig.waveScale.extreme) waveRiskScore = 40;
    else if (waveHeight >= riskConfig.waveScale.rough) waveRiskScore = 25;
    else if (waveHeight >= riskConfig.waveScale.moderate) waveRiskScore = 12;
    else waveRiskScore = 4;

    // 2. Wind assessment (Max 35)
    if (windSpeed >= riskConfig.windScale.gale) windRiskScore = 35;
    else if (windSpeed >= riskConfig.windScale.fresh) windRiskScore = 22;
    else if (windSpeed >= riskConfig.windScale.moderate) windRiskScore = 10;
    else windRiskScore = 3;

    // 3. Visibility assessment (Max 15)
    if (visibility < riskConfig.visibilityScale.fog) visRiskScore = 15;
    else if (visibility < riskConfig.visibilityScale.mist) visRiskScore = 8;
    else visRiskScore = 0;

    // 4. Convective squall / weather assessment (Max 10)
    if (precipitation > 5.0) weatherRiskScore = 10;
    else if (precipitation > 0.5) weatherRiskScore = 4;

    // 5. Geofence penalty
    if (geofenceData && geofenceData.isInsideRestrictedZone) {
      geofenceRiskScore = 20;
    } else if (geofenceData && geofenceData.distanceToNearestZoneKm < 2.0) {
      geofenceRiskScore = 10;
    }

    // 6. Active Alerts penalty
    if (alertData && Array.isArray(alertData.alerts)) {
      const hasHighAlert = alertData.alerts.some(a => a.severity === 'HIGH');
      const hasModAlert = alertData.alerts.some(a => a.severity === 'MODERATE');
      if (hasHighAlert) alertRiskScore = 25;
      else if (hasModAlert) alertRiskScore = 12;
    }

    const rawTotal = waveRiskScore + windRiskScore + visRiskScore + weatherRiskScore + geofenceRiskScore + alertRiskScore;
    const compositeScore = Math.min(100, Math.round(rawTotal));

    let riskLevel = 'LOW';
    if (compositeScore >= riskConfig.thresholds.highRisk) riskLevel = 'HIGH';
    else if (compositeScore >= riskConfig.thresholds.moderateRisk) riskLevel = 'MODERATE';

    const reasons = [];
    if (waveRiskScore >= 25) reasons.push(`Elevated wave swell (${waveHeight}m) poses capsizing/swamping hazard`);
    if (windRiskScore >= 22) reasons.push(`Brisk surface wind (${windSpeed} km/h) creates steep coastal chop`);
    if (visRiskScore >= 8) reasons.push(`Reduced visibility (${visibility} km) demands radar watch`);
    if (precipitation > 2.0) reasons.push(`Active precipitation (${precipitation} mm/h) signals convective squalls`);
    if (geofenceRiskScore >= 10) reasons.push(`Proximity or entry into restricted maritime zone (${geofenceData?.zoneDetails?.name || 'Protected Area'})`);
    if (alertRiskScore >= 12) reasons.push('Active coastal hazard bulletins issued for this maritime sector');
    if (reasons.length === 0) reasons.push(`Benign hydrodynamic and meteorological parameters across the sector`);

    const recommendations = [];
    if (riskLevel === 'HIGH') {
      recommendations.push('Strongly advise small artisanal crafts and motorized canoes (<10m) to remain in port');
      recommendations.push('Commercial trawlers must secure deck gear and keep continuous VHF Ch-16 watch');
      recommendations.push('Avoid navigating through shallow coastal sandbars where wave breaking is amplified');
    } else if (riskLevel === 'MODERATE') {
      recommendations.push('Heightened caution recommended for smaller traditional fishing boats');
      recommendations.push('Inspect bilge pumps, lifejackets (PFDs), and emergency flares before sailing');
      recommendations.push('Track afternoon wind gusts and swell shifts before venturing beyond 15 nautical miles');
    } else {
      recommendations.push('Conditions generally favorable for coastal navigation and artisanal fishing operations');
      recommendations.push('Standard navigational watch and harbor egress compliance recommended');
    }

    return {
      riskLevel,
      overallScore: compositeScore,
      subFactors: {
        waveRisk: {
          level: waveRiskScore >= 25 ? 'High' : waveRiskScore >= 12 ? 'Moderate' : 'Low',
          score: waveRiskScore,
          value: `${waveHeight} m`
        },
        windRisk: {
          level: windRiskScore >= 22 ? 'High' : windRiskScore >= 10 ? 'Moderate' : 'Low',
          score: windRiskScore,
          value: `${windSpeed} km/h`
        },
        visibilityRisk: {
          level: visRiskScore >= 8 ? 'Moderate' : 'Low',
          score: visRiskScore,
          value: `${visibility} km`
        },
        weatherRisk: {
          level: weatherRiskScore >= 8 ? 'High' : 'Low',
          score: weatherRiskScore,
          value: weatherData?.condition || 'Fair'
        },
        geofenceRisk: {
          level: geofenceRiskScore >= 15 ? 'High' : geofenceRiskScore >= 10 ? 'Moderate' : 'Low',
          score: geofenceRiskScore,
          value: geofenceData?.isInsideRestrictedZone ? 'INSIDE_RESTRICTED_ZONE' : 'CLEAR'
        }
      },
      explanation: reasons.join('; ') + '.',
      safetyRecommendations: recommendations,
      disclaimer: 'ORCA risk assessment is an informational prototype and not a substitute for official marine safety advisories.'
    };
  }

  async execute(weatherData, oceanData, geofenceData = null, alertData = null) {
    const startTime = Date.now();
    logger.agent(this.name, 'Computing deterministic risk score from live physical parameters');

    try {
      const evaluation = this.evaluateRisk(weatherData, oceanData, geofenceData, alertData);
      const latencyMs = Date.now() - startTime;

      return {
        success: true,
        agent: this.name,
        role: this.role,
        latencyMs,
        data: evaluation
      };
    } catch (err) {
      logger.error(`${this.name} failed: ${err.message}`);
      return {
        success: false,
        agent: this.name,
        role: this.role,
        error: err.message,
        data: null
      };
    }
  }
}

module.exports = new RiskAgent();
