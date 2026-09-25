# ORCA — Marine EcOsystem Reasoning with Collaborative Agents

[![Smart India Hackathon](https://img.shields.io/badge/SIH-Ready%20Prototype-06b6d4)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://react.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-emerald.svg)](https://leafletjs.com/)

> **ORCA** is an intelligent conversational marine intelligence platform engineered for the **Smart India Hackathon (SIH)**. The system integrates Satellite Earth Observation (chlorophyll concentration, thermal gradients), Sea Surface Temperature (SST), ocean hydrodynamic models, and atmospheric weather forecasts, utilizing **8 collaborative autonomous AI agents** to transform complex marine datasets into actionable, transparent guidance for fishermen, researchers, and maritime authorities.

---

## Key Features

1. **Collaborative Multi-Agent Orchestration**: Modular independent agents (`Coordinator`, `Weather`, `Ocean`, `Earth Observation`, `Fishing Zone`, `Geospatial`, `Risk`, and `Evidence`) that collaborate asynchronously.
2. **Animated Agent Execution Visualizer**: Displays the real-time query parsing, agent dispatch, latency per node, and evidence fusion pipeline.
3. **Interactive Marine Leaflet Map**: Multi-layer toggle canvas displaying SST thermal contours, Chlorophyll concentration overlays, Potential Fishing Zone (PFZ) radiuses, and marine risk danger zones.
4. **Transparent Evidence & Attribution**: Every important answer displays an Evidence Panel citing exact sensor source, timestamp, and contributing agent.
5. **Offline-First Zero-Crash Resilience**: Runs 100% locally with high-fidelity simulated datasets for 8 Indian coastal waters (Mumbai, Goa, Kochi, Chennai, Visakhapatnam, Odisha, Veraval, Port Blair).
6. **Location Comparison Tool**: Side-by-side comparative analysis of any two coastal sectors (e.g., Mumbai vs. Goa).
7. **Role-Aware Authentication**: Personas for `Fisherman`, `Researcher`, `Authority`, and `Administrator` with 1-click login buttons for instant hackathon demonstrations.

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Leaflet, React-Leaflet, Recharts, Lucide React, Axios
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs, Helmet, CORS, Morgan, express-rate-limit
- **Database**: MongoDB (Local or Atlas) with resilient fallback
- **AI Engine**: Google Gemini 1.5 Flash via AIProvider abstraction + Deterministic High-Precision Fallback Engine

---

## Monorepo Folder Structure

```
/sih 2
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── components/         # Visualizer, EvidenceTable, Badges, Layout
│   │   ├── context/            # AuthContext, LocationContext
│   │   ├── pages/              # Dashboard, Map, Assistant, PFZ, Risk, Data, Admin
│   │   ├── services/           # Axios API Client
│   │   └── index.css           # Tailwind + Leaflet Ocean Dark Theme
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── agents/             # 8 Specialized Autonomous Agents
│   │   ├── config/             # DB & Environment Configuration
│   │   ├── controllers/        # REST Route Handlers
│   │   ├── data/               # Indian Coastal Datasets & Seed Engine
│   │   ├── models/             # Mongoose Models (User, Observations, PFZ, Alerts)
│   │   ├── providers/          # Weather, Ocean, EO & AI Provider Abstractions
│   │   ├── routes/             # Express API Endpoints
│   │   └── utils/              # Logger, GeoUtils (Haversine)
│   ├── tests/                  # Automated API Test Suite
│   └── package.json
├── docs/                       # Architecture, API & Demo Guides
├── docker-compose.yml          # Containerized Deployment Orchestration
├── package.json                # Monorepo Scripts
├── .env.example                # Template Environment Variables
└── README.md
```

---

## Quick Start (Installation & Setup)

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on `127.0.0.1:27017` (or Docker)

### 1. Install Dependencies
In the root directory, run:
```bash
npm run install-all
```
*(This automatically installs packages for root, server, and client).*

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/orca
JWT_SECRET=orca_jwt_secret_dev_key_secure_marine_agents_9921
DATA_MODE=demo

# Optional: Google Gemini API Key
# If left empty, ORCA automatically runs its deterministic reasoning engine!
GEMINI_API_KEY=
```

### 3. Seed Database
Populate demo users, 32 coastal observations, 24 fishing zones, and maritime alerts:
```bash
npm run seed
```

### 4. Run Both Server & Client
Launch the entire system concurrently with a single command:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Demo Credentials (1-Click Login Ready)

| Role | Email | Password | Persona |
|---|---|---|---|
| **Fisherman** | `fisherman@orca.demo` | `ORCA@123` | Captain Rajesh Patil (Mumbai Offshore) |
| **Researcher** | `researcher@orca.demo` | `ORCA@123` | Dr. Priya Varma (Kochi / Malabar Shelf) |
| **Authority** | `authority@orca.demo` | `ORCA@123` | Commander K. Nair (Chennai Coast) |
| **Administrator** | `admin@orca.demo` | `ORCA@123` | System Administrator |

*Tip: On the login page, you can simply click any of the 4 role buttons to log in instantly without typing!*

---

## 14-Step SIH Demonstration Flow

1. **Sign In**: Navigate to `http://localhost:5173/login` and click **Fisherman**.
2. **Dashboard**: Observe real-time SST (`27.6°C`), Chlorophyll (`1.85 mg/m³`), Wave Height (`1.1 m`), Wind (`14.5 km/h`), and Diurnal Charts.
3. **Explore Map**: Click **Explore Map** (`/map`) and toggle layers: `SST`, `Chlorophyll`, `Fishing Zones`, `Risk Zones`.
4. **AI Assistant**: Click **AI Marine Assistant** (`/assistant`).
5. **Run Query**: Click prompt: *"Find potential fishing zones near Mumbai."*
6. **Watch Visualizer**: See the animated **Agent Execution Pipeline** dispatching tasks across all 8 agents in parallel.
7. **Inspect PFZs**: Review 3 identified candidate fishing zones with distance, SST, and confidence scores.
8. **Inspect Map Hotspot**: Click **View on Map** to inspect the selected zone's coordinates and boundary radius.
9. **Safety Query**: Ask: *"Is it safe to go fishing tomorrow morning?"*
10. **Evidence & Lineage**: Review the structured **Evidence Table** citing sensor sources, timestamps, and model heuristics.
11. **Location Comparison**: Open **Marine Conditions** (`/conditions`) and benchmark Mumbai vs. Goa.
12. **Audit Telemetry**: Navigate to **System Telemetry** (`/admin`) to show the judges database health and active agent runtimes.

---

## Running with Docker

To start the full stack including MongoDB via Docker:
```bash
docker compose up --build
```
Access the client at `http://localhost:5173`.

---

## Scientific & Safety Notice

> **Disclaimer:** ORCA is a research and decision-support prototype developed for Smart India Hackathon. Marine conditions and fishing suitability estimates are generated from available datasets and model logic. They should not be treated as official navigation, weather, fisheries or safety advisories. Always verify with official INCOIS, IMD, and Coast Guard broadcasts before venturing into open seas.
