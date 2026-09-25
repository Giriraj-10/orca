# ORCA — Smart India Hackathon (SIH) Live Demonstration Walkthrough

This guide provides the exact 14-step presentation sequence for presenting **ORCA** to the Smart India Hackathon jury.

---

## Pre-Demo Quick Checklist
- Backend running on `http://localhost:5000` (Verified: `GET /api/health` returns status: healthy)
- MongoDB running on `127.0.0.1:27017` and seeded (`npm run seed`)
- Frontend running on `http://localhost:5173`

---

## Complete Demo Scenario (Step-by-Step)

### Step 1: Login as Fisherman
1. Open `http://localhost:5173/login`.
2. Click the **"Fisherman (Capt. Rajesh Patil)"** button under **SIH Demo 1-Click Login**.
3. Notice instant authentication with role badge `Fisherman` and JWT token issued.

### Step 2 & 3: Main Dashboard Overview
1. The **Dashboard** opens automatically.
2. Point out the top 6 real-time marine metrics:
   - **Sea Surface Temperature (SST)**: `27.6°C`
   - **Chlorophyll-a**: `1.85 mg/m³` (Phytoplankton Bloom)
   - **Significant Wave Height**: `1.1 m`
   - **Surface Wind**: `14.5 km/h` (`WSW`)
   - **Fishing Suitability**: `HIGH` (Confidence: 88%)
   - **Assessed Risk**: `LOW RISK` (Score: 18/100)
3. Show the **Diurnal Trend Charts** (Recharts) exhibiting the day-night thermal and wave-wind cycle.
4. Point out the top bar indicator: **`DEMO MODE — Simulated Datasets`**.

### Step 4 & 5: Open Interactive Map & Select Mumbai
1. In the left navigation, click **"Explore Map"** (`/map`).
2. Point out the layer toggles on the top right:
   - `[✓] SST`
   - `[✓] Chlorophyll`
   - `[✓] Fishing Zones`
   - `[✓] Risk Zones`
   - `[✓] Weather`
3. Select **"Mumbai Coast"** from the Coastal Region dropdown.
4. The map smoothly pans to the Mumbai maritime sector showing overlaid thermal contours, chlorophyll spots, and dashed PFZ circles.

### Step 6 & 7: Conversational AI Multi-Agent Reasoning
1. Click **"AI Marine Assistant"** in the sidebar (`/assistant`).
2. Click the suggested prompt:
   > **"Find potential fishing zones near Mumbai."**
3. Watch the **Animated Agent Execution Visualizer** trigger in real time:
   ```
   Query Understood
   ↓
   Intent Classified: FISHING_ZONE (Confidence: 94%)
   ↓
   Coordinator Agent (Parallel Dispatch)
   ↓
   Weather Agent ──────── (14.5 km/h WSW, Visibility 9.5km)
   Ocean Agent ────────── (SST 27.6°C, Wave 1.1m)
   EO Agent ───────────── (Chlorophyll 1.85 mg/m³, OCM-3)
   Geospatial Agent ───── (Mumbai Offshore, 18.922°N, 72.8347°E)
   Fishing Zone Agent ─── (Suitability HIGH, Conf 88%)
   ↓
   Evidence Fusion ────── (9 Corroborating Signals)
   ↓
   Final Reasoning Synthesis
   ```

### Step 8 & 9: Inspect Candidate Zones
1. ORCA presents 3 candidate fishing hotspots:
   - **Bombay High Marine Belt** (Distance: 18 km | SST: 27.8°C | Chlorophyll: 2.20 mg/m³)
   - **Alibag Offshore Ridge** (Distance: 24 km | SST: 27.3°C | Chlorophyll: 1.95 mg/m³)
   - **Vasai Shallow Banks** (Distance: 28 km | SST: 28.0°C | Chlorophyll: 1.60 mg/m³)
2. Click **"View All on Map"** to jump directly to the interactive map.

### Step 10: Zone Detail Evidence Inspection
1. Click on the **Bombay High Marine Belt** circle marker on the map.
2. The right drawer opens showing:
   - Coordinates: `Latitude: 18.9377, Longitude: 72.6644`
   - **SST: 27.8°C**
   - **Chlorophyll: 2.20 mg/m³**
   - **Suitability: HIGH**
   - **Confidence: 88%**
   - **Reasoning**: Elevated primary productivity supported by nutrient upwelling.

### Step 11, 12 & 13: Safety Evaluation
1. Return to the **AI Assistant** (`/assistant`).
2. Ask:
   > **"Is it safe to go fishing tomorrow morning?"**
3. The Coordinator executes:
   `Weather Agent` + `Ocean Agent` + `Risk Agent` + `Evidence Agent`.
4. ORCA returns:
   - **Marine Outlook**: Wave swell `1.1 m`, Winds `14.5 km/h`.
   - **Risk Level**: **LOW RISK** (Hazard Score: 18/100).
   - **Guidance**: Vessel seaworthiness verified for traditional motorized and commercial crafts.
   - Evidence table with exact timestamps and contributing sensor models.

### Step 14: Data Transparency & Audit
1. Click **"Data Sources"** (`/data-sources`) in the sidebar.
2. Walk the judges through the sensor inventory:
   - *Satellite Earth Observation (OCM-3 / MODIS Aqua)*
   - *Sea Surface Temperature Gridded Analysis (SST)*
   - *Coastal Weather Numerical Model (WRF)*
   - *Moored Ocean Buoy Array (INCOIS / NIOT)*
3. Click **"System Telemetry"** (`/admin`) to show the judges:
   - Database: Connected
   - 32 Observations, 24 Fishing Zones, 4 Personas
   - All 8 Agent runtimes: ACTIVE
   - Zero compilation or runtime errors!
