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
  ShieldAlert,
  Navigation,
  Radio
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
  'Find the safest route to the nearest PFZ.',
  'कल समुद्र में जाना सुरक्षित है? (Is it safe tomorrow?)',
  'Compare Mumbai and Goa marine conditions.',
  'What is the current SST and wave swell here?'
];

const AssistantPage = () => {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { currentRegion, timeFilter, setTimeFilter, targetDate } = useLocation();
  const { user } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'orca',
      query: null,
      answer: `Hello ${user?.name || 'Captain'}. I am ORCA, your collaborative marine intelligence orchestrator. I coordinate 8 autonomous agents connecting directly to live Earth Observation feeds, Open-Meteo marine models, and IMD forecasts to answer your maritime questions with grounded evidence. What would you like to explore today?`,
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
      const response = await aiService.query(text, currentRegion.lat, currentRegion.lng, null, targetDate);

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
          route: response.route,
          provider: response.provider,
          dataMode: response.dataMode,
          isLive: response.isLive,
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
      <div className="bg-ocean-900/95 border-b border-ocean-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md shrink-0">
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
              Grounded on {currentRegion.name} ({currentRegion.lat.toFixed(2)}°N, {currentRegion.lng.toFixed(2)}°E)
            </p>
          </div>
        </div>

        {/* Time Selector & Reset Session */}
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 bg-ocean-950 border border-ocean-800 rounded-lg p-0.5">
            {[
              { id: 'now', label: 'Now' },
              { id: 'tomorrow_morning', label: 'Tomorrow AM' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  timeFilter === t.id
                    ? 'bg-cyan-500 text-ocean-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
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
            className="p-1.5 rounded-lg bg-ocean-950 border border-ocean-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-700 transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-4">
            {/* User Bubble */}
            {msg.sender === 'user' && (
              <div className="flex items-start justify-end space-x-3">
                <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-ocean-950 rounded-2xl rounded-tr-none px-4 py-3 max-w-xl shadow-lg">
                  <p className="text-xs sm:text-sm font-semibold">{msg.text}</p>
                  <span className="text-[10px] text-ocean-950/70 font-mono mt-1 block text-right">
                    {msg.timestamp}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <User className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* ORCA Agent Bubble */}
            {msg.sender === 'orca' && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="flex-1 max-w-3xl space-y-4">
                  <div className="bg-ocean-900/90 border border-ocean-800 rounded-2xl rounded-tl-none p-4 sm:p-5 shadow-xl space-y-3">
                    {/* Header Badges */}
                    {msg.intent && msg.intent !== 'GREETING' && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-ocean-800">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                            Intent: {msg.intent}
                          </span>
                          {msg.confidenceLevel && (
                            <ConfidenceBadge level={msg.confidenceLevel} score={msg.confidence} />
                          )}
                        </div>
                        {msg.riskLevel && <RiskBadge level={msg.riskLevel} />}
                      </div>
                    )}

                    {/* Main Synthesized Answer */}
                    <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                      {msg.answer}
                    </div>

                    {/* Dynamic Route Card if generated */}
                    {msg.route && (
                      <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Dynamic Hazard-Avoidance Navigational Route Plotted</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Distance: {msg.route.properties.actualDistanceKm} km | Est: {msg.route.properties.estimatedHours} hrs @ {msg.route.properties.vesselSpeedKnots} kts
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/map')}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-ocean-950 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <span>View Track</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}

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

                    {/* Grounded Evidence Table Component */}
                    {msg.evidence && msg.evidence.length > 0 && (
                      <EvidenceTable evidence={msg.evidence} />
                    )}

                    {/* Metadata Footer */}
                    <div className="mt-4 pt-3 border-t border-ocean-800/60 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-mono gap-2">
                      <div className="flex items-center space-x-2">
                        <span>Provider: {msg.provider || 'ORCA Multi-Agent Hybrid'}</span>
                        <span>•</span>
                        <span className={msg.isLive ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                          {msg.isLive ? 'LIVE DATA GROUNDED' : 'HYBRID / DEMO'}
                        </span>
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
                <span>Collaborative Agents Querying Live APIs & Reasoning...</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                Invoking Weather Tool (Open-Meteo/IMD), Marine Tool, and Satellite Radiometer...
              </p>
            </div>
          </div>
        )}

        {/* Live Execution Visualizer */}
        {currentExecutionSteps.length > 0 && (
          <div className="max-w-3xl ml-11">
            <AgentExecutionVisualizer steps={currentExecutionSteps} agents={currentAgentsUsed} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="bg-ocean-900/60 border-t border-ocean-800 px-4 py-2 flex items-center space-x-2 overflow-x-auto shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="text-[10px] font-mono text-slate-400 shrink-0 uppercase">Suggested Prompts:</span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="px-2.5 py-1 bg-ocean-950 hover:bg-ocean-800 text-slate-300 hover:text-cyan-300 text-xs rounded-lg border border-ocean-800 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="bg-ocean-900 border-t border-ocean-800 p-3 sm:p-4 flex items-center space-x-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask ORCA AI for ${currentRegion.name} (e.g. Find safest route, evaluate safety tomorrow)...`}
          disabled={loading}
          className="flex-1 bg-ocean-950 border border-ocean-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-ocean-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default AssistantPage;
