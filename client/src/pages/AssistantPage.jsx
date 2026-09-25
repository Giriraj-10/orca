import React, { useState, useEffect, useRef } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import {
  Send,
  Bot,
  User,
  Sparkles,
  MapPin,
  Compass,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  Fish,
  Layers,
  Thermometer,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { aiService } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import AgentExecutionVisualizer from '../components/common/AgentExecutionVisualizer';
import EvidenceTable from '../components/common/EvidenceTable';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import RiskBadge from '../components/common/RiskBadge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

const suggestedPrompts = [
  'Find potential fishing zones near Mumbai.',
  'Is it safe to go to sea tomorrow morning?',
  'Show me areas with high chlorophyll concentration.',
  'Compare Mumbai and Goa marine conditions.',
  'What is the current SST and wave condition here?'
];

const AssistantPage = () => {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { currentRegion } = useLocation();
  const { user } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'orca',
      query: null,
      answer: `Hello ${user?.name || 'Captain'}. I am ORCA, your collaborative marine intelligence orchestrator. I coordinate 8 autonomous agents analyzing Earth Observation radiometry, sea surface temperature, and weather models to answer your maritime questions. What would you like to explore today?`,
      intent: 'GREETING',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      agentsUsed: [],
      evidence: [],
      locations: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentExecutionSteps, setCurrentExecutionSteps] = useState([]);
  const [currentAgentsUsed, setCurrentAgentsUsed] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle query passed from dashboard quick search
  useEffect(() => {
    if (routerLocation.state?.initialQuery) {
      handleSend(routerLocation.state.initialQuery);
    }
  }, [routerLocation.state]);

  const handleSend = async (queryText = inputMessage) => {
    const text = queryText.trim();
    if (!text || loading) return;

    setInputMessage('');
    const userMsgId = 'user_' + Date.now();

    // Append User Message
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: text,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setLoading(true);
    setCurrentExecutionSteps([]);
    setCurrentAgentsUsed([]);

    try {
      const response = await aiService.query(text, currentRegion.lat, currentRegion.lng);

      setCurrentExecutionSteps(response.executionSteps || []);
      setCurrentAgentsUsed(response.agentsUsed || []);

      const orcaMsgId = 'orca_' + Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: orcaMsgId,
          sender: 'orca',
          query: text,
          answer: response.answer,
          intent: response.intent,
          confidence: response.confidence,
          confidenceLevel: response.confidenceLevel,
          riskLevel: response.riskLevel,
          recommendations: response.recommendations || [],
          locations: response.locations || [],
          targetLocation: response.targetLocation,
          evidence: response.evidence || [],
          agentsUsed: response.agentsUsed || [],
          executionSteps: response.executionSteps || [],
          provider: response.provider,
          dataMode: response.dataMode,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error_' + Date.now(),
          sender: 'orca',
          isError: true,
          answer: `I encountered an issue synthesizing collaborative agents: ${err.message}. Operating in fallback mode.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl overflow-hidden border border-ocean-800 shadow-2xl bg-ocean-950">
      {/* Top Header Bar */}
      <div className="bg-ocean-900/95 border-b border-ocean-800 px-5 py-3 flex items-center justify-between backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                ORCA Multi-Agent Conversational Hub
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-cyan-400 font-mono">
              Grounded on {currentRegion.name} ({currentRegion.sea})
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome_reset',
                sender: 'orca',
                answer: 'Session history reset. What marine question can we analyze?',
                timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
              }
            ])
          }
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-ocean-800/80 hover:bg-ocean-750 text-slate-300 hover:text-white text-xs transition-colors"
          title="Clear Conversation History"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {/* User Message */}
            {msg.sender === 'user' ? (
              <div className="flex items-start justify-end space-x-3">
                <div className="max-w-2xl bg-cyan-950/80 border border-cyan-800/70 rounded-2xl rounded-tr-none p-4 text-xs sm:text-sm text-cyan-100 shadow-md">
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className="text-[10px] text-cyan-400/70 font-mono mt-1 text-right">
                    {msg.timestamp}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              </div>
            ) : (
              /* ORCA Agent Response Message */
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="flex-1 max-w-4xl space-y-3">
                  {/* Agent Execution Visualizer Component for this answer */}
                  {msg.agentsUsed && msg.agentsUsed.length > 0 && (
                    <AgentExecutionVisualizer
                      agentsUsed={msg.agentsUsed}
                      executionSteps={msg.executionSteps}
                    />
                  )}

                  {/* Main Bubble Card */}
                  <div className="bg-ocean-900/80 border border-ocean-800 rounded-2xl rounded-tl-none p-5 text-xs sm:text-sm text-slate-200 shadow-xl backdrop-blur-md">
                    {/* Header Badges */}
                    {msg.intent && msg.intent !== 'GREETING' && (
                      <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-ocean-800">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300 font-semibold">
                          Intent: {msg.intent}
                        </span>
                        {msg.confidence !== undefined && (
                          <ConfidenceBadge confidence={msg.confidence} level={msg.confidenceLevel} />
                        )}
                        {msg.riskLevel && (
                          <RiskBadge riskLevel={msg.riskLevel} />
                        )}
                      </div>
                    )}

                    {/* Narrative Answer Text */}
                    <div className="leading-relaxed text-slate-200 space-y-2 whitespace-pre-line">
                      {msg.answer}
                    </div>

                    {/* Candidate Fishing Zones Cards if any */}
                    {msg.locations && msg.locations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-ocean-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center space-x-1.5">
                            <Fish className="w-4 h-4 text-teal-400" />
                            <span>Identified Potential Fishing Zones ({msg.locations.length})</span>
                          </span>
                          <button
                            onClick={() => navigate('/map')}
                            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                          >
                            <span>View All on Map</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2">
                          {msg.locations.map((loc, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-ocean-950/80 border border-cyan-900/50 hover:border-cyan-500/60 transition-all flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-100 text-xs truncate">{loc.name}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                    {loc.suitability}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                                  <div>Distance: <span className="text-cyan-300">{loc.distanceKm?.toFixed(1) || 15} km</span></div>
                                  <div>SST: <span className="text-slate-200">{loc.indicators?.sst || 27.4}°C</span></div>
                                  <div>Chlorophyll: <span className="text-emerald-400">{loc.indicators?.chlorophyll || 1.8} mg/m³</span></div>
                                </div>
                              </div>
                              <button
                                onClick={() => navigate('/map')}
                                className="mt-2.5 w-full py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[10px] font-semibold rounded-lg border border-cyan-800 transition-colors flex items-center justify-center space-x-1"
                              >
                                <span>Inspect Hotspot</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Operational Recommendations */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-ocean-800">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                          Operational Guidance:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {msg.recommendations.map((rec, rIdx) => (
                            <li key={rIdx} className="flex items-start space-x-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Corroborating Evidence Table Component */}
                    {msg.evidence && msg.evidence.length > 0 && (
                      <EvidenceTable evidence={msg.evidence} />
                    )}

                    {/* Metadata Footer */}
                    <div className="mt-4 pt-3 border-t border-ocean-800/60 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
                      <div className="flex items-center space-x-2">
                        <span>Provider: {msg.provider || 'ORCA Multi-Agent Hybrid'}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">Mode: {msg.dataMode || 'DEMO'}</span>
                      </div>
                      <div>{msg.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Live Loading State with Agent Execution Indicator */}
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-ocean-900/80 border border-ocean-800 rounded-2xl rounded-tl-none p-4 max-w-md shadow-xl">
              <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-300 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Collaborative Agents Reasoning in Progress...</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Invoking Weather Agent, Ocean Hydrodynamic Agent, and Earth Observation Chlorophyll Radiometer...
              </p>
              <div className="mt-3 w-full bg-ocean-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills & Input Bar */}
      <div className="bg-ocean-900/95 border-t border-ocean-800 p-3 sm:p-4 backdrop-blur-md shrink-0 space-y-3">
        {/* Suggested Queries */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 font-mono">
            Suggested:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-ocean-950/80 hover:bg-ocean-800 border border-ocean-700/80 text-slate-300 hover:text-cyan-200 transition-colors whitespace-nowrap text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask a question for ${currentRegion.name} (e.g. Find fishing zones, assess safety)...`}
              disabled={loading}
              className="w-full px-4 py-3 bg-ocean-950/90 border border-ocean-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-ocean-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantPage;
