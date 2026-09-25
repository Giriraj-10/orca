const weatherAgent = require('./weatherAgent');
const oceanAgent = require('./oceanAgent');
const earthObservationAgent = require('./earthObservationAgent');
const fishingZoneAgent = require('./fishingZoneAgent');
const geospatialAgent = require('./geospatialAgent');
const riskAgent = require('./riskAgent');
const evidenceAgent = require('./evidenceAgent');
const { AIProviderFactory } = require('../providers/AIProvider');
const env = require('../config/env');
const logger = require('../utils/logger');

class CoordinatorAgent {
  constructor() {
    this.name = 'Coordinator Agent';
    this.role = 'Multi-Agent Orchestrator & Reasoning Synthesizer';
    this.aiProvider = AIProviderFactory.getProvider();
  }

  async processQuery({ query, latitude = 18.922, longitude = 72.8347, user = null }) {
    const overallStartTime = Date.now();
    logger.agent(this.name, `Initiating orchestration for query: "${query}" at [${latitude}, ${longitude}]`);

    const executionLog = [];
    const recordStep = (stepName, status = 'completed', details = {}) => {
      executionLog.push({
        step: stepName,
        status,
        timestamp: new Date().toISOString(),
        ...details
      });
    };

    // Step 1: Understand query and classify intent
    recordStep('Query Understanding', 'in-progress');
    const classification = await this.aiProvider.classifyIntent(query);
    const intent = classification.intent;
    recordStep('Intent Classification', 'completed', { intent, confidence: classification.confidence });

    // Step 2: Geospatial Resolution
    recordStep('Geospatial Agent', 'in-progress');
    const geoResult = await geospatialAgent.execute(latitude, longitude, query);
    recordStep('Geospatial Agent', geoResult.success ? 'completed' : 'failed', {
      latencyMs: geoResult.latencyMs,
      resolvedLocation: geoResult.data?.resolvedLocation
    });

    const targetCoords = geoResult.data?.targetCoordinates || { latitude, longitude };
    const locName = geoResult.data?.resolvedLocation || 'Selected Coastal Sector';

    // Step 3: Determine which specialized agents to invoke based on intent
    const runAll = ['FISHING_ZONE', 'SAFETY', 'GENERAL_MARINE', 'LOCATION_COMPARISON'].includes(intent);
    const needWeather = runAll || ['WEATHER', 'SAFETY', 'RISK'].includes(intent);
    const needOcean = runAll || ['OCEAN_CONDITION', 'SST', 'SAFETY', 'RISK'].includes(intent);
    const needEO = runAll || ['CHLOROPHYLL', 'SST', 'FISHING_ZONE'].includes(intent);
    const needFishing = runAll || ['FISHING_ZONE'].includes(intent);
    const needRisk = runAll || ['SAFETY', 'RISK'].includes(intent);

    // Step 4: Run independent domain agents in parallel
    const agentPromises = {};

    if (needWeather) {
      recordStep('Weather Agent', 'in-progress');
      agentPromises.weather = weatherAgent.execute(targetCoords.latitude, targetCoords.longitude);
    }
    if (needOcean) {
      recordStep('Ocean Agent', 'in-progress');
      agentPromises.ocean = oceanAgent.execute(targetCoords.latitude, targetCoords.longitude);
    }
    if (needEO) {
      recordStep('Earth Observation Agent', 'in-progress');
      agentPromises.eo = earthObservationAgent.execute(targetCoords.latitude, targetCoords.longitude);
    }

    const resolvedIndependent = await Promise.all([
      agentPromises.weather || Promise.resolve(null),
      agentPromises.ocean || Promise.resolve(null),
      agentPromises.eo || Promise.resolve(null)
    ]);

    const weatherResult = resolvedIndependent[0];
    const oceanResult = resolvedIndependent[1];
    const eoResult = resolvedIndependent[2];

    if (weatherResult) recordStep('Weather Agent', 'completed', { latencyMs: weatherResult.latencyMs });
    if (oceanResult) recordStep('Ocean Agent', 'completed', { latencyMs: oceanResult.latencyMs });
    if (eoResult) recordStep('Earth Observation Agent', 'completed', { latencyMs: eoResult.latencyMs });

    // Step 5: Run dependent downstream agents (Fishing Zone & Risk)
    let fishingResult = null;
    let riskResult = null;

    if (needFishing) {
      recordStep('Fishing Zone Agent', 'in-progress');
      fishingResult = await fishingZoneAgent.execute(
        targetCoords.latitude,
        targetCoords.longitude,
        weatherResult?.data,
        oceanResult?.data,
        eoResult?.data
      );
      recordStep('Fishing Zone Agent', 'completed', { latencyMs: fishingResult.latencyMs });
    }

    if (needRisk) {
      recordStep('Risk Agent', 'in-progress');
      riskResult = await riskAgent.execute(weatherResult?.data, oceanResult?.data);
      recordStep('Risk Agent', 'completed', { latencyMs: riskResult.latencyMs });
    }

    // Step 6: Evidence Fusion
    recordStep('Evidence Agent', 'in-progress');
    const evidenceResult = await evidenceAgent.execute({
      weather: weatherResult,
      ocean: oceanResult,
      eo: eoResult,
      fishing: fishingResult,
      risk: riskResult
    });
    recordStep('Evidence Agent', 'completed', {
      latencyMs: evidenceResult.latencyMs,
      evidencePointsCount: evidenceResult.data.length
    });

    // Step 7: Combine context for LLM / Reasoning generation
    recordStep('Reasoning Synthesis', 'in-progress');
    const reasoningContext = {
      query,
      intent,
      location: { name: locName, coordinates: targetCoords },
      weather: weatherResult?.data,
      ocean: oceanResult?.data,
      eo: eoResult?.data,
      fishing: fishingResult?.data,
      risk: riskResult?.data
    };

    const aiResponse = await this.aiProvider.generateReasoning(query, reasoningContext);
    recordStep('Reasoning Synthesis', 'completed');

    // Compile candidate map locations
    const locations = [];
    if (fishingResult?.data?.candidateZones) {
      fishingResult.data.candidateZones.forEach(z => {
        locations.push({
          id: z.id,
          name: z.name,
          latitude: z.coordinates.latitude,
          longitude: z.coordinates.longitude,
          distanceKm: z.distanceKm,
          suitability: z.suitability,
          confidence: z.confidence,
          indicators: z.indicators,
          reason: z.reason
        });
      });
    }

    // Compile audit list of all contributing agents
    const agentsUsed = [
      { name: 'Coordinator Agent', role: this.role, status: 'Completed', latencyMs: Date.now() - overallStartTime },
      { name: 'Geospatial Agent', role: geospatialAgent.role, status: 'Completed', latencyMs: geoResult.latencyMs || 10 },
      ...(weatherResult ? [{ name: 'Weather Agent', role: weatherAgent.role, status: 'Completed', latencyMs: weatherResult.latencyMs }] : []),
      ...(oceanResult ? [{ name: 'Ocean Agent', role: oceanAgent.role, status: 'Completed', latencyMs: oceanResult.latencyMs }] : []),
      ...(eoResult ? [{ name: 'Earth Observation Agent', role: earthObservationAgent.role, status: 'Completed', latencyMs: eoResult.latencyMs }] : []),
      ...(fishingResult ? [{ name: 'Fishing Zone Agent', role: fishingZoneAgent.role, status: 'Completed', latencyMs: fishingResult.latencyMs }] : []),
      ...(riskResult ? [{ name: 'Risk Agent', role: riskAgent.role, status: 'Completed', latencyMs: riskResult.latencyMs }] : []),
      { name: 'Evidence Agent', role: evidenceAgent.role, status: 'Completed', latencyMs: evidenceResult.latencyMs || 5 }
    ];

    const overallConfidence = fishingResult?.data?.overallConfidence || classification.confidence || 0.86;
    const confidenceLevel = overallConfidence >= 0.85 ? 'High' : overallConfidence >= 0.7 ? 'Medium' : 'Low';
    const riskLevel = riskResult?.data?.riskLevel || 'LOW';

    logger.agent(this.name, `Orchestration complete in ${Date.now() - overallStartTime}ms. Intent: ${intent}`);

    return {
      answer: aiResponse.answer,
      intent: intent,
      confidence: overallConfidence,
      confidenceLevel: confidenceLevel,
      riskLevel: riskLevel,
      riskData: riskResult?.data || null,
      recommendations: aiResponse.recommendations || [],
      locations: locations,
      targetLocation: { name: locName, coordinates: targetCoords },
      evidence: evidenceResult.data || [],
      agentsUsed: agentsUsed,
      executionSteps: executionLog,
      dataMode: env.DATA_MODE,
      provider: aiResponse.provider,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new CoordinatorAgent();
