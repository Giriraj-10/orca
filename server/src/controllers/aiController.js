const coordinatorAgent = require('../agents/coordinatorAgent');
const ChatMessage = require('../models/ChatMessage');
const ChatSession = require('../models/ChatSession');
const logger = require('../utils/logger');

// @desc    Process natural language marine query through multi-agent system
// @route   POST /api/ai/query
const processAiQuery = async (req, res, next) => {
  try {
    const { message, latitude, longitude, sessionId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query message cannot be empty'
      });
    }

    const lat = parseFloat(latitude) || 18.922;
    const lng = parseFloat(longitude) || 72.8347;
    const user = req.user || null;
    const activeSessionId = sessionId || `session_${Date.now()}`;

    // Invoke Multi-Agent Coordinator Orchestration
    const result = await coordinatorAgent.processQuery({
      query: message,
      latitude: lat,
      longitude: lng,
      user
    });

    // Save message to MongoDB asynchronously if possible
    try {
      await ChatMessage.create({
        sessionId: activeSessionId,
        userId: user ? user._id : null,
        query: message,
        answer: result.answer,
        intent: result.intent,
        confidence: result.confidence,
        confidenceLevel: result.confidenceLevel,
        riskLevel: result.riskLevel,
        recommendations: result.recommendations,
        locations: result.locations,
        evidence: result.evidence,
        agentsUsed: result.agentsUsed,
        dataMode: result.dataMode
      });
    } catch (e) {
      // In offline or non-blocking DB mode
    }

    res.json({
      success: true,
      sessionId: activeSessionId,
      answer: result.answer,
      intent: result.intent,
      confidence: result.confidence,
      confidenceLevel: result.confidenceLevel,
      riskLevel: result.riskLevel,
      riskData: result.riskData,
      recommendations: result.recommendations,
      locations: result.locations,
      targetLocation: result.targetLocation,
      evidence: result.evidence,
      agentsUsed: result.agentsUsed,
      executionSteps: result.executionSteps,
      dataMode: result.dataMode,
      provider: result.provider,
      timestamp: result.timestamp,
      disclaimer: 'ORCA prototype multi-agent reasoning output'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat message history
// @route   GET /api/ai/history
const getAiHistory = async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId;
    let query = {};
    if (sessionId) {
      query.sessionId = sessionId;
    } else if (req.user) {
      query.userId = req.user._id;
    }

    let history = [];
    try {
      history = await ChatMessage.find(query).sort({ timestamp: -1 }).limit(20);
    } catch (e) {
      // fallback
    }

    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processAiQuery,
  getAiHistory
};
