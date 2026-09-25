const logger = require('../utils/logger');

class RiskAgent {
  constructor() {
    this.name = 'Risk Agent';
    this.role = 'Marine Hazard & Seaworthiness Risk Assessment';
  }

  evaluateRisk(weatherData, oceanData) {
    const windSpeed = weatherData?.windSpeed || 14;
    const waveHeight = oceanData?.waveHeight || 1.1;
    const visibility = weatherData?.visibility || 10;
    const precipitation = weatherData?.precipitation || 0;

    let waveRiskScore = 0;
    let windRiskScore = 0;
    let visRiskScore = 0;
    let weatherRiskScore = 0;

    // Wave assessment
    if (waveHeight >= 2.8) waveRiskScore = 40;
    else if (waveHeight >= 1.8) waveRiskScore = 25;
    else if (waveHeight >= 1.2) waveRiskScore = 12;
    else waveRiskScore = 4;

    // Wind assessment
    if (windSpeed >= 35) windRiskScore = 35;
    else if (windSpeed >= 24) windRiskScore = 22;
    else if (windSpeed >= 15) windRiskScore = 10;
    else windRiskScore = 3;

    // Visibility
    if (visibility < 3.0) visRiskScore = 15;
    else if (visibility < 6.0) visRiskScore = 8;
    else visRiskScore = 0;

    // Weather/squall
    if (precipitation > 5.0) weatherRiskScore = 10;
    else if (precipitation > 0.5) weatherRiskScore = 4;

    const totalScore = waveRiskScore + windRiskScore + visRiskScore + weatherRiskScore;

    let riskLevel = 'LOW';
    if (totalScore >= 55) riskLevel = 'HIGH';
    else if (totalScore >= 25) riskLevel = 'MODERATE';
    else riskLevel = 'LOW';

    const reasons = [];
    if (waveRiskScore >= 25) reasons.push(`Elevated wave height (${waveHeight} m) may induce severe vessel pitching`);
    if (windRiskScore >= 22) reasons.push(`Brisk surface wind (${windSpeed} km/h) can cause rapid chop and drift`);
    if (visRiskScore >= 8) reasons.push(`Reduced visibility (${visibility} km) requires radar watch`);
    if (precipitation > 2.0) reasons.push(`Squall conditions with active precipitation (${precipitation} mm/h)`);
    if (reasons.length === 0) reasons.push(`Benign hydrodynamic and meteorological parameters across the sector`);

    const recommendations = [];
    if (riskLevel === 'HIGH') {
      recommendations.push('Strongly advise small crafts and artisanal canoes to remain in port');
      recommendations.push('Commercial vessels should secure loose deck equipment and maintain continuous VHF watch');
      recommendations.push('Avoid navigating through shallow coastal inlets where breaking waves are amplified');
    } else if (riskLevel === 'MODERATE') {
      recommendations.push('Caution recommended for smaller traditional fishing boats (< 9m length)');
      recommendations.push('Verify bilge pumps, backup communication, and lifejackets on all crew members');
      recommendations.push('Track afternoon wind gusts and swell shifts before straying beyond 15 nautical miles');
    } else {
      recommendations.push('Conditions generally favorable for coastal navigation and artisanal fishing operations');
      recommendations.push('Standard navigational watch and adherence to harbor egress protocols recommended');
    }

    return {
      riskLevel,
      overallScore: totalScore,
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
        }
      },
      explanation: reasons.join('; ') + '.',
      safetyRecommendations: recommendations,
      disclaimer: 'ORCA risk assessment is an informational prototype and not a substitute for official marine safety advisories.'
    };
  }

  async execute(weatherData, oceanData) {
    const startTime = Date.now();
    logger.agent(this.name, 'Synthesizing composite maritime risk model');

    try {
      const evaluation = this.evaluateRisk(weatherData, oceanData);
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
