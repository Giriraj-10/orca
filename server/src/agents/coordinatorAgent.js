const weatherAgent = require('./weatherAgent');
const oceanAgent = require('./oceanAgent');
const earthObservationAgent = require('./earthObservationAgent');
const fishingZoneAgent = require('./fishingZoneAgent');
const geospatialAgent = require('./geospatialAgent');
const riskAgent = require('./riskAgent');
const evidenceAgent = require('./evidenceAgent');
const plannerAgent = require('./plannerAgent');
const toolRegistry = require('../tools/ToolRegistry');
const { AIProviderFactory } = require('../providers/AIProvider');
const env = require('../config/env');
const logger = require('../utils/logger');

class CoordinatorAgent {
  constructor() {
    this.name = 'Coordinator Agent';
    this.role = 'Multi-Agent Orchestrator & Reasoning Synthesizer';
    this.aiProvider = AIProviderFactory.getProvider();
  }

  async processQuery({ query, latitude = 18.922, longitude = 72.8347, user = null, targetDate = new Date() }) {
    const overallStartTime = Date.now();
    logger.agent(this.name, `Initiating dynamic API-grounded orchestration for query: "${query}" at [${latitude}, ${longitude}]`);

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

    // Step 2: Geospatial Resolution (Dynamic Geocoding)
    recordStep('Geospatial Agent', 'in-progress');
    const geoResult = await geospatialAgent.execute(latitude, longitude, query);
    recordStep('Geospatial Agent', geoResult.success ? 'completed' : 'failed', {
      latencyMs: geoResult.latencyMs,
      resolvedLocation: geoResult.data?.resolvedLocation
    });

    const targetCoords = geoResult.data?.targetCoordinates || { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    const locName = geoResult.data?.resolvedLocation || 'Target Maritime Sector';

    // Step 3: Planner Agent - Select tools based on intent
    recordStep('Planner Agent', 'in-progress');
    const plannedTools = plannerAgent.planTools(intent, query);
    recordStep('Planner Agent', 'completed', {
      toolsCount: plannedTools.length,
      tools: plannedTools.map(t => t.tool)
    });

    const hasTool = (toolName) => plannedTools.some(t => t.tool === toolName);

    // Step 4: Run independent domain agents in parallel using real tools
    const agentPromises = {};

    if (hasTool('weather_tool')) {
      recordStep('Weather Agent', 'in-progress');
      agentPromises.weather = weatherAgent.execute(targetCoords.latitude, targetCoords.longitude, targetDate);
    }
    if (hasTool('marine_tool')) {
      recordStep('Ocean Agent', 'in-progress');
      agentPromises.ocean = oceanAgent.execute(targetCoords.latitude, targetCoords.longitude, targetDate);
    }
    if (hasTool('satellite_eo_tool')) {
      recordStep('Earth Observation Agent', 'in-progress');
      agentPromises.eo = earthObservationAgent.execute(targetCoords.latitude, targetCoords.longitude, targetDate);
    }
    if (hasTool('alert_tool')) {
      recordStep('Alert Tool', 'in-progress');
      agentPromises.alerts = toolRegistry.executeTool('alert_tool', {
        latitude: targetCoords.latitude,
        longitude: targetCoords.longitude
      });
    }

    const [weatherResult, oceanResult, eoResult, alertResult] = await Promise.all([
      agentPromises.weather || Promise.resolve(null),
      agentPromises.ocean || Promise.resolve(null),
      agentPromises.eo || Promise.resolve(null),
      agentPromises.alerts || Promise.resolve(null)
    ]);

    if (weatherResult) recordStep('Weather Agent', 'completed', { latencyMs: weatherResult.latencyMs, source: weatherResult.data?.source });
    if (oceanResult) recordStep('Ocean Agent', 'completed', { latencyMs: oceanResult.latencyMs, source: oceanResult.data?.source });
    if (eoResult) recordStep('Earth Observation Agent', 'completed', { latencyMs: eoResult.latencyMs, source: eoResult.data?.source });
    if (alertResult) recordStep('Alert Tool', 'completed', { alertsFound: alertResult.count || 0 });

    // Step 5: Run dependent downstream agents (Fishing Zone & Risk)
    let fishingResult = null;
    let riskResult = null;
    let routeResult = null;

    if (hasTool('pfz_tool')) {
      recordStep('Fishing Zone Agent', 'in-progress');
      fishingResult = await fishingZoneAgent.execute(
        targetCoords.latitude,
        targetCoords.longitude,
        weatherResult?.data,
        oceanResult?.data,
        eoResult?.data
      );
      recordStep('Fishing Zone Agent', 'completed', {
        latencyMs: fishingResult.latencyMs,
        source: fishingResult.data?.source
      });
    }

    if (hasTool('weather_tool') || hasTool('marine_tool') || intent === 'SAFETY' || intent === 'RISK') {
      recordStep('Risk Agent', 'in-progress');
      riskResult = await riskAgent.execute(
        weatherResult?.data,
        oceanResult?.data,
        geoResult?.data?.geofenceStatus,
        alertResult
      );
      recordStep('Risk Agent', 'completed', {
        latencyMs: riskResult.latencyMs,
        riskScore: riskResult.data?.overallScore
      });
    }

    // If route requested
    if (hasTool('route_tool')) {
      recordStep('Route Optimization Tool', 'in-progress');
      const destCoords = fishingResult?.data?.candidateZones?.[0]?.coordinates || {
        latitude: targetCoords.latitude - 0.2,
        longitude: targetCoords.longitude - 0.25
      };
      routeResult = await toolRegistry.executeTool('route_tool', {
        startLat: targetCoords.latitude,
        startLng: targetCoords.longitude,
        destLat: destCoords.latitude,
        destLng: destCoords.longitude
      });
      recordStep('Route Optimization Tool', 'completed', {
        distanceKm: routeResult.properties.actualDistanceKm
      });
    }

    // Step 6: Evidence Chain Construction
    recordStep('Evidence Agent', 'in-progress');
    const evidenceResult = await evidenceAgent.execute({
      weather: weatherResult,
      ocean: oceanResult,
      eo: eoResult,
      fishing: fishingResult,
      risk: riskResult,
      alerts: alertResult,
      geofence: geoResult?.data?.geofenceStatus
    }, targetCoords);

    recordStep('Evidence Agent', 'completed', {
      latencyMs: evidenceResult.latencyMs,
      evidencePointsCount: evidenceResult.data.length
    });

    // Step 7: Combine live context for grounded AI Reasoning Synthesis
    recordStep('Reasoning Synthesis', 'in-progress');
    const reasoningContext = {
      query,
      intent,
      location: { name: locName, coordinates: targetCoords },
      weather: weatherResult?.data,
      ocean: oceanResult?.data,
      eo: eoResult?.data,
      fishing: fishingResult?.data,
      risk: riskResult?.data,
      alerts: alertResult?.alerts || [],
      geofence: geoResult?.data?.geofenceStatus
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

    // Compile audit list of all contributing agents & tools
    const agentsUsed = [
      { name: 'Coordinator Agent', role: this.role, status: 'Completed', latencyMs: Date.now() - overallStartTime },
      { name: 'Planner Agent', role: plannerAgent.role, status: 'Completed', latencyMs: 5 },
      { name: 'Geospatial Agent', role: geospatialAgent.role, status: 'Completed', latencyMs: geoResult.latencyMs || 10 },
      ...(weatherResult ? [{ name: 'Weather Agent', role: weatherAgent.role, status: 'Completed', latencyMs: weatherResult.latencyMs, source: weatherResult.data?.source }] : []),
      ...(oceanResult ? [{ name: 'Ocean Agent', role: oceanAgent.role, status: 'Completed', latencyMs: oceanResult.latencyMs, source: oceanResult.data?.source }] : []),
      ...(eoResult ? [{ name: 'Earth Observation Agent', role: earthObservationAgent.role, status: 'Completed', latencyMs: eoResult.latencyMs, source: eoResult.data?.source }] : []),
      ...(fishingResult ? [{ name: 'Fishing Zone Agent', role: fishingZoneAgent.role, status: 'Completed', latencyMs: fishingResult.latencyMs, source: fishingResult.data?.source }] : []),
      ...(riskResult ? [{ name: 'Risk Agent', role: riskAgent.role, status: 'Completed', latencyMs: riskResult.latencyMs }] : []),
      { name: 'Evidence Agent', role: evidenceAgent.role, status: 'Completed', latencyMs: evidenceResult.latencyMs || 5 }
    ];

    const overallConfidence = fishingResult?.data?.overallConfidence || classification.confidence || 0.88;
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
      recommendations: aiResponse.recommendations || riskResult?.data?.safetyRecommendations || [],
      locations: locations,
      targetLocation: { name: locName, coordinates: targetCoords },
      evidence: evidenceResult.data || [],
      agentsUsed: agentsUsed,
      executionSteps: executionLog,
      route: routeResult || null,
      dataMode: env.DATA_MODE,
      isLive: Boolean(weatherResult?.data?.isLive || oceanResult?.data?.isLive),
      provider: aiResponse.provider,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new CoordinatorAgent();
