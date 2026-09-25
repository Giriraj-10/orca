import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Crosshair,
  Thermometer,
  Sparkles,
  Fish,
  ShieldAlert,
  Wind,
  Waves,
  Info,
  X,
  Compass,
  Check
} from 'lucide-react';
import { mapService } from '../services/api';
import { useLocation } from '../context/LocationContext';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import RiskBadge from '../components/common/RiskBadge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

// Helper component to smoothly pan/zoom map when region changes
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

const MapPage = () => {
  const { currentRegion, allRegions, selectRegionById, useBrowserGeolocation } = useLocation();

  const [layersData, setLayersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLayers, setActiveLayers] = useState({
    sst: true,
    chlorophyll: true,
    fishingZones: true,
    riskZones: true,
    weather: true,
    waveHeight: false,
    tide: false
  });

  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    const fetchLayers = async () => {
      setLoading(true);
      try {
        const res = await mapService.getLayers();
        setLayersData(res.layers);
      } catch (err) {
        console.warn('Map layers fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLayers();
  }, []);

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const mapCenter = [currentRegion.lat, currentRegion.lng];

  return (
    <div className="relative h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl overflow-hidden border border-ocean-800 shadow-2xl bg-ocean-950">
      {/* Map Control Bar: Region Quick Picker, GPS, Layer Toggles */}
      <div className="bg-ocean-900/95 border-b border-ocean-800 p-3 flex flex-wrap items-center justify-between gap-3 z-10 backdrop-blur-md">
        {/* Left: Region jump selector */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 hidden sm:inline">Coastal Region:</span>
          <select
            value={currentRegion.id}
            onChange={(e) => selectRegionById(e.target.value)}
            className="bg-ocean-950 border border-ocean-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {allRegions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.sea})
              </option>
            ))}
          </select>

          <button
            onClick={useBrowserGeolocation}
            className="p-1.5 rounded-lg bg-ocean-950 border border-ocean-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Locate via GPS"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Layer Checklist Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {[
            { key: 'sst', label: 'SST', icon: Thermometer, color: 'text-orange-400' },
            { key: 'chlorophyll', label: 'Chlorophyll', icon: Sparkles, color: 'text-emerald-400' },
            { key: 'fishingZones', label: 'Fishing Zones', icon: Fish, color: 'text-teal-400' },
            { key: 'riskZones', label: 'Risk Zones', icon: ShieldAlert, color: 'text-rose-400' },
            { key: 'weather', label: 'Weather', icon: Wind, color: 'text-sky-400' },
            { key: 'waveHeight', label: 'Wave Height', icon: Waves, color: 'text-blue-400' },
            { key: 'tide', label: 'Tide', icon: Compass, color: 'text-purple-400' },
          ].map((item) => {
            const isActive = activeLayers[item.key];
            const IconComp = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => toggleLayer(item.key)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-950 border border-cyan-500/60 text-cyan-200 shadow-sm'
                    : 'bg-ocean-950/70 border border-ocean-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <IconComp className={`w-3 h-3 ${item.color}`} />
                <span>{item.label}</span>
                {isActive && <Check className="w-3 h-3 text-cyan-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={9}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeMapView center={mapCenter} zoom={9} />

          {/* CartoDB Dark Matter Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Layer 1: SST Thermal Points */}
          {activeLayers.sst &&
            layersData?.sst?.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.latitude, p.longitude]}
                radius={12}
                pathOptions={{
                  fillColor: p.color,
                  fillOpacity: 0.55,
                  color: p.color,
                  weight: 1.5
                }}
                eventHandlers={{
                  click: () =>
                    setSelectedFeature({
                      type: 'SST Thermal Observation',
                      name: `Sea Surface Temperature: ${p.label}`,
                      location: `[${p.latitude.toFixed(3)}, ${p.longitude.toFixed(3)}]`,
                      metrics: { 'SST Value': p.label, Source: 'Simulated In-Situ & Satellite Blend' },
                      reasoning: 'Thermal gradient boundary where pelagic and schooling fish tend to aggregate.',
                      confidence: 0.88,
                      mode: 'DEMO'
                    })
                }}
              >
                <Popup>
                  <div className="text-xs text-slate-100">
                    <strong className="text-orange-400">SST Point:</strong> {p.label}
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* Layer 2: Chlorophyll Points */}
          {activeLayers.chlorophyll &&
            layersData?.chlorophyll?.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.latitude, p.longitude]}
                radius={9}
                pathOptions={{
                  fillColor: p.color,
                  fillOpacity: 0.65,
                  color: '#10b981',
                  weight: 1.5
                }}
                eventHandlers={{
                  click: () =>
                    setSelectedFeature({
                      type: 'Satellite Chlorophyll-a Observation',
                      name: `Chlorophyll-a: ${p.label}`,
                      location: `[${p.latitude.toFixed(3)}, ${p.longitude.toFixed(3)}]`,
                      metrics: {
                        'Concentration': p.label,
                        'Sensor': 'Ocean Colour Monitor (OCM-3 / MODIS)',
                        'Productivity': p.chlorophyll >= 1.8 ? 'Elevated Primary Productivity' : 'Moderate Coastal Waters'
                      },
                      reasoning: 'High chlorophyll concentration indicates active phytoplankton blooms supporting forage species.',
                      confidence: 0.91,
                      mode: 'DEMO'
                    })
                }}
              >
                <Popup>
                  <div className="text-xs text-slate-100">
                    <strong className="text-emerald-400">Chlorophyll:</strong> {p.label}
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* Layer 3: Potential Fishing Zones (PFZs) */}
          {activeLayers.fishingZones &&
            layersData?.fishingZones?.map((z) => (
              <React.Fragment key={z.id}>
                <Circle
                  center={[z.latitude, z.longitude]}
                  radius={z.radiusMeters || 12000}
                  pathOptions={{
                    fillColor: z.suitability === 'HIGH' ? '#14b8a6' : '#f59e0b',
                    fillOpacity: 0.22,
                    color: '#06b6d4',
                    weight: 2,
                    dashArray: '4, 6'
                  }}
                />
                <CircleMarker
                  center={[z.latitude, z.longitude]}
                  radius={8}
                  pathOptions={{
                    fillColor: '#06b6d4',
                    fillOpacity: 0.9,
                    color: '#ffffff',
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () =>
                      setSelectedFeature({
                        type: 'Potential Fishing Zone (PFZ)',
                        name: z.name,
                        location: `Latitude: ${z.latitude.toFixed(4)}, Longitude: ${z.longitude.toFixed(4)}`,
                        suitability: z.suitability,
                        confidence: z.confidence,
                        metrics: {
                          'SST': `${z.indicators?.sst || 27.4}°C`,
                          'Chlorophyll': `${z.indicators?.chlorophyll || 1.85} mg/m³`,
                          'Wave Height': `${z.indicators?.waveHeight || 1.1} m`,
                          'Surface Wind': `${z.indicators?.windSpeed || 14} km/h`,
                          'Target Species': (z.targetSpecies || []).join(', ')
                        },
                        reasoning: z.reasoning,
                        mode: 'DEMO'
                      })
                  }}
                >
                  <Popup>
                    <div className="text-xs text-slate-100 p-1">
                      <div className="font-bold text-cyan-300">{z.name}</div>
                      <div className="text-slate-300 text-[11px] mt-1">
                        Suitability: <strong>{z.suitability}</strong> ({Math.round(z.confidence * 100)}%)
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Click to view full scientific evidence.</div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            ))}

          {/* Layer 4: Marine Risk Danger Zones */}
          {activeLayers.riskZones &&
            layersData?.riskZones?.map((rz) => (
              <Circle
                key={rz.id}
                center={[rz.latitude, rz.longitude]}
                radius={rz.radiusMeters || 18000}
                pathOptions={{
                  fillColor: rz.color,
                  fillOpacity: 0.25,
                  color: rz.color,
                  weight: 2
                }}
                eventHandlers={{
                  click: () =>
                    setSelectedFeature({
                      type: 'Marine Hazard & Risk Zone',
                      name: rz.name,
                      riskLevel: rz.riskLevel,
                      location: `[${rz.latitude.toFixed(4)}, ${rz.longitude.toFixed(4)}]`,
                      metrics: {
                        'Risk Level': rz.riskLevel,
                        'Wave Swell': `${rz.waveHeight} m`,
                        'Wind Gusts': `${rz.windSpeed} km/h`
                      },
                      reasoning: rz.warning,
                      confidence: 0.85,
                      mode: 'DEMO'
                    })
                }}
              >
                <Popup>
                  <div className="text-xs text-slate-100">
                    <strong className="text-rose-400">{rz.name}</strong>
                    <div className="mt-1">Risk: {rz.riskLevel}</div>
                  </div>
                </Popup>
              </Circle>
            ))}

          {/* Layer 5: Weather Stations */}
          {activeLayers.weather &&
            layersData?.weather?.map((wx) => (
              <CircleMarker
                key={wx.id}
                center={[wx.latitude, wx.longitude]}
                radius={6}
                pathOptions={{ fillColor: '#38bdf8', color: '#0284c7', weight: 1.5, fillOpacity: 0.8 }}
                eventHandlers={{
                  click: () =>
                    setSelectedFeature({
                      type: 'Coastal Meteorological Station',
                      name: `${wx.name} Weather Vector`,
                      location: `[${wx.latitude.toFixed(3)}, ${wx.longitude.toFixed(3)}]`,
                      metrics: {
                        'Wind Speed': `${wx.windSpeed} km/h`,
                        'Wind Direction': wx.windDirection,
                        'Condition': wx.condition,
                        'Air Temp': `${wx.temperature}°C`
                      },
                      reasoning: 'WRF high-resolution coastal atmospheric wind and squall model.',
                      confidence: 0.89,
                      mode: 'DEMO'
                    })
                }}
              >
                <Popup>
                  <div className="text-xs text-slate-100">
                    <strong>{wx.name}</strong>: {wx.windSpeed} km/h ({wx.condition})
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* Layer 6: Wave Height Layer */}
          {activeLayers.waveHeight &&
            layersData?.waveHeight?.map((wh) => (
              <CircleMarker
                key={wh.id}
                center={[wh.latitude, wh.longitude]}
                radius={10}
                pathOptions={{
                  fillColor: wh.severity === 'HIGH' ? '#ef4444' : wh.severity === 'MODERATE' ? '#f59e0b' : '#38bdf8',
                  fillOpacity: 0.6,
                  color: '#ffffff',
                  weight: 1
                }}
              >
                <Popup>
                  <div className="text-xs text-slate-100">
                    Wave Height: <strong>{wh.label}</strong>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* Layer 7: Tide Stations */}
          {activeLayers.tide &&
            layersData?.tide?.map((t) => (
              <CircleMarker
                key={t.id}
                center={[t.latitude, t.longitude]}
                radius={7}
                pathOptions={{ fillColor: '#c084fc', color: '#7e22ce', weight: 1.5, fillOpacity: 0.8 }}
              >
                <Popup>
                  <div className="text-xs text-slate-100">
                    <strong>{t.name}</strong>
                    <div>{t.status}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>

        {/* Legend Overlay in Bottom-Left */}
        <div className="absolute bottom-4 left-4 z-10 bg-ocean-950/90 border border-ocean-800 rounded-xl p-3 shadow-xl backdrop-blur-md text-[11px] text-slate-300 space-y-1.5 hidden sm:block">
          <div className="font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1">
            Map Overlay Legend
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Potential Fishing Zones (PFZs)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Chlorophyll Concentration (OCM-3)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span>Sea Surface Temperature (SST)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Marine Hazard / High Swell Zone</span>
          </div>
        </div>

        {/* Clickable Zone Details Panel (Sidebar Drawer) */}
        {selectedFeature && (
          <div className="absolute top-4 right-4 z-20 w-80 sm:w-96 bg-ocean-900/95 border border-cyan-800/80 rounded-2xl shadow-2xl backdrop-blur-xl p-5 text-xs text-slate-200 animate-fade-in max-h-[calc(100%-2rem)] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-ocean-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  {selectedFeature.type}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">{selectedFeature.name}</h3>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedFeature.location}</div>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-2 mb-3">
              {selectedFeature.suitability && (
                <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  Suitability: {selectedFeature.suitability}
                </span>
              )}
              {selectedFeature.confidence && (
                <ConfidenceBadge confidence={selectedFeature.confidence} />
              )}
              {selectedFeature.riskLevel && (
                <RiskBadge riskLevel={selectedFeature.riskLevel} />
              )}
            </div>

            {/* Metrics Grid */}
            <div className="bg-ocean-950/80 border border-ocean-800 rounded-xl p-3 space-y-1.5 font-mono text-[11px] mb-3">
              {Object.entries(selectedFeature.metrics || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-0.5 border-b border-ocean-900 last:border-none">
                  <span className="text-slate-400">{k}:</span>
                  <span className="text-cyan-300 font-semibold truncate max-w-[180px]">{v}</span>
                </div>
              ))}
            </div>

            {/* Reasoning Explanation */}
            {selectedFeature.reasoning && (
              <div className="mb-3">
                <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Reasoning & Marine Evidence:
                </span>
                <p className="text-slate-400 leading-relaxed bg-ocean-950/40 p-2.5 rounded-lg border border-ocean-800/80">
                  {selectedFeature.reasoning}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-ocean-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-emerald-400">Mode: {selectedFeature.mode}</span>
              <span className="text-slate-500">Simulated Dataset</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
