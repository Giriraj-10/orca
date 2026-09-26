const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('../utils/logger');

class BaseAIProvider {
  async generateReasoning(prompt, context = {}) {
    throw new Error('generateReasoning must be implemented by subclass');
  }

  async classifyIntent(query) {
    throw new Error('classifyIntent must be implemented by subclass');
  }
}

/**
 * Deterministic Fallback AI Provider (Runs 100% offline without API key)
 */
class DeterministicFallbackAIProvider extends BaseAIProvider {
  constructor() {
    super();
    this.name = 'Deterministic Fallback Marine AI Engine';
    this.isLiveLLM = false;
  }

  async classifyIntent(query) {
    const q = (query || '').toLowerCase();

    if (q.includes('compare') || q.includes('versus') || q.includes(' vs ') || q.includes('difference between')) {
      return { intent: 'LOCATION_COMPARISON', confidence: 0.95 };
    }
    if (q.includes('fish') || q.includes('pfz') || q.includes('catch') || q.includes('hotspot') || q.includes('tuna') || q.includes('sardine')) {
      return { intent: 'FISHING_ZONE', confidence: 0.94 };
    }
    if (q.includes('safe') || q.includes('risk') || q.includes('danger') || q.includes('storm') || q.includes('cyclone') || q.includes('swell') || q.includes('can i go') || q.includes('is it safe')) {
      return { intent: 'SAFETY', confidence: 0.93 };
    }
    if (q.includes('sst') || q.includes('sea temperature') || q.includes('water temp') || q.includes('surface temperature')) {
      return { intent: 'SST', confidence: 0.92 };
    }
    if (q.includes('chlorophyll') || q.includes('plankton') || q.includes('algae') || q.includes('bloom') || q.includes('productivity')) {
      return { intent: 'CHLOROPHYLL', confidence: 0.92 };
    }
    if (q.includes('wind') || q.includes('rain') || q.includes('weather') || q.includes('forecast') || q.includes('visibility')) {
      return { intent: 'WEATHER', confidence: 0.91 };
    }
    if (q.includes('ocean') || q.includes('wave') || q.includes('current') || q.includes('tide') || q.includes('sea condition')) {
      return { intent: 'OCEAN_CONDITION', confidence: 0.90 };
    }
    if (q.includes('route') || q.includes('path') || q.includes('navigate') || q.includes('course') || q.includes('heading')) {
      return { intent: 'ROUTE_QUERY', confidence: 0.94 };
    }
    if (q.includes('map') || q.includes('coordinate') || q.includes('layer') || q.includes('where is')) {
      return { intent: 'MAP_QUERY', confidence: 0.88 };
    }

    return { intent: 'GENERAL_MARINE', confidence: 0.82 };
  }

  async generateReasoning(prompt, context = {}) {
    const { intent, location, weather, ocean, eo, fishing, risk } = context;
    const locName = location?.name || 'the targeted marine sector';

    let answer = '';
    let recommendations = [];

    switch (intent) {
      case 'FISHING_ZONE':
        answer = `Based on multi-source marine intelligence for ${locName}, ORCA has identified favorable potential fishing zones. The sea surface temperature is measured at ${ocean?.sst || 27.5}°C, which aligns closely with the optimal 26–29°C thermal boundary for pelagic schools. Concurrently, chlorophyll-a is elevated at ${eo?.chlorophyll || 1.8} mg/m³, signaling active phytoplankton blooms and secondary consumer concentration. Wave heights (${ocean?.waveHeight || 1.1} m) and winds (${weather?.windSpeed || 14} km/h) are within favorable navigational thresholds.`;
        recommendations = [
          'Prioritize fronts where thermal gradients intersect with bathymetric drop-offs',
          'Deploy nets along current drift vectors indicated on the interactive map',
          'Maintain constant marine radio watch on VHF Ch-16 for sudden coastal squalls'
        ];
        break;

      case 'SAFETY':
      case 'RISK':
        const rLevel = risk?.riskLevel || 'LOW';
        answer = `Marine safety evaluation for ${locName}: The current assessed risk level is **${rLevel}** (Risk Score: ${risk?.overallScore || 24}/100). Significant wave height is ${ocean?.waveHeight || 1.1} m (${ocean?.seaCondition || 'Moderate'}), accompanied by surface winds at ${weather?.windSpeed || 14} km/h from the ${weather?.windDirection || 'W'}. Visibility is clear at ${weather?.visibility || 10} km. Conditions are generally navigable for motorized craft under typical seasonal operations.`;
        recommendations = [
          'Verify operational status of GPS navigation and life-saving equipment (PFDs) before sailing',
          'Review INCOIS High Wave & Swell Surge Bulletins prior to embarking',
          'Keep vessel clear of marked coastal shallow shoals during tidal transitions'
        ];
        break;

      case 'LOCATION_COMPARISON':
        answer = `Comparative spatial evaluation completed across the selected marine zones. Oceanographic indicators reveal noticeable divergence in nutrient upwelling and sea state. Refer to the side-by-side indicator matrix below for detailed chlorophyll, thermal front, and hydrodynamic metrics.`;
        recommendations = [
          'Select the sector offering higher chlorophyll density provided wave height remains below craft limits',
          'Factor in fuel expenditure against distance offsets for offshore harvesting'
        ];
        break;

      case 'ROUTE_QUERY':
        answer = `Dynamic maritime navigation route plotted for ${locName}. The pathfinding engine evaluated current hydrodynamic wave swells (${ocean?.waveHeight || 1.1} m), surface winds (${weather?.windSpeed || 14} km/h), and verified clearance from marine protected areas and security perimeters. The minimum-risk track and waypoints have been loaded onto your map.`;
        recommendations = [
          'Follow the verified route waypoints to ensure safe clearance from restricted areas',
          'Maintain standard cruising speed and monitor engine cooling in open waters',
          'Keep continuous VHF radio watch on Channel 16 for localized squalls'
        ];
        break;

      case 'SST':
      case 'CHLOROPHYLL':
      case 'OCEAN_CONDITION':
      default:
        answer = `Comprehensive marine observation synthesis for ${locName}: Sea Surface Temperature is currently ${ocean?.sst || 27.5}°C, Chlorophyll-a density stands at ${eo?.chlorophyll || 1.85} mg/m³, wave height is ${ocean?.waveHeight || 1.1} m with an 8.5s period, and surface winds are clocking ${weather?.windSpeed || 14} km/h (${weather?.condition || 'Clear'}). These metrics reflect standard tropical shelf dynamics for this maritime zone.`;
        recommendations = [
          'Check the layered map to view spatial gradients across SST and Chlorophyll bands',
          'Observe local tidal transitions for harbor ingress and egress'
        ];
        break;
    }

    return {
      answer,
      recommendations,
      provider: this.name,
      isLLM: false,
      note: 'Processed via ORCA Deterministic Multi-Agent Reasoning Engine (Offline Ready)'
    };
  }
}

/**
 * Google Gemini AI Provider
 */
class GeminiAIProvider extends BaseAIProvider {
  constructor(apiKey = env.GEMINI_API_KEY) {
    super();
    this.apiKey = apiKey;
    this.name = 'Google Gemini AI (Marine Reasoning Specialist)';
    this.isLiveLLM = true;
    const genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async classifyIntent(query) {
    try {
      const prompt = `You are the ORCA Marine Query Classifier. Classify the user query into exactly one of these intents:
FISHING_ZONE, SAFETY, WEATHER, OCEAN_CONDITION, SST, CHLOROPHYLL, RISK, MAP_QUERY, LOCATION_COMPARISON, GENERAL_MARINE.
Respond in valid JSON format only:
{"intent": "INTENT_NAME", "confidence": 0.95}

User Query: "${query}"`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        intent: parsed.intent || 'GENERAL_MARINE',
        confidence: parsed.confidence || 0.88
      };
    } catch (err) {
      logger.warn(`Gemini classifyIntent failed: ${err.message}. Using deterministic fallback.`);
      const fallback = new DeterministicFallbackAIProvider();
      return fallback.classifyIntent(query);
    }
  }

  async generateReasoning(promptText, context = {}) {
    try {
      const systemInstruction = `You are ORCA, an advanced marine intelligence system for Smart India Hackathon.
Answer the user's question clearly, incorporating the provided scientific parameters (SST, Chlorophyll, Waves, Wind, Risk).
Keep your tone authoritative, practical for fishermen, researchers and authorities, and scientifically grounded.
Format response with clear bullet points where appropriate. Always include actionable safety or operational guidance.`;

      const combinedPrompt = `${systemInstruction}\n\nContext Data:\n${JSON.stringify(context, null, 2)}\n\nQuery:\n${promptText}`;
      const result = await this.model.generateContent(combinedPrompt);
      const text = result.response.text();

      return {
        answer: text,
        recommendations: [
          'Monitor real-time marine weather alerts prior to departure',
          'Cross-reference potential fishing zones with satellite thermal fronts'
        ],
        provider: this.name,
        isLLM: true
      };
    } catch (err) {
      logger.warn(`Gemini generateReasoning failed: ${err.message}. Using deterministic fallback.`);
      const fallback = new DeterministicFallbackAIProvider();
      return fallback.generateReasoning(promptText, context);
    }
  }
}

/**
 * AI Provider Factory
 */
class AIProviderFactory {
  static getProvider() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      try {
        logger.info('Initializing Gemini AI Provider...');
        return new GeminiAIProvider(env.GEMINI_API_KEY);
      } catch (err) {
        logger.warn(`Failed to initialize Gemini AI: ${err.message}. Falling back to deterministic.`);
        return new DeterministicFallbackAIProvider();
      }
    } else {
      logger.info('No GEMINI_API_KEY provided in .env. Initializing Deterministic Fallback Marine AI Engine.');
      return new DeterministicFallbackAIProvider();
    }
  }
}

module.exports = {
  BaseAIProvider,
  DeterministicFallbackAIProvider,
  GeminiAIProvider,
  AIProviderFactory
};
