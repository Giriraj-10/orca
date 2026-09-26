import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Polygon,
  Polyline,
  Popup,
  useMap,
  useMapEvents
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
  Check,
  Search,
  Navigation,
  Shield,
  Clock,
  Radio
} from 'lucide-react';
import { mapService, geoService } from '../services/api';
import { useLocation } from '../context/LocationContext';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import RiskBadge from '../components/common/RiskBadge';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

// Helper component to smoothly pan/zoom map when center changes
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// Map Click Listener component: Clicking anywhere updates the global coordinates!
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

const MapPage = () => {
  const {
    currentRegion,
    allRegions,
    selectRegionById,
    setCustomLocation,
    searchAndSetLocation,
    useBrowserGeolocation,
    searching,
    timeFilter,
    setTimeFilter
  } = useLocation();

  const [layersData, setLayersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  const [activeLayers, setActiveLayers] = useState({
    sst: true,
    chlorophyll: true,
    fishingZones: true,
    riskZones: true,
    weather: true,
    waveHeight: true,
    geofences: true
  });

  const fetchLayers = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await mapService.getLayers(lat, lng);
      setLayersData(res.layers);
    } catch (err) {
      console.warn('Map layers fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayers(currentRegion.lat, currentRegion.lng);
  }, [currentRegion.lat, currentRegion.lng]);

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const handleMapClick = (lat, lng) => {
    setCustomLocation(`Offshore Sector (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`, lat, lng);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      await searchAndSetLocation(searchInput.trim());
      setSearchInput('');
    }
  };

  const handleCalculateRouteToZone = async (zone) => {
    setCalculatingRoute(true);
    try {
      const res = await geoService.calculateRoute(
        currentRegion.lat,
        currentRegion.lng,
        zone.latitude,
        zone.longitude,
        10
      );
      if (res && res.route) {
        setActiveRoute(res.route);
      }
    } catch (err) {
      console.warn('Route calculation error:', err.message);
    } finally {
      setCalculatingRoute(false);
    }
  };

  const mapCenter = [currentRegion.lat, currentRegion.lng];

  return (
    <div className="relative h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl overflow-hidden border border-ocean-800 shadow-2xl bg-ocean-950">
      {/* Top Map Control Bar: Geocoding Search, Presets, GPS, Layers */}
      <div className="bg-ocean-900/95 border-b border-ocean-800 p-3 flex flex-wrap items-center justify-between gap-3 z-10 backdrop-blur-md">
        {/* Left: Search & Region jump selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Geocoding Search */}
          <form onSubmit={handleSearch} className="flex items-center relative w-48 sm:w-60">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search port / coords..."
              className="w-full pl-7 pr-12 py-1 bg-ocean-950 border border-ocean-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2 top-2" />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-1 top-1 px-1.5 py-0.5 bg-ocean-800 text-cyan-300 text-[10px] font-semibold rounded"
            >
              Go
            </button>
          </form>

          {/* Preset Coastal Region dropdown */}
          <div className="flex items-center space-x-1.5">
            <select
              value={currentRegion.id}
              onChange={(e) => selectRegionById(e.target.value)}
              className="bg-ocean-950 border border-ocean-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {allRegions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            <button
              onClick={useBrowserGeolocation}
              className="p-1 rounded-lg bg-ocean-950 border border-ocean-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 transition-colors"
              title="Locate via GPS"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Layer Checklist Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {[
            { key: 'sst', label: 'SST', icon: Thermometer, color: 'text-orange-400' },
            { key: 'chlorophyll', label: 'Chlorophyll', icon: Sparkles, color: 'text-emerald-400' },
            { key: 'fishingZones', label: 'PFZ Zones', icon: Fish, color: 'text-teal-400' },
            { key: 'riskZones', label: 'Risk Danger', icon: ShieldAlert, color: 'text-rose-400' },
            { key: 'geofences', label: 'Protected MPAs', icon: Shield, color: 'text-amber-400' },
            { key: 'weather', label: 'Winds', icon: Wind, color: 'text-sky-400' },
            { key: 'waveHeight', label: 'Waves', icon: Waves, color: 'text-blue-400' },
          ].map((item) => {
            const isActive = activeLayers[item.key];
            const IconComp = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => toggleLayer(item.key)}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
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

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={8}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          <ChangeMapView center={mapCenter} zoom={8} />
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Dark Maritime Tile Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* LAYER 1: SST Thermal Points */}
          {activeLayers.sst &&
            layersData?.sst?.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.latitude, p.longitude]}
                radius={24}
                pathOptions={{
                  fillColor: p.color,
                  fillOpacity: 0.35,
                  stroke: true,
                  color: p.color,
                  weight: 1.5
                }}
                eventHandlers={{
                  click: () => setSelectedFeature({ type: 'SST', data: p })
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <strong className="text-orange-400">SST Contours:</strong> {p.sst}°C<br />
                    <span className="text-[10px] text-slate-400">Source: {p.source}</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* LAYER 2: Chlorophyll Concentration Points */}
          {activeLayers.chlorophyll &&
            layersData?.chlorophyll?.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.latitude, p.longitude]}
                radius={28}
                pathOptions={{
                  fillColor: p.color,
                  fillOpacity: 0.28,
                  stroke: false
                }}
                eventHandlers={{
                  click: () => setSelectedFeature({ type: 'CHLOROPHYLL', data: p })
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <strong className="text-emerald-400">Chlorophyll-a:</strong> {p.chlorophyll} mg/m³<br />
                    <span className="text-[10px] text-slate-400">Productivity front</span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

          {/* LAYER 3: Potential Fishing Zones (PFZs) */}
          {activeLayers.fishingZones &&
            layersData?.fishingZones?.map((z) => (
              <React.Fragment key={z.id}>
                <Circle
                  center={[z.latitude, z.longitude]}
                  radius={z.radiusMeters || 12000}
                  pathOptions={{
                    color: z.suitability === 'HIGH' ? '#14b8a6' : '#f59e0b',
                    weight: 2,
                    dashArray: '6, 6',
                    fillColor: z.suitability === 'HIGH' ? '#14b8a6' : '#f59e0b',
                    fillOpacity: 0.18
                  }}
                  eventHandlers={{
                    click: () => setSelectedFeature({ type: 'PFZ', data: z })
                  }}
                />
                <CircleMarker
                  center={[z.latitude, z.longitude]}
                  radius={6}
                  pathOptions={{
                    fillColor: z.suitability === 'HIGH' ? '#14b8a6' : '#f59e0b',
                    fillOpacity: 1,
                    color: '#ffffff',
                    weight: 1.5
                  }}
                />
              </React.Fragment>
            ))}

          {/* LAYER 4: Risk Zones */}
          {activeLayers.riskZones &&
            layersData?.riskZones?.map((rz) => (
              <Circle
                key={rz.id}
                center={[rz.latitude, rz.longitude]}
                radius={rz.radiusMeters || 16000}
                pathOptions={{
                  color: rz.color,
                  weight: 1.5,
                  dashArray: '4, 4',
                  fillColor: rz.color,
                  fillOpacity: 0.12
                }}
                eventHandlers={{
                  click: () => setSelectedFeature({ type: 'RISK_ZONE', data: rz })
                }}
              />
            ))}

          {/* LAYER 5: Marine Geofences (Protected MPAs & Security Corridors) */}
          {activeLayers.geofences &&
            layersData?.geofences?.features?.map((gf) => {
              // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
              const coords = gf.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
              return (
                <Polygon
                  key={gf.id}
                  positions={coords}
                  pathOptions={{
                    color: gf.properties.color || '#ef4444',
                    weight: 2,
                    fillColor: gf.properties.color || '#ef4444',
                    fillOpacity: 0.22,
                    dashArray: '5, 5'
                  }}
                  eventHandlers={{
                    click: () => setSelectedFeature({ type: 'GEOFENCE', data: gf.properties })
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <strong className="text-rose-400">{gf.properties.name}</strong><br />
                      <span className="text-[10px] text-slate-300">{gf.properties.description}</span>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

          {/* LAYER 6: Dynamic Navigational Route Line */}
          {activeRoute && (
            <Polyline
              positions={activeRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
              pathOptions={{
                color: '#38bdf8',
                weight: 3.5,
                dashArray: '8, 6',
                opacity: 0.95
              }}
            >
              <Popup>
                <div className="text-xs p-1 font-mono">
                  <strong className="text-sky-400">Safest Navigational Route</strong><br />
                  Distance: {activeRoute.properties.actualDistanceKm} km<br />
                  Duration: {activeRoute.properties.estimatedHours} hrs @ {activeRoute.properties.vesselSpeedKnots} kts<br />
                  <span className="text-slate-400 text-[10px]">{activeRoute.properties.hazardAvoidanceNotice}</span>
                </div>
              </Popup>
            </Polyline>
          )}

          {/* Current Selected User Coordinates Pin */}
          <CircleMarker
            center={mapCenter}
            radius={8}
            pathOptions={{
              fillColor: '#06b6d4',
              fillOpacity: 1,
              color: '#ffffff',
              weight: 2
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <strong className="text-cyan-400">{currentRegion.name}</strong><br />
                <span>Lat: {currentRegion.lat.toFixed(4)}, Lng: {currentRegion.lng.toFixed(4)}</span>
              </div>
            </Popup>
          </CircleMarker>
        </MapContainer>

        {/* Floating Instruction Banner */}
        <div className="absolute top-3 left-3 z-[400] bg-ocean-950/85 backdrop-blur-md border border-cyan-800/50 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 font-mono flex items-center space-x-2 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Click anywhere on sea to analyze coordinates dynamically</span>
        </div>

        {/* Feature Detail Drawer (Right side slide-out) */}
        {selectedFeature && (
          <div className="absolute top-3 right-3 z-[450] w-80 sm:w-96 bg-ocean-950/95 backdrop-blur-xl border border-cyan-800/60 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  {selectedFeature.type.replace('_', ' ')}
                </span>
                <h4 className="text-base font-bold text-slate-100 font-mono">
                  {selectedFeature.data.name || selectedFeature.data.label || 'Marine Feature'}
                </h4>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="p-1 rounded-lg hover:bg-ocean-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PFZ Detail */}
            {selectedFeature.type === 'PFZ' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Suitability:</span>
                  <ConfidenceBadge level={selectedFeature.data.suitability} />
                  <span className="text-slate-400 font-mono">({Math.round(selectedFeature.data.confidence * 100)}% conf)</span>
                </div>
                <div className="p-3 bg-ocean-900 rounded-xl border border-ocean-800 text-slate-300 space-y-1">
                  <div><strong>SST:</strong> {selectedFeature.data.indicators?.sst || 27.8}°C</div>
                  <div><strong>Chlorophyll:</strong> {selectedFeature.data.indicators?.chlorophyll || 1.9} mg/m³</div>
                  <div><strong>Target Species:</strong> {selectedFeature.data.targetSpecies?.join(', ')}</div>
                  <div className="text-[10px] text-cyan-400 pt-1 font-mono">{selectedFeature.data.disclaimer}</div>
                </div>

                {/* Calculate Dynamic Route Button */}
                <button
                  onClick={() => handleCalculateRouteToZone(selectedFeature.data)}
                  disabled={calculatingRoute}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-ocean-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{calculatingRoute ? 'Calculating Safest Track...' : 'Plot Safest Navigational Route'}</span>
                </button>
              </div>
            )}

            {/* Geofence Detail */}
            {selectedFeature.type === 'GEOFENCE' && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200">
                  <strong>Restriction:</strong> {selectedFeature.data.restrictionLevel}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{selectedFeature.data.description}</p>
                <div className="text-[10px] font-mono text-slate-500">Source: MoEFCC / Directorate General of Shipping</div>
              </div>
            )}

            {/* SST / Chlorophyll Detail */}
            {(selectedFeature.type === 'SST' || selectedFeature.type === 'CHLOROPHYLL') && (
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-ocean-900 rounded-xl border border-ocean-800 text-slate-200">
                  <div><strong>Value:</strong> {selectedFeature.data.label}</div>
                  <div><strong>Coordinates:</strong> {selectedFeature.data.latitude?.toFixed(4)}, {selectedFeature.data.longitude?.toFixed(4)}</div>
                  <div className="text-[10px] text-slate-400 mt-1">Source: {selectedFeature.data.source || 'Operational Feed'}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
