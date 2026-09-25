# ORCA REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Get authenticated user details (Bearer Token)

## 2. Marine Observations & Analysis
- `GET /api/marine/conditions?latitude=18.922&longitude=72.8347&regionId=mumbai` — Returns current SST, Chlorophyll, Wave Height, Wind, Suitability, and Risk
- `GET /api/marine/observations?regionId=mumbai` — Time-series observation records for charts and tables
- `GET /api/marine/nearby?latitude=18.922&longitude=72.8347` — Nearest regional marine observation
- `GET /api/marine/compare?loc1=mumbai&loc2=goa` — Side-by-side comparative analysis between two coastal regions

## 3. Potential Fishing Zones (PFZs)
- `GET /api/fishing-zones?regionId=mumbai` — All active potential fishing zones
- `GET /api/fishing-zones/nearby?latitude=18.922&longitude=72.8347&radiusKm=100` — Fishing zones within radius
- `POST /api/fishing-zones/analyze` — Dynamically analyze custom coordinates

## 4. Marine Risk & Seaworthiness
- `POST /api/risk/analyze` — Run hazard model on coordinates
- `GET /api/risk/nearby?latitude=18.922&longitude=72.8347` — Nearby seaworthiness risk score

## 5. Conversational Multi-Agent AI
- `POST /api/ai/query` — Natural language marine query. Returns structured response, agent execution log, and evidence table.
- `GET /api/ai/history?sessionId=...` — Conversation history

## 6. Geospatial Map Layers
- `GET /api/map/layers` — Returns SST, Chlorophyll, Fishing Zones, Risk Zones, Weather vectors, Wave heights, and Tide stations for Leaflet rendering

## 7. Data Transparency & System Status
- `GET /api/data/sources` — Attribution and provider metadata for all marine feeds
- `GET /api/data/status` — Live system telemetry, agent status, and database record metrics

## 8. Maritime Alerts
- `GET /api/alerts?regionId=all` — Active maritime safety bulletins
- `POST /api/alerts` — Broadcast a safety advisory (Requires `Authority` or `Administrator` role)

## 9. System Health
- `GET /api/health` — Microservice uptime, DB status, and AI engine status
