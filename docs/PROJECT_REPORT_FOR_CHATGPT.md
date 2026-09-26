# ORCA (Marine EcOsystem Reasoning with Collaborative Agents)
## Comprehensive Technical Project Report for AI Analysis & ChatGPT Context

---

## 1. Project Overview & Problem Statement

### 1.1 Project Identity
- **Project Name:** ORCA — Marine EcOsystem Reasoning with Collaborative Agents
- **Context:** Smart India Hackathon (SIH) Innovation Prototype
- **License:** MIT License
- **Target Audience:** Artisanal & commercial fishermen, marine biology researchers, coastal maritime authorities, and port administrators.

### 1.2 The Problem
India possesses an extensive coastline spanning over 7,516 kilometers with millions of coastal community members dependent on marine fishing for livelihood and food security. However, marine stakeholders face critical operational bottlenecks:
1. **Fragmented Data Silos:** Oceanographic satellite telemetry (chlorophyll-a, sea surface temperature), hydrodynamic buoy measurements (wave swells, currents, tides), and atmospheric numerical forecasts (wind vectors, squalls, barometric pressure) exist across disparate portals and scientific formats.
2. **Lack of Explainability:** Traditional advisories provide binary outputs without transparent reasoning or data provenance, leading to distrust among fishermen.
3. **Hazardous Marine Conditions:** Sudden localized sea state changes (wave amplification, high winds, rip currents) lead to vessel capsizing and casualties due to lack of localized seaworthiness assessments.
4. **Internet & API Fragility:** Sea operations and hackathon demos often suffer from intermittent connectivity, causing conventional cloud-only AI assistants to fail or crash.

### 1.3 The ORCA Solution
ORCA is a full-stack, offline-first intelligent marine intelligence platform. It fuses Earth Observation (EO) satellite feeds, in-situ oceanographic buoys, and atmospheric forecasts using an ensemble of **8 collaborative autonomous AI agents**. It synthesizes complex marine data into plain-language, transparent, and actionable guidance accompanied by:
- A real-time **Animated Agent Execution Visualizer** displaying multi-agent delegation and node latencies.
- An **Evidence Table** detailing sensor source, timestamp, and lineage for every metric.
- A **Deterministic Fallback Engine** ensuring 100% zero-crash offline execution alongside Google Gemini 1.5 Flash.
- An **Interactive Multi-Layer Leaflet GIS Map** with thermal gradients, chlorophyll bloom overlays, Potential Fishing Zone (PFZ) radiuses, and maritime hazard polygons.

---

## 2. System Architecture & High-Level Flow

### 2.1 Architectural Flow Diagram

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    Client Interface                    │
                               │  React 18 + Vite + Leaflet + Tailwind CSS + Recharts   │
                               └───────────────────────────┬────────────────────────────┘
                                                           │ HTTP REST / JSON (JWT Auth)
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │                 Express.js Backend API                 │
                               │     (Rate Limiter, Helmet, CORS, Router, Middleware)   │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │                   Coordinator Agent                    │
                               │  - Intent Classification (10 Intents via Gemini/Regex) │
                               │  - Geospatial Context Resolution                       │
                               │  - Asynchronous Parallel Agent Dispatch                │
                               │  - Multi-Signal Evidence Fusion                        │
                               └───────────┬────────────────────────────────┬───────────┘
                                           │                                │
                 ┌─────────────────────────┼────────────────────────────────┼─────────────────────────┐
                 ▼                         ▼                                ▼                         ▼
     ┌───────────────────────┐ ┌───────────────────────┐        ┌───────────────────────┐ ┌───────────────────────┐
     │     Weather Agent     │ │      Ocean Agent      │        │       EO Agent        │ │   Geospatial Agent    │
     │ WRF Atmospheric Mesh: │ │ Hydrodynamic Models:  │        │ Satellite Radiometry: │ │ Haversine Distance,   │
     │ Winds, Rain, Vis, Baro│ │ SST, Waves, Swell, Tide│       │ Chlorophyll-a, Fronts │ │ Port Bounds & Aliases │
     └───────────┬───────────┘ └───────────┬───────────┘        └───────────┬───────────┘ └───────────┬───────────┘
                 │                         │                                │                         │
                 └─────────────────────────┼────────────────────────────────┼─────────────────────────┘
                                           │
                                           ▼
                               ┌───────────────────────┐
                               │  Fishing Zone Agent   │
                               │ Pelagic Habitat Model │
                               └───────────┬───────────┘
                                           │
                                           ▼
                               ┌───────────────────────┐
                               │      Risk Agent       │
                               │ Seaworthiness Matrix  │
                               └───────────┬───────────┘
                                           │
                                           ▼
                               ┌───────────────────────┐
                               │    Evidence Agent     │
                               │ Data Lineage & Clocks │
                               └───────────┬───────────┘
                                           │
                                           ▼
                               ┌───────────────────────┐
                               │   AI Reasoner Node    │
                               │ Gemini 1.5 / Fallback │
                               └───────────────────────┘
```

---

## 3. The 8 Collaborative Autonomous Agents in Detail

| Agent Name | Architectural Role | Key Inputs | Core Algorithms / Heuristics | Output Generated |
|---|---|---|---|---|
| **1. Coordinator Agent** | Multi-agent orchestrator & reasoning synthesizer | User natural language query, GPS coordinates, authenticated user persona | Intent classification matrix (10 intents), async DAG dispatch, aggregation pipeline | Unified response payload, execution audit logs, agent latency metrics |
| **2. Geospatial Agent** | Spatial indexing & boundary resolution | Latitude, Longitude, query text tokens | Great-circle Haversine formula, bounding-box checks, coastal alias dictionary | Resolved region name, nearest port baseline, offshore distance (km), sea basin |
| **3. Weather Agent** | Atmospheric meteorology | Target coordinates, date/time | Numerical Weather Prediction (NWP) model abstraction (WRF grid) | Wind speed (km/h) & direction, visibility (km), squalls, precipitation rate (mm/h) |
| **4. Ocean Agent** | Hydrodynamics & physical oceanography | Target coordinates, date/time | In-situ moored buoy array abstraction, harmonic tide analysis | Sea Surface Temp (°C), Significant Wave Height (m), Wave Period (s), Tide state |
| **5. Earth Observation (EO) Agent** | Satellite remote sensing & radiometry | Regional marine bounds | Ocean Color Monitor (OCM-3/MODIS Aqua) telemetry, thermal gradient analysis | Chlorophyll-a concentration (mg/m³), thermal front gradient (°C/km), upwelling index |
| **6. Fishing Zone Agent** | Pelagic habitat & PFZ suitability scoring | SST, Chlorophyll, Wave Height, Wind Speed, Regional Hotspots | Multi-parameter weighted habitat suitability algorithm (0–100 score) | Suitability class (HIGH/MEDIUM/LOW), confidence score, candidate hotspots with bearings |
| **7. Risk Agent** | Maritime seaworthiness & vessel safety | Hydro-meteorological risk vectors | Composite maritime hazard matrix (waves 40 pts, wind 35 pts, vis 15 pts, weather 10 pts) | Risk level (LOW/MODERATE/HIGH), composite score (0-100), craft-specific advisories |
| **8. Evidence Agent** | Data lineage & audit attribution | Contributing agents' raw outputs | Temporal formatting (IST), sensor provider mapping, lineage validation | Array of verified evidence cards citing exact data point, value, source, timestamp |

---

## 4. Proprietary Scoring Models & Algorithms

### 4.1 Potential Fishing Zone (PFZ) Suitability Algorithm
Located in `server/src/agents/fishingZoneAgent.js`, this algorithm models pelagic fish aggregation based on primary food chain productivity (chlorophyll-a) and thermal affinity (SST):
- **Sea Surface Temperature (SST) Score (Max 35 points):**
  - If $26.0^\circ\text{C} \le \text{SST} \le 29.2^\circ\text{C}$ (optimal pelagic window): $+35$ pts
  - If $24.5^\circ\text{C} \le \text{SST} \le 30.5^\circ\text{C}$ (sub-optimal / marginal): $+20$ pts
  - Otherwise: $0$ pts
- **Chlorophyll-a Concentration Score (Max 40 points):**
  - If $\text{Chl} \ge 1.8\text{ mg/m}^3$ (high primary productivity / phytoplankton bloom): $+40$ pts
  - If $1.0 \le \text{Chl} < 1.8\text{ mg/m}^3$ (moderate productivity): $+25$ pts
  - If $\text{Chl} < 1.0\text{ mg/m}^3$ (oligotrophic water): $+10$ pts
- **Navigational Sea State Score (Max 25 points):**
  - If $\text{Wave} \le 1.4\text{ m}$ and $\text{Wind} \le 20\text{ km/h}$: $+25$ pts
  - If $\text{Wave} \le 2.2\text{ m}$ and $\text{Wind} \le 30\text{ km/h}$: $+10$ pts
  - Otherwise (harsh conditions): $-20$ pts
- **Classification Output:**
  - Total $\ge 80 \implies \textbf{HIGH Suitability}$ (Confidence: $88\%$)
  - $50 \le \text{Total} < 80 \implies \textbf{MEDIUM Suitability}$ (Confidence: $81\%$)
  - Total $< 50 \implies \textbf{LOW Suitability}$ (Confidence: $75\%$)

### 4.2 Marine Seaworthiness & Hazard Risk Score
Located in `server/src/agents/riskAgent.js`, this composite safety model evaluates seaworthiness for motorized and traditional coastal crafts:
- **Wave Risk Factor (Max 40 pts):**
  - $\ge 2.8\text{ m} \implies 40\text{ pts (Severe pitching/swamping)}$
  - $1.8\text{ to } 2.7\text{ m} \implies 25\text{ pts (Moderate swell danger)}$
  - $1.2\text{ to } 1.7\text{ m} \implies 12\text{ pts}$
  - $< 1.2\text{ m} \implies 4\text{ pts (Calm/slight)}$
- **Wind Risk Factor (Max 35 pts):**
  - $\ge 35\text{ km/h} \implies 35\text{ pts (Gale/squall chop)}$
  - $24\text{ to } 34\text{ km/h} \implies 22\text{ pts}$
  - $15\text{ to } 23\text{ km/h} \implies 10\text{ pts}$
  - $< 15\text{ km/h} \implies 3\text{ pts}$
- **Visibility Factor (Max 15 pts):**
  - $< 3.0\text{ km} \implies 15\text{ pts}$
  - $3.0\text{ to } 5.9\text{ km} \implies 8\text{ pts}$
  - $\ge 6.0\text{ km} \implies 0\text{ pts}$
- **Precipitation / Squall Factor (Max 10 pts):**
  - $> 5.0\text{ mm/h} \implies 10\text{ pts}$
  - $0.5\text{ to } 5.0\text{ mm/h} \implies 4\text{ pts}$
  - $< 0.5\text{ mm/h} \implies 0\text{ pts}$
- **Risk Assessment Levels:**
  - $\text{Total Score} \ge 55 \implies \textbf{HIGH RISK}$ (Advising small craft to stay in port)
  - $25 \le \text{Total Score} < 55 \implies \textbf{MODERATE RISK}$ (Advising caution, checking bilge pumps & lifejackets)
  - $\text{Total Score} < 25 \implies \textbf{LOW RISK}$ (Favorable coastal navigation)

---

## 5. Coastal Sectors & Realistic Maritime Baseline Datasets

ORCA incorporates mathematically calibrated baselines across 8 strategic Indian coastal sectors (`server/src/data/coastalRegions.js`):

| Region ID | Sector Name | State | Sea Basin | Baseline SST | Chlorophyll | Wave Height | Wind Speed | Key Fishing Hotspots |
|---|---|---|---|---|---|---|---|---|
| `mumbai` | Mumbai Offshore | Maharashtra | Arabian Sea | $27.6^\circ\text{C}$ | $1.85\text{ mg/m}^3$ | $1.1\text{ m}$ | $14.5\text{ km/h}$ | Bombay High Belt, Alibag Ridge, Vasai Banks |
| `goa` | Goa Coastal Waters | Goa | Arabian Sea | $28.4^\circ\text{C}$ | $2.15\text{ mg/m}^3$ | $0.9\text{ m}$ | $11.0\text{ km/h}$ | Mormugao Shelf, Aguada Bay, Cabo de Rama |
| `kochi` | Kochi & Malabar Shelf | Kerala | Arabian Sea | $29.1^\circ\text{C}$ | $2.85\text{ mg/m}^3$ | $1.3\text{ m}$ | $16.0\text{ km/h}$ | Vypin Upwelling, Fort Kochi Bank, Alappuzha Mud Bank |
| `chennai` | Chennai Coromandel Coast | Tamil Nadu | Bay of Bengal | $28.8^\circ\text{C}$ | $1.45\text{ mg/m}^3$ | $1.4\text{ m}$ | $18.5\text{ km/h}$ | Ennore Thermal Plume, Marina Deep Shelf, Kovalam Canyon |
| `vizag` | Visakhapatnam Deep Coast | Andhra Pradesh | Bay of Bengal | $28.2^\circ\text{C}$ | $1.62\text{ mg/m}^3$ | $1.2\text{ m}$ | $15.0\text{ km/h}$ | Dolphin’s Nose Trench, Bheemunipatnam Zone, Gangavaram Drift |
| `odisha` | Odisha (Puri & Paradip) | Odisha | Bay of Bengal | $27.9^\circ\text{C}$ | $2.35\text{ mg/m}^3$ | $1.6\text{ m}$ | $21.0\text{ km/h}$ | Chilika Mouth Front, Paradip Port Bank, Gahirmatha Outer |
| `gujarat` | Gujarat (Veraval & Porbandar) | Gujarat | Arabian Sea | $26.5^\circ\text{C}$ | $2.65\text{ mg/m}^3$ | $1.0\text{ m}$ | $17.5\text{ km/h}$ | Veraval Prime Pelagic, Somnath Bank, Porbandar Convergence |
| `andaman` | Andaman & Nicobar (Port Blair) | A&N Islands | Andaman Sea | $29.8^\circ\text{C}$ | $0.95\text{ mg/m}^3$ | $1.5\text{ m}$ | $19.0\text{ km/h}$ | Cinque Island Trench, Havelock Deep Pass, Rutland Shoal |

---

## 6. Frontend Architecture & Page Catalog

Built with **React 18 + Vite + Tailwind CSS + Leaflet + Recharts**:

### 6.1 Complete Page Inventory (13 Pages)
1. **Landing Page (`/` - `LandingPage.jsx`):** High-impact hero presentation, value proposition, problem metrics, multi-agent feature showcase, interactive quick links.
2. **Login Page (`/login` - `LoginPage.jsx`):** Role-based authentication featuring **4 SIH 1-Click Persona Login buttons** for instant zero-typing access during evaluations.
3. **Registration Page (`/register` - `RegisterPage.jsx`):** User onboarding with role selection.
4. **Dashboard Page (`/dashboard` - `DashboardPage.jsx`):** Real-time marine metric cards (SST, Chlorophyll, Wave Height, Wind, Suitability, Risk), interactive diurnal Recharts trend graph, active alerts carousel.
5. **Interactive GIS Map (`/map` - `MapPage.jsx`):** Multi-layer Leaflet canvas featuring layer toggles (`SST Contours`, `Chlorophyll Bloom`, `Fishing Zones`, `Risk Danger Polygons`, `Weather Wind Vectors`), coastal sector selector, and right-hand slideout zone inspector drawer.
6. **AI Marine Assistant (`/assistant` - `AssistantPage.jsx`):** Conversational AI terminal with preset prompt chips, the animated **Agent Execution Visualizer**, and the interactive **Evidence Table**.
7. **Potential Fishing Zones (`/fishing-zones` - `FishingZonesPage.jsx`):** Card-based PFZ explorer with distance calculation, habitat suitability badges, target commercial species tags (Tuna, Mackerel, Sardine), and map cross-linking.
8. **Maritime Risk & Seaworthiness (`/risk` - `RiskAnalysisPage.jsx`):** Seaworthiness hazard meter, breakdown of wave/wind/visibility sub-factors, craft-specific guidance (artisanal vs. commercial).
9. **Marine Conditions & Comparison (`/conditions` - `MarineConditionsPage.jsx`):** Deep parameter viewer and the **Location Comparison Tool** enabling side-by-side benchmarking of any two coastal sectors (e.g., Mumbai vs. Goa).
10. **Maritime Safety Alerts (`/alerts` - `AlertsPage.jsx`):** Active coastal bulletins with severity tags (`Severe`, `Warning`, `Advisory`); contains an advisory broadcast publisher for `Authority` & `Administrator` roles.
11. **Data Sources & Transparency (`/data-sources` - `DataSourcesPage.jsx`):** Cites sensor provenance, update frequencies, satellite sensors (OCM-3, MODIS), numerical models (WRF), and buoy networks (INCOIS, NIOT).
12. **System Telemetry & Health (`/admin` - `AdminStatusPage.jsx`):** Admin control panel displaying live database connection status, memory utilization, agent runtimes, and document record counts.
13. **User Settings (`/settings` - `SettingsPage.jsx`):** Preferences, data mode indicator, notification settings, and units configuration.

### 6.2 Key Reusable Components (`client/src/components/common`)
- `AgentExecutionVisualizer.jsx`: Animated step-by-step pipeline displaying real-time agent dispatch, intent classification confidence, and individual agent execution latencies.
- `EvidenceTable.jsx`: Structured grid detailing each contributing data point, numerical value, sensor/model source, timestamp (IST), and the owning agent.
- `ConfidenceBadge.jsx`: Dynamic visual badge indicating HIGH ($>85\%$), MEDIUM ($70-85\%$), or LOW confidence.
- `RiskBadge.jsx`: Color-coded indicator for LOW (emerald), MODERATE (amber), and HIGH (rose) seaworthiness hazard levels.
- `DisclaimerBanner.jsx`: Prominent scientific disclaimer ensuring legal compliance and reminding users to cross-reference with official INCOIS/IMD advisories.

---

## 7. Backend Infrastructure & API Catalog

Built with **Node.js, Express.js, Mongoose, and MongoDB**:

### 7.1 Complete REST API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Authenticate user and receive signed JWT.
- `GET /api/auth/me` — Retrieve current authenticated user profile (`Bearer <token>`).

#### Marine Observations (`/api/marine`)
- `GET /api/marine/conditions?latitude=..&longitude=..&regionId=..` — Comprehensive current conditions.
- `GET /api/marine/observations?regionId=..` — Time-series records for diurnal chart rendering.
- `GET /api/marine/nearby?latitude=..&longitude=..` — Nearest observation station.
- `GET /api/marine/compare?loc1=mumbai&loc2=goa` — Side-by-side comparative analysis of two coastal sectors.

#### Potential Fishing Zones (`/api/fishing-zones`)
- `GET /api/fishing-zones?regionId=..` — List active PFZs for region.
- `GET /api/fishing-zones/nearby?latitude=..&longitude=..&radiusKm=..` — Radius-based PFZ search.
- `POST /api/fishing-zones/analyze` — Dynamic analysis for arbitrary custom coordinates.

#### Marine Risk & Safety (`/api/risk`)
- `POST /api/risk/analyze` — Run hazard model on coordinate inputs.
- `GET /api/risk/nearby?latitude=..&longitude=..` — Nearest seaworthiness score.

#### Conversational Multi-Agent AI (`/api/ai`)
- `POST /api/ai/query` — Natural language query orchestrator. Dispatches agents, triggers Gemini or fallback engine, returns reasoning, candidate zones, and execution log.
- `GET /api/ai/history?sessionId=..` — Retrieve prior conversation turns.

#### Geospatial Map Overlays (`/api/map`)
- `GET /api/map/layers` — GeoJSON and vector overlays for SST isotherms, Chlorophyll heatmaps, PFZ circles, risk zones, and weather vectors.

#### Maritime Alerts (`/api/alerts`)
- `GET /api/alerts?regionId=..` — Active safety bulletins.
- `POST /api/alerts` — Broadcast safety advisory (Restricted to `Authority` / `Administrator`).

#### Telemetry & System Health (`/api/data` & `/api/health`)
- `GET /api/data/sources` — Detailed metadata on satellite, buoy, and NWP feeds.
- `GET /api/data/status` — Database record metrics and agent telemetry.
- `GET /api/health` — Microservice uptime and database connectivity check.

### 7.2 Database Schemas (Mongoose Models)
1. `User.js`: Full name, email, hashed password (bcrypt), role (`fisherman`, `researcher`, `authority`, `admin`), home port.
2. `MarineObservation.js`: Aggregated marine conditions per sector and timestamp.
3. `OceanObservation.js`: Buoy hydrodynamic parameters (SST, wave height/period, tide, salinity).
4. `WeatherObservation.js`: WRF meteorological parameters (winds, pressure, precipitation, visibility).
5. `FishingZone.js`: Hotspot coordinates, radius, suitability, target species, confidence, primary indicators.
6. `RiskAssessment.js`: Hazard score, sub-scores, safety advisories, affected coastal polygon.
7. `Alert.js`: Severity level, alert title, description, region, issuing authority, active status.
8. `ChatSession.js` & `ChatMessage.js`: User session tracking and multi-turn conversational history.
9. `DataSource.js`: Sensor inventory, data provider name, latency, and attribution URLs.

---

## 8. Role-Based Personas (1-Click Login Ready)

| Role Persona | Demo Email | Password | Persona Context & Responsibilities |
|---|---|---|---|
| **Fisherman** | `fisherman@orca.demo` | `ORCA@123` | **Captain Rajesh Patil (Mumbai Offshore):** Focuses on actionable fishing zones, wave swell safety, fuel efficiency, and nearby hotspots. |
| **Researcher** | `researcher@orca.demo` | `ORCA@123` | **Dr. Priya Varma (Kochi / Malabar Shelf):** Analyzes chlorophyll blooms, diurnal thermal gradients, upwelling indices, and cross-sector comparisons. |
| **Authority** | `authority@orca.demo` | `ORCA@123` | **Commander K. Nair (Chennai Coast):** Monitors seaworthiness hazards, monitors vessel safety compliance, and broadcasts official maritime alerts. |
| **Administrator** | `admin@orca.demo` | `ORCA@123` | **System Administrator:** Audits system telemetry, agent response latencies, database health, and system configurations. |

---

## 9. Offline Resilience & Dual-Engine Architecture

A standout engineering feature of ORCA is its **Dual-Engine Design**:
1. **Google Gemini 1.5 Flash Provider (`GeminiAIProvider`):** Used when `GEMINI_API_KEY` is present in `.env`. Provides rich natural language synthesis, context understanding, and dynamic explanations.
2. **Deterministic High-Precision Marine Engine (`DeterministicFallbackAIProvider`):** Activated automatically if `GEMINI_API_KEY` is absent or if external network requests fail/timeout. Uses heuristic intent matching and scientific template synthesis to generate fully formed, accurate answers with **0 external dependencies**.
3. **Result:** The system **never crashes**, requires no third-party cloud to demonstrate, and guarantees deterministic responses during live hackathon evaluations.

---

## 10. Recommended 14-Step Presentation Sequence for Evaluators

1. **Step 1 — Instant Authentication:** Open `http://localhost:5173/login`, click the **"Fisherman"** 1-click button to demonstrate instantaneous JWT login without typing.
2. **Step 2 — Marine Dashboard:** Review live KPI cards: SST ($27.6^\circ\text{C}$), Chlorophyll ($1.85\text{ mg/m}^3$), Wave Height ($1.1\text{ m}$), Surface Wind ($14.5\text{ km/h}$), High Suitability ($88\%$), Low Risk ($18/100$).
3. **Step 3 — Diurnal Trend Charts:** Showcase Recharts 24-hour diurnal graphs showing wave and thermal cycles.
4. **Step 4 — GIS Interactive Map:** Open `/map` and toggle layers: `SST Contours`, `Chlorophyll Blobs`, `Fishing Hotspots`, `Risk Danger Polygons`.
5. **Step 5 — Coastal Sector Navigation:** Switch the dropdown to **Mumbai Coast**; observe smooth camera pan and regional marker rendering.
6. **Step 6 — Conversational AI Assistant:** Open `/assistant` and select preset chip: *"Find potential fishing zones near Mumbai."*
7. **Step 7 — Agent Execution Visualizer:** Direct attention to the animated visualizer showing parallel dispatch across Weather, Ocean, EO, and Geospatial agents, concluding in Evidence Fusion.
8. **Step 8 — Candidate Zone Cards:** Inspect 3 identified hotspots (Bombay High, Alibag Ridge, Vasai Banks) with calculated distances and confidence scores.
9. **Step 9 — Zone Cross-Navigation:** Click *"View on Map"* to jump to the selected zone marker with its coordinates and radius highlighted.
10. **Step 10 — Detailed Evidence Drawer:** Click a zone circle to reveal the slide-out drawer displaying physical indicators and habitat reasoning.
11. **Step 11 — Seaworthiness Safety Evaluation:** Return to `/assistant` and ask: *"Is it safe to go fishing tomorrow morning?"*
12. **Step 12 — Evidence Table & Attribution:** Inspect the generated Evidence Table citing exact sensors (WRF Mesh, INCOIS Buoy, OCM-3) and IST timestamps.
13. **Step 13 — Cross-Sector Location Comparison:** Open `/conditions` and compare **Mumbai vs. Goa** side-by-side.
14. **Step 14 — Admin Telemetry & Audit:** Open `/admin` to prove database integrity, zero runtime errors, and active status for all 8 agents.

---

## 11. Technology Stack Summary

- **Frontend:** React 18.2, Vite 5.2, Tailwind CSS 3.4, Leaflet 1.9, React-Leaflet 4.2, Recharts 2.12, Lucide React, Axios.
- **Backend:** Node.js 18+, Express.js 4.19, Mongoose 8.3, MongoDB 6.0, jsonwebtoken, bcryptjs, Helmet, CORS, Morgan, express-rate-limit.
- **AI & Reasoning:** Google Gemini 1.5 Flash (`@google/generative-ai`), ORCA Deterministic Rule-Based Fallback Engine.
- **Geospatial & Mathematics:** Spherical Trigonometry (Haversine Distance & Destination Bearing calculations).
- **DevOps:** Docker, Docker Compose, Concurrently.

---

## 12. Future Scope & Production Roadmap

1. **Direct INCOIS & IMD Operational API Ingestion:** Transitioning from simulated baselines to real-time Web Coverage Service (WCS) and Web Feature Service (WFS) feeds from INCOIS OON (Ocean Observation Network).
2. **Edge Marine Computing:** Packaging the deterministic agent pipeline as an onboard lightweight embedded package (Raspberry Pi / Jetson) connecting to marine NMEA 0183/2000 boat instruments.
3. **Multilingual Coastal Voice Assistant:** Adding speech-to-text and text-to-speech in vernacular coastal languages (Marathi, Tamil, Malayalam, Bengali, Telugu, Gujarati) for hands-free operation on fishing vessels.
4. **Satellite Low-Earth-Orbit (LEO) Radio Broadcast:** Transmitting compressed PFZ coordinates via VHF/Navtex frequencies to reach vessels outside cellular LTE range (beyond 12 nautical miles).

---

## 13. Ready-to-Use Prompts to Feed into ChatGPT

When using this report with ChatGPT, copy-paste this document alongside any of the following prompts:

- **For Pitch Preparation:**
  > *"Based on this ORCA project report, generate a compelling 3-minute pitch script for the Smart India Hackathon jury, emphasizing the 8 collaborative agents, offline resilience, and social impact on fishermen."*

- **For Technical Q&A / Viva Defense:**
  > *"Generate 15 challenging technical viva questions a hackathon jury might ask about ORCA's multi-agent architecture, PFZ scoring algorithm, and offline fallback engine, along with top-tier answers."*

- **For Presentation Slide Deck:**
  > *"Structure a 10-slide pitch presentation for ORCA, detailing the slide title, key bullet points, visual diagram suggestions, and speaker notes for each slide."*

- **For Code & Feature Expansion:**
  > *"Based on ORCA's existing architecture, write a new Python or Node.js microservice that ingests real-time GeoTIFF satellite files from Copernicus/Sentinel-3 to extract automated SST thermal front contours."*

---
*Report generated for Smart India Hackathon (SIH) Evaluation & AI Modeling.*
