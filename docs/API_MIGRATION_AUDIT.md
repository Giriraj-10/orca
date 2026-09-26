# ORCA — API Migration & Hardcode Audit Report

**Date:** 2026-09-26  
**Project:** ORCA (Marine EcOsystem Reasoning with Collaborative Agents)  
**Objective:** Identify every hardcoded marine metric, static dataset, mock coordinate, and fake advisory across the codebase to establish a genuinely API-driven, explainable, and resilient architecture.

---

## 1. Master Migration Audit Table

| Feature | Current Source | Hardcoded? | Required API | Status |
| --- | --- | ---: | --- | --- |
| Weather | Static (`coastalRegions.js` + `DemoWeatherProvider`) | YES | IMD / Open-Meteo fallback | In Progress |
| Waves | Static (`coastalRegions.js` + `DemoOceanProvider`) | YES | Open-Meteo Marine API | In Progress |
| SST | Static (`coastalRegions.js` + `DemoOceanProvider` / `DemoEOProvider`) | YES | Open-Meteo Marine (model SST) / Satellite source | In Progress |
| Chlorophyll | Static (`coastalRegions.js` + `DemoEOProvider`) | YES | Satellite source (NASA OceanColor / INCOIS adapter) | In Progress |
| PFZ | Static (`seedData.js` + `fishingHotspots`) | YES | INCOIS Advisory Ingestion + Derived PFZ Analytics | In Progress |
| Tides | Static string (`closest.baseline.tide`) | YES | Open-Meteo Marine / Harmonic Tide Model API | In Progress |
| Alerts | Static (`seedData.js` 4 hardcoded alerts) | YES | Dynamic condition detection + Official bulletins | In Progress |
| Geofencing | Static / Non-existent dynamic geofence checks | YES | GeoJSON datasets + Turf.js spatial analysis | In Progress |
| Routes | None / Hardcoded destination markers | YES | Dynamic A* cost-grid pathfinding over live conditions | In Progress |
| Risk | Heuristic with hardcoded inputs | YES | Deterministic Risk Engine fed by live API inputs | In Progress |

---

## 2. Granular Codebase Audit Findings

### 2.1 Backend Data & Provider Layer

1. **`server/src/data/coastalRegions.js`**:
   - Contains fixed baseline numbers (`sst`, `chlorophyll`, `waveHeight`, `currentSpeed`, `tide`, `windSpeed`, `windDirection`, `precipitation`, `visibility`, `condition`) for 8 regions.
   - Contains hardcoded `fishingHotspots` arrays with static offset bearings.
   - *Remediation:* Retain as fallback demo baselines, but decouple runtime from fixed baselines.

2. **`server/src/data/seedData.js`**:
   - Generates 32 static `MarineObservation` records, 24 static `FishingZone` records, 4 static `Alert` records, and 4 static `DataSource` records.
   - *Remediation:* Use seed only for offline test accounts or initial caching; runtime APIs must query live providers.

3. **`server/src/providers/WeatherProvider.js`**:
   - `DemoWeatherProvider` returns hardcoded `closest.baseline` plus trigonometric diurnal shifts.
   - `LiveWeatherProvider` currently requires private `WEATHER_API_KEY` which is unset, falling back directly to demo without trying open public APIs.
   - *Remediation:* Connect to IMD API (when configured) and Open-Meteo Weather API (`api.open-meteo.com/v1/forecast`) for instant, live coordinate-driven meteorological forecasts.

4. **`server/src/providers/OceanProvider.js`**:
   - `DemoOceanProvider` returns static `baseline.waveHeight`, `baseline.sst`, `currentSpeed`, and `baseline.tide`.
   - *Remediation:* Connect to Open-Meteo Marine API (`marine-api.open-meteo.com/v1/marine`) providing live hourly significant wave height, swell, wave period, wave direction, ocean currents, and model SST.

5. **`server/src/providers/EarthObservationProvider.js`**:
   - `DemoEOProvider` computes static chlorophyll and SST from `closest.baseline`.
   - *Remediation:* Create adapter for NASA OceanColor / MOSDAC with credentials; when live satellite radiometry is unavailable, explicitly label derived productivity or mark satellite feed unavailable.

6. **`server/src/agents/coordinatorAgent.js`**:
   - Uses hardcoded default origin `latitude = 18.922, longitude = 72.8347` (Mumbai) if missing.
   - *Remediation:* Accept dynamic user coordinates, browser GPS, and resolved search geocoding.

7. **`server/src/agents/fishingZoneAgent.js`**:
   - Maps over `closestRegion.fishingHotspots` with synthetic offsets.
   - *Remediation:* Ingest INCOIS advisory bulletins where available; in secondary mode, compute derived PFZ suitability over a dynamic coordinate bounding box from live satellite/marine telemetry, explicitly labelled `ORCA DERIVED PFZ SUITABILITY (NOT OFFICIAL INCOIS PFZ ADVISORY)`.

8. **`server/src/controllers/mapController.js`**:
   - `riskZonesLayer` and `weatherLayer` map directly over `COASTAL_REGIONS` with static conditions.
   - *Remediation:* Map layers must be generated from dynamic live queries and GeoJSON files.

9. **`server/src/controllers/alertController.js`**:
   - Queries static MongoDB alerts collection populated from `seedData.js`.
   - *Remediation:* Dynamically compute active marine weather alerts based on live wind, wave, and squall thresholds + official bulletins.

---

### 2.2 Frontend (React Client) Layer

1. **`client/src/pages/DashboardPage.jsx`**:
   - Line 76: `const mockTrendData = [...]` constructs synthetic Recharts time-series data.
   - *Remediation:* Consume `GET /api/marine/forecast` or `GET /api/marine/observations` containing actual hourly trend arrays from the live API.

2. **`client/src/context/LocationContext.jsx`**:
   - Hardcoded default `mumbai` region coordinates.
   - *Remediation:* Enable Nominatim geocoding search, map click selection, and browser GPS positioning.

3. **`client/src/pages/MapPage.jsx`**:
   - Only displays layers loaded from static `/api/map/layers`.
   - *Remediation:* Connect to dynamic backend GeoJSON endpoints for PFZs, geofences, routes, and risk polygons.

4. **`client/src/pages/DataSourcesPage.jsx` & `AdminStatusPage.jsx`**:
   - Display static status arrays.
   - *Remediation:* Expose real-time provider ping, round-trip latency, and connectivity status via `/api/system/data-sources`.

---

## 3. Architecture Blueprint for Migration

```text
User / GPS / Search
       ↓
React Frontend (Dynamic Coordinates & Forecast Times)
       ↓
Express REST API Layer
       ↓
Intent & Planner Agent
       ↓
Tool Registry
 ├── WeatherTool ─────────► IMD API / Open-Meteo Forecast
 ├── MarineTool ──────────► Open-Meteo Marine API (Waves, Currents, SST)
 ├── OceanTool ───────────► NASA OceanColor / Satellite Adapter
 ├── PFZTool ─────────────► INCOIS Bulletin Ingestion / Derived PFZ Analytics
 ├── TideTool ────────────► Marine Tide & Harmonic Level Model
 ├── GeofenceTool ────────► Turf.js spatial analysis of GeoJSON boundaries
 ├── RouteTool ───────────► Dynamic A* Cost Grid Pathfinding
 └── AlertTool ───────────► Real-Time Weather/Hazard Threshold Checks
       ↓
Normalization Layer (Common Internal Schema)
       ↓
Cache System (TTL-based with Request Fingerprint)
       ↓
Failover Manager (Primary Live -> Secondary Live -> Cache -> Demo)
       ↓
Deterministic Reasoning Engines (Risk, PFZ, Route, Evidence)
       ↓
LLM Synthesis Node (Gemini 1.5 Flash for Multilingual Context & Explanation)
       ↓
Frontend Visualization (Leaflet GeoJSON, Recharts Diurnal, Evidence Drawer)
```
